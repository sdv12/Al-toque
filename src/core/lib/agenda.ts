import { addMinutes } from "date-fns";
import type { Agenda } from "../schema/comun";
import type { Profesional, Servicio } from "../schema/contenido";
import { diaSemana, instante, sumarDias, type FechaISO } from "./fechas";

type Franja = { desde: string; hasta: string };

/** Si el negocio no cargó agenda: lunes a viernes 9–18, sábados 9–13. */
export const AGENDA_POR_DEFECTO: Agenda = {
  dias: [
    ...[1, 2, 3, 4, 5].map((dia) => ({ dia, franjas: [{ desde: "09:00", hasta: "18:00" }] })),
    { dia: 6, franjas: [{ desde: "09:00", hasta: "13:00" }] },
  ],
  intervaloMin: 30,
  anticipacionMinHoras: 2,
  diasHaciaAdelante: 21,
};

/** Franjas de un día: las del profesional si tiene agenda propia, si no las del negocio. */
export function franjasDelDia(agenda: Agenda, profesional: Profesional | undefined, fecha: FechaISO): Franja[] {
  const dias = profesional?.agenda?.dias ?? agenda.dias;
  const dia = diaSemana(fecha);
  return dias.find((d) => d.dia === dia)?.franjas ?? [];
}

/** Profesionales que pueden hacer un servicio (todos si el servicio no restringe). */
export function profesionalesPara(servicio: Servicio | undefined, equipo: readonly Profesional[]): Profesional[] {
  if (!servicio?.profesionalIds?.length) return [...equipo];
  const ids = new Set(servicio.profesionalIds);
  return equipo.filter((p) => ids.has(p.id));
}

export function serviciosPara(profesionalId: string | undefined, servicios: readonly Servicio[]): Servicio[] {
  if (!profesionalId) return [...servicios];
  return servicios.filter((s) => !s.profesionalIds?.length || s.profesionalIds.includes(profesionalId));
}

/**
 * Días (desde `desde`, inclusive) en los que atiende alguno de los profesionales dados.
 * Con lista vacía se usa la agenda del negocio.
 */
export function diasConAtencion(opciones: {
  agenda: Agenda;
  profesionales: readonly Profesional[];
  desde: FechaISO;
  cantidad?: number;
}): FechaISO[] {
  const { agenda, profesionales, desde } = opciones;
  const cantidad = opciones.cantidad ?? agenda.diasHaciaAdelante;
  const quienes: (Profesional | undefined)[] = profesionales.length ? [...profesionales] : [undefined];
  const dias: FechaISO[] = [];
  for (let i = 0; i < cantidad; i++) {
    const fecha = sumarDias(desde, i);
    if (quienes.some((p) => franjasDelDia(agenda, p, fecha).length > 0)) dias.push(fecha);
  }
  return dias;
}

/**
 * Horarios de inicio posibles para un servicio en una fecha: cada `intervaloMin` dentro de las
 * franjas, donde el servicio entra completo y respetando la anticipación mínima.
 */
export function iniciosDelDia(opciones: {
  agenda: Agenda;
  profesional?: Profesional;
  fecha: FechaISO;
  duracionMin: number;
  ahora: Date;
}): Date[] {
  const { agenda, profesional, fecha, duracionMin, ahora } = opciones;
  const limite = addMinutes(ahora, agenda.anticipacionMinHoras * 60);
  const inicios: Date[] = [];
  for (const franja of franjasDelDia(agenda, profesional, fecha)) {
    const fin = instante(fecha, franja.hasta);
    for (let t: Date = instante(fecha, franja.desde); addMinutes(t, duracionMin) <= fin; t = addMinutes(t, agenda.intervaloMin)) {
      if (t >= limite) inicios.push(t);
    }
  }
  return inicios;
}
