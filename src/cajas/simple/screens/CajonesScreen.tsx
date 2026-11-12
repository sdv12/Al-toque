"use client";

import { useMemo, useState } from "react";
import CountSheet from "@/cajas/simple/components/CountSheet";
import CrateSizeSheet from "@/cajas/simple/components/CrateSizeSheet";
import ProductImage from "@/cajas/simple/components/ProductImage";
import PurchaseSheet from "@/cajas/simple/components/PurchaseSheet";
import ShoppingSheet from "@/cajas/simple/components/ShoppingSheet";
import { useToast } from "@/cajas/simple/components/Toast";
import { formatMoney } from "@/cajas/simple/lib/format";
import { cratesApprox, daysLeft, formatAmount, formatHalves, weekly, type Level } from "@/cajas/simple/lib/stock";
import { newId, saveProduct, saveStockEvents, useStore } from "@/cajas/simple/lib/store";
import type { Product, StockEvent } from "@/cajas/simple/lib/types";
import { useInventory, type InventoryRow } from "@/cajas/simple/lib/use-inventory";

type Open = { kind: "lista" } | { kind: "compra" } | { kind: "contar"; row: InventoryRow } | { kind: "cajon"; product: Product } | null;

const LEVEL_STYLE: Record<Level, string> = {
  "se-acaba": "border-rojo bg-rojo-claro",
  poco: "border-[#b45309] bg-amarillo-claro",
  bien: "border-borde/50 bg-white",
  "sin-cargar": "border-borde/40 bg-white",
};

function stockText(r: InventoryRow): string {
  const crate = r.product.crate;
  if (!crate) return "Falta decir cuánto trae el cajón";
  if (r.stock === null) return "Sin cargar";
  if (r.stock <= 0) return "No queda (o falta corregir)";
  const c = cratesApprox(r.stock, crate);
  return `Quedan ${formatAmount(r.product.unit, r.stock)}${c > 0 ? ` · ≈ ${formatHalves(c)} ${c > 1 ? "cajones" : "cajón"}` : ""}`;
}

function daysText(r: InventoryRow): string | null {
  const d = daysLeft(r.stock, r.rate);
  if (d === null) return null;
  if (d < 1) return "No llega a mañana";
  const n = Math.floor(d);
  return `Alcanza para ${n} ${n === 1 ? "día" : "días"}`;
}

