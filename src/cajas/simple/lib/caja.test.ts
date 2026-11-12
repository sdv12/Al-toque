import { describe, expect, it } from "vitest";
import { expectedCash, moneyIn, periodStart, summarize } from "./caja";
import type { CashClose, FiadoMove, PayMethod, Sale } from "./types";

const sale = (t: number, method: PayMethod, total: number, deleted = false): Sale => ({
  id: `s${t}`, items: [], total, method, createdAt: t, updatedAt: t, deleted,
});
const pago = (t: number, method: FiadoMove["method"], amount: number): FiadoMove => ({
  id: `m${t}`, customerId: "c", kind: "pago", amount, method, createdAt: t, updatedAt: t,
});

describe("caja", () => {
  const sales = [sale(5, "efectivo", 999), sale(10, "efectivo", 1000), sale(11, "qr", 500), sale(12, "fiado", 700), sale(13, "efectivo", 300, true), sale(14, "transferencia", 200)];
  const moves = [pago(4, "efectivo", 9999), pago(12, "efectivo", 400), pago(13, "qr", 100), { ...pago(14, null, 50), kind: "deuda" as const }];

  it("suma desde el último cierre", () => {
    const s = summarize(sales, moves, 5);
    expect(s.sales).toEqual({ efectivo: 1000, transferencia: 200, qr: 500, fiado: 700 });
    expect(s.salesTotal).toBe(2400);
    expect(s.salesCount).toBe(4);
    expect(s.fiadoPayments).toEqual({ efectivo: 400, transferencia: 0, qr: 100 });
    expect(expectedCash(5000, s)).toBe(6400);
    expect(moneyIn(s)).toBe(2200);
  });
  it("inicio del período", () => {
    const c = (closedAt: number, deleted = false) => ({ closedAt, deleted }) as CashClose;
    expect(periodStart([])).toBe(0);
    expect(periodStart([c(10), c(30, true), c(20)])).toBe(20);
  });
});
