import type { ComponentType, CSSProperties } from "react";
import { ACENTO_DEL_DISENO, DatosProvider, type Config, type IdDiseno } from "./datos";
import Corcho from "./disenos/Corcho";
import Muestrario from "./disenos/Muestrario";
import Original from "./disenos/Original";
import Revista from "./disenos/Revista";
import Setentas from "./disenos/Setentas";
import Turnero from "./disenos/Turnero";
import Vidriera from "./disenos/Vidriera";
import { Pie } from "./Pie";

/** Rosa, salvia, lila y arena comparten la estructura original y cambian paleta y tipografía. */
const DISENOS: Record<IdDiseno, ComponentType> = {
  rosa: Original,
  salvia: Original,
  lila: Original,
  arena: Original,
  turnero: Turnero,
  revista: Revista,
  muestrario: Muestrario,
  vidriera: Vidriera,
  corcho: Corcho,
  setentas: Setentas,
};

/** "#9a5a50" → "154 90 80" (las paletas de los diseños van en "R G B"). */
const aRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

/**
 * Salón de belleza: el diseño elegido en la portada arma toda la página (cada uno con su propia
 * estructura, como en la página de estilista). Si el cliente eligió un acento propio, reemplaza al
 * color principal del diseño.
 */
export function LandingEstetica({ config }: { config: Config }) {
  const diseno = config.secciones.find((s) => s.tipo === "portada")?.variante ?? "rosa";
  const Diseno = DISENOS[diseno];
  const acento = config.estilo.acento.toLowerCase();
  const estilo = acento !== ACENTO_DEL_DISENO ? ({ "--c-vino": aRgb(acento) } as CSSProperties) : undefined;
  return (
    <DatosProvider config={config}>
      <div data-diseno={diseno} style={estilo}>
        <Diseno />
        <Pie />
      </div>
    </DatosProvider>
  );
}
