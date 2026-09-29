// Sin preload: el CSS de las cuatro plantillas convive en un chunk compartido (lo importan
// configurador y /dev/tokens) y el preload haría bajar las fuentes de todas en cada landing.
// Con @font-face sin preload, el navegador baja solo las caras que la página usa.
import { Atkinson_Hyperlegible_Next } from "next/font/google";

// Una sola familia: legibilidad máxima (diseñada para baja visión), jerarquía por peso y tamaño.
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--fuente-consultorio",
  display: "swap",
  preload: false,
  // next/font no tiene métricas de esta familia para ajustar el fallback.
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

/** Clases que declaran las variables de fuente; van en la raíz de la plantilla. */
export const fuentes = atkinson.variable;
