import { linkDemoAgenda } from "@/agendas/lib/demo";
import type { IdProfesion } from "@/agendas/lib/profesiones";
import { COLORES_CAJA, type ColorCaja } from "@/cajas/config";
import { RUBROS as RUBROS_CAJA_DEF, type RubroCaja } from "@/cajas/rubros";
import { configsPorDefecto } from "@/core/defaults";
import { EXTRAS, cotizar, cotizarCaja, planAgenda, planCajaPro, type IdExtra, type Monto } from "@/core/lib/precios";
import { registry, type Plantilla } from "@/core/registry";
import type { LandingConfig } from "@/core/schema/landing-config";

/*
 * Alto: el asistente que ayuda a elegir qué armar. Sin IA: preguntas cortas y reglas que llevan a
 * los productos del kit (landing, agenda, caja simple, caja pro) con los precios de precios.ts.
 */

/* ───────────── Preguntas y opciones ───────────── */

export interface RubroAlto {
  id: string;
  nombre: string;
  plantilla: Plantilla;
  /** Si el rubro trabaja con turnos, el rubro de la agenda. */
  profesion?: IdProfesion;
  /** Si es un local de mostrador, el rubro de la caja. */
  caja?: RubroCaja;
}

export const RUBROS: RubroAlto[] = [
  { id: "barberia", nombre: "Barbería o peluquería", plantilla: "barberia", profesion: "peluqueria" },
  { id: "salud", nombre: "Consultorio o salud", plantilla: "consultorio", profesion: "consultorio" },
  { id: "estetica", nombre: "Estética, uñas o spa", plantilla: "consultorio", profesion: "unas" },
  { id: "clases", nombre: "Clases o entrenamiento", plantilla: "generico", profesion: "entrenamiento" },
  { id: "oficios", nombre: "Taller u oficio", plantilla: "generico", profesion: "taller" },
  { id: "alojamiento", nombre: "Cabañas o alojamiento", plantilla: "alojamiento" },
  { id: "verduleria", nombre: "Verdulería", plantilla: "generico", caja: "verduleria" },
  { id: "almacen", nombre: "Almacén", plantilla: "generico", caja: "almacen" },
  { id: "kiosco", nombre: "Kiosco", plantilla: "generico", caja: "kiosco" },
  { id: "dietetica", nombre: "Dietética", plantilla: "generico", caja: "dietetica" },
  { id: "comercio", nombre: "Comercio con empleados", plantilla: "generico", caja: "almacen" },
  // Para cualquier otro rubro, el portfolio genérico (ya viene armado; "A tu medida" arranca en blanco).
  { id: "otro", nombre: "Otro", plantilla: "generico" },
];

export const DIFICULTADES = {
  mensajes: "Contestar mensajes para dar turnos",
  ausencias: "Gente que reserva y no viene",
  visibilidad: "Que no me encuentren en internet",
  mostrar: "Mostrar mis trabajos y precios",
  caja: "Llevar la caja y lo que fío",
  stock: "Controlar stock, empleados o sucursales",
  factura: "Hacer factura electrónica",
  senas: "Cobrar señas",
} as const;
export type Dificultad = keyof typeof DIFICULTADES;

export const PRIORIDADES = {
  conozcan: "Que me conozcan",
  turnos: "Ordenar los turnos",
  ventas: "Las ventas del local",
  todo: "Todo junto",
} as const;
export type Prioridad = keyof typeof PRIORIDADES;

export const ZONAS = {
  barrio: "Mi barrio",
  ciudad: "Toda la ciudad",
  turistas: "Turistas y gente de afuera",
  pais: "Todo el país",
} as const;
export type Zona = keyof typeof ZONAS;

/** Todo lo que se puede pedir (la última pregunta muestra todas las opciones). */
export const FUNCIONES = {
  web: "Página web",
  turnos: "Turnos online",
  recordatorios: "Recordatorios por WhatsApp",
  sena: "Seña online",
  panel: "Panel para manejar todo",
  cajaSimple: "Caja para el mostrador",
  cajaPro: "Caja pro (factura, stock, sucursales)",
  galeria: "Galería de trabajos",
  precios: "Lista de precios",
  resenas: "Reseñas de clientes",
  mapa: "Mapa y cómo llegar",
  dominio: "Dominio propio (.com.ar)",
} as const;
export type Funcion = keyof typeof FUNCIONES;

