"use client";

import { useId, useState } from "react";
import { esHex } from "@/core/lib/color";
import { acentoPasaAA, variablesDeEstilo } from "@/core/lib/estilo";
import { registry } from "@/core/registry";
import { ESQUINAS, type Esquinas, type Modo } from "@/core/schema/comun";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque, claseControl } from "../campos";

type Props = { config: LandingConfig; editar: (f: (c: LandingConfig) => void) => void };

const TEXTO_ESQUINAS: Record<Esquinas, string> = { recto: "Rectas", suave: "Suaves", redondeado: "Redondeadas" };
const TEXTO_MODO: Record<Modo, string> = { claro: "Claro", oscuro: "Oscuro" };

export function PestanaEstilo({ config, editar }: Props) {
  const { meta } = registry[config.plantilla];
  const idHex = useId();
  const [hex, setHex] = useState(config.estilo.acento);
  const sugerido = meta.acentos.some((a) => a.hex.toLowerCase() === config.estilo.acento.toLowerCase());
  const pasa = acentoPasaAA(config.plantilla, config.estilo);
  const ajustado = variablesDeEstilo(config.plantilla, config.estilo)["--lk-acento-texto"];

  const setAcento = (valor: string) => {
    setHex(valor);
    if (esHex(valor)) editar((c) => void (c.estilo.acento = valor.toLowerCase()));
  };

  return (
    <>
      <Bloque titulo="Color de acento" descripcion={`Los sugeridos están elegidos para ${meta.nombre}. También podés usar el de tu marca.`}>
        <fieldset>
          <legend className="sr-only">Acentos sugeridos</legend>
          <div className="flex flex-wrap gap-2">
            {meta.acentos.map((a) => (
              <label key={a.hex} className="cursor-pointer">
                <input
                  type="radio"
                  name="acento"
                  value={a.hex}
                  checked={config.estilo.acento.toLowerCase() === a.hex.toLowerCase()}
                  onChange={() => setAcento(a.hex)}
                  className="peer sr-only"
                />
                <span className="flex items-center gap-2 rounded-control border border-borde bg-superficie py-1.5 pl-1.5 pr-3 text-chico peer-checked:border-tinta peer-checked:shadow-[inset_0_0_0_1px_var(--lk-texto)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco">
                  <span aria-hidden className="size-6 rounded-[4px] border border-black/10" style={{ background: a.hex }} />
                  {a.nombre}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={idHex} className="block text-chico font-medium">
            Otro color {!sugerido && <span className="font-normal text-tinta-suave">(en uso)</span>}
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              aria-label="Elegir color con el selector"
              value={esHex(hex) ? hex : config.estilo.acento}
              onChange={(e) => setAcento(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-control border border-borde bg-superficie p-1"
            />
            <input
              id={idHex}
              value={hex}
              onChange={(e) => setAcento(e.target.value.trim())}
              placeholder="#c9a45c"
              maxLength={7}
              aria-invalid={!esHex(hex) || undefined}
              className={`${claseControl} font-nota`}
            />
          </div>
        </div>

        {!pasa && (
          <p role="status" className="flex items-start gap-3 rounded-base border border-borde bg-superficie-2 p-3 text-chico">
            <span aria-hidden className="mt-0.5 size-5 shrink-0 rounded-[4px]" style={{ background: ajustado }} />
            Este color no se lee bien como texto sobre el fondo. En los textos lo usamos un poco ajustado ({ajustado}) para que pase
            contraste AA; en fondos y detalles va tal cual.
          </p>
        )}
      </Bloque>

      <Bloque titulo="Esquinas">
        <fieldset>
          <legend className="sr-only">Forma de las esquinas</legend>
          <div className="grid grid-cols-3 gap-2">
            {ESQUINAS.map((e) => (
              <label key={e} className="cursor-pointer">
                <input
                  type="radio"
                  name="esquinas"
                  value={e}
                  checked={config.estilo.esquinas === e}
                  onChange={() => editar((c) => void (c.estilo.esquinas = e))}
                  className="peer sr-only"
                />
                <span className="block rounded-control border border-borde bg-superficie px-3 py-2 text-center text-chico peer-checked:border-tinta peer-checked:shadow-[inset_0_0_0_1px_var(--lk-texto)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco">
                  {TEXTO_ESQUINAS[e]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Bloque>

      <Bloque
        titulo="Modo"
        descripcion={meta.modos.length > 1 ? undefined : `${meta.nombre} es ${TEXTO_MODO[meta.modos[0]].toLowerCase()} por diseño.`}
      >
        {meta.modos.length > 1 && (
          <fieldset>
            <legend className="sr-only">Modo de color</legend>
            <div className="grid grid-cols-2 gap-2">
              {(meta.modos as readonly Modo[]).map((m) => (
                <label key={m} className="cursor-pointer">
                  <input
                    type="radio"
                    name="modo"
                    value={m}
                    checked={(config.estilo.modo ?? meta.modos[0]) === m}
                    onChange={() => editar((c) => void (c.estilo.modo = m))}
                    className="peer sr-only"
                  />
                  <span className="block rounded-control border border-borde bg-superficie px-3 py-2 text-center text-chico peer-checked:border-tinta peer-checked:shadow-[inset_0_0_0_1px_var(--lk-texto)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco">
                    {TEXTO_MODO[m]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </Bloque>
    </>
  );
}
