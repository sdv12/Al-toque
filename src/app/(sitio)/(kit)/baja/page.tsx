import type { Metadata } from "next";
import Link from "next/link";
import { TITULAR } from "../legales/datos";
import { Documento } from "../legales/Documento";
import { Solicitud } from "../legales/Solicitud";

export const metadata: Metadata = {
  title: "Botón de baja · Al Toque",
  description: "Dá de baja tu abono cuando quieras, sin penalidad y por el mismo medio por el que contrataste (art. 10 ter Ley 24.240).",
  alternates: { canonical: "/baja" },
};

export default function Baja() {
  return (
    <Documento
      actual="/baja"
      titulo="Botón de baja"
      bajada={
        <>
          <p>
            Podés dar de baja tu abono cuando quieras, <strong>sin penalidad</strong> y por el mismo medio por el que contrataste (art. 10 ter de la Ley
            24.240). La baja rige al terminar el período ya pagado.
          </p>
          <p>
            Te damos el código de tu solicitud ahora mismo y te lo confirmamos dentro de las 24 horas. Te entregamos tu contenido y tus datos en un formato
            exportable. Más detalles en los{" "}
            <Link href="/terminos#baja" className="underline">
              Términos y condiciones
            </Link>
            .
          </p>
        </>
      }
      secciones={[]}
    >
      <Solicitud tipo="baja" email={TITULAR.email} />
    </Documento>
  );
}
