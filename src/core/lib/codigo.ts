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

export async function codificarConfig(config: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(config));
  return PREFIJO + aBase64Url(await transformar(json, new CompressionStream("deflate-raw")));
}

/**
 * Acepta JSON pegado tal cual o un código LK1 (también dentro de un mensaje más largo).
 * Devuelve el objeto sin validar: pasarlo después por migrateConfig.
 */
export async function leerEntradaConfig(texto: string): Promise<{ ok: true; valor: unknown } | { ok: false; error: string }> {
  const limpio = texto.trim();
  try {
    if (limpio.startsWith("{")) return { ok: true, valor: JSON.parse(limpio) };
    const codigo = /LK1\.([A-Za-z0-9_-]+)/.exec(limpio)?.[1];
    if (!codigo) return { ok: false, error: "Pegá el JSON o el código que empieza con LK1." };
    const bytes = await transformar(deBase64Url(codigo), new DecompressionStream("deflate-raw"));
    return { ok: true, valor: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, error: "No se pudo leer: el texto está incompleto o dañado." };
  }
}
