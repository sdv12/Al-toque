import { RUBROS, type RubroCaja } from "@/cajas/rubros";
import { cajaActiva } from "./activa";
import type { Product } from "./types";

// Productos típicos del rubro para arrancar (ver src/cajas/rubros.ts). Ids "seed-N" en el orden
// de "más comunes": así Vender los muestra primero hasta que haya ventas.

/** Cajón típico de un producto de arranque (en gramos o unidades), para completar datos viejos. */
export function seedCrate(id: string, rubro: RubroCaja = cajaActiva().rubro): number | null {
  const row = id.startsWith("seed-") ? RUBROS[rubro].productos[Number(id.slice(5)) - 1] : undefined;
  if (!row) return null;
  return row[2] === "kg" ? row[4] * 1000 : row[4];
}

export function seedProducts(rubro: RubroCaja = cajaActiva().rubro, now = Date.now()): Product[] {
  return RUBROS[rubro].productos.map(([name, emoji, unit, pesos, crate], i) => ({
    id: `seed-${i + 1}`,
    name,
    emoji,
    unit,
    price: pesos * 100,
    cost: null,
    crate: unit === "kg" ? crate * 1000 : crate,
    photo: null,
    createdAt: now,
    updatedAt: now,
  }));
}

/** Dibujos para elegir al crear o editar un producto: los del rubro primero. */
export function productEmojis(rubro: RubroCaja = cajaActiva().rubro): readonly string[] {
  return RUBROS[rubro].emojis;
}
