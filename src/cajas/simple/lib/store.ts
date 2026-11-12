"use client";

import { useSyncExternalStore } from "react";
import { cajaActiva } from "./activa";
import { askPersistentStorage, deleteMeta, getAll, getMeta, put, putMany } from "./db";
import { datosDeEjemplo } from "./ejemplo";
import { expectedCash, periodStart, summarize } from "./caja";
import { addItem, cartTotal } from "./sale";
import { seedCrate, seedProducts } from "./seed";
import { normalize } from "./text";
import type { CashClose, CashOpening, Customer, FiadoMove, PayMethod, Product, Sale, SaleItem, StockEvent } from "./types";

// Estado en memoria + guardado en IndexedDB. La pantalla se actualiza al instante
// y el guardado se hace atrás (es rapidísimo, es local).

interface State {
  ready: boolean;
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  /** Pagos de fiado y deudas anotadas a mano. */
  moves: FiadoMove[];
  /** Cierres de caja ("Cerrar el día"). */
  closes: CashClose[];
  /** Apertura de la caja actual (null si todavía no se abrió). */
  opening: CashOpening | null;
  /** Compras del mercado y correcciones de lo que queda. */
  stock: StockEvent[];
  /** Lista para el mercado: para cuántos días se compra y los cambios a mano. */
  shopping: Shopping;
  /** El ticket de la venta que se está armando. Se guarda para no perderlo si se cierra la app. */
  cart: SaleItem[];
}

export interface Shopping {
  coverDays: number;
  /** Cajones que el dueño cambió a mano (productId → cajones). Lo que no está, va lo sugerido. */
  crates: Record<string, number>;
}

const DEFAULT_SHOPPING: Shopping = { coverDays: 3, crates: {} };

const EMPTY: State = {
  ready: false,
  products: [],
  sales: [],
  customers: [],
  moves: [],
  closes: [],
  opening: null,
  stock: [],
  shopping: DEFAULT_SHOPPING,
  cart: [],
};
let state: State = EMPTY;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

let loading: Promise<void> | null = null;
let loadedBase: string | null = null;

