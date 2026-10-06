import { formatearDuracion, formatearPrecio, linkWhatsApp } from "@/core/lib/mensajes";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { bloque, boton, contenedor, margen, titulo } from "../estilos";
import { Foto } from "../Foto";
import type { PropsBloque } from "../tipos";

/* Bloques sin sistema: se renderizan en el servidor. */

export function Portada({ config, bloque: b, anclaId }: PropsBloque) {
  const { negocio } = config;
  const foto = config.contenido.galeria?.[0];
  const llamado = (
    <div className="mt-8 flex flex-wrap gap-3">
      <a href={linkWhatsApp(negocio.whatsapp, `Hola ${negocio.nombre}! Quería hacerles una consulta.`)} target="_blank" rel="noopener noreferrer" className={boton.primario}>
        <IconoWhatsApp className="size-5" /> Escribinos
      </a>
    </div>
  );

  if (b.variante === "partida") {
    return (
      <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} py-14 @4xl:py-20`}>
        <div className={`${contenedor} grid items-center gap-10 @4xl:grid-cols-2`}>
          <div>
            <h1 id={`${anclaId}-t`} className="font-display text-display">
              {negocio.nombre}
            </h1>
            <p className="mt-5 text-subtitulo">{negocio.eslogan}</p>
            {negocio.subtitulo && <p className="mt-4 max-w-medida text-tinta-suave">{negocio.subtitulo}</p>}
            {llamado}
          </div>
          <Foto imagen={foto ?? { alt: "Foto principal del negocio" }} aspecto="4 / 3" sizes="(min-width: 896px) 50vw, 100vw" />
        </div>
      </section>
    );
  }

  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} py-20 text-center @4xl:py-28`}>
      <div className={`${contenedor} flex flex-col items-center`}>
        <h1 id={`${anclaId}-t`} className="max-w-[16ch] font-display text-display">
          {negocio.nombre}
        </h1>
        <p className="mt-5 max-w-2xl text-subtitulo">{negocio.eslogan}</p>
        {negocio.subtitulo && <p className="mt-4 max-w-medida text-tinta-suave">{negocio.subtitulo}</p>}
        {llamado}
      </div>
    </section>
  );
}

