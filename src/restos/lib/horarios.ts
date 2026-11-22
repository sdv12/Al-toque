/*
 * Horarios configurables: franjas por día de la semana, días cerrados puntuales, horarios para
 * reservar y para retirar, "abierto ahora" y el resumen que se muestra en la web. Todo puro (sin
 * React) para poder probarlo. Las franjas pueden cruzar la medianoche (bar de 19:00 a 03:00).
 */
import type { Franja, Horarios, Local } from "./tipos";
import { aHora, aMin, diaSemana, HORA_VALIDA, hoyISO, minutosDelDia, sumarDias } from "./util";

export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] as const;
/** La semana como se lee en Argentina: de lunes a domingo. */
export const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0] as const;

export function franjasDel(h: Horarios, iso: string): Franja[] {
  if (h.cerrados.some((c) => c.fecha === iso)) return [];
  return h.semana[diaSemana(iso)] ?? [];
}

export const abreEse = (h: Horarios, iso: string) => franjasDel(h, iso).length > 0;

export const motivoCerrado = (h: Horarios, iso: string) => h.cerrados.find((c) => c.fecha === iso)?.motivo ?? "";

/** Inicio y fin en minutos; si cierra después de medianoche, el fin pasa de 1440. */
export function rango(f: Franja) {
  const ini = aMin(f.desde);
  let fin = aMin(f.hasta);
  if (fin <= ini) fin += 1440;
  return { ini, fin };
}

/** ¿En qué franja del día cae esta hora? -1 si ese día no abre. */
export function franjaDeHora(h: Horarios, iso: string, hora: string): number {
  const franjas = franjasDel(h, iso);
  if (!franjas.length) return -1;
  const m = aMin(hora);
  const i = franjas.findIndex((f) => {
    const r = rango(f);
    return (m >= r.ini && m < r.fin) || (m + 1440 >= r.ini && m + 1440 < r.fin);
  });
  if (i >= 0) return i;
  // Fuera de horario (una reserva cargada a mano): la franja más cercana que ya empezó.
  let mejor = 0;
  franjas.forEach((f, j) => {
    if (rango(f).ini <= m) mejor = j;
  });
  return mejor;
}

/** ¿Ese día o esa franja no toma reservas por la web (evento privado, salón completo)? */
export function bloqueo(local: Local, iso: string, nombreFranja: string) {
  return (local.bloqueos ?? []).find((b) => b.fecha === iso && (!b.franja || b.franja === nombreFranja));
}

/** Horarios para reservar en una franja. Si es hoy, solo los que todavía no pasaron. */
export function horasReserva(local: Local, iso: string, franja: number, ahora: Date): string[] {
  const f = franjasDel(local.horarios, iso)[franja];
  if (!f || bloqueo(local, iso, f.nombre)) return [];
  const { ini, fin } = rango(f);
  const paso = local.reservas.intervalo;
  const ultimo = Math.max(ini, fin - local.reservas.margenCierre);
  const esHoy = iso === hoyISO(ahora);
  const desde = esHoy ? minutosDelDia(ahora) : -1;
  const out: string[] = [];
  for (let m = ini; m <= ultimo; m += paso) if (m > desde) out.push(aHora(m));
  return out;
}

/** Días que se pueden reservar, desde hoy. */
export function diasReservables(local: Local, ahora: Date): string[] {
  const hoy = hoyISO(ahora);
  const out: string[] = [];
  for (let i = 0; i <= local.reservas.diasAnticipacion; i++) {
    const f = sumarDias(hoy, i);
    if (franjasDel(local.horarios, f).some((fr) => !bloqueo(local, f, fr.nombre))) out.push(f);
  }
  return out;
}

export type EstadoAhora =
  | { abierto: true; franja: string; cierra: string }
  | { abierto: false; proximo: { iso: string; desde: string; franja: string } | null };

