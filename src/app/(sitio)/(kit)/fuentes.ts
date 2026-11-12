import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

// Tipografía de la herramienta (configurador y páginas internas), no de las landings.
const sans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--fuente-kit", display: "swap" });
// Mono solo para detalles del configurador: sin preload, se baja si se usa.
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--fuente-kit-mono", display: "swap", preload: false });

export const fuentesKit = `${sans.variable} ${mono.variable}`;
