"use client";

import { useState } from "react";
import { formatMoney, formatTyping, parseMoney } from "@/cajas/simple/lib/format";
import NumPad from "./NumPad";
import Sheet from "./Sheet";
import Profit from "./Profit";

/** Ventana con teclado grande para poner una plata (precio de venta, de compra...). */
export default function MoneySheet({
  title,
  previous,
  cost,
  optional = false,
  onSave,
  onClose,
}: {
  title: string;
  /** Lo que estaba antes, para mostrarlo como referencia. */
  previous?: number | null;
  /** Precio de compra: si está, se muestra cuánto queda de ganancia. */
  cost?: number | null;
  /** Si se puede dejar vacío (ej. precio de compra). */
  optional?: boolean;
  onSave: (cents: number | null) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const cents = parseMoney(text);
  const canSave = optional || (cents !== null && cents > 0);

  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave(cents)}
            className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white disabled:bg-borde/50 disabled:text-tinta"
          >
            ✔ Guardar
          </button>
        </div>
      }
    >
      {previous != null && previous > 0 && (
        <p className="text-xl text-gris">
          Antes: <strong className="text-tinta">{formatMoney(previous)}</strong>
        </p>
      )}
      <div className="my-3 rounded-2xl border-2 border-borde bg-white px-4 py-3 text-right" aria-live="polite">
        <span className="text-5xl font-extrabold tabular-nums">
          {text === "" ? <span className="text-gris">$ 0</span> : `$ ${formatTyping(text)}`}
        </span>
      </div>
      <div className="mb-3 min-h-8">
        {cost != null && cents !== null && cents > 0 && <Profit price={cents} cost={cost} />}
        {optional && text === "" && previous != null && <p className="text-lg text-gris">Si lo dejás vacío, se borra.</p>}
      </div>
      <NumPad value={text} onChange={setText} />
    </Sheet>
  );
}
