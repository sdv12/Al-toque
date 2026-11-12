"use client";

import { useState } from "react";
import { formatMoney, formatTyping, parseMoney } from "@/cajas/simple/lib/format";
import NumPad from "./NumPad";
import Sheet from "./Sheet";

/** "Abrir la caja": con cuánta plata (cambio) arranca el cajón. */
export default function OpenSheet({
  previous,
  greeting = false,
  onSave,
  onClose,
}: {
  previous?: number | null;
  /** Si se abre sola al empezar el día: "¡Buen día!" y "Ahora no". */
  greeting?: boolean;
  onSave: (cents: number) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const cents = parseMoney(text);

  return (
    <Sheet
      title={greeting ? "☀️ ¡Buen día! Abrir la caja" : "🔓 Abrir la caja"}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            {greeting ? "Ahora no" : "Cancelar"}
          </button>
          <button
            type="button"
            disabled={cents === null}
            onClick={() => cents !== null && onSave(cents)}
            className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white disabled:bg-borde/50 disabled:text-tinta"
          >
            ✔ Abrir
          </button>
        </div>
      }
    >
      <p className="text-xl font-bold">¿Con cuánta plata arrancás en el cajón?</p>
      {previous != null && <p className="text-lg text-gris">Antes pusiste {formatMoney(previous)}</p>}
      <div className="my-2 rounded-2xl border-2 border-borde bg-white px-4 py-1 text-right" aria-live="polite">
        <span className="text-4xl font-extrabold tabular-nums">{text === "" ? <span className="text-gris">$ 0</span> : `$ ${formatTyping(text)}`}</span>
      </div>
      <button
        type="button"
        onClick={() => onSave(0)}
        className="mb-3 min-h-14 w-full rounded-2xl border-2 border-acento bg-acento-claro text-lg font-bold text-acento-oscuro"
      >
        Arranco sin cambio ($ 0)
      </button>
      <NumPad value={text} onChange={setText} compact />
    </Sheet>
  );
}
