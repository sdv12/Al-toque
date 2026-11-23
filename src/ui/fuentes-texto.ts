// Tipografías que se pueden elegir para un texto suelto (ver core/lib/textos-propios.ts).
// Sin preload: cada landing declara solo las que usa, y el navegador baja solo las caras que pinta.
import { Bebas_Neue, DM_Serif_Display, Inter, Lora, Merriweather, Montserrat, Playfair_Display, Poppins } from "next/font/google";
import type { FuenteTexto } from "@/core/lib/textos-propios";

const inter = Inter({ subsets: ["latin"], variable: "--fuente-texto-inter", display: "swap", preload: false });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--fuente-texto-montserrat", display: "swap", preload: false });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "600", "800"], variable: "--fuente-texto-poppins", display: "swap", preload: false });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--fuente-texto-bebas", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--fuente-texto-playfair", display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], variable: "--fuente-texto-lora", display: "swap", preload: false });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--fuente-texto-merriweather", display: "swap", preload: false });
const dmserif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--fuente-texto-dmserif", display: "swap", preload: false });

const CLASES: Record<FuenteTexto, string> = {
  inter: inter.variable,
  montserrat: montserrat.variable,
  poppins: poppins.variable,
  bebas: bebas.variable,
  playfair: playfair.variable,
  lora: lora.variable,
  merriweather: merriweather.variable,
  dmserif: dmserif.variable,
};

/** Clases que declaran las variables de las fuentes pedidas; van en la raíz de la plantilla. */
export const clasesDeFuentes = (ids: FuenteTexto[]) => ids.map((id) => CLASES[id]).join(" ");