/** ¿Está abierto ahora? Si no, cuándo abre. Tiene en cuenta la franja de ayer que cruzó la medianoche. */
export function estadoAhora(h: Horarios, ahora: Date): EstadoAhora {
  const hoy = hoyISO(ahora);
  const m = minutosDelDia(ahora);
  for (const f of franjasDel(h, sumarDias(hoy, -1))) {
    const r = rango(f);
    if (r.fin > 1440 && m + 1440 < r.fin) return { abierto: true, franja: f.nombre, cierra: f.hasta };
  }
  for (const f of franjasDel(h, hoy)) {
    const r = rango(f);
    if (m >= r.ini && m < r.fin) return { abierto: true, franja: f.nombre, cierra: f.hasta };
  }
  for (let i = 0; i < 15; i++) {
    const iso = sumarDias(hoy, i);
    const f = franjasDel(h, iso).find((x) => i > 0 || rango(x).ini > m);
    if (f) return { abierto: false, proximo: { iso, desde: f.desde, franja: f.nombre } };
  }
  return { abierto: false, proximo: null };
}

/** Horarios para retirar o recibir un pedido hoy: cada 15 minutos desde ahora + demora hasta 15 antes del cierre. */
export function horariosPedido(h: Horarios, ahora: Date, demora: number): string[] {
  const hoy = hoyISO(ahora);
  const desde = minutosDelDia(ahora) + demora;
  const out: string[] = [];
  const sumar = (ini: number, fin: number) => {
    const primero = Math.ceil(Math.max(ini, desde) / 15) * 15;
    for (let m = primero; m <= fin - 15; m += 15) out.push(aHora(m));
  };
  for (const f of franjasDel(h, sumarDias(hoy, -1))) {
    const r = rango(f);
    if (r.fin > 1440) sumar(0, r.fin - 1440);
  }
  for (const f of franjasDel(h, hoy)) {
    const r = rango(f);
    sumar(r.ini, r.fin);
  }
  return [...new Set(out)];
}

const textoFranjas = (fs: Franja[]) => fs.map((f) => `${f.desde} a ${f.hasta}`).join(" y ");

/** "Mar a dom: 12:30 a 15:30 y 20:30 a 00:30" · "Lun: cerrado". Agrupa días seguidos con el mismo horario. */
export function resumenHorarios(h: Horarios): { dias: string; texto: string }[] {
  const grupos: { desde: number; hasta: number; texto: string }[] = [];
  for (const d of ORDEN_SEMANA) {
    const texto = (h.semana[d] ?? []).length ? textoFranjas(h.semana[d] ?? []) : "Cerrado";
    const ult = grupos[grupos.length - 1];
    if (ult && ult.texto === texto) ult.hasta = d;
    else grupos.push({ desde: d, hasta: d, texto });
  }
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return grupos.map((g) => {
    const a = DIAS_CORTOS[g.desde] ?? "";
    const b = DIAS_CORTOS[g.hasta] ?? "";
    const pares = ORDEN_SEMANA.indexOf(g.hasta as never) - ORDEN_SEMANA.indexOf(g.desde as never);
    const dias = g.desde === g.hasta ? cap(a) : pares === 1 ? `${cap(a)} y ${b}` : `${cap(a)} a ${b}`;
    return { dias, texto: g.texto };
  });
}

/** Problemas de una franja, en castellano; vacío si está bien. */
export function erroresFranja(f: Franja): string[] {
  const e: string[] = [];
  if (!f.nombre.trim()) e.push("Ponele un nombre (Mediodía, Noche…).");
  if (!HORA_VALIDA.test(f.desde) || !HORA_VALIDA.test(f.hasta)) e.push("Las horas van como 20:30.");
  else if (f.desde === f.hasta) e.push("Abre y cierra a la misma hora.");
  return e;
}

/** Problemas de un día completo: franjas que se pisan. */
export function erroresDia(fs: Franja[]): string[] {
  const e = fs.flatMap(erroresFranja);
  if (e.length) return e;
  const rs = fs.map(rango).sort((a, b) => a.ini - b.ini);
  for (let i = 1; i < rs.length; i++) {
    const prev = rs[i - 1];
    const act = rs[i];
    if (prev && act && act.ini < prev.fin) return ["Hay dos franjas que se pisan."];
  }
  return [];
}
