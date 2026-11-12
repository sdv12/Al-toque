import { cajaActiva } from "./activa";
import { formatDate } from "./dates";
import { formatMoney } from "./format";
import { formatQty } from "./sale";
import { PAY_LABEL, type FiadoMove, type Sale } from "./types";

export interface LedgerEntry {
  id: string;
  kind: "compra" | "pago" | "deuda";
  amount: number;
  createdAt: number;
  /** Compras: qué llevó. Pagos: cómo pagó. */
  detail: string;
  /** Lo que debía después de este movimiento. */
  balance: number;
}

/** Lo que debe cada cliente: fiados + deudas a mano − pagos. */
export function debts(sales: Sale[], moves: FiadoMove[]): Map<string, number> {
  const out = new Map<string, number>();
  const add = (id: string, n: number) => out.set(id, (out.get(id) ?? 0) + n);
  for (const s of sales) if (!s.deleted && s.method === "fiado" && s.customerId) add(s.customerId, s.total);
  for (const m of moves) if (!m.deleted) add(m.customerId, m.kind === "pago" ? -m.amount : m.amount);
  return out;
}

export function itemsSummary(sale: Sale): string {
  return sale.items.map((i) => `${i.name} ${formatQty(i.unit, i.qty)}`).join(", ");
}

/** Historial de un cliente, del más viejo al más nuevo, con lo que debía en cada momento. */
export function ledger(customerId: string, sales: Sale[], moves: FiadoMove[]): LedgerEntry[] {
  const raw: Omit<LedgerEntry, "balance">[] = [];
  for (const s of sales) {
    if (s.deleted || s.method !== "fiado" || s.customerId !== customerId) continue;
    raw.push({ id: s.id, kind: "compra", amount: s.total, createdAt: s.createdAt, detail: itemsSummary(s) });
  }
  for (const m of moves) {
    if (m.deleted || m.customerId !== customerId) continue;
    raw.push({
      id: m.id,
      kind: m.kind,
      amount: m.amount,
      createdAt: m.createdAt,
      detail: m.kind === "pago" ? (m.method ? PAY_LABEL[m.method] : "") : "Anotado a mano",
    });
  }
  raw.sort((a, b) => a.createdAt - b.createdAt);
  let balance = 0;
  return raw.map((e) => {
    balance += e.kind === "pago" ? -e.amount : e.amount;
    return { ...e, balance };
  });
}

/** Lo que quedó pendiente: los movimientos desde la última vez que no debía nada. */
export function pendingEntries(entries: LedgerEntry[]): LedgerEntry[] {
  let start = 0;
  entries.forEach((e, i) => {
    if (e.balance <= 0) start = i + 1;
  });
  return entries.slice(start);
}

/**
 * Teléfono argentino → número para wa.me (549 + característica + número, sin 0 ni 15).
 * "351 15 555-1234" → "5493515551234". Si no se puede armar, devuelve null.
 */
export function waPhone(phone: string | null | undefined): string | null {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("549")) d = d.slice(3);
  else if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length === 12) {
    // Sacar el "15" que va después de la característica (2, 3 o 4 números).
    for (const pos of [2, 3, 4]) {
      if (d.slice(pos, pos + 2) === "15") {
        d = d.slice(0, pos) + d.slice(pos + 2);
        break;
      }
    }
  }
  return d.length === 10 ? `549${d}` : null;
}

export function fiadoMessage(name: string, entries: LedgerEntry[], debt: number): string {
  const lines = pendingEntries(entries).map((e) => {
    const when = formatDate(e.createdAt);
    if (e.kind === "pago") return `• ${when}: pagaste ${formatMoney(e.amount)}`;
    if (e.kind === "deuda") return `• ${when}: ${formatMoney(e.amount)} (anotado)`;
    return `• ${when}: ${formatMoney(e.amount)} (${e.detail})`;
  });
  const first = name.split(" ")[0];
  return [
    `¡Hola ${first}! Te escribimos de ${cajaActiva().nombre}.`,
    `Te pasamos lo que quedó anotado en el fiado:`,
    "",
    ...lines,
    "",
    `*Total: ${formatMoney(debt)}*`,
    "¡Gracias!",
  ]
    .join("\n")
    .replace(/ /g, " ");
}

export function waLink(phone: string | null | undefined, text: string): string {
  const n = waPhone(phone);
  return `https://wa.me/${n ?? ""}?text=${encodeURIComponent(text)}`;
}
