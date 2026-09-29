"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { etiquetaDia, horaDe } from "@/core/lib/fechas";
import { fechaHoraLegible, formatearDuracion, formatearPrecio } from "@/core/lib/mensajes";
import { CUALQUIERA, type PasoReserva } from "@/core/lib/reserva";
import type { Servicio } from "@/core/schema/contenido";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { boton } from "../estilos";
import { ID_TURNOS, useTurnos } from "./TurnosContext";

type Etapa = { id: "servicio" | "profesional" | "fecha" | "datos"; texto: string; pasos: PasoReserva[] };

const ETAPAS: Etapa[] = [
  { id: "servicio", texto: "Prestación", pasos: ["servicio"] },
  { id: "profesional", texto: "Profesional", pasos: ["profesional"] },
  { id: "fecha", texto: "Día y hora", pasos: ["dia", "horario"] },
  { id: "datos", texto: "Tus datos", pasos: ["datos"] },
];

const MODALIDAD: Record<NonNullable<Servicio["modalidad"]>, string> = {
  presencial: "Presencial",
  virtual: "Por videollamada",
  ambas: "Presencial o virtual",
};
const COBERTURA: Record<NonNullable<Servicio["cobertura"]>, string> = {
  particular: "Solo particular",
  "obra-social": "Con obra social",
  ambas: "Particular u obra social",
};

export function detalleServicio(s: Servicio): string {
  return [formatearDuracion(s.duracionMin), s.modalidad && MODALIDAD[s.modalidad], s.cobertura && COBERTURA[s.cobertura]].filter(Boolean).join(" · ");
}

/**
 * Widget de turnos de la portada: visible sin scrollear, en pasos cortos.
 * "Día y hora" comparte pantalla: al tocar un día aparecen sus horarios debajo.
 */
