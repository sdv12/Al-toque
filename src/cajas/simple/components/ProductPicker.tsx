"use client";

import { useState } from "react";
import { activeProducts, useStore } from "@/cajas/simple/lib/store";
import type { Product } from "@/cajas/simple/lib/types";
import ProductImage from "./ProductImage";
import SearchBox, { matches } from "./SearchBox";
import Sheet from "./Sheet";

/** Elegir un producto de la lista (para sumarlo a la lista del mercado o a una compra). */
export default function ProductPicker({
  title,
  exclude = [],
  onPick,
  onClose,
}: {
  title: string;
  exclude?: string[];
  onPick: (p: Product) => void;
  onClose: () => void;
}) {
  const { products } = useStore();
  const [query, setQuery] = useState("");
  const list = activeProducts(products).filter((p) => !exclude.includes(p.id) && matches(p.name, query));

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <SearchBox value={query} onChange={setQuery} />
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {list.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onPick(p)}
                className="flex min-h-16 w-full items-center gap-2 rounded-2xl border-2 border-borde/60 bg-white px-2 text-left text-lg font-bold leading-tight active:bg-acento-claro"
              >
                <ProductImage product={p} size={36} />
                {p.name}
              </button>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="text-xl text-gris">No hay más productos para agregar.</p>}
      </div>
    </Sheet>
  );
}
