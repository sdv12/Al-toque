// Sin preload: el CSS de las cuatro plantillas convive en un chunk compartido (lo importan
// configurador y /dev/tokens) y el preload haría bajar las fuentes de todas en cada landing.
// Con @font-face sin preload, el navegador baja solo las caras que la página usa.
import { Bodoni_Moda, Jost } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--fuente-barberia-display",
  display: "swap",
  preload: false,
});

const cuerpo = Jost({
  subsets: ["latin"],
  variable: "--fuente-barberia-cuerpo",
  display: "swap",
  preload: false,
});

/** Clases que declaran las variables de fuente; van en la raíz de la plantilla. */
export const fuentes = `${display.variable} ${cuerpo.variable}`;
