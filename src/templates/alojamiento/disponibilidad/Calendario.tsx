"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { DIAS_SEMANA, mesDe, nombreMes, semanasDelMes, sumarMeses } from "@/core/lib/calendario";
import { diaSemana, etiquetaDia, sumarDias, type FechaISO } from "@/core/lib/fechas";
import { useDisponibilidad } from "./DisponibilidadContext";

const AVISOS = {
  "noches-ocupadas": "Hay noches ocupadas en el medio. Elegí una salida anterior o probá otras fechas.",
  "entrada-ocupada": "Esa noche ya está ocupada. Probá con otro día de entrada.",
} as const;

/**
 * Calendario de rango (entrada → salida) con noches ocupadas.
 * Teclado: flechas mueven de a día/semana, Inicio/Fin al comienzo/fin de la semana,
 * RePág/AvPág cambian de mes, Enter o Espacio eligen.
 */
export function Calendario({ meses }: { meses: 1 | 2 | 3 }) {
  const d = useDisponibilidad();
  const [foco, setFoco] = useState<FechaISO | null>(null);
  const moverFoco = useRef(false);
  const botones = useRef(new Map<FechaISO, HTMLButtonElement>());

  const visibles = Array.from({ length: meses }, (_, i) => sumarMeses(d.mes, i));
  const ultimoVisible = visibles.at(-1)!;
  // Día con tabindex=0: el enfocado, o la entrada elegida, o hoy / el 1 del mes visible.
  const enVista = (f: FechaISO) => mesDe(f) >= d.mes && mesDe(f) <= ultimoVisible;
  const primeroDelMes = `${d.mes}-01` < d.hoy ? d.hoy : `${d.mes}-01`;
  const activo = foco && enVista(foco) ? foco : d.rango.desde && enVista(d.rango.desde) ? d.rango.desde : primeroDelMes;

  useEffect(() => {
    if (!moverFoco.current || !foco) return;
    moverFoco.current = false;
    botones.current.get(foco)?.focus();
  }, [foco, d.mes]);

  function teclas(e: KeyboardEvent<HTMLButtonElement>, dia: FechaISO) {
    const saltos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let destino: FechaISO | null = null;
    if (e.key in saltos) destino = sumarDias(dia, saltos[e.key]!);
    else if (e.key === "Home") destino = sumarDias(dia, -((diaSemana(dia) + 6) % 7));
    else if (e.key === "End") destino = sumarDias(dia, 6 - ((diaSemana(dia) + 6) % 7));
    else if (e.key === "PageUp" || e.key === "PageDown") {
      const mes = sumarMeses(mesDe(dia), e.key === "PageUp" ? -1 : 1);
      destino = `${mes}-${dia.slice(8, 10)}`;
      if (mesDe(destino) !== mes) destino = sumarDias(`${sumarMeses(mes, 1)}-01`, -1); // 31 → fin de mes
    } else return;

    e.preventDefault();
    if (destino < d.hoy) destino = d.hoy;
    if (mesDe(destino) < d.mes) d.irAMes(mesDe(destino));
    else if (mesDe(destino) > ultimoVisible) d.irAMes(sumarMeses(mesDe(destino), -(meses - 1)));
    moverFoco.current = true;
    setFoco(destino);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={d.mesAnterior}
          disabled={!d.puedeRetroceder}
          className="grid size-11 place-items-center rounded-control border-[1.5px] border-borde text-tinta hover:border-tinta disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <span aria-hidden>‹</span>
        </button>
        <p aria-live="polite" className="text-chico text-tinta-suave">
          {d.cargando ? "Cargando disponibilidad…" : d.propiedad ? `Disponibilidad de ${d.propiedad.nombre}` : ""}
        </p>
        <button
          type="button"
          onClick={d.mesSiguiente}
          disabled={!d.puedeAvanzar}
          className="grid size-11 place-items-center rounded-control border-[1.5px] border-borde text-tinta hover:border-tinta disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <span aria-hidden>›</span>
        </button>
      </div>

      <div className="mt-4 grid gap-8 @3xl:grid-cols-2 @6xl:grid-cols-3">
        {visibles.map((mes, i) => (
          <Mes
            key={mes}
            mes={mes}
            className={i === 1 ? "hidden @3xl:block" : i === 2 ? "hidden @6xl:block" : ""}
            activo={activo}
            onTecla={teclas}
            onFoco={setFoco}
            registrar={(dia, el) => {
              if (el) botones.current.set(dia, el);
              else botones.current.delete(dia);
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-mini text-tinta-suave" aria-hidden>
        <span className="flex items-center gap-2">
          <span className="size-4 rounded-full border-[1.5px] border-borde" /> Libre
        </span>
        <span className="flex items-center gap-2">
          <span className="size-4 rounded-full [background:repeating-linear-gradient(135deg,var(--lk-borde)_0_2px,transparent_2px_5px)]" /> Ocupado
        </span>
        <span className="flex items-center gap-2">
          <span className="size-4 rounded-full bg-acento-relleno" /> Tu estadía
        </span>
      </div>

      <p role="status" className="mt-3 min-h-6 text-chico">
        {d.aviso ? AVISOS[d.aviso] : ""}
      </p>
    </div>
  );
}

function Mes({
  mes,
  className,
  activo,
  onTecla,
  onFoco,
  registrar,
}: {
  mes: string;
  className: string;
  activo: FechaISO;
  onTecla: (e: KeyboardEvent<HTMLButtonElement>, dia: FechaISO) => void;
  onFoco: (dia: FechaISO) => void;
  registrar: (dia: FechaISO, el: HTMLButtonElement | null) => void;
}) {
  const d = useDisponibilidad();
  const idTitulo = `mes-${mes}`;
  return (
    <div className={className}>
      <h3 id={idTitulo} className="mb-3 text-center font-display text-subtitulo capitalize">
        {nombreMes(mes)}
      </h3>
      <table role="grid" aria-labelledby={idTitulo} className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {DIAS_SEMANA.map((s) => (
              <th key={s.corto} scope="col" abbr={s.largo} className="pb-2 text-center text-mini font-normal text-tinta-suave">
                {s.corto}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanasDelMes(mes).map((semana, i) => (
            <tr key={i}>
              {semana.map((dia, j) =>
                dia ? (
                  <Dia key={dia} dia={dia} activo={activo === dia} onTecla={onTecla} onFoco={onFoco} registrar={registrar} estado={d.estadoDia(dia)} rangoCompleto={!!d.rango.hasta} onElegir={d.elegirDia} />
                ) : (
                  <td key={`v${j}`} />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dia({
  dia,
  activo,
  estado,
  rangoCompleto,
  onElegir,
  onTecla,
  onFoco,
  registrar,
}: {
  dia: FechaISO;
  activo: boolean;
  estado: ReturnType<ReturnType<typeof useDisponibilidad>["estadoDia"]>;
  rangoCompleto: boolean;
  onElegir: (dia: FechaISO) => void;
  onTecla: (e: KeyboardEvent<HTMLButtonElement>, dia: FechaISO) => void;
  onFoco: (dia: FechaISO) => void;
  registrar: (dia: FechaISO, el: HTMLButtonElement | null) => void;
}) {
  const { pasado, ocupado, esEntrada, esSalida, enRango, elegible } = estado;
  const extremo = esEntrada || esSalida;
  const detalle = [esEntrada && "entrada", esSalida && "salida", enRango && "dentro de tu estadía", ocupado && !esSalida && "ocupado", pasado && "no disponible"]
    .filter(Boolean)
    .join(", ");

  // Banda del rango: llena las noches intermedias y media celda en entrada y salida.
  const banda = "bg-[color-mix(in_srgb,var(--lk-acento)_18%,transparent)]";
  const mediaBanda = (esEntrada && rangoCompleto) || esSalida;

  return (
    <td role="gridcell" aria-selected={extremo || enRango} className={`relative p-0 py-0.5 ${enRango ? banda : ""}`}>
      {mediaBanda && <span aria-hidden className={`absolute inset-y-0.5 w-1/2 ${banda} ${esEntrada ? "right-0" : "left-0"}`} />}
      <button
        ref={(el) => registrar(dia, el)}
        type="button"
        tabIndex={activo ? 0 : -1}
        aria-label={`${etiquetaDia(dia).larga}${detalle ? `, ${detalle}` : ""}`}
        aria-disabled={!elegible || undefined}
        onClick={() => elegible && onElegir(dia)}
        onKeyDown={(e) => onTecla(e, dia)}
        onFocus={() => onFoco(dia)}
        className={`relative mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-full text-chico tabular-nums transition-colors focus-visible:outline-offset-1 ${
          extremo
            ? "bg-acento-relleno font-semibold text-sobre-acento"
            : pasado
              ? "text-tinta-suave/60"
              : ocupado
                ? "text-tinta-suave line-through decoration-1 [background:repeating-linear-gradient(135deg,var(--lk-borde)_0_2px,transparent_2px_5px)]"
                : elegible
                  ? "hover:bg-superficie-2"
                  : "text-tinta-suave"
        } ${elegible ? "cursor-pointer" : "cursor-default"}`}
      >
        {Number(dia.slice(8, 10))}
      </button>
    </td>
  );
}
