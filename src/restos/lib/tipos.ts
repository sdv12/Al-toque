/*
 * Modelo de datos de Resto al toque. `Local` es la configuración del restaurante (lo que se edita en
 * Ajustes); el resto es la operación del día (salón, reservas, pedidos, caja). Hoy todo vive en el
 * navegador; cuando llegue la nube (Fase 5) este mismo estado se guarda por restaurante.
 */

export const ID_TIPOS = ["bodegon", "parrilla", "pizzeria", "cafe", "bar", "sushi", "hamburguesas", "rotiseria"] as const;
export type IdTipo = (typeof ID_TIPOS)[number];

export const ID_DISENOS = ["imprenta", "pizarra", "trattoria", "cafe", "nocturno", "brasa", "moderno"] as const;
export type IdDiseno = (typeof ID_DISENOS)[number];

export const MEDIOS = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  qr: "QR Mercado Pago",
  debito: "Débito",
  credito: "Crédito",
} as const;
export type Medio = keyof typeof MEDIOS;
export const ID_MEDIOS = Object.keys(MEDIOS) as Medio[];

export const ETIQUETAS = {
  sintacc: { nombre: "Sin TACC", corto: "S/TACC" },
  vegetariano: { nombre: "Vegetariano", corto: "Veggie" },
  vegano: { nombre: "Vegano", corto: "Vegano" },
  picante: { nombre: "Picante", corto: "Picante" },
  nuevo: { nombre: "Nuevo", corto: "Nuevo" },
} as const;
export type Etiqueta = keyof typeof ETIQUETAS;

/** Una franja de atención de un día ("Mediodía 12:30–15:30"). `hasta` menor que `desde` = cierra después de medianoche. */
export interface Franja {
  nombre: string;
  desde: string;
  hasta: string;
}

export interface Horarios {
  /** Índice = día de la semana (0 domingo … 6 sábado). Sin franjas = cerrado. */
  semana: Franja[][];
  /** Días puntuales sin atención (feriados, vacaciones). */
  cerrados: { fecha: string; motivo: string }[];
}

export interface ReglasReserva {
  /** Cada cuántos minutos se ofrece un horario. */
  intervalo: 15 | 30 | 60;
  /** Última reserva: cuántos minutos antes del cierre de la franja. */
  margenCierre: number;
  /** Hasta cuántos días para adelante se puede reservar. */
  diasAnticipacion: number;
  /** Más personas que esto: que escriban por WhatsApp. */
  maxPersonas: number;
  /** Minutos que se guarda la mesa. */
  tolerancia: number;
}

export interface Modulos {
  /** Mesas y cuentas en el panel. */
  salon: boolean;
  /** Mostrar en la web cuánta gente hay ahora. */
  ocupacionWeb: boolean;
  reservas: boolean;
  /** Pedidos para retirar. */
  llevar: boolean;
  /** Pedidos con envío. */
  delivery: boolean;
  caja: boolean;
  /** Secciones de la carta marcadas como tienda (almacén, café en grano…). */
  tienda: boolean;
}

export interface Textos {
  titulo: string;
  subtitulo: string;
  historia: string;
  /** Tres datos cortos para el encabezado ("30 cubiertos", "Horno de barro"…). */
  datos: string[];
}

export interface Local {
  tipo: IdTipo;
  nombre: string;
  /** Qué es, en pocas palabras: "Bodegón · Almacén". */
  bajada: string;
  ciudad: string;
  direccion: string;
  whatsapp: string;
  instagram: string;
  diseno: IdDiseno;
  /** Color principal propio; vacío = el del diseño. */
  acento: string;
  textos: Textos;
  modulos: Modulos;
  horarios: Horarios;
  reservas: ReglasReserva;
  /** Minutos que tarda un pedido para retirar. */
  demoraLlevar: number;
  delivery: Delivery;
  /** Servicio de mesa por persona (0 = no se cobra). */
  cubierto: number;
  comisiones: Record<Medio, number>;
  /** Zonas del salón (Adentro, Vereda, Terraza…). */
  zonas: Zona[];
  personal: Persona[];
  promos: Promo[];
  /** Días o turnos sin reservas por la web aunque el local abra (evento privado, salón completo). */
  bloqueos: Bloqueo[];
  /** Lo que se edita de la web: secciones, fotos, eventos, reseñas, tipografía. */
  web: Web;
}