export function loadStore(): Promise<void> {
  // Otra caja en la misma página (la prueba al cambiar de rubro): se arranca de cero.
  if (loadedBase !== cajaActiva().base) {
    loadedBase = cajaActiva().base;
    loading = null;
    set(EMPTY);
  }
  if (loading) return loading;
  loading = (async () => {
    askPersistentStorage();
    const seeded = await getMeta<boolean>("seeded");
    let products = await getAll<Product>("products");
    if (!seeded && products.length === 0) {
      products = seedProducts();
      await putMany("products", products);
      if (cajaActiva().ejemplo) {
        const ejemplo = datosDeEjemplo(products);
        await putMany("sales", ejemplo.sales);
        await putMany("customers", ejemplo.customers);
        await put("meta", ejemplo.opening, "opening");
      }
      await put("meta", true, "seeded");
    }
    // Los productos de arranque de versiones anteriores no traían el tamaño del cajón.
    if (!(await getMeta<boolean>("crates-v1"))) {
      products = products.map((p) => (p.crate === undefined ? { ...p, crate: seedCrate(p.id) } : p));
      await putMany("products", products);
      await put("meta", true, "crates-v1");
    }
    const [sales, customers, moves, closes, opening, stock, shopping, cart] = await Promise.all([
      getAll<Sale>("sales"),
      getAll<Customer>("customers"),
      getAll<FiadoMove>("fiado"),
      getAll<CashClose>("closes"),
      getMeta<CashOpening>("opening"),
      getAll<StockEvent>("stock"),
      getMeta<Shopping>("shopping"),
      getMeta<SaleItem[]>("cart"),
    ]);
    set({
      ready: true,
      products,
      sales,
      customers,
      moves,
      closes,
      opening: opening ?? null,
      stock,
      shopping: shopping ?? DEFAULT_SHOPPING,
      cart: cart ?? [],
    });
  })();
  return loading;
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

// ---------- Productos ----------

/** Productos visibles, ordenados por nombre. */
export function activeProducts(products: Product[]): Product[] {
  return products
    .filter((p) => !p.deleted)
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
}

/** Los de arranque vienen en orden de "más comunes" (papa, cebolla, tomate...). */
function seedRank(id: string): number {
  return id.startsWith("seed-") ? Number(id.slice(5)) : 1000;
}

/** Para la pantalla de vender: los más vendidos primero. */
export function productsBySales(products: Product[], sales: Sale[]): Product[] {
  const count = new Map<string, number>();
  for (const s of sales) {
    if (s.deleted) continue;
    for (const i of s.items) count.set(i.productId, (count.get(i.productId) ?? 0) + 1);
  }
  return products
    .filter((p) => !p.deleted)
    .sort(
      (a, b) =>
        (count.get(b.id) ?? 0) - (count.get(a.id) ?? 0) ||
        seedRank(a.id) - seedRank(b.id) ||
        a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );
}

/** Crea o actualiza un producto. Devuelve cómo estaba antes (para "Deshacer"). */
export async function saveProduct(product: Product): Promise<Product | undefined> {
  const before = state.products.find((p) => p.id === product.id);
  const next = { ...product, updatedAt: Date.now() };
  set({ products: upsert(state.products, next) });
  await put("products", next);
  return before;
}

// ---------- Ticket ----------

/** Cambia el ticket. Devuelve cómo estaba antes (para "Deshacer"). */
export function setCart(cart: SaleItem[]): SaleItem[] {
  const before = state.cart;
  set({ cart });
  put("meta", cart, "cart").catch(() => {});
  return before;
}

export function addToCart(item: SaleItem): SaleItem[] {
  return setCart(addItem(state.cart, item));
}

// ---------- Ventas ----------

export async function checkout(
  method: PayMethod,
  extra: { paidWith?: number | null; customerId?: string | null } = {},
): Promise<Sale> {
  const now = Date.now();
  const sale: Sale = {
    id: newId(),
    items: state.cart,
    total: cartTotal(state.cart),
    method,
    paidWith: extra.paidWith ?? null,
    customerId: extra.customerId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  set({ sales: [...state.sales, sale] });
  setCart([]);
  await put("sales", sale);
  return sale;
}

/** Anular una venta (o volverla a poner, con deleted: false). */
export async function setSaleDeleted(sale: Sale, deleted: boolean) {
  const next = { ...sale, deleted, updatedAt: Date.now() };
  set({ sales: upsert(state.sales, next) });
  await put("sales", next);
}

/** Deshacer una venta recién guardada: se anula y el ticket vuelve a estar como antes. */
export async function undoSale(sale: Sale) {
  const next = { ...sale, deleted: true, updatedAt: Date.now() };
  set({ sales: upsert(state.sales, next) });
  setCart(sale.items);
  await put("sales", next);
}

// ---------- Clientes (fiado) ----------

export async function saveCustomer(customer: Customer): Promise<void> {
  const next = { ...customer, updatedAt: Date.now() };
  set({ customers: upsert(state.customers, next) });
  await put("customers", next);
}

/** Si ya hay alguien con ese nombre (sin importar tildes ni mayúsculas). */
export function findCustomerByName(name: string, exceptId?: string): Customer | undefined {
  return state.customers.find((c) => !c.deleted && c.id !== exceptId && normalize(c.name) === normalize(name));
}

/** Guarda un pago o una deuda a mano. Devuelve el movimiento (para "Deshacer"). */
export async function saveMove(move: FiadoMove): Promise<void> {
  const next = { ...move, updatedAt: Date.now() };
  set({ moves: upsert(state.moves, next) });
  await put("fiado", next);
}

// ---------- Caja ----------

/** Abrir la caja (o cambiar con cuánto se abrió). null = sacar la apertura. */
export async function setOpening(opening: CashOpening | null) {
  set({ opening });
  if (opening) await put("meta", opening, "opening");
  else await deleteMeta("opening");
}

async function saveClose(close: CashClose) {
  const next = { ...close, updatedAt: Date.now() };
  set({ closes: upsert(state.closes, next) });
  await put("closes", next);
}

/** Cerrar el día con lo que se contó en el cajón. La caja queda sin abrir. */
export async function closeDay(counted: number): Promise<{ close: CashClose; undo: () => void }> {
  const now = Date.now();
  const from = periodStart(state.closes);
  const opening = state.opening;
  const summary = summarize(state.sales, state.moves, from, now);
  const close: CashClose = {
    id: newId(),
    from,
    closedAt: now,
    opening: opening?.amount ?? 0,
    openedAt: opening?.at ?? null,
    summary,
    expected: expectedCash(opening?.amount ?? 0, summary),
    counted,
    createdAt: now,
    updatedAt: now,
  };
  await saveClose(close);
  await setOpening(null);
  return {
    close,
    undo: () => {
      saveClose({ ...close, deleted: true });
      setOpening(opening);
    },
  };
}

// ---------- Cajones y mercado ----------

/** Guarda compras o correcciones (o las anula, con deleted: true). */
export async function saveStockEvents(events: StockEvent[]) {
  const now = Date.now();
  let list = state.stock;
  const next = events.map((e) => ({ ...e, updatedAt: now }));
  for (const e of next) list = upsert(list, e);
  set({ stock: list });
  await putMany("stock", next);
}

export async function setShopping(shopping: Shopping) {
  set({ shopping });
  await put("meta", shopping, "shopping");
}

/** Guarda varios productos juntos (ej. precios de compra actualizados al cargar una compra). */
export async function saveProducts(products: Product[]) {
  const now = Date.now();
  let list = state.products;
  const next = products.map((p) => ({ ...p, updatedAt: now }));
  for (const p of next) list = upsert(list, p);
  set({ products: list });
  await putMany("products", next);
}

/** Precio de compra por kilo o por unidad a partir de lo pagado. */
function unitCost(p: Product, crates: number, paid: number): number | null {
  const qty = crates * (p.crate ?? 0);
  if (qty <= 0) return null;
  return Math.round(p.unit === "kg" ? (paid * 1000) / qty : paid / qty);
}

/**
 * Guarda lo que se compró en el mercado. Si se cargó lo que se pagó, actualiza el precio de compra
 * (así Precios muestra la ganancia al día). Vacía la lista del mercado. Devuelve cómo deshacerlo.
 */
export async function savePurchase(items: Array<{ product: Product; crates: number; paid: number | null }>): Promise<() => void> {
  const now = Date.now();
  const events: StockEvent[] = items.map(({ product, crates, paid }) => ({
    id: newId(),
    productId: product.id,
    kind: "compra",
    qty: crates * (product.crate ?? 0),
    crates,
    paid,
    createdAt: now,
    updatedAt: now,
  }));
  const before: Product[] = [];
  const updated: Product[] = [];
  for (const { product, crates, paid } of items) {
    const cost = paid ? unitCost(product, crates, paid) : null;
    if (cost && cost !== product.cost) {
      before.push(product);
      updated.push({ ...product, cost });
    }
  }
  const prevShopping = state.shopping;
  await saveStockEvents(events);
  if (updated.length) await saveProducts(updated);
  await setShopping({ ...prevShopping, crates: {} });
  return () => {
    saveStockEvents(events.map((e) => ({ ...e, deleted: true })));
    if (before.length) saveProducts(before);
    setShopping(prevShopping);
  };
}
