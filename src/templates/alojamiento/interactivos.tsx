"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { linkWhatsApp } from "@/core/lib/mensajes";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { useDisponibilidad, useResumenCorto } from "./disponibilidad/DisponibilidadContext";
import { boton } from "./estilos";

/** "Ver fechas": baja al calendario (con esa casa elegida, si se indica). */
export function BotonVerFechas({ propiedadId, children, className }: { propiedadId?: string; children: ReactNode; className: string }) {
  const d = useDisponibilidad();
  if (!d.hayCalendario) return null;
  return (
    <button type="button" className={className} onClick={() => d.irAFechas(propiedadId)}>
      {children}
    </button>
  );
}

/**
 * Pista horizontal de una casa (ficha + fotos + reglas) con scroll-snap. Se recorre con
 * trackpad/dedo, con las flechas del teclado (la región es enfocable) o con los botones.
 */
export function Pista({ etiqueta, encabezado, children }: { etiqueta: string; encabezado: ReactNode; children: ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const medir = () => setBordes({ inicio: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    // El ResizeObserver mide apenas empieza a observar; el scroll actualiza después.
    el.addEventListener("scroll", medir, { passive: true });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      ro.disconnect();
    };
  }, []);

  const mover = (sentido: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: reducido ? "auto" : "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 px-5 @4xl:px-12">
        <div className="min-w-0">{encabezado}</div>
        <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => mover(-1)}
          disabled={bordes.inicio}
          aria-label={`Anterior en ${etiqueta}`}
          className="grid size-11 place-items-center rounded-full border-[1.5px] border-borde text-subtitulo hover:border-tinta disabled:opacity-30"
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          onClick={() => mover(1)}
          disabled={bordes.fin}
          aria-label={`Siguiente en ${etiqueta}`}
          className="grid size-11 place-items-center rounded-full border-[1.5px] border-borde text-subtitulo hover:border-tinta disabled:opacity-30"
        >
          <span aria-hidden>›</span>
        </button>
        </div>
      </div>
      <div
        ref={pista}
        role="region"
        aria-label={etiqueta}
        tabIndex={0}
        className="mt-4 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:thin] @4xl:scroll-px-12 @4xl:gap-6 @4xl:px-12"
      >
        {children}
      </div>
    </div>
  );
}

/** Mobile: barra pegada abajo con el resumen del rango y el acceso a las fechas. */
export function BarraMovil({ whatsapp, flotante }: { whatsapp: string; flotante: boolean }) {
  const d = useDisponibilidad();
  const resumen = useResumenCorto();
  return (
    <div className="sticky bottom-0 z-30 flex items-center gap-3 border-t-[1.5px] border-dashed border-borde bg-fondo/95 px-4 py-3 backdrop-blur @4xl:hidden">
      <p className="min-w-0 flex-1 truncate text-chico" aria-live="polite">
        {resumen ?? <span className="text-tinta-suave">¿Cuándo venís?</span>}
      </p>
      {flotante && (
        <a
          href={linkWhatsApp(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribinos por WhatsApp"
          className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-borde"
        >
          <IconoWhatsApp className="size-5" />
        </a>
      )}
      {d.hayCalendario ? (
        <button type="button" onClick={() => d.irAFechas()} className={`${boton.primario} shrink-0 px-5`}>
          Consultar fechas
        </button>
      ) : (
        <a href={linkWhatsApp(whatsapp, "Hola! Quería consultar disponibilidad.")} target="_blank" rel="noopener noreferrer" className={`${boton.primario} shrink-0 px-5`}>
          Consultar
        </a>
      )}
    </div>
  );
}
