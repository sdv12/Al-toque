"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { claveDeElemento, selectorDeClave, textoTocado } from "@/core/lib/textos-propios";
import type { LandingConfig } from "@/core/schema/landing-config";
import { RenderLanding } from "@/templates";

export type Dispositivo = "escritorio" | "celular";

/** Texto tocado en la vista previa, con cómo se ve ahora (para mostrar valores de partida). */
export type TextoElegido = { clave: string; muestra: string; tamano: number; color: string };

type Seleccion = {
  /** Modo «Seleccionar texto»: el clic elige un texto en vez de usar la página. */
  activa: boolean;
  elegido: string | null;
  onElegir: (t: TextoElegido) => void;
};

function aHex(rgb: string): string {
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return "#000000";
  return `#${m.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Preview en vivo. La landing responde con container queries al ancho del marco, no de la
 * ventana. El marco tiene `transform`, así que los elementos `fixed` de la plantilla (panel de
 * reserva, velo) quedan contenidos acá adentro y no tapan el configurador.
 */
export function Preview({ config, dispositivo, seleccion }: { config: LandingConfig; dispositivo: Dispositivo; seleccion?: Seleccion }) {
  const marco = useRef<HTMLDivElement>(null);
  const zona = useRef<HTMLDivElement>(null);
  const activa = seleccion?.activa ?? false;
  const onElegir = seleccion?.onElegir;

  // Modo selección: resalta el texto bajo el puntero y el clic lo elige (sin seguir links ni abrir nada).
  useEffect(() => {
    const el = zona.current;
    if (!activa || !el || !onElegir) return;
    let sobre: Element | null = null;
    const raiz = () => el.querySelector("[data-plantilla]");
    const marcar = (nuevo: Element | null) => {
      if (sobre === nuevo) return;
      sobre?.removeAttribute("data-lk-sobre");
      sobre = nuevo;
      sobre?.setAttribute("data-lk-sobre", "");
    };
    const mover = (e: PointerEvent) => {
      const r = raiz();
      marcar(r && e.target instanceof Element ? textoTocado(e.target, r) : null);
    };
    const tocar = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const r = raiz();
      const texto = r && e.target instanceof Element ? textoTocado(e.target, r) : null;
      const clave = texto && r ? claveDeElemento(texto, r) : null;
      if (!texto || !clave) return;
      const cs = getComputedStyle(texto);
      onElegir({ clave, muestra: (texto.textContent ?? "").trim().slice(0, 80), tamano: Math.round(parseFloat(cs.fontSize)), color: aHex(cs.color) });
    };
    const salir = () => marcar(null);
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerleave", salir);
    el.addEventListener("click", tocar, true);
    return () => {
      marcar(null);
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerleave", salir);
      el.removeEventListener("click", tocar, true);
    };
  }, [activa, onElegir]);

  const resaltado = [
    activa ? "[data-lk-sobre]{outline:2px dashed #1d4fd8!important;outline-offset:2px;cursor:pointer!important}" : "",
    seleccion?.elegido ? `${selectorDeClave(seleccion.elegido)}{outline:2px solid #1d4fd8!important;outline-offset:3px}` : "",
  ].join("");
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
        <div
          ref={zona}
          className={`h-full overflow-y-auto overscroll-contain ${activa ? "cursor-pointer" : ""}`}
          tabIndex={-1}
          aria-label={activa ? "Vista previa: tocá un texto para editarlo" : "Vista previa de la landing"}
          role="region"
        >
          {resaltado && <style>{resaltado}</style>}
          <RenderLanding config={config} />
        </div>
      </div>
    </div>
  );
}
