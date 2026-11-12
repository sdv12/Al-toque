"use client";

import { useMemo, useState } from "react";
import Confirm from "@/cajas/simple/components/Confirm";
import MoneySheet from "@/cajas/simple/components/MoneySheet";
import ProductForm from "@/cajas/simple/components/ProductForm";
import ProductImage from "@/cajas/simple/components/ProductImage";
import Profit from "@/cajas/simple/components/Profit";
import SearchBox, { matches } from "@/cajas/simple/components/SearchBox";
import { useToast } from "@/cajas/simple/components/Toast";
import { formatMoney } from "@/cajas/simple/lib/format";
import { activeProducts, saveProduct, useStore } from "@/cajas/simple/lib/store";
import { UNIT_LABEL, type Product } from "@/cajas/simple/lib/types";

type Open =
  | { kind: "price"; product: Product }
  | { kind: "edit"; product: Product }
  | { kind: "new" }
  | { kind: "delete"; product: Product }
  | null;

export default function PreciosScreen() {
  const { products } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Open>(null);

  const list = useMemo(() => activeProducts(products).filter((p) => matches(p.name, query)), [products, query]);

  async function save(next: Product, message: string) {
    const before = await saveProduct(next);
    toast(message, () => {
      // Deshacer: si era nuevo, se borra; si no, vuelve a como estaba.
      saveProduct(before ?? { ...next, deleted: true });
      toast("Listo, quedó como antes.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchBox value={query} onChange={setQuery} />

      <button
        type="button"
        onClick={() => setOpen({ kind: "new" })}
        className="min-h-16 rounded-2xl border-2 border-dashed border-acento bg-acento-claro text-xl font-bold text-acento-oscuro"
      >
        ➕ Agregar producto
      </button>

      {list.length === 0 && (
        <p className="rounded-2xl bg-amarillo-claro p-4 text-xl">
          No hay ningún producto que se llame &quot;{query}&quot;.
        </p>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((p) => (
          <li key={p.id} className="flex items-stretch gap-2 rounded-2xl border-2 border-borde/60 bg-white p-1.5">
            <button
              type="button"
              onClick={() => setOpen({ kind: "edit", product: p })}
              className="flex min-h-16 min-w-0 flex-1 items-center gap-2 rounded-xl px-1 text-left active:bg-acento-claro"
            >
              <ProductImage product={p} size={44} />
              <span className="flex min-w-0 flex-col">
                <span className="text-xl font-bold leading-tight">{p.name}</span>
                <span className="text-base text-gris">{UNIT_LABEL[p.unit]}</span>
                {p.cost ? <Profit price={p.price} cost={p.cost} short /> : null}
                <span className="text-base font-bold text-acento">✏️ Editar</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOpen({ kind: "price", product: p })}
              aria-label={`Cambiar precio de ${p.name}: ${formatMoney(p.price)}`}
              className="flex min-h-16 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-acento bg-acento-claro px-2.5 active:scale-95"
            >
              <span className="text-2xl font-extrabold tabular-nums whitespace-nowrap">{formatMoney(p.price)}</span>
              <span className="text-base font-bold text-acento-oscuro">Cambiar</span>
            </button>
          </li>
        ))}
      </ul>

      {open?.kind === "price" && (
        <MoneySheet
          title={`${open.product.emoji} ${open.product.name} — ${UNIT_LABEL[open.product.unit]}`}
          previous={open.product.price}
          cost={open.product.cost}
          onClose={() => setOpen(null)}
          onSave={(cents) => {
            setOpen(null);
            if (cents && cents !== open.product.price) {
              save({ ...open.product, price: cents }, `¡Listo! ${open.product.name} ahora ${formatMoney(cents)}`);
            }
          }}
        />
      )}

      {(open?.kind === "edit" || open?.kind === "new") && (
        <ProductForm
          product={open.kind === "edit" ? open.product : undefined}
          onClose={() => setOpen(null)}
          onDelete={(p) => setOpen({ kind: "delete", product: p })}
          onSave={(p) => {
            setOpen(null);
            save(p, open.kind === "new" ? `¡Listo! Agregaste ${p.name}` : `¡Listo! ${p.name} guardado`);
          }}
        />
      )}

      {open?.kind === "delete" && (
        <Confirm
          question={`¿Seguro que querés borrar ${open.product.name}?`}
          detail="Ya no va a aparecer para vender."
          yesLabel="Sí, borrar"
          onNo={() => setOpen({ kind: "edit", product: open.product })}
          onYes={() => {
            setOpen(null);
            save({ ...open.product, deleted: true }, `Borraste ${open.product.name}`);
          }}
        />
      )}
    </div>
  );
}