/* Detalles que hacen que el pedido llegue "fino" (se preguntan según lo que eligió). */

export const PRESENCIA = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  google: "Google Maps",
  web: "Página propia",
  boca: "Boca en boca",
} as const;
export type Presencia = keyof typeof PRESENCIA;

export const EQUIPO = { solo: "Solo yo", chico: "2 o 3", mediano: "De 4 a 10", grande: "Más de 10" } as const;
export const SERVICIOS = { pocos: "Hasta 5", varios: "De 6 a 15", muchos: "Más de 15" } as const;
export const PRODUCTOS = { pocos: "Hasta 50", varios: "De 50 a 300", muchos: "Más de 300" } as const;
export const COBROS = { efectivo: "Efectivo", transferencia: "Transferencia", qr: "QR / Mercado Pago", tarjeta: "Tarjeta", fiado: "Fiado o cuenta corriente" } as const;
export type Cobro = keyof typeof COBROS;
export const SUCURSALES = { una: "Una sola", dos: "Dos", tres: "Tres o más" } as const;
export const LOGO = { si: "Sí, tengo", no: "No, necesito uno", masomenos: "Tengo algo, pero no me convence" } as const;
export const FOTOS = { si: "Sí, buenas", celular: "Algunas del celular", no: "No tengo" } as const;
export const DOMINIO = { tiene: "Sí, ya tengo", quiere: "No, quiero uno", nose: "No sé qué es" } as const;
export const PLAZO = { ya: "Lo antes posible", mes: "Este mes", tranqui: "Sin apuro" } as const;

export interface ColorAlto {
  nombre: string;
  hex: string;
  /** Si sale de las cajas, su id (para precargar /caja). */
  caja?: ColorCaja;
}

/** Colores para elegir: los acentos de la plantilla del rubro, o los de la caja si es un local de mostrador. */
export function coloresPara(rubro: RubroAlto): ColorAlto[] {
  if (rubro.caja) return (Object.keys(COLORES_CAJA) as ColorCaja[]).map((c) => ({ nombre: COLORES_CAJA[c].nombre, hex: COLORES_CAJA[c].acento, caja: c }));
  return registry[rubro.plantilla].meta.acentos.map((a) => ({ nombre: a.nombre, hex: a.hex }));
}

export interface Respuestas {
  nombre: string;
  rubro: RubroAlto;
  /** Si eligió "Otro", a qué se dedica (en sus palabras). */
  rubroOtro?: string;
  presencia?: Presencia[];
  dificultades: Dificultad[];
  prioridad: Prioridad;
  zona: Zona;
  color: ColorAlto | null;
  funciones: Funcion[];
  equipo?: keyof typeof EQUIPO;
  servicios?: keyof typeof SERVICIOS;
  productos?: keyof typeof PRODUCTOS;
  cobros?: Cobro[];
  sucursales?: keyof typeof SUCURSALES;
  logo?: keyof typeof LOGO;
  fotos?: keyof typeof FOTOS;
  dominio?: keyof typeof DOMINIO;
  plazo?: keyof typeof PLAZO;
  /** Quién escribe y a qué WhatsApp contestarle (null = prefiere que no). */
  contacto?: string;
  whatsapp?: string | null;
  comentario?: string;
}

/** Qué productos salen de lo que marcó (lo usan las preguntas de detalle y la recomendación). */
export function queQuiere(funciones: readonly Funcion[] = []) {
  const q = new Set(funciones);
  const agenda = q.has("turnos") || q.has("recordatorios") || q.has("sena") || q.has("panel");
  const pro = q.has("cajaPro");
  const caja = !pro && q.has("cajaSimple");
  const landing = q.has("web") || q.has("galeria") || q.has("precios") || q.has("resenas") || q.has("mapa") || q.has("dominio") || (!agenda && !pro && !caja);
  return { landing, agenda, caja, pro };
}

