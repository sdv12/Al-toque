"use client";

import { useState } from "react";
import { formatTyping } from "@/cajas/simple/lib/format";
import { formatAmount } from "@/cajas/simple/lib/stock";
import type { Product } from "@/cajas/simple/lib/types";
import NumPad from "./NumPad";
import Sheet from "./Sheet";

/** "¿Cuánto trae un cajón de tomate?" en kilos o en unidades/atados. Devuelve gramos o unidades. */
export default function CrateSizeSheet({
  product,
  onSave,
  onClose,
}: {
  product: Pick<Product, "name" | "unit" | "crate">;
  onSave: (crate: number) => void;
  onClose: () => void;
}) {
  const byKg = product.unit === "kg";
  const [text, setText] = useState("");
  const n = Number(text.replace(",", "."));
  const value = Number.isFinite(n) && n > 0 ? (byKg ? Math.round(n * 1000) : Math.round(n)) : null;
  const suffix = byKg ? "kg" : product.unit === "atado" ? "atados" : "unidades";

  return (
    <Sheet
      title={`Cajón de ${product.name}`}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!value}
            onClick={() => value && onSave(value)}
            className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white disabled:bg-borde/50 disabled:text-tinta"
          >
            ✔ Guardar
          </button>
        </div>
      }
    >
      <p className="text-xl font-bold">¿Cuánto trae un cajón (o bolsa, o caja)?</p>
      {product.crate ? <p className="text-lg text-gris">Antes: {formatAmount(product.unit, product.crate)}</p> : null}
      <div className="my-3 rounded-2xl border-2 border-borde bg-white px-4 py-1 text-right" aria-live="polite">
        <span className="text-4xl font-extrabold tabular-nums">
          {text === "" ? <span className="text-gris">0 {suffix}</span> : `${formatTyping(text)} ${suffix}`}
        </span>
      </div>
      <NumPad value={text} onChange={setText} maxDecimals={byKg ? 1 : 0} maxIntDigits={4} />
    </Sheet>
  );
}
