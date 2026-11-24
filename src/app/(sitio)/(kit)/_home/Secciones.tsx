import Link from "next/link";
import { PLANTILLAS_DE_RUBRO as PLANTILLAS, paletaDe, registry } from "@/core/registry";

type Plantilla = (typeof PLANTILLAS)[number];
import { fuentes as fuentesAlojamiento } from "@/templates/alojamiento";
import { fuentes as fuentesEstetica } from "@/templates/estetica";
import { fuentes as fuentesJuridico } from "@/templates/juridico";
import { fuentes as fuentesBarberia } from "@/templates/barberia";
import { fuentes as fuentesGenerico } from "@/templates/generico";
import { formatearPesos } from "@/core/lib/mensajes";
import { niveles, planAgenda, planCaja, planPerfil, planes, preciosVigentesHasta, planesResto, proximaActualizacion } from "@/core/lib/precios";
import { AbrirAlto } from "../_alto/AbrirAlto";
import { TITULAR } from "../legales/datos";
import { DUDAS } from "../_alto/dudas";
import { BENEFICIOS, CONFIANZA, ESTUDIO, FICHAS, NECESIDADES, PASOS, PREGUNTAS_PORTADA, PROYECTOS, RUBROS } from "./contenido";
import { Navegador, Telefono } from "./Marcos";
import { CarruselProyectos } from "./CarruselProyectos";
import { SolucionesAcordeon, type SolucionVista } from "./SolucionesAcordeon";

const FUENTES: Record<Plantilla, string> = {
  barberia: fuentesBarberia,
  alojamiento: fuentesAlojamiento,
  generico: fuentesGenerico,
  estetica: fuentesEstetica,
  juridico: fuentesJuridico,
};

const DOMINIO = "altoque-cba.com.ar";

import { afiche, margen } from "./estilos";
export { afiche, margen };

/**
 * Secciones debajo del primer pantallazo: el navegador no las maqueta hasta que se acercan,
 * así que tampoco descarga antes de tiempo las tipografías de las plantillas que usan.
 */
const diferida = "[content-visibility:auto] [contain-intrinsic-size:auto_900px]";
const enlacePie = "underline-offset-4 hover:underline";

export const boton = {
  tinta:
    "inline-flex min-h-12 items-center justify-center rounded-control bg-tinta px-7 text-cuerpo font-semibold text-fondo transition-transform hover:-translate-y-0.5 active:translate-y-0",
  amarillo:
    "inline-flex min-h-12 items-center justify-center rounded-control bg-acento-relleno px-7 text-cuerpo font-semibold text-sobre-acento transition-transform hover:-translate-y-0.5 active:translate-y-0",
  contorno:
    "inline-flex min-h-12 items-center justify-center rounded-control border-2 border-tinta px-7 text-cuerpo font-semibold text-tinta transition-colors hover:bg-tinta hover:text-fondo",
};

/* ───────────── Encabezado ───────────── */

/**
 * Marca. Sobre papel, "toque" lleva el resaltador (media franja). Sobre fondo oscuro la franja
 * dejaría la mitad de arriba de las letras contra el negro: ahí va el bloque amarillo completo.
 */
export function Marca({ className = "", sobreOscuro = false }: { className?: string; sobreOscuro?: boolean }) {
  return (
    <span className={`${afiche} whitespace-nowrap font-extrabold leading-none ${className}`}>
      Al{" "}
      {sobreOscuro ? (
        <span className="bg-acento-relleno px-[0.12em] text-sobre-acento [box-decoration-break:clone]">toque</span>
      ) : (
        <span className="resaltado">toque</span>
      )}
    </span>
  );
}

/** `desde`: en otras páginas que no son la portada, los links de secciones apuntan a "/#…". */
export function Encabezado({ desde = "", actual }: { desde?: "" | "/"; actual?: "/web" | "/turnos" | "/caja" | "/resto" }) {
  return (
    <header className={`${margen} flex h-18 items-center justify-between gap-3 py-4`}>
      <Link href="/" aria-label="Al Toque, inicio" className="text-[1.6rem] @md:text-[2rem]">
        <Marca />
      </Link>
      <nav aria-label="Principal" className="flex items-center gap-1">
        <ul className="hidden items-center gap-1 @4xl:flex">
          {[
            [`${desde}#soluciones`, "Soluciones"],
            [`${desde}#como-funciona`, "Cómo funciona"],
            [`${desde}#proyectos`, "Proyectos"],
            ["/web#precios", "Precios"],
            [`${desde}#contacto`, "Contacto"],
          ].map(([href, texto]) => (
            <li key={href}>
              <a href={href} aria-current={href === actual ? "page" : undefined} className="inline-flex min-h-11 items-center rounded-control px-3.5 text-chico font-semibold hover:bg-superficie-2">
                {texto}
              </a>
            </li>
          ))}
        </ul>
        <AbrirAlto className={`${boton.tinta} min-h-11 whitespace-nowrap px-5 text-chico`}>
          <span className="@md:hidden">Mi solución</span>
          <span className="hidden @md:inline">Encontrar mi solución</span>
        </AbrirAlto>
      </nav>
    </header>
  );
}

/* ───────────── Hero ───────────── */

