import { linkDemoAgenda } from "@/agendas/lib/demo";
import type { IdProfesion } from "@/agendas/lib/profesiones";
import { COLORES_CAJA, type ColorCaja } from "@/cajas/config";
import { RUBROS as RUBROS_CAJA_DEF, type RubroCaja } from "@/cajas/rubros";
import { configsPorDefecto } from "@/core/defaults";
import { formatearPesos } from "@/core/lib/mensajes";
import { CAJA_PRO_A_MEDIDA, EXTRAS, PRESUPUESTOS, ahorroWebTurnos, cotizar, cotizarCaja, planAgenda, planPerfil, planesResto, type IdExtra, type IdPresupuesto, type Monto } from "@/core/lib/precios";
import { linkDemoResto } from "@/restos/lib/publicado";
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
  { id: "estetica", nombre: "Estética, uñas o spa", plantilla: "estetica", profesion: "unas" },
  { id: "clases", nombre: "Clases o entrenamiento", plantilla: "generico", profesion: "entrenamiento" },
  { id: "oficios", nombre: "Taller u oficio", plantilla: "generico", profesion: "taller" },
  { id: "alojamiento", nombre: "Cabañas o alojamiento", plantilla: "alojamiento" },
  { id: "verduleria", nombre: "Verdulería", plantilla: "generico", caja: "verduleria" },
  { id: "almacen", nombre: "Almacén", plantilla: "generico", caja: "almacen" },
  { id: "kiosco", nombre: "Kiosco", plantilla: "generico", caja: "kiosco" },
  { id: "dietetica", nombre: "Dietética", plantilla: "generico", caja: "dietetica" },
  { id: "comercio", nombre: "Comercio con empleados", plantilla: "generico", caja: "almacen" },
  { id: "veterinaria", nombre: "Veterinaria o peluquería canina", plantilla: "generico", profesion: "veterinaria" },
  { id: "tatuajes", nombre: "Tatuajes o piercing", plantilla: "barberia", profesion: "tatuajes" },
  { id: "abogados", nombre: "Estudio jurídico o abogado", plantilla: "juridico", profesion: "asesoria" },
  { id: "estudio", nombre: "Estudio contable", plantilla: "generico", profesion: "asesoria" },
  { id: "fotografia", nombre: "Fotografía", plantilla: "generico", profesion: "fotografia" },
  { id: "musica", nombre: "Música, arte o idiomas", plantilla: "generico", profesion: "musica" },
  { id: "autos", nombre: "Lavadero o taller de autos", plantilla: "generico", profesion: "lavadero" },
  { id: "gastronomia", nombre: "Gastronomía: resto, bar o café", plantilla: "generico" },
  { id: "tienda", nombre: "Tienda de ropa, regalos o deco", plantilla: "generico", caja: "almacen" },
  { id: "construccion", nombre: "Construcción o reformas", plantilla: "generico" },
  { id: "eventos", nombre: "Eventos, salones o catering", plantilla: "generico" },
  { id: "turismo", nombre: "Turismo o viajes", plantilla: "alojamiento" },
  { id: "inmobiliaria", nombre: "Inmobiliaria", plantilla: "generico" },
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
  preguntas: "Responder siempre las mismas preguntas",
  redes: "No tengo tiempo para las redes",
  deudas: "Me deben plata o me cuesta cobrar",
  vuelven: "Clientes que no vuelven",
  ganancia: "No sé bien cuánto gano",
  faltantes: "Faltantes en la caja",
  presupuestos: "Armar presupuestos me lleva mucho tiempo",
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
  catalogo: "Catálogo de productos",
  pedidos: "Pedidos por WhatsApp",
  menu: "Menú o carta",
  contacto: "Formulario de consulta",
  faq: "Preguntas frecuentes",
  equipo: "Presentar a tu equipo",
  promos: "Promociones y descuentos",
  instagram: "Tu Instagram en la página",
  tienda: "Tienda online con envíos",
  idiomas: "Página en otro idioma",
} as const;
export type Funcion = keyof typeof FUNCIONES;

/** Lo que es parte de una página web (si marca alguna de estas, va una página). */
const DE_PAGINA: Funcion[] = ["web", "galeria", "precios", "resenas", "mapa", "dominio", "catalogo", "pedidos", "menu", "contacto", "faq", "equipo", "promos", "instagram", "tienda", "idiomas"];

