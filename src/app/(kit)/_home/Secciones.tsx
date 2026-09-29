import Link from "next/link";
import { PLANTILLAS, paletaDe, registry, type Plantilla } from "@/core/registry";
import { fuentes as fuentesAlojamiento } from "@/templates/alojamiento";
import { fuentes as fuentesBarberia } from "@/templates/barberia";
import { fuentes as fuentesConsultorio } from "@/templates/consultorio";
import { fuentes as fuentesGenerico } from "@/templates/generico";
import { BENEFICIOS, FICHAS, PASOS, PREGUNTAS, RUBROS } from "./contenido";
import { Navegador, Telefono } from "./Marcos";

const FUENTES: Record<Plantilla, string> = {
  barberia: fuentesBarberia,
  consultorio: fuentesConsultorio,
  alojamiento: fuentesAlojamiento,
  generico: fuentesGenerico,
};

const DOMINIO = "landing-al-toque.netlify.app";
const margen = "px-4 @3xl:px-8 @6xl:px-12";
const afiche = "font-display font-extrabold uppercase [font-stretch:72%]";

/**
 * Secciones debajo del primer pantallazo: el navegador no las maqueta hasta que se acercan,
 * así que tampoco descarga antes de tiempo las tipografías de las plantillas que usan.
 */
const diferida = "[content-visibility:auto] [contain-intrinsic-size:auto_900px]";

export const boton = {
  tinta:
    "inline-flex min-h-12 items-center justify-center rounded-control bg-tinta px-7 text-cuerpo font-semibold text-fondo transition-transform hover:-translate-y-0.5 active:translate-y-0",
  amarillo:
    "inline-flex min-h-12 items-center justify-center rounded-control bg-acento-relleno px-7 text-cuerpo font-semibold text-sobre-acento transition-transform hover:-translate-y-0.5 active:translate-y-0",
  contorno:
    "inline-flex min-h-12 items-center justify-center rounded-control border-2 border-tinta px-7 text-cuerpo font-semibold text-tinta transition-colors hover:bg-tinta hover:text-fondo",
};

/* ───────────── Encabezado ───────────── */

export function Marca({ className = "" }: { className?: string }) {
  return (
    <span className={`${afiche} whitespace-nowrap font-extrabold leading-none ${className}`}>
      Landing {/* Sobre el amarillo siempre va tinta, aunque la marca esté sobre fondo oscuro. */}
      <span className="resaltado text-sobre-acento">al toque</span>
    </span>
  );
}

export function Encabezado() {
  return (
    <header className={`${margen} flex h-18 items-center justify-between gap-3 py-4`}>
      <Link href="/" aria-label="Landing al toque, inicio" className="text-[1.4rem] @md:text-[1.75rem]">
        <Marca />
      </Link>
      <nav aria-label="Principal" className="flex items-center gap-1">
        <ul className="hidden items-center gap-1 @3xl:flex">
          {[
            ["#plantillas", "Plantillas"],
            ["#como-funciona", "Cómo funciona"],
            ["#preguntas", "Preguntas"],
          ].map(([href, texto]) => (
            <li key={href}>
              <a href={href} className="inline-flex min-h-11 items-center rounded-control px-4 text-chico font-semibold hover:bg-superficie-2">
                {texto}
              </a>
            </li>
          ))}
        </ul>
        <Link href="/configurador" className={`${boton.tinta} min-h-11 whitespace-nowrap px-5 text-chico`}>
          <span className="@md:hidden">Mi página</span>
          <span className="hidden @md:inline">Armar mi página</span>
        </Link>
      </nav>
    </header>
  );
}

/* ───────────── Hero ───────────── */

