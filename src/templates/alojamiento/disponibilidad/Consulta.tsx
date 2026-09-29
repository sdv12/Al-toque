"use client";

import { useId } from "react";
import { etiquetaDia } from "@/core/lib/fechas";
import { formatearPesos, rangoLegible } from "@/core/lib/mensajes";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { boton } from "../estilos";
import { useDisponibilidad } from "./DisponibilidadContext";

/** Selector de huéspedes (stepper con botones grandes, apto touch y teclado). */
export function Huespedes() {
  const d = useDisponibilidad();
  const id = useId();
  return (
    <div>
      <p id={id} className="text-chico font-semibold">
        Huéspedes
      </p>
      <div role="group" aria-labelledby={id} className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => d.setHuespedes(d.huespedes - 1)}
          disabled={d.huespedes <= 1}
          aria-label="Uno menos"
          className="grid size-11 place-items-center rounded-full border-[1.5px] border-borde text-subtitulo hover:border-tinta disabled:opacity-30"
        >
          −
        </button>
        <output aria-live="polite" className="min-w-16 text-center font-display text-subtitulo tabular-nums">
          {d.huespedes}
        </output>
        <button
          type="button"
          onClick={() => d.setHuespedes(d.huespedes + 1)}
          disabled={d.huespedes >= d.maxHuespedes}
          aria-label="Uno más"
          className="grid size-11 place-items-center rounded-full border-[1.5px] border-borde text-subtitulo hover:border-tinta disabled:opacity-30"
        >
          +
        </button>
        <span className="text-mini text-tinta-suave">máx. {d.maxHuespedes}</span>
      </div>
    </div>
  );
}

/** Ficha de la consulta: fechas, noches, estimado y botón a WhatsApp. */
export function Consulta({ horizontal = false }: { horizontal?: boolean }) {
  const d = useDisponibilidad();
  const idNombre = useId();
  const p = d.propiedad;
  if (!p) return null;

  const problemaNoches = d.problemas.find((x) => x.tipo === "min-noches");

  async function consultar() {
    const link = await d.consultar();
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={`rounded-base border-[1.5px] border-borde bg-superficie p-5 textura @xl:p-6 ${
        horizontal ? "@3xl:grid @3xl:grid-cols-[1fr_1fr_auto] @3xl:items-end @3xl:gap-8" : ""
      }`}
    >
      <div>
        <p className="font-nota text-subtitulo text-acento-texto">{p.nombre}</p>
        {!d.rango.desde && <p className="mt-1">Tocá el día de entrada en el calendario.</p>}
        {d.rango.desde && !d.rango.hasta && (
          <p className="mt-1">
            Entrada el {etiquetaDia(d.rango.desde).larga}. <span className="text-tinta-suave">Ahora elegí la salida.</span>
          </p>
        )}
        {d.rango.desde && d.rango.hasta && (
          <p className="mt-1">
            {rangoLegible(d.rango.desde, d.rango.hasta).replace(/^del/, "Del")}
            <span className="block font-display text-subtitulo">
              {d.noches} {d.noches === 1 ? "noche" : "noches"} · {d.huespedes} {d.huespedes === 1 ? "huésped" : "huéspedes"}
            </span>
          </p>
        )}
        {problemaNoches && (
          <p className="mt-2 text-chico text-acento-texto">
            {p.nombre} pide mínimo {problemaNoches.minimo} noches.
          </p>
        )}
      </div>

      <div className={horizontal ? "mt-4 @3xl:mt-0" : "mt-5 border-t-[1.5px] border-dashed border-borde pt-4"}>
        {d.estimado ? (
          <dl className="space-y-1 text-chico">
            <div className="flex justify-between gap-4">
              <dt className="text-tinta-suave">
                {d.estimado.noches} × {formatearPesos(p.precioNoche ?? 0)}
              </dt>
              <dd className="font-display text-subtitulo tabular-nums">{formatearPesos(d.estimado.total)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tinta-suave">Seña ({p.reglas.senaPorcentaje} %)</dt>
              <dd className="tabular-nums">{formatearPesos(d.estimado.sena)}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-chico text-tinta-suave">
            {p.precioNoche === null ? "Precio a consultar." : `Desde ${formatearPesos(p.precioNoche)} la noche · mínimo ${p.minNoches} noches.`}
          </p>
        )}
        <p className="mt-2 text-mini text-tinta-suave">Estimado orientativo. Precio y disponibilidad final te los confirmamos por WhatsApp.</p>
      </div>

      <div className={horizontal ? "mt-4 @3xl:mt-0 @3xl:w-64" : "mt-5"}>
        <label htmlFor={idNombre} className="text-chico font-semibold">
          Tu nombre <span className="font-normal text-tinta-suave">(opcional)</span>
        </label>
        <input
          id={idNombre}
          value={d.nombre}
          onChange={(e) => d.setNombre(e.target.value)}
          autoComplete="name"
          className="mt-1 block w-full rounded-control border-[1.5px] border-borde bg-fondo px-4 py-2.5"
        />
        <button type="button" onClick={consultar} disabled={!d.lista || d.enviando} className={`${boton.primario} mt-3 w-full`}>
          <IconoWhatsApp className="size-5" />
          Consultar por WhatsApp
        </button>
        {d.resultado && (
          <p role="status" className="mt-2 text-mini">
            ¿No se abrió WhatsApp?{" "}
            <a href={d.resultado.linkWhatsApp} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Tocá acá
            </a>
            .
          </p>
        )}
        {d.rango.desde && (
          <button type="button" onClick={d.limpiar} className="mt-2 w-full py-2 text-mini text-tinta-suave underline underline-offset-2">
            Borrar fechas
          </button>
        )}
      </div>
    </div>
  );
}