export const MODALIDAD = { local: "En un local a la calle", consultorio: "En un estudio o gabinete", domicilio: "A domicilio", online: "Online", varias: "Un poco de todo" } as const;
export const HORARIO = { manana: "A la mañana", tarde: "A la tarde", corrido: "Todo el día", finde: "También fines de semana", arreglo: "Cuando arreglo con cada cliente" } as const;
export const PRESUPUESTO = Object.fromEntries(Object.entries(PRESUPUESTOS).map(([k, v]) => [k, v.etiqueta])) as Record<IdPresupuesto, string>;
export const CONOCIO = { instagram: "Por Instagram", recomendacion: "Me lo recomendaron", google: "Buscando en Google", otro: "Otra forma" } as const;

/** Lo que dice Alto después de elegir el rubro. */
export const COMENTARIO_RUBRO: Record<string, string> = {
  barberia: "¡Buenísimo! En barberías los turnos online son lo que más tiempo ahorra.",
  estetica: "¡Lindo rubro! Las fotos de antes y después venden solas.",
  clases: "Genial. Para clases sirve mucho mostrar horarios y dejar reservar la primera.",
  oficios: "Bien. En oficios, mostrar trabajos hechos y responder rápido hace la diferencia.",
  alojamiento: "¡Qué lindo! En alojamiento, fotos grandes y fechas claras son todo.",
  verduleria: "¡Dale! Para la verdulería tenemos una caja con botones grandes, por kilo y con fiado.",
  almacen: "¡Bien! Para el almacén, la caja con fiado y cierre del día es la que más se usa.",
  kiosco: "¡Dale! En el kiosco lo importante es vender rápido y saber cuánto entró.",
  dietetica: "¡Bien! En dietéticas se vende mucho por kilo: la caja ya lo trae.",
  comercio: "Perfecto. Con empleados, lo que más sirve es saber quién vendió qué.",
  veterinaria: "¡Qué lindo! Turnos para baño y consultas, y los datos de cada mascota.",
  tatuajes: "¡Buenísimo! El portfolio de trabajos y la seña para reservar son clave.",
  abogados: "Muy bien. Para un estudio jurídico tenemos diez diseños sobrios, con áreas, equipo y reuniones presenciales o por videollamada.",
  estudio: "Perfecto. Un estudio serio necesita una página clara y un turno para la primera consulta.",
  fotografia: "¡Genial! La galería es la protagonista en fotografía.",
  musica: "¡Lindo! Horarios de clases y una clase de prueba para que se animen.",
  autos: "Bien. Turnos por horario y avisar cuándo está listo el auto ahorra muchas llamadas.",
  gastronomia: "¡Rico! Para gastronomía tenemos Al Toque Resto: carta, pedidos y reservas, y si querés, el panel del salón.",
  tienda: "¡Bien! Un catálogo con pedidos por WhatsApp y una caja para el local.",
  construccion: "Perfecto. Fotos de obras terminadas y un formulario para pedir presupuesto.",
  eventos: "¡Lindo! Fotos de eventos, fechas y una consulta rápida para reservar.",
  turismo: "¡Qué lindo! Destinos, fechas y consulta directa.",
  inmobiliaria: "Bien. Propiedades con fotos y una consulta directa por cada una.",
  otro: "¡Dale! Contame un poco más así te recomiendo bien.",
};

