import { describe, expect, it } from "vitest";
import { cajaActiva, usarCaja } from "./activa";
import { debts, fiadoMessage, ledger, pendingEntries, waPhone } from "./fiado";
import type { FiadoMove, Sale } from "./types";

const day = (d: number) => new Date(2026, 9, d, 10, 0).getTime();
const sale = (id: string, total: number, d: number, extra: Partial<Sale> = {}): Sale => ({
  id, total, method: "fiado", customerId: "marta", createdAt: day(d), updatedAt: day(d),
  items: [{ productId: "p", name: "Papa", emoji: "🥔", unit: "kg", price: 120000, qty: 1000, subtotal: total }],
  ...extra,
});
const move = (id: string, kind: FiadoMove["kind"], amount: number, d: number, extra: Partial<FiadoMove> = {}): FiadoMove => ({
  id, customerId: "marta", kind, amount, method: kind === "pago" ? "efectivo" : null, createdAt: day(d), updatedAt: day(d), ...extra,
});

describe("fiado", () => {
  const sales = [sale("s1", 100000, 20), sale("s2", 50000, 22), sale("s3", 70000, 25), sale("x", 999900, 25, { deleted: true }), sale("e", 30000, 25, { method: "efectivo" })];
  const moves = [move("m1", "pago", 150000, 23), move("m2", "deuda", 20000, 26), move("m3", "pago", 5000, 26, { deleted: true })];

  it("deuda", () => {
    expect(debts(sales, moves).get("marta")).toBe(90000);
  });
  it("historial y pendiente", () => {
    const l = ledger("marta", sales, moves);
    expect(l.map((e) => e.balance)).toEqual([100000, 150000, 0, 70000, 90000]);
    expect(pendingEntries(l).map((e) => e.id)).toEqual(["s3", "m2"]);
  });
  it("mensaje de WhatsApp (con el nombre de la caja activa)", () => {
    usarCaja({ ...cajaActiva(), nombre: "Verdulería Lorenzo" });
    const text = fiadoMessage("Marta Gómez", ledger("marta", sales, moves), 90000);
    expect(text).toContain("¡Hola Marta! Te escribimos de Verdulería Lorenzo.");
    expect(text).toContain("• 25/10: $ 700 (Papa 1 kg)");
    expect(text).toContain("• 26/10: $ 200 (anotado)");
    expect(text).toContain("*Total: $ 900*");
    expect(text).not.toContain(" ");
  });
  it("teléfonos argentinos", () => {
    expect(waPhone("351 555 1234")).toBe("5493515551234");
    expect(waPhone("0351 15 555-1234")).toBe("5493515551234");
    expect(waPhone("11 15 2345 6789")).toBe("5491123456789");
    expect(waPhone("+54 9 351 555 1234")).toBe("5493515551234");
    expect(waPhone("2954 15 123456")).toBe("5492954123456");
    expect(waPhone("1234")).toBeNull();
    expect(waPhone("")).toBeNull();
  });
});
