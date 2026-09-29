import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { margen, separador, tituloSeccion } from "../estilos";

type Props = { config: ConfigDe<"alojamiento">; variante: VarianteDe<"alojamiento", "faq"> };

export function Faq({ config, variante }: Props) {
  const faq = config.contenido.faq ?? [];

  if (variante === "dos-columnas") {
    return (
      <section id="preguntas" aria-labelledby="preguntas-titulo" className={`${separador} ${margen} py-20`}>
        <h2 id="preguntas-titulo" className={tituloSeccion}>
          Antes de venir
        </h2>
        <dl className="mt-10 grid gap-x-12 gap-y-8 @3xl:grid-cols-2">
          {faq.map((f) => (
            <div key={f.id}>
              <dt className="font-display text-subtitulo">{f.pregunta}</dt>
              <dd className="mt-2 text-tinta-suave">{f.respuesta}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className={`${separador} ${margen} py-20`}>
      <div className="mx-auto max-w-3xl">
        <h2 id="preguntas-titulo" className={tituloSeccion}>
          Antes de venir
        </h2>
        <div className="mt-8">
          {faq.map((f) => (
            <details key={f.id} className="group border-b-[1.5px] border-dashed border-borde py-4">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 font-display text-subtitulo [&::-webkit-details-marker]:hidden">
                {f.pregunta}
                <span aria-hidden className="shrink-0 font-nota text-titulo leading-none text-acento-texto transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-tinta-suave">{f.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
