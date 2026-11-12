import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { validarCaja, type CajaConfig } from "./config";

/** Las cajas publicadas viven en /configs/cajas/<slug>.json (igual que las landings en /configs). */
const DIRECTORIO = path.join(process.cwd(), "configs", "cajas");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "prueba" (la caja del configurador de /caja) y "pro" (la demo pro) tienen su propia página. */
export const SLUGS_RESERVADOS = ["prueba", "pro"];

export async function listarCajas(): Promise<string[]> {
  const archivos = await readdir(DIRECTORIO).catch(() => []);
  return archivos
    .filter((a) => a.endsWith(".json"))
    .map((a) => a.slice(0, -5))
    .filter((s) => SLUG.test(s) && !SLUGS_RESERVADOS.includes(s));
}

/** Devuelve la config validada o null si no existe. Si existe pero es inválida, falla el build. */
export const cargarCaja = cache(async (slug: string): Promise<CajaConfig | null> => {
  if (!SLUG.test(slug) || SLUGS_RESERVADOS.includes(slug)) return null;
  const texto = await readFile(path.join(DIRECTORIO, `${slug}.json`), "utf8").catch(() => null);
  if (texto === null) return null;

  const r = validarCaja(JSON.parse(texto));
  if (!r.ok) {
    const detalle = r.errores.map((e) => `  ${e.ruta || "(raíz)"}: ${e.mensaje}`).join("\n");
    throw new Error(`configs/cajas/${slug}.json no es válida:\n${detalle}`);
  }
  return r.config;
});
