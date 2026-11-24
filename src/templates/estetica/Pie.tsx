"use client";

import { useMarca, useWa } from "./datos";

/** Pie común a los diez diseños (el del proyecto de estilista, sin el acceso al panel). */
export function Pie() {
  const M = useMarca();
  const wa = useWa();
  return (
    <footer className="border-t border-es-blanco/10 bg-es-tinta pb-24 pt-10 text-es-blanco/60 @2xl:pb-10">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 px-5 @2xl:px-10">
        <div className="flex items-center gap-3">
          <span className="font-display text-[1.6rem] font-black leading-none tracking-[-0.06em] text-es-acento">{M.iniciales}</span>
          <span className="text-[0.82rem]">{M.direccion}</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.82rem]">
          {M.instagramUrl && (
            <a href={M.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-es-blanco/60 no-underline hover:text-es-blanco">
              Instagram
            </a>
          )}
          <a href={wa()} target="_blank" rel="noopener noreferrer" className="text-es-blanco/60 no-underline hover:text-es-blanco">
            WhatsApp
          </a>
          <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-es-blanco/60 no-underline hover:text-es-blanco">
            Cómo llegar
          </a>
        </div>
      </div>
      <p className="mx-auto mt-7 max-w-[1180px] border-t border-es-blanco/10 px-5 pt-5 text-[0.75rem] @2xl:px-10">
        © {M.nombre}
        {M.esDemo && " (demo)"} · {M.horario}
      </p>
    </footer>
  );
}
