import type { Metadata } from "next";
import { ConfiguradorCliente } from "./ConfiguradorCliente";

export const metadata: Metadata = {
  title: "Configurador · Landing Kit",
  description: "Elegí plantilla, estilo, secciones y textos, mirá el resultado en vivo y mandame tu configuración.",
  robots: { index: false },
};

export default function ConfiguradorPage() {
  return <ConfiguradorCliente />;
}
