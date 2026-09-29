// Sin preload: el CSS de las cuatro plantillas convive en un chunk compartido (lo importan
// configurador y /dev/tokens) y el preload haría bajar las fuentes de todas en cada landing.
// Con @font-face sin preload, el navegador baja solo las caras que la página usa.
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--fuente-generico-display",
  display: "swap",
  preload: false,
});

const cuerpo = Instrument_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--fuente-generico-cuerpo",
  display: "swap",
  preload: false,
});

/** Clases que declaran las variables de fuente; van en la raíz de la plantilla. */
export const fuentes = `${display.variable} ${cuerpo.variable}`;
