import { formatearPrecio, linkWhatsApp } from "@/core/lib/mensajes";
import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { boton, margen, tile, tileBase, tituloSeccion } from "../estilos";
import { Foto } from "../Foto";
import { Carrusel, Comparador, FormularioContacto } from "../interactivos";

type Config = ConfigDe<"generico">;

function Encabezado({ id, titulo, bajada }: { id: string; titulo: string; bajada?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-tinta pb-4">
      <h2 id={id} className={tituloSeccion}>
        {titulo}
      </h2>
      {bajada && <p className="max-w-sm text-chico text-tinta-suave">{bajada}</p>}
    </div>
  );
}

/* ───────────── Casos ───────────── */

export function Casos({ config, variante }: { config: Config; variante: VarianteDe<"generico", "casos"> }) {
  const casos = config.contenido.casos ?? [];

  if (variante === "problema-solucion") {
    return (
      <section id="casos" aria-labelledby="casos-titulo" className={`${margen} py-20`}>
        <Encabezado id="casos-titulo" titulo="Trabajos" bajada="Cada trabajo empieza con un problema concreto." />
        {casos.map((c, i) => (
          <article key={c.id} aria-labelledby={`caso-${c.id}`} className="border-b border-borde py-12">
            <p className="text-mini text-tinta-suave">
              Caso {String(i + 1).padStart(2, "0")}
              {c.cliente && ` · ${c.cliente}`}
            </p>
            <h3 id={`caso-${c.id}`} className="mt-2 max-w-3xl font-display text-titulo">
              {c.titulo}
            </h3>
            <ol className="mt-8 grid gap-6 @3xl:grid-cols-3">
              {[
                ["El problema", c.problema],
                ["Lo que hicimos", c.solucion],
                ["El resultado", c.resultado],
              ]
                .filter(([, texto]) => texto)
                .map(([titulo, texto], j) => (
                  <li key={titulo} className={`${tileBase} ${j === 2 ? "border-transparent bg-tinta text-fondo" : "bg-superficie"}`}>
                    <p className={`font-display text-subtitulo ${j === 2 ? "" : "text-acento-texto"}`}>{titulo}</p>
                    <p className="mt-2">{texto}</p>
                  </li>
                ))}
            </ol>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <figure>
                <Foto imagen={c.antes ?? { alt: `Antes: ${c.titulo}` }} sizes="(min-width: 768px) 45vw, 50vw" />
                <figcaption className="mt-2 text-mini font-semibold">Antes</figcaption>
              </figure>
              <figure>
                <Foto imagen={c.despues ?? { alt: `Después: ${c.titulo}` }} sizes="(min-width: 768px) 45vw, 50vw" />
                <figcaption className="mt-2 text-mini font-semibold">Después</figcaption>
              </figure>
            </div>
          </article>
        ))}
      </section>
    );
  }

  // antes-despues: comparador deslizable + ficha del caso
  return (
    <section id="casos" aria-labelledby="casos-titulo" className={`${margen} py-20`}>
      <Encabezado id="casos-titulo" titulo="Antes y después" bajada="Deslizá la línea para comparar." />
      <div className="mt-10 space-y-16">
        {casos.map((c, i) => (
          <article key={c.id} aria-labelledby={`caso-${c.id}`} className="grid items-center gap-8 @4xl:grid-cols-12">
            <div className={`@4xl:col-span-7 ${i % 2 ? "@4xl:order-2" : ""}`}>
              <Comparador antes={c.antes} despues={c.despues} titulo={c.titulo} />
            </div>
            <div className="@4xl:col-span-5">
              {c.cliente && <p className="text-mini text-tinta-suave">{c.cliente}</p>}
              <h3 id={`caso-${c.id}`} className="mt-1 font-display text-titulo">
                {c.titulo}
              </h3>
              <dl className="mt-6 space-y-4">
                <div>
                  <dt className="text-chico font-semibold text-tinta-suave">El problema</dt>
                  <dd className="mt-1">{c.problema}</dd>
                </div>
                <div>
                  <dt className="text-chico font-semibold text-tinta-suave">Lo que hicimos</dt>
                  <dd className="mt-1">{c.solucion}</dd>
                </div>
              </dl>
              {c.resultado && <p className="mt-6 border-l-4 border-acento pl-4 font-display text-subtitulo">{c.resultado}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Servicios ───────────── */

export function Servicios({ config, variante }: { config: Config; variante: VarianteDe<"generico", "servicios"> }) {
  const servicios = config.contenido.servicios ?? [];

  if (variante === "bloques") {
    return (
      <section id="servicios" aria-labelledby="servicios-titulo" className={`${margen} py-20`}>
        <Encabezado id="servicios-titulo" titulo="Servicios" />
        <ul className="mt-10 grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3 @4xl:gap-4">
          {servicios.map((s, i) => (
            <li key={s.id} className={`${tileBase} flex flex-col justify-between gap-8 ${i === 0 ? "bg-superficie-2 @5xl:row-span-2" : "bg-superficie"}`}>
              <div>
                <p className="font-display text-subtitulo">{s.nombre}</p>
                {s.descripcion && <p className="mt-2 text-tinta-suave">{s.descripcion}</p>}
              </div>
              <p className="font-display text-titulo tabular-nums">{formatearPrecio(s)}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // lista: renglones grandes numerados
  return (
    <section id="servicios" aria-labelledby="servicios-titulo" className={`${margen} py-20`}>
      <Encabezado id="servicios-titulo" titulo="Servicios" bajada="Precios de referencia. Cada trabajo se presupuesta después de ver el lugar." />
      <ol className="mt-2">
        {servicios.map((s, i) => (
          <li key={s.id} className="group grid gap-x-8 gap-y-2 border-b border-borde py-7 @3xl:grid-cols-[4rem_minmax(0,1fr)_auto] @3xl:items-baseline">
            <span aria-hidden className="font-display text-subtitulo tabular-nums text-tinta-suave group-hover:text-acento-texto">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-display text-titulo">{s.nombre}</p>
              {s.descripcion && <p className="mt-2 max-w-medida text-tinta-suave">{s.descripcion}</p>}
            </div>
            <p className="font-display text-subtitulo tabular-nums">{formatearPrecio(s)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────── Testimonios ───────────── */

export function Testimonios({ config, variante }: { config: Config; variante: VarianteDe<"generico", "testimonios"> }) {
  const testimonios = config.contenido.testimonios ?? [];

  if (variante === "carrusel") {
    return (
      <section id="testimonios" aria-labelledby="testimonios-titulo" className={`${margen} py-20`}>
        <Encabezado id="testimonios-titulo" titulo="Lo que dicen" />
        <div className="mt-10">
          <Carrusel etiqueta="Testimonios de clientes">
            {testimonios.map((t) => (
              <figure key={t.id} className={`${tile} flex w-[85cqi] shrink-0 snap-start flex-col justify-between gap-8 @3xl:w-[42cqi]`}>
                <blockquote className="font-display text-subtitulo">“{t.texto}”</blockquote>
                <figcaption className="text-chico">
                  <span className="font-semibold">{t.autor}</span>
                  {t.detalle && <span className="text-tinta-suave"> · {t.detalle}</span>}
                </figcaption>
              </figure>
            ))}
          </Carrusel>
        </div>
      </section>
    );
  }

  const [principal, ...resto] = testimonios;
  if (!principal) return null;
  return (
    <section id="testimonios" aria-label="Lo que dicen los clientes" className={`${margen} py-20`}>
      <figure className="border-y-2 border-tinta py-12">
        <blockquote className="font-display text-titulo">
          <span aria-hidden className="text-acento-texto">
            “
          </span>
          {principal.texto}”
        </blockquote>
        <figcaption className="mt-6">
          <span className="font-semibold">{principal.autor}</span>
          {principal.detalle && <span className="text-tinta-suave"> · {principal.detalle}</span>}
        </figcaption>
      </figure>
      {resto.length > 0 && (
        <ul className="mt-8 grid gap-6 @3xl:grid-cols-2">
          {resto.map((t) => (
            <li key={t.id}>
              <blockquote>“{t.texto}”</blockquote>
              <p className="mt-2 text-chico text-tinta-suave">{t.autor}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ───────────── Contacto ───────────── */

export function Contacto({ config, variante }: { config: Config; variante: VarianteDe<"generico", "contacto"> }) {
  const { negocio } = config;
  const temas = (config.contenido.servicios ?? []).map((s) => s.nombre);
  const directo = (
    <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className={`${boton.enlace} inline-flex items-center gap-2`}>
      <IconoWhatsApp className="size-5" /> O escribinos directo
    </a>
  );

  if (variante === "dividido") {
    return (
      <section id="contacto" aria-labelledby="contacto-titulo" className={`${margen} py-20`}>
        <div className="grid overflow-hidden rounded-base border border-borde @4xl:grid-cols-2">
          <div className="flex flex-col justify-between gap-10 bg-tinta p-6 text-fondo @4xl:p-10">
            <h2 id="contacto-titulo" className="font-display text-display">
              Hablemos.
            </h2>
            <div className="space-y-2 text-chico">
              <p>{negocio.direccion}</p>
              <p>{negocio.horario}</p>
              <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4">
                <IconoWhatsApp className="size-5" /> Escribinos directo
              </a>
            </div>
          </div>
          <div className="bg-superficie p-6 @4xl:p-10">
            <FormularioContacto negocio={negocio} temas={temas} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className={`${margen} py-20`}>
      <div className="grid gap-10 @4xl:grid-cols-12">
        <div className="@4xl:col-span-5">
          <h2 id="contacto-titulo" className="font-display text-titulo">
            Pedinos presupuesto
          </h2>
          <p className="mt-4 max-w-sm text-tinta-suave">Completá esto y se abre WhatsApp con tu mensaje listo. Respondemos en el día.</p>
          <div className="mt-6">{directo}</div>
        </div>
        <div className="@4xl:col-span-7">
          <FormularioContacto negocio={negocio} temas={temas} />
        </div>
      </div>
    </section>
  );
}

/* ───────────── Preguntas ───────────── */

export function Faq({ config }: { config: Config; variante: VarianteDe<"generico", "faq"> }) {
  const faq = config.contenido.faq ?? [];
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className={`${margen} py-20`}>
      <Encabezado id="preguntas-titulo" titulo="Preguntas" />
      <div>
        {faq.map((f) => (
          <details key={f.id} className="group border-b border-borde">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-subtitulo [&::-webkit-details-marker]:hidden">
              {f.pregunta}
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-tinta text-cuerpo transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-medida pb-6 text-tinta-suave">{f.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
