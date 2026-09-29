import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { boton, seccion, tituloSeccion } from "../estilos";
import { Foto } from "../Foto";
import { IconoInstagram } from "../iconos";
import { BotonReservar } from "../reserva/BotonReservar";

type Props = { config: ConfigDe<"barberia">; variante: VarianteDe<"barberia", "equipo"> };

const primerNombre = (nombre: string) => nombre.replace(/[“”"].*?[“”"]/g, "").trim().split(/\s+/)[0] ?? nombre;
/** Si el nombre tiene apodo entre comillas ("Tano"), se usa el apodo para el botón. */
const apodo = (nombre: string) => /[“"](.+?)[”"]/.exec(nombre)?.[1] ?? primerNombre(nombre);

export function Equipo({ config, variante }: Props) {
  const equipo = config.contenido.equipo ?? [];

  if (variante === "retratos") {
    return (
      <section id="equipo" aria-labelledby="equipo-titulo" className={seccion}>
        <h2 id="equipo-titulo" className={tituloSeccion}>
          Los barberos
        </h2>
        <ul className="mt-12 grid gap-12 @2xl:grid-cols-2 @4xl:grid-cols-3 @4xl:gap-8">
          {equipo.map((p, i) => (
            <li key={p.id} className={i % 3 === 1 ? "@4xl:mt-20" : ""}>
              <Foto imagen={p.foto ?? { alt: `Retrato de ${p.nombre}` }} aspecto="3 / 4" sizes="(min-width: 1024px) 30vw, (min-width: 672px) 50vw, 100vw" />
              <h3 className="-mt-6 relative px-2 font-display text-titulo italic">{p.nombre}</h3>
              <p className="mt-2 px-2 text-chico text-tinta-suave">{p.especialidad}</p>
              <BotonReservar profesionalId={p.id} className={`${boton.secundario} px-2`}>
                Reservar con {apodo(p.nombre)}
              </BotonReservar>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // fichas: renglones alternados, número grande, reserva directa
  return (
    <section id="equipo" aria-labelledby="equipo-titulo" className={seccion}>
      <div className="max-w-medida">
        <h2 id="equipo-titulo" className={tituloSeccion}>
          Los barberos
        </h2>
        <p className="mt-4 text-tinta-suave">Cada uno tiene su mano. Elegí con quién, o dejá que te toque el primero libre.</p>
      </div>
      <ol className="mt-16 space-y-20">
        {equipo.map((p, i) => {
          const par = i % 2 === 1;
          return (
            <li key={p.id} className="grid items-end gap-6 @3xl:grid-cols-12 @3xl:gap-8">
              <div className={`@3xl:col-span-4 ${par ? "@3xl:col-start-9" : "@3xl:col-start-1"} @3xl:row-start-1`}>
                <Foto imagen={p.foto ?? { alt: `Retrato de ${p.nombre}` }} aspecto="4 / 5" sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
              <div className={`@3xl:col-span-6 @3xl:row-start-1 ${par ? "@3xl:col-start-2 @3xl:text-right" : "@3xl:col-start-6"}`}>
                <span aria-hidden className="font-display text-display italic leading-none text-acento-texto">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-titulo">{p.nombre}</h3>
                <p className="mt-2 text-tinta-suave">
                  {p.rol}
                  {p.especialidad && ` · ${p.especialidad}`}
                </p>
                {p.bio && <p className="mt-3 text-chico">{p.bio}</p>}
                <div className={`mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 ${par ? "@3xl:justify-end" : ""}`}>
                  <BotonReservar profesionalId={p.id} className={boton.fantasma}>
                    Reservar con {apodo(p.nombre)}
                  </BotonReservar>
                  {p.instagram && (
                    <a
                      href={`https://instagram.com/${p.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-chico text-tinta-suave hover:text-tinta"
                    >
                      <IconoInstagram className="size-4" />@{p.instagram}
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
