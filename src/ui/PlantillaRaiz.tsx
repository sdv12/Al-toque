import type { CSSProperties, ReactNode } from "react";
import { resolverModo, variablesDeEstilo } from "@/core/lib/estilo";
import { cssDeTextos, fuentesUsadas } from "@/core/lib/textos-propios";
import type { Plantilla } from "@/core/registry";
import type { Estilo } from "@/core/schema/comun";
import { clasesDeFuentes } from "./fuentes-texto";

type Props = {
  plantilla: Plantilla;
  estilo: Estilo;
  /** Clases de next/font de la plantilla (las recibe para no depender de src/templates). */
  fuentes: string;
  className?: string;
  children: ReactNode;
};

/**
 * Activa el set de tokens de una plantilla: data-attributes que eligen el bloque de tokens.css
 * más las variables de acento calculadas (con contraste AA garantizado) inline.
 */
export function PlantillaRaiz({ plantilla, estilo, fuentes, className, children }: Props) {
  const estiloInline = variablesDeEstilo(plantilla, estilo) as CSSProperties;
  // Textos con estilo propio: reglas CSS (se ven igual sin JavaScript) y solo las fuentes que usan.
  const css = cssDeTextos(estilo.textos);
  const clases = [fuentes, clasesDeFuentes(fuentesUsadas(estilo.textos)), className].filter(Boolean).join(" ");
  return (
    <div
      data-plantilla={plantilla}
      data-modo={resolverModo(plantilla, estilo)}
      data-esquinas={estilo.esquinas}
      data-texto={estilo.texto ?? "normal"}
      className={clases}
      style={estiloInline}
    >
      {children}
      {/* Al final: si fuera primero, correría la posición (nth-child) de los textos de la raíz. */}
      {css && <style>{css}</style>}
    </div>
  );
}
