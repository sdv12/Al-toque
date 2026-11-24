"use client";

import type { CSSProperties } from "react";
import { ACENTO_DEL_DISENO, DatosProvider, Pie, useDatos, type Config, type IdDiseno } from "./datos";
import { clasico } from "./disenos/Clasico";
import { editorial } from "./disenos/Editorial";
import { expediente } from "./disenos/Expediente";
import { moderno } from "./disenos/Moderno";
import { nocturno } from "./disenos/Nocturno";
import type { Diseno } from "./disenos/tipos";

const DISENOS: Record<IdDiseno, Diseno> = { clasico, editorial, moderno, expediente, nocturno };

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
  const portada = config.secciones.find((s) => s.tipo === "portada");
  const id = (portada?.variante ?? "clasico") as IdDiseno;
  const diseno = DISENOS[id] ?? clasico;
  return (
    <DatosProvider config={config}>
      <div data-diseno={id} style={estiloAcento(config, id)}>
        <Pagina diseno={diseno} />
      </div>
    </DatosProvider>
  );
}
