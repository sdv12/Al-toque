"use client";

import { useState } from "react";

/*
 * Botón flotante «Diseños» de las demos (como en la página de estilista): el «Original» con sus
 * combinaciones de color y debajo los diseños con estructura propia. Colores fijos, no los de la
 * plantilla, para que se lea igual sobre cualquier diseño. Solo cambia la vista: no toca la config.
 */

export interface OpcionDiseno {
  id: string;
  nombre: string;
  desc: string;
  /** [tinta, acento, fondo] para la muestra. */
  colores: [string, string, string];
}

export interface GruposDisenos {
  original: { nombre: string; desc: string; variantes: OpcionDiseno[] };
  estructuras: OpcionDiseno[];
}

function Muestra({ colores: [tinta, acento, fondo] }: { colores: OpcionDiseno["colores"] }) {
  return (
    <span aria-hidden className="flex h-10 w-14 shrink-0 overflow-hidden rounded-[3px] border border-[#0000001a]">
      <span className="w-1/2" style={{ background: tinta }} />
      <span className="flex w-1/2 flex-col">
        <span className="h-1/2" style={{ background: acento }} />
        <span className="h-1/2" style={{ background: fondo }} />
      </span>
    </span>
  );
}

function Opcion({ o, nombre, desc, activo, onClick }: { o: OpcionDiseno; nombre: string; desc: string; activo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-[6px] p-2 text-left transition-colors ${activo ? "bg-[#00000012]" : "hover:bg-[#0000000a]"}`}
    >
      <Muestra colores={o.colores} />
      <span className="min-w-0 flex-1">
        <span className="block text-[0.9rem] font-semibold text-[#1a1a1a]">{nombre}</span>
        <span className="block text-[0.74rem] text-[#666666]">{desc}</span>
      </span>
      {activo && (
        <span aria-hidden className="text-[#1a1a1a]">
          ✓
        </span>
      )}
    </button>
  );
}

export function SelectorDisenos({ grupos, actual, onElegir }: { grupos: GruposDisenos; actual: string; onElegir: (id: string) => void }) {
  const [abierto, setAbierto] = useState(false);
  const { original, estructuras } = grupos;
  const variante = original.variantes.find((v) => v.id === actual);
  const esOriginal = Boolean(variante);
  const primera = original.variantes[0]!;

  return (
    <div className="fixed bottom-5 left-5 z-[60] font-[system-ui,sans-serif] [margin-bottom:env(safe-area-inset-bottom)]">
      {abierto && (
        <div
          role="dialog"
          aria-label="Elegí un diseño"
          className="absolute bottom-[68px] left-0 max-h-[70vh] w-[18.5rem] overflow-y-auto rounded-[12px] border border-[#0000001a] bg-[#ffffff] p-3 text-[#1a1a1a] shadow-[0_20px_50px_-15px_rgba(0,0,0,.45)]"
        >
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">Elegí un diseño</span>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="flex size-8 cursor-pointer items-center justify-center text-[#777777]">
              ✕
            </button>
          </div>
          <Opcion o={variante ?? primera} nombre={original.nombre} desc={original.desc} activo={esOriginal} onClick={() => !esOriginal && onElegir(primera.id)} />
          {esOriginal && (
            <div className="mb-2 ml-[68px] flex flex-wrap gap-1.5">
              {original.variantes.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onElegir(v.id)}
                  title={v.nombre}
                  aria-label={`Color ${v.nombre}`}
                  aria-pressed={actual === v.id}
                  className={`size-7 cursor-pointer rounded-full border-2 ${actual === v.id ? "border-[#1a1a1a]" : "border-transparent"}`}
                  style={{ background: `linear-gradient(135deg, ${v.colores[0]} 50%, ${v.colores[1]} 50%)` }}
                />
              ))}
            </div>
          )}
          <div className="my-2 border-t border-[#0000001a]" />
          {estructuras.map((o) => (
            <Opcion key={o.id} o={o} nombre={o.nombre} desc={o.desc} activo={actual === o.id} onClick={() => onElegir(o.id)} />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="flex h-14 cursor-pointer items-center gap-2 rounded-full border border-[#0000001a] bg-[#ffffff] px-5 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] shadow-[0_8px_24px_rgba(0,0,0,.3)]"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 11.994 2z" />
        </svg>
        Diseños
      </button>
    </div>
  );
}
