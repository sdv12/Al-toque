"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/*
 * Alto: la burbuja es lo único que carga la página. El chat (preguntas, reglas, plantillas y
 * precios) se descarga recién al primer toque y queda montado para no perder la charla al cerrar.
 */
const AltoPanel = dynamic(() => import("./AltoPanel"), { ssr: false });

export function Alto({ whatsapp }: { whatsapp: string | undefined }) {
  const [abierto, setAbierto] = useState(false);
  const [usado, setUsado] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const fueAbierto = useRef(false);

  // Al cerrar, el foco vuelve a la burbuja.
  useEffect(() => {
    if (!abierto && fueAbierto.current) boton.current?.focus();
  }, [abierto]);

  return (
    <>
      {!abierto && (
        <button
          ref={boton}
          type="button"
          onClick={() => {
            fueAbierto.current = true;
            setUsado(true);
            setAbierto(true);
          }}
          aria-expanded={false}
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2.5 rounded-full border-2 border-tinta bg-fondo py-1.5 pr-5 pl-1.5 font-semibold shadow-[0_18px_40px_-18px_rgb(23_21_15/0.55)] transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
        >
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-acento-relleno font-display text-[1.35rem] font-extrabold text-sobre-acento uppercase [font-stretch:68%]">
            A
          </span>
          <span className="text-left leading-tight">
            <span className="block">Preguntale a Alto</span>
            <span className="block text-mini font-normal text-tinta-suave">Te digo qué te conviene</span>
          </span>
        </button>
      )}
      {usado && <AltoPanel whatsapp={whatsapp} visible={abierto} onCerrar={() => setAbierto(false)} />}
    </>
  );
}
