"use client";

import { useEffect, useRef } from "react";
import { formatMoney } from "@/cajas/simple/lib/format";
import { cartTotal, formatQty } from "@/cajas/simple/lib/sale";
import type { SaleItem } from "@/cajas/simple/lib/types";
import ProductImage from "./ProductImage";

/** El ticket de la venta actual, fijo abajo (o a la derecha en tablet). */
export default function Ticket({
  cart,
  onRemove,
  onClear,
  onPay,
}: {
  cart: SaleItem[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onPay: () => void;
}) {
  const total = cartTotal(cart);
  const listRef = useRef<HTMLUListElement>(null);

  // Que siempre se vea lo último que se agregó.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [cart.length]);

  return (
    <section
      aria-label="Ticket"
      className="flex shrink-0 flex-col rounded-t-3xl border-2 border-b-0 border-borde bg-white wide:min-h-0 wide:flex-1 wide:rounded-3xl wide:border-b-2"
    >
      <h2 className="sr-only px-3 pt-3 text-xl font-extrabold wide:not-sr-only short:sr-only">
        🧾 Ticket{cart.length > 0 && ` (${cart.length})`}
      </h2>

      {cart.length === 0 ? (
        <p className="px-3 pt-3 pb-1 text-lg text-gris wide:flex-1 short:pt-1">Tocá un producto para empezar la venta.</p>
      ) : (
        <ul ref={listRef} className="max-h-[20dvh] overflow-y-auto px-2 pt-1 wide:max-h-none wide:min-h-0 wide:flex-1">
          {cart.map((item, i) => (
            <li key={`${item.productId}-${item.price}`} className="flex items-center gap-2 border-b border-borde/40 py-1.5 last:border-b-0">
              <ProductImage product={item} size={30} />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold leading-tight">{item.name}</p>
                <p className="text-base leading-tight text-gris">
                  {item.unit !== "kg" && item.qty > 1 ? `${item.qty} × ${formatMoney(item.price)}` : formatQty(item.unit, item.qty)}
                </p>
              </div>
              <p className="shrink-0 text-lg font-extrabold tabular-nums">{formatMoney(item.subtotal)}</p>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Borrar ${item.name} del ticket`}
                className="min-h-14 shrink-0 rounded-xl border-2 border-rojo px-2 text-base font-bold text-rojo"
              >
                🗑 Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t-2 border-borde/60 px-3 pt-1 pb-2">
        <div className="flex items-center justify-between gap-3">
          {cart.length > 0 ? (
            <button type="button" onClick={onClear} className="min-h-14 shrink-0 rounded-2xl border-2 border-rojo px-3 text-base font-bold leading-tight text-rojo">
              🗑 Borrar todo
            </button>
          ) : (
            <span />
          )}
          <p className="text-right">
            <span className="block text-lg font-bold leading-none">TOTAL</span>
            <span className="text-4xl font-extrabold whitespace-nowrap tabular-nums short:text-3xl">{formatMoney(total)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onPay}
          disabled={cart.length === 0}
          className="mt-2 min-h-[4.5rem] w-full rounded-2xl bg-acento text-3xl short:mt-1 short:min-h-14 short:text-2xl font-extrabold text-white shadow-md active:scale-95 disabled:bg-borde/40 disabled:text-gris disabled:shadow-none"
        >
          💰 COBRAR
        </button>
      </div>
    </section>
  );
}
