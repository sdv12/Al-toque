import type { Metadata } from "next";
import { Demo } from "./Demo";

export const metadata: Metadata = {
  title: "Demo de restaurante",
  description: "Probá Resto al toque: la web del restaurante con carta, reservas y pedidos, y el panel con salón, caja y ajustes.",
  robots: { index: false, follow: false },
};

/** La app completa: web pública (#/), panel (#/panel, PIN 1234) y términos (#/terminos). */
export default function Page() {
  return <Demo />;
}
