import type { Metadata } from "next";
import { Turnos } from "./Turnos";

export const metadata: Metadata = {
  title: "Demo de turnos",
  robots: { index: false, follow: false },
};

/** La app de turnos completa: página de reserva (#/), panel (#/admin) y "Probalo con tus datos" (#/probar). */
export default function Page() {
  return <Turnos />;
}