/** Abanico de teléfonos con las cuatro plantillas reales. */
function Abanico() {
  const disposicion = [
    { p: "barberia", clase: "left-[1%] top-[12%] -rotate-[9deg] z-10" },
    { p: "consultorio", clase: "left-[21%] top-[2%] -rotate-[3deg] z-30" },
    { p: "alojamiento", clase: "left-[42%] top-[6%] rotate-[3.5deg] z-20" },
    { p: "generico", clase: "left-[62%] top-[14%] rotate-[9deg] z-10" },
  ] as const;
  return (
    <div className="relative mx-auto aspect-[10/8] w-full max-w-[38rem] @5xl:-mt-24">
      {disposicion.map(({ p, clase }) => (
        <Telefono
          key={p}
          src={`/muestras/${p}-celular.jpg`}
          alt={`La plantilla ${registry[p].meta.nombre} en un celular`}
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
    <section aria-labelledby="hero-titulo" className={`${margen} pb-20 pt-4 @5xl:pt-8`}>
      <h1 id="hero-titulo" className={`${afiche} max-w-[14ch] text-[clamp(3.25rem,0.9rem+10.5cqi,9.5rem)] leading-[0.84] @5xl:max-w-none`}>
        Tu negocio, con página propia. <span className="resaltado whitespace-nowrap">Al toque.</span>
      </h1>
      <div className="mt-10 grid items-start gap-12 @5xl:mt-8 @5xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] @5xl:gap-10">
        <div>
          <p className="max-w-[36ch] text-subtitulo">
            Elegí una plantilla pensada para tu rubro, cambiale textos, colores y precios, y mirá cómo queda mientras la armás. Me la
            mandás y la publico.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/configurador" className={boton.tinta}>
              Armar mi página
            </Link>
            <a href="#plantillas" className={boton.contorno}>
              Ver las plantillas
            </a>
          </div>
          <p className="mt-5 text-chico text-tinta-suave">Probar el configurador no cuesta nada y no pide registrarse.</p>
        </div>
        <Abanico />
      </div>
    </section>
  );
}

/* ───────────── Rubros ───────────── */

export function Rubros() {
  return (
    <section aria-label="Para qué rubros" className="bg-tinta py-10 text-fondo @4xl:py-14">
      <ul className={`${margen} flex flex-wrap items-center gap-x-5 gap-y-1 ${afiche} text-[clamp(2rem,1.1rem+3.6cqi,4.25rem)] leading-[0.95]`}>
        {RUBROS.map((r, i) => (
          <li key={r} className="flex items-center gap-5">
            {r}
            {i < RUBROS.length - 1 && (
              <span aria-hidden className="text-acento">
                ✳
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── Plantillas ───────────── */

export function Plantillas() {
  return (
    <section id="plantillas" aria-labelledby="plantillas-titulo" className={`${margen} scroll-mt-4 py-24`}>
      <div className="grid gap-6 @5xl:grid-cols-12 @5xl:items-end">
        <h2 id="plantillas-titulo" className={`${afiche} text-titulo @5xl:col-span-7`}>
          No es la misma página <span className="resaltado">con otro color</span>
        </h2>
        <p className="max-w-medida text-subtitulo @5xl:col-span-5">
          Cada plantilla está armada para su rubro: cambia la estructura, cómo se navega y cómo tu cliente pide un turno o una fecha.
        </p>
      </div>

      <div className="mt-16">
        {PLANTILLAS.map((p, i) => (
          <FichaPlantilla key={p} plantilla={p} indice={i} />
        ))}
      </div>
    </section>
  );
}

function FichaPlantilla({ plantilla, indice }: { plantilla: Plantilla; indice: number }) {
  const { meta } = registry[plantilla];
  const ficha = FICHAS[plantilla];
  const paleta = paletaDe(plantilla, meta.modos[0]);
  const derecha = indice % 2 === 1;

  return (
    <article aria-labelledby={`plantilla-${plantilla}`} className={`${diferida} grid grid-cols-[minmax(0,1fr)] gap-10 border-t-2 border-tinta py-16 @5xl:grid-cols-12 @5xl:items-center @5xl:gap-12`}>
      <div className={`min-w-0 @5xl:col-span-7 ${derecha ? "@5xl:order-2" : ""}`}>
        {/* Escenario con el fondo propio de la plantilla */}
        <div className="relative rounded-base px-4 pb-14 pt-6 @3xl:px-8 @3xl:pb-16 @3xl:pt-8" style={{ background: paleta.fondo }}>
          <Navegador
            src={`/muestras/${plantilla}-escritorio.jpg`}
            alt={`La plantilla ${meta.nombre} en computadora`}
            url={`${DOMINIO}/l/${ficha.slug}`}
            sizes="(min-width: 1024px) 50vw, 92vw"
          />
          <Telefono
            src={`/muestras/${plantilla}-celular.jpg`}
            alt={`La plantilla ${meta.nombre} en celular`}
            sizes="(min-width: 1024px) 12vw, 28vw"
            className={`absolute -bottom-6 w-[26%] ${derecha ? "left-4 -rotate-[4deg] @3xl:left-8" : "right-4 rotate-[4deg] @3xl:right-8"}`}
          />
        </div>
      </div>

      <div className="min-w-0 @5xl:col-span-5">
        <p className="text-chico text-tinta-suave">
          <span className="tabular-nums">0{indice + 1}</span> / 0{PLANTILLAS.length} · {meta.rubro}
        </p>
        <h3 id={`plantilla-${plantilla}`} className={`${FUENTES[plantilla]} mt-3 text-titulo leading-[0.95]`} style={{ fontFamily: ficha.fuenteDisplay }}>
          {meta.nombre}
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
        <div className="mt-7">
          <p className="text-mini text-tinta-suave">Colores pensados para esta plantilla</p>
          <ul className="mt-2 flex gap-2">
            {meta.acentos.map((a) => (
              <li key={a.hex}>
                <span className="block size-8 rounded-full border-2 border-tinta/15" style={{ background: a.hex }} title={a.nombre} />
                <span className="sr-only">{a.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/configurador?plantilla=${plantilla}`} className={boton.tinta}>
            Usar esta plantilla
          </Link>
          <Link href={`/l/${ficha.slug}`} className={boton.contorno}>
            Ver la demo<span className="sr-only"> de {meta.nombre}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ───────────── Cómo funciona ───────────── */

export function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="como-titulo" className={`${diferida} scroll-mt-4 bg-superficie-2 py-24`}>
      <div className={margen}>
        <h2 id="como-titulo" className={`${afiche} text-titulo`}>
          Tres pasos <span className="resaltado">y listo</span>
        </h2>
        <ol className="mt-14 grid gap-10 @4xl:grid-cols-3 @4xl:gap-8">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="border-t-2 border-tinta pt-6">
              <span aria-hidden className={`${afiche} block text-[clamp(4.5rem,3rem+6cqi,8rem)] leading-[0.8]`}>
                {i + 1}
              </span>
              <h3 className="mt-5 text-subtitulo font-semibold">{paso.titulo}</h3>
              <p className="mt-2 text-tinta-suave">{paso.texto}</p>
            </li>
          ))}
        </ol>
        <figure className="mt-16">
          <Navegador src="/muestras/configurador.jpg" alt="El configurador: panel de edición a la izquierda y la página en vivo a la derecha" url={`${DOMINIO}/configurador`} sizes="(min-width: 1280px) 1200px, 94vw" />
          <figcaption className="mt-4 text-chico text-tinta-suave">
            El configurador: a la izquierda editás, a la derecha ves tu página como la va a ver tu cliente.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ───────────── Beneficios ───────────── */

export function Beneficios() {
  return (
    <section aria-labelledby="beneficios-titulo" className={`${diferida} ${margen} py-24`}>
      <h2 id="beneficios-titulo" className={`${afiche} max-w-5xl text-titulo`}>
        Lo que trae <span className="resaltado">cada página</span>
      </h2>
      <ul className="mt-14 grid gap-x-12 @4xl:grid-cols-2">
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

/* ───────────── Preguntas ───────────── */

export function Preguntas() {
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className={`${diferida} ${margen} scroll-mt-4 pb-24`}>
      <div className="grid gap-10 @5xl:grid-cols-12">
        <h2 id="preguntas-titulo" className={`${afiche} text-titulo @5xl:col-span-4`}>
          Preguntas
        </h2>
        <div className="border-b-2 border-tinta @5xl:col-span-8">
          {PREGUNTAS.map((f) => (
            <details key={f.pregunta} className="group border-t-2 border-tinta">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-subtitulo font-semibold [&::-webkit-details-marker]:hidden">
                {f.pregunta}
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-tinta text-cuerpo transition-colors group-open:bg-acento-relleno">
                  <span className="transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="max-w-medida pb-6 text-tinta-suave">{f.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Cierre y pie ───────────── */

export function Cierre({ whatsapp }: { whatsapp: string | undefined }) {
  return (
    <section aria-labelledby="cierre-titulo" className="bg-acento-relleno py-24 text-sobre-acento @5xl:py-28">
      <div className={margen}>
        <h2 id="cierre-titulo" className={`${afiche} text-[clamp(2.5rem,12.5cqi,11rem)] leading-[0.84]`}>
          ¿Arrancamos?
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t-2 border-tinta pt-8">
          <p className="max-w-[30ch] text-subtitulo">Armala ahora; si algo no te cierra, lo charlamos.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/configurador" className={boton.tinta}>
              Armar mi página
            </Link>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={boton.contorno}>
                Escribime
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
    <footer className={`${margen} bg-tinta py-12 text-fondo`}>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="text-[2.25rem]">
            <Marca />
          </p>
          <p className="mt-3 text-chico opacity-80">Páginas para negocios chicos. Hecho en Córdoba.</p>
        </div>
        <nav aria-label="Demos">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-chico">
            {PLANTILLAS.map((p) => (
              <li key={p}>
                <Link href={`/l/${FICHAS[p].slug}`} className="underline-offset-4 hover:underline">
                  Demo {registry[p].meta.rubro.toLowerCase()}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/configurador" className="font-semibold underline underline-offset-4">
                Configurador
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