/** Secciones de la web pública (el encabezado va siempre primero). */
export const SECCIONES_WEB = {
  ocupacion: { nombre: "Ocupación en vivo", titulo: "" },
  carta: { nombre: "La carta", titulo: "" },
  reservar: { nombre: "Reservas", titulo: "" },
  eventos: { nombre: "Eventos", titulo: "Lo que se viene" },
  galeria: { nombre: "Galería de fotos", titulo: "Así es la casa" },
  historia: { nombre: "Nuestra historia", titulo: "" },
  resenas: { nombre: "Reseñas", titulo: "Lo que dicen" },
  donde: { nombre: "Dónde y cuándo", titulo: "Dónde y cuándo" },
} as const;
export type IdSeccionWeb = keyof typeof SECCIONES_WEB;

export const ID_TIPOGRAFIAS = ["clasica", "moderna", "redonda", "condensada", "slab", "maquina"] as const;
export type IdTipografia = (typeof ID_TIPOGRAFIAS)[number];

export interface FotoGaleria {
  id: string;
  /** Imagen achicada (data URL); vacío = lugar para una foto (solo en la demo). */
  src: string;
  texto: string;
}

export interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  texto: string;
  /** 0 = sin cargo. */
  precio: number;
}

export interface Resena {
  id: string;
  nombre: string;
  texto: string;
  estrellas: number;
  /** Dónde la dejó: Google, Instagram, en el local. */
  fuente: string;
  fecha: string;
}

export interface Web {
  secciones: { id: IdSeccionWeb; visible: boolean; titulo: string }[];
  logo: string;
  portada: string;
  historiaFoto: string;
  /** Texto largo de la sección «Nuestra historia» (párrafos separados por línea en blanco). */
  historiaLarga: string;
  galeria: FotoGaleria[];
  eventos: Evento[];
  resenas: Resena[];
  /** Tipografía propia; vacío = la del diseño. */
  tipografia: IdTipografia | "";
  /** Mostrar el botón para ver el mapa de Google. */
  mapa: boolean;
}

/** Un cliente que llama desde la mesa (escaneó el QR). */
export interface Llamado {
  id: string;
  mesaId: string;
  tipo: "mozo" | "cuenta";
  ts: number;
}

export interface Zona {
  id: string;
  nombre: string;
}

export interface ZonaEnvio {
  id: string;
  nombre: string;
  costo: number;
  minimo: number;
}

export interface Delivery {
  /** Costo y mínimo cuando no hay zonas cargadas. */
  costo: number;
  minimo: number;
  /** Texto de la zona ("Hasta 3 km del local"). */
  zona: string;
  demora: number;
  /** Zonas con su propio costo y mínimo; si hay, el cliente elige la suya. */
  zonas: ZonaEnvio[];
}

export const ROLES = {
  encargado: { nombre: "Encargado", texto: "Todo: salón, caja, números y ajustes." },
  mozo: { nombre: "Mozo", texto: "Salón, reservas, lista de espera y pedidos. Cobra las mesas." },
  cocina: { nombre: "Cocina", texto: "La pantalla de comandas y qué hay en la carta." },
  caja: { nombre: "Caja", texto: "Salón, pedidos, reservas y la caja." },
} as const;
export type Rol = keyof typeof ROLES;

export interface Persona {
  id: string;
  nombre: string;
  rol: Rol;
  pin: string;
  activo: boolean;
}

/** Descuento por horario sobre algunas secciones (happy hour, menú del mediodía). */
export interface Promo {
  id: string;
  nombre: string;
  /** Días de la semana (0 domingo … 6 sábado). */
  dias: number[];
  desde: string;
  hasta: string;
  porcentaje: number;
  categorias: string[];
  activa: boolean;
}

export interface Bloqueo {
  fecha: string;
  /** Nombre de la franja bloqueada; vacío = todo el día. */
  franja: string;
  motivo: string;
}

/** Un grupo de opciones de un plato: punto de la carne, guarnición, tamaño. */
export interface GrupoOpciones {
  nombre: string;
  valores: { nombre: string; extra: number }[];
}

export interface Categoria {
  id: string;
  nombre: string;
  nota?: string;
  /** Se vende como tienda (solo para llevar), si el módulo está prendido. */
  tienda?: boolean;
  /** Va a la barra (bebidas) y no a la cocina. */
  barra?: boolean;
}

export interface Plato {
  id: string;
  cat: string;
  nombre: string;
  desc: string;
  precio: number;
  porcion: string;
  disponible: boolean;
  llevar: boolean;
  destacado: boolean;
  etiquetas: Etiqueta[];
  /** Opciones para elegir (cada grupo, un valor). */
  opciones?: GrupoOpciones[];
  /** Solo estos días de la semana (vacío o sin definir = todos). */
  dias?: number[];
}

