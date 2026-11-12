"use client";

import { useMemo, useState } from "react";
import AddItemSheet from "@/cajas/simple/components/AddItemSheet";
import Confirm from "@/cajas/simple/components/Confirm";
import PaySheet from "@/cajas/simple/components/PaySheet";
import ProductImage from "@/cajas/simple/components/ProductImage";
import SearchBox, { matches } from "@/cajas/simple/components/SearchBox";
import Ticket from "@/cajas/simple/components/Ticket";
import { useToast } from "@/cajas/simple/components/Toast";
import { formatMoney } from "@/cajas/simple/lib/format";
import { cartTotal, formatQty } from "@/cajas/simple/lib/sale";
import { addToCart, productsBySales, setCart, undoSale, useStore } from "@/cajas/simple/lib/store";
import type { Product } from "@/cajas/simple/lib/types";

type Open =
  | { kind: "add"; product: Product }
  | { kind: "remove"; index: number }
  | { kind: "clear" }
  | { kind: "pay" }
  | null;

const PER: Record<Product["unit"], string> = { kg: "el kilo", unidad: "c/u", atado: "el atado" };

export default function VenderScreen() {
  const { products, sales, cart } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Open>(null);

  // El orden se calcula al entrar, no en cada venta: que los botones no se muevan mientras se usa.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ordered = useMemo(() => productsBySales(products, sales), [products]);
  const list = ordered.filter((p) => matches(p.name, query));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 wide:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 pt-3 short:pt-2">
        <SearchBox value={query} onChange={setQuery} />
        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          {list.length === 0 ? (
            <p className="rounded-2xl bg-amarillo-claro p-4 text-xl">No hay ningún producto que se llame &quot;{query}&quot;.</p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2.5">
              {list.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setOpen({ kind: "add", product: p })}
                    className="flex h-full min-h-28 w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-borde/70 bg-white p-2 text-center active:scale-95 active:bg-acento-claro"
                  >
                    <ProductImage product={p} size={44} />
                    <span className="text-lg font-bold leading-tight">{p.name}</span>
                    <span className="leading-tight">
                      <span className="text-2xl font-extrabold tabular-nums">{formatMoney(p.price)}</span>{" "}
                      <span className="text-base text-gris">{PER[p.unit]}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-col wide:w-[22rem] wide:shrink-0 wide:py-3 short:py-2 lg:w-[26rem]">
        <Ticket
          cart={cart}
          onRemove={(index) => setOpen({ kind: "remove", index })}
          onClear={() => setOpen({ kind: "clear" })}
          onPay={() => setOpen({ kind: "pay" })}
        />
      </div>

      {open?.kind === "add" && (
        <AddItemSheet
          product={open.product}
          onClose={() => setOpen(null)}
          onAdd={(item) => {
            setOpen(null);
            // Sin "Deshacer": el renglón ya aparece en el ticket con su botón "Borrar".
            addToCart(item);
            toast(`¡Listo! ${formatQty(item.unit, item.qty)} de ${item.name}`);
          }}
        />
      )}

      {open?.kind === "remove" && cart[open.index] && (
        <Confirm
          question={`¿Seguro que querés borrar ${cart[open.index]!.name} del ticket?`}
          yesLabel="Sí, borrar"
          onNo={() => setOpen(null)}
          onYes={() => {
            const item = cart[open.index]!;
            setOpen(null);
            const before = setCart(cart.filter((_, i) => i !== open.index));
            toast(`Borraste ${item.name} del ticket`, () => setCart(before));
          }}
        />
      )}

      {open?.kind === "clear" && (
        <Confirm
          question="¿Seguro que querés borrar todo el ticket?"
          detail={`Son ${cart.length} productos por ${formatMoney(cartTotal(cart))}.`}
          yesLabel="Sí, borrar todo"
          onNo={() => setOpen(null)}
          onYes={() => {
            setOpen(null);
            const before = setCart([]);
            toast("Borraste el ticket", () => setCart(before));
          }}
        />
      )}

      {open?.kind === "pay" && (
        <PaySheet
          total={cartTotal(cart)}
          onClose={() => setOpen(null)}
          onDone={(sale, message) => {
            setOpen(null);
            setQuery("");
            toast(message, () => {
              undoSale(sale);
              toast("Listo, la venta se anuló y el ticket volvió.");
            });
          }}
        />
      )}
    </div>
  );
}
