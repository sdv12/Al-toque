import type { Plantilla } from "../registry";
import type { ConfigDe } from "../schema/landing-config";
import { alojamientoDefault } from "./alojamiento";
import { barberiaDefault } from "./barberia";
import { consultorioDefault } from "./consultorio";
import { genericoDefault } from "./generico";
import { libreDefault } from "./libre";

/** Config de ejemplo por plantilla: punto de partida del configurador y fixture de tests. */
export const configsPorDefecto: { [P in Plantilla]: ConfigDe<P> } = {
  barberia: barberiaDefault,
  consultorio: consultorioDefault,
  alojamiento: alojamientoDefault,
  generico: genericoDefault,
  libre: libreDefault,
};
