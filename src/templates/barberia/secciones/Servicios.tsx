import { formatearDuracion, formatearPrecio } from "@/core/lib/mensajes";
import type { VarianteDe } from "@/core/registry";
import type { Servicio } from "@/core/schema/contenido";
import type { ConfigDe } from "@/core/schema/landing-config";
import { boton, seccion, tituloSeccion } from "../estilos";
import { BotonReservar } from "../reserva/BotonReservar";

type Props = { config: ConfigDe<"barberia">; variante: VarianteDe<"barberia", "servicios"> };

function porCategoria(servicios: readonly Servicio[]): [string, Servicio[]][] {
  const grupos = new Map<string, Servicio[]>();
  for (const s of servicios) {
    const clave = s.categoria?.trim() || "Servicios";
    grupos.set(clave, [...(grupos.get(clave) ?? []), s]);
  }
  return [...grupos.entries()];
}

export function Servicios({ config, variante }: Props) {
  const grupos = porCategoria(config.contenido.servicios ?? []);

  if (variante === "carta-dos-columnas") {
    return (
      <section id="servicios" aria-labelledby="servicios-titulo" className={seccion}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="servicios-titulo" className="font-display text-display">
            Precios
          </h2>
          <BotonReservar className={boton.fantasma}>Reservar turno</BotonReservar>
        </div>
        <div className="mt-14 gap-16 @3xl:columns-2">
          {grupos.map(([categoria, lista]) => (
            <div key={categoria} className="mb-12 break-inside-avoid">
              <h3 className="border-b border-borde pb-2 text-chico text-tinta-suave">{categoria}</h3>
              <ul>
                {lista.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-6 border-b border-borde py-5">
                    <div>
                      <p className="font-display text-subtitulo">{s.nombre}</p>
                      {s.descripcion && <p className="mt-1 text-chico text-tinta-suave">{s.descripcion}</p>}
                      <p className="mt-1 text-mini text-tinta-suave">{formatearDuracion(s.duracionMin)}</p>
                    </div>
                    <p className="shrink-0 font-display text-titulo leading-none tabular-nums text-acento-texto">
                      {formatearPrecio(s)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // pizarra: carta de bar con líneas de puntos, cada renglón reserva ese servicio
  return (
    <section id="servicios" aria-labelledby="servicios-titulo" className={seccion}>
      <div className="grid gap-10 @3xl:grid-cols-12">
        <header className="self-start @3xl:sticky @3xl:top-10 @3xl:col-span-4">
          <h2 id="servicios-titulo" className={tituloSeccion}>
            La carta
          </h2>
          <p className="mt-4 max-w-[30ch] text-chico text-tinta-suave">
            Tocá un servicio para reservarlo. Pagás en el local: efectivo, transferencia o Mercado Pago.
          </p>
        </header>

        <div className="rounded-base border border-borde bg-superficie px-5 py-8 @xl:px-10 @3xl:col-span-8 @3xl:py-10">
          {grupos.map(([categoria, lista], i) => (
            <div key={categoria} className={i > 0 ? "mt-10" : ""}>
              <h3 className="font-display text-subtitulo italic text-acento-texto">{categoria}</h3>
              <ul className="mt-3">
                {lista.map((s) => (
                  <li key={s.id}>
                    <BotonReservar servicioId={s.id} className="group block w-full py-3 text-left">
                      <span className="flex items-baseline gap-3">
                        <span className="text-cuerpo transition-colors group-hover:text-acento-texto">
                          <span className="sr-only">Reservar </span>
                          {s.nombre}
                        </span>
                        <span aria-hidden className="min-w-6 flex-1 -translate-y-1 border-b border-dotted border-tinta-suave/60" />
                        <span className="font-display text-subtitulo tabular-nums">{formatearPrecio(s)}</span>
                      </span>
                      <span className="mt-0.5 block text-mini text-tinta-suave">
                        {[s.descripcion, formatearDuracion(s.duracionMin)].filter(Boolean).join(" · ")}
                      </span>
                    </BotonReservar>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
