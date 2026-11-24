"use client";

/*
 * Lo que comparten todos los diseños: los datos del estudio armados desde la config, el pedido de
 * reunión (sobre useBooking del core), las preguntas, el plano y el pie. Todo se pinta con los
 * tokens del kit (--lk-*), así cada diseño lo tiñe con su paleta sin reescribirlo.
 */
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useBooking, type Booking } from "@/core/hooks/useBooking";
import { etiquetaDia, horaDe } from "@/core/lib/fechas";
import { fechaHoraLegible, formatearDuracion, formatearPrecio, linkWhatsApp } from "@/core/lib/mensajes";
import { NOMBRE_RED, usuarioDeUrl, type RedSocial } from "@/core/lib/redes";
import { CUALQUIERA, type PasoReserva, type Preseleccion } from "@/core/lib/reserva";
import type { TipoSeccion, VarianteDe } from "@/core/registry";
import type { Faq, Profesional, Servicio } from "@/core/schema/contenido";
import type { ConfigDe } from "@/core/schema/landing-config";

export type Config = ConfigDe<"juridico">;
export type IdDiseno = VarianteDe<"juridico", "portada">;
export type SeccionJu = Exclude<TipoSeccion<"juridico">, "portada">;

/** Acento por defecto: con este, cada diseño usa su propio color. */
export const ACENTO_DEL_DISENO = "#22385c";

export const ID_REUNION = "reunion";

export const TITULOS: Record<SeccionJu, string> = {
  areas: "Áreas",
  equipo: "Equipo",
  proceso: "Cómo trabajamos",
  reunion: "Reuniones",
  preguntas: "Preguntas",
  contacto: "Contacto",
};

export interface Red {
  red: RedSocial;
  nombre: string;
  url: string;
  usuario: string;
}

export interface Marca {
  nombre: string;
  iniciales: string;
  eslogan: string;
  subtitulo: string;
  direccion: string;
  direccionLineas: [string, string];
  zona: string;
  horario: string;
  mapsUrl: string;
  redes: Red[];
  demo: boolean;
}

interface Datos {
  config: Config;
  marca: Marca;
  areas: Servicio[];
  equipo: Profesional[];
  pasos: string[];
  faq: Faq[];
  /** Secciones prendidas, en el orden del configurador (sin la portada). */
  orden: SeccionJu[];
  activa: (s: SeccionJu) => boolean;
  /** Link de WhatsApp con un texto ya armado. */
  wa: (texto?: string) => string;
}

const Ctx = createContext<Datos | null>(null);

function iniciales(nombre: string): string {
  const palabras = nombre.split(/\s+/).filter((p) => /^[\p{L}]/u.test(p) && !/^(y|de|del|la|las|los|e)$/i.test(p));
  const letras = palabras.slice(0, 3).map((p) => p[0]!.toUpperCase());
  return nombre.includes("&") && letras.length === 2 ? `${letras[0]}&${letras[1]}` : letras.join("");
}

