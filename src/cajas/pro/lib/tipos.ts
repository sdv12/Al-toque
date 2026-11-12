/*
 * Caja pro (demo): modelo de datos. Montos en pesos enteros; fechas en milisegundos.
 * Todo vive en el navegador (localStorage) mientras sea demo; la versión real lo guarda en la base.
 */

export type Permiso = "vender" | "caja" | "stock" | "clientes" | "comprobantes" | "reportes" | "equipo" | "auditoria";

export const PERMISOS: Record<Permiso, { nombre: string; detalle: string }> = {
  vender: { nombre: "Vender", detalle: "Cobrar con la caja abierta" },
  caja: { nombre: "Caja", detalle: "Abrir, cerrar, ingresos y egresos" },
  stock: { nombre: "Stock", detalle: "Productos, precios y ajustes" },
  clientes: { nombre: "Clientes", detalle: "Cuentas corrientes y pagos" },
  comprobantes: { nombre: "Comprobantes", detalle: "Facturas emitidas" },
  reportes: { nombre: "Reportes", detalle: "Ventas, márgenes y empleados" },
  equipo: { nombre: "Equipo", detalle: "Usuarios y permisos" },
  auditoria: { nombre: "Auditoría", detalle: "Registro de quién hizo qué" },
};

export type Rol = "dueno" | "encargado" | "vendedor";

export const ROLES: Record<Rol, { nombre: string; permisos: Permiso[] }> = {
  dueno: { nombre: "Dueño/a", permisos: Object.keys(PERMISOS) as Permiso[] },
  encargado: { nombre: "Encargado/a", permisos: ["vender", "caja", "stock", "clientes", "comprobantes", "reportes"] },
  vendedor: { nombre: "Vendedor/a", permisos: ["vender", "clientes"] },
};

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  /** Los del dueño son siempre todos; el resto se elige uno por uno. */
  permisos: Permiso[];
  /** Sucursales donde puede trabajar. */
  sucursales: string[];
  activo: boolean;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  /** Punto de venta de ARCA: primera parte del número de factura (0001-…). */
  puntoVenta: number;
}

export interface Producto {
  id: string;
  /** Código de barras (lo que manda el lector). */
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  precio: number;
  costo: number;
  /** Debajo de esto avisa "stock bajo". */
  minimo: number;
  activo: boolean;
}

export type CondicionIva = "Consumidor final" | "Monotributo" | "Responsable inscripto";

export interface Cliente {
  id: string;
  nombre: string;
  /** CUIT o DNI. */
  documento: string;
  condicionIva: CondicionIva;
  telefono: string;
  /** Hasta cuánto puede deber en cuenta corriente (0 = sin cuenta corriente). */
  limite: number;
}

export type Medio = "efectivo" | "debito" | "credito" | "transferencia" | "qr" | "cuenta";

export const MEDIOS: Record<Medio, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia",
  qr: "QR Mercado Pago",
  cuenta: "Cuenta corriente",
};

export interface SesionCaja {
  id: string;
  sucursalId: string;
  abiertaPor: string;
  apertura: number;
  fondo: number;
  cierre?: number;
  cerradaPor?: string;
  /** Efectivo contado al cerrar, el que tendría que haber y la diferencia. */
  contado?: number;
  esperado?: number;
  motivo?: string;
}

export interface Movimiento {
  id: string;
  sesionId: string;
  sucursalId: string;
  usuarioId: string;
  fecha: number;
  tipo: "venta" | "ingreso" | "egreso";
  medio: Medio;
  monto: number;
  /** Ventas: lo que costó la mercadería (para el margen). */
  costo: number;
  detalle: string;
  comprobanteId?: string;
}

export type TipoComprobante = "Factura A" | "Factura B";

export interface LineaComprobante {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Comprobante {
  id: string;
  sucursalId: string;
  tipo: TipoComprobante;
  /** "0001-00000123". */
  numero: string;
  fecha: number;
  clienteId: string | null;
  clienteNombre: string;
  documento: string;
  lineas: LineaComprobante[];
  total: number;
  medio: Medio;
  /** CAE de demostración (en la versión real lo devuelve ARCA). */
  cae: string;
  vencimientoCae: number;
  emitidoPor: string;
}

export interface MovimientoCuenta {
  id: string;
  clienteId: string;
  fecha: number;
  tipo: "cargo" | "pago";
  monto: number;
  detalle: string;
  usuarioId: string;
}

export interface Evento {
  id: string;
  fecha: number;
  usuarioId: string;
  sucursalId: string;
  modulo: "caja" | "ventas" | "stock" | "clientes" | "equipo" | "sesion";
  accion: string;
  detalle: string;
  /** Lo que conviene revisar: egresos, diferencias de caja, ajustes de stock, cambios de permisos. */
  sensible: boolean;
}

export interface EstadoPro {
  version: 1;
  negocio: { nombre: string; razonSocial: string; cuit: string };
  sucursales: Sucursal[];
  usuarios: Usuario[];
  productos: Producto[];
  /** sucursalId → productoId → unidades. */
  stock: Record<string, Record<string, number>>;
  clientes: Cliente[];
  cuentas: MovimientoCuenta[];
  sesiones: SesionCaja[];
  movimientos: Movimiento[];
  comprobantes: Comprobante[];
  eventos: Evento[];
  /** Quién está usando la caja y en qué sucursal (null = pantalla de ingreso). */
  actual: { usuarioId: string; sucursalId: string } | null;
}

export interface ItemCarrito {
  productoId: string;
  cantidad: number;
}
