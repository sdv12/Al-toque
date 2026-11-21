import type { Metadata } from "next";
import Link from "next/link";
import { LEYENDA_AAIP, OFICIAL, TITULAR } from "./datos";
import { DOCUMENTOS, Documento, Oficial, type Seccion } from "./Documento";

export const metadata: Metadata = {
  title: "Información legal · Al Toque",
  description: "Datos del titular, términos, privacidad, arrepentimiento, baja y organismos de defensa del consumidor y de datos personales.",
  alternates: { canonical: "/legales" },
};

const t = TITULAR;

const SECCIONES: Seccion[] = [
  {
    id: "titular",
    titulo: "Datos del titular",
    cuerpo: (
      <ul>
        <li>Titular: {t.nombre}</li>
        <li>Nombre comercial: {t.marca}</li>
        <li>CUIT: {t.cuit}</li>
        <li>Condición frente al IVA: {t.condicionIva}</li>
        <li>Domicilio: {t.domicilio}</li>
        <li>
          Correo: <a href={`mailto:${t.email}`}>{t.email}</a>
        </li>
      </ul>
    ),
  },
  {
    id: "documentos",
    titulo: "Documentos",
    cuerpo: (
      <ul>
        {DOCUMENTOS.filter((d) => d.href !== "/legales").map((d) => (
          <li key={d.href}>
            <Link href={d.href} className="underline">
              {d.titulo}
            </Link>
            {d.href === "/terminos" && " (ejemplar de contrato de adhesión, Ley 24.240 de Defensa del Consumidor)"}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "consumidor",
    titulo: "Defensa del consumidor",
    cuerpo: (
      <p>
        <Oficial href={OFICIAL.defensaConsumidor}>Defensa de las y los Consumidores. Para reclamos ingrese aquí</Oficial>. También podés acudir a la Dirección
        de Defensa del Consumidor de la Provincia de Córdoba o al organismo de tu localidad.
      </p>
    ),
  },
  {
    id: "datos",
    titulo: "Datos personales",
    cuerpo: (
      <>
        <p>{LEYENDA_AAIP}</p>
        <p>
          <Oficial href={OFICIAL.aaip}>Agencia de Acceso a la Información Pública</Oficial>.
        </p>
      </>
    ),
  },
];

export default function Legales() {
  return <Documento actual="/legales" titulo="Información legal" bajada={<p>Todo lo legal de {t.marca}, en un solo lugar.</p>} secciones={SECCIONES} />;
}
