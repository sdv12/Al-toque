// Las tipografías de los diez diseños (las mismas que la página de estilista). Sin preload: el CSS
// de todas las plantillas convive en un chunk compartido y cada página baja solo las caras que usa.
import {
  Anton,
  Archivo,
  Bodoni_Moda,
  Caveat,
  Cormorant_Garamond,
  Fraunces,
  Instrument_Sans,
  Instrument_Serif,
  Jost,
  Josefin_Sans,
  Libre_Bodoni,
  Libre_Franklin,
  Manrope,
  Montserrat,
  Outfit,
  Playfair_Display,
  Rubik,
  Shrikhand,
  Tilt_Neon,
  Work_Sans,
  Yeseva_One,
} from "next/font/google";


const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--fuente-es-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-montserrat" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], display: "swap", preload: false, weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--fuente-es-cormorant" });
const jost = Jost({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-jost" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--fuente-es-fraunces" });
const outfit = Outfit({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-outfit" });
const libreBodoni = Libre_Bodoni({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--fuente-es-libre-bodoni" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-manrope" });
const anton = Anton({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--fuente-es-anton" });
const archivo = Archivo({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-archivo" });
const bodoniModa = Bodoni_Moda({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--fuente-es-bodoni-moda" });
const libreFranklin = Libre_Franklin({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-libre-franklin" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], display: "swap", preload: false, weight: "400", style: ["normal", "italic"], variable: "--fuente-es-instrument-serif" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-instrument-sans" });
const yeseva = Yeseva_One({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--fuente-es-yeseva" });
const josefin = Josefin_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-josefin" });
const tiltNeon = Tilt_Neon({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-tilt-neon" });
const caveat = Caveat({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-caveat" });
const workSans = Work_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-work-sans" });
const shrikhand = Shrikhand({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--fuente-es-shrikhand" });
const rubik = Rubik({ subsets: ["latin"], display: "swap", preload: false, variable: "--fuente-es-rubik" });

/** Clases que declaran las variables de fuente; van en la raíz de la plantilla. */
export const fuentes = [
  playfair, montserrat, cormorant, jost, fraunces, outfit, libreBodoni, manrope, anton, archivo, bodoniModa,
  libreFranklin, instrumentSerif, instrumentSans, yeseva, josefin, tiltNeon, caveat, workSans, shrikhand, rubik,
]
  .map((f) => f.variable)
  .join(" ");
