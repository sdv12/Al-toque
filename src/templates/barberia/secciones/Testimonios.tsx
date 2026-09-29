import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { seccion } from "../estilos";

type Props = { config: ConfigDe<"barberia">; variante: VarianteDe<"barberia", "testimonios"> };

const GIROS = ["-rotate-[1.2deg]", "rotate-[0.8deg] @3xl:mt-16", "-rotate-[0.5deg]", "rotate-[1.4deg] @3xl:mt-10"];

export function Testimonios({ config, variante }: Props) {
  const testimonios = config.contenido.testimonios ?? [];

  if (variante === "cita-grande") {
    const [principal, ...resto] = testimonios;
    if (!principal) return null;
    return (
      <section id="testimonios" aria-label="Lo que dicen los clientes" className={seccion}>
        <figure className="mx-auto max-w-4xl">
          <span aria-hidden className="block font-display text-display leading-[0.6] text-acento">
            “
          </span>
          <blockquote className="font-display text-titulo italic">{principal.texto}</blockquote>
          <figcaption className="mt-6 text-chico text-tinta-suave">
            {principal.autor}
            {principal.detalle && ` · ${principal.detalle}`}
          </figcaption>
        </figure>
        {resto.length > 0 && (
          <ul className="mx-auto mt-16 grid max-w-4xl gap-8 border-t border-borde pt-10 @2xl:grid-cols-2">
            {resto.map((t) => (
              <li key={t.id}>
                <blockquote>
                  <p className="text-chico">“{t.texto}”</p>
                </blockquote>
                <p className="mt-2 text-mini text-tinta-suave">{t.autor}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  // recortes: papelitos pegados, levemente torcidos
  return (
    <section id="testimonios" aria-labelledby="testimonios-titulo" className={seccion}>
      <h2 id="testimonios-titulo" className="font-display text-titulo">
        Lo que dicen
      </h2>
      <ul className="mt-12 grid gap-8 @3xl:grid-cols-2 @3xl:gap-x-16">
        {testimonios.map((t, i) => (
          <li key={t.id} className={`max-w-md ${GIROS[i % GIROS.length]} ${i % 2 === 1 ? "@3xl:justify-self-end" : ""}`}>
            <figure className="rounded-base border border-borde bg-superficie p-6">
              <blockquote className="font-display text-subtitulo italic">“{t.texto}”</blockquote>
              <figcaption className="mt-4 flex justify-between gap-4 border-t border-dashed border-borde pt-3 text-mini text-tinta-suave">
                <span>{t.autor}</span>
                {t.detalle && <span>{t.detalle}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
