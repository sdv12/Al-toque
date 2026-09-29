import { Archivo } from "next/font/google";

// Titulares de la home: Archivo con eje de ancho, usada condensada (estética de afiche).
const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--fuente-home-display",
  display: "swap",
});

export const fuentesHome = display.variable;
