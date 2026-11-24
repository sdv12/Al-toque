"use client";

/*
 * Código: la página como un código anotado. Tapa azul con letras doradas, «Libros» y «Títulos» por
 * sección, artículos numerados solos (contador de CSS, así sigue el orden del configurador),
 * incisos a), b), c) y notas al margen.
 */
import type { ReactNode } from "react";
import { BotonReunion, ListaPreguntas, Mapa, Retrato, WidgetReunion, detalleArea, useDatos, useMenu } from "../datos";
import type { Diseno } from "./tipos";

/** Un artículo: número y nota al margen a la izquierda, texto a la derecha. */
function Articulo({ nota, titulo, children }: { nota?: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <article className="ju-art grid gap-x-8 gap-y-1 border-t border-borde py-6 @3xl:grid-cols-[11rem_1fr]">
      <div className="text-mini italic text-tinta-suave @3xl:text-right">
        <p className="ju-art-n font-cuerpo text-chico font-bold not-italic text-acento-texto" />
        {nota && <p className="mt-1">{nota}</p>}
      </div>
      <div>
        <h3 className="font-cuerpo text-cuerpo font-bold">
          {titulo}
          <span className="font-normal"> —</span>
        </h3>
        <div className="mt-1 text-cuerpo">{children}</div>
      </div>
    </article>
  );
}

function Titulo({ libro, titulo, id }: { libro: string; titulo: string; id?: string }) {
  return (
    <header id={id} className="scroll-mt-6 pb-6 pt-16 text-center">
      <p className="text-mini uppercase tracking-[0.3em] text-tinta-suave">{libro}</p>
      <h2 className="mt-3 text-titulo font-semibold uppercase tracking-[0.06em]">{titulo}</h2>
      <p aria-hidden className="mt-3 text-[color:var(--ju-detalle)]">
        ⁂
      </p>
    </header>
  );
}

const Pagina = ({ children }: { children: ReactNode }) => <div className="mx-auto max-w-[920px] px-5 @2xl:px-10">{children}</div>;

