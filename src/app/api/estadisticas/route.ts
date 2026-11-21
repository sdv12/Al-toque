import { getStore } from "@netlify/blobs";
import { leerJSON, leerVarios } from "@/core/lib/blobs";
import { lunesDe, normalizarEvento, semanaVacia, sumarEvento, ultimasSemanas, type Semana } from "@/core/lib/estadisticas";

/**
 * Estadísticas de pedidos para /adm: POST suma un evento a la semana; GET devuelve las últimas
 * semanas. Solo números (ver src/core/lib/estadisticas.ts). Vive en Netlify Blobs, una entrada por
 * semana, con escritura condicional (etag) para no perder sumas si llegan dos a la vez.
 */

const INTENTOS = 6;
const tienda = () => getStore({ name: "estadisticas", consistency: "strong" });

/** En `next dev` no hay Netlify Blobs: se guarda en memoria (se reinicia con el servidor). */
const enMemoria = new Map<string, Semana>();

function esDeNuestroSitio(request: Request): boolean {
  const sitio = request.headers.get("sec-fetch-site");
  return !sitio || sitio === "same-origin";
}

export async function POST(request: Request) {
  if (!esDeNuestroSitio(request)) return Response.json({ error: "Origen no permitido" }, { status: 403 });
  const texto = await request.text();
  if (texto.length > 1_000) return Response.json({ error: "Demasiado largo" }, { status: 413 });
  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return Response.json({ error: "No es JSON" }, { status: 400 });
  }
  // /adm lee los números por POST ({ leer: true }): así la respuesta nunca pasa por una caché.
  if (cuerpo && typeof cuerpo === "object" && (cuerpo as { leer?: unknown }).leer === true) return Response.json(await leerSemanas(), { headers: SIN_CACHE });
  const evento = normalizarEvento(cuerpo);
  if (!evento) return Response.json({ error: "Evento inválido" }, { status: 400 });
  const clave = lunesDe(new Date());
  try {
    const store = tienda();
    for (let i = 0; i < INTENTOS; i++) {
      // leerJSON: con la semana todavía sin crear, el get de Blobs se cuelga (ver core/lib/blobs.ts).
      const actual = await leerJSON<Semana>(store, clave);
      const nueva = sumarEvento((actual?.data as Semana | undefined) ?? semanaVacia(clave), evento);
      const r = actual?.etag ? await store.setJSON(clave, nueva, { onlyIfMatch: actual.etag }) : await store.setJSON(clave, nueva, { onlyIfNew: true });
      if (r.modified) return Response.json({ ok: true });
    }
    return Response.json({ error: "Muchos a la vez" }, { status: 503 });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      enMemoria.set(clave, sumarEvento(enMemoria.get(clave) ?? semanaVacia(clave), evento));
      return Response.json({ ok: true });
    }
    console.error("[estadisticas]", error);
    return Response.json({ error: "No se pudo guardar" }, { status: 503 });
  }
}

// Siempre al momento: nunca se guarda una respuesta vieja (ni en Next ni en la caché de Netlify).
export const dynamic = "force-dynamic";

/** Lo más que se espera a Blobs antes de responder con lo que haya (la página no se queda colgada). */
const ESPERA_MS = 8_000;

/** Las últimas 12 semanas (con ceros donde no hubo nada). */
async function leerSemanas(): Promise<{ semanas: Semana[]; completo: boolean }> {
  const hoy = new Date();
  const claves = ultimasSemanas([], hoy, 12).map((s) => s.semana);
  try {
    // Para leer alcanza la consistencia normal: los números pueden llegar con unos segundos de atraso.
    const store = getStore({ name: "estadisticas" });
    const leer = leerVarios<Semana>(store, claves);
    const tiempo = new Promise<null>((r) => setTimeout(() => r(null), ESPERA_MS));
    const r = await Promise.race([leer, tiempo]);
    if (!r) throw new Error("Blobs tardó demasiado");
    return { semanas: ultimasSemanas(r, hoy, 12), completo: true };
  } catch (error) {
    if (process.env.NODE_ENV === "production") console.error("[estadisticas]", error);
    return { semanas: ultimasSemanas([...enMemoria.values()], hoy, 12), completo: false };
  }
}

const SIN_CACHE = { "Cache-Control": "no-store", "Netlify-CDN-Cache-Control": "no-store" };

export async function GET() {
  return Response.json(await leerSemanas(), { headers: SIN_CACHE });
}
