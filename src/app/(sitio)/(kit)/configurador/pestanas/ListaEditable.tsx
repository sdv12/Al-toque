"use client";

import type { ReactNode } from "react";
import { botonKit } from "../campos";

export function mover<T>(lista: T[], desde: number, hasta: number) {
  const [item] = lista.splice(desde, 1);
  if (item !== undefined) lista.splice(hasta, 0, item);
}

/** Lista de ítems plegables con agregar, quitar y reordenar. */
export function ListaEditable<T>({
  items,
  resumen,
  textoAgregar,
  onAgregar,
  onQuitar,
  onMover,
  render,
}: {
  items: readonly T[];
  resumen: (item: T) => string;
  textoAgregar: string;
  onAgregar: () => void;
  onQuitar: (i: number) => void;
  onMover: (desde: number, hasta: number) => void;
  render: (item: T, i: number) => ReactNode;
}) {
  return (
    <div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={(item as { id?: string }).id ?? i}>
            <details className="group rounded-base border border-borde bg-superficie">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 [&::-webkit-details-marker]:hidden">
                <span className="truncate text-chico font-medium">{resumen(item)}</span>
                <span aria-hidden className="text-tinta-suave transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="space-y-3 border-t border-borde px-3 py-4">
                {render(item, i)}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" className={botonKit.secundario} disabled={i === 0} onClick={() => onMover(i, i - 1)}>
                    Subir
                  </button>
                  <button type="button" className={botonKit.secundario} disabled={i === items.length - 1} onClick={() => onMover(i, i + 1)}>
                    Bajar
                  </button>
                  <button
                    type="button"
                    className={`${botonKit.secundario} ml-auto text-[#b3261e]`}
                    onClick={() => window.confirm(`¿Quitar «${resumen(item)}»?`) && onQuitar(i)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <button type="button" className={`${botonKit.secundario} mt-3 w-full`} onClick={onAgregar}>
        + {textoAgregar}
      </button>
    </div>
  );
}
