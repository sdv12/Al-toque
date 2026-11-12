"use client";

import { useState } from "react";
import { formatMoney, formatTyping, parseMoney } from "@/cajas/simple/lib/format";
import NumPad from "./NumPad";
import Sheet from "./Sheet";

/** "Cerrar el día": contar la plata del cajón y ver si sobra o falta. */
export default function CloseSheet({
  expected,
  onSave,
  onClose,
}: {
  expected: number;
  onSave: (counted: number) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [counted, setCounted] = useState<number | null>(null);
  const typed = parseMoney(text);

  if (counted !== null) {
    const diff = counted - expected;
    return (
      <Sheet
        title="🔒 Cerrar el día"
        closeLabel="✕ Cancelar"
        onClose={onClose}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setCounted(null)} className="min-h-16 rounded-2xl border-2 border-borde text-lg font-bold leading-tight">
              ← Volver a contar
            </button>
            <button type="button" onClick={() => onSave(counted)} className="min-h-16 rounded-2xl bg-acento text-lg font-bold leading-tight text-white">
              ✔ Guardar y cerrar
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <Row label="Tendría que haber" value={expected} />
          <Row label="Contaste" value={counted} />
          {diff === 0 ? (
            <div className="rounded-2xl bg-acento px-4 py-3 text-white">
              <p className="text-4xl font-extrabold">✅ ¡Justo!</p>
              <p className="text-xl">La caja da perfecto.</p>
            </div>
          ) : diff > 0 ? (
            <div className="rounded-2xl bg-acento-claro px-4 py-3 text-acento-oscuro">
              <p className="text-xl font-bold">SOBRA</p>
              <p className="text-5xl font-extrabold tabular-nums">{formatMoney(diff)}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-rojo-claro px-4 py-3 text-rojo">
              <p className="text-xl font-bold">FALTA</p>
              <p className="text-5xl font-extrabold tabular-nums">{formatMoney(-diff)}</p>
            </div>
          )}
          {diff !== 0 && (
            <p className="text-lg text-gris">
              Si te parece mucho, tocá &quot;Volver a contar&quot;. Fijate también si hay alguna venta mal cobrada en la lista de ventas.
            </p>
          )}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      title="🔒 Cerrar el día"
      closeLabel="✕ Cancelar"
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            Cancelar
          </button>
          <button
            type="button"
            disabled={typed === null}
            onClick={() => typed !== null && setCounted(typed)}
            className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white disabled:bg-borde/50 disabled:text-tinta"
          >
            Siguiente →
          </button>
        </div>
      }
    >
      <p className="text-xl font-bold">¿Cuánta plata en efectivo hay en el cajón?</p>
      <p className="text-lg text-gris">Contá todo: billetes y monedas.</p>
      <div className="my-3 rounded-2xl border-2 border-borde bg-white px-4 py-1 text-right" aria-live="polite">
        <span className="text-4xl font-extrabold tabular-nums">{text === "" ? <span className="text-gris">$ 0</span> : `$ ${formatTyping(text)}`}</span>
      </div>
      <NumPad value={text} onChange={setText} />
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-2xl bg-white px-4 py-2">
      <span className="text-xl font-bold">{label}</span>
      <span className="text-3xl font-extrabold tabular-nums">{formatMoney(value)}</span>
    </div>
  );
}