/** Un consejo según lo primero que le complica (se dice antes de la próxima pregunta). */
export const CONSEJO: Record<Dificultad, string> = {
  mensajes: "Con turnos online, la gente reserva sola a cualquier hora y vos dejás de contestar «¿tenés lugar?».",
  ausencias: "Un recordatorio por WhatsApp el día anterior ayuda mucho con los que se olvidan.",
  visibilidad: "Una página propia con tu dirección y tus horarios hace que te encuentren cuando te buscan.",
  mostrar: "Una galería y una lista de precios te ahorran mandar fotos una por una.",
  caja: "Con una caja simple sabés cuánto vendiste y quién te debe, sin cuaderno.",
  stock: "Con la caja pro ves el stock de cada sucursal y qué hizo cada empleado.",
  factura: "La caja pro hace la factura electrónica desde la misma venta.",
  senas: "Pedir seña al reservar baja mucho los turnos perdidos.",
  preguntas: "Una sección de preguntas frecuentes responde por vos lo que te preguntan siempre.",
  redes: "Con una página, tu bio de Instagram lleva a un lugar que trabaja solo, aunque no publiques.",
  deudas: "Con fiado o cuenta corriente anotado, sabés quién te debe y le mandás el saldo por WhatsApp.",
  vuelven: "Los recordatorios y las promos ayudan a que vuelvan.",
  ganancia: "El panel te muestra cuánto entra, por qué medio y qué es lo que más se vende.",
  faltantes: "Con caja y cierre del día ves enseguida si falta plata y de qué turno es.",
  presupuestos: "Un formulario de consulta te trae los datos que necesitás para presupuestar de una.",
};

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
  modalidad?: keyof typeof MODALIDAD;
  horario?: keyof typeof HORARIO;
  instagram?: string;
  webActual?: string;
  presupuesto?: keyof typeof PRESUPUESTO;
  conocio?: keyof typeof CONOCIO;
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
  const landing = DE_PAGINA.some((x) => q.has(x)) || (!agenda && !pro && !caja);
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
  if (d.has("preguntas")) f.add("web").add("faq");
  if (d.has("redes")) f.add("web").add("instagram");
  if (d.has("presupuestos")) f.add("web").add("contacto");
  if (d.has("vuelven")) f.add(r.rubro.profesion ? "recordatorios" : "promos");
  if (d.has("deudas")) f.add(r.rubro.caja ? "cajaSimple" : r.rubro.profesion ? "sena" : "cajaSimple");
  if (d.has("ganancia")) f.add(r.rubro.caja ? "cajaSimple" : r.rubro.profesion ? "panel" : "cajaSimple");
  if (d.has("faltantes")) f.add(r.rubro.id === "comercio" ? "cajaPro" : "cajaSimple");
  if (r.rubro.id === "gastronomia" && f.has("web")) f.add("menu").add("pedidos");
  if (r.rubro.id === "tienda" && f.has("web")) f.add("catalogo").add("pedidos");
  if (["fotografia", "tatuajes", "construccion", "eventos"].includes(r.rubro.id) && f.has("web")) f.add("galeria");
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

export type IdProducto = "landing" | "agenda" | "cajaSimple" | "cajaPro" | "resto";

export interface Producto {
  id: IdProducto;
  titulo: string;
  /** Por qué se lo recomendamos, en sus palabras. */
  porque: string[];
  precio: Monto;
  /** Sin precio publicado: se presupuesta según el alcance (caja pro). No suma al total. */
  aMedida?: boolean;
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
  conozcan: ["resto", "landing", "agenda", "cajaSimple", "cajaPro"],
  turnos: ["resto", "agenda", "landing", "cajaSimple", "cajaPro"],
  ventas: ["resto", "cajaPro", "cajaSimple", "landing", "agenda"],
  todo: ["resto", "landing", "agenda", "cajaPro", "cajaSimple"],
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