/** Lo que conviene marcar de entrada en "¿Qué te gustaría que tenga?", según lo que contó. */
export function funcionesSugeridas(r: Omit<Respuestas, "funciones" | "color">): Funcion[] {
  const f = new Set<Funcion>();
  const d = new Set(r.dificultades);
  if (d.has("mensajes") || r.prioridad === "turnos" || (r.rubro.profesion && r.prioridad === "todo")) f.add("turnos");
  if (d.has("ausencias")) f.add("turnos").add("recordatorios");
  if (d.has("senas")) f.add("turnos").add("sena");
  if (d.has("visibilidad") || r.prioridad === "conozcan" || r.prioridad === "todo") f.add("web");
  if (d.has("mostrar")) f.add("web").add("galeria").add("precios");
  if (d.has("caja") || (r.rubro.caja && r.prioridad === "ventas")) f.add("cajaSimple");
  if (d.has("stock") || d.has("factura") || r.rubro.id === "comercio") f.add("cajaPro");
  // Lo de la zona es parte de una página: solo se sugiere si ya hay una página en juego.
  if (f.has("web")) {
    if (r.zona === "barrio") f.add("mapa");
    if (r.zona === "ciudad" || r.zona === "pais") f.add("dominio");
    if (r.zona === "turistas") f.add("resenas").add("mapa");
  }
  if (f.has("cajaPro")) f.delete("cajaSimple");
  return [...f];
}

/* ───────────── Recomendación ───────────── */

export type IdProducto = "landing" | "agenda" | "cajaSimple" | "cajaPro";

export interface Producto {
  id: IdProducto;
  titulo: string;
  /** Por qué se lo recomendamos, en sus palabras. */
  porque: string[];
  precio: Monto;
  /** Lo que se prueba o se arma al tocar el botón. */
  accion: { texto: string; href: string };
}

export interface Recomendacion {
  productos: Producto[];
  total: Monto;
  /** Config de la landing para dejar como borrador del configurador (si se recomienda landing). */
  borrador: LandingConfig | null;
  /** Cosas que no son un producto armado y se charlan aparte. */
  aparte: string[];
}

const ORDEN: Record<Prioridad, IdProducto[]> = {
  conozcan: ["landing", "agenda", "cajaSimple", "cajaPro"],
  turnos: ["agenda", "landing", "cajaSimple", "cajaPro"],
  ventas: ["cajaPro", "cajaSimple", "landing", "agenda"],
  todo: ["landing", "agenda", "cajaPro", "cajaSimple"],
};

