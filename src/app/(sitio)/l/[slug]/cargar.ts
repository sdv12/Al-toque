import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { migrateConfig } from "@/core/schema/migrate";
import type { LandingConfig } from "@/core/schema/landing-config";

/** Fase 1: las configs viven en /configs/<slug>.json. En fase 2 esto lee de Supabase. */
const DIRECTORIO = path.join(process.cwd(), "configs");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function listarSlugs(): Promise<string[]> {
  const archivos = await readdir(DIRECTORIO).catch(() => []);
  return archivos.filter((a) => a.endsWith(".json")).map((a) => a.slice(0, -5)).filter((s) => SLUG.test(s));
}

/** Devuelve la config validada o null si no existe. Si existe pero es inválida, falla el build. */
export const cargarConfig = cache(async (slug: string): Promise<LandingConfig | null> => {
  if (!SLUG.test(slug)) return null;
  const texto = await readFile(path.join(DIRECTORIO, `${slug}.json`), "utf8").catch(() => null);
  if (texto === null) return null;

  const r = migrateConfig(JSON.parse(texto));
  if (!r.ok) {
    const detalle = r.errores.map((e) => `  ${e.ruta || "(raíz)"}: ${e.mensaje}`).join("\n");
    throw new Error(`configs/${slug}.json no es válida:\n${detalle}`);
  }
  return r.config;
});
