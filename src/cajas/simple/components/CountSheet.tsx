"use client";

import { useState } from "react";
import { cratesApprox, formatAmount, weekly } from "@/cajas/simple/lib/stock";
import { useStore } from "@/cajas/simple/lib/store";
import type { Product } from "@/cajas/simple/lib/types";
import CratesStepper from "./CratesStepper";
import Sheet from "./Sheet";

/** "¿Cuánto queda de verdad?": corrige lo que calcula la app. La diferencia queda como merma. */
export default function CountSheet({
  product,
  stock,
  onSave,
  onCrateSize,
  onClose,
}: {
  product: Product;
  stock: number | null;
  onSave: (qty: number) => void;
  onCrateSize: () => void;
  onClose: () => void;
}) {
  const { stock: events, sales } = useStore();
  const crate = product.crate ?? 0;
  const [crates, setCrates] = useState(stock !== null && crate ? cratesApprox(stock, crate) : 0);
  const week = weekly(product.id, events, sales);

  return (
    <Sheet
      title={`${product.emoji} ${product.name}`}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            Cancelar
          </button>
          <button type="button" onClick={() => onSave(crates * crate)} className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white">
            ✔ Guardar
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-lg">
          {stock === null ? (
            "Todavía no cargaste compras de este producto."
          ) : (
            <>
              La app calcula que quedan <strong>{formatAmount(product.unit, Math.max(0, stock))}</strong>.
            </>
          )}
        </p>
        <p className="text-2xl font-bold">¿Cuánto queda de verdad?</p>
        <CratesStepper product={product} value={crates} onChange={setCrates} big />
        <button
          type="button"
          onClick={() => setCrates(0)}
          className="min-h-14 rounded-2xl border-2 border-rojo bg-rojo-claro text-lg font-bold text-rojo"
        >
          No queda nada
        </button>

        <div className="rounded-2xl border-2 border-borde/50 bg-white px-4 py-3 text-lg">
          <p className="font-bold">Últimos 7 días</p>
          <p>Compraste: {formatAmount(product.unit, week.bought)}</p>
          <p>Vendiste: {formatAmount(product.unit, week.sold)}</p>
          {week.waste > 0 && <p className="font-bold text-rojo">Se tiró o se perdió (aprox.): {formatAmount(product.unit, week.waste)}</p>}
        </div>

        <button type="button" onClick={onCrateSize} className="min-h-14 rounded-2xl border-2 border-borde bg-white px-3 text-lg font-bold">
          ✏️ Un cajón trae {formatAmount(product.unit, crate)} — Cambiar
        </button>
      </div>
    </Sheet>
  );
}
