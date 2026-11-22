import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { SLUG, SLUGS_RESERVADOS, validarPublicado, type RestoPublicado } from "./lib/publicado";

/** Los restaurantes publicados viven en /configs/restos/<slug>.json (como las cajas en /configs/cajas). */
const DIRECTORIO = path.join(process.cwd(), "configs", "restos");

export async function listarRestos(): Promise<string[]> {
  const archivos = await readdir(DIRECTORIO).catch(() => []);
  return archivos
    .filter((a) => a.endsWith(".json"))
    .map((a) => a.slice(0, -5))
    .filter((s) => SLUG.test(s) && !SLUGS_RESERVADOS.includes(s));
}

/** El restaurante validado, o null si no existe. Si existe pero es inválido, falla el build. */
export const cargarResto = cache(async (slug: string): Promise<RestoPublicado | null> => {
  if (!SLUG.test(slug) || SLUGS_RESERVADOS.includes(slug)) return null;
  const texto = await readFile(path.join(DIRECTORIO, `${slug}.json`), "utf8").catch(() => null);
  if (texto === null) return null;
  const r = validarPublicado(JSON.parse(texto));
  if (!r.ok) throw new Error(`configs/restos/${slug}.json no es válido:\n  ${r.errores.join("\n  ")}`);
  return r.valor;
});
