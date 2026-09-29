// Sin preload: el CSS de las cuatro plantillas convive en un chunk compartido (lo importan
// configurador y /dev/tokens) y el preload haría bajar las fuentes de todas en cada landing.
// Con @font-face sin preload, el navegador baja solo las caras que la página usa.
import { Caveat, Fraunces, Literata } from "next/font/google";

// Solo el eje de peso: los ejes SOFT/opsz duplicaban el peso del archivo para un matiz mínimo.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--fuente-alojamiento-display",
  display: "swap",
  preload: false,
});

const cuerpo = Literata({
  subsets: ["latin"],
  variable: "--fuente-alojamiento-cuerpo",
  display: "swap",
  preload: false,
});

// Anotaciones a mano en el mapa y en la ficha. Uso mínimo.
const nota = Caveat({
  subsets: ["latin"],
  variable: "--fuente-alojamiento-nota",
  display: "swap",
  preload: false,
});

/** Clases que declaran las variables de fuente; van en la raíz de la plantilla. */
export const fuentes = `${display.variable} ${cuerpo.variable} ${nota.variable}`;
