import type { Bloqueo, Negocio, Turno } from "./tipos";

export const pad = (n: number) => String(n).padStart(2, "0");
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hoyISO = () => iso(new Date());
export const desdeISO = (s: string) => {
  const [y = 0, m = 1, d = 1] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const sumarDias = (s: string, n: number) => {
  const d = desdeISO(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const aMin = (h: string) => {
  const [a = 0, b = 0] = h.split(":").map(Number);
  return a * 60 + b;
};
export const aHora = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DIAS_C = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const fechaLarga = (s: string) => {
  const d = desdeISO(s);
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
};
export const fechaCorta = (s: string) => {
  const d = desdeISO(s);
  return `${DIAS_C[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
};
export const plata = (n: number | null | undefined) => "$" + Math.round(n || 0).toLocaleString("es-AR");

/** Horarios libres de un día para una duración dada. */
export function horariosLibres(negocio: Negocio, turnos: Turno[], bloqueos: Bloqueo[], fecha: string, duracion: number): string[] {
  const dow = desdeISO(fecha).getDay();
  const franjas = negocio.horarios[dow] || [];
  const ocupados = turnos
    .filter((t) => t.fecha === fecha && t.estado !== "cancelado")
    .map((t): [number, number] => [aMin(t.hora), aMin(t.hora) + t.duracion])
    .concat(bloqueos.filter((b) => b.fecha === fecha).map((b): [number, number] => [aMin(b.desde), aMin(b.hasta)]));
  const ahora = new Date();
  const esHoy = fecha === iso(ahora);
  const minAhora = ahora.getHours() * 60 + ahora.getMinutes() + (negocio.anticipacion || 0);
  const out: string[] = [];
  for (const [ini, fin] of franjas) {
    for (let m = aMin(ini); m + duracion <= aMin(fin); m += negocio.intervalo) {
      if (esHoy && m < minAhora) continue;
      if (ocupados.some(([a, b]) => m < b && m + duracion > a)) continue;
      out.push(aHora(m));
    }
  }
  return out;
}

export function proximosDias(negocio: Negocio, n = 21): string[] {
  const out: string[] = [];
  let f = hoyISO();
  for (let i = 0; out.length < n && i < 60; i++) {
    if ((negocio.horarios[desdeISO(f).getDay()] || []).length) out.push(f);
    f = sumarDias(f, 1);
  }
  return out;
}
