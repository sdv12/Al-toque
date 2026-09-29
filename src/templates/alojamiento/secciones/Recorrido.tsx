import { formatearPesos } from "@/core/lib/mensajes";
import type { VarianteDe } from "@/core/registry";
import type { Propiedad } from "@/core/schema/contenido";
import type { ConfigDe } from "@/core/schema/landing-config";
import { boton, margen, separador } from "../estilos";
import { Foto } from "../Foto";
import { BotonVerFechas, Pista } from "../interactivos";

type Props = { config: ConfigDe<"alojamiento">; variante: VarianteDe<"alojamiento", "recorrido"> };

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const MASCOTAS = { si: "Se aceptan mascotas", no: "Sin mascotas", consultar: "Mascotas: consultar" } as const;

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** Datos duros de la casa, en formato de ficha de cuaderno. */
function Datos({ p }: { p: Propiedad }) {
  const filas = [
    ["Capacidad", `Hasta ${plural(p.maxHuespedes ?? p.capacidad, "persona", "personas")}`],
    ["Dormitorios", p.dormitorios === 0 ? "Monoambiente" : String(p.dormitorios)],
    ["Baños", String(p.banos)],
    ...(p.camas ? [["Camas", p.camas]] : []),
  ];
  return (
    <dl className="divide-y-[1.5px] divide-dashed divide-borde text-chico">
      {filas.map(([dt, dd]) => (
        <div key={dt} className="flex justify-between gap-4 py-2">
          <dt className="text-tinta-suave">{dt}</dt>
          <dd className="text-right">{dd}</dd>
        </div>
      ))}
    </dl>
  );
}

function Precio({ p }: { p: Propiedad }) {
  return (
    <p className="text-chico">
      {p.precioNoche === null ? (
        "Precio a consultar"
      ) : (
        <>
          <span className="font-display text-subtitulo">{formatearPesos(p.precioNoche)}</span> la noche
        </>
      )}
      <span className="text-tinta-suave"> · mínimo {plural(p.minNoches, "noche", "noches")}</span>
    </p>
  );
}

function Comodidades({ p }: { p: Propiedad }) {
  if (!p.amenities.length) return null;
  return (
    <div>
      <h3 className="font-nota text-subtitulo text-acento-texto">Qué hay</h3>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-chico">
        {p.amenities.map((a) => (
          <li key={a} className="flex gap-2">
            <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-acento" />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Reglas({ p }: { p: Propiedad }) {
  const { reglas } = p;
  return (
    <div>
      <h3 className="font-nota text-subtitulo text-acento-texto">Para tener en cuenta</h3>
      <ul className="mt-2 space-y-1.5 text-chico">
        <li>
          Entrada desde las {reglas.checkIn} h · salida hasta las {reglas.checkOut} h
        </li>
        <li>{MASCOTAS[reglas.mascotas]}</li>
        {reglas.senaPorcentaje > 0 && <li>Se reserva con una seña del {reglas.senaPorcentaje} %</li>}
        {reglas.otras.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

export function Recorrido({ config, variante }: Props) {
  const { negocio } = config;
  const casas = config.contenido.propiedades ?? [];

  const intro = (
    <div className={`${margen} grid gap-8 pb-14 pt-10 @3xl:grid-cols-12 @3xl:pt-16`}>
      <h1 id="casas-titulo" className="font-display text-display @3xl:col-span-8">
        {negocio.eslogan}
      </h1>
      {negocio.subtitulo && <p className="max-w-medida self-end text-tinta-suave @3xl:col-span-4">{negocio.subtitulo}</p>}
    </div>
  );

  if (variante === "capitulos") {
    return (
      <section id="casas" aria-labelledby="casas-titulo">
        {intro}
        {casas.map((p, i) => {
          const [principal, ...resto] = p.fotos;
          return (
            <article key={p.id} aria-labelledby={`casa-${p.id}`} className={`${separador} ${margen} grid gap-10 py-16 @3xl:grid-cols-12`}>
              <div className="grid grid-cols-2 gap-3 @3xl:col-span-7">
                <Foto
                  imagen={principal ?? { alt: `Frente de ${p.nombre}` }}
                  aspecto="4 / 3"
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="col-span-2"
                  destacada={i === 0}
                />
                {resto.map((f, j) => (
                  <Foto key={j} imagen={f} aspecto="1 / 1" sizes="(min-width: 768px) 27vw, 50vw" />
                ))}
              </div>
              <div className="space-y-6 self-start @3xl:sticky @3xl:top-6 @3xl:col-span-5">
                <div>
                  <p aria-hidden className="font-display text-display leading-none text-acento-texto">
                    {ROMANOS[i] ?? i + 1}
                  </p>
                  <h2 id={`casa-${p.id}`} className="mt-2 font-display text-titulo">
                    {p.nombre}
                  </h2>
                  {p.resumen && <p className="mt-3">{p.resumen}</p>}
                </div>
                <Precio p={p} />
                <Datos p={p} />
                <Comodidades p={p} />
                <Reglas p={p} />
                <BotonVerFechas propiedadId={p.id} className={boton.primario}>
                  Ver fechas de {p.nombre}
                </BotonVerFechas>
              </div>
            </article>
          );
        })}
      </section>
    );
  }

  // horizontal: cada casa es una pista con ficha, fotos y reglas
  return (
    <section id="casas" aria-labelledby="casas-titulo">
      {intro}
      {casas.map((p, i) => (
        <article key={p.id} aria-labelledby={`casa-${p.id}`} className={`${separador} pb-6 pt-10`}>
          <Pista
            etiqueta={`Fotos y datos de ${p.nombre}`}
            encabezado={
              <>
                <p className="font-nota text-subtitulo text-acento-texto">
                  Casa {i + 1} de {casas.length}
                </p>
                <h2 id={`casa-${p.id}`} className="font-display text-titulo">
                  {p.nombre}
                </h2>
              </>
            }
          >
            <div className="w-[82cqi] shrink-0 snap-start space-y-5 rounded-base border-[1.5px] border-borde bg-superficie p-6 @xl:w-[22rem]">
              {p.resumen && <p>{p.resumen}</p>}
              <Precio p={p} />
              <Datos p={p} />
              <BotonVerFechas propiedadId={p.id} className={`${boton.primario} w-full`}>
                Ver fechas
              </BotonVerFechas>
            </div>
            {(p.fotos.length ? p.fotos : [{ alt: `Foto de ${p.nombre}` }]).map((f, j) => (
              <figure key={j} className="w-[82cqi] shrink-0 snap-start @xl:w-[30rem]">
                <Foto imagen={f} aspecto="4 / 3" sizes="(min-width: 640px) 480px, 82vw" destacada={i === 0 && j === 0} />
                <figcaption className="mt-2 font-nota text-chico text-tinta-suave">{f.alt}</figcaption>
              </figure>
            ))}
            <div className="w-[82cqi] shrink-0 snap-start space-y-6 rounded-base border-[1.5px] border-dashed border-borde p-6 @xl:w-[22rem]">
              <Comodidades p={p} />
              <Reglas p={p} />
            </div>
          </Pista>
        </article>
      ))}
    </section>
  );
}
