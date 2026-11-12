import { formatKg } from "./format";
import type { Product, SaleItem, Unit } from "./types";

/**
 * Subtotal de un renglón en centavos. Por kilo se redondea al peso
 * (nadie cobra $ 395,99); por unidad es el precio por la cantidad.
 */
export function lineSubtotal(unit: Unit, price: number, qty: number): number {
  if (unit === "kg") return Math.round((price * qty) / 1000 / 100) * 100;
  return price * qty;
}

/** Gramos que corresponden a una plata ("dame $ 1.000 de papa"). */
export function gramsForMoney(price: number, money: number): number {
  return price > 0 ? Math.round((money / price) * 1000) : 0;
}

export function makeItem(product: Product, qty: number, subtotal?: number): SaleItem {
  return {
    productId: product.id,
    name: product.name,
    emoji: product.emoji,
    photo: product.photo ?? null,
    unit: product.unit,
    price: product.price,
    qty,
    subtotal: subtotal ?? lineSubtotal(product.unit, product.price, qty),
  };
}

/** Si el producto ya está en el ticket (al mismo precio) se suma; si no, va un renglón nuevo. */
export function addItem(cart: SaleItem[], item: SaleItem): SaleItem[] {
  const i = cart.findIndex((c) => c.productId === item.productId && c.price === item.price);
  if (i < 0) return [...cart, item];
  const prev = cart[i]!;
  const merged = { ...prev, qty: prev.qty + item.qty, subtotal: prev.subtotal + item.subtotal };
  return [...cart.slice(0, i), ...cart.slice(i + 1), merged];
}

export function cartTotal(cart: SaleItem[]): number {
  return cart.reduce((sum, i) => sum + i.subtotal, 0);
}

/** "1,5 kg", "1 unidad", "3 atados". */
export function formatQty(unit: Unit, qty: number): string {
  if (unit === "kg") return formatKg(qty);
  if (unit === "unidad") return qty === 1 ? "1 unidad" : `${qty} unidades`;
  return qty === 1 ? "1 atado" : `${qty} atados`;
}

/** Billetes con los que probablemente paguen: $ 5.400 → $ 6.000, $ 10.000, $ 20.000. */
export function cashShortcuts(total: number): number[] {
  const pesos = total / 100;
  const out = new Set<number>();
  for (const step of [1000, 2000, 5000, 10000, 20000]) {
    const v = Math.ceil(pesos / step) * step;
    if (v > pesos) out.add(v * 100);
  }
  return [...out].sort((a, b) => a - b).slice(0, 4);
}
