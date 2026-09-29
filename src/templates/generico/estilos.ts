/** Clases compartidas dentro de la plantilla "Portfolio modular" (no fuera de ella). */

export const boton = {
  primario:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-acento-relleno px-6 py-3 text-cuerpo font-semibold text-sobre-acento transition-transform hover:-translate-y-0.5 disabled:opacity-40",
  contorno:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-control border-2 border-tinta px-6 py-3 text-cuerpo font-semibold text-tinta transition-colors hover:bg-tinta hover:text-fondo",
  enlace: "font-semibold underline decoration-2 underline-offset-4 hover:text-acento-texto",
};

export const margen = "px-4 @4xl:px-8";

/** Forma de bloque sin fondo (para los que llevan un fondo propio). */
export const tileBase = "rounded-base border border-borde p-5 @4xl:p-7";

/** Bloque del bento: superficie plana, sin sombras repetidas. */
export const tile = `${tileBase} bg-superficie`;

export const tituloSeccion = "font-display text-titulo";
