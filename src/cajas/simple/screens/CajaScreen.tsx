"use client";

import { useMemo, useState } from "react";
import CloseSheet from "@/cajas/simple/components/CloseSheet";
import Confirm from "@/cajas/simple/components/Confirm";
import OpenSheet from "@/cajas/simple/components/OpenSheet";
import Sheet from "@/cajas/simple/components/Sheet";
import { useToast } from "@/cajas/simple/components/Toast";
import { expectedCash, periodStart, summarize } from "@/cajas/simple/lib/caja";
import { formatWhen } from "@/cajas/simple/lib/dates";
import { cajaActiva } from "@/cajas/simple/lib/activa";
import { itemsSummary } from "@/cajas/simple/lib/fiado";
import { formatMoney } from "@/cajas/simple/lib/format";
import { closeDay, setOpening, setSaleDeleted, useStore } from "@/cajas/simple/lib/store";
import { PAY_ICON, PAY_LABEL, type CashClose, type CashSummary, type PayMethod, type Sale } from "@/cajas/simple/lib/types";

type Open = { kind: "abrir" } | { kind: "cerrar" } | { kind: "anular"; sale: Sale } | { kind: "dia"; close: CashClose } | null;

const METHODS: PayMethod[] = ["efectivo", "transferencia", "qr", "fiado"];
const SALES_SHOWN = 15;

