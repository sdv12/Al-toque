import { describe, expect, it } from "vitest";
import { cratesApprox, dailyRate, formatCrates, stockLevel, stockOf, suggestedCrates, weekly } from "./stock";
import type { Product, Sale, StockEvent } from "./types";

const H = 3_600_000;
const D = 24 * H;
const now = 100 * D;
const tomate: Product = { id: "t", name: "Tomate", emoji: "🍅", unit: "kg", price: 250000, crate: 18000, createdAt: 0, updatedAt: 0 };

const sale = (t: number, qty: number, deleted = false): Sale => ({
  id: `s${t}`, total: 0, method: "efectivo", createdAt: t, updatedAt: t, deleted,
  items: [{ productId: "t", name: "Tomate", emoji: "🍅", unit: "kg", price: 250000, qty, subtotal: 0 }],
});
const ev = (t: number, kind: StockEvent["kind"], qty: number, estimated?: number): StockEvent => ({
  id: `e${t}`, productId: "t", kind, qty, estimated, createdAt: t, updatedAt: t,
});

describe("stock", () => {
  it("sin cargar no se sabe", () => {
    expect(stockOf("t", [], [sale(now - H, 1000)], now)).toBeNull();
  });
  it("compras − ventas, sin contar ventas de antes de la primera compra", () => {
    const events = [ev(now - 3 * D, "compra", 36000)];
    const sales = [sale(now - 4 * D, 5000), sale(now - 2 * D, 10000), sale(now - D, 8000)];
    expect(stockOf("t", events, sales, now)).toBe(18000);
  });
  it("el conteo pisa el cálculo; la merma sale de la diferencia", () => {
    const events = [ev(now - 3 * D, "compra", 36000), ev(now - 2 * D + H, "conteo", 20000, 26000), ev(now - D + H, "compra", 18000)];
    const sales = [sale(now - 2 * D, 10000), sale(now - D, 4000), sale(now - H, 2000, true)];
    expect(stockOf("t", events, sales, now)).toBe(20000 - 4000 + 18000);
    expect(weekly("t", events, sales, now)).toEqual({ bought: 54000, sold: 14000, waste: 6000 });
  });
  it("lista sugerida", () => {
    const sales = Array.from({ length: 14 }, (_, i) => sale(now - i * D - H, 6000));
    const rate = dailyRate(sales, "t", now);
    expect(rate).toBe(6000);
    // 3 días = 18 kg, quedan 5 kg → faltan 13 kg → 1 cajón (18 kg)
    expect(suggestedCrates(tomate, 5000, rate, 3)).toBe(1);
    // 5 días = 30 kg, quedan 2 kg → 28 kg → 1,55 cajones → 2
    expect(suggestedCrates(tomate, 2000, rate, 5)).toBe(2);
    expect(suggestedCrates(tomate, 40000, rate, 3)).toBe(0);
    // producto nuevo, vendido hace 2 días
    expect(dailyRate([sale(now - 2 * D, 4000)], "t", now)).toBe(2000);
  });
  it("colores y formato", () => {
    expect(stockLevel(null, 1)).toBe("sin-cargar");
    expect(stockLevel(3000, 6000)).toBe("se-acaba");
    expect(stockLevel(9000, 6000)).toBe("poco");
    expect(stockLevel(20000, 6000)).toBe("bien");
    expect(stockLevel(20000, 0)).toBe("bien");
    expect(formatCrates(0.5)).toBe("½ cajón");
    expect(formatCrates(1)).toBe("1 cajón");
    expect(formatCrates(2.5)).toBe("2½ cajones");
    expect(cratesApprox(27000, 18000)).toBe(1.5);
  });
});
