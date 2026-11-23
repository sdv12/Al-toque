"use client";

import { useId, useState } from "react";
import { FUENTES_TEXTO, TAMANO_MAX, TAMANO_MIN, type EstiloTexto, type FuenteTexto } from "@/core/lib/textos-propios";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque, botonKit, claseControl } from "./campos";
import type { TextoElegido } from "./Preview";

type Props = {
  config: LandingConfig;
  editar: (fn: (c: LandingConfig) => void) => void;
  elegido: TextoElegido;
  cerrar: () => void;
};

const esHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

/**
 * Editor del texto tocado en la vista previa: tamaño, color y tipografía. Lo que no se toca queda
 * como lo trae la plantilla; si se vacía todo, el texto vuelve a ser el de la plantilla.
 */
export function PanelTexto({ config, editar, elegido, cerrar }: Props) {
  const id = useId();
  const actual: EstiloTexto = config.estilo.textos?.[elegido.clave] ?? {};
  const [tamano, setTamano] = useState(actual.tamano ? String(actual.tamano) : "");
  const [hex, setHex] = useState(actual.color ?? elegido.color);
  const tamanoNum = Number(tamano);
  const tamanoInvalido = tamano !== "" && (!Number.isInteger(tamanoNum) || tamanoNum < TAMANO_MIN || tamanoNum > TAMANO_MAX);

  function cambiar(parcial: Partial<EstiloTexto>) {
    editar((c) => {
      const textos = { ...(c.estilo.textos ?? {}) };
      const nuevo: EstiloTexto = { ...(textos[elegido.clave] ?? {}), ...parcial };
      for (const k of Object.keys(nuevo) as (keyof EstiloTexto)[]) if (nuevo[k] === undefined) delete nuevo[k];
      if (Object.keys(nuevo).length) textos[elegido.clave] = nuevo;
      else delete textos[elegido.clave];
      if (Object.keys(textos).length) c.estilo.textos = textos;
      else delete c.estilo.textos;
    });
  }

  function quitar() {
    setTamano("");
    setHex(elegido.color);
    editar((c) => {
      if (!c.estilo.textos) return;
      const textos = { ...c.estilo.textos };
      delete textos[elegido.clave];
      if (Object.keys(textos).length) c.estilo.textos = textos;
      else delete c.estilo.textos;
    });
  }

  const conCambios = Object.keys(actual).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-borde px-5 py-3">
        <p className="text-chico font-semibold">Texto seleccionado</p>
        <button type="button" className={botonKit.secundario} onClick={cerrar}>
          Listo
        </button>
      </div>
      <Bloque titulo="Este texto" descripcion="Los cambios se ven al instante en la vista previa. Tocá otro texto para editarlo.">
        <p className="line-clamp-3 rounded-control border border-borde bg-superficie px-3 py-2 text-chico">«{elegido.muestra || "Texto"}»</p>
      </Bloque>

      <Bloque titulo="Tamaño de fuente" descripcion={`En píxeles, de ${TAMANO_MIN} a ${TAMANO_MAX}. Vacío: el de la plantilla (ahora ${elegido.tamano} px).`}>
        <label htmlFor={`${id}-tamano`} className="sr-only">
          Tamaño en píxeles
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`${id}-tamano`}
            type="number"
            inputMode="numeric"
            min={TAMANO_MIN}
            max={TAMANO_MAX}
            step={1}
            placeholder={String(elegido.tamano)}
            value={tamano}
            aria-invalid={tamanoInvalido || undefined}
            onChange={(e) => {
              const v = e.target.value;
              setTamano(v);
              const n = Number(v);
              if (v === "") cambiar({ tamano: undefined });
              else if (Number.isInteger(n) && n >= TAMANO_MIN && n <= TAMANO_MAX) cambiar({ tamano: n });
            }}
            className={`${claseControl} w-32 tabular-nums`}
          />
          <span className="text-chico text-tinta-suave">px</span>
        </div>
        {tamanoInvalido && (
          <p role="alert" className="text-mini text-[#b3261e]">
            Usá un número entero entre {TAMANO_MIN} y {TAMANO_MAX}.
          </p>
        )}
      </Bloque>

      <Bloque titulo="Color de fuente">
        <div className="flex gap-2">
          <input
            type="color"
            aria-label="Elegir el color con el selector"
            value={esHex(hex) ? hex : elegido.color}
            onChange={(e) => {
              setHex(e.target.value);
              cambiar({ color: e.target.value.toLowerCase() });
            }}
            className="h-11 w-14 shrink-0 cursor-pointer rounded-control border border-borde bg-superficie p-1"
          />
          <label htmlFor={`${id}-color`} className="sr-only">
            Color en formato #RRGGBB
          </label>
          <input
            id={`${id}-color`}
            value={hex}
            onChange={(e) => {
              setHex(e.target.value);
              if (esHex(e.target.value)) cambiar({ color: e.target.value.toLowerCase() });
            }}
            className={`${claseControl} font-nota`}
          />
        </div>
        {actual.color && (
          <button
            type="button"
            className="text-mini underline underline-offset-2"
            onClick={() => {
              setHex(elegido.color);
              cambiar({ color: undefined });
            }}
          >
            Volver al color de la plantilla
          </button>
        )}
      </Bloque>

      <Bloque titulo="Tipo de fuente">
        <label htmlFor={`${id}-fuente`} className="sr-only">
          Tipografía
        </label>
        <select
          id={`${id}-fuente`}
          value={actual.fuente ?? ""}
          onChange={(e) => cambiar({ fuente: (e.target.value || undefined) as FuenteTexto | undefined })}
          className={claseControl}
        >
          <option value="">La de la plantilla</option>
          {FUENTES_TEXTO.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
      </Bloque>

      <Bloque titulo="Quitar cambios" descripcion="Vuelve a como lo trae la plantilla.">
        <button type="button" className={botonKit.secundario} disabled={!conCambios} onClick={quitar}>
          Quitar los cambios de este texto
        </button>
      </Bloque>
    </div>
  );
}