function marcaDe(config: Config): Marca {
  const n = config.negocio;
  const direccion = n.direccion ?? "";
  const coma = direccion.indexOf(",");
  const direccionLineas: [string, string] = coma > 0 ? [direccion.slice(0, coma), direccion.slice(coma + 1).trim()] : [direccion, ""];
  const partes = direccion.split(",").map((p) => p.trim()).filter(Boolean);
  return {
    nombre: n.nombre,
    iniciales: iniciales(n.nombre),
    eslogan: n.eslogan ?? "",
    subtitulo: n.subtitulo ?? "",
    direccion,
    direccionLineas,
    zona: partes.slice(-2).join(", "),
    horario: n.horario ?? "",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion || n.nombre)}`,
    redes: (n.redes ?? []).map((r) => ({ red: r.red, nombre: NOMBRE_RED[r.red], url: r.url, usuario: usuarioDeUrl(r.url) })),
    demo: config.demo === true,
  };
}

export function DatosProvider({ config, children }: { config: Config; children: ReactNode }) {
  const c = config.contenido;
  const orden = config.secciones.filter((s) => s.activa && s.tipo !== "portada").map((s) => s.tipo as SeccionJu);
  const valor: Datos = {
    config,
    marca: marcaDe(config),
    areas: c.servicios ?? [],
    equipo: c.equipo ?? [],
    pasos: c.primeraConsulta ?? [],
    faq: c.faq ?? [],
    orden,
    activa: (s) => orden.includes(s),
    wa: (texto) => linkWhatsApp(config.negocio.whatsapp, texto),
  };
  return (
    <Ctx.Provider value={valor}>
      <ReunionProvider config={config}>{children}</ReunionProvider>
    </Ctx.Provider>
  );
}

export function useDatos(): Datos {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDatos necesita <DatosProvider>");
  return v;
}

/** Texto para consultar por un área puntual. */
export const consultaArea = (a: Pick<Servicio, "nombre">) => `Hola! Quería hacer una consulta sobre ${a.nombre.toLowerCase()}.`;

const MODALIDAD: Record<NonNullable<Servicio["modalidad"]>, string> = {
  presencial: "En el estudio",
  virtual: "Por videollamada",
  ambas: "En el estudio o por videollamada",
};

/** "45 min · En el estudio o por videollamada" */
export function detalleArea(a: Servicio): string {
  return [formatearDuracion(a.duracionMin), a.modalidad && MODALIDAD[a.modalidad]].filter(Boolean).join(" · ");
}

/* ───────────── Reunión ───────────── */

/** Primero el tema, después con quién. */
const ORDEN: readonly PasoReserva[] = ["servicio", "profesional", "dia", "horario", "datos"];

type Reunion = Booking & {
  /** Carga el área o la persona en el formulario y lleva hasta él. */
  pedirReunion: (pre?: Preseleccion) => void;
};

const CtxReunion = createContext<Reunion | null>(null);

function ReunionProvider({ config, children }: { config: Config; children: ReactNode }) {
  const b = useBooking({ config, orden: ORDEN });
  const pedirReunion = (pre: Preseleccion = {}) => {
    if (pre.servicioId || pre.profesionalId) b.preseleccionar(pre);
    const destino = document.getElementById(ID_REUNION);
    if (!destino) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
    destino.querySelector<HTMLElement>("[data-titulo-paso]")?.focus({ preventScroll: true });
  };
  return <CtxReunion.Provider value={{ ...b, pedirReunion }}>{children}</CtxReunion.Provider>;
}

export function useReunion(): Reunion {
  const v = useContext(CtxReunion);
  if (!v) throw new Error("useReunion necesita <DatosProvider>");
  return v;
}

/** El mensaje del core habla de "turno": acá es una reunión. */
function aReunion(mensaje: string): string {
  return mensaje.replace("Quiero reservar un turno:", "Quiero pedir una reunión:").replace("¿Me lo confirman?", "¿Me la confirman?");
}

const ETAPAS: { id: string; texto: string; pasos: PasoReserva[] }[] = [
  { id: "servicio", texto: "Tema", pasos: ["servicio"] },
  { id: "profesional", texto: "Con quién", pasos: ["profesional"] },
  { id: "fecha", texto: "Día y hora", pasos: ["dia", "horario"] },
  { id: "datos", texto: "Tus datos", pasos: ["datos"] },
];

/**
 * El pedido de reunión en pasos cortos. Termina en un mensaje de WhatsApp: la reunión queda
 * confirmada cuando el estudio responde.
 */
export function WidgetReunion({ className = "" }: { className?: string }) {
  const b = useReunion();
  const { config } = useDatos();
  const tituloPaso = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);
  const [modalidad, setModalidad] = useState("En el estudio");
  const idNombre = useId();
  const idNota = useId();

  const etapas = ETAPAS.filter((e) => e.pasos.some((p) => b.estado.orden.includes(p)));
  const etapaActual = etapas.findIndex((e) => e.pasos.includes(b.paso));

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    tituloPaso.current?.focus({ preventScroll: true });
  }, [etapaActual, b.resultado]);

  const titulo =
    b.paso === "servicio" ? "¿Sobre qué tema?" : b.paso === "profesional" ? "¿Con quién?" : b.paso === "datos" ? "Tus datos" : "¿Qué día y a qué hora?";

  const modalidadDe = (s?: Servicio) => (s?.modalidad === "virtual" ? "Por videollamada" : s?.modalidad === "presencial" ? "En el estudio" : modalidad);

  return (
    <div id={ID_REUNION} className={`scroll-mt-24 border border-borde bg-superficie text-tinta [border-radius:var(--lk-radio)] ${className}`}>
      <div className="border-b border-borde px-5 pt-5 @2xl:px-6">
        <p className="ju-etiqueta text-acento-texto">Pedí una reunión</p>
        {!b.resultado && (
          <ol className="mt-3 flex gap-1" aria-label="Pasos">
            {etapas.map((e, i) => {
              const hecha = i < etapaActual;
              const actual = i === etapaActual;
              const barra = <span className={`block h-[3px] ${hecha || actual ? "bg-acento-relleno" : "bg-borde"}`} />;
              return (
                <li key={e.id} className="min-w-0 flex-1" aria-current={actual ? "step" : undefined}>
                  {hecha ? (
                    <button type="button" onClick={() => b.irA(e.pasos[0]!)} className="block w-full cursor-pointer pb-3 text-left">
                      {barra}
                      <span className="mt-2 block truncate text-mini text-tinta-suave hover:text-tinta">
                        {e.texto}
                        <span className="sr-only"> (listo, volver a cambiar)</span>
                      </span>
                    </button>
                  ) : (
                    <span className="block pb-3">
                      {barra}
                      <span className={`mt-2 block truncate text-mini ${actual ? "font-semibold text-tinta" : "text-tinta-suave"}`}>{e.texto}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {b.resultado && b.servicio && b.estado.slot ? (
        <div className="px-5 py-6 @2xl:px-6">
          <h3 ref={tituloPaso} tabIndex={-1} data-titulo-paso className="text-subtitulo font-semibold focus:outline-none">
            Falta confirmarla
          </h3>
          <p className="mt-3 font-semibold">{b.servicio.nombre}</p>
          <p>{fechaHoraLegible(b.estado.slot.inicio)}</p>
          <p className="text-chico text-tinta-suave">{modalidadDe(b.servicio)}</p>
          <p className="mt-4 text-chico text-tinta-suave">La reunión queda confirmada cuando te respondemos por WhatsApp, en horario de atención.</p>
          <div className="mt-6 flex flex-col gap-2 @2xl:flex-row">
            <a href={linkWhatsApp(config.negocio.whatsapp, aReunion(b.resultado.mensaje))} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno">
              Confirmar por WhatsApp
            </a>
            <button type="button" onClick={b.reiniciar} className="ju-btn ju-btn-borde">
              Pedir otra
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (b.esUltimo) void b.confirmar({ extras: [`Modalidad: ${modalidadDe(b.servicio)}`] });
            else b.avanzar();
          }}
        >
          <div className="px-5 py-5 @2xl:px-6">
            <h3 ref={tituloPaso} tabIndex={-1} data-titulo-paso className="font-cuerpo text-cuerpo font-semibold focus:outline-none">
              {titulo}
            </h3>
            <div className="mt-3 max-h-[24rem] overflow-y-auto overscroll-contain">
              {b.paso === "servicio" && (
                <Grupo leyenda="Tema">
                  {b.servicios.map((s) => (
                    <Opcion key={s.id} name="servicio" value={s.id} checked={b.estado.servicioId === s.id} onElegir={b.elegirServicio}>
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{s.nombre}</span>
                        <span className="shrink-0 text-mini text-tinta-suave">{formatearPrecio(s)}</span>
                      </span>
                      <span className="block text-mini text-tinta-suave">{detalleArea(s)}</span>
                    </Opcion>
                  ))}
                </Grupo>
              )}

              {b.paso === "profesional" && (
                <Grupo leyenda="Con quién">
                  <Opcion name="profesional" value={CUALQUIERA} checked={b.estado.profesionalId === CUALQUIERA} onElegir={b.elegirProfesional}>
                    <span className="font-semibold">El primer horario libre</span>
                    <span className="block text-mini text-tinta-suave">Con quien lleve ese tema</span>
                  </Opcion>
                  {b.profesionales.map((p) => (
                    <Opcion key={p.id} name="profesional" value={p.id} checked={b.estado.profesionalId === p.id} onElegir={b.elegirProfesional}>
                      <span className="font-semibold">{p.nombre}</span>
                      <span className="block text-mini text-tinta-suave">{p.especialidad}</span>
                    </Opcion>
                  ))}
                </Grupo>
              )}

              {(b.paso === "dia" || b.paso === "horario") && <DiaYHora />}

              {b.paso === "datos" && (
                <div className="space-y-4">
                  {b.servicio && b.estado.slot && (
                    <p className="bg-fondo px-4 py-3 text-chico [border-radius:var(--lk-radio-control)]">
                      <span className="font-semibold">{b.servicio.nombre}</span>
                      {b.profesional && ` con ${b.profesional.nombre}`}
                      <br />
                      {fechaHoraLegible(b.estado.slot.inicio)}
                    </p>
                  )}
                  <div>
                    <label htmlFor={idNombre} className="text-chico font-semibold">
                      Nombre y apellido
                    </label>
                    <input id={idNombre} value={b.estado.nombre} onChange={(e) => b.setNombre(e.target.value)} autoComplete="name" required minLength={2} className="ju-campo mt-1" />
                  </div>
                  {b.servicio?.modalidad === "ambas" || !b.servicio?.modalidad ? (
                    <fieldset>
                      <legend className="text-chico font-semibold">Modalidad</legend>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {["En el estudio", "Por videollamada"].map((m) => (
                          <Opcion key={m} name="modalidad" value={m} checked={modalidad === m} onElegir={setModalidad} compacta>
                            <span className="text-chico font-semibold">{m}</span>
                          </Opcion>
                        ))}
                      </div>
                    </fieldset>
                  ) : (
                    <p className="text-chico text-tinta-suave">Modalidad: {modalidadDe(b.servicio)}.</p>
                  )}
                  <div>
                    <label htmlFor={idNota} className="text-chico font-semibold">
                      El tema en dos líneas <span className="font-normal text-tinta-suave">(opcional)</span>
                    </label>
                    <textarea id={idNota} value={b.estado.nota} onChange={(e) => b.setNota(e.target.value)} rows={2} className="ju-campo mt-1" />
                    <p className="mt-1 text-mini text-tinta-suave">Sin datos sensibles: los detalles los hablamos en la reunión.</p>
                  </div>
                </div>
              )}
            </div>
            {b.error && (
              <p role="alert" className="mt-3 bg-fondo px-3 py-2 text-chico">
                {b.error}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-borde px-5 py-4 @2xl:px-6">
            {b.indice > 0 ? (
              <button
                type="button"
                onClick={() => (b.paso === "horario" ? b.irA(b.estado.orden[b.estado.orden.indexOf("dia") - 1] ?? "dia") : b.retroceder())}
                className="min-h-11 cursor-pointer px-2 text-chico font-semibold text-tinta-suave hover:text-tinta"
              >
                Volver
              </button>
            ) : (
              <span />
            )}
            <button type="submit" disabled={!b.puedeAvanzar || b.enviando} className="ju-btn ju-btn-lleno">
              {b.esUltimo ? (b.enviando ? "Un momento…" : "Pedir esta reunión") : "Continuar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function DiaYHora() {
  const b = useReunion();
  const libres = b.horarios.slots.filter((s) => s.disponible);
  const elegirDia = (fecha: string) => {
    b.elegirFecha(fecha);
    if (b.paso === "dia") b.avanzar();
  };
  if (!b.dias.length) return <p className="text-chico text-tinta-suave">No hay horarios libres en las próximas semanas. Escribinos por WhatsApp.</p>;
  return (
    <div className="space-y-4">
      <Grupo leyenda="Día" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {b.dias.slice(0, 14).map((f) => {
          const e = etiquetaDia(f);
          return (
            <Opcion key={f} name="dia" value={f} checked={b.estado.fecha === f} onElegir={elegirDia} compacta aria-label={e.larga}>
              <span className="block text-mini text-tinta-suave">{e.semanaCorta}</span>
              <span className="block text-subtitulo font-semibold leading-tight">{e.numero}</span>
              <span className="block text-mini text-tinta-suave">{e.mesCorto}</span>
            </Opcion>
          );
        })}
      </Grupo>
      {b.estado.fecha && (
        <div aria-live="polite">
          {b.horarios.estado === "cargando" && <p className="text-chico text-tinta-suave">Buscando horarios…</p>}
          {b.horarios.estado === "error" && <p className="text-chico">No pudimos cargar los horarios. Probá de nuevo.</p>}
          {b.horarios.estado === "listo" && !libres.length && <p className="text-chico text-tinta-suave">No quedan horarios ese día. Probá con otro.</p>}
          {b.horarios.estado === "listo" && libres.length > 0 && (
            <Grupo leyenda={`Horarios del ${etiquetaDia(b.estado.fecha).larga}`} leyendaVisible className="grid grid-cols-4 gap-2 @2xl:grid-cols-5">
              {libres.map((s) => (
                <Opcion key={s.inicio} name="horario" value={s.inicio} checked={b.estado.slot?.inicio === s.inicio} onElegir={() => b.elegirSlot(s)} compacta>
                  <span className="tabular-nums">{horaDe(s.inicio)}</span>
                </Opcion>
              ))}
            </Grupo>
          )}
        </div>
      )}
    </div>
  );
}

function Grupo({ leyenda, leyendaVisible, className = "space-y-2", children }: { leyenda: string; leyendaVisible?: boolean; className?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className={leyendaVisible ? "mb-2 text-chico font-semibold first-letter:uppercase" : "sr-only"}>{leyenda}</legend>
      <div className={className}>{children}</div>
    </fieldset>
  );
}

function Opcion({
  name,
  value,
  checked,
  onElegir,
  compacta,
  children,
  ...resto
}: {
  name: string;
  value: string;
  checked: boolean;
  onElegir: (v: string) => void;
  compacta?: boolean;
  "aria-label"?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block cursor-pointer ${compacta ? "shrink-0" : ""}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onElegir(value)} aria-label={resto["aria-label"]} className="peer sr-only" />
      <span className={`ju-opcion hover:border-tinta-suave ${compacta ? "min-w-14 px-2 py-2 text-center" : "px-4 py-3"}`}>{children}</span>
    </label>
  );
}

/* ───────────── Piezas chicas ───────────── */

/** Preguntas desplegables (details/summary: funcionan sin JavaScript). */
export function ListaPreguntas({ className = "", pregunta = "" }: { className?: string; pregunta?: string }) {
  const { faq } = useDatos();
  return (
    <div className={`border-t border-borde ${className}`}>
      {faq.map((f) => (
        <details key={f.id} className="group border-b border-borde">
          <summary className={`flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden ${pregunta}`}>
            <span>{f.pregunta}</span>
            <span aria-hidden className="mt-1 shrink-0 text-acento-texto transition-transform group-open:rotate-45">
              ＋
            </span>
          </summary>
          <p className="max-w-[46rem] pb-6 text-tinta-suave">{f.respuesta}</p>
        </details>
      ))}
    </div>
  );
}

/** Plano ilustrado con link a Google Maps (sin iframes de terceros). */
export function Mapa({ className = "" }: { className?: string }) {
  const { marca } = useDatos();
  return (
    <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className={`ju-mapa block no-underline ${className}`} aria-label={`Ver ${marca.direccion} en el mapa`}>
      <span className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
        <svg viewBox="0 0 24 24" aria-hidden className="size-9 text-acento">
          <path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" fill="currentColor" />
          <circle cx="12" cy="10" r="2.6" fill="var(--lk-superficie)" />
        </svg>
        <span className="max-w-[18rem] bg-superficie px-3 py-1 text-chico font-semibold text-tinta">{marca.direccion}</span>
        <span className="text-mini font-semibold uppercase tracking-[0.15em] text-tinta underline underline-offset-4">Abrir en el mapa</span>
      </span>
    </a>
  );
}

/** Retrato: la foto si hay, si no las iniciales sobre una trama. */
export function Retrato({ persona, className = "", letras = "" }: { persona: Profesional; className?: string; letras?: string }) {
  if (persona.foto?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fotos del cliente (URL https o ruta local)
      <img src={persona.foto.src} alt={persona.foto.alt || persona.nombre} className={`object-cover ${className}`} loading="lazy" />
    );
  }
  const ini = persona.nombre
    .replace(/^(Dra?\.|Lic\.|Esc\.)\s*/i, "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div role="img" aria-label={`${persona.nombre} (sin foto todavía)`} className={`flex items-center justify-center bg-superficie-2 [background-image:var(--lk-placeholder-trama)] ${className}`}>
      <span className={`font-display text-titulo text-tinta-suave ${letras}`}>{ini}</span>
    </div>
  );
}

/** Pie común: datos, redes y el aviso de que la página no es asesoramiento. */
export function Pie({ className = "" }: { className?: string }) {
  const { marca, wa } = useDatos();
  return (
    <footer className={`border-t border-borde ${className}`}>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-10 @2xl:px-10 @5xl:flex-row @5xl:items-end @5xl:justify-between">
        <div>
          <p className="font-display text-subtitulo">{marca.nombre}</p>
          <p className="mt-1 text-chico text-tinta-suave">{marca.direccion}</p>
          {marca.horario && <p className="text-chico text-tinta-suave">{marca.horario}</p>}
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-chico">
          <li>
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              WhatsApp
            </a>
          </li>
          {marca.redes.map((r) => (
            <li key={r.red}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                {r.nombre}
              </a>
            </li>
          ))}
          <li>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              Cómo llegar
            </a>
          </li>
        </ul>
      </div>
      <div className="mx-auto max-w-[1180px] px-5 pb-8 text-mini text-tinta-suave @2xl:px-10">
        <p>La información de esta página es general y no reemplaza el asesoramiento sobre tu caso.</p>
        <p className="mt-1">
          © {marca.nombre}
          {marca.demo && " (demo)"}
        </p>
      </div>
    </footer>
  );
}

/** Links del menú: solo las secciones prendidas. */
export function useMenu(): { id: SeccionJu; texto: string }[] {
  const { orden } = useDatos();
  return orden.map((id) => ({ id, texto: TITULOS[id] }));
}

/** "Pedir reunión": lleva al formulario si está prendido; si no, abre WhatsApp. */
export function BotonReunion({ className = "ju-btn ju-btn-lleno", pre, children = "Pedir una reunión" }: { className?: string; pre?: Preseleccion; children?: ReactNode }) {
  const { activa, wa } = useDatos();
  const { pedirReunion } = useReunion();
  if (!activa("reunion")) {
    return (
      <a href={wa("Hola! Quería pedir una reunión.")} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={() => pedirReunion(pre)} className={className}>
      {children}
    </button>
  );
}
