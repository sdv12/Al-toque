"use client";

import { useId, useState } from "react";
import { esHex } from "@/core/lib/color";
import { acentoPasaAA, paletaEfectiva, resolverModo, variablesDeEstilo } from "@/core/lib/estilo";
import { paletaDe, registry } from "@/core/registry";
import { ESQUINAS, TAMANOS_TEXTO, type Esquinas, type Modo, type TamanoTexto } from "@/core/schema/comun";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque, claseControl } from "../campos";

type Props = { config: LandingConfig; editar: (f: (c: LandingConfig) => void) => void };

const TEXTO_ESQUINAS: Record<Esquinas, string> = { recto: "Rectas", suave: "Suaves", redondeado: "Redondeadas" };
const TEXTO_MODO: Record<Modo, string> = { claro: "Claro", oscuro: "Oscuro" };
const TEXTO_TAMANO: Record<TamanoTexto, string> = { chico: "Chico", normal: "Normal", grande: "Grande" };

export function PestanaEstilo({ config, editar }: Props) {
  const { meta } = registry[config.plantilla];
  const idHex = useId();
  const idFondo = useId();
  const [hex, setHex] = useState(config.estilo.acento);
  // Fondo de la plantilla (según el modo) y el que se está usando, propio o no.
  const fondoPlantilla = paletaDe(config.plantilla, resolverModo(config.plantilla, config.estilo)).fondo;
  const fondoActual = paletaEfectiva(config.plantilla, config.estilo).fondo;
  const [hexFondo, setHexFondo] = useState(fondoActual);
  const sugerido = meta.acentos.some((a) => a.hex.toLowerCase() === config.estilo.acento.toLowerCase());
  const pasa = acentoPasaAA(config.plantilla, config.estilo);
  const ajustado = variablesDeEstilo(config.plantilla, config.estilo)["--lk-acento-texto"];

  const setAcento = (valor: string) => {
    setHex(valor);
    if (esHex(valor)) editar((c) => void (c.estilo.acento = valor.toLowerCase()));
  };

  const setFondo = (valor: string) => {
    setHexFondo(valor);
    if (!esHex(valor)) return;
    editar((c) => {
      // Elegir el mismo fondo de la plantilla equivale a no tener uno propio.
      if (valor.toLowerCase() === fondoPlantilla.toLowerCase()) delete c.estilo.fondo;
      else c.estilo.fondo = valor.toLowerCase();
    });
  };
  const usarFondoDePlantilla = () => {
    setHexFondo(fondoPlantilla);
    editar((c) => void delete c.estilo.fondo);
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

      <Bloque
        titulo="Color de fondo"
        descripcion="El fondo de toda la página. El texto, las tarjetas y los bordes se acomodan solos para que todo se siga leyendo."
      >
        <div>
          <label htmlFor={idFondo} className="block text-chico font-medium">
            Fondo {!config.estilo.fondo && <span className="font-normal text-tinta-suave">(el de la plantilla)</span>}
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              aria-label="Elegir el fondo con el selector"
              value={esHex(hexFondo) ? hexFondo : fondoActual}
              onChange={(e) => setFondo(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-control border border-borde bg-superficie p-1"
            />
            <input
              id={idFondo}
              value={hexFondo}
              onChange={(e) => setFondo(e.target.value.trim())}
              placeholder={fondoPlantilla}
              maxLength={7}
              aria-invalid={!esHex(hexFondo) || undefined}
              className={`${claseControl} font-nota`}
            />
          </div>
        </div>
        {config.estilo.fondo && (
          <button type="button" onClick={usarFondoDePlantilla} className="self-start text-chico underline underline-offset-2">
            Volver al fondo de la plantilla
          </button>
        )}
      </Bloque>

      <Bloque titulo="Tamaño del texto" descripcion="Agranda o achica todos los textos de la página por igual.">
        <fieldset>
          <legend className="sr-only">Tamaño del texto</legend>
          <div className="grid grid-cols-3 gap-2">
            {TAMANOS_TEXTO.map((t) => (
              <label key={t} className="cursor-pointer">
                <input
                  type="radio"
                  name="tamano-texto"
                  value={t}
                  checked={(config.estilo.texto ?? "normal") === t}
                  onChange={() =>
                    editar((c) => {
                      // "Normal" es no tener el campo: la config queda igual que antes de existir la opción.
                      if (t === "normal") delete c.estilo.texto;
                      else c.estilo.texto = t;
                    })
                  }
                  className="peer sr-only"
                />
                <span className="block rounded-control border border-borde bg-superficie px-3 py-2 text-center text-chico peer-checked:border-tinta peer-checked:shadow-[inset_0_0_0_1px_var(--lk-texto)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco">
                  {TEXTO_TAMANO[t]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
