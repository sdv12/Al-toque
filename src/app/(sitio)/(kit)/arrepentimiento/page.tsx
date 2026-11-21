import type { Metadata } from "next";
import Link from "next/link";
import { TITULAR } from "../legales/datos";
import { Documento } from "../legales/Documento";
import { Solicitud } from "../legales/Solicitud";

export const metadata: Metadata = {
  title: "Botón de arrepentimiento · Al Toque",
  description: "Revocá la contratación dentro de los 10 días corridos, sin costo y sin registrarte (art. 34 Ley 24.240, art. 1110 CCyC, Res. 424/2020).",
  alternates: { canonical: "/arrepentimiento" },
};

export default function Arrepentimiento() {
  return (
    <Documento
      actual="/arrepentimiento"
      titulo="Botón de arrepentimiento"
      bajada={
        <>
          <p>
            Si contrataste por internet, tenés <strong>10 días corridos</strong> desde la contratación para arrepentirte, sin dar explicaciones y sin costo
            (art. 34 de la Ley 24.240 y art. 1110 del Código Civil y Comercial).
          </p>
          <p>
            Completá el formulario: no hace falta registrarte. Te damos el código de tu solicitud ahora mismo y te lo confirmamos por el mismo medio dentro de
            las 24 horas. Te devolvemos lo que pagaste por el mismo medio de pago. Más detalles en los{" "}
            <Link href="/terminos#arrepentimiento" className="underline">
              Términos y condiciones
            </Link>
            .
          </p>
        </>
      }
      secciones={[]}
    >
      <Solicitud tipo="arrepentimiento" email={TITULAR.email} />
    </Documento>
  );
}
