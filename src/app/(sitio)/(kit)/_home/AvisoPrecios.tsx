"use client";

import { useEffect, useId, useState } from "react";
import { ACTUALIZACION_PRECIOS, preciosVigentesHasta, proximaActualizacion } from "@/core/lib/precios";

/** Guarda la fecha de la actualización que la persona ya vio: el aviso vuelve recién con la siguiente. */
const CLAVE = "altoque:aviso-precios";

/**
 * Aviso chico de que los precios se actualizan cada tres meses. No tapa la página ni toma el foco:
 * aparece abajo cuando hay precios en pantalla (elementos con `data-precios`) y una vez cerrado no
 * vuelve hasta la próxima actualización. El mismo dato queda escrito al lado de los precios.
 */
export function AvisoPrecios() {
  const [visible, setVisible] = useState(false);
  const titulo = useId();

  useEffect(() => {
    try {
      if (localStorage.getItem(CLAVE) === ACTUALIZACION_PRECIOS.proxima) return;
    } catch {}
    const precios = document.querySelectorAll("[data-precios]");
    if (!precios.length) return;
    let espera: ReturnType<typeof setTimeout> | undefined;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        observador.disconnect();
        // Un respiro: que la persona llegue a ver los precios antes del aviso.
        espera = setTimeout(() => setVisible(true), 900);
      },
      { threshold: 0.3 },
    );
    precios.forEach((p) => observador.observe(p));
    return () => {
      observador.disconnect();
      clearTimeout(espera);
    };
  }, []);

  if (!visible) return null;

  const cerrar = () => {
    setVisible(false);
    try {
      localStorage.setItem(CLAVE, ACTUALIZACION_PRECIOS.proxima);
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titulo}
      onKeyDown={(e) => e.key === "Escape" && cerrar()}
      className="fixed inset-x-3 bottom-3 z-40 max-w-sm rounded-base bg-tinta p-4 text-fondo sm:p-5 shadow-[0_24px_48px_-20px_rgb(23_21_15/0.6)] transition duration-300 ease-out starting:translate-y-4 starting:opacity-0 motion-reduce:transition-none sm:right-auto sm:left-6 sm:bottom-6"
    >
      <div className="flex items-start gap-4">
        <span aria-hidden className="hidden size-11 shrink-0 place-items-center rounded-control bg-acento-relleno text-sobre-acento sm:grid">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="5" width="17" height="15" rx="2" />
            <path d="M3.5 10h17M8 3v4M16 3v4M8 14h3" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p id={titulo} className="font-semibold leading-snug">
            Precios vigentes hasta el {preciosVigentesHasta().replace(/ de \d{4}$/, "")}
          </p>
          <p className="mt-1.5 text-chico leading-relaxed opacity-85">
            Los actualizamos cada tres meses. La próxima actualización es el <strong className="font-semibold text-acento-relleno">{proximaActualizacion()}</strong>.
          </p>
          <button
            type="button"
            onClick={cerrar}
            className="mt-3 inline-flex min-h-10 items-center rounded-control bg-acento-relleno sm:mt-4 px-4 text-chico font-semibold text-sobre-acento hover:opacity-90"
          >
            Entendido
          </button>
        </div>
        <button type="button" onClick={cerrar} aria-label="Cerrar aviso" className="-mt-1 -mr-1 grid size-10 shrink-0 place-items-center rounded-full opacity-70 hover:bg-fondo/10 hover:opacity-100">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M5 5l10 10M15 5 5 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
