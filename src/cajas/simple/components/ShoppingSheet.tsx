"use client";

import { useState } from "react";
import { cajaActiva } from "@/cajas/simple/lib/activa";
import { formatDay } from "@/cajas/simple/lib/dates";
import { formatAmount, formatCrates } from "@/cajas/simple/lib/stock";
import { saveProduct, setShopping, useStore } from "@/cajas/simple/lib/store";
import type { InventoryRow } from "@/cajas/simple/lib/use-inventory";
import { useInventory } from "@/cajas/simple/lib/use-inventory";
import type { Product } from "@/cajas/simple/lib/types";
import CrateSizeSheet from "./CrateSizeSheet";
import CratesStepper from "./CratesStepper";
import ProductImage from "./ProductImage";
import ProductPicker from "./ProductPicker";
import Sheet from "./Sheet";

export function shoppingText(rows: InventoryRow[]): string {
  const lines = rows.map((r) => `• ${r.product.name}: ${formatCrates(r.toBuy)}${r.product.crate ? ` (${formatAmount(r.product.unit, r.toBuy * r.product.crate)})` : ""}`);
  return [`🛒 Lista para el mercado — ${cajaActiva().nombre}`, formatDay(Date.now()), "", ...lines].join("\n").replace(/\u00a0/g, " ");
}

/** Lista para el mercado: lo sugerido, editable, para mandar por WhatsApp. */
export default function ShoppingSheet({ onBought, onClose }: { onBought: () => void; onClose: () => void }) {
  const { shopping } = useStore();
  const rows = useInventory();
  const [adding, setAdding] = useState(false);
  const [sizing, setSizing] = useState<Product | null>(null);
  const list = rows.filter((r) => r.toBuy > 0).sort((a, b) => a.product.name.localeCompare(b.product.name, "es"));

  function setCrates(id: string, n: number) {
    setShopping({ ...shopping, crates: { ...shopping.crates, [id]: n } });
  }

  function add(p: Product) {
    setAdding(false);
    if (!p.crate) setSizing(p);
    else setCrates(p.id, 1);
  }

  return (
    <>
      <Sheet
        title="🛒 Lista para el mercado"
        onClose={onClose}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shoppingText(list))}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={list.length === 0}
              className={`flex min-h-16 items-center justify-center rounded-2xl border-2 border-acento px-2 text-center text-lg font-bold leading-tight text-acento-oscuro ${list.length === 0 ? "pointer-events-none opacity-40" : ""}`}
            >
              💬 Mandar por WhatsApp
            </a>
            <button type="button" onClick={onBought} className="min-h-16 rounded-2xl bg-acento px-2 text-lg font-bold leading-tight text-white">
              📥 Ya compré: cargar
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
            <p className="text-lg font-bold leading-tight">Comprar para</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={shopping.coverDays <= 1}
                onClick={() => setShopping({ ...shopping, coverDays: shopping.coverDays - 1 })}
                aria-label="Un día menos"
                className="min-h-14 w-14 rounded-2xl border-2 border-borde bg-white text-3xl font-bold disabled:opacity-30"
              >
                −
              </button>
              <p className="w-20 text-center text-2xl font-extrabold leading-tight">
                {shopping.coverDays} {shopping.coverDays === 1 ? "día" : "días"}
              </p>
              <button
                type="button"
                disabled={shopping.coverDays >= 7}
                onClick={() => setShopping({ ...shopping, coverDays: shopping.coverDays + 1 })}
                aria-label="Un día más"
                className="min-h-14 w-14 rounded-2xl border-2 border-acento bg-acento-claro text-3xl font-bold text-acento-oscuro disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {list.length === 0 && (
            <p className="rounded-2xl bg-amarillo-claro p-4 text-lg">
              Por ahora no hace falta comprar nada (o todavía no hay ventas para calcular). Podés agregar productos a mano.
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {list.map((r) => (
              <li key={r.product.id} className="rounded-2xl border-2 border-borde/50 bg-white p-2">
                <div className="mb-1 flex items-center gap-2">
                  <ProductImage product={r.product} size={32} />
                  <p className="min-w-0 flex-1 text-xl font-bold leading-tight">{r.product.name}</p>
                  <p className="shrink-0 text-base text-gris">
                    {r.stock === null ? "sin cargar" : `quedan ${formatAmount(r.product.unit, Math.max(0, r.stock))}`}
                  </p>
                </div>
                <CratesStepper product={r.product} value={r.toBuy} onChange={(n) => setCrates(r.product.id, n)} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="min-h-16 rounded-2xl border-2 border-dashed border-acento bg-acento-claro text-xl font-bold text-acento-oscuro"
          >
            ➕ Agregar otro producto
          </button>

          {Object.keys(shopping.crates).length > 0 && (
            <button
              type="button"
              onClick={() => setShopping({ ...shopping, crates: {} })}
              className="min-h-14 rounded-2xl border-2 border-borde bg-white text-lg font-bold"
            >
              ↺ Volver a la lista que sugiere la app
            </button>
          )}
        </div>
      </Sheet>

      {adding && (
        <ProductPicker title="Agregar a la lista" exclude={list.map((r) => r.product.id)} onPick={add} onClose={() => setAdding(false)} />
      )}

      {sizing && (
        <CrateSizeSheet
          product={sizing}
          onClose={() => setSizing(null)}
          onSave={(crate) => {
            saveProduct({ ...sizing, crate });
            setCrates(sizing.id, 1);
            setSizing(null);
          }}
        />
      )}
    </>
  );
}
