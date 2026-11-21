import Link from "next/link";
import type { ReactNode } from "react";
import { fuentesHome } from "../_home/fuentes";
import { Encabezado, Pie, afiche, margen } from "../_home/Secciones";
import { faltanDatos, fechaVigencia } from "./datos";

export interface Seccion {
  id: string;
  titulo: string;
  cuerpo: ReactNode;
}

export const DOCUMENTOS = [
  { href: "/terminos", titulo: "Términos y condiciones" },
  { href: "/privacidad", titulo: "Política de privacidad" },
  { href: "/arrepentimiento", titulo: "Botón de arrepentimiento" },
  { href: "/baja", titulo: "Botón de baja" },
  { href: "/legales", titulo: "Información legal" },
];

/** Página legal: título, índice, secciones numeradas y los demás documentos. */
export function Documento({ titulo, bajada, secciones, actual, children }: { titulo: string; bajada: ReactNode; secciones: Seccion[]; actual: string; children?: ReactNode }) {
  const faltan = faltanDatos();
  return (
    <div data-kit="home" className={fuentesHome}>
      <a href="#contenido" className="sr-only z-50 rounded-control bg-tinta px-4 py-2 text-fondo focus:not-sr-only focus:absolute focus:left-3 focus:top-3">
        Saltar al contenido
      </a>
      <Encabezado desde="/" />
      <main id="contenido" className={`${margen} pb-24`}>
        <div className="mx-auto max-w-[72ch] pt-10">
          {faltan.length > 0 && (
            <p role="note" className="mb-6 rounded-base border-2 border-[#b3261e] bg-[#fde7e5] p-4 text-chico text-[#7a1c16]">
              <strong>Borrador:</strong> faltan datos del titular ({faltan.join(", ")}). Completarlos en <code>legales/datos.ts</code> antes de publicar.
            </p>
          )}
          <p className="text-chico font-semibold text-tinta-suave">Legales · vigente desde el {fechaVigencia()}</p>
          <h1 className={`${afiche} mt-2 text-[clamp(2.6rem,1.6rem+4cqi,4.5rem)] leading-[0.92]`}>{titulo}</h1>
          <div className="mt-5 space-y-3 text-subtitulo">{bajada}</div>

          {children}

          {secciones.length > 0 && (
            <nav aria-label="Índice" className="mt-10 rounded-base border-2 border-tinta bg-superficie p-5">
              <p className="font-semibold">Índice</p>
              <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-chico @2xl:grid-cols-2">
                {secciones.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="underline-offset-4 hover:underline">
                      {i + 1}. {s.titulo}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-10 space-y-10">
            {secciones.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`} className="scroll-mt-6">
                <h2 id={`${s.id}-t`} className="text-subtitulo font-semibold">
                  {i + 1}. {s.titulo}
                </h2>
                <div className="legal mt-3 space-y-3 text-cuerpo leading-relaxed [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_strong]:font-semibold">{s.cuerpo}</div>
              </section>
            ))}
          </div>

          <nav aria-label="Otros documentos legales" className="mt-14 border-t-2 border-tinta pt-6">
            <p className="text-chico font-semibold">Otros documentos</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-chico">
              {DOCUMENTOS.filter((d) => d.href !== actual).map((d) => (
                <li key={d.href}>
                  <Link href={d.href} className="underline underline-offset-4">
                    {d.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Pie />
    </div>
  );
}

/** Enlace externo a un organismo oficial. */
export function Oficial({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
      {children}
    </a>
  );
}