export function Texto({ bloque: b, anclaId }: PropsBloque) {
  const datos = (b.datos ?? {}) as { titulo?: string; cuerpo?: string };
  const parrafos = (datos.cuerpo ?? "").split(/\n{2,}/).filter(Boolean);
  if (b.variante === "destacado") {
    return (
      <section id={anclaId} aria-labelledby={datos.titulo ? `${anclaId}-t` : undefined} className={`${margen} ${bloque}`}>
        <div className={`${contenedor} grid gap-6 rounded-base bg-superficie p-8 @4xl:grid-cols-[1fr_2fr] @4xl:p-12`}>
          {datos.titulo && (
            <h2 id={`${anclaId}-t`} className={`${titulo} border-l-4 border-acento pl-4`}>
              {datos.titulo}
            </h2>
          )}
          <div className="space-y-4 text-subtitulo">
            {parrafos.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id={anclaId} aria-labelledby={datos.titulo ? `${anclaId}-t` : undefined} className={`${margen} ${bloque}`}>
      <div className="mx-auto max-w-medida">
        {datos.titulo && (
          <h2 id={`${anclaId}-t`} className={titulo}>
            {datos.titulo}
          </h2>
        )}
        <div className="mt-5 space-y-4">
          {parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Servicios({ config, bloque: b, anclaId }: PropsBloque) {
  const servicios = config.contenido.servicios ?? [];
  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className={contenedor}>
        <h2 id={`${anclaId}-t`} className={titulo}>
          Servicios
        </h2>
        {b.variante === "tarjetas" ? (
          <ul className="mt-10 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
            {servicios.map((s) => (
              <li key={s.id} className="flex flex-col justify-between gap-6 rounded-base border border-borde bg-superficie p-6">
                <div>
                  <h3 className="text-subtitulo font-bold">{s.nombre}</h3>
                  {s.descripcion && <p className="mt-2 text-tinta-suave">{s.descripcion}</p>}
                </div>
                <p className="font-display text-subtitulo font-extrabold text-acento-texto">{formatearPrecio(s)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-8 divide-y divide-borde border-y border-borde">
            {servicios.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{s.nombre}</h3>
                  {s.descripcion && <p className="text-chico text-tinta-suave">{s.descripcion}</p>}
                </div>
                <p className="text-right">
                  <span className="font-bold tabular-nums">{formatearPrecio(s)}</span>
                  <span className="block text-mini text-tinta-suave">{formatearDuracion(s.duracionMin)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function Galeria({ config, bloque: b, anclaId }: PropsBloque) {
  const fotos = config.contenido.galeria ?? [];
  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className={contenedor}>
        <h2 id={`${anclaId}-t`} className={titulo}>
          Galería
        </h2>
        {b.variante === "tira" ? (
          <div role="region" aria-label="Fotos, desplazables horizontalmente" tabIndex={0} className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4">
            {fotos.map((f, i) => (
              <figure key={i} className="w-[75cqi] shrink-0 snap-start @3xl:w-[32cqi]">
                <Foto imagen={f} aspecto="4 / 5" sizes="(min-width: 768px) 32vw, 75vw" />
                {f.epigrafe && <figcaption className="mt-2 text-chico text-tinta-suave">{f.epigrafe}</figcaption>}
              </figure>
            ))}
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 @3xl:grid-cols-3 @3xl:gap-4">
            {fotos.map((f, i) => (
              <li key={i}>
                <figure>
                  <Foto imagen={f} aspecto="1 / 1" sizes="(min-width: 768px) 33vw, 50vw" />
                  {f.epigrafe && <figcaption className="mt-2 text-chico text-tinta-suave">{f.epigrafe}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function Testimonios({ config, anclaId }: PropsBloque) {
  const testimonios = config.contenido.testimonios ?? [];
  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className={contenedor}>
        <h2 id={`${anclaId}-t`} className={titulo}>
          Lo que dicen
        </h2>
        <ul className="mt-8 columns-1 gap-4 @3xl:columns-2">
          {testimonios.map((t) => (
            <li key={t.id} className="mb-4 break-inside-avoid">
              <figure className="rounded-base border border-borde bg-superficie p-6">
                <blockquote className="text-subtitulo">“{t.texto}”</blockquote>
                <figcaption className="mt-4 text-chico">
                  <span className="font-bold">{t.autor}</span>
                  {t.detalle && <span className="text-tinta-suave"> · {t.detalle}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq({ config, anclaId }: PropsBloque) {
  const faq = config.contenido.faq ?? [];
  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className="mx-auto max-w-3xl">
        <h2 id={`${anclaId}-t`} className={titulo}>
          Preguntas frecuentes
        </h2>
        <div className="mt-8 divide-y divide-borde border-y border-borde">
          {faq.map((f) => (
            <details key={f.id} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                {f.pregunta}
                <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-control bg-superficie-2 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-tinta-suave">{f.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Ubicacion({ config, bloque: b, anclaId }: PropsBloque) {
  const { negocio } = config;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion || negocio.nombre)}`;
  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className={b.variante === "compacta" ? "mx-auto max-w-3xl" : `${contenedor} grid gap-8 @3xl:grid-cols-2`}>
        <div>
          <h2 id={`${anclaId}-t`} className={titulo}>
            Dónde estamos
          </h2>
          {negocio.direccion && <p className="mt-4 text-subtitulo">{negocio.direccion}</p>}
          {negocio.horario && <p className="mt-2 text-tinta-suave">{negocio.horario}</p>}
          <a href={mapa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-semibold text-acento-texto underline underline-offset-4">
            Cómo llegar<span className="sr-only"> (Google Maps)</span>
          </a>
        </div>
        {b.variante !== "compacta" && (
          <a
            href={mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="grid min-h-56 place-items-center rounded-base border border-borde"
            style={{ background: "var(--lk-placeholder-trama), var(--lk-superficie-2)" }}
          >
            <span className="rounded-control bg-superficie px-5 py-2.5 font-semibold">
              Ver en el mapa<span className="sr-only"> (se abre en Google Maps)</span>
            </span>
          </a>
        )}
      </div>
    </section>
  );
}

export function Redes({ config, anclaId }: PropsBloque) {
  const { negocio } = config;
  return (
    <section id={anclaId} aria-label="Redes" className={`${margen} py-12`}>
      <div className={`${contenedor} flex flex-wrap justify-center gap-3`}>
        <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className={boton.primario}>
          <IconoWhatsApp className="size-5" /> WhatsApp
        </a>
        {negocio.instagram && (
          <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className={boton.secundario}>
            Instagram · @{negocio.instagram}
          </a>
        )}
      </div>
    </section>
  );
}

export function Cta({ config, bloque: b, anclaId }: PropsBloque) {
  const datos = (b.datos ?? {}) as { titulo?: string; texto?: string; boton?: string };
  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} py-12`}>
      <div className={`${contenedor} flex flex-wrap items-center justify-between gap-6 rounded-base bg-acento-relleno p-8 text-sobre-acento @4xl:p-12`}>
        <div>
          <h2 id={`${anclaId}-t`} className="font-display text-titulo font-extrabold">
            {datos.titulo}
          </h2>
          {datos.texto && <p className="mt-2 text-subtitulo">{datos.texto}</p>}
        </div>
        <a
          href={linkWhatsApp(config.negocio.whatsapp, `Hola ${config.negocio.nombre}! ${datos.titulo ?? ""}`.trim())}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-control bg-sobre-acento px-6 font-semibold text-acento-relleno"
        >
          <IconoWhatsApp className="size-5" /> {datos.boton || "Escribinos"}
        </a>
      </div>
    </section>
  );
}
