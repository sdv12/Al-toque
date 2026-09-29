import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { seccion, tituloSeccion } from "../estilos";
import { Foto } from "../Foto";

type Props = { config: ConfigDe<"barberia">; variante: VarianteDe<"barberia", "galeria"> };

/** Patrón de collage: se repite cada 5 fotos. */
const COLLAGE = [
  "col-span-6 row-span-2 @3xl:col-span-4",
  "col-span-3 @3xl:col-span-2",
  "col-span-3 @3xl:col-span-2",
  "col-span-3 @3xl:col-span-2 @3xl:col-start-2",
  "col-span-3 @3xl:col-span-3",
];

export function Galeria({ config, variante }: Props) {
  const fotos = config.contenido.galeria ?? [];

  if (variante === "tira") {
    return (
      <section id="galeria" aria-labelledby="galeria-titulo" className={seccion}>
        <h2 id="galeria-titulo" className={tituloSeccion}>
          Trabajos
        </h2>
        <div
          role="region"
          aria-label="Fotos de trabajos, desplazables horizontalmente"
          tabIndex={0}
          className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 @4xl:-mx-12 @4xl:px-12"
        >
          {fotos.map((f, i) => (
            <figure key={i} className="w-[72cqi] shrink-0 snap-start @3xl:w-[30cqi]">
              <Foto imagen={f} aspecto="3 / 4" sizes="(min-width: 768px) 30vw, 72vw" />
              <figcaption className="mt-2 flex gap-3 text-mini text-tinta-suave">
                <span className="tabular-nums text-acento-texto">Nº {String(i + 1).padStart(2, "0")}</span>
                {f.epigrafe}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  // collage irregular
  return (
    <section id="galeria" aria-labelledby="galeria-titulo" className={seccion}>
      <h2 id="galeria-titulo" className={tituloSeccion}>
        Trabajos
      </h2>
      <div className="mt-10 grid auto-rows-[38cqi] grid-cols-6 gap-3 @3xl:auto-rows-[16cqi] @3xl:gap-4">
        {fotos.map((f, i) => (
          <figure key={i} className={`relative ${COLLAGE[i % COLLAGE.length]}`}>
            <Foto imagen={f} aspecto="auto" sizes="(min-width: 768px) 50vw, 100vw" className="h-full" />
            {f.epigrafe && (
              <figcaption className="absolute bottom-0 left-0 m-2 rounded-base bg-fondo/85 px-2 py-1 font-display text-mini italic">
                {f.epigrafe}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