function Portada() {
  const { marca } = useDatos();
  const menu = useMenu();
  return (
    <header id="inicio">
      {/* Tapa del código */}
      <div className="bg-acento-relleno text-sobre-acento">
        <div className="mx-auto max-w-[1100px] px-5 pb-14 pt-6 @2xl:px-10 @2xl:pb-20">
          <nav aria-label="Secciones" className="flex items-center justify-between gap-6 border-b border-[color:var(--ju-detalle)] pb-4">
            <a href="#inicio" className="text-mini uppercase tracking-[0.25em] text-[color:var(--ju-detalle)] no-underline">
              {marca.nombre}
            </a>
            <ul className="hidden gap-6 text-mini uppercase tracking-[0.18em] opacity-85 @5xl:flex">
              {menu.map((m) => (
                <li key={m.id}>
                  <a href={`#${m.id}`} className="no-underline hover:opacity-100">
                    {m.texto}
                  </a>
                </li>
              ))}
            </ul>
            <BotonReunion className="cursor-pointer text-mini uppercase tracking-[0.18em] text-[color:var(--ju-detalle)] underline underline-offset-4">Reunión</BotonReunion>
          </nav>
          <div className="mx-auto mt-14 max-w-[44rem] border-4 border-double border-[color:var(--ju-detalle)] px-6 py-12 text-center @2xl:mt-20 @2xl:px-12">
            <p className="text-mini uppercase tracking-[0.35em] text-[color:var(--ju-detalle)]">Código del estudio</p>
            <p className="mt-5 font-display text-[clamp(2.4rem,7cqi,4.6rem)] font-semibold uppercase leading-[0.95] tracking-[0.04em] text-[color:var(--ju-detalle)]">{marca.nombre}</p>
            <p className="mt-5 text-mini uppercase tracking-[0.3em] opacity-80">Abogados · {marca.zona}</p>
            <p className="mt-6 text-mini uppercase tracking-[0.3em] opacity-70">Edición actualizada · comentada</p>
          </div>
        </div>
      </div>
      {/* Primera página: el artículo 1 */}
      <Pagina>
        <Titulo libro="Título preliminar" titulo="Del estudio" />
        <Articulo titulo="Objeto" nota={marca.horario}>
          <p className="font-display text-[clamp(1.6rem,3.6cqi,2.4rem)] leading-tight">{marca.eslogan || marca.nombre}</p>
          {marca.subtitulo && <p className="mt-4 text-tinta-suave">{marca.subtitulo}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <BotonReunion />
            <a href="#areas" className="ju-btn ju-btn-borde">
              Ver el índice
            </a>
          </div>
        </Articulo>
      </Pagina>
    </header>
  );
}

function Areas() {
  const { areas } = useDatos();
  return (
    <section>
      <Pagina>
        <Titulo id="areas" libro="Libro primero" titulo="De las áreas de práctica" />
        {areas.map((a) => (
          <Articulo key={a.id} titulo={a.nombre} nota={detalleArea(a)}>
            {a.descripcion && <p>{a.descripcion}</p>}
            <BotonReunion pre={{ servicioId: a.id }} className="mt-2 cursor-pointer text-chico font-semibold text-acento-texto underline underline-offset-4">
              Consultar por este artículo
            </BotonReunion>
          </Articulo>
        ))}
      </Pagina>
    </section>
  );
}

function Equipo() {
  const { equipo } = useDatos();
  return (
    <section>
      <Pagina>
        <Titulo id="equipo" libro="Libro segundo" titulo="De los letrados" />
        {equipo.map((p) => (
          <Articulo key={p.id} titulo={p.nombre} nota={p.matricula}>
            <div className="flex gap-5">
              <Retrato persona={p} className="aspect-[3/4] w-20 shrink-0 border border-borde grayscale" letras="text-subtitulo!" />
              <div>
                <p>
                  <em>{p.rol}.</em> {p.especialidad}.
                </p>
                {p.bio && <p className="mt-2 text-chico text-tinta-suave">{p.bio}</p>}
                <BotonReunion pre={{ profesionalId: p.id }} className="mt-2 cursor-pointer text-chico font-semibold text-acento-texto underline underline-offset-4">
                  Pedir reunión
                </BotonReunion>
              </div>
            </div>
          </Articulo>
        ))}
      </Pagina>
    </section>
  );
}

function Proceso() {
  const { pasos } = useDatos();
  return (
    <section>
      <Pagina>
        <Titulo id="proceso" libro="Libro tercero" titulo="Del procedimiento" />
        <Articulo titulo="Cómo trabajamos" nota="Sin costo de seguir adelante">
          <ol className="ju-incisos space-y-2">
            {pasos.map((p) => (
              <li key={p} className="ju-inciso">
                {p}
              </li>
            ))}
          </ol>
        </Articulo>
      </Pagina>
    </section>
  );
}

function Reunion() {
  const { wa } = useDatos();
  return (
    <section>
      <Pagina>
        <Titulo libro="Libro cuarto" titulo="De las reuniones" />
        <Articulo titulo="Pedido de reunión" nota="En el estudio o por videollamada">
          <p>El interesado elige el tema, el día y la hora. La reunión queda confirmada cuando el estudio responde por WhatsApp.</p>
          <a href={wa("Hola! Tengo una consulta urgente.")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-chico font-semibold text-acento-texto underline underline-offset-4">
            Urgencias: WhatsApp
          </a>
        </Articulo>
        <WidgetReunion className="mb-4 @3xl:ml-[13rem]" />
      </Pagina>
    </section>
  );
}

function Preguntas() {
  return (
    <section>
      <Pagina>
        <Titulo id="preguntas" libro="Disposiciones complementarias" titulo="Preguntas frecuentes" />
        <ListaPreguntas className="@3xl:ml-[13rem]" pregunta="font-bold" />
      </Pagina>
    </section>
  );
}

function Contacto() {
  const { marca, wa } = useDatos();
  return (
    <section>
      <Pagina>
        <Titulo id="contacto" libro="Disposiciones finales" titulo="Del domicilio constituido" />
        <Articulo titulo="Domicilio" nota={marca.horario}>
          <p>
            El estudio constituye domicilio en <strong>{marca.direccion}</strong>, donde serán válidas todas las visitas.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno">
              WhatsApp
            </a>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde">
              Cómo llegar
            </a>
          </div>
        </Articulo>
        <Mapa className="mb-16 aspect-[16/9] w-full border border-borde @3xl:ml-[13rem] @3xl:w-[calc(100%-13rem)]" />
      </Pagina>
    </section>
  );
}

export const codigo: Diseno = {
  Portada,
  secciones: { areas: Areas, equipo: Equipo, proceso: Proceso, reunion: Reunion, preguntas: Preguntas, contacto: Contacto },
  pie: "bg-superficie-2",
};
