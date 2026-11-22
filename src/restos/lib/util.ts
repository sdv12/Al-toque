/* Utilidades chicas de Resto al toque: plata, fechas locales (ISO AAAA-MM-DD) y horas "HH:MM". */

const fmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
export const plata = (n: number) => "$ " + fmt.format(Math.round(n || 0));
export const pct = (n: number) => String(n).replace(".", ",") + " %";

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDe = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hoyISO = (ahora = new Date()) => isoDe(ahora);
export const fechaDe = (iso: string) => {
  const [y = 2000, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const sumarDias = (iso: string, n: number) => {
  const f = fechaDe(iso);
  return isoDe(new Date(f.getFullYear(), f.getMonth(), f.getDate() + n));
};
/** 0 = domingo … 6 = sábado (como Date.getDay). */
export const diaSemana = (iso: string) => fechaDe(iso).getDay();
export const fechaCorta = (iso: string) =>
  fechaDe(iso).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }).replace(".", "");
export const fechaLarga = (iso: string) => fechaDe(iso).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

/** "HH:MM" → minutos desde las 00:00. */
export const aMin = (h: string) => {
  const [hh = 0, mm = 0] = h.split(":").map(Number);
  return hh * 60 + mm;
};
/** Minutos (pueden pasar de 1440: después de medianoche) → "HH:MM". */
export const aHora = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;
export const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/;
export const minutosDelDia = (d: Date) => d.getHours() * 60 + d.getMinutes();

export const hora = (ts: number) => new Date(ts).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
export const minutosDesde = (ts: number, ahora: number) => Math.max(0, Math.round((ahora - ts) / 60000));
export const duracion = (ts: number, ahora: number) => {
  const m = minutosDesde(ts, ahora);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${pad(m % 60)}`;
};

/** Link de WhatsApp con el número argentino normalizado (agrega 549 si falta). */
export function linkWhatsApp(tel: string, texto: string) {
  let n = tel.replace(/\D/g, "");
  if (n && !n.startsWith("54")) n = "549" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

export const primerNombre = (nombre: string) => (nombre.split(",").pop() ?? nombre).trim().split(/\s+/)[0] ?? nombre;
