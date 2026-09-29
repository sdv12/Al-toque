import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { margen, separador, tituloSeccion } from "../estilos";
import { Foto } from "../Foto";

type Props = { config: ConfigDe<"alojamiento">; variante: VarianteDe<"alojamiento", "entorno"> };

const ASPECTOS = ["4 / 5", "4 / 3", "1 / 1", "3 / 4", "4 / 3"];
const GIROS = ["-rotate-[1.5deg]", "rotate-[1deg]", "-rotate-[0.6deg]", "rotate-[1.8deg]"];

export function Entorno({ config, variante }: Props) {
  const fotos = config.contenido.galeria ?? [];

  if (variante === "postales") {
    return (
      <section id="entorno" aria-labelledby="entorno-titulo" className={`${separador} ${margen} py-20`}>
        <h2 id="entorno-titulo" className={tituloSeccion}>
          Postales del lugar
        </h2>
        <ul className="mt-12 grid gap-10 @xl:grid-cols-2 @4xl:grid-cols-3">
          {fotos.map((f, i) => (
            <li key={i} className={`${GIROS[i % GIROS.length]} ${i % 3 === 1 ? "@4xl:mt-12" : ""}`}>
              <figure className="rounded-[4px] bg-superficie p-3 pb-4 shadow-[0_10px_24px_-14px_rgb(43_36_25/0.45)]">
                <Foto imagen={f} aspecto="4 / 3" sizes="(min-width: 1024px) 30vw, (min-width: 576px) 45vw, 90vw" className="rounded-[2px]" />
                <figcaption className="mt-3 font-nota text-subtitulo leading-none">{f.epigrafe || f.alt}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // collage en columnas
  return (
    <section id="entorno" aria-labelledby="entorno-titulo" className={`${separador} ${margen} py-20`}>
      <h2 id="entorno-titulo" className={tituloSeccion}>
        El entorno
      </h2>
      <div className="mt-10 columns-2 gap-3 @3xl:columns-3 @3xl:gap-4">
        {fotos.map((f, i) => (
          <figure key={i} className="mb-3 break-inside-avoid @3xl:mb-4">
            <Foto imagen={f} aspecto={ASPECTOS[i % ASPECTOS.length]} sizes="(min-width: 768px) 30vw, 50vw" />
            {f.epigrafe && <figcaption className="mt-1.5 font-nota text-chico text-tinta-suave">{f.epigrafe}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}
