import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { margen, separador, tituloSeccion } from "../estilos";

type Props = { config: ConfigDe<"alojamiento">; variante: VarianteDe<"alojamiento", "testimonios"> };

export function Testimonios({ config, variante }: Props) {
  const testimonios = config.contenido.testimonios ?? [];

  if (variante === "postales") {
    return (
      <section id="huespedes" aria-labelledby="huespedes-titulo" className={`${separador} ${margen} py-20`}>
        <h2 id="huespedes-titulo" className={tituloSeccion}>
          Nos escribieron
        </h2>
        <ul className="mt-10 grid gap-6 @3xl:grid-cols-2">
          {testimonios.map((t) => (
            <li key={t.id}>
              <figure className="relative grid min-h-full gap-6 rounded-base border-[1.5px] border-borde bg-superficie p-6 @xl:grid-cols-[1fr_auto] @xl:gap-8">
                <blockquote>“{t.texto}”</blockquote>
                <figcaption className="border-t-[1.5px] border-dashed border-borde pt-4 @xl:w-36 @xl:border-l-[1.5px] @xl:border-t-0 @xl:pl-6 @xl:pt-0">
                  <span aria-hidden className="mb-3 ml-auto grid size-10 place-items-center rounded-[2px] border-[1.5px] border-dashed border-acento text-acento-texto">
                    ✦
                  </span>
                  <span className="block font-nota text-subtitulo leading-none">{t.autor}</span>
                  {t.detalle && <span className="mt-1 block text-mini text-tinta-suave">{t.detalle}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // cuaderno: página rayada tipo libro de visitas
  return (
    <section id="huespedes" aria-labelledby="huespedes-titulo" className={`${separador} ${margen} py-20`}>
      <div className="mx-auto max-w-3xl">
        <h2 id="huespedes-titulo" className={tituloSeccion}>
          Libro de visitas
        </h2>
        <div
          className="mt-8 rounded-base border-[1.5px] border-borde bg-superficie px-6 py-[1.65em] @xl:px-12"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 2.2rem, color-mix(in srgb, var(--lk-acento) 30%, transparent) 2.2rem, color-mix(in srgb, var(--lk-acento) 30%, transparent) calc(2.2rem + 1.5px), transparent calc(2.2rem + 1.5px)), repeating-linear-gradient(transparent 0 calc(1.65em - 1px), var(--lk-borde) calc(1.65em - 1px) 1.65em)",
          }}
        >
          {testimonios.map((t, i) => (
            <figure key={t.id} className={`pl-6 @xl:pl-4 ${i > 0 ? "mt-[1.65em]" : ""}`}>
              <blockquote className="leading-[1.65em]">{t.texto}</blockquote>
              <figcaption className="text-right font-nota text-subtitulo leading-[1.65em] text-acento-texto">
                — {t.autor}
                {t.detalle && <span className="text-tinta-suave">, {t.detalle}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
