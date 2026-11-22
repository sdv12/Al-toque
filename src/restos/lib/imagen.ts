/*
 * Fotos de la web: se achican en el navegador antes de guardarlas (mientras los datos vivan en el
 * navegador, el espacio es de unos 5 MB por sitio). Cuando llegue la nube, las fotos van a un
 * almacenamiento propio y esto solo achica antes de subir.
 */

/** Espacio que usamos como tope (dejamos margen para reservas, pedidos y números). */
export const TOPE_BYTES = 4_400_000;

/** Lo que ocupa el restaurante guardado (en caracteres ≈ bytes). */
export const ocupado = (datos: unknown) => JSON.stringify(datos).length;

export const enKB = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

/**
 * Achica una imagen a `max` píxeles del lado más largo. Logo: PNG (mantiene la transparencia).
 * Fotos: JPEG, que ocupa mucho menos.
 */
export async function achicarImagen(archivo: File, max: number, tipo: "foto" | "logo" = "foto"): Promise<string> {
  if (!archivo.type.startsWith("image/")) throw new Error("El archivo no es una imagen.");
  const bmp = await createImageBitmap(archivo);
  const escala = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * escala));
  const h = Math.max(1, Math.round(bmp.height * escala));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no puede procesar la imagen.");
  if (tipo === "foto") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return tipo === "logo" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.74);
}
