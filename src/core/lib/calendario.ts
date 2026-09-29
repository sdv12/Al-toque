import { addMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { parseFecha, sumarDias, type FechaISO } from "./fechas";

/** Mes como "yyyy-MM". */
export type MesISO = string;

export function mesDe(fecha: FechaISO): MesISO {
  return fecha.slice(0, 7);
}

export function sumarMeses(mes: MesISO, cantidad: number): MesISO {
  return format(addMonths(parseFecha(`${mes}-01`), cantidad), "yyyy-MM");
}

export function nombreMes(mes: MesISO): string {
  return format(parseFecha(`${mes}-01`), "MMMM yyyy", { locale: es });
}

/** Días de la semana abreviados, empezando el lunes. */
export const DIAS_SEMANA = [
  { corto: "lu", largo: "lunes" },
  { corto: "ma", largo: "martes" },
  { corto: "mi", largo: "miércoles" },
  { corto: "ju", largo: "jueves" },
  { corto: "vi", largo: "viernes" },
  { corto: "sá", largo: "sábado" },
  { corto: "do", largo: "domingo" },
] as const;

/** Semanas del mes (lunes a domingo); los huecos fuera del mes son null. */
export function semanasDelMes(mes: MesISO): (FechaISO | null)[][] {
  const primero = `${mes}-01`;
  const desplazamiento = (parseFecha(primero).getDay() + 6) % 7; // lunes = 0
  const semanas: (FechaISO | null)[][] = [];
  let semana: (FechaISO | null)[] = Array.from({ length: desplazamiento }, () => null);
  for (let f = primero; mesDe(f) === mes; f = sumarDias(f, 1)) {
    semana.push(f);
    if (semana.length === 7) {
      semanas.push(semana);
      semana = [];
    }
  }
  if (semana.length) semanas.push([...semana, ...Array.from({ length: 7 - semana.length }, () => null)]);
  return semanas;
}
