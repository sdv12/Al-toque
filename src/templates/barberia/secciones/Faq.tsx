import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { seccion, tituloSeccion } from "../estilos";

type Props = { config: ConfigDe<"barberia">; variante: VarianteDe<"barberia", "faq"> };

export function Faq({ config }: Props) {
  const faq = config.contenido.faq ?? [];
  return (
    <section id="faq" aria-labelledby="faq-titulo" className={seccion}>
      <div className="grid gap-10 @3xl:grid-cols-12">
        <h2 id="faq-titulo" className={`${tituloSeccion} @3xl:col-span-4`}>
          Preguntas
        </h2>
        <div className="@3xl:col-span-8">
          {faq.map((f) => (
            <details key={f.id} className="group border-b border-borde py-5">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 font-display text-subtitulo [&::-webkit-details-marker]:hidden">
                {f.pregunta}
                <span aria-hidden className="shrink-0 text-acento transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-medida text-tinta-suave">{f.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