/** Abanico de celulares con los tres productos: una página, la agenda de turnos y la caja. */
function Abanico() {
  const disposicion = [
    { src: "/muestras/barberia-celular.jpg", alt: "Una página de barbería en un celular", clase: "left-[1%] top-[12%] -rotate-[9deg] z-10" },
    { src: "/muestras/agenda-base.jpg", alt: "La agenda de turnos: elegir servicio, día y horario", clase: "left-[21%] top-[2%] -rotate-[3deg] z-30" },
    { src: "/muestras/caja-vender.jpg", alt: "La caja de una verdulería con botones grandes por producto", clase: "left-[42%] top-[6%] rotate-[3.5deg] z-20" },
    { src: "/muestras/alojamiento-celular.jpg", alt: "Una página de casas de campo en un celular", clase: "left-[62%] top-[14%] rotate-[9deg] z-10" },
  ];
  return (
    <div className="relative mx-auto aspect-[10/8] w-full max-w-[40rem]">
      {disposicion.map(({ src, alt, clase }) => (
        <Telefono
          key={src}
          src={src}
          alt={alt}
          sizes="(min-width: 1024px) 15vw, 34vw"
          className={`absolute w-[36%] transition-transform duration-300 hover:-translate-y-3 ${clase}`}
          prioridad
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className={`${margen} pb-14 pt-4 @4xl:pb-20 @5xl:pt-10`}>
      <div className="grid items-center gap-12 @5xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] @5xl:gap-10">
        <div>
          {/* En pantallas grandes, dos líneas: «La solución para tu negocio,» y «al toque.». */}
          <h1 id="hero-titulo" className={`${afiche} text-[clamp(2.75rem,0.9rem+7cqi,4.5rem)] leading-[0.9] @5xl:text-[clamp(3rem,3.8cqi,5.75rem)]`}>
            La solución para tu negocio, <br className="hidden @5xl:block" />
            <span className="resaltado whitespace-nowrap">al toque.</span>
          </h1>
          <p className="mt-8 max-w-[38ch] text-subtitulo">
            Páginas web, turnos y herramientas de gestión. Soluciones simples, pensadas para negocios reales: peluquerías, comercios, alojamientos y
            oficios.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AbrirAlto className={boton.tinta}>Encontrar mi solución</AbrirAlto>
            <a href="#soluciones" className={boton.contorno}>
              Ver demos
            </a>
          </div>
          <p className="mt-5 text-chico text-tinta-suave">Todas las demos se prueban gratis y sin registrarse.</p>
        </div>
        <Abanico />
      </div>
    </section>
  );
}

/* ───────────── Selector de necesidades ───────────── */

export function Necesidades() {
  return (
    <section aria-labelledby="necesidades-titulo" className={`${margen} pb-4 pt-14 @4xl:py-20`}>
      <h2 id="necesidades-titulo" className={`${afiche} text-titulo`}>
        ¿Qué necesitás <span className="resaltado">hoy?</span>
      </h2>
      <ul className="mt-10 grid gap-3 @3xl:grid-cols-2 @6xl:grid-cols-5">
        {NECESIDADES.map((n) => (
          <li key={n.href} className="@3xl:last:col-span-2 @6xl:last:col-span-1">
            <a
              href={n.href}
              className="group flex h-full min-h-28 flex-col justify-between gap-4 rounded-base border-2 border-tinta bg-superficie p-5 transition-colors hover:bg-acento-relleno hover:text-sobre-acento"
            >
              <span className={`${afiche} text-[clamp(1.5rem,1.2rem+1cqi,1.9rem)] leading-none`}>{n.texto}</span>
              <span className="flex items-center justify-between gap-3 text-chico">
                {n.detalle}
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-current">
                  →
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-chico">
        ¿No sabés por dónde empezar?{" "}
        <AbrirAlto className="font-semibold underline underline-offset-4">Contale a Alto de tu negocio y te recomienda</AbrirAlto>.
      </p>
    </section>
  );
}

/* ───────────── Rubros ───────────── */

/** Los rubros pasan solos en una sola línea; la lista va dos veces (la copia, oculta al lector). */
export function Rubros() {
  const lista = (copia: boolean) => (
    <ul aria-hidden={copia || undefined} className={`flex shrink-0 items-center ${afiche} text-[clamp(1.25rem,1.6cqi,2rem)] leading-none`}>
      {RUBROS.map((r) => (
        <li key={r} className="flex items-center gap-5 whitespace-nowrap pr-5">
          {r}
          {/* Dibujado (no el carácter ✳): en los celulares ese carácter sale como emoji verde. */}
          <svg aria-hidden viewBox="0 0 24 24" className="size-[0.8em] text-acento" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
          </svg>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Para qué rubros" className="overflow-hidden bg-tinta py-4 text-fondo @4xl:py-5">
      <div className="marquesina">
        {lista(false)}
        {lista(true)}
      </div>
    </section>
  );
}

/* ───────────── Proyectos ───────────── */

/** Disposición destacada: los dos primeros grandes, el resto en una fila de tres. */
export function Proyectos() {
  return (
    <section id="proyectos" aria-labelledby="proyectos-titulo" className={`${diferida} ${margen} scroll-mt-4 py-14 @4xl:py-24`}>
      <div className="grid gap-6 @5xl:grid-cols-12 @5xl:items-end">
        <h2 id="proyectos-titulo" className={`${afiche} text-titulo @5xl:col-span-7`}>
          Ya están <span className="resaltado">online</span>
        </h2>
        <p className="max-w-medida text-subtitulo @5xl:col-span-5">
          Algunos sitios que hicimos para negocios y proyectos de Córdoba. Entrá y recorrelos: están funcionando.
        </p>
      </div>
      <CarruselProyectos etiqueta="Sitios que ya están online">
        {PROYECTOS.map((p) => {
          const dominio = new URL(p.url).host;
          return (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
              <Navegador
                src={`/proyectos/${p.id}.jpg`}
                alt={`Portada del sitio de ${p.nombre}`}
                url={dominio}
                sizes="(min-width: 896px) 52rem, 86vw"
                className="transition-transform duration-200 group-hover:-translate-y-1"
              />
              {/* En el celular: texto centrado y un botón abajo; en pantallas grandes, la flecha al costado. */}
              <div className="mt-5 flex flex-col items-center gap-4 text-center @4xl:mt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:text-left">
                <div className="min-w-0">
                  <p className="text-chico text-tinta-suave">{p.rubro}</p>
                  <h3 className={`${afiche} mt-1 text-[clamp(1.75rem,1.3rem+1.6cqi,2.5rem)] leading-none`}>{p.nombre}</h3>
                  <p className="mt-2 text-chico">{p.texto}</p>
                </div>
                <span aria-hidden className={`${boton.tinta} gap-2 @4xl:hidden`}>
                  Visitar el sitio
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 14 14 6M8 6h6v6" />
                  </svg>
                </span>
                <span aria-hidden className="hidden size-10 shrink-0 place-items-center rounded-full border-2 border-tinta transition-colors group-hover:bg-acento-relleno @4xl:grid">
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 14 14 6M8 6h6v6" />
                  </svg>
                </span>
              </div>
              <span className="sr-only"> (se abre el sitio en otra pestaña)</span>
            </a>
          );
        })}
      </CarruselProyectos>
    </section>
  );
}

/* ───────────── Plantillas ───────────── */

export function Plantillas() {
  return (
    <section id="plantillas" aria-labelledby="plantillas-titulo" className={`${margen} scroll-mt-4 py-14 @4xl:py-24`}>
      <div className="grid gap-6 @5xl:grid-cols-12 @5xl:items-end">
        <h2 id="plantillas-titulo" className={`${afiche} text-titulo @5xl:col-span-7`}>
          No es la misma página <span className="resaltado">con otro color</span>
        </h2>
        <p className="max-w-medida text-subtitulo @5xl:col-span-5">
          Cada plantilla está armada para su rubro: cambia la estructura, cómo se navega y cómo tu cliente pide un turno o una fecha.
        </p>
      </div>

      <div className="mt-16">
        {VISTAS_FICHA.map((f, i) => (
          <FichaPlantilla key={f.id} ficha={f} indice={i} total={VISTAS_FICHA.length} />
        ))}
      </div>
    </section>
  );
}

type VistaFicha = {
  id: string;
  nombre: string;
  rubro: string;
  fondo: string;
  /** Clase de next/font que trae la fuente display, y la familia para el título. */
  fuente: string;
  fuenteDisplay: string;
  /** Clases extra del título (p. ej. el peso fino de Estudio). */
  claseTitulo?: string;
  bajada: string;
  destacados: readonly string[];
  acentos: readonly { nombre: string; hex: string }[];
  componentes?: readonly { nombre: string; detalle: string }[];
  usar: string;
  demo: string;
};

/** Las plantillas de rubro y Estudio (Portfolio modular con su estilo sobrio), en ese orden. */
const VISTAS_FICHA: VistaFicha[] = [
  ...PLANTILLAS.map((p): VistaFicha => {
    const { meta } = registry[p];
    const ficha = FICHAS[p];
    return {
      id: p,
      nombre: meta.nombre,
      rubro: meta.rubro,
      fondo: paletaDe(p, meta.modos[0]).fondo,
      fuente: FUENTES[p],
      fuenteDisplay: ficha.fuenteDisplay,
      bajada: ficha.bajada,
      destacados: ficha.destacados,
      acentos: meta.acentos,
      usar: `/configurador?plantilla=${p}`,
      demo: `/l/${ficha.slug}`,
    };
  }),
  {
    id: ESTUDIO.id,
    nombre: ESTUDIO.nombre,
    rubro: ESTUDIO.rubro,
    fondo: ESTUDIO.fondo,
    fuente: FUENTES[ESTUDIO.plantilla],
    fuenteDisplay: FICHAS[ESTUDIO.plantilla].fuenteDisplay,
    claseTitulo: "font-extralight tracking-[0.01em]",
    bajada: ESTUDIO.bajada,
    destacados: ESTUDIO.destacados,
    acentos: ESTUDIO.acentos,
    componentes: ESTUDIO.componentes,
    usar: `/configurador?plantilla=${ESTUDIO.id}`,
    demo: ESTUDIO.ruta,
  },
];

function FichaPlantilla({ ficha, indice, total }: { ficha: VistaFicha; indice: number; total: number }) {
  const derecha = indice % 2 === 1;

  return (
    <article
      id={`ficha-${ficha.id}`}
      aria-labelledby={`plantilla-${ficha.id}`}
      className={`${diferida} grid scroll-mt-4 grid-cols-[minmax(0,1fr)] gap-10 border-t-2 border-tinta py-16 @5xl:grid-cols-12 @5xl:items-center @5xl:gap-12`}
    >
      <div className={`min-w-0 @5xl:col-span-7 ${derecha ? "@5xl:order-2" : ""}`}>
        {/* Escenario con el fondo propio de la plantilla */}
        <div className="relative rounded-base px-4 pb-14 pt-6 @3xl:px-8 @3xl:pb-16 @3xl:pt-8" style={{ background: ficha.fondo }}>
          <Navegador
            src={`/muestras/${ficha.id}-escritorio.jpg`}
            alt={`La plantilla ${ficha.nombre} en computadora`}
            url={`${DOMINIO}${ficha.demo}`}
            sizes="(min-width: 1024px) 50vw, 92vw"
          />
          <Telefono
            src={`/muestras/${ficha.id}-celular.jpg`}
            alt={`La plantilla ${ficha.nombre} en celular`}
            sizes="(min-width: 1024px) 12vw, 28vw"
            className={`absolute -bottom-6 w-[26%] ${derecha ? "left-4 -rotate-[4deg] @3xl:left-8" : "right-4 rotate-[4deg] @3xl:right-8"}`}
          />
        </div>
      </div>

      <div className="min-w-0 @5xl:col-span-5">
        <p className="text-chico text-tinta-suave">
          <span className="tabular-nums">0{indice + 1}</span> / 0{total} · {ficha.rubro}
        </p>
        <h3 id={`plantilla-${ficha.id}`} className={`${ficha.fuente} mt-3 text-titulo leading-[0.95] ${ficha.claseTitulo ?? ""}`} style={{ fontFamily: ficha.fuenteDisplay }}>
          {ficha.nombre}
        </h3>
        <p className="mt-4 text-subtitulo">{ficha.bajada}</p>
        <ul className="mt-6 space-y-3">
          {ficha.destacados.map((d) => (
            <li key={d} className="flex gap-3">
              <span aria-hidden className="mt-[0.55em] h-2 w-4 shrink-0 bg-acento" />
              {d}
            </li>
          ))}
        </ul>
        {ficha.componentes && (
          <div className="mt-7">
            <p className="text-mini text-tinta-suave">Componentes que podés prender, apagar y ordenar</p>
            <ul className="mt-3 grid gap-2 @xl:grid-cols-2">
              {ficha.componentes.map((c) => (
                <li key={c.nombre} className="rounded-base border-2 border-tinta/15 bg-superficie px-3.5 py-2.5">
                  <span className="block text-chico font-semibold">{c.nombre}</span>
                  <span className="block text-mini text-tinta-suave">{c.detalle}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-7">
          <p className="text-mini text-tinta-suave">Colores pensados para esta plantilla</p>
          <ul className="mt-2 flex gap-2">
            {ficha.acentos.map((a) => (
              <li key={a.hex}>
                <span className="block size-8 rounded-full border-2 border-tinta/15" style={{ background: a.hex }} title={a.nombre} />
                <span className="sr-only">{a.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={ficha.usar} className={boton.tinta}>
            Usar esta plantilla
          </Link>
          <Link href={ficha.demo} className={boton.contorno}>
            Ver la demo<span className="sr-only"> de {ficha.nombre}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ───────────── Soluciones ───────────── */

const precio = (p: { unico: number; mensual: number }, desde: boolean) => ({ unico: formatearPesos(p.unico), mensual: formatearPesos(p.mensual), desde });

function soluciones(): SolucionVista[] {
  const [vidriera] = planes();
  const perfil = planPerfil();
  return [
    {
      id: "web",
      nombre: "Al Toque Web",
      para: "Peluquerías, alojamientos, oficios y profesionales",
      titulo: "Tu página, lista para que te encuentren",
      texto: "Plantillas pensadas para tu rubro que cambiás a tu gusto, mirando cómo queda.",
      incluye: ["Tus servicios, precios y horarios", "Consultas y reservas por WhatsApp", "Lista para Google y para compartir"],
      precio: precio(perfil, true),
      ver: { href: "/web", texto: "Conocer Al Toque Web" },
      demo: { href: `/l/${FICHAS.barberia.slug}`, texto: "Ver una demo" },
      imagen: { src: "/muestras/barberia-escritorio.jpg", alt: "Una página de barbería hecha con Al Toque Web", marco: "navegador", url: `${DOMINIO}/l/${FICHAS.barberia.slug}` },
    },
    {
      id: "estudio",
      nombre: "Al Toque Estudio",
      para: "Arquitectos, diseñadores, constructoras y profesionales",
      titulo: "Tu obra, a pantalla completa",
      texto: "Una página sobria y elegante, donde tu trabajo habla por vos y cada visita puede terminar en una consulta.",
      incluye: ["Portada con fotos que pasan solas", "Proyectos con antes y después", "Servicios y contacto que terminan en tu WhatsApp"],
      precio: precio(vidriera!, true),
      ver: { href: `/web#ficha-${ESTUDIO.id}`, texto: "Conocer Al Toque Estudio" },
      demo: { href: ESTUDIO.ruta, texto: "Ver la demo" },
      imagen: { src: `/muestras/${ESTUDIO.id}-escritorio.jpg`, alt: "La página de un estudio de arquitectura hecha con Al Toque Estudio", marco: "navegador", url: `${DOMINIO}${ESTUDIO.ruta}` },
    },
    {
      id: "belleza",
      nombre: "Al Toque Belleza",
      para: "Peluquerías, uñas, estética y spa",
      titulo: "Tu salón, con el estilo que elijas",
      texto: "Una página pensada para tu salón, con diez diseños para elegir: del rosa clásico a la revista, la vidriera con neón o los setentas.",
      incluye: ["Cartel de abierto ahora con el horario del día", "Servicios con duración y precio", "Consultas por WhatsApp, trabajos e Instagram"],
      precio: precio(vidriera!, true),
      ver: { href: "/web#ficha-estetica", texto: "Conocer Al Toque Belleza" },
      demo: { href: `/l/${FICHAS.estetica.slug}`, texto: "Ver la demo" },
      imagen: { src: "/muestras/estetica-escritorio.jpg", alt: "La página de un salón de belleza hecha con Al Toque Belleza", marco: "navegador", url: `${DOMINIO}/l/${FICHAS.estetica.slug}` },
    },
    {
      id: "legal",
      nombre: "Al Toque Legal",
      para: "Abogados y estudios jurídicos",
      titulo: "Tu estudio, claro y confiable",
      texto: "Una página seria para tu estudio, con diseños propios: clásico, editorial, contemporáneo, expediente, código, mármol y nocturno.",
      incluye: ["Áreas de práctica y equipo con matrícula", "Reuniones en el estudio o por videollamada", "Cómo trabajan y preguntas frecuentes"],
      precio: precio(vidriera!, true),
      ver: { href: "/web#ficha-juridico", texto: "Conocer Al Toque Legal" },
      demo: { href: `/l/${FICHAS.juridico.slug}`, texto: "Ver la demo" },
      imagen: { src: "/muestras/juridico-escritorio.jpg", alt: "La página de un estudio jurídico hecha con Al Toque Legal", marco: "navegador", url: `${DOMINIO}/l/${FICHAS.juridico.slug}` },
    },
    {
      id: "turnos",
      nombre: "Al Toque Turnos",
      para: "Peluquerías, estética, clases, talleres y estudios",
      titulo: "Reservas online, a toda hora",
      texto: "Tus clientes eligen el servicio y el horario sin tener que escribirte, y cada reserva te llega lista para confirmar. Funciona con o sin página web.",
      incluye: ["Agenda con horarios libres", "Panel con la agenda, la caja y tus números", "Nueve diseños para elegir"],
      precio: precio(planAgenda(), false),
      ver: { href: "/turnos", texto: "Conocer Al Toque Turnos" },
      demo: { href: "/turnos/demo#/probar", texto: "Probala con tus datos" },
      imagen: { src: "/muestras/agenda-base.jpg", alt: "La agenda de turnos en un celular", marco: "telefono" },
    },
    {
      id: "caja",
      nombre: "Al Toque Caja",
      para: "Verdulerías, almacenes, kioscos y dietéticas",
      titulo: "Tu comercio, en orden",
      texto: "Cobrás en segundos, por kilo o por unidad, y al final del día sabés cuánto vendiste sin hacer cuentas. Funciona en el celular que ya tenés.",
      incluye: ["Productos de tu rubro ya cargados", "Efectivo, transferencia, QR y fiado", "Apertura, arqueo y cierre"],
      precio: precio(planCaja(), true),
      ver: { href: "/caja", texto: "Conocer Al Toque Caja" },
      demo: { href: "/c/demo-verduleria", texto: "Ver una demo" },
      imagen: { src: "/muestras/caja-vender.jpg", alt: "La caja de una verdulería en un celular", marco: "telefono" },
    },
    {
      id: "resto",
      nombre: "Al Toque Resto",
      para: "Restaurantes, bares, cafés, pizzerías y rotiserías",
      titulo: "Tu restaurante, al toque",
      texto: "Todo tu local en un solo lugar: lo que ven tus clientes y lo que usa tu equipo, conectados entre sí.",
      incluye: ["Carta con pedidos para retirar o con envío", "Reservas por turno y QR por mesa", "Mesas, comandas, cuenta dividida y números"],
      precio: precio(planesResto().carta, true),
      ver: { href: "/resto", texto: "Conocer Al Toque Resto" },
      demo: { href: "/resto/demo", texto: "Ver una demo" },
      imagen: { src: "/muestras/resto-trattoria.jpg", alt: "La web de una pizzería hecha con Al Toque Resto, en un celular", marco: "telefono" },
    },
    {
      id: "tienda",
      nombre: "Al Toque Tienda",
      para: "Para vender por internet",
      titulo: "Próximamente",
      texto:
        "Una tienda con catálogo, carrito y pedidos online. La estamos preparando: mientras tanto, tu página puede mostrar tu catálogo y recibir pedidos por WhatsApp.",
      incluye: [],
      ver: { href: "/tienda", texto: "Sumarme a la lista de espera" },
    },
  ];
}

export function Soluciones({ whatsapp }: { whatsapp: string | undefined }) {
  return (
    <section id="soluciones" aria-labelledby="soluciones-titulo" className={`${diferida} ${margen} scroll-mt-4 pb-6 pt-14 @4xl:py-24`}>
      <div className="grid gap-6 @5xl:grid-cols-12 @5xl:items-end">
        <h2 id="soluciones-titulo" className={`${afiche} text-titulo @5xl:col-span-7`}>
          Una solución para <span className="resaltado">cada necesidad</span>
        </h2>
        <p className="max-w-medida text-subtitulo @5xl:col-span-5">Empezá por la que más te urge y sumá las otras cuando las necesites: funcionan juntas.</p>
      </div>
      <SolucionesAcordeon items={soluciones()} whatsapp={whatsapp} />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-base bg-tinta p-6 text-fondo @3xl:p-7">
        <p className="max-w-[60ch]">
          <strong className="font-semibold">¿Necesitás algo más grande?</strong> Sistemas, integraciones y automatizaciones a medida: lo presupuestamos
          según lo que tu negocio necesite.
        </p>
        <a href="#contacto" className={boton.amarillo}>
          Contanos tu proyecto
        </a>
      </div>
    </section>
  );
}

/* ───────────── Cómo funciona ───────────── */

/** Pasos numerados (portada y /web). */
function ListaPasos({ pasos }: { pasos: readonly { titulo: string; texto: string }[] }) {
  return (
    <ol className="mt-10 grid gap-8 @4xl:mt-14 @4xl:grid-cols-3 @4xl:gap-8">
      {pasos.map((paso, i) => (
        <li key={paso.titulo} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-5 border-t-2 border-tinta pt-6">
          <span aria-hidden className={`${afiche} w-[0.6em] text-[clamp(3rem,2.4rem+2cqi,4.25rem)] leading-[0.8] tabular-nums`}>
            {i + 1}
          </span>
          <div>
            <h3 className="text-subtitulo font-semibold">{paso.titulo}</h3>
            <p className="mt-2 text-tinta-suave">{paso.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="como-titulo" className={`${diferida} scroll-mt-4 bg-superficie-2 py-14 @4xl:py-24`}>
      <div className={margen}>
        <h2 id="como-titulo" className={`${afiche} text-titulo`}>
          Elegí, personalizá <span className="resaltado">y publicá</span>
        </h2>
        <ListaPasos pasos={PASOS} />
      </div>
    </section>
  );
}

/* ───────────── Precios ───────────── */

/** Qué cubre el mensual y qué se cobra aparte (lo mismo que dicen los Términos). */
const MENSUAL = {
  incluye: [
    "Alojamiento y certificado de seguridad (https)",
    "Mantenimiento técnico y actualizaciones",
    "Cambios chicos: textos, precios, horarios, fotos o contacto (hasta 1 hora por mes)",
    "Soporte por WhatsApp o correo, con respuesta en 48 horas hábiles",
  ],
  aparte: [
    "Secciones o funciones nuevas, o cambiar de plantilla",
    "Dominio propio (alta y renovación anual)",
    "Logo, fotos profesionales y carga de catálogos grandes",
    "Capacitaciones largas para tu equipo",
  ],
};

export function Precios() {
  // Web + Turnos se presenta en /turnos: acá quedan solo los niveles de la página.
  const lista = niveles().filter((n) => n.id !== "sistema");
  return (
    <section id="precios" data-precios aria-labelledby="precios-titulo" className={`${diferida} ${margen} scroll-mt-4 py-14 @4xl:py-24`}>
      <div className="grid gap-6 @5xl:grid-cols-12 @5xl:items-end">
        <h2 id="precios-titulo" className={`${afiche} text-titulo @5xl:col-span-7`}>
          Un nivel para <span className="resaltado">cada momento</span>
        </h2>
        {/* Dos párrafos hermanos: un <p> no puede ir dentro de otro (rompe la hidratación). */}
        <div className="max-w-medida space-y-1 text-subtitulo @5xl:col-span-5">
          <p>Un pago inicial para armarla y un mensual para mantenerla online. Empezás simple y crecés sin arrancar de cero.</p>
          <p>Mientras la armás en el configurador, ves el precio al instante.</p>
        </div>
      </div>
      <ul className="mt-14 grid gap-4 @3xl:grid-cols-2 @6xl:grid-cols-4">
        {lista.map((p) => {
          const destacado = p.id === "vidriera";
          const oscuro = p.id === "premium";
          return (
            <li
              key={p.id}
              className={`flex flex-col rounded-base border-2 border-tinta p-6 ${destacado ? "bg-acento-relleno text-sobre-acento" : oscuro ? "bg-tinta text-fondo" : "bg-superficie"}`}
            >
              {destacado && <p className="mb-2 text-mini font-bold uppercase tracking-wide">El más elegido</p>}
              <h3 className={`${afiche} text-[clamp(1.8rem,1.3rem+1.4cqi,2.3rem)] leading-none`}>{p.nombre}</h3>
              <p className={`mt-3 text-chico ${destacado || oscuro ? "opacity-85" : "text-tinta-suave"}`}>{p.bajada}</p>
              <p className="mt-5">
                {p.precio ? (
                  <>
                    {p.precio.desde && <span className="block text-chico">desde</span>}
                    <span className={`${afiche} block text-[clamp(2.1rem,1.5rem+1.8cqi,2.8rem)] leading-none tabular-nums`}>{formatearPesos(p.precio.unico)}</span>
                    <span className="mt-1 block text-chico">pago único + {formatearPesos(p.precio.mensual)} por mes</span>
                  </>
                ) : (
                  <>
                    <span className={`${afiche} block text-[clamp(2.1rem,1.5rem+1.8cqi,2.8rem)] leading-none`}>A presupuestar</span>
                    <span className="mt-1 block text-chico opacity-85">según el alcance y la complejidad</span>
                  </>
                )}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-chico">
                {p.incluye.map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden className={`mt-[0.5em] h-1.5 w-3 shrink-0 ${destacado ? "bg-tinta" : "bg-acento-relleno"}`} />
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`mt-7 ${destacado ? boton.tinta : oscuro ? boton.amarillo : boton.contorno} px-4 text-chico`}
              >
                {p.accion}
                <span className="sr-only"> ({p.nombre})</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-4 @4xl:grid-cols-2">
        {([
          ["Qué incluye el mensual", MENSUAL.incluye, "bg-superficie"],
          ["Qué se cobra aparte", MENSUAL.aparte, "bg-superficie-2"],
        ] as const).map(([titulo, items, fondo]) => (
          <div key={titulo} className={`rounded-base border-2 border-tinta p-6 ${fondo}`}>
            <h3 className="text-subtitulo font-semibold">{titulo}</h3>
            <ul className="mt-3 space-y-2 text-chico">
              {items.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <span aria-hidden className="mt-[0.5em] h-1.5 w-3 shrink-0 bg-acento" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-6 text-pretty text-chico text-tinta-suave">
        * Precios de referencia en pesos argentinos, vigentes hasta el {preciosVigentesHasta()}: se actualizan cada tres meses y la próxima actualización
        es el {proximaActualizacion()}. El valor final se confirma al ver tu proyecto. Los componentes con sistema (agenda real, pagos online,
        recordatorios, panel) suman instalación y mensual porque necesitan base de datos y servidor. Detalle en los{" "}
        <Link href="/terminos" className="underline underline-offset-4">
          Términos y condiciones
        </Link>
        .
      </p>
    </section>
  );
}

/** Guía de /web: de lo que necesitás a la plantilla o el nivel que te conviene. */
const GUIA_WEB = [
  { necesito: "Que me encuentren y me escriban", te_conviene: "Perfil digital", href: "#precios" },
  { necesito: "Mostrar mis servicios, precios y trabajos", te_conviene: "Plantilla de barbería o portfolio", href: "#plantillas" },
  { necesito: "Mostrar mis casas o cabañas con fechas", te_conviene: "Plantilla de casas de campo", href: "#plantillas" },
  { necesito: "Algo con mi estilo, bloque por bloque", te_conviene: "Personalizado", href: "/configurador?plantilla=libre" },
  { necesito: "Que reserven turnos desde la página", te_conviene: "Web + Turnos", href: "/turnos" },
  { necesito: "Vender productos con pedidos", te_conviene: "Catálogo con pedidos por WhatsApp", href: "/configurador?plantilla=libre" },
];

export function GuiaWeb() {
  return (
    <section aria-labelledby="guia-titulo" className={`${margen} py-12 @4xl:py-16`}>
      <h2 id="guia-titulo" className={`${afiche} text-titulo`}>
        ¿Qué necesitás de <span className="resaltado">tu página?</span>
      </h2>
      <ul className="mt-10 grid gap-3 @3xl:grid-cols-2 @6xl:grid-cols-3">
        {GUIA_WEB.map((g) => (
          <li key={g.necesito}>
            <a
              href={g.href}
              className="flex h-full flex-col justify-between gap-3 rounded-base border-2 border-tinta bg-superficie p-5 transition-colors hover:bg-acento-relleno hover:text-sobre-acento"
            >
              <span className="font-semibold">{g.necesito}</span>
              <span className="text-chico">
                Te conviene: <strong className="font-semibold">{g.te_conviene}</strong> →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── Beneficios ───────────── */

export function Beneficios() {
  return (
    <section aria-labelledby="beneficios-titulo" className={`${diferida} ${margen} py-14 @4xl:py-24`}>
      <h2 id="beneficios-titulo" className={`${afiche} max-w-5xl text-titulo`}>
        Lo que trae <span className="resaltado">cada página</span>
      </h2>
      <ul className="mt-8 grid gap-x-12 @4xl:mt-14 @4xl:grid-cols-2">
        {BENEFICIOS.map((b, i) => (
          <li key={b.titulo} className="grid gap-2 border-t-2 border-tinta py-7 @xl:grid-cols-[3rem_minmax(0,1fr)]">
            <span aria-hidden className="text-chico font-semibold tabular-nums text-tinta-suave">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className={`${afiche} text-[clamp(1.6rem,1.1rem+1.8cqi,2.4rem)] leading-none`}>{b.titulo}</h3>
              <p className="mt-3 max-w-medida text-tinta-suave">{b.texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── Confianza ───────────── */

export function Confianza() {
  return (
    <section aria-labelledby="confianza-titulo" className={`${diferida} ${margen} py-14 @4xl:py-24`}>
      <h2 id="confianza-titulo" className={`${afiche} max-w-5xl text-titulo`}>
        Nuestro <span className="resaltado">compromiso</span>
      </h2>
      <ul className="mt-8 grid gap-x-12 @4xl:mt-14 @4xl:grid-cols-2 @6xl:grid-cols-3">
        {CONFIANZA.map((b) => (
          <li key={b.titulo} className="border-t-2 border-tinta py-7">
            <h3 className={`${afiche} text-[clamp(1.6rem,1.1rem+1.8cqi,2.2rem)] leading-none`}>{b.titulo}</h3>
            <p className="mt-3 max-w-medida text-tinta-suave">{b.texto}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-chico text-tinta-suave">
        Está todo por escrito en los{" "}
        <Link href="/terminos" className="font-semibold underline underline-offset-4">
          Términos y condiciones
        </Link>
        .
      </p>
    </section>
  );
}

/* ───────────── Preguntas ───────────── */

/** Preguntas frecuentes: salen de las dudas de Alto, así el chat y la página dicen lo mismo. */
export function Preguntas({ ids = PREGUNTAS_PORTADA }: { ids?: readonly string[] }) {
  const lista = ids.map((id) => DUDAS.find((d) => d.id === id)).filter((d) => d !== undefined);
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className={`${diferida} ${margen} scroll-mt-4 bg-superficie-2 py-14 @4xl:py-24`}>
      {/* En pantallas grandes, dos columnas de preguntas; cada una se abre en su lugar. */}
      <div className="mx-auto max-w-7xl">
        <h2 id="preguntas-titulo" className={`${afiche} text-center text-titulo`}>
          Preguntas frecuentes
        </h2>
        <div className="mt-10 grid gap-x-12 @5xl:grid-cols-2 @5xl:items-start">
          {[lista.slice(0, Math.ceil(lista.length / 2)), lista.slice(Math.ceil(lista.length / 2))].map((columna, c) => (
            <div key={c} className={`border-b-2 border-tinta ${c === 1 ? "-mt-0.5 @5xl:mt-0" : ""}`}>
              {columna.map((f) => (
                <details key={f.id} className="group border-t-2 border-tinta">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-subtitulo font-semibold [&::-webkit-details-marker]:hidden">
                    {f.pregunta}
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-tinta text-cuerpo transition-colors group-open:bg-acento-relleno">
                      <span className="transition-transform group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <div className="max-w-medida space-y-2 pb-6 text-tinta-suave">
                    {f.respuesta().map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-chico">
          ¿Te quedó otra duda? <AbrirAlto className="font-semibold underline underline-offset-4">Preguntale a Alto</AbrirAlto>.
        </p>
      </div>
    </section>
  );
}

/* ───────────── Cierre y pie ───────────── */

export function Cierre({ whatsapp }: { whatsapp: string | undefined }) {
  return (
    <section id="contacto" aria-labelledby="cierre-titulo" className="scroll-mt-4 bg-acento-relleno py-14 text-sobre-acento @4xl:py-20">
      <div className={margen}>
        <h2 id="cierre-titulo" className={`${afiche} max-w-[22ch] text-[clamp(2.25rem,1rem+5cqi,5rem)] leading-[0.9]`}>
          Contanos qué necesita tu negocio
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t-2 border-tinta pt-8">
          <p className="max-w-[60ch] text-subtitulo">Te respondemos personas, con una propuesta para lo tuyo. Sin compromiso.</p>
          <div className="flex flex-wrap gap-3">
            <AbrirAlto className={boton.tinta}>Encontrar mi solución</AbrirAlto>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={boton.contorno}>
                Escribinos por WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pie() {
  return (
    <footer className={`${margen} bg-tinta py-10 text-fondo @4xl:py-12`}>
      {/* En el celular: marca arriba, Soluciones y Demos en dos columnas y Contacto abajo, para que no quede una lista larga. */}
      <div className="grid gap-8 @4xl:grid-cols-12 @4xl:gap-x-6">
        <div className="@4xl:col-span-4">
          <p className="text-[2.25rem]">
            <Marca sobreOscuro />
          </p>
          <p className="mt-2 text-chico opacity-80">Producto cordobés.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-chico @4xl:col-span-8 @4xl:grid-cols-3">
          <nav aria-label="Soluciones">
            <p className="text-mini font-semibold uppercase tracking-wider opacity-60">Soluciones</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/web" className={enlacePie}>Al Toque Web</Link></li>
              <li><Link href="/turnos" className={enlacePie}>Al Toque Turnos</Link></li>
              <li><Link href="/caja" className={enlacePie}>Al Toque Caja</Link></li>
              <li><Link href="/resto" className={enlacePie}>Al Toque Resto</Link></li>
              <li><Link href="/tienda" className={enlacePie}>Al Toque Tienda</Link> <span className="text-mini opacity-60">(pronto)</span></li>
            </ul>
          </nav>
          <nav aria-label="Demos">
            <p className="text-mini font-semibold uppercase tracking-wider opacity-60">Demos</p>
            <ul className="mt-3 space-y-2">
              {PLANTILLAS.map((p) => (
                <li key={p}>
                  <Link href={`/l/${FICHAS[p].slug}`} className={enlacePie}>
                    {registry[p].meta.rubro}
                  </Link>
                </li>
              ))}
              <li><Link href={ESTUDIO.ruta} className={enlacePie}>Estudio</Link></li>
              <li><Link href="/turnos/demo" className={enlacePie}>Agenda de turnos</Link></li>
              <li><Link href="/c/demo-verduleria" className={enlacePie}>Caja simple</Link></li>
              <li><Link href="/c/pro" className={enlacePie}>Caja pro</Link></li>
            </ul>
          </nav>
          <nav aria-label="Contacto" className="col-span-2 border-t border-fondo/20 pt-6 @4xl:col-span-1 @4xl:border-0 @4xl:pt-0">
            <p className="text-mini font-semibold uppercase tracking-wider opacity-60">Contacto</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#contacto" className={enlacePie}>Contanos qué necesitás</Link></li>
              <li><a href={`mailto:${TITULAR.email}`} className={enlacePie}>{TITULAR.email}</a></li>
              <li><Link href="/configurador" className={enlacePie}>Configurador de páginas</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Legales: el botón de arrepentimiento destacado (Res. SCI 424/2020) y el link de reclamos (Res. SCI 274/2021). */}
      <nav aria-label="Legales" className="mt-8 grid grid-cols-2 items-center gap-x-6 gap-y-3 border-t border-fondo/20 pt-6 text-mini @4xl:mt-12 @4xl:flex @4xl:flex-wrap @4xl:gap-x-8 @4xl:text-chico">
        <Link href="/arrepentimiento" className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-control border-2 border-fondo px-4 font-semibold hover:bg-fondo hover:text-tinta @4xl:justify-start">
          Botón de arrepentimiento
        </Link>
        <Link href="/terminos" className="col-span-2 underline-offset-4 hover:underline">
          Términos y condiciones (contrato de adhesión)
        </Link>
        <Link href="/privacidad" className="underline-offset-4 hover:underline">
          Política de privacidad
        </Link>
        <Link href="/baja" className="underline-offset-4 hover:underline">
          Botón de baja
        </Link>
        <Link href="/legales" className="underline-offset-4 hover:underline">
          Información legal
        </Link>
        <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener noreferrer" className="col-span-2 underline-offset-4 hover:underline">
          Defensa de las y los Consumidores. Para reclamos ingrese aquí
        </a>
      </nav>
      <p className="mt-6 text-mini opacity-60">
        Hecho por sdv12 y jrd9 · 2026 · <span className="tabular-nums">v{process.env.NEXT_PUBLIC_VERSION}</span>
      </p>
    </footer>
  );
}