export default function CajaScreen({ onMarket }: { onMarket?: () => void }) {
  const { sales, moves, closes, opening, customers } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState<Open>(null);
  const [showAll, setShowAll] = useState(false);

  const from = periodStart(closes);
  const summary = useMemo(() => summarize(sales, moves, from), [sales, moves, from]);
  const expected = expectedCash(opening?.amount ?? 0, summary);
  const periodSales = useMemo(
    () => sales.filter((s) => !s.deleted && s.createdAt > from).sort((a, b) => b.createdAt - a.createdAt),
    [sales, from],
  );
  const history = useMemo(() => closes.filter((c) => !c.deleted).sort((a, b) => b.closedAt - a.closedAt), [closes]);
  const maxTotal = Math.max(1, ...history.map((c) => c.summary.salesTotal));
  const customerName = (id?: string | null) => customers.find((c) => c.id === id)?.name;

  async function close(counted: number) {
    const { close, undo } = await closeDay(counted);
    const diff = close.counted - close.expected;
    toast(`¡Listo! Día cerrado. ${diff === 0 ? "La caja dio justo." : diff > 0 ? `Sobró ${formatMoney(diff)}.` : `Faltó ${formatMoney(-diff)}.`}`, () => {
      undo();
      toast("Listo, el día sigue abierto.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Apertura */}
      {opening ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-acento bg-acento-claro px-4 py-2">
          <p className="text-lg">
            <strong className="block text-xl">🔓 Caja abierta</strong>
            {formatWhen(opening.at)} con <strong>{formatMoney(opening.amount)}</strong>
          </p>
          <button type="button" onClick={() => setOpen({ kind: "abrir" })} className="min-h-14 shrink-0 rounded-2xl border-2 border-borde bg-white px-3 text-lg font-bold">
            ✏️ Cambiar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl bg-amarillo-claro p-4">
          <p className="text-xl font-bold">🔒 La caja no está abierta</p>
          <p className="text-lg">Poné con cuánta plata arrancás, así al cerrar sabés si sobra o falta.</p>
          <button type="button" onClick={() => setOpen({ kind: "abrir" })} className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white">
            🔓 Abrir la caja
          </button>
        </div>
      )}

      {/* Lo vendido */}
      <section className="rounded-2xl border-2 border-borde/60 bg-white p-4">
        <h2 className="text-xl font-bold">
          Vendido {from > 0 ? `desde ${formatWhen(from).toLowerCase()}` : "hasta ahora"}
        </h2>
        <SummaryRows summary={summary} />
      </section>

      {/* Cajón */}
      <section className="rounded-2xl border-2 border-acento bg-acento-claro p-4">
        <h2 className="text-xl font-bold">En el cajón tendría que haber</h2>
        <p className="text-[2.75rem] leading-tight font-extrabold tabular-nums">{formatMoney(expected)}</p>
        <p className="text-lg">
          Arrancaste con {formatMoney(opening?.amount ?? 0)} + efectivo de ventas {formatMoney(summary.sales.efectivo)}
          {summary.fiadoPayments.efectivo > 0 && ` + pagos de fiado ${formatMoney(summary.fiadoPayments.efectivo)}`}
        </p>
      </section>

      <button
        type="button"
        onClick={() => setOpen({ kind: "cerrar" })}
        className="min-h-20 rounded-3xl bg-acento-oscuro text-2xl font-extrabold text-white active:scale-95"
      >
        🔒 Cerrar el día
      </button>

      {onMarket && (
        <button
          type="button"
          onClick={onMarket}
          className="min-h-16 rounded-2xl border-2 border-acento bg-white text-xl font-bold text-acento-oscuro"
        >
          🛒 Ver la lista para el mercado
        </button>
      )}

      {/* Ventas del día */}
      <section>
        <h2 className="mb-2 text-2xl font-extrabold">Ventas ({periodSales.length})</h2>
        {periodSales.length === 0 ? (
          <p className="text-xl text-gris">Todavía no hay ventas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(showAll ? periodSales : periodSales.slice(0, SALES_SHOWN)).map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl border-2 border-borde/50 bg-white px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">
                    {formatWhen(s.createdAt)} · {PAY_ICON[s.method]} {PAY_LABEL[s.method]}
                    {s.method === "fiado" && customerName(s.customerId) && ` (${customerName(s.customerId)})`}
                  </p>
                  <p className="text-base text-gris">{itemsSummary(s)}</p>
                </div>
                <p className="shrink-0 text-xl font-extrabold tabular-nums">{formatMoney(s.total)}</p>
                <button
                  type="button"
                  onClick={() => setOpen({ kind: "anular", sale: s })}
                  className="min-h-14 shrink-0 rounded-xl border-2 border-rojo px-2 text-base font-bold text-rojo"
                >
                  ✖ Anular
                </button>
              </li>
            ))}
          </ul>
        )}
        {!showAll && periodSales.length > SALES_SHOWN && (
          <button type="button" onClick={() => setShowAll(true)} className="mt-2 min-h-14 w-full rounded-2xl border-2 border-borde bg-white text-lg font-bold">
            Ver las {periodSales.length - SALES_SHOWN} ventas anteriores
          </button>
        )}
      </section>

      {/* Días anteriores */}
      <section>
        <h2 className="mb-2 text-2xl font-extrabold">Días anteriores</h2>
        {history.length === 0 ? (
          <p className="text-xl text-gris">Cuando cierres el día, va a aparecer acá para comparar.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((c) => {
              const diff = c.counted - c.expected;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setOpen({ kind: "dia", close: c })}
                    className="flex min-h-16 w-full flex-col gap-1 rounded-2xl border-2 border-borde/50 bg-white px-3 py-2 text-left active:bg-acento-claro"
                  >
                    <span className="flex w-full items-baseline justify-between gap-2">
                      <span className="text-lg font-bold">{formatWhen(c.closedAt)}</span>
                      <span className="text-2xl font-extrabold tabular-nums">{formatMoney(c.summary.salesTotal)}</span>
                    </span>
                    <span className="h-3 w-full rounded-full bg-acento-claro" aria-hidden="true">
                      <span className="block h-3 rounded-full bg-acento" style={{ width: `${(c.summary.salesTotal / maxTotal) * 100}%` }} />
                    </span>
                    <span className="flex w-full justify-between text-base">
                      <span className="text-gris">{c.summary.salesCount} ventas · Ver detalle</span>
                      <DiffLabel diff={diff} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {open?.kind === "abrir" && (
        <OpenSheet
          previous={opening?.amount}
          onClose={() => setOpen(null)}
          onSave={(amount) => {
            setOpen(null);
            const before = opening;
            setOpening({ amount, at: opening?.at ?? Date.now() });
            toast(`¡Listo! Caja abierta con ${formatMoney(amount)}`, () => setOpening(before));
          }}
        />
      )}

      {open?.kind === "cerrar" && (
        <CloseSheet
          expected={expected}
          onClose={() => setOpen(null)}
          onSave={(counted) => {
            setOpen(null);
            close(counted);
          }}
        />
      )}

      {open?.kind === "anular" && (
        <Confirm
          question={`¿Seguro que querés anular esta venta de ${formatMoney(open.sale.total)}?`}
          detail={`${formatWhen(open.sale.createdAt)} · ${PAY_LABEL[open.sale.method]} · ${itemsSummary(open.sale)}`}
          yesLabel="Sí, anular"
          onNo={() => setOpen(null)}
          onYes={() => {
            const sale = open.sale;
            setOpen(null);
            setSaleDeleted(sale, true);
            toast(`Anulaste la venta de ${formatMoney(sale.total)}`, () => setSaleDeleted(sale, false));
          }}
        />
      )}

      {open?.kind === "dia" && <DaySheet close={open.close} onClose={() => setOpen(null)} />}
    </div>
  );
}

function SummaryRows({ summary }: { summary: CashSummary }) {
  const payments = summary.fiadoPayments;
  const anyPayment = payments.efectivo + payments.transferencia + payments.qr > 0;
  return (
    <>
      <ul className="mt-2 flex flex-col divide-y divide-borde/40">
        {METHODS.filter((m) => m !== "fiado" || cajaActiva().fiado).map((m) => (
          <li key={m} className="flex min-h-12 items-center justify-between gap-3">
            <span className="text-xl">
              {PAY_ICON[m]} {PAY_LABEL[m]}
            </span>
            <span className="text-2xl font-extrabold tabular-nums">{formatMoney(summary.sales[m])}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-baseline justify-between gap-3 border-t-2 border-tinta pt-2">
        <span className="text-xl font-extrabold">TOTAL</span>
        <span className="text-4xl font-extrabold tabular-nums">{formatMoney(summary.salesTotal)}</span>
      </div>
      <p className="text-lg text-gris">{summary.salesCount === 1 ? "1 venta" : `${summary.salesCount} ventas`}</p>
      {anyPayment && (
        <>
          <h3 className="mt-3 text-xl font-bold">Cobros de fiado</h3>
          <ul className="flex flex-col divide-y divide-borde/40">
            {(["efectivo", "transferencia", "qr"] as const)
              .filter((m) => payments[m] > 0)
              .map((m) => (
                <li key={m} className="flex min-h-12 items-center justify-between gap-3">
                  <span className="text-xl">
                    {PAY_ICON[m]} {PAY_LABEL[m]}
                  </span>
                  <span className="text-2xl font-extrabold tabular-nums">{formatMoney(payments[m])}</span>
                </li>
              ))}
          </ul>
        </>
      )}
    </>
  );
}

function DiffLabel({ diff }: { diff: number }) {
  if (diff === 0) return <span className="font-bold text-acento">✅ Justo</span>;
  if (diff > 0) return <span className="font-bold text-acento">Sobró {formatMoney(diff)}</span>;
  return <span className="font-bold text-rojo">Faltó {formatMoney(-diff)}</span>;
}

function DaySheet({ close, onClose }: { close: CashClose; onClose: () => void }) {
  const diff = close.counted - close.expected;
  return (
    <Sheet title={`Día cerrado ${formatWhen(close.closedAt).toLowerCase()}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border-2 border-borde/60 bg-white p-4">
          <SummaryRows summary={close.summary} />
        </section>
        <section className="flex flex-col gap-1 rounded-2xl border-2 border-borde/60 bg-white p-4 text-xl">
          <p className="flex justify-between gap-3">
            <span>Arrancó con</span> <strong className="tabular-nums">{formatMoney(close.opening)}</strong>
          </p>
          <p className="flex justify-between gap-3">
            <span>Tendría que haber</span> <strong className="tabular-nums">{formatMoney(close.expected)}</strong>
          </p>
          <p className="flex justify-between gap-3">
            <span>Se contó</span> <strong className="tabular-nums">{formatMoney(close.counted)}</strong>
          </p>
          <p className="mt-1 text-2xl">
            <DiffLabel diff={diff} />
          </p>
        </section>
      </div>
    </Sheet>
  );
}
