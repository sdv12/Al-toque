import { describe, expect, it } from "vitest";
import { addItem, cartTotal, cashShortcuts, formatQty, gramsForMoney, lineSubtotal, makeItem } from "./sale";
import type { Product } from "./types";

const papa: Product = { id: "p", name: "Papa", emoji: "🥔", unit: "kg", price: 120000, createdAt: 0, updatedAt: 0 };
const palta: Product = { id: "a", name: "Palta", emoji: "🥑", unit: "unidad", price: 150000, createdAt: 0, updatedAt: 0 };

describe("ticket", () => {
  it("subtotal por kilo redondeado al peso", () => {
    expect(lineSubtotal("kg", 120000, 1500)).toBe(180000);
    expect(lineSubtotal("kg", 120000, 330)).toBe(39600);
    expect(lineSubtotal("kg", 99900, 333)).toBe(33300); // 332,67 → 333
    expect(lineSubtotal("unidad", 150050, 2)).toBe(300100);
  });
  it("por plata", () => {
    expect(gramsForMoney(120000, 100000)).toBe(833);
  });
  it("suma el mismo producto en un renglón", () => {
    let cart = addItem([], makeItem(papa, 1000));
    cart = addItem(cart, makeItem(palta, 2));
    cart = addItem(cart, makeItem(papa, 500));
    expect(cart).toHaveLength(2);
    expect(cart[1]).toMatchObject({ productId: "p", qty: 1500, subtotal: 180000 });
    expect(cartTotal(cart)).toBe(480000);
  });
  it("cantidades", () => {
    expect(formatQty("kg", 250)).toBe("0,25\u00a0kg");
    expect(formatQty("unidad", 1)).toBe("1 unidad");
    expect(formatQty("atado", 3)).toBe("3 atados");
  });
  it("billetes para pagar", () => {
    expect(cashShortcuts(540000)).toEqual([600000, 1000000, 2000000]);
    expect(cashShortcuts(135000)).toEqual([200000, 500000, 1000000, 2000000]);
    expect(cashShortcuts(1000000)).toEqual([2000000]);
  });
});
