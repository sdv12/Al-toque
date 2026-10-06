/** Clases compartidas dentro de la plantilla "A tu medida" (no fuera de ella). */

export const boton = {
  primario:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-acento-relleno px-6 text-cuerpo font-semibold text-sobre-acento transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40",
  secundario:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-borde bg-superficie px-6 text-cuerpo font-semibold text-tinta hover:border-tinta-suave",
};

export const margen = "px-5 @4xl:px-10";
export const contenedor = "mx-auto w-full max-w-6xl";
export const bloque = "py-16 @4xl:py-24";
export const titulo = "font-display text-titulo font-extrabold";
export const campo = "mt-1.5 block w-full rounded-control border border-borde bg-superficie px-4 py-3 text-cuerpo text-tinta";
/** Áreas de texto: radio de bloque (con esquinas "redondeadas" el de control sería una píldora). */
export const campoArea = "mt-1.5 block w-full rounded-base border border-borde bg-superficie px-4 py-3 text-cuerpo text-tinta";
