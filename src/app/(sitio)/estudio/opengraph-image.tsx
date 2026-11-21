import Imagen from "../l/[slug]/opengraph-image";

/** La misma vista previa que /l/demo-arquitectos (nombre, tipografía y colores de la demo). */
export const alt = "Vista previa de la página del negocio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagenEstudio() {
  return Imagen({ params: Promise.resolve({ slug: "demo-arquitectos" }) });
}
