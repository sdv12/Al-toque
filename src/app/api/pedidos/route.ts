import { getStore } from "@netlify/blobs";

/**
 * Número de pedido correlativo (#00001, #00002…) para los envíos del configurador y de /caja.
 * El contador vive en Netlify Blobs; la escritura es condicional (etag), así dos pedidos al mismo
 * tiempo no se llevan el mismo número. Solo da el número: la configuración completa va aparte, por
 * Netlify Forms (ver src/app/(sitio)/(kit)/pedido.ts).
 */

const CLAVE = "contador";
const INTENTOS = 6;

/** En `next dev` no hay Netlify Blobs: se numera en memoria (se reinicia con el servidor). */
let contadorLocal = 0;

async function siguienteNumero(): Promise<number> {
  const store = getStore({ name: "pedidos", consistency: "strong" });
  for (let i = 0; i < INTENTOS; i++) {
    const actual = await store.getWithMetadata(CLAVE, { type: "json" });
    const numero = (typeof actual?.data === "number" ? actual.data : 0) + 1;
    const r = actual?.etag
      ? await store.setJSON(CLAVE, numero, { onlyIfMatch: actual.etag })
      : await store.setJSON(CLAVE, numero, { onlyIfNew: true });
    if (r.modified) return numero;
  }
  throw new Error("No se pudo reservar un número de pedido (demasiados envíos a la vez).");
}

/**
 * Solo pedidos que salen de nuestras páginas: un sitio ajeno no puede gastar números (ni
 * invocaciones de Netlify) desde el navegador de sus visitantes. No frena un script hecho a mano,
 * pero tampoco hay nada que robar: el endpoint solo devuelve el próximo número.
 */
function esDeNuestroSitio(request: Request): boolean {
  // Lo pone el navegador y una página no lo puede cambiar. Sin la cabecera (navegador viejo,
  // script) se deja pasar: el número no es un secreto.
  const sitio = request.headers.get("sec-fetch-site");
  return !sitio || sitio === "same-origin";
}

export async function POST(request: Request) {
  if (!esDeNuestroSitio(request)) return Response.json({ error: "Origen no permitido" }, { status: 403 });
  try {
    return Response.json({ numero: await siguienteNumero() });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") return Response.json({ numero: ++contadorLocal });
    console.error("[pedidos]", error);
    return Response.json({ error: "Sin número de pedido" }, { status: 503 });
  }
}