export function recomendar(r: Respuestas): Recomendacion {
  const q = new Set(r.funciones);
  const d = new Set(r.dificultades);
  const nombre = r.nombre.trim();

  const { landing: quiereLanding, agenda: quiereAgenda, caja: quiereCaja, pro: quierePro } = queQuiere(r.funciones);

  const productos: Producto[] = [];
  const aparte: string[] = [];
  let borrador: LandingConfig | null = null;
  const recordatorios = q.has("recordatorios") || d.has("ausencias");
  const profesion = r.rubro.profesion ?? "peluqueria";

  if (quiereLanding) {
    const extras: IdExtra[] = [];
    if (quiereAgenda) extras.push("agenda-real");
    if (quiereAgenda && recordatorios) extras.push("recordatorios");
    if (q.has("panel")) extras.push("panel");
    // Dominio: si lo pidió o dijo que quiere uno; si ya tiene, no se cobra.
    if ((q.has("dominio") || r.dominio === "quiere") && r.dominio !== "tiene") extras.push("dominio");
    const config = structuredClone(configsPorDefecto[r.rubro.plantilla]) as LandingConfig;
    if (nombre.length >= 2) config.negocio.nombre = nombre.slice(0, 60);
    if (r.color) config.estilo.acento = r.color.hex;
    if (extras.length) config.extras = extras;
    borrador = config;
    const porque: string[] = [];
    if (d.has("visibilidad")) porque.push("Para que te encuentren cuando te buscan o te recomiendan.");
    if (d.has("mostrar") || q.has("galeria") || q.has("precios")) porque.push("Para mostrar tus trabajos y precios sin mandar fotos una por una.");
    if (r.zona === "barrio") porque.push("Con mapa y botón de WhatsApp, para los que están cerca.");
    if (r.zona === "ciudad") porque.push("Con dominio propio (tunegocio.com.ar): da confianza en toda la ciudad.");
    if (r.zona === "turistas") porque.push("Con fotos, reseñas y cómo llegar, para los que todavía no te conocen.");
    if (r.zona === "pais") porque.push("Con dominio propio, para que te encuentren desde cualquier lado.");
    if (quiereAgenda) porque.push("Con turnos online adentro: reservan solos desde tu página.");
    if (!porque.length) porque.push(`Una página pensada para ${(r.rubroOtro || r.rubro.nombre).toLowerCase()}, con tus textos, colores y precios.`);
    if (r.dominio === "tiene") porque.push("Usamos el dominio que ya tenés.");
    if (r.logo === "no" || r.logo === "masomenos") aparte.push("El diseño del logo lo cotizamos aparte (o arrancamos con tu nombre bien tipografiado).");
    if (r.fotos === "no") aparte.push("Sin fotos propias arrancamos con fotos de muestra y coordinamos unas buenas cuando puedas.");
    productos.push({
      id: "landing",
      titulo: quiereAgenda ? "Página web con turnos" : `Página web (${registry[r.rubro.plantilla].meta.nombre})`,
      porque,
      precio: cotizar(config).total,
      accion: { texto: "Armar mi página", href: "/configurador" },
    });
  }

  if (quiereAgenda) {
    const porque: string[] = [];
    if (d.has("mensajes")) porque.push("Tus clientes reservan solos y dejás de contestar mensajes para dar turnos.");
    if (recordatorios) porque.push("Con recordatorio por WhatsApp: menos gente que no viene.");
    if (q.has("sena") || d.has("senas")) aparte.push("La seña online se suma al sistema de turnos: te pasamos el costo al charlarlo.");
    if (!porque.length) porque.push("Turnos online con un panel para la agenda, la caja y tus números.");
    if (r.equipo && r.equipo !== "solo") porque.push("Con un profesional por persona: cada cliente elige con quién se atiende.");
    if (r.servicios === "muchos") aparte.push("Con más de 15 servicios, los cargamos nosotros desde tu lista.");
    const extra = recordatorios ? { unico: EXTRAS.recordatorios.unico, mensual: EXTRAS.recordatorios.mensual } : { unico: 0, mensual: 0 };
    productos.push({
      id: "agenda",
      titulo: "Agenda de turnos",
      porque: quiereLanding ? [...porque, "Ya está incluida en el precio de la página con turnos."] : porque,
      // Con página, la agenda ya está en el precio de la landing (extra "agenda-real"): no se cobra dos veces.
      precio: quiereLanding ? { unico: 0, mensual: 0 } : { unico: planAgenda().unico + extra.unico, mensual: planAgenda().mensual + extra.mensual },
      accion: { texto: "Probar la agenda", href: linkDemoAgenda(nombre, profesion) },
    });
  }

  if (quiereCaja) {
    const rubroCaja = r.rubro.caja ?? "almacen";
    const cajones = RUBROS_CAJA_DEF[rubroCaja].cajones;
    const porque = ["Vendés con botones grandes y cerrás el día sabiendo cuánto entró.", "Con el fiado de cada cliente y su saldo por WhatsApp."];
    if (cajones) porque.push("Con cajones y lista para el mercado.");
    if (r.productos === "muchos") aparte.push("Con más de 300 productos, los cargamos desde tu lista de Excel o del proveedor.");
    const params = new URLSearchParams({ rubro: rubroCaja, ...(nombre.length >= 2 && { nombre }), ...(r.color?.caja && { color: r.color.caja }) });
    productos.push({
      id: "cajaSimple",
      titulo: "Caja para el mostrador",
      porque,
      precio: cotizarCaja({ modulos: { fiado: true, cajones } }).total,
      accion: { texto: "Probar la caja", href: `/caja?${params}` },
    });
  }

  if (quierePro) {
    const porque: string[] = [];
    if (d.has("stock")) porque.push("Stock por sucursal y empleados que ven solo lo que les toca.");
    if (d.has("factura")) porque.push("Factura electrónica (ARCA) y QR de Mercado Pago en la misma venta.");
    porque.push("Todo queda registrado: quién vendió, quién abrió y cerró la caja.");
    // Sucursales extra: el mensual de la pro incluye una.
    const extra = r.sucursales === "dos" ? 1 : r.sucursales === "tres" ? 2 : 0;
    if (extra) porque.push(`Con ${extra + 1}${r.sucursales === "tres" ? " o más" : ""} sucursales, cada una con su caja y su stock.`);
    if (r.sucursales === "tres") aparte.push("Desde la cuarta sucursal, cada una suma su mensual.");
    if (r.productos === "muchos") aparte.push("Con más de 300 productos, los cargamos desde tu lista de Excel o del proveedor.");
    const pro = planCajaPro();
    productos.push({ id: "cajaPro", titulo: "Caja pro", porque, precio: { unico: pro.unico, mensual: pro.mensual + extra * pro.sucursalExtra }, accion: { texto: "Probar la caja pro", href: "/c/pro" } });
  }

  if (r.zona === "pais") aparte.push("Si querés vender online con envíos, lo charlamos aparte.");
  if (r.plazo === "ya") aparte.push("Como lo necesitás ya, te proponemos arrancar por lo más urgente y sumar el resto después.");

  const orden = ORDEN[r.prioridad];
  productos.sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id));
  // Si la agenda va dentro de la página, primero la página (que es la que tiene el precio).
  const iL = productos.findIndex((x) => x.id === "landing");
  const iA = productos.findIndex((x) => x.id === "agenda");
  if (iL > iA && iA >= 0 && quiereLanding) productos.splice(iA, 0, ...productos.splice(iL, 1));
  const total = productos.reduce((t, p) => ({ unico: t.unico + p.precio.unico, mensual: t.mensual + p.precio.mensual }), { unico: 0, mensual: 0 });
  return { productos, total, borrador, aparte };
}

