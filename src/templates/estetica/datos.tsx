"use client";

/*
 * Lo que necesitan los diez diseños, armado desde la config del cliente. En la página de estilista
 * venía de Supabase (servicios, trabajos, horarios, espera); acá sale de la configuración de Al Toque,
 * con los mismos nombres para que los diseños queden casi iguales al original.
 */
import { createContext, useContext, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { formatearDuracion, formatearPrecio, linkWhatsApp } from "@/core/lib/mensajes";
import type { TipoSeccion, VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";

export type Config = ConfigDe<"estetica">;
export type IdDiseno = VarianteDe<"estetica", "portada">;
export type SeccionEs = TipoSeccion<"estetica">;

/** Acento por defecto: con este, cada diseño usa su propio color principal. */
export const ACENTO_DEL_DISENO = "#9a5a50";

export interface ServicioVista {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: string;
  color_a: string;
  color_b: string;
}

export interface TrabajoVista {
  id: string;
  imagen?: string;
  titulo: string;
  alt: string;
  color_a: string;
  color_b: string;
  destacado: boolean;
  es_reel: boolean;
  link: string;
}

export interface Marca {
  nombre: string;
  rubro: string;
  iniciales: string;
  zona: string;
  direccion: string;
  direccionLineas: [string, string];
  eslogan: string;
  subtitulo: string;
  horario: string;
  instagram: string | null;
  instagramUrl: string | null;
  MAPS_URL: string;
  esDemo: boolean;
}

type Rango = [string, string];
export interface Local {
  /** 0 = domingo … 6 = sábado. null = cerrado. */
  horarios: Record<number, Rango | null>;
  /** Texto de apoyo (la bajada del negocio). */
  info: string;
  conAgenda: boolean;
}

/** Tonos de pelo para los servicios y los trabajos sin foto (los de la demo de estilista). */
const TONOS: Rango[] = [
  ["#4A3A2C", "#EBD29C"],
  ["#A88B5E", "#F4E3A8"],
  ["#6B2A17", "#D97A45"],
  ["#7A4A24", "#D9A35A"],
  ["#6F6A60", "#E6DFCF"],
  ["#5D4835", "#E9D49E"],
  ["#3A2418", "#A86A3A"],
  ["#6F5640", "#F0D9A3"],
];
const TONOS_TRABAJO: Rango[] = [
  ["#6E4E36", "#F2D9A6"],
  ["#8A7155", "#F1DFA2"],
  ["#6B4B2E", "#D9A365"],
  ["#2A1A14", "#6E3B26"],
  ["#5E2A18", "#D9804E"],
  ["#4E4436", "#EBD9A4"],
  ["#7D7A72", "#E4DED0"],
  ["#5D4835", "#E9D49E"],
  ["#3A2418", "#A86A3A"],
  ["#6F5640", "#F0D9A3"],
];
const tono = (lista: Rango[], i: number): Rango => lista[i % lista.length]!;

const PALABRAS_SUELTAS = new Set(["el", "la", "los", "las", "lo", "de", "del", "y"]);
function iniciales(nombre: string) {
  const ps = nombre.split(/\s+/).filter((p) => p && !PALABRAS_SUELTAS.has(p.toLowerCase()));
  return (ps.length ? ps : nombre.split(/\s+/))
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function armarMarca(config: Config): Marca {
  const { negocio } = config;
  const partes = negocio.direccion.split(",").map((p) => p.trim()).filter(Boolean);
  const instagramUrl = negocio.redes?.find((r) => r.red === "instagram")?.url ?? null;
  const instagram = instagramUrl ? (instagramUrl.replace(/\/+$/, "").split("/").pop() ?? null) : null;
  return {
    nombre: negocio.nombre,
    rubro: "Salón de belleza",
    iniciales: iniciales(negocio.nombre),
    zona: partes.slice(1).join(", ") || partes[0] || "",
    direccion: negocio.direccion,
    direccionLineas: [partes.length > 1 ? `${partes[0]},` : (partes[0] ?? ""), partes.length > 1 ? `${partes.slice(1).join(", ")}.` : ""],
    eslogan: negocio.eslogan,
    subtitulo: negocio.subtitulo,
    horario: negocio.horario,
    instagram,
    instagramUrl,
    MAPS_URL: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion || negocio.nombre)}`,
    esDemo: !!config.demo,
  };
}

function armarLocal(config: Config): Local {
  const horarios: Record<number, Rango | null> = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
  for (const d of config.agenda?.dias ?? []) {
    const primera = d.franjas[0];
    const ultima = d.franjas[d.franjas.length - 1];
    if (primera && ultima) horarios[d.dia] = [primera.desde, ultima.hasta];
  }
  return { horarios, info: config.negocio.subtitulo, conAgenda: !!config.agenda?.dias.length };
}

function armarServicios(config: Config): ServicioVista[] {
  return (config.contenido.servicios ?? []).map((s, i) => {
    const [a, b] = tono(TONOS, i);
    return {
      id: s.id,
      nombre: s.nombre,
      descripcion: s.descripcion ?? "",
      duracion: formatearDuracion(s.duracionMin),
      precio: s.precio === null ? "A consultar" : formatearPrecio(s),
      color_a: a,
      color_b: b,
    };
  });
}

function armarTrabajos(config: Config): TrabajoVista[] {
  return (config.contenido.galeria ?? []).map((g, i) => {
    const [a, b] = tono(TONOS_TRABAJO, i);
    return { id: `t${i}`, imagen: g.src, titulo: g.epigrafe ?? "", alt: g.alt, color_a: a, color_b: b, destacado: i === 0, es_reel: false, link: "" };
  });
}

type Contexto = {
  config: Config;
  marca: Marca;
  local: Local;
  servicios: ServicioVista[];
  trabajos: TrabajoVista[];
  activa: (tipo: SeccionEs) => boolean;
};

const Ctx = createContext<Contexto | null>(null);

export function DatosProvider({ config, children }: { config: Config; children: ReactNode }) {
  const activas = new Set(config.secciones.filter((s) => s.activa).map((s) => s.tipo));
  const valor: Contexto = {
    config,
    marca: armarMarca(config),
    local: armarLocal(config),
    servicios: armarServicios(config),
    trabajos: armarTrabajos(config),
    activa: (tipo) => activas.has(tipo),
  };
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

function useCtx() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Los diseños de estética van dentro de DatosProvider");
  return c;
}

export const useDatos = () => {
  const { servicios, trabajos, local, activa } = useCtx();
  return { servicios, trabajos, local, activa };
};
export const useMarca = () => useCtx().marca;

/** Link de WhatsApp del salón con el texto que se pase. */
export function useWa() {
  const numero = useCtx().config.negocio.whatsapp;
  return (texto = "¡Hola! Quería hacerte una consulta.") => linkWhatsApp(numero, texto);
}

export const consultaServicio = (s: Pick<ServicioVista, "nombre">) => `¡Hola! Quería consultar por ${s.nombre.toLowerCase()}.`;

// ───────────── Horario y estado de hoy ─────────────

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const PLURAL = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const aMin = (h: string) => {
  const [a = 0, b = 0] = h.split(":").map(Number);
  return a * 60 + b;
};
export const horaCorta = (h: string) => h.replace(/:00$/, "").replace(/^0(?=\d)/, "");

/** Día y minuto en Córdoba, aunque el celular tenga otra zona horaria. */
function ahoraCordoba(ms: number) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Argentina/Cordoba", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday ?? "");
  return { dia, min: Number(p.hour) * 60 + Number(p.minute) };
}

export function estadoLocal(local: Local, ms: number | null): { abierto: boolean; detalle: string } {
  if (!local.conAgenda) return { abierto: false, detalle: "Escribinos para consultar disponibilidad" };
  // En el servidor (y en el primer dibujo) no sabemos la hora del visitante: se muestra neutro.
  if (ms === null) return { abierto: false, detalle: "Mirá nuestros horarios" };
  const { dia, min } = ahoraCordoba(ms);
  const h = local.horarios[dia];
  if (h && min >= aMin(h[0]) && min < aMin(h[1])) return { abierto: true, detalle: `Atendemos hasta las ${horaCorta(h[1])} hs` };
  for (let i = 0; i < 7; i++) {
    const d = (dia + i) % 7;
    const r = local.horarios[d];
    if (!r || (i === 0 && min >= aMin(r[0]))) continue;
    const cuando = i === 0 ? "hoy" : i === 1 ? "mañana" : `el ${DIAS[d]}`;
    return { abierto: false, detalle: `Abrimos ${cuando} a las ${horaCorta(r[0])} hs` };
  }
  return { abierto: false, detalle: "Escribinos para consultar" };
}

/** Días con el mismo horario juntos: "Martes a viernes · 10 — 20 hs", "Domingo y lunes · Cerrado". */
export function gruposHorario(local: Local, horarioTexto: string): { titulo: string; valor: string }[] {
  if (!local.conAgenda) return [{ titulo: "Horario", valor: horarioTexto || "A consultar" }];
  const orden = [1, 2, 3, 4, 5, 6, 0];
  type Grupo = { clave: string; dias: number[]; rango: Rango | null };
  const grupos: Grupo[] = [];
  for (const d of orden) {
    const r = local.horarios[d] ?? null;
    const clave = r ? r.join("-") : "cerrado";
    const ult = grupos[grupos.length - 1];
    const cerrados = grupos.find((g) => g.clave === "cerrado");
    if (r && ult && ult.clave === clave && orden.indexOf(ult.dias[ult.dias.length - 1]!) === orden.indexOf(d) - 1) ult.dias.push(d);
    else if (!r && cerrados) cerrados.dias.push(d);
    else grupos.push({ clave, dias: [d], rango: r });
  }
  grupos.sort((a, b) => Number(a.clave === "cerrado") - Number(b.clave === "cerrado"));
  return grupos.map(({ dias, rango }) => {
    let titulo: string;
    if (dias.length === 1) titulo = cap(rango ? PLURAL[dias[0]!]! : DIAS[dias[0]!]!);
    else if (rango && dias.length > 2) titulo = `${cap(DIAS[dias[0]!]!)} a ${DIAS[dias[dias.length - 1]!]}`;
    else titulo = cap(dias.map((d) => DIAS[d]).join(", ").replace(/, ([^,]*)$/, " y $1"));
    return { titulo, valor: rango ? `${horaCorta(rango[0])} — ${horaCorta(rango[1])} hs` : "Cerrado" };
  });
}

export const NIVELES_ESPERA: Record<number, { corto: string; largo: string; color: string }> = {
  1: { corto: "Sin espera", largo: "Pasá cuando quieras", color: "bg-es-verde" },
  2: { corto: "Poca · ~15 min", largo: "Hay poca gente", color: "bg-es-verde" },
  3: { corto: "Moderada · ~30 min", largo: "Un rato de espera", color: "bg-[#C9922E]" },
  4: { corto: "Bastante · +1 h", largo: "Conviene escribir antes", color: "bg-es-vino" },
  5: { corto: "Completo por hoy", largo: "No tomamos más clientas hoy", color: "bg-es-vino" },
};

/** Minutos aproximados por nivel, para los diseños que muestran un número. */
export const MINUTOS: Record<number, string> = { 1: "0", 2: "15", 3: "30", 4: "60+", 5: "—" };

const suscribirMinuto = (avisar: () => void) => {
  const id = setInterval(avisar, 60_000);
  return () => clearInterval(id);
};
const minutoActual = () => Math.floor(Date.now() / 60_000);

/**
 * El estado de hoy: abierto o cerrado según la agenda, los horarios agrupados y la espera. Sin
 * panel ni base de datos la espera no se sabe en vivo: solo la demo muestra un nivel de ejemplo.
 */
export function useHoy() {
  const { local, config, marca } = useCtx();
  const wa = useWa();
  const minuto = useSyncExternalStore(suscribirMinuto, minutoActual, () => null);
  const { abierto, detalle } = estadoLocal(local, minuto === null ? null : minuto * 60_000);
  const demo = !!config.demo;
  const nivel = abierto && demo ? 2 : 0;
  return {
    abierto,
    detalle,
    grupos: gruposHorario(local, marca.horario),
    nivel,
    info: nivel ? NIVELES_ESPERA[nivel]! : null,
    hora: null as string | null,
    demo,
    wa: wa(abierto ? "¡Hola! ¿Cómo viene la espera hoy? Quería pasar." : "¡Hola! Quería consultar disponibilidad."),
  };
}

/** El horario en renglones ("Martes a viernes · 10 — 20 hs"), para donde el diseño listaba los pagos. */
export function useHorario() {
  const { local, marca } = useCtx();
  return gruposHorario(local, marca.horario).map((g) => `${g.titulo} · ${g.valor}`);
}

export const CUANDO = ["Hoy", "Mañana", "Esta semana", "Todavía no sé"];

/** El formulario de consulta que termina en WhatsApp con el mensaje armado. */
export function useConsulta() {
  const wa = useWa();
  const [servicio, setServicio] = useState("");
  const [cuando, setCuando] = useState("");
  const [nota, setNota] = useState("");
  const [nombre, setNombre] = useState("");
  const enviar = (e?: FormEvent) => {
    e?.preventDefault();
    const txt = [
      `¡Hola!${nombre.trim() ? ` Soy ${nombre.trim()}.` : ""} Quería consultar disponibilidad.`,
      servicio && `Servicio: ${servicio}`,
      cuando && `Cuándo pienso ir: ${cuando.toLowerCase()}`,
      nota.trim() && `Te cuento: ${nota.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(wa(txt), "_blank", "noopener");
  };
  const alternar = (actual: string, set: (v: string) => void) => (v: string) => set(actual === v ? "" : v);
  return { servicio, cuando, nota, nombre, setNota, setNombre, elegirServicio: alternar(servicio, setServicio), elegirCuando: alternar(cuando, setCuando), enviar };
}

/** Para filtrar los trabajos que existen (`[destacado, ...resto]` puede traer undefined). */
export const esTrabajo = (t: TrabajoVista | undefined): t is TrabajoVista => !!t;

export function useTrabajos() {
  const { trabajos } = useCtx();
  const destacado = trabajos.find((t) => t.destacado) ?? trabajos[0];
  return { destacado, resto: trabajos.filter((t) => t !== destacado), hayDemo: trabajos.some((t) => !t.imagen) };
}

/** Fondo de un trabajo: la foto real o el degradé de tono de ejemplo. */
export const fondoTrabajo = (t: Pick<TrabajoVista, "imagen" | "color_a" | "color_b">): CSSProperties =>
  t.imagen
    ? { backgroundImage: `url(${t.imagen})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 7px), linear-gradient(180deg, ${t.color_a}, ${t.color_b})` };

export const degradeServicio = (s: Pick<ServicioVista, "color_a" | "color_b">) => `linear-gradient(180deg, ${s.color_a}, ${s.color_b})`;

/** El mapa: un plano ilustrado con la dirección que abre Google Maps (el kit no incrusta mapas). */
export function Mapa({ className = "" }: { className?: string }) {
  const M = useMarca();
  return (
    <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className={`es-mapa block no-underline ${className}`} aria-label={`Ver ${M.direccion} en el mapa`}>
      <span className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
        <svg viewBox="0 0 24 24" aria-hidden className="size-9 text-es-vino">
          <path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" fill="currentColor" />
          <circle cx="12" cy="10" r="2.6" fill="#fff" />
        </svg>
        <span className="max-w-[18rem] bg-es-carta/90 px-3 py-1 text-[0.9rem] font-semibold text-es-tinta">{M.direccion}</span>
        <span className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-es-tinta underline underline-offset-4">Abrir en el mapa</span>
      </span>
    </a>
  );
}
