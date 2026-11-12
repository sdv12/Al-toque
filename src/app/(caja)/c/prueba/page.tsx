import type { Metadata } from "next";
import PruebaCliente from "./PruebaCliente";

export const metadata: Metadata = {
  title: "Probá tu caja",
  robots: { index: false, follow: false },
};

/** La caja que se arma en /caja: lee la configuración que dejó el configurador en este navegador. */
export default function Page() {
  return <PruebaCliente />;
}
