"use client";

import { useState, type ComponentType, type CSSProperties } from "react";
import { SelectorDisenos, type GruposDisenos } from "@/ui/SelectorDisenos";
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

const c = (rgb: string) => `rgb(${rgb.split(" ").join(",")})`;

/** Los mismos grupos que el selector de la página de estilista. */
const GRUPOS: GruposDisenos = {
  original: {
    nombre: "Original",
    desc: "Clásico, con 4 combinaciones de color",
    variantes: [
      { id: "rosa", nombre: "Rosa empolvado", desc: "Femenino y editorial", colores: [c("31 26 26"), c("222 167 152"), c("243 216 210")] },
      { id: "salvia", nombre: "Salvia", desc: "Natural y sereno", colores: [c("28 40 33"), c("185 205 165"), c("228 233 222")] },
      { id: "lila", nombre: "Lila moderno", desc: "Fresco, redondeado", colores: [c("35 28 54"), c("196 176 240"), c("236 231 245")] },
      { id: "arena", nombre: "Arena y oro", desc: "Clásico y elegante", colores: [c("33 27 22"), c("205 170 110"), c("239 230 218")] },
    ],
  },
  estructuras: [
    { id: "turnero", nombre: "Turnero", desc: "Sacá número: tickets y pizarra", colores: [c("22 20 18"), c("242 183 5"), c("242 237 227")] },
    { id: "revista", nombre: "Revista", desc: "Tapa de revista de moda", colores: [c("17 17 17"), c("200 16 46"), c("244 240 234")] },
    { id: "muestrario", nombre: "Muestrario", desc: "Carta de colores con mechones", colores: [c("26 26 26"), c("184 113 72"), c("247 245 242")] },
    { id: "vidriera", nombre: "Vidriera", desc: "Neón y cartel de letras", colores: [c("10 15 13"), c("226 186 98"), c("16 26 23")] },
    { id: "corcho", nombre: "Corcho", desc: "Polaroids, post-its y rotuladora", colores: [c("33 29 25"), c("255 214 74"), c("239 230 214")] },
    { id: "setentas", nombre: "Setentas", desc: "Retro con franjas y medidor", colores: [c("59 31 18"), c("232 163 61"), c("246 232 207")] },
  ],
};

/** "#9a5a50" → "154 90 80" (las paletas de los diseños van en "R G B"). */
const aRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

/**
 * Salón de belleza: el diseño elegido en la portada arma toda la página (cada uno con su propia
 * estructura, como en la página de estilista). Si el cliente eligió un acento propio, reemplaza al
 * color principal del diseño.
 */
export function LandingEstetica({ config }: { config: Config }) {
  // En las demos, el botón «Diseños» deja probarlos todos sin tocar la config.
  const [elegido, setElegido] = useState<IdDiseno | null>(null);
  const inicial = config.secciones.find((s) => s.tipo === "portada")?.variante ?? "rosa";
  const diseno = (config.demo && elegido) || inicial;
  const Diseno = DISENOS[diseno];
  const acento = config.estilo.acento.toLowerCase();
  const estilo = acento !== ACENTO_DEL_DISENO ? ({ "--c-vino": aRgb(acento) } as CSSProperties) : undefined;
  return (
    <DatosProvider config={config}>
      <div data-diseno={diseno} style={estilo}>
        <Diseno />
        <Pie />
      </div>
      {config.demo && <SelectorDisenos grupos={GRUPOS} actual={diseno} onElegir={(id) => setElegido(id as IdDiseno)} />}
    </DatosProvider>
  );
}
