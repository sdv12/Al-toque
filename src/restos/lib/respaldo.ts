/*
 * Copia de seguridad del restaurante en un archivo (JSON). Mientras los datos vivan en el navegador,
 * es la forma de no perderlos o de pasarlos a otro equipo.
 */
import type { Estado, IdTipo } from "./tipos";

export const FORMATO_RESTO = "altoque-resto";

export function armarCopia(st: Estado) {
  return JSON.stringify({ formato: FORMATO_RESTO, version: 1, guardado: new Date().toISOString(), estado: st });
}

export function nombreCopia(st: Estado, ahora = new Date()) {
  const slug = st.local.nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const f = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
  return `${slug || "restaurante"}-${f}.json`;
}

/** Lee una copia; devuelve el estado o un error en castellano. */
export function leerCopia(texto: string, tipo: IdTipo): { ok: true; estado: Estado } | { ok: false; error: string } {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return { ok: false, error: "El archivo no es una copia de Al Toque Resto." };
  }
  const d = datos as { formato?: string; estado?: Estado };
  if (d?.formato !== FORMATO_RESTO || !d.estado || d.estado.v !== 1 || !Array.isArray(d.estado.mesas)) return { ok: false, error: "El archivo no es una copia de Al Toque Resto." };
  if (d.estado.local?.tipo !== tipo) return { ok: false, error: "La copia es de otro tipo de local." };
  return { ok: true, estado: d.estado };
}
