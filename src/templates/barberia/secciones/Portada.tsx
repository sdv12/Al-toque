import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { boton } from "../estilos";
import { Foto } from "../Foto";
import { Navaja } from "../iconos";
import { BotonReservar } from "../reserva/BotonReservar";

type Props = { config: ConfigDe<"barberia">; variante: VarianteDe<"barberia", "portada"> };

/** Primera palabra arriba, el resto en itálica y corrido: el nombre es el protagonista. */
function partirNombre(nombre: string): [string, string] {
  const [primera = "", ...resto] = nombre.trim().split(/\s+/);
  return [primera, resto.join(" ")];
}

export function Portada({ config, variante }: Props) {
  const { negocio, contenido } = config;
  const destacada = contenido.galeria?.[0];
  const foto = destacada ?? contenido.equipo?.[0]?.foto;
  const epigrafe = destacada?.epigrafe;
  const [linea1, linea2] = partirNombre(negocio.nombre);

  if (variante === "retrato-partido") {
    return (
      <section id="inicio" aria-labelledby="portada-titulo" className="grid min-h-[var(--lk-alto-vista,100dvh)] @3xl:grid-cols-2">
        <div className="relative order-2 @3xl:order-1">
          <Foto imagen={foto} aspecto="auto" sizes="(min-width: 768px) 50vw, 100vw" destacada className="h-full min-h-[60cqi] rounded-none @3xl:min-h-full" />
        </div>
        <div className="order-1 flex flex-col justify-between gap-12 px-5 pb-12 pt-10 @3xl:order-2 @4xl:px-12 @4xl:pb-16">
          <p className="text-mini text-tinta-suave">{negocio.direccion}</p>
          <div>
            <h1 id="portada-titulo" className="font-display text-display">
              <span className="block">{linea1}</span>
              {linea2 && <span className="block italic text-acento-texto">{linea2}</span>}
            </h1>
            <p className="mt-6 max-w-[22ch] font-display text-subtitulo italic">{negocio.eslogan}</p>
            {negocio.subtitulo && <p className="mt-5 max-w-medida text-tinta-suave">{negocio.subtitulo}</p>}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              <BotonReservar className={boton.primario}>Reservar turno</BotonReservar>
              <a href="#servicios" className={boton.secundario}>
                Ver precios
              </a>
            </div>
          </div>
          <p className="text-chico text-tinta-suave">{negocio.horario}</p>
        </div>
      </section>
    );
  }

  // editorial
  return (
    <section id="inicio" aria-labelledby="portada-titulo" className="px-5 pb-20 pt-6 @4xl:px-12 @4xl:pb-28 @4xl:pt-10">
      <div className="flex items-center justify-between gap-4 border-b border-borde pb-3 text-mini text-tinta-suave">
        <span>{negocio.direccion}</span>
        <span className="hidden text-right @2xl:inline">{negocio.horario}</span>
      </div>

      <h1 id="portada-titulo" className="mt-10 font-display text-display @4xl:mt-14">
        <span className="block">{linea1}</span>
        {linea2 && <span className="block italic @3xl:pl-[14%]">{linea2}</span>}
      </h1>

      <div className="mt-12 grid gap-12 @3xl:grid-cols-12 @3xl:gap-8">
        <div className="@3xl:col-span-6 @3xl:pt-6">
          <Navaja className="w-16 text-acento" />
          <p className="mt-5 max-w-[24ch] font-display text-subtitulo italic">{negocio.eslogan}</p>
          {negocio.subtitulo && <p className="mt-5 max-w-medida text-tinta-suave">{negocio.subtitulo}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <BotonReservar className={boton.primario}>Reservar turno</BotonReservar>
            <a href="#servicios" className={boton.secundario}>
              Ver precios
            </a>
          </div>
          <p className="mt-6 text-chico text-tinta-suave @2xl:hidden">{negocio.horario}</p>
        </div>
        <figure className="@3xl:col-span-5 @3xl:col-start-8">
          <Foto imagen={foto} aspecto="4 / 5" sizes="(min-width: 768px) 40vw, 100vw" destacada />
          {epigrafe && <figcaption className="mt-3 font-display text-chico italic text-tinta-suave">{epigrafe}</figcaption>}
        </figure>
      </div>
    </section>
  );
}
