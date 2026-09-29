"use client";

import { PLANTILLAS, registry, type Plantilla } from "@/core/registry";
import type { LandingConfig } from "@/core/schema/landing-config";
import { PLANTILLAS_LISTAS } from "@/templates";
import { Bloque, botonKit } from "../campos";

type Props = { config: LandingConfig; usarEjemplo: (p: Plantilla) => void };

export function PestanaPlantilla({ config, usarEjemplo }: Props) {
  function elegir(p: Plantilla) {
    if (p === config.plantilla) return;
    if (window.confirm(`Vas a cambiar a "${registry[p].meta.nombre}". Se carga su contenido de ejemplo y se pierde lo que editaste. ¿Seguimos?`)) {
      usarEjemplo(p);
    }
  }

  return (
    <>
      <Bloque titulo="Plantilla" descripcion="Cada plantilla es un sitio distinto, pensado para su rubro: cambia la estructura, no solo los colores.">
        <fieldset>
          <legend className="sr-only">Elegí una plantilla</legend>
          <div className="space-y-2">
            {PLANTILLAS.map((p) => {
              const { meta } = registry[p];
              const lista = PLANTILLAS_LISTAS.includes(p);
              return (
                <label key={p} className={`block ${lista ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                  <input
                    type="radio"
                    name="plantilla"
                    value={p}
                    checked={config.plantilla === p}
                    disabled={!lista}
                    onChange={() => elegir(p)}
                    className="peer sr-only"
                  />
                  <span className="block rounded-base border border-borde bg-superficie px-4 py-3 peer-checked:border-tinta peer-checked:shadow-[inset_0_0_0_1px_var(--lk-texto)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold">{meta.nombre}</span>
                      <span className="text-mini text-tinta-suave">{lista ? meta.rubro : "Próximamente"}</span>
                    </span>
                    <span className="mt-1 block text-chico text-tinta-suave">{meta.descripcion}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </Bloque>
      <Bloque titulo="Empezar de nuevo" descripcion="Vuelve al contenido de ejemplo de la plantilla actual.">
        <button
          type="button"
          className={botonKit.secundario}
          onClick={() => window.confirm("Se descartan todos tus cambios. ¿Seguro?") && usarEjemplo(config.plantilla)}
        >
          Restaurar ejemplo
        </button>
      </Bloque>
    </>
  );
}
