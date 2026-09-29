/** Clases compartidas dentro de la plantilla "Cuaderno de campo" (no fuera de ella). */

export const boton = {
  primario:
    "inline-flex items-center justify-center gap-2 rounded-control bg-acento-relleno px-6 py-3 text-chico font-semibold text-sobre-acento transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45",
  secundario:
    "inline-flex items-center justify-center gap-2 rounded-control border-[1.5px] border-tinta/70 px-5 py-2.5 text-chico font-semibold text-tinta transition-colors hover:border-acento hover:text-acento-texto",
  enlace: "inline-flex items-center gap-1 text-chico font-semibold text-acento-texto underline decoration-1 underline-offset-4 hover:decoration-2",
};

export const margen = "px-5 @4xl:px-12";

/** Separador de cuaderno: línea punteada. */
export const separador = "border-t-[1.5px] border-dashed border-borde";

export const tituloSeccion = "font-display text-titulo";
