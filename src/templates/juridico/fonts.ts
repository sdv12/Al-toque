// Tipografías de los diseños. Sin preload: el CSS de todas las plantillas convive en un chunk
// compartido y cada página baja solo las caras que usa su diseño.
import {
  Bodoni_Moda,
  Cinzel,
  Cormorant_Garamond,
  Courier_Prime,
  Instrument_Sans,
  Jost,
  Libre_Franklin,
  Manrope,
  Newsreader,
  Source_Serif_4,
} from "next/font/google";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], display: "swap", preload: false, weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--fuente-ju-cormorant" });
const franklin = Libre_Franklin({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-ju-franklin" });
const newsreader = Newsreader({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--fuente-ju-newsreader" });
const instrument = Instrument_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-ju-instrument" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-ju-manrope" });
const courier = Courier_Prime({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"], variable: "--fuente-ju-courier" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--fuente-ju-source-serif" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--fuente-ju-bodoni" });
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", preload: false, weight: ["500", "600", "700"], variable: "--fuente-ju-cinzel" });
const jost = Jost({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-ju-jost" });

/** Clases que declaran las variables de fuente; van en la raíz de la plantilla. */
export const fuentes = [cormorant, franklin, newsreader, instrument, manrope, courier, sourceSerif, bodoni, cinzel, jost].map((f) => f.variable).join(" ");
