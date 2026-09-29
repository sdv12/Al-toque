import type { Propiedad } from "../schema/contenido";
import { diasEntre, sumarDias, type FechaISO } from "./fechas";

/**
 * Estadías por noches. Un día bloqueado = esa noche está ocupada. Se puede salir (check-out)
 * un día bloqueado, pero no entrar ni pasar la noche en uno.
 */
export type Rango = { desde: FechaISO | null; hasta: FechaISO | null };

export const RANGO_VACIO: Rango = { desde: null, hasta: null };

export type AvisoRango = "noches-ocupadas" | "entrada-ocupada";

export function noches(rango: Rango): number {
  return rango.desde && rango.hasta ? diasEntre(rango.desde, rango.hasta) : 0;
}

/** Noches del rango [desde, hasta): cada fecha es una noche. */
export function nochesDelRango(desde: FechaISO, hasta: FechaISO): FechaISO[] {
  const lista: FechaISO[] = [];
  for (let f = desde; f < hasta; f = sumarDias(f, 1)) lista.push(f);
  return lista;
}

export function rangoLibre(desde: FechaISO, hasta: FechaISO, bloqueados: ReadonlySet<FechaISO>): boolean {
  return nochesDelRango(desde, hasta).every((f) => !bloqueados.has(f));
}

/**
 * Qué pasa al tocar un día:
 * - sin entrada (o con rango completo) → ese día es la nueva entrada;
 * - con entrada y un día posterior → es la salida, si no hay noches ocupadas en el medio;
 * - un día anterior o igual a la entrada → pasa a ser la entrada.
 */
export function elegirDia(
  rango: Rango,
  dia: FechaISO,
  bloqueados: ReadonlySet<FechaISO>,
): { rango: Rango; aviso?: AvisoRango } {
  const empezar = (): { rango: Rango; aviso?: AvisoRango } =>
    bloqueados.has(dia) ? { rango: RANGO_VACIO, aviso: "entrada-ocupada" } : { rango: { desde: dia, hasta: null } };

  if (!rango.desde || rango.hasta) return empezar();
  if (dia <= rango.desde) return empezar();
  if (!rangoLibre(rango.desde, dia, bloqueados)) return { rango, aviso: "noches-ocupadas" };
  return { rango: { desde: rango.desde, hasta: dia } };
}

/** Días que se pueden elegir como salida desde una entrada dada (hasta la primera noche ocupada). */
export function salidaPosible(desde: FechaISO, dia: FechaISO, bloqueados: ReadonlySet<FechaISO>): boolean {
  return dia > desde && rangoLibre(desde, dia, bloqueados);
}

export type ProblemaEstadia =
  | { tipo: "faltan-fechas" }
  | { tipo: "min-noches"; minimo: number }
  | { tipo: "capacidad"; maximo: number };

export function maxHuespedes(propiedad: Pick<Propiedad, "capacidad" | "maxHuespedes">): number {
  return propiedad.maxHuespedes ?? propiedad.capacidad;
}

export function problemasEstadia(
  propiedad: Pick<Propiedad, "minNoches" | "capacidad" | "maxHuespedes">,
  rango: Rango,
  huespedes: number,
): ProblemaEstadia[] {
  const problemas: ProblemaEstadia[] = [];
  if (!rango.desde || !rango.hasta) problemas.push({ tipo: "faltan-fechas" });
  else if (noches(rango) < propiedad.minNoches) problemas.push({ tipo: "min-noches", minimo: propiedad.minNoches });
  if (huespedes > maxHuespedes(propiedad)) problemas.push({ tipo: "capacidad", maximo: maxHuespedes(propiedad) });
  return problemas;
}

export type Estimado = { noches: number; total: number; sena: number } | null;

/** Estimado orientativo: noches × precio por noche, y la seña según el porcentaje de la casa. */
export function estimar(propiedad: Pick<Propiedad, "precioNoche" | "reglas">, rango: Rango): Estimado {
  const n = noches(rango);
  if (n <= 0 || propiedad.precioNoche === null) return null;
  const total = n * propiedad.precioNoche;
  return { noches: n, total, sena: Math.round((total * propiedad.reglas.senaPorcentaje) / 100) };
}
