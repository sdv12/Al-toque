"use client";

import { useMemo, useState } from "react";
import { formatWhen } from "@/cajas/simple/lib/dates";
import { fiadoMessage, ledger, waLink, waPhone } from "@/cajas/simple/lib/fiado";
import { formatMoney } from "@/cajas/simple/lib/format";
import { newId, saveCustomer, saveMove, useStore } from "@/cajas/simple/lib/store";
import type { Customer, FiadoMove } from "@/cajas/simple/lib/types";
import Confirm from "./Confirm";
import CustomerForm from "./CustomerForm";
import MoneySheet from "./MoneySheet";
import PaymentSheet from "./PaymentSheet";
import Sheet from "./Sheet";
import { useToast } from "./Toast";

type Open = "pago" | "deuda" | "editar" | "borrar" | null;

/** La ficha de un cliente del fiado: cuánto debe, historial, pagos y WhatsApp. */
export default function CustomerSheet({ customer, debt, onClose }: { customer: Customer; debt: number; onClose: () => void }) {
  const { sales, moves } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState<Open>(null);
  const entries = useMemo(() => ledger(customer.id, sales, moves), [customer.id, sales, moves]);
  const hasPhone = waPhone(customer.phone) !== null;

  async function addMove(kind: FiadoMove["kind"], amount: number, method: FiadoMove["method"] = null) {
    const now = Date.now();
    const move: FiadoMove = { id: newId(), customerId: customer.id, kind, amount, method, createdAt: now, updatedAt: now };
    await saveMove(move);
    const left = debt + (kind === "pago" ? -amount : amount);
    const text =
      kind === "pago"
        ? `¡Listo! ${customer.name} pagó ${formatMoney(amount)}. ${left > 0 ? `Debe ${formatMoney(left)}` : "No debe nada"}`
        : `¡Listo! Anotaste ${formatMoney(amount)} a ${customer.name}`;
    toast(text, () => {
      saveMove({ ...move, deleted: true });
      toast("Listo, quedó como antes.");
    });
  }

  return (
    <>
      <Sheet title={`👤 ${customer.name}`} onClose={onClose}>
        <div className="flex flex-col gap-4">
          {customer.phone && <p className="text-xl text-gris">📞 {customer.phone}</p>}

          <div className={`rounded-2xl px-4 py-3 ${debt > 0 ? "bg-rojo-claro" : "bg-acento-claro"}`}>
            {debt > 0 ? (
              <>
                <p className="text-xl font-bold text-rojo">Debe</p>
                <p className="text-5xl font-extrabold tabular-nums">{formatMoney(debt)}</p>
              </>
            ) : (
              <p className="text-3xl font-extrabold text-acento-oscuro">✅ No debe nada</p>
            )}
          </div>

          {debt > 0 && (
            <button type="button" onClick={() => setOpen("pago")} className="min-h-20 rounded-3xl bg-acento text-2xl font-extrabold text-white active:scale-95">
              💵 Registrar pago
            </button>
          )}

          {debt > 0 && (
            <a
              href={waLink(customer.phone, fiadoMessage(customer.name, entries, debt))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-16 flex-col items-center justify-center rounded-3xl border-2 border-acento bg-white px-3 py-2 text-center text-xl font-bold text-acento-oscuro"
            >
              💬 Mandarle por WhatsApp lo que debe
              {!hasPhone && <span className="text-base font-normal text-gris">No tiene teléfono: vas a elegir a quién en WhatsApp</span>}
            </a>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setOpen("deuda")} className="min-h-16 rounded-2xl border-2 border-borde bg-white px-2 text-lg font-bold leading-tight">
              ✏️ Anotar deuda a mano
            </button>
            <button type="button" onClick={() => setOpen("editar")} className="min-h-16 rounded-2xl border-2 border-borde bg-white px-2 text-lg font-bold leading-tight">
              ✏️ Cambiar nombre o teléfono
            </button>
          </div>

          <h3 className="mt-2 text-2xl font-extrabold">Historial</h3>
          {entries.length === 0 ? (
            <p className="text-xl text-gris">Todavía no tiene nada anotado.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...entries].reverse().map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 rounded-2xl border-2 border-borde/50 bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-lg font-bold">{formatWhen(e.createdAt)}</p>
                    <p className="text-lg">
                      {e.kind === "compra" ? "🛒 Llevó: " : e.kind === "pago" ? "💵 Pagó" : "✏️ "}
                      {e.kind === "pago" ? (e.detail ? ` (${e.detail})` : "") : e.detail}
                    </p>
                  </div>
                  <p className={`shrink-0 text-xl font-extrabold tabular-nums ${e.kind === "pago" ? "text-acento" : ""}`}>
                    {e.kind === "pago" ? "−" : "+"} {formatMoney(e.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {debt <= 0 && (
            <button type="button" onClick={() => setOpen("borrar")} className="mt-4 min-h-16 rounded-2xl border-2 border-rojo bg-rojo-claro text-xl font-bold text-rojo">
              🗑 Borrar cliente
            </button>
          )}
        </div>
      </Sheet>

      {open === "pago" && (
        <PaymentSheet
          name={customer.name}
          debt={debt}
          onClose={() => setOpen(null)}
          onSave={(amount, method) => {
            setOpen(null);
            addMove("pago", amount, method);
          }}
        />
      )}

      {open === "deuda" && (
        <MoneySheet
          title={`Anotar deuda a ${customer.name}`}
          onClose={() => setOpen(null)}
          onSave={(cents) => {
            setOpen(null);
            if (cents) addMove("deuda", cents);
          }}
        />
      )}

      {open === "editar" && (
        <CustomerForm
          customer={customer}
          onClose={() => setOpen(null)}
          onSave={(c) => {
            setOpen(null);
            saveCustomer(c);
            toast(`¡Listo! Datos de ${c.name} guardados`, () => saveCustomer(customer));
          }}
        />
      )}

      {open === "borrar" && (
        <Confirm
          question={`¿Seguro que querés borrar a ${customer.name}?`}
          detail="No debe nada. Ya no va a aparecer en la lista del fiado."
          yesLabel="Sí, borrar"
          onNo={() => setOpen(null)}
          onYes={() => {
            setOpen(null);
            onClose();
            saveCustomer({ ...customer, deleted: true });
            toast(`Borraste a ${customer.name}`, () => saveCustomer(customer));
          }}
        />
      )}
    </>
  );
}