/** Resumen de las respuestas para el pedido por WhatsApp/mail. */
export function resumenRespuestas(r: Respuestas): string[] {
  const lista = <K extends string>(xs: readonly K[] | undefined, nombres: Record<K, string>) => (xs?.length ? xs.map((x) => nombres[x]).join(", ") : "—");
  const uno = <K extends string>(x: K | undefined, nombres: Record<K, string>) => (x ? nombres[x] : null);
  const detalles: [string, string | null][] = [
    ["Lo encuentran hoy en", r.presencia ? lista(r.presencia, PRESENCIA) : null],
    ["Equipo", uno(r.equipo, EQUIPO)],
    ["Servicios", uno(r.servicios, SERVICIOS)],
    ["Productos", uno(r.productos, PRODUCTOS)],
    ["Cobra con", r.cobros ? lista(r.cobros, COBROS) : null],
    ["Sucursales", uno(r.sucursales, SUCURSALES)],
    ["Logo", uno(r.logo, LOGO)],
    ["Fotos", uno(r.fotos, FOTOS)],
    ["Dominio", uno(r.dominio, DOMINIO)],
    ["Para cuándo", uno(r.plazo, PLAZO)],
    ["Contacto", [r.contacto, r.whatsapp].filter(Boolean).join(" · ") || null],
    ["Comentario", r.comentario || null],
  ];
  return [
    `Rubro: ${r.rubroOtro ? `${r.rubroOtro} (otro)` : r.rubro.nombre}`,
    `Lo que más le complica: ${r.dificultades.map((x) => DIFICULTADES[x]).join(", ") || "—"}`,
    `Quiere resolver primero: ${PRIORIDADES[r.prioridad]}`,
    `Zona: ${ZONAS[r.zona]}`,
    `Color: ${r.color?.nombre ?? "a elegir"}`,
    `Le gustaría: ${r.funciones.map((x) => FUNCIONES[x]).join(", ") || "—"}`,
    ...detalles.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
  ];
}