export function WidgetTurnos({ obrasSociales, ancho = false }: { obrasSociales: readonly string[]; ancho?: boolean }) {
  const b = useTurnos();
  const tituloPaso = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);
  const [cobertura, setCobertura] = useState("Particular");
  const idCobertura = useId();
  const idNombre = useId();

  const etapas = ETAPAS.filter((e) => e.pasos.some((p) => b.estado.orden.includes(p)));
  const etapaActual = etapas.findIndex((e) => e.pasos.includes(b.paso));

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    tituloPaso.current?.focus({ preventScroll: true });
  }, [etapaActual, b.resultado]);

  const titulo =
    b.paso === "servicio"
      ? "¿Qué necesitás?"
      : b.paso === "profesional"
        ? "¿Con quién?"
        : b.paso === "datos"
          ? "Tus datos"
          : "¿Qué día y a qué hora?";

  return (
    <div id={ID_TURNOS} className="scroll-mt-24 rounded-base border border-borde bg-superficie shadow-[0_1px_2px_rgb(21_34_45/0.06),0_12px_32px_-16px_rgb(21_34_45/0.18)]">
      <div className="border-b border-borde px-5 pt-5 @xl:px-6">
        <h2 className="text-subtitulo font-bold">Pedí tu turno</h2>
        {!b.resultado && (
          <ol className="mt-3 flex gap-1" aria-label="Pasos">
            {etapas.map((e, i) => {
              const hecha = i < etapaActual;
              const actual = i === etapaActual;
              return (
                <li key={e.id} className="min-w-0 flex-1" aria-current={actual ? "step" : undefined}>
                  {hecha ? (
                    <button type="button" onClick={() => b.irA(e.pasos[0]!)} className="group block w-full pb-3 text-left">
                      <span className="block h-1 rounded-full bg-acento-relleno" />
                      <span className="mt-2 block truncate text-mini text-tinta-suave group-hover:text-tinta">
                        {e.texto}
                        <span className="sr-only"> (listo, volver a cambiar)</span>
                      </span>
                    </button>
                  ) : (
                    <span className="block pb-3">
                      <span className={`block h-1 rounded-full ${actual ? "bg-acento-relleno" : "bg-borde"}`} />
                      <span className={`mt-2 block truncate text-mini ${actual ? "font-semibold text-tinta" : "text-tinta-suave"}`}>{e.texto}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {b.resultado && b.servicio && b.estado.slot ? (
        <div className="px-5 py-6 @xl:px-6">
          <h3 ref={tituloPaso} tabIndex={-1} data-titulo-paso className="text-titulo font-bold focus:outline-none">
            Falta confirmarlo
          </h3>
          <dl className="mt-4 space-y-1 text-cuerpo">
            <div>
              <dt className="sr-only">Prestación</dt>
              <dd className="font-semibold">{b.servicio.nombre}</dd>
            </div>
            <div>
              <dt className="sr-only">Cuándo</dt>
              <dd>{fechaHoraLegible(b.estado.slot.inicio)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-chico text-tinta-suave">El turno queda confirmado cuando te respondemos por WhatsApp. Mandanos el mensaje; te contestamos en horario de atención.</p>
          <div className="mt-6 flex flex-col gap-2 @md:flex-row">
            <a href={b.resultado.linkWhatsApp} target="_blank" rel="noopener noreferrer" className={boton.primario}>
              <IconoWhatsApp className="size-5" /> Confirmar por WhatsApp
            </a>
            <button type="button" onClick={b.reiniciar} className={boton.secundario}>
              Pedir otro turno
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (b.esUltimo) void b.confirmar({ extras: [`Cobertura: ${cobertura}`] });
            else b.avanzar();
          }}
        >
          <div className="px-5 py-5 @xl:px-6">
            <h3 ref={tituloPaso} tabIndex={-1} data-titulo-paso className="text-cuerpo font-bold focus:outline-none">
              {titulo}
            </h3>
            <div className={`mt-3 ${ancho ? "" : "max-h-[22rem] overflow-y-auto overscroll-contain"}`}>
              {b.paso === "servicio" && (
                <Grupo leyenda="Prestación">
                  {b.servicios.map((s) => (
                    <Opcion key={s.id} name="servicio" value={s.id} checked={b.estado.servicioId === s.id} onElegir={b.elegirServicio}>
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{s.nombre}</span>
                        <span className="shrink-0 text-chico tabular-nums">{formatearPrecio(s)}</span>
                      </span>
                      <span className="block text-mini text-tinta-suave">{detalleServicio(s)}</span>
                    </Opcion>
                  ))}
                </Grupo>
              )}

              {b.paso === "profesional" && (
                <Grupo leyenda="Profesional">
                  <Opcion name="profesional" value={CUALQUIERA} checked={b.estado.profesionalId === CUALQUIERA} onElegir={b.elegirProfesional}>
                    <span className="font-semibold">Primer turno disponible</span>
                    <span className="block text-mini text-tinta-suave">Con cualquiera de los profesionales que la hacen</span>
                  </Opcion>
                  {b.profesionales.map((p) => (
                    <Opcion key={p.id} name="profesional" value={p.id} checked={b.estado.profesionalId === p.id} onElegir={b.elegirProfesional}>
                      <span className="font-semibold">{p.nombre}</span>
                      <span className="block text-mini text-tinta-suave">
                        {p.especialidad}
                        {p.matricula && ` · ${p.matricula}`}
                      </span>
                    </Opcion>
                  ))}
                </Grupo>
              )}

              {(b.paso === "dia" || b.paso === "horario") && <DiaYHora />}

              {b.paso === "datos" && (
                <div className="space-y-4">
                  {b.servicio && b.estado.slot && (
                    <p className="rounded-base bg-fondo px-4 py-3 text-chico">
                      <span className="font-semibold">{b.servicio.nombre}</span>
                      {b.profesional && ` con ${b.profesional.nombre}`}
                      <br />
                      {fechaHoraLegible(b.estado.slot.inicio)}
                    </p>
                  )}
                  <div>
                    <label htmlFor={idNombre} className="text-chico font-semibold">
                      Nombre y apellido
                    </label>
                    <input
                      id={idNombre}
                      value={b.estado.nombre}
                      onChange={(e) => b.setNombre(e.target.value)}
                      autoComplete="name"
                      required
                      minLength={2}
                      className="mt-1 block w-full rounded-control border border-borde bg-superficie px-3 py-2.5"
                    />
                  </div>
                  <div>
                    <label htmlFor={idCobertura} className="text-chico font-semibold">
                      Cobertura
                    </label>
                    <select
                      id={idCobertura}
                      value={cobertura}
                      onChange={(e) => setCobertura(e.target.value)}
                      className="mt-1 block w-full rounded-control border border-borde bg-superficie px-3 py-2.5"
                    >
                      <option>Particular</option>
                      {b.servicio?.cobertura !== "particular" && obrasSociales.map((o) => <option key={o}>{o}</option>)}
                      {b.servicio?.cobertura !== "particular" && <option value="Otra obra social (la aclaro)">Otra obra social</option>}
                    </select>
                    {b.servicio?.cobertura === "particular" && <p className="mt-1 text-mini text-tinta-suave">Esta prestación es solo particular.</p>}
                  </div>
                  <div>
                    <label className="text-chico font-semibold">
                      Motivo o aclaración <span className="font-normal text-tinta-suave">(opcional)</span>
                      <textarea
                        value={b.estado.nota}
                        onChange={(e) => b.setNota(e.target.value)}
                        rows={2}
                        className="mt-1 block w-full rounded-control border border-borde bg-superficie px-3 py-2.5 font-normal"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
            {b.error && (
              <p role="alert" className="mt-3 rounded-base bg-fondo px-3 py-2 text-chico">
                {b.error}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-borde px-5 py-4 @xl:px-6">
            {b.indice > 0 ? (
              <button
                type="button"
                // "Día y hora" es una sola pantalla: desde el horario, volver salta el paso del día.
                onClick={() => (b.paso === "horario" ? b.irA(b.estado.orden[b.estado.orden.indexOf("dia") - 1] ?? "dia") : b.retroceder())}
                className="min-h-11 px-2 text-chico font-semibold text-tinta-suave hover:text-tinta">
                Volver
              </button>
            ) : (
              <span />
            )}
            <button type="submit" disabled={!b.puedeAvanzar || b.enviando} className={boton.primario}>
              {b.esUltimo ? (b.enviando ? "Un momento…" : "Pedir este turno") : "Continuar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function DiaYHora() {
  const b = useTurnos();
  const libres = b.horarios.slots.filter((s) => s.disponible);

  const elegirDia = (fecha: string) => {
    b.elegirFecha(fecha);
    if (b.paso === "dia") b.avanzar();
  };

  if (!b.dias.length) return <p className="text-chico text-tinta-suave">No hay días con turnos en las próximas semanas. Escribinos por WhatsApp.</p>;

  return (
    <div className="space-y-4">
      <Grupo leyenda="Día" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {b.dias.slice(0, 14).map((f) => {
          const e = etiquetaDia(f);
          return (
            <Opcion key={f} name="dia" value={f} checked={b.estado.fecha === f} onElegir={elegirDia} compacta aria-label={e.larga}>
              <span className="block text-mini text-tinta-suave">{e.semanaCorta}</span>
              <span className="block text-subtitulo font-bold leading-tight">{e.numero}</span>
              <span className="block text-mini text-tinta-suave">{e.mesCorto}</span>
            </Opcion>
          );
        })}
      </Grupo>

      {b.estado.fecha && (
        <div aria-live="polite">
          {b.horarios.estado === "cargando" && <p className="text-chico text-tinta-suave">Buscando horarios…</p>}
          {b.horarios.estado === "error" && <p className="text-chico">No pudimos cargar los horarios. Probá de nuevo.</p>}
          {b.horarios.estado === "listo" && !libres.length && <p className="text-chico text-tinta-suave">No quedan turnos ese día. Probá con otro.</p>}
          {b.horarios.estado === "listo" && libres.length > 0 && (
            <Grupo leyenda={`Horarios del ${etiquetaDia(b.estado.fecha).larga}`} leyendaVisible className="grid grid-cols-4 gap-2 @md:grid-cols-5">
              {libres.map((s) => (
                <Opcion key={s.inicio} name="horario" value={s.inicio} checked={b.estado.slot?.inicio === s.inicio} onElegir={() => b.elegirSlot(s)} compacta>
                  <span className="tabular-nums">{horaDe(s.inicio)}</span>
                </Opcion>
              ))}
            </Grupo>
          )}
        </div>
      )}
    </div>
  );
}

function Grupo({ leyenda, leyendaVisible, className = "space-y-2", children }: { leyenda: string; leyendaVisible?: boolean; className?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className={leyendaVisible ? "mb-2 text-chico font-semibold first-letter:uppercase" : "sr-only"}>{leyenda}</legend>
      <div className={className}>{children}</div>
    </fieldset>
  );
}

function Opcion({
  name,
  value,
  checked,
  onElegir,
  compacta,
  children,
  ...resto
}: {
  name: string;
  value: string;
  checked: boolean;
  onElegir: (v: string) => void;
  compacta?: boolean;
  "aria-label"?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block cursor-pointer ${compacta ? "shrink-0" : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onElegir(value)}
        aria-label={resto["aria-label"]}
        className="peer sr-only"
      />
      <span
        className={`block rounded-control border border-borde bg-superficie transition-colors peer-checked:border-acento peer-checked:bg-[color-mix(in_srgb,var(--lk-acento)_8%,var(--lk-superficie))] peer-checked:shadow-[inset_0_0_0_1px_var(--lk-acento)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco hover:border-tinta-suave ${
          compacta ? "min-w-14 px-2 py-2 text-center" : "px-4 py-3"
        }`}
      >
        {children}
      </span>
    </label>
  );
}
