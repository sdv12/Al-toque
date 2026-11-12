"use client";

import { useState } from "react";
import { formatMoney, formatTyping, moneyToTyping, parseMoney } from "@/cajas/simple/lib/format";
import { PAY_ICON, PAY_LABEL, type FiadoMove } from "@/cajas/simple/lib/types";
import NumPad from "./NumPad";
import Sheet from "./Sheet";

type Method = NonNullable<FiadoMove["method"]>;
const METHODS: Method[] = ["efectivo", "transferencia", "qr"];

/** Registrar un pago del fiado: cuánto (todo o una parte) y cómo pagó. */
export default function PaymentSheet({
  name,
  debt,
  onSave,
  onClose,
}: {
  name: string;
  debt: number;
  onSave: (amount: number, method: Method) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const typed = parseMoney(text);
  const tooMuch = typed !== null && typed > debt;

  if (amount !== null) {
    return (
      <Sheet
        title={`Pago de ${name}`}
        onClose={onClose}
        footer={
          <button type="button" onClick={() => setAmount(null)} className="min-h-16 w-full rounded-2xl border-2 border-borde text-xl font-bold">
            ← Volver
          </button>
        }
      >
        <p className="mb-4 text-center">
          <span className="block text-xl font-bold">Paga</span>
          <span className="text-5xl font-extrabold tabular-nums">{formatMoney(amount)}</span>
          {amount < debt && <span className="block text-xl text-gris">Le va a quedar debiendo {formatMoney(debt - amount)}</span>}
        </p>
        <p className="mb-3 text-2xl font-bold">¿Cómo pagó?</p>
        <div className="flex flex-col gap-3">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSave(amount, m)}
              className="flex min-h-20 items-center gap-4 rounded-3xl border-2 border-acento bg-acento-claro px-5 text-2xl font-extrabold text-acento-oscuro active:scale-95"
            >
              <span aria-hidden="true" className="text-4xl">{PAY_ICON[m]}</span>
              {PAY_LABEL[m]}
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      title={`Pago de ${name}`}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!typed || tooMuch}
            onClick={() => typed && setAmount(typed)}
            className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white disabled:bg-borde/50 disabled:text-tinta"
          >
            Siguiente →
          </button>
        </div>
      }
    >
      <button
        type="button"
        onClick={() => {
          setText(moneyToTyping(debt));
          setAmount(debt);
        }}
        className="mb-3 min-h-20 w-full rounded-3xl bg-acento px-4 text-2xl font-extrabold text-white active:scale-95"
      >
        ✔ Paga todo: {formatMoney(debt)}
      </button>
      <p className="text-xl font-bold">O paga una parte:</p>
      <div className="my-2 rounded-2xl border-2 border-borde bg-white px-4 py-1 text-right" aria-live="polite">
        <span className="text-4xl font-extrabold tabular-nums">{text === "" ? <span className="text-gris">$ 0</span> : `$ ${formatTyping(text)}`}</span>
      </div>
      <p className={`mb-2 min-h-7 text-lg font-bold ${tooMuch ? "text-rojo" : "text-gris"}`} aria-live="polite">
        {tooMuch ? `Es más de lo que debe (${formatMoney(debt)}).` : typed ? `Le queda debiendo ${formatMoney(debt - typed)}` : ""}
      </p>
      <NumPad value={text} onChange={setText} compact />
    </Sheet>
  );
}
