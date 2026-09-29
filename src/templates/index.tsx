import { AdapterProvider } from "@/core/adapters/context";
import type { DataAdapter } from "@/core/adapters/types";
import type { Plantilla } from "@/core/registry";
import type { LandingConfig } from "@/core/schema/landing-config";
import { PlantillaRaiz } from "@/ui/PlantillaRaiz";
import { LandingAlojamiento, fuentes as fuentesAlojamiento } from "./alojamiento";
import { LandingBarberia, fuentes as fuentesBarberia } from "./barberia";
import { LandingConsultorio, fuentes as fuentesConsultorio } from "./consultorio";
import { LandingGenerico, fuentes as fuentesGenerico } from "./generico";

/** Plantillas con implementación completa. */
export const PLANTILLAS_LISTAS: readonly Plantilla[] = ["barberia", "consultorio", "alojamiento", "generico"];

/**
 * Único punto que conoce todas las plantillas: elige la presentación según la config y la
 * envuelve con sus tokens y el adaptador de datos.
 */
export function RenderLanding({ config, adapter }: { config: LandingConfig; adapter?: DataAdapter }) {
  switch (config.plantilla) {
    case "barberia":
      return (
        <PlantillaRaiz plantilla="barberia" estilo={config.estilo} fuentes={fuentesBarberia}>
          <AdapterProvider config={config} {...(adapter ? { adapter } : {})}>
            <LandingBarberia config={config} />
          </AdapterProvider>
        </PlantillaRaiz>
      );
    case "consultorio":
      return (
        <PlantillaRaiz plantilla="consultorio" estilo={config.estilo} fuentes={fuentesConsultorio}>
          <AdapterProvider config={config} {...(adapter ? { adapter } : {})}>
            <LandingConsultorio config={config} />
          </AdapterProvider>
        </PlantillaRaiz>
      );
    case "alojamiento":
      return (
        <PlantillaRaiz plantilla="alojamiento" estilo={config.estilo} fuentes={fuentesAlojamiento} className="textura">
          <AdapterProvider config={config} {...(adapter ? { adapter } : {})}>
            <LandingAlojamiento config={config} />
          </AdapterProvider>
        </PlantillaRaiz>
      );
    case "generico":
      return (
        <PlantillaRaiz plantilla="generico" estilo={config.estilo} fuentes={fuentesGenerico}>
          <AdapterProvider config={config} {...(adapter ? { adapter } : {})}>
            <LandingGenerico config={config} />
          </AdapterProvider>
        </PlantillaRaiz>
      );
  }
}
