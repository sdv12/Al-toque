"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useTurnos } from "./turnos/TurnosContext";

/** Lleva al widget de la portada con la prestación y/o profesional ya cargados. */
export function BotonPedirTurno({
  servicioId,
  profesionalId,
  className,
  children,
}: {
  servicioId?: string;
  profesionalId?: string;
  className: string;
  children: ReactNode;
}) {
  const { pedirTurno } = useTurnos();
  return (
    <button
      type="button"
      className={className}
      onClick={() => pedirTurno({ ...(servicioId ? { servicioId } : {}), ...(profesionalId ? { profesionalId } : {}) })}
    >
      {children}
    </button>
  );
}

/** Índice lateral sticky: marca la sección que se está leyendo. */
export function Indice({ items }: { items: { id: string; etiqueta: string }[] }) {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    const visibles = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) visibles.set(e.target.id, e.isIntersecting);
        const primera = items.find((i) => visibles.get(i.id));
        if (primera) setActiva(primera.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const i of items) {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="En esta página" className="sticky top-24">
      <p className="text-mini font-semibold text-tinta-suave">En esta página</p>
      <ul className="mt-3 border-l border-borde">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={activa === i.id ? "true" : undefined}
              className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-chico text-tinta-suave hover:text-tinta aria-[current=true]:border-acento aria-[current=true]:font-semibold aria-[current=true]:text-tinta"
            >
              {i.etiqueta}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Lista de obras sociales con buscador (para listas largas). */
export function BuscadorObrasSociales({ obras }: { obras: readonly string[] }) {
  const [texto, setTexto] = useState("");
  const id = useId();
  const normal = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const filtradas = obras.filter((o) => normal(o).includes(normal(texto.trim())));

  return (
    <div>
      <label htmlFor={id} className="text-chico font-semibold">
        Buscá la tuya
      </label>
      <input
        id={id}
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ej.: OSDE"
        className="mt-1 block w-full rounded-control border border-borde bg-superficie px-3 py-2.5 @md:max-w-sm"
      />
      <p aria-live="polite" className="mt-2 text-mini text-tinta-suave">
        {texto.trim() ? `${filtradas.length} ${filtradas.length === 1 ? "resultado" : "resultados"}` : `${obras.length} coberturas`}
      </p>
      <ul className="mt-3 columns-1 gap-8 @md:columns-2">
        {filtradas.map((o) => (
          <li key={o} className="flex break-inside-avoid items-center gap-2 border-b border-borde py-2">
            <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-acento-texto">
              <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {o}
          </li>
        ))}
      </ul>
      {texto.trim() && !filtradas.length && (
        <p className="mt-3 text-chico">No la encontramos en la lista. Escribinos y te confirmamos si la tomamos o te atendemos como particular.</p>
      )}
    </div>
  );
}
