// Sin preload: el CSS de todas las plantillas convive en un chunk compartido; así cada landing
// baja solo las caras que usa.
import { Schibsted_Grotesk, Source_Sans_3 } from "next/font/google";

const display = Schibsted_Grotesk({ subsets: ["latin"], variable: "--fuente-libre-display", display: "swap", preload: false });
const cuerpo = Source_Sans_3({ subsets: ["latin"], style: ["normal", "italic"], variable: "--fuente-libre-cuerpo", display: "swap", preload: false });

/** Clases que declaran las variables de fuente; van en la raíz de la plantilla. */
export const fuentes = `${display.variable} ${cuerpo.variable}`;
