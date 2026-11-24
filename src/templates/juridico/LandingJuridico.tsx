"use client";

import { useState, type CSSProperties } from "react";
import { SelectorDisenos, type GruposDisenos } from "@/ui/SelectorDisenos";
import { ACENTO_DEL_DISENO, DatosProvider, Pie, useDatos, type Config, type IdDiseno } from "./datos";
import { clasico } from "./disenos/Clasico";
import { codigo } from "./disenos/Codigo";
import { editorial } from "./disenos/Editorial";
import { expediente } from "./disenos/Expediente";
import { marmol } from "./disenos/Marmol";
import { moderno } from "./disenos/Moderno";
import { nocturno } from "./disenos/Nocturno";
import type { Diseno } from "./disenos/tipos";

/** Las cuatro combinaciones del clásico comparten estructura; los otros seis tienen la suya. */
const DISENOS: Record<IdDiseno, Diseno> = {
  clasico,
  "clasico-bordo": clasico,
  "clasico-verde": clasico,
  "clasico-piedra": clasico,
  editorial,
  moderno,
  expediente,
  codigo,
  marmol,
  nocturno,
};

const GRUPOS: GruposDisenos = {
  original: {
    nombre: "Clásico",
    desc: "Sello, filetes y numerales, en 4 combinaciones",
    variantes: [
      { id: "clasico", nombre: "Azul tinta", desc: "Azul y bronce", colores: ["#1b2533", "#a8834a", "#f6f2ea"] },
      { id: "clasico-bordo", nombre: "Bordó", desc: "Bordó y oro", colores: ["#7a2431", "#a98249", "#f7f1ec"] },
      { id: "clasico-verde", nombre: "Verde inglés", desc: "Verde y latón", colores: ["#2f5442", "#94783f", "#f1f3ec"] },
      { id: "clasico-piedra", nombre: "Piedra", desc: "Grafito y piedra", colores: ["#33363b", "#8a7458", "#efedea"] },
    ],
  },
  estructuras: [
    { id: "editorial", nombre: "Editorial", desc: "Un diario: titular, columnas e índice", colores: ["#111111", "#b3261e", "#f3f0e8"] },
    { id: "moderno", nombre: "Contemporáneo", desc: "La reunión ya en la portada", colores: ["#0f1b2a", "#0f6b5c", "#f2f4f6"] },
    { id: "expediente", nombre: "Expediente", desc: "Carpeta, fojas y sellos de goma", colores: ["#2a2118", "#9b2f1f", "#e6d8bd"] },
    { id: "codigo", nombre: "Código", desc: "Artículos, incisos y notas al margen", colores: ["#1f3f73", "#b8955a", "#f6f4ee"] },
    { id: "marmol", nombre: "Mármol", desc: "Frontón, columnas y escalinata", colores: ["#23211e", "#a88a56", "#f2f0eb"] },
    { id: "nocturno", nombre: "Boutique nocturna", desc: "Verde noche y bronce", colores: ["#111916", "#c4a46b", "#19231f"] },
  ],
};

/**
 * Si el cliente eligió otro acento, el diseño hereda el de la raíz (PlantillaRaiz ya lo calculó
 * con contraste). En el diseño oscuro, el acento como texto se aclara para que se lea.
 */
function estiloAcento(config: Config, diseno: IdDiseno): CSSProperties | undefined {
  if (config.estilo.acento.toLowerCase() === ACENTO_DEL_DISENO) return undefined;
  const v: Record<string, string> = {
    "--lk-acento": "inherit",
    "--lk-acento-relleno": "inherit",
    "--lk-sobre-acento": "inherit",
    "--lk-acento-texto": diseno === "nocturno" ? "color-mix(in srgb, var(--lk-acento) 55%, #ffffff)" : "inherit",
  };
  return v as CSSProperties;
}

function Pagina({ diseno }: { diseno: Diseno }) {
  const { orden } = useDatos();
  const { Portada, secciones, pie } = diseno;
  return (
    <>
      <Portada />
      <main>
        {orden.map((s) => {
          const Seccion = secciones[s];
          return <Seccion key={s} />;
        })}
      </main>
      <Pie className={pie} />
    </>
  );
}

export function LandingJuridico({ config }: { config: Config }) {
  // En las demos, el botón «Diseños» deja probarlos todos sin tocar la config.
  const [elegido, setElegido] = useState<IdDiseno | null>(null);
  const portada = config.secciones.find((s) => s.tipo === "portada");
  const id = (config.demo && elegido) || ((portada?.variante ?? "clasico") as IdDiseno);
  const diseno = DISENOS[id] ?? clasico;
  return (
    <DatosProvider config={config}>
      <div data-diseno={id} style={estiloAcento(config, id)}>
        <Pagina diseno={diseno} />
      </div>
      {config.demo && <SelectorDisenos grupos={GRUPOS} actual={id} onElegir={(d) => setElegido(d as IdDiseno)} />}
    </DatosProvider>
  );
}
