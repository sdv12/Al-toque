"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LandingConfig } from "@/core/schema/landing-config";
import { RenderLanding } from "@/templates";

export type Dispositivo = "escritorio" | "celular";

/**
 * Preview en vivo. La landing responde con container queries al ancho del marco, no de la
 * ventana. El marco tiene `transform`, así que los elementos `fixed` de la plantilla (panel de
 * reserva, velo) quedan contenidos acá adentro y no tapan el configurador.
 */
export function Preview({ config, dispositivo }: { config: LandingConfig; dispositivo: Dispositivo }) {
  const marco = useRef<HTMLDivElement>(null);
  const [alto, setAlto] = useState<number | null>(null);

  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => entrada && setAlto(Math.round(entrada.contentRect.height)));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const estilo = {
    width: dispositivo === "celular" ? "min(390px, 100%)" : "100%",
    ...(alto ? { "--lk-alto-vista": `${alto}px` } : {}),
  } as CSSProperties;

  return (
    <div className="flex h-full min-h-0 justify-center bg-superficie-2 @5xl:p-5">
      <div
        ref={marco}
        style={estilo}
        className={`relative h-full overflow-hidden [transform:translateZ(0)] ${
          dispositivo === "celular" ? "@5xl:rounded-[28px] @5xl:border-[10px] @5xl:border-tinta" : "@5xl:rounded-base @5xl:border @5xl:border-borde"
        }`}
      >
        <div className="h-full overflow-y-auto overscroll-contain" tabIndex={-1} aria-label="Vista previa de la landing" role="region">
          <RenderLanding config={config} />
        </div>
      </div>
    </div>
  );
}