export interface Item {
  platoId: string;
  nombre: string;
  /** Precio unitario ya con opciones y promo. */
  precio: number;
  cant: number;
  /** Lo elegido ("A punto", "Con puré"). */
  opciones?: string[];
  nota?: string;
  /** Cuántas unidades ya se mandaron a cocina o barra. */
  enviados?: number;
}

export interface PagoParcial {
  monto: number;
  medio: Medio;
  propina: number;
}

export interface Ocupada {
  personas: number;
  nombre: string;
  desde: number;
  items: Item[];
  reservaId: string | null;
  /** Id de la persona del personal que atiende la mesa. */
  mozo?: string;
  /** Descuento sobre la cuenta, en %. */
  descuento?: number;
  /** Partes ya cobradas (cuenta dividida). */
  pagos?: PagoParcial[];
  /** Unidades ya cobradas por plato (división por plato), por clave de ítem. */
  pagado?: Record<string, number>;
}

export interface Mesa {
  id: string;
  nombre: string;
  cap: number;
  zona: string;
  /** Si está unida a otra mesa (para un grupo grande), el id de la principal. */
  unidaA?: string | null;
  ocupada: Ocupada | null;
}

export type EstadoComanda = "nueva" | "preparando" | "lista" | "entregada";
export interface Comanda {
  id: string;
  destino: "cocina" | "barra";
  /** "Mesa 3", "Pedido #42". */
  origen: string;
  mesaId?: string;
  pedidoId?: string;
  mozo?: string;
  items: { nombre: string; cant: number; opciones?: string[]; nota?: string }[];
  estado: EstadoComanda;
  creada: number;
  lista?: number;
}

export type EstadoEspera = "esperando" | "avisado" | "sentado" | "sefue";
export interface Espera {
  id: string;
  nombre: string;
  personas: number;
  tel: string;
  llegada: number;
  estado: EstadoEspera;
  origen: "web" | "local";
}

/** Una venta cerrada (mesa o pedido), para los números. */
export interface Venta {
  id: string;
  ts: number;
  tipo: "mesa" | "pedido";
  ref: string;
  franja: string;
  mozo?: string;
  personas: number;
  items: { platoId: string; nombre: string; cant: number; precio: number }[];
  descuento: number;
  propina: number;
  total: number;
  pagos: { medio: Medio; monto: number }[];
}

export const ESTADOS_RESERVA = {
  pendiente: "Sin confirmar",
  confirmada: "Confirmada",
  sentada: "En mesa",
  cancelada: "Cancelada",
  novino: "No vino",
} as const;
export type EstadoReserva = keyof typeof ESTADOS_RESERVA;

export interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  personas: number;
  nombre: string;
  tel: string;
  nota: string;
  estado: EstadoReserva;
  origen: "web" | "teléfono";
  creada: number;
  mesa?: string;
}

export type EstadoPedido = "nuevo" | "cocina" | "listo" | "entregado" | "cancelado";
export type Entrega = "retiro" | "envio";

export interface Pedido {
  id: string;
  /** Zona de envío elegida (si el local tiene zonas). */
  zonaEnvio?: string;
  num: number;
  nombre: string;
  tel: string;
  /** Hora de retiro o de entrega, o "Cuanto antes". */
  hora: string;
  entrega: Entrega;
  direccion: string;
  envio: number;
  items: Item[];
  /** Platos + envío. */
  total: number;
  estado: EstadoPedido;
  pago: Medio;
  pagado: boolean;
  movId?: string | null;
  creado: number;
  origen: "web" | "teléfono";
  nota: string;
}

export type TipoMov = "venta" | "ingreso" | "egreso";
export interface Movimiento {
  id: string;
  ts: number;
  tipo: TipoMov;
  concepto: string;
  monto: number;
  medio: Medio;
}

export interface Caja {
  abierta: boolean;
  apertura: number | null;
  fondo: number;
  movs: Movimiento[];
  /** Se abrió sola con el primer cobro. */
  autoabierta?: boolean;
}

export interface PorMedio {
  medio: Medio;
  cant: number;
  bruto: number;
  com: number;
  neto: number;
}

export interface Cierre {
  id: string;
  apertura: number;
  cierre: number;
  fondo: number;
  bruto: number;
  com: number;
  neto: number;
  egresos: number;
  ventas: number;
  esperado: number;
  contado: number;
  diferencia: number;
  porMedio: PorMedio[];
  nota: string;
}

export interface Estado {
  v: 1;
  local: Local;
  categorias: Categoria[];
  platos: Plato[];
  mesas: Mesa[];
  reservas: Reserva[];
  pedidos: Pedido[];
  proximoPedido: number;
  caja: Caja;
  cierres: Cierre[];
  comandas: Comanda[];
  espera: Espera[];
  ventas: Venta[];
  llamados: Llamado[];
}
