import { formatearDuracion, formatearPrecio, linkWhatsApp } from "@/core/lib/mensajes";
import type { VarianteDe } from "@/core/registry";
import type { Servicio } from "@/core/schema/contenido";
import type { ConfigDe } from "@/core/schema/landing-config";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { bloque, boton, tituloBloque } from "../estilos";
import { Foto } from "../Foto";
import { BotonPedirTurno, BuscadorObrasSociales } from "../interactivos";

type Config = ConfigDe<"consultorio">;

const MODALIDAD: Record<NonNullable<Servicio["modalidad"]>, string> = { presencial: "Presencial", virtual: "Virtual", ambas: "Presencial o virtual" };
const COBERTURA: Record<NonNullable<Servicio["cobertura"]>, string> = { particular: "Particular", "obra-social": "Obra social", ambas: "Particular u obra social" };

/* ───────────── Prestaciones ───────────── */

export function Prestaciones({ config, variante }: { config: Config; variante: VarianteDe<"consultorio", "prestaciones"> }) {
  const servicios = config.contenido.servicios ?? [];

  if (variante === "lista-agrupada") {
    const grupos = new Map<string, Servicio[]>();
    for (const s of servicios) grupos.set(s.categoria || "Prestaciones", [...(grupos.get(s.categoria || "Prestaciones") ?? []), s]);
    return (
      <section id="prestaciones" aria-labelledby="prestaciones-titulo" className={bloque}>
        <h2 id="prestaciones-titulo" className={tituloBloque}>
          Prestaciones
        </h2>
        {[...grupos.entries()].map(([categoria, lista]) => (
          <div key={categoria} className="mt-8">
            <h3 className="text-subtitulo font-bold">{categoria}</h3>
            <ul className="mt-3 divide-y divide-borde border-y border-borde">
              {lista.map((s) => (
                <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{s.nombre}</p>
                    {s.descripcion && <p className="text-chico text-tinta-suave">{s.descripcion}</p>}
                    <p className="mt-1 text-mini text-tinta-suave">
                      {[formatearDuracion(s.duracionMin), s.modalidad && MODALIDAD[s.modalidad], s.cobertura && COBERTURA[s.cobertura]].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="tabular-nums">{formatearPrecio(s)}</span>
                    <BotonPedirTurno servicioId={s.id} className={boton.enlace}>
                      Pedir turno<span className="sr-only"> de {s.nombre}</span>
                    </BotonPedirTurno>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    );
  }

  // tabla: comparable de un vistazo (en angosto, cada fila se apila)
  return (
    <section id="prestaciones" aria-labelledby="prestaciones-titulo" className={bloque}>
      <h2 id="prestaciones-titulo" className={tituloBloque}>
        Prestaciones
      </h2>
      <p className="mt-2 text-tinta-suave">Precios particulares. Con obra social, el valor depende de tu plan.</p>

      <div className="mt-6 hidden @2xl:block">
        <table className="w-full border-collapse text-left text-chico">
          <thead>
            <tr className="border-b-2 border-tinta/80">
              <th scope="col" className="py-2 pr-4 font-semibold">Prestación</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Duración</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Modalidad</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Cobertura</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">Particular</th>
              <th scope="col" className="py-2"><span className="sr-only">Acción</span></th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id} className="border-b border-borde align-top">
                <th scope="row" className="py-3 pr-4 font-normal">
                  <span className="block text-cuerpo font-semibold">{s.nombre}</span>
                  {s.descripcion && <span className="block text-tinta-suave">{s.descripcion}</span>}
                </th>
                <td className="whitespace-nowrap py-3 pr-4">{formatearDuracion(s.duracionMin)}</td>
                <td className="py-3 pr-4">{s.modalidad ? MODALIDAD[s.modalidad] : "—"}</td>
                <td className="py-3 pr-4">{s.cobertura ? COBERTURA[s.cobertura] : "—"}</td>
                <td className="whitespace-nowrap py-3 pr-4 text-right tabular-nums">{formatearPrecio(s)}</td>
                <td className="py-3 text-right">
                  <BotonPedirTurno servicioId={s.id} className={`${boton.enlace} whitespace-nowrap`}>
                    Pedir turno<span className="sr-only"> de {s.nombre}</span>
                  </BotonPedirTurno>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 divide-y divide-borde border-y border-borde @2xl:hidden">
        {servicios.map((s) => (
          <li key={s.id} className="py-4">
            <p className="font-semibold">{s.nombre}</p>
            {s.descripcion && <p className="text-chico text-tinta-suave">{s.descripcion}</p>}
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-chico">
              <dt className="text-tinta-suave">Duración</dt>
              <dd>{formatearDuracion(s.duracionMin)}</dd>
              {s.modalidad && (
                <>
                  <dt className="text-tinta-suave">Modalidad</dt>
                  <dd>{MODALIDAD[s.modalidad]}</dd>
                </>
              )}
              {s.cobertura && (
                <>
                  <dt className="text-tinta-suave">Cobertura</dt>
                  <dd>{COBERTURA[s.cobertura]}</dd>
                </>
              )}
              <dt className="text-tinta-suave">Particular</dt>
              <dd className="tabular-nums">{formatearPrecio(s)}</dd>
            </dl>
            <BotonPedirTurno servicioId={s.id} className={`${boton.enlace} mt-2 inline-block py-1`}>
              Pedir turno<span className="sr-only"> de {s.nombre}</span>
            </BotonPedirTurno>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── Profesionales ───────────── */

export function Profesionales({ config, variante }: { config: Config; variante: VarianteDe<"consultorio", "profesionales"> }) {
  const equipo = config.contenido.equipo ?? [];
  return (
    <section id="profesionales" aria-labelledby="profesionales-titulo" className={bloque}>
      <h2 id="profesionales-titulo" className={tituloBloque}>
        Profesionales
      </h2>
      <ul className={variante === "fichas" ? "mt-6 grid gap-4 @2xl:grid-cols-2" : "mt-6 divide-y divide-borde border-y border-borde"}>
        {equipo.map((p) =>
          variante === "fichas" ? (
            <li key={p.id} className="flex gap-4 rounded-base border border-borde bg-superficie p-4">
              <Foto imagen={p.foto ?? { alt: p.nombre }} aspecto="1 / 1" sizes="96px" className="w-24 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-bold">{p.nombre}</h3>
                <p className="text-chico text-tinta-suave">{p.especialidad || p.rol}</p>
                {p.matricula && <p className="mt-1 text-mini tabular-nums text-tinta-suave">{p.matricula}</p>}
                <BotonPedirTurno profesionalId={p.id} className={`${boton.enlace} mt-2 inline-block text-chico`}>
                  Pedir turno<span className="sr-only"> con {p.nombre}</span>
                </BotonPedirTurno>
              </div>
            </li>
          ) : (
            <li key={p.id} className="grid gap-1 py-5 @2xl:grid-cols-[minmax(0,1fr)_auto] @2xl:gap-x-8">
              <div>
                <h3 className="text-subtitulo font-bold">{p.nombre}</h3>
                <p className="text-tinta-suave">
                  {p.rol}
                  {p.especialidad && ` · ${p.especialidad}`}
                </p>
                {p.bio && <p className="mt-2 max-w-medida text-chico">{p.bio}</p>}
              </div>
              <div className="@2xl:text-right">
                {p.matricula && <p className="text-chico tabular-nums">{p.matricula}</p>}
                <BotonPedirTurno profesionalId={p.id} className={`${boton.enlace} mt-1 inline-block text-chico`}>
                  Pedir turno<span className="sr-only"> con {p.nombre}</span>
                </BotonPedirTurno>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

/* ───────────── Obras sociales ───────────── */

export function ObrasSociales({ config, variante }: { config: Config; variante: VarianteDe<"consultorio", "obrasSociales"> }) {
  const obras = config.contenido.obrasSociales ?? [];
  return (
    <section id="obras-sociales" aria-labelledby="obras-titulo" className={bloque}>
      <h2 id="obras-titulo" className={tituloBloque}>
        Obras sociales
      </h2>
      <p className="mt-2 text-tinta-suave">Atendemos particular y con estas coberturas. Algunas piden orden: fijate en las preguntas frecuentes.</p>
      <div className="mt-6">
        {variante === "grilla" ? (
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-base border border-borde bg-borde @xl:grid-cols-3">
            {obras.map((o) => (
              <li key={o} className="bg-superficie px-4 py-3 text-chico font-semibold">
                {o}
              </li>
            ))}
          </ul>
        ) : (
          <BuscadorObrasSociales obras={obras} />
        )}
      </div>
    </section>
  );
}

/* ───────────── Primera consulta ───────────── */

export function PrimeraConsulta({ config, variante }: { config: Config; variante: VarianteDe<"consultorio", "primeraConsulta"> }) {
  const items = config.contenido.primeraConsulta ?? [];
  return (
    <section id="primera-consulta" aria-labelledby="primera-titulo" className={bloque}>
      <h2 id="primera-titulo" className={tituloBloque}>
        Tu primera consulta
      </h2>
      <p className="mt-2 text-tinta-suave">Qué traer para aprovechar el turno.</p>
      {variante === "pasos" ? (
        <ol className="mt-6 space-y-0">
          {items.map((t, i) => (
            <li key={t} className="relative flex gap-4 pb-6 last:pb-0">
              {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-4 top-9 w-px bg-borde" />}
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-acento text-chico font-bold text-acento-texto">
                {i + 1}
              </span>
              <p className="pt-1">{t}</p>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-6 space-y-3 rounded-base border border-borde bg-superficie p-5">
          {items.map((t) => (
            <li key={t} className="flex gap-3">
              <svg viewBox="0 0 20 20" aria-hidden className="mt-0.5 size-5 shrink-0 text-acento-texto">
                <rect x="2.5" y="2.5" width="15" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 10.5 8.8 13 14 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ───────────── Preguntas ───────────── */

export function Faq({ config, variante }: { config: Config; variante: VarianteDe<"consultorio", "faq"> }) {
  const faq = config.contenido.faq ?? [];
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className={bloque}>
      <h2 id="preguntas-titulo" className={tituloBloque}>
        Preguntas frecuentes
      </h2>
      {variante === "dos-columnas" ? (
        <dl className="mt-6 grid gap-x-10 gap-y-6 @2xl:grid-cols-2">
          {faq.map((f) => (
            <div key={f.id}>
              <dt className="font-bold">{f.pregunta}</dt>
              <dd className="mt-1 text-tinta-suave">{f.respuesta}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-6 divide-y divide-borde border-y border-borde">
          {faq.map((f) => (
            <details key={f.id} className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                {f.pregunta}
                <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0 text-acento-texto transition-transform group-open:rotate-180">
                  <path d="m5 8 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className="pb-4 text-tinta-suave">{f.respuesta}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

/* ───────────── Ubicación ───────────── */

export function Ubicacion({ config, variante }: { config: Config; variante: VarianteDe<"consultorio", "ubicacion"> }) {
  const { negocio } = config;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion)}`;
  const enlaces = (
    <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
      <a href={mapa} target="_blank" rel="noopener noreferrer" className={boton.enlace}>
        Cómo llegar<span className="sr-only"> (Google Maps)</span>
      </a>
      <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className={`${boton.enlace} inline-flex items-center gap-1.5`}>
        <IconoWhatsApp className="size-4" /> WhatsApp
      </a>
      {negocio.instagram && (
        <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className={boton.enlace}>
          @{negocio.instagram}
        </a>
      )}
    </p>
  );

  if (variante === "compacta") {
    return (
      <section id="ubicacion" aria-labelledby="ubicacion-titulo" className={bloque}>
        <h2 id="ubicacion-titulo" className={tituloBloque}>
          Cómo llegar
        </h2>
        <p className="mt-3">
          {negocio.direccion}. {negocio.horario}.
        </p>
        {enlaces}
      </section>
    );
  }

  return (
    <section id="ubicacion" aria-labelledby="ubicacion-titulo" className={bloque}>
      <h2 id="ubicacion-titulo" className={tituloBloque}>
        Cómo llegar
      </h2>
      <div className="mt-6 grid gap-6 @2xl:grid-cols-2">
        <div>
          <dl className="space-y-4">
            <div>
              <dt className="text-chico font-semibold text-tinta-suave">Dirección</dt>
              <dd className="text-subtitulo">{negocio.direccion}</dd>
            </div>
            <div>
              <dt className="text-chico font-semibold text-tinta-suave">Horario de atención</dt>
              <dd>{negocio.horario}</dd>
            </div>
          </dl>
          {enlaces}
        </div>
        <a
          href={mapa}
          target="_blank"
          rel="noopener noreferrer"
          className="group grid min-h-48 place-items-center rounded-base border border-borde"
          style={{ background: "var(--lk-placeholder-trama), var(--lk-superficie-2)" }}
        >
          <span className="rounded-control bg-superficie px-4 py-2 text-chico font-semibold group-hover:text-acento-texto">
            Ver en el mapa<span className="sr-only"> (se abre en Google Maps)</span>
          </span>
        </a>
      </div>
    </section>
  );
}
