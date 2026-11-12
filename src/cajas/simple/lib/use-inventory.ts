"use client";

import { useMemo } from "react";
import { dailyRate, stockLevel, stockOf, suggestedCrates, type Level } from "./stock";
import { activeProducts, useStore } from "./store";
import type { Product } from "./types";

export interface InventoryRow {
  product: Product;
  /** Lo que queda según la app (null: nunca se cargó). */
  stock: number | null;
  /** Promedio vendido por día. */
  rate: number;
  level: Level;
  /** Cajones sugeridos para la lista del mercado. */
  suggested: number;
  /** Lo que va en la lista: lo que cambió el dueño, o lo sugerido. */
  toBuy: number;
}

const LEVEL_ORDER: Record<Level, number> = { "se-acaba": 0, poco: 1, bien: 2, "sin-cargar": 3 };

/** Lo que queda de cada producto y lo que conviene comprar, de lo más urgente a lo que sobra. */
export function useInventory(): InventoryRow[] {
  const { products, sales, stock: events, shopping } = useStore();
  // Se recalcula cuando cambian los datos; la hora la toman las funciones de stock.
  return useMemo(() => {
    return activeProducts(products)
      .map((product) => {
        const stock = stockOf(product.id, events, sales);
        const rate = dailyRate(sales, product.id);
        const suggested = suggestedCrates(product, stock, rate, shopping.coverDays);
        return {
          product,
          stock,
          rate,
          level: stockLevel(stock, rate),
          suggested,
          toBuy: shopping.crates[product.id] ?? suggested,
        };
      })
      .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
  }, [products, sales, events, shopping]);
}
