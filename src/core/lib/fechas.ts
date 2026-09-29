import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/** Todo el kit razona en hora de Córdoba, sin importar la zona del navegador o del servidor. */
export const ZONA = "America/Argentina/Cordoba";

/** "yyyy-MM-dd" (fecha de calendario, sin hora). */
export type FechaISO = string;

const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const HORA = /^(\d{2}):(\d{2})$/;

export function enCordoba(fecha: Date | number | string): TZDate {
  return new TZDate(new Date(fecha).getTime(), ZONA);
}

export function fechaISO(fecha: Date | number): FechaISO {
  return format(enCordoba(fecha), "yyyy-MM-dd");
}

export function hoyISO(ahora: Date = new Date()): FechaISO {
  return fechaISO(ahora);
}

export function parseFecha(fecha: FechaISO): TZDate {
  const m = FECHA.exec(fecha);
  if (!m) throw new Error(`Fecha inválida: ${fecha}`);
  return new TZDate(Number(m[1]), Number(m[2]) - 1, Number(m[3]), ZONA);
}

/** Instante en Córdoba para una fecha y hora "HH:mm". */
export function instante(fecha: FechaISO, hora: string): TZDate {
  const f = FECHA.exec(fecha);
  const h = HORA.exec(hora);
  if (!f || !h) throw new Error(`Fecha u hora inválida: ${fecha} ${hora}`);
  return new TZDate(Number(f[1]), Number(f[2]) - 1, Number(f[3]), Number(h[1]), Number(h[2]), ZONA);
}

/*
 * Aritmética de fechas de calendario: una fecha "yyyy-MM-dd" no tiene zona horaria, así que se
 * calcula en UTC puro (rápido: sin Intl). La zona de Córdoba solo importa para instantes.
 */
const DIA_MS = 86_400_000;

function aUTC(fecha: FechaISO): number {
  const m = FECHA.exec(fecha);
  if (!m) throw new Error(`Fecha inválida: ${fecha}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function deUTC(ms: number): FechaISO {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** 0 = domingo … 6 = sábado. */
export function diaSemana(fecha: FechaISO): number {
  return new Date(aUTC(fecha)).getUTCDay();
}

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  return deUTC(aUTC(fecha) + dias * DIA_MS);
}

export function diasEntre(desde: FechaISO, hasta: FechaISO): number {
  return Math.round((aUTC(hasta) - aUTC(desde)) / DIA_MS);
}

/** Date local con ese día de calendario (mediodía): sirve para formatear sin corrimientos. */
function fechaLocal(fecha: FechaISO): Date {
  const m = FECHA.exec(fecha)!;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
}

/** ISO con offset de Córdoba: "2026-09-30T10:00:00.000-03:00". */
export function instanteISO(fecha: Date): string {
  return enCordoba(fecha).toISOString();
}

export function horaDe(instanteIso: string): string {
  return format(enCordoba(instanteIso), "HH:mm");
}

export function etiquetaDia(fecha: FechaISO) {
  const d = fechaLocal(fecha);
  return {
    semanaCorta: format(d, "EEE", { locale: es }).replace(".", ""),
    numero: format(d, "d"),
    mesCorto: format(d, "MMM", { locale: es }).replace(".", ""),
    larga: format(d, "EEEE d 'de' MMMM", { locale: es }),
  };
}
