"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Robot } from "./Robot";

/*
 * Alto: la burbuja con el robot (y su viñeta de bienvenida) es lo único que carga la página. El
 * chat se descarga recién al primer toque y queda montado para no perder la charla al cerrar.
 */
const AltoPanel = dynamic(() => import("./AltoPanel"), { ssr: false });

/** La viñeta se cierra una vez por visita (pestaña). */
const CLAVE_VINETA = "altoque:alto-vineta";

export function Alto({ whatsapp }: { whatsapp: string | undefined }) {
  const [abierto, setAbierto] = useState(false);
  const [usado, setUsado] = useState(false);
  const [vineta, setVineta] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const fueAbierto = useRef(false);

  // La viñeta aparece unos segundos después de entrar (si no la cerró en esta visita).
  useEffect(() => {
    let cerrada = false;
    try {
      cerrada = sessionStorage.getItem(CLAVE_VINETA) === "1";
    } catch {}
    if (cerrada) return;
    const t = setTimeout(() => setVineta(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Al cerrar el chat, el foco vuelve a la burbuja.
  useEffect(() => {
    if (!abierto && fueAbierto.current) boton.current?.focus();
  }, [abierto]);

  const cerrarVineta = () => {
    setVineta(false);
    try {
      sessionStorage.setItem(CLAVE_VINETA, "1");
    } catch {}
  };
  const abrir = () => {
    fueAbierto.current = true;
    cerrarVineta();
    setUsado(true);
    setAbierto(true);
  };

  return (
    <>
      {!abierto && (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
          {vineta && (
            <div role="status" className="relative w-[min(19rem,calc(100vw-2rem))] animate-alto-aparece rounded-base border-2 border-tinta bg-fondo p-4 pr-10 shadow-[0_18px_40px_-18px_rgb(23_21_15/0.55)] motion-reduce:animate-none">
              <p className="text-chico leading-snug">
                <strong>¡Bienvenido/a!</strong> Soy Alto, el asistente virtual. ¿Te ayudo a armar tu página?
              </p>
              <button type="button" onClick={abrir} className="mt-3 inline-flex min-h-10 items-center rounded-full bg-tinta px-4 text-chico font-semibold text-fondo">
                ¡Dale!
              </button>
              <button type="button" onClick={cerrarVineta} aria-label="Cerrar el mensaje de Alto" className="absolute top-2 right-2 grid size-8 place-items-center rounded-full hover:bg-superficie-2">
                <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M5 5l10 10M15 5 5 15" />
                </svg>
              </button>
              {/* colita del globo, apuntando al robot */}
              <span aria-hidden className="absolute -bottom-[9px] right-8 size-4 rotate-45 border-r-2 border-b-2 border-tinta bg-fondo" />
            </div>
          )}
          <button
            ref={boton}
            type="button"
            onClick={abrir}
            aria-expanded={false}
            aria-label="Abrir a Alto, el asistente virtual"
            className="group flex items-center gap-2.5 rounded-full border-2 border-tinta bg-tinta py-1.5 pr-5 pl-1.5 font-semibold text-fondo shadow-[0_18px_40px_-14px_rgb(23_21_15/0.6)] transition-transform hover:-translate-y-0.5"
          >
            <span className="grid size-14 place-items-center rounded-full bg-fondo ring-2 ring-acento-relleno">
              <Robot className="size-12 animate-alto-flota motion-reduce:animate-none" />
            </span>
            <span className="text-left leading-tight">
              <span className="block">Alto</span>
              <span className="block text-mini font-normal opacity-80">Tu asistente virtual</span>
            </span>
          </button>
        </div>
      )}
      {usado && <AltoPanel whatsapp={whatsapp} visible={abierto} onCerrar={() => setAbierto(false)} />}
    </>
  );
}
