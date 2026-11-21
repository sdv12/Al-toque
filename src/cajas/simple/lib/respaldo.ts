// Copia de seguridad de la caja: un archivo con todo lo guardado en este equipo (productos,
// precios, ventas, fiados, cierres, cajones y ajustes). Se guarda o se comparte (WhatsApp, Drive)
// y se recupera en este u otro equipo. Sin servidor: el archivo es de la persona.

import { getMeta, leerTodo, put, reemplazarTodo, STORES, type StoreName } from "./db";

export const FORMATO = "altoque-caja";
export const VERSION_RESPALDO = 1;
const CLAVE_ULTIMO = "ultimoRespaldo";
/** Avisar si pasaron estos días sin guardar una copia. */
export const DIAS_RECORDATORIO = 7;
const DIA = 86_400_000;
/** Aviso a la pantalla (el cartel de recordatorio se esconde al guardar una copia). */
export const EVENTO_RESPALDO = "caja:respaldo";

type Tablas = Record<Exclude<StoreName, "meta">, unknown[]>;

export interface Respaldo {
  formato: typeof FORMATO;
  version: number;
  /** Nombre del negocio, para reconocer el archivo. */
  negocio: string;
  /** Cuándo se hizo (ms). */
  creado: number;
  datos: Tablas;
  meta: [string, unknown][];
}

const TABLAS = STORES.filter((s): s is Exclude<StoreName, "meta"> => s !== "meta");

/** "copia-caja-verduleria-lorenzo-2026-11-21.json" */
export function nombreArchivo(negocio: string, creado: number): string {
  const slug =
    negocio
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mi-caja";
  const ar = new Date(creado - 3 * 3_600_000).toISOString().slice(0, 10);
  return `copia-caja-${slug}-${ar}.json`;
}

/** Revisa que el archivo sea una copia de la caja y la devuelve lista para recuperar. */
export function leerRespaldo(texto: string): { ok: true; respaldo: Respaldo } | { ok: false; error: string } {
  let j: unknown;
  try {
    j = JSON.parse(texto);
  } catch {
    return { ok: false, error: "Ese archivo no es una copia de la caja." };
  }
  const r = j as Partial<Respaldo> | null;
  if (!r || r.formato !== FORMATO || !r.datos || typeof r.creado !== "number") return { ok: false, error: "Ese archivo no es una copia de la caja." };
  if (typeof r.version !== "number" || r.version > VERSION_RESPALDO) return { ok: false, error: "Esta copia es de una versión más nueva de la caja. Actualizá la caja y probá de nuevo." };
  for (const t of TABLAS) if (!Array.isArray((r.datos as Partial<Tablas>)[t])) return { ok: false, error: "La copia está incompleta: falta una parte." };
  if (!Array.isArray(r.meta)) return { ok: false, error: "La copia está incompleta: falta una parte." };
  return { ok: true, respaldo: r as Respaldo };
}

/** ¿Mostrar el recordatorio? Si hay ventas y pasaron 7 días desde la última copia (o desde la primera venta). */
export function necesitaRecordatorio(ultimo: number | undefined, primeraVenta: number | undefined, ahora: number): boolean {
  if (primeraVenta === undefined) return false;
  const desde = Math.max(ultimo ?? 0, primeraVenta);
  return ahora - desde >= DIAS_RECORDATORIO * DIA;
}

/** Cuántos días pasaron desde la última copia (para el texto del aviso). */
export const diasDesde = (desde: number, ahora: number) => Math.max(1, Math.floor((ahora - desde) / DIA));

export async function armarRespaldo(negocio: string, ahora = Date.now()): Promise<Respaldo> {
  const { datos, meta } = await leerTodo();
  return { formato: FORMATO, version: VERSION_RESPALDO, negocio, creado: ahora, datos: datos as Tablas, meta: meta.filter(([k]) => k !== CLAVE_ULTIMO) };
}

export const ultimoRespaldo = () => getMeta<number>(CLAVE_ULTIMO);

async function anotarRespaldo(cuando: number) {
  await put("meta", cuando, CLAVE_ULTIMO);
  window.dispatchEvent(new Event(EVENTO_RESPALDO));
}

/**
 * Guarda la copia: en el celular abre "Compartir" (WhatsApp, Drive, mail…); si no se puede,
 * descarga el archivo. Devuelve false si la persona canceló.
 */
export async function guardarCopia(negocio: string): Promise<boolean> {
  const r = await armarRespaldo(negocio);
  const nombre = nombreArchivo(negocio, r.creado);
  const archivo = new File([JSON.stringify(r)], nombre, { type: "application/json" });
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: `Copia de la caja · ${negocio}` });
    } catch (e) {
      if ((e as Error).name === "AbortError") return false;
      descargar(archivo);
    }
  } else descargar(archivo);
  await anotarRespaldo(r.creado);
  return true;
}

function descargar(archivo: File) {
  const url = URL.createObjectURL(archivo);
  const a = document.createElement("a");
  a.href = url;
  a.download = archivo.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Reemplaza todo lo de este equipo por lo de la copia. */
export async function recuperarCopia(r: Respaldo): Promise<void> {
  await reemplazarTodo(r.datos, [...r.meta, [CLAVE_ULTIMO, r.creado]]);
  window.dispatchEvent(new Event(EVENTO_RESPALDO));
}
