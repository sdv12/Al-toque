"use client";

import { useState } from "react";
import { formatKg, formatMoney, formatTyping, parseMoney } from "@/cajas/simple/lib/format";
import { gramsForMoney, lineSubtotal, makeItem } from "@/cajas/simple/lib/sale";
import type { Product, SaleItem } from "@/cajas/simple/lib/types";
import NumPad from "./NumPad";
import Sheet from "./Sheet";

const KG_SHORTCUTS: Array<[grams: number, label: string, text: string]> = [
  [250, "¼ kg", "0,25"],
  [500, "½ kg", "0,5"],
  [1000, "1 kg", "1"],
  [2000, "2 kg", "2"],
];

/** "1,5" kilos tipeados → 1500 gramos. */
function typedGrams(text: string): number {
  const n = Number(text.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 1000) : 0;
}

/** Al tocar un producto: cuántos kilos (o unidades) lleva. */
export default function AddItemSheet({
  product,
  onAdd,
  onClose,
}: {
  product: Product;
  onAdd: (item: SaleItem) => void;
  onClose: () => void;
}) {
  const byKg = product.unit === "kg";
  const [mode, setMode] = useState<"kilos" | "plata">("kilos");
  const [text, setText] = useState("");
  const [count, setCount] = useState(1);

  let item: SaleItem | null = null;
  if (!byKg) {
    item = count > 0 ? makeItem(product, count) : null;
  } else if (mode === "kilos") {
    const g = typedGrams(text);
    item = g > 0 ? makeItem(product, g) : null;
  } else {
    const money = parseMoney(text) ?? 0;
    const g = gramsForMoney(product.price, money);
    item = money > 0 && g > 0 ? makeItem(product, g, money) : null;
  }

  const priceLabel = `${formatMoney(product.price)} ${byKg ? "el kilo" : product.unit === "atado" ? "el atado" : "cada uno"}`;

  return (
    <Sheet
      title={`${product.emoji} ${product.name}: ${priceLabel}`}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!item}
            onClick={() => item && onAdd(item)}
            className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white disabled:bg-borde/50 disabled:text-tinta"
          >
            ✔ Agregar
          </button>
        </div>
      }
    >
      {byKg ? (
        <>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Cómo lo querés poner">
            {(["kilos", "plata"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => {
                  setMode(m);
                  setText("");
                }}
                className={`min-h-14 rounded-2xl border-2 text-lg font-bold ${
                  mode === m ? "border-acento bg-acento text-white" : "border-borde bg-white"
                }`}
              >
                {m === "kilos" ? "⚖️ Poner kilos" : "💲 Poner plata"}
              </button>
            ))}
          </div>

          <div className="my-2 rounded-2xl border-2 border-borde bg-white px-4 py-1 text-right" aria-live="polite">
            <p className="text-4xl font-extrabold tabular-nums">
              {mode === "kilos"
                ? text === "" ? <span className="text-gris">0 kg</span> : `${formatTyping(text)} kg`
                : text === "" ? <span className="text-gris">$ 0</span> : `$ ${formatTyping(text)}`}
            </p>
            <p className="min-h-8 text-xl font-bold text-acento-oscuro">
              {item && (mode === "kilos" ? `= ${formatMoney(item.subtotal)}` : `= ${formatKg(item.qty)}`)}
            </p>
          </div>

          {mode === "kilos" && (
            <div className="mb-2 grid grid-cols-4 gap-2">
              {KG_SHORTCUTS.map(([g, label, t]) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setText(t)}
                  aria-label={`${label}: ${formatMoney(lineSubtotal("kg", product.price, g))}`}
                  className="min-h-14 rounded-2xl border-2 border-acento bg-acento-claro text-xl font-extrabold text-acento-oscuro active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <NumPad value={text} onChange={setText} maxDecimals={mode === "kilos" ? 3 : 2} maxIntDigits={mode === "kilos" ? 3 : 9} compact />
        </>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="flex w-full items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              aria-label="Uno menos"
              className="min-h-24 w-28 rounded-3xl border-2 border-borde bg-white text-5xl font-bold active:scale-95"
            >
              −
            </button>
            <p className="text-center" aria-live="polite">
              <span className="block text-7xl font-extrabold tabular-nums">{count}</span>
              <span className="text-xl text-gris">{product.unit === "atado" ? (count === 1 ? "atado" : "atados") : count === 1 ? "unidad" : "unidades"}</span>
            </p>
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(99, c + 1))}
              aria-label="Uno más"
              className="min-h-24 w-28 rounded-3xl border-2 border-acento bg-acento-claro text-5xl font-bold text-acento-oscuro active:scale-95"
            >
              +
            </button>
          </div>
          {item && <p className="text-3xl font-extrabold">= {formatMoney(item.subtotal)}</p>}
        </div>
      )}
    </Sheet>
  );
}
