/*
 * Lectura segura de Netlify Blobs. En el runtime de Netlify, `get` de una clave que NO existe se
 * queda colgado (la librería descarta el cuerpo del 404 y esa promesa nunca termina; verificado en
 * noviembre de 2026 con @netlify/blobs 11.1.9). `list` sí responde: se pregunta primero si la clave
 * existe y solo se lee lo que está. Las claves de estas tiendas nunca se borran, así que no hay
 * carrera entre el list y el get.
 */

/** Lo mínimo que usamos de un store de @netlify/blobs (así se puede probar sin Netlify). */
export interface StoreLectura {
  list(opciones?: { prefix?: string }): Promise<{ blobs: { key: string }[] }>;
  getWithMetadata(clave: string, opciones: { type: "json" }): Promise<{ data: unknown; etag?: string } | null>;
}

/** El valor JSON y su etag, o null si la clave no existe (sin colgarse). */
export async function leerJSON<T>(store: StoreLectura, clave: string): Promise<{ data: T; etag?: string } | null> {
  const { blobs } = await store.list({ prefix: clave });
  if (!blobs.some((b) => b.key === clave)) return null;
  const r = await store.getWithMetadata(clave, { type: "json" });
  return r ? { data: r.data as T, etag: r.etag } : null;
}

/** Varias claves de una: un solo list y después solo las que existen. */
export async function leerVarios<T>(store: StoreLectura, claves: string[]): Promise<T[]> {
  const { blobs } = await store.list();
  const existen = new Set(blobs.map((b) => b.key));
  const leidos = await Promise.all(claves.filter((k) => existen.has(k)).map((k) => store.getWithMetadata(k, { type: "json" })));
  return leidos.flatMap((r) => (r ? [r.data as T] : []));
}
