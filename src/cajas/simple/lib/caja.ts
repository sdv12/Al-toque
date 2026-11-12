import type { CashClose, CashSummary, FiadoMove, Sale } from "./types";

/** Desde cuándo cuenta la caja actual: el último cierre (o el principio de todo). */
export function periodStart(closes: CashClose[]): number {
  return closes.reduce((max, c) => (c.deleted ? max : Math.max(max, c.closedAt)), 0);
}

/** Lo vendido y cobrado entre `from` (sin incluir) y `to` (incluido). */
export function summarize(sales: Sale[], moves: FiadoMove[], from: number, to = Infinity): CashSummary {
  const out: CashSummary = {
    sales: { efectivo: 0, transferencia: 0, qr: 0, fiado: 0 },
    salesTotal: 0,
    salesCount: 0,
    fiadoPayments: { efectivo: 0, transferencia: 0, qr: 0 },
  };
  for (const s of sales) {
    if (s.deleted || s.createdAt <= from || s.createdAt > to) continue;
    out.sales[s.method] += s.total;
    out.salesTotal += s.total;
    out.salesCount++;
  }
  for (const m of moves) {
    if (m.deleted || m.kind !== "pago" || !m.method || m.createdAt <= from || m.createdAt > to) continue;
    out.fiadoPayments[m.method] += m.amount;
  }
  return out;
}

/** Plata que tendría que haber en el cajón: apertura + efectivo de ventas + efectivo de pagos de fiado. */
export function expectedCash(opening: number, summary: CashSummary): number {
  return opening + summary.sales.efectivo + summary.fiadoPayments.efectivo;
}

/** Lo que entró en total (sin contar fiado, que todavía no se cobró). */
export function moneyIn(summary: CashSummary): number {
  const { efectivo, transferencia, qr } = summary.sales;
  const p = summary.fiadoPayments;
  return efectivo + transferencia + qr + p.efectivo + p.transferencia + p.qr;
}
