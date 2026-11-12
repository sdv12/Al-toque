/**
 * Código compacto para mandar una config por WhatsApp: "LK1." + base64url(deflate(JSON)).
 * Una config típica (~6 KB) queda en ~2 KB de texto.
 */
const PREFIJO = "LK1.";

async function transformar(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const salida = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(salida).arrayBuffer());
}

function aBase64Url(bytes: Uint8Array): string {
  let binario = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array {
  const b64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

/** Comprime un objeto a texto para pegar en un mensaje: `${prefijo}` + base64url(deflate(JSON)). */
export async function codificar(prefijo: string, valor: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(valor));
  return prefijo + aBase64Url(await transformar(json, new CompressionStream("deflate-raw")));
}

/** Busca un código `${prefijo}…` (también dentro de un mensaje más largo) y lo descomprime. Falla si está dañado. */
export async function decodificar(prefijo: string, texto: string): Promise<unknown | undefined> {
  const escapado = prefijo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const codigo = new RegExp(`${escapado}([A-Za-z0-9_-]+)`).exec(texto)?.[1];
  if (!codigo) return undefined;
  const bytes = await transformar(deBase64Url(codigo), new DecompressionStream("deflate-raw"));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function codificarConfig(config: unknown): Promise<string> {
  return codificar(PREFIJO, config);
}

/**
 * Acepta JSON pegado tal cual o un código LK1 (también dentro de un mensaje más largo).
 * Devuelve el objeto sin validar: pasarlo después por migrateConfig.
 */
export async function leerEntradaConfig(texto: string): Promise<{ ok: true; valor: unknown } | { ok: false; error: string }> {
  const limpio = texto.trim();
  try {
    if (limpio.startsWith("{")) return { ok: true, valor: JSON.parse(limpio) };
    const valor = await decodificar(PREFIJO, limpio);
    if (valor === undefined) return { ok: false, error: "Pegá el JSON o el código que empieza con LK1." };
    return { ok: true, valor };
  } catch {
    return { ok: false, error: "No se pudo leer: el texto está incompleto o dañado." };
  }
}