  // Gastronomía: Al Toque Resto reemplaza la página, la agenda y la caja simple (trae carta, reservas y caja).
  if (r.rubro.id === "gastronomia" && (quiereLanding || quiereAgenda || quiereCaja)) {
    const completo = quiereCaja || quierePro || quiereAgenda || q.has("panel");
    const planes = planesResto();
    const plan = completo ? planes.completo : planes.carta;
    const porque = ["Tu web con la carta, pedidos para retirar o con envío y reservas por turno, armada para tu tipo de local."];
    if (completo) porque.push("Con el panel del salón: mesas, comandas a cocina, cuenta dividida, caja y números.");
    else porque.push("Las reservas y los pedidos te llegan armados por WhatsApp.");
    if (q.has("promos")) porque.push("Con promos por horario: happy hour, menú del mediodía o el día de pizza.");
    if (r.zona === "turistas") porque.push("Con galería, eventos, reseñas y cómo llegar, para los que no te conocen.");
    if (quierePro) aparte.push("Si además necesitás factura electrónica o varias sucursales, lo presupuestamos aparte.");
    if (r.fotos === "no") aparte.push("Sin fotos propias arrancamos con el diseño y coordinamos unas buenas de tus platos cuando puedas.");
    if (r.plazo === "ya") aparte.push("Como lo necesitás ya, arrancamos con la carta y la web y sumamos el resto después.");
    productos.push({ id: "resto", titulo: `Al Toque Resto · ${plan.nombre}`, porque, precio: { unico: plan.unico, mensual: plan.mensual }, accion: { texto: "Ver la demo", href: linkDemoResto({ tipo: "bodegon", nombre }) } });
    return { productos, total: { unico: plan.unico, mensual: plan.mensual }, borrador: null, aparte };
  }

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
    if (q.has("catalogo") || q.has("menu")) porque.push(q.has("menu") ? "Con tu menú siempre al día, sin imprimir cartas nuevas." : "Con tu catálogo de productos y sus precios.");
    if (q.has("pedidos")) porque.push("Con pedidos que te llegan armados por WhatsApp.");
    if (q.has("faq")) porque.push("Con preguntas frecuentes que contestan por vos.");
    if (q.has("contacto")) porque.push("Con un formulario de consulta para presupuestar más rápido.");
    if (q.has("instagram")) porque.push("Con tu Instagram a la vista y un link para tu bio.");
    if (q.has("equipo") || q.has("promos")) porque.push("Con secciones para tu equipo y tus promociones.");
    if (q.has("tienda")) aparte.push("La tienda online con carrito y envíos la cotizamos aparte; mientras tanto, el catálogo con pedidos por WhatsApp funciona muy bien.");
    if (q.has("idiomas")) aparte.push("La versión en otro idioma se cotiza aparte según cuántos textos tenga la página.");
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
    if (r.sucursales === "dos" || r.sucursales === "tres") porque.push(`Con ${r.sucursales === "dos" ? "2" : "3 o más"} sucursales, cada una con su caja y su stock.`);
    if (r.productos === "muchos") porque.push("Cargamos tus productos desde tu lista de Excel o del proveedor.");
    aparte.push(`La caja pro es un proyecto a medida: ${CAJA_PRO_A_MEDIDA.texto.charAt(0).toLowerCase()}${CAJA_PRO_A_MEDIDA.texto.slice(1)} Con lo que me contaste te armamos el presupuesto.`);
    productos.push({ id: "cajaPro", titulo: "Caja pro", porque, precio: { unico: 0, mensual: 0 }, aMedida: true, accion: { texto: "Probar la caja pro", href: "/c/pro" } });
  }

  if (quiereLanding && quiereAgenda) {
    const a = ahorroWebTurnos();
    if (a.unico > 0) aparte.push(`Va como paquete Web + Turnos: te ahorrás ${formatearPesos(a.unico)} frente a contratar la página y la agenda por separado.`);
  }
  if (quiereLanding && !quiereAgenda && r.presupuesto === "bajo") {
    const perfil = planPerfil();
    aparte.push(`Si preferís arrancar más simple, el Perfil digital sale ${formatearPesos(perfil.unico)} + ${formatearPesos(perfil.mensual)} por mes: una página corta con lo esencial, que después crece.`);
  }
  if (r.zona === "pais") aparte.push("Si querés vender online con envíos, lo charlamos aparte.");
  if (r.plazo === "ya") aparte.push("Como lo necesitás ya, te proponemos arrancar por lo más urgente y sumar el resto después.");

  const orden = ORDEN[r.prioridad];
  productos.sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id));
  // Si la agenda va dentro de la página, primero la página (que es la que tiene el precio).
  const iL = productos.findIndex((x) => x.id === "landing");
  const iA = productos.findIndex((x) => x.id === "agenda");
  if (iL > iA && iA >= 0 && quiereLanding) productos.splice(iA, 0, ...productos.splice(iL, 1));
  const total = productos.filter((p) => !p.aMedida).reduce((t, p) => ({ unico: t.unico + p.precio.unico, mensual: t.mensual + p.precio.mensual }), { unico: 0, mensual: 0 });
  // Si el total pasa lo que pensaba invertir, se propone arrancar por lo primero de la lista.
  const tope = r.presupuesto ? PRESUPUESTOS[r.presupuesto].tope : Infinity;
  if (total.unico > tope && productos.length > 1)
    aparte.push(`Para tu presupuesto, podés arrancar por «${productos[0]!.titulo}» y sumar lo demás más adelante; lo que hagamos ahora queda listo para crecer.`);
  else if (total.unico > tope) aparte.push("Pasa un poco lo que pensabas: hablemos, podemos armar el pago único en partes o empezar con lo esencial.");
  return { productos, total, borrador, aparte };
}

/** Resumen de las respuestas para el pedido por WhatsApp/mail. */
export function resumenRespuestas(r: Respuestas): string[] {
  const lista = <K extends string>(xs: readonly K[] | undefined, nombres: Record<K, string>) => (xs?.length ? xs.map((x) => nombres[x]).join(", ") : "—");
  const uno = <K extends string>(x: K | undefined, nombres: Record<K, string>) => (x ? nombres[x] : null);
  const detalles: [string, string | null][] = [
    ["Atiende", uno(r.modalidad, MODALIDAD)],
    ["Horario", uno(r.horario, HORARIO)],
    ["Lo encuentran hoy en", r.presencia ? lista(r.presencia, PRESENCIA) : null],
    ["Instagram", r.instagram || null],
    ["Página actual", r.webActual || null],
    ["Presupuesto", uno(r.presupuesto, PRESUPUESTO)],
    ["Nos conoció", uno(r.conocio, CONOCIO)],
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