/** Cajones y mercado: lo que queda de cada cosa, la lista para el mercado y cargar la compra. */
export default function CajonesScreen() {
  const rows = useInventory();
  const { stock: events, sales } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState<Open>(null);

  const urgent = rows.filter((r) => r.level === "se-acaba").length;
  const toBuy = rows.filter((r) => r.toBuy > 0).length;
  const anyLoaded = rows.some((r) => r.stock !== null);

  // Merma de la semana: lo que salió de las correcciones, con su valor aproximado.
  const waste = useMemo(
    () =>
      rows
        .map((r) => ({ product: r.product, qty: weekly(r.product.id, events, sales).waste }))
        .filter((w) => w.qty > 0)
        .sort((a, b) => b.qty - a.qty),
    [rows, events, sales],
  );
  const wasteValue = (p: Product, qty: number) => {
    const per = p.cost ?? p.price;
    return Math.round(p.unit === "kg" ? (per * qty) / 1000 : per * qty);
  };

  async function count(r: InventoryRow, qty: number) {
    const now = Date.now();
    const ev: StockEvent = { id: newId(), productId: r.product.id, kind: "conteo", qty, estimated: r.stock, createdAt: now, updatedAt: now };
    await saveStockEvents([ev]);
    toast(`¡Listo! ${r.product.name}: quedan ${formatAmount(r.product.unit, qty)}`, () => {
      saveStockEvents([{ ...ev, deleted: true }]);
      toast("Listo, quedó como antes.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setOpen({ kind: "lista" })}
          className="flex min-h-20 flex-col items-center justify-center rounded-3xl bg-acento px-3 text-white active:scale-95"
        >
          <span className="text-2xl font-extrabold">🛒 Lista para el mercado</span>
          {toBuy > 0 && <span className="text-lg">{toBuy === 1 ? "1 producto" : `${toBuy} productos`} para comprar</span>}
        </button>
        <button
          type="button"
          onClick={() => setOpen({ kind: "compra" })}
          className="flex min-h-20 items-center justify-center rounded-3xl border-2 border-acento bg-acento-claro px-3 text-2xl font-extrabold text-acento-oscuro active:scale-95"
        >
          📥 Cargar lo que compré
        </button>
      </div>

      {!anyLoaded ? (
        <div className="rounded-2xl bg-amarillo-claro p-4 text-lg">
          <p className="text-xl font-bold">¿Cómo funciona?</p>
          <p>1. Al volver del mercado, tocá &quot;Cargar lo que compré&quot; y poné cuántos cajones trajiste.</p>
          <p>2. La app descuenta sola lo que vendés y te avisa lo que se está terminando.</p>
          <p>3. Si ves que no coincide, tocá el producto y corregí cuánto queda.</p>
          <p>4. &quot;Lista para el mercado&quot; te arma lo que hay que comprar.</p>
        </div>
      ) : (
        urgent > 0 && (
          <p className="rounded-2xl bg-rojo-claro p-3 text-xl font-bold text-rojo">
            ⚠ {urgent === 1 ? "1 producto se está terminando" : `${urgent} productos se están terminando`}
          </p>
        )
      )}

      <ul className="grid gap-2 md:grid-cols-2">
        {rows.map((r) => {
          const days = daysText(r);
          return (
            <li key={r.product.id}>
              <button
                type="button"
                onClick={() => setOpen(r.product.crate ? { kind: "contar", row: r } : { kind: "cajon", product: r.product })}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left ${LEVEL_STYLE[r.level]}`}
              >
                <ProductImage product={r.product} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-bold leading-tight">{r.product.name}</span>
                  <span className="block text-base leading-tight">{stockText(r)}</span>
                  {days && <span className={`block text-base font-bold ${r.level === "bien" ? "text-acento" : r.level === "poco" ? "text-[#92400e]" : "text-rojo"}`}>{days}</span>}
                </span>
                <span className="shrink-0 text-right text-base font-bold leading-tight text-acento-oscuro">
                  {!r.product.crate ? "✏️ Poner cajón" : r.stock === null ? "✏️ Poner cuánto hay" : "✏️ Corregir"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {waste.length > 0 && (
        <section className="rounded-2xl border-2 border-borde/60 bg-white p-4">
          <h2 className="text-xl font-extrabold">Merma de la semana (aprox.)</h2>
          <p className="text-base text-gris">Lo que se tiró o se perdió, según tus correcciones.</p>
          <ul className="mt-2 flex flex-col divide-y divide-borde/40">
            {waste.map((w) => (
              <li key={w.product.id} className="flex min-h-12 items-center justify-between gap-3 text-lg">
                <span>
                  {w.product.emoji} {w.product.name}: <strong>{formatAmount(w.product.unit, w.qty)}</strong>
                </span>
                <span className="shrink-0 text-gris">≈ {formatMoney(wasteValue(w.product, w.qty))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {open?.kind === "lista" && <ShoppingSheet onClose={() => setOpen(null)} onBought={() => setOpen({ kind: "compra" })} />}
      {open?.kind === "compra" && <PurchaseSheet onClose={() => setOpen(null)} />}
      {open?.kind === "contar" && (
        <CountSheet
          product={open.row.product}
          stock={open.row.stock}
          onClose={() => setOpen(null)}
          onCrateSize={() => setOpen({ kind: "cajon", product: open.row.product })}
          onSave={(qty) => {
            setOpen(null);
            count(open.row, qty);
          }}
        />
      )}
      {open?.kind === "cajon" && (
        <CrateSizeSheet
          product={open.product}
          onClose={() => setOpen(null)}
          onSave={(crate) => {
            setOpen(null);
            const before = open.product;
            saveProduct({ ...before, crate });
            toast(`¡Listo! Un cajón de ${before.name} trae ${formatAmount(before.unit, crate)}`, () => saveProduct(before));
          }}
        />
      )}
    </div>
  );
}
