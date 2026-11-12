import { formatKg } from "./format";
import type { Product, Sale, StockEvent, Unit } from "./types";

// Inventario "por cajones", sin contar todo:
// lo que queda = último conteo (o cero) + compras desde entonces − ventas desde entonces.

const DAY = 86_400_000;

/** Cuánto se vendió de un producto entre `from` (sin incluir) y `to` (incluido). */
export function soldQty(sales: Sale[], productId: string, from: number, to: number): number {
  let total = 0;
  for (const s of sales) {
    if (s.deleted || s.createdAt <= from || s.createdAt > to) continue;
    for (const i of s.items) if (i.productId === productId) total += i.qty;
  }
  return total;
}

function eventsOf(events: StockEvent[], productId: string): StockEvent[] {
  return events.filter((e) => !e.deleted && e.productId === productId).sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Lo que queda (en gramos o unidades) según la app. null si nunca se cargó nada de ese producto.
 * Puede dar menos de cero si se vendió más de lo cargado: se muestra como 0 y pide corregir.
 */
export function stockOf(productId: string, events: StockEvent[], sales: Sale[], now = Date.now()): number | null {
  const evs = eventsOf(events, productId).filter((e) => e.createdAt <= now);
  if (evs.length === 0) return null;
  let lastCount = -1;
  evs.forEach((e, i) => {
    if (e.kind === "conteo") lastCount = i;
  });
  const last = lastCount >= 0 ? evs[lastCount]! : null;
  const base = last ? last.qty : 0;
  // Sin conteo, cuenta desde justo antes de la primera compra.
  const since = last ? last.createdAt : evs[0]!.createdAt - 1;
  const bought = evs.slice(lastCount + 1).reduce((sum, e) => sum + (e.kind === "compra" ? e.qty : 0), 0);
  return base + bought - soldQty(sales, productId, since, now);
}

/** Promedio vendido por día en las últimas 2 semanas (o desde la primera venta, si es más nuevo). */
export function dailyRate(sales: Sale[], productId: string, now = Date.now(), days = 14): number {
  const from = now - days * DAY;
  let first = Infinity;
  let total = 0;
  for (const s of sales) {
    if (s.deleted || s.createdAt <= from || s.createdAt > now) continue;
    for (const i of s.items) {
      if (i.productId !== productId) continue;
      total += i.qty;
      first = Math.min(first, s.createdAt);
    }
  }
  if (total === 0) return 0;
  const covered = Math.min(days, Math.max(1, Math.ceil((now - first) / DAY)));
  return total / covered;
}

/** Redondea a medio cajón para arriba. */
function ceilHalf(n: number): number {
  return Math.ceil(n * 2 - 1e-9) / 2;
}

/** Cajones a comprar para cubrir `coverDays` días de venta, descontando lo que queda. */
export function suggestedCrates(product: Product, stock: number | null, rate: number, coverDays: number): number {
  if (!product.crate || rate <= 0) return 0;
  const need = rate * coverDays - Math.max(0, stock ?? 0);
  return need > 0 ? ceilHalf(need / product.crate) : 0;
}

/** Días que alcanza lo que queda. null si no se sabe. */
export function daysLeft(stock: number | null, rate: number): number | null {
  if (stock === null || rate <= 0) return null;
  return Math.max(0, stock) / rate;
}

export type Level = "sin-cargar" | "se-acaba" | "poco" | "bien";

/** Para el color: rojo si no llega a mañana, amarillo si alcanza para menos de 2 días. */
export function stockLevel(stock: number | null, rate: number): Level {
  if (stock === null) return "sin-cargar";
  if (stock <= 0) return "se-acaba";
  const d = daysLeft(stock, rate);
  if (d === null) return "bien";
  return d < 1 ? "se-acaba" : d < 2 ? "poco" : "bien";
}

/** Últimos 7 días: lo comprado, lo vendido y la merma que salió de las correcciones. */
export function weekly(productId: string, events: StockEvent[], sales: Sale[], now = Date.now()) {
  const from = now - 7 * DAY;
  let bought = 0;
  let waste = 0;
  for (const e of eventsOf(events, productId)) {
    if (e.createdAt <= from || e.createdAt > now) continue;
    if (e.kind === "compra") bought += e.qty;
    else if (e.estimated != null) waste += Math.max(0, e.estimated - e.qty);
  }
  return { bought, sold: soldQty(sales, productId, from, now), waste };
}

/** ½ → "½", 1,5 → "1½", 2 → "2". */
export function formatHalves(n: number): string {
  const whole = Math.floor(n + 1e-9);
  const half = n - whole >= 0.5 - 1e-9;
  if (whole === 0) return half ? "½" : "0";
  return `${whole}${half ? "½" : ""}`;
}

/** "½ cajón", "1 cajón", "2½ cajones". */
export function formatCrates(n: number): string {
  return `${formatHalves(n)} ${n > 1 ? "cajones" : "cajón"}`;
}

/** Cantidad en la unidad del producto: "18 kg", "40 unidades", "12 atados". */
export function formatAmount(unit: Unit, qty: number): string {
  if (unit === "kg") return formatKg(Math.round(qty / 100) * 100);
  const n = Math.round(qty);
  if (unit === "unidad") return n === 1 ? "1 unidad" : `${n} unidades`;
  return n === 1 ? "1 atado" : `${n} atados`;
}

/** Lo que queda, en cajones aproximados (al ½ más cercano). */
export function cratesApprox(qty: number, crate: number): number {
  return Math.round((Math.max(0, qty) / crate) * 2) / 2;
}
