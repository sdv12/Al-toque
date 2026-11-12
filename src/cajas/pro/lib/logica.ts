import {
  MEDIOS,
  PERMISOS,
  ROLES,
  type Cliente,
  type Comprobante,
  type EstadoPro,
  type Evento,
  type ItemCarrito,
  type Medio,
  type Movimiento,
  type Permiso,
  type Producto,
  type SesionCaja,
  type TipoComprobante,
  type Usuario,
} from "./tipos";

/*
 * Reglas de la caja pro. Funciones puras: reciben el estado y devuelven el nuevo (o un error con
 * un mensaje para mostrar). Cada acción verifica el permiso de quien la hace y deja su evento en
 * la auditoría. El store solo las llama y guarda el resultado.
 */

export interface Contexto {
  ahora: number;
  nuevoId: () => string;
}

export type Hecho<T = undefined> = { ok: true; estado: EstadoPro; valor: T } | { ok: false; error: string };

const fallo = (error: string): { ok: false; error: string } => ({ ok: false, error });
const listo = <T>(estado: EstadoPro, valor: T): Hecho<T> => ({ ok: true, estado, valor });

export const pesos = (n: number) => `$ ${Math.round(n).toLocaleString("es-AR")}`;

/* ───────────── Quién y dónde ───────────── */

export function puede(usuario: Usuario | undefined, permiso: Permiso): boolean {
  if (!usuario?.activo) return false;
  return usuario.rol === "dueno" || usuario.permisos.includes(permiso);
}

export function usuarioActual(e: EstadoPro): Usuario | undefined {
  return e.actual ? e.usuarios.find((u) => u.id === e.actual!.usuarioId) : undefined;
}

export function nombreDe(e: EstadoPro, usuarioId: string): string {
  return e.usuarios.find((u) => u.id === usuarioId)?.nombre ?? "—";
}

function evento(e: EstadoPro, ctx: Contexto, modulo: Evento["modulo"], accion: string, detalle: string, sensible = false): Evento {
  return {
    id: ctx.nuevoId(),
    fecha: ctx.ahora,
    usuarioId: e.actual?.usuarioId ?? "",
    sucursalId: e.actual?.sucursalId ?? "",
    modulo,
    accion,
    detalle,
    sensible,
  };
}

/** Quién está y si puede: el mensaje de error es el que ve la persona. */
function exigir(e: EstadoPro, permiso: Permiso): { usuario: Usuario; sucursalId: string } | { error: string } {
  const usuario = usuarioActual(e);
  if (!usuario || !e.actual) return { error: "Primero elegí quién sos." };
  if (!puede(usuario, permiso)) return { error: `${usuario.nombre} no tiene permiso de ${PERMISOS[permiso].nombre.toLowerCase()}.` };
  return { usuario, sucursalId: e.actual.sucursalId };
}

export function entrar(e: EstadoPro, usuarioId: string, sucursalId: string, ctx: Contexto): Hecho {
  const u = e.usuarios.find((x) => x.id === usuarioId);
  if (!u?.activo) return fallo("Ese usuario está dado de baja.");
  if (!u.sucursales.includes(sucursalId)) return fallo(`${u.nombre} no trabaja en esa sucursal.`);
  const sucursal = e.sucursales.find((s) => s.id === sucursalId)?.nombre ?? "";
  const siguiente = { ...e, actual: { usuarioId, sucursalId } };
  return listo({ ...siguiente, eventos: [evento(siguiente, ctx, "sesion", "Entró", `Sucursal ${sucursal}`), ...e.eventos] }, undefined);
}

export function salir(e: EstadoPro): EstadoPro {
  return { ...e, actual: null };
}

/* ───────────── Caja ───────────── */

export function sesionAbierta(e: EstadoPro, sucursalId: string): SesionCaja | undefined {
  return e.sesiones.find((s) => s.sucursalId === sucursalId && s.cierre === undefined);
}

export interface Totales {
  porMedio: Record<Medio, number>;
  ventas: number;
  cantidad: number;
  costo: number;
  margen: number;
  ingresos: number;
  egresos: number;
  /** Efectivo que tendría que haber en el cajón: fondo + efectivo que entró − efectivo que salió. */
  esperado: number;
}

export function totalesSesion(sesion: SesionCaja, movimientos: Movimiento[]): Totales {
  const porMedio = Object.fromEntries(Object.keys(MEDIOS).map((m) => [m, 0])) as Record<Medio, number>;
  const t = { ventas: 0, cantidad: 0, costo: 0, ingresos: 0, egresos: 0 };
  for (const m of movimientos) {
    if (m.sesionId !== sesion.id) continue;
    const signo = m.tipo === "egreso" ? -1 : 1;
    porMedio[m.medio] += signo * m.monto;
    if (m.tipo === "venta") {
      t.ventas += m.monto;
      t.costo += m.costo;
      t.cantidad += 1;
    } else if (m.tipo === "ingreso") t.ingresos += m.monto;
    else t.egresos += m.monto;
  }
  return { porMedio, ...t, margen: t.ventas - t.costo, esperado: sesion.fondo + porMedio.efectivo };
}

export function abrirCaja(e: EstadoPro, fondo: number, ctx: Contexto): Hecho {
  const q = exigir(e, "caja");
  if ("error" in q) return fallo(q.error);
  if (sesionAbierta(e, q.sucursalId)) return fallo("La caja de esta sucursal ya está abierta.");
  if (!(fondo >= 0)) return fallo("Poné con cuánto efectivo arrancás.");
  const sesion: SesionCaja = { id: ctx.nuevoId(), sucursalId: q.sucursalId, abiertaPor: q.usuario.id, apertura: ctx.ahora, fondo };
  return listo({ ...e, sesiones: [sesion, ...e.sesiones], eventos: [evento(e, ctx, "caja", "Abrió la caja", `Fondo ${pesos(fondo)}`), ...e.eventos] }, undefined);
}

export function movimientoManual(
  e: EstadoPro,
  datos: { tipo: "ingreso" | "egreso"; medio: Exclude<Medio, "cuenta">; monto: number; detalle: string },
  ctx: Contexto,
): Hecho {
  const q = exigir(e, "caja");
  if ("error" in q) return fallo(q.error);
  const sesion = sesionAbierta(e, q.sucursalId);
  if (!sesion) return fallo("Abrí la caja primero.");
  if (!(datos.monto > 0)) return fallo("Poné un monto.");
  if (!datos.detalle.trim()) return fallo(datos.tipo === "egreso" ? "Escribí en qué se gastó." : "Escribí de dónde vino la plata.");
  if (datos.tipo === "egreso" && datos.medio === "efectivo" && datos.monto > totalesSesion(sesion, e.movimientos).esperado) {
    return fallo("No hay tanto efectivo en la caja.");
  }
  const mov: Movimiento = {
    id: ctx.nuevoId(),
    sesionId: sesion.id,
    sucursalId: q.sucursalId,
    usuarioId: q.usuario.id,
    fecha: ctx.ahora,
    tipo: datos.tipo,
    medio: datos.medio,
    monto: datos.monto,
    costo: 0,
    detalle: datos.detalle.trim(),
  };
  const ev = evento(e, ctx, "caja", datos.tipo === "egreso" ? "Sacó plata" : "Puso plata", `${MEDIOS[datos.medio]} ${pesos(datos.monto)} · ${mov.detalle}`, datos.tipo === "egreso");
  return listo({ ...e, movimientos: [mov, ...e.movimientos], eventos: [ev, ...e.eventos] }, undefined);
}

export function cerrarCaja(e: EstadoPro, contado: number, motivo: string, ctx: Contexto): Hecho<SesionCaja> {
  const q = exigir(e, "caja");
  if ("error" in q) return fallo(q.error);
  const sesion = sesionAbierta(e, q.sucursalId);
  if (!sesion) return fallo("La caja ya está cerrada.");
  if (!(contado >= 0)) return fallo("Poné cuánto efectivo contaste.");
  const esperado = totalesSesion(sesion, e.movimientos).esperado;
  const diferencia = contado - esperado;
  if (diferencia !== 0 && !motivo.trim()) return fallo("Hay diferencia: explicá el motivo antes de cerrar.");
  const cerrada: SesionCaja = { ...sesion, cierre: ctx.ahora, cerradaPor: q.usuario.id, contado, esperado, motivo: diferencia ? motivo.trim() : undefined };
  const detalle = diferencia === 0 ? "Sin diferencias" : `Diferencia ${diferencia > 0 ? "+" : "−"}${pesos(Math.abs(diferencia))} · ${motivo.trim()}`;
  return listo(
    { ...e, sesiones: e.sesiones.map((s) => (s.id === sesion.id ? cerrada : s)), eventos: [evento(e, ctx, "caja", "Cerró la caja", detalle, diferencia !== 0), ...e.eventos] },
    cerrada,
  );
}

/* ───────────── Stock ───────────── */

export function stockDe(e: EstadoPro, sucursalId: string, productoId: string): number {
  return e.stock[sucursalId]?.[productoId] ?? 0;
}

export function stockBajo(e: EstadoPro, sucursalId: string): Producto[] {
  return e.productos.filter((p) => p.activo && stockDe(e, sucursalId, p.id) <= p.minimo);
}

/** Busca por nombre, marca o código (sin importar tildes ni mayúsculas). */
export function buscarProductos(e: EstadoPro, texto: string): Producto[] {
  const q = normalizar(texto);
  const activos = e.productos.filter((p) => p.activo);
  if (!q) return activos;
  return activos.filter((p) => normalizar(`${p.nombre} ${p.marca} ${p.categoria}`).includes(q) || p.codigo.startsWith(texto.trim()));
}

export function porCodigo(e: EstadoPro, codigo: string): Producto | undefined {
  const c = codigo.trim();
  return c ? e.productos.find((p) => p.activo && p.codigo === c) : undefined;
}

export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function guardarProducto(e: EstadoPro, p: Producto, ctx: Contexto): Hecho<Producto> {
  const q = exigir(e, "stock");
  if ("error" in q) return fallo(q.error);
  if (p.nombre.trim().length < 2) return fallo("Poné el nombre del producto.");
  if (!/^\d{6,14}$/.test(p.codigo)) return fallo("El código de barras son de 6 a 14 números.");
  if (e.productos.some((x) => x.codigo === p.codigo && x.id !== p.id)) return fallo("Ya hay otro producto con ese código.");
  if (!(p.precio > 0)) return fallo("Poné el precio de venta.");
  if (p.costo < 0 || p.minimo < 0) return fallo("El costo y el mínimo no pueden ser negativos.");
  const antes = e.productos.find((x) => x.id === p.id);
  const producto = { ...p, nombre: p.nombre.trim() };
  const productos = antes ? e.productos.map((x) => (x.id === p.id ? producto : x)) : [...e.productos, producto];
  const detalle = !antes
    ? `Nuevo: ${producto.nombre} a ${pesos(producto.precio)}`
    : antes.precio !== producto.precio
      ? `${producto.nombre}: precio ${pesos(antes.precio)} → ${pesos(producto.precio)}`
      : `${producto.nombre}: datos actualizados`;
  return listo({ ...e, productos, eventos: [evento(e, ctx, "stock", antes ? "Editó un producto" : "Agregó un producto", detalle, !!antes && antes.precio !== producto.precio), ...e.eventos] }, producto);
}

/** Corrige lo que hay en esta sucursal (conteo, rotura, mercadería que llegó). */
export function ajustarStock(e: EstadoPro, productoId: string, cantidad: number, motivo: string, ctx: Contexto): Hecho {
  const q = exigir(e, "stock");
  if ("error" in q) return fallo(q.error);
  const p = e.productos.find((x) => x.id === productoId);
  if (!p) return fallo("No existe ese producto.");
  if (!Number.isInteger(cantidad) || cantidad < 0) return fallo("La cantidad tiene que ser un número entero, 0 o más.");
  if (!motivo.trim()) return fallo("Escribí el motivo del ajuste.");
  const antes = stockDe(e, q.sucursalId, productoId);
  if (antes === cantidad) return fallo("Es la misma cantidad que ya había.");
  const stock = { ...e.stock, [q.sucursalId]: { ...e.stock[q.sucursalId], [productoId]: cantidad } };
  // Que entre mercadería es normal; que falte, hay que mirarlo.
  const ev = evento(e, ctx, "stock", "Ajustó stock", `${p.nombre}: ${antes} → ${cantidad} · ${motivo.trim()}`, cantidad < antes);
  return listo({ ...e, stock, eventos: [ev, ...e.eventos] }, undefined);
}

/* ───────────── Clientes y cuenta corriente ───────────── */

export function saldo(e: EstadoPro, clienteId: string): number {
  return e.cuentas.reduce((s, m) => (m.clienteId !== clienteId ? s : m.tipo === "cargo" ? s + m.monto : s - m.monto), 0);
}

export function guardarCliente(e: EstadoPro, c: Cliente, ctx: Contexto): Hecho<Cliente> {
  const q = exigir(e, "clientes");
  if ("error" in q) return fallo(q.error);
  if (c.nombre.trim().length < 2) return fallo("Poné el nombre o la razón social.");
  const doc = c.documento.replace(/\D/g, "");
  if (c.condicionIva === "Responsable inscripto" && doc.length !== 11) return fallo("Para factura A hace falta el CUIT (11 números).");
  if (doc && doc.length !== 11 && (doc.length < 7 || doc.length > 8)) return fallo("Poné un DNI (7 u 8 números) o un CUIT (11).");
  if (c.limite < 0) return fallo("El límite no puede ser negativo.");
  const antes = e.clientes.find((x) => x.id === c.id);
  const cliente = { ...c, nombre: c.nombre.trim(), documento: doc };
  const clientes = antes ? e.clientes.map((x) => (x.id === c.id ? cliente : x)) : [...e.clientes, cliente];
  const cambioLimite = !!antes && antes.limite !== cliente.limite;
  const detalle = cambioLimite ? `${cliente.nombre}: límite ${pesos(antes!.limite)} → ${pesos(cliente.limite)}` : cliente.nombre;
  return listo({ ...e, clientes, eventos: [evento(e, ctx, "clientes", antes ? "Editó un cliente" : "Agregó un cliente", detalle, cambioLimite), ...e.eventos] }, cliente);
}

/** Pago de cuenta corriente. Si entra por la caja (no es "cuenta"), queda como ingreso de la caja abierta. */
export function pagoCuenta(e: EstadoPro, clienteId: string, monto: number, medio: Exclude<Medio, "cuenta">, ctx: Contexto): Hecho {
  const q = exigir(e, "clientes");
  if ("error" in q) return fallo(q.error);
  const cliente = e.clientes.find((c) => c.id === clienteId);
  if (!cliente) return fallo("No existe ese cliente.");
  if (!(monto > 0)) return fallo("Poné cuánto paga.");
  const debe = saldo(e, clienteId);
  if (monto > debe) return fallo(`Debe ${pesos(debe)}: no puede pagar más que eso.`);
  const sesion = sesionAbierta(e, q.sucursalId);
  if (!sesion) return fallo("Abrí la caja para cobrar.");
  const detalle = `Pago de cuenta corriente · ${cliente.nombre}`;
  const pago = { id: ctx.nuevoId(), clienteId, fecha: ctx.ahora, tipo: "pago" as const, monto, detalle: MEDIOS[medio], usuarioId: q.usuario.id };
  const mov: Movimiento = { id: ctx.nuevoId(), sesionId: sesion.id, sucursalId: q.sucursalId, usuarioId: q.usuario.id, fecha: ctx.ahora, tipo: "ingreso", medio, monto, costo: 0, detalle };
  return listo(
    { ...e, cuentas: [pago, ...e.cuentas], movimientos: [mov, ...e.movimientos], eventos: [evento(e, ctx, "clientes", "Cobró cuenta corriente", `${cliente.nombre} ${pesos(monto)}`), ...e.eventos] },
    undefined,
  );
}

/* ───────────── Ventas y comprobantes ───────────── */

/** Responsable inscripto → Factura A; el resto, B (el negocio de la demo es responsable inscripto). */
export function tipoPara(cliente: Cliente | undefined): TipoComprobante {
  return cliente?.condicionIva === "Responsable inscripto" ? "Factura A" : "Factura B";
}

export function siguienteNumero(e: EstadoPro, sucursalId: string, tipo: TipoComprobante): string {
  const pv = e.sucursales.find((s) => s.id === sucursalId)?.puntoVenta ?? 1;
  const ultimo = e.comprobantes
    .filter((c) => c.sucursalId === sucursalId && c.tipo === tipo)
    .reduce((max, c) => Math.max(max, Number(c.numero.split("-")[1])), 0);
  return `${String(pv).padStart(4, "0")}-${String(ultimo + 1).padStart(8, "0")}`;
}

/** CAE de demostración: 14 números que salen del número de comprobante (siempre el mismo). */
export function caeDemo(semilla: string): string {
  let h = 2166136261;
  for (const ch of semilla) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `7${String(h).padStart(10, "0")}${String(h % 997).padStart(3, "0")}`.slice(0, 14);
}

export function totalCarrito(e: EstadoPro, carrito: ItemCarrito[]): { total: number; costo: number } {
  return carrito.reduce(
    (t, i) => {
      const p = e.productos.find((x) => x.id === i.productoId);
      return p ? { total: t.total + p.precio * i.cantidad, costo: t.costo + p.costo * i.cantidad } : t;
    },
    { total: 0, costo: 0 },
  );
}

export function validarVenta(e: EstadoPro, carrito: ItemCarrito[], medio: Medio, clienteId: string | null): string | null {
  const q = exigir(e, "vender");
  if ("error" in q) return q.error;
  if (!sesionAbierta(e, q.sucursalId)) return "La caja está cerrada: abrila para vender.";
  if (carrito.length === 0) return "Agregá al menos un producto.";
  for (const i of carrito) {
    const p = e.productos.find((x) => x.id === i.productoId);
    if (!p) return "Hay un producto que ya no existe.";
    if (!Number.isInteger(i.cantidad) || i.cantidad < 1) return `Revisá la cantidad de ${p.nombre}.`;
    const hay = stockDe(e, q.sucursalId, p.id);
    if (i.cantidad > hay) return `De ${p.nombre} quedan ${hay} en esta sucursal.`;
  }
  const cliente = clienteId ? e.clientes.find((c) => c.id === clienteId) : undefined;
  if (clienteId && !cliente) return "No existe ese cliente.";
  if (medio === "cuenta") {
    if (!cliente) return "Elegí el cliente para venderle a cuenta.";
    if (!cliente.limite) return `${cliente.nombre} no tiene cuenta corriente.`;
    const disponible = cliente.limite - saldo(e, cliente.id);
    if (totalCarrito(e, carrito).total > disponible) return `A ${cliente.nombre} le quedan ${pesos(Math.max(0, disponible))} de crédito.`;
  }
  return null;
}

/**
 * Cierra una venta: emite el comprobante, descuenta stock, registra el movimiento de caja y, si es
 * a cuenta, carga la deuda. `referencia`: el número de operación de Mercado Pago, si se cobró con QR.
 */
export function vender(
  e: EstadoPro,
  { carrito, medio, clienteId, referencia }: { carrito: ItemCarrito[]; medio: Medio; clienteId: string | null; referencia?: string },
  ctx: Contexto,
): Hecho<Comprobante> {
  const error = validarVenta(e, carrito, medio, clienteId);
  if (error) return fallo(error);
  const { usuarioId, sucursalId } = e.actual!;
  const sesion = sesionAbierta(e, sucursalId)!;
  const cliente = clienteId ? e.clientes.find((c) => c.id === clienteId) : undefined;
  const tipo = tipoPara(cliente);
  const numero = siguienteNumero(e, sucursalId, tipo);
  const { total, costo } = totalCarrito(e, carrito);
  const lineas = carrito.map((i) => {
    const p = e.productos.find((x) => x.id === i.productoId)!;
    return { productoId: p.id, nombre: p.nombre, cantidad: i.cantidad, precio: p.precio };
  });
  const comprobante: Comprobante = {
    id: ctx.nuevoId(),
    sucursalId,
    tipo,
    numero,
    fecha: ctx.ahora,
    clienteId: cliente?.id ?? null,
    clienteNombre: cliente?.nombre ?? "Consumidor final",
    documento: cliente?.documento ?? "",
    lineas,
    total,
    medio,
    cae: caeDemo(`${sucursalId}-${tipo}-${numero}`),
    vencimientoCae: ctx.ahora + 10 * 86_400_000,
    emitidoPor: usuarioId,
  };
  const stockSucursal = { ...e.stock[sucursalId] };
  for (const i of carrito) stockSucursal[i.productoId] = (stockSucursal[i.productoId] ?? 0) - i.cantidad;
  const mov: Movimiento = {
    id: ctx.nuevoId(),
    sesionId: sesion.id,
    sucursalId,
    usuarioId,
    fecha: ctx.ahora,
    tipo: "venta",
    medio,
    monto: total,
    costo,
    detalle: `${tipo} ${numero}${referencia ? ` · MP ${referencia}` : ""}`,
    comprobanteId: comprobante.id,
  };
  const cuentas =
    medio === "cuenta" ? [{ id: ctx.nuevoId(), clienteId: cliente!.id, fecha: ctx.ahora, tipo: "cargo" as const, monto: total, detalle: `${tipo} ${numero}`, usuarioId }, ...e.cuentas] : e.cuentas;
  return listo(
    {
      ...e,
      comprobantes: [comprobante, ...e.comprobantes],
      stock: { ...e.stock, [sucursalId]: stockSucursal },
      movimientos: [mov, ...e.movimientos],
      cuentas,
      eventos: [evento(e, ctx, "ventas", "Vendió", `${tipo} ${numero} · ${MEDIOS[medio]} ${pesos(total)}`), ...e.eventos],
    },
    comprobante,
  );
}

/* ───────────── Equipo ───────────── */

export function guardarUsuario(e: EstadoPro, u: Usuario, ctx: Contexto): Hecho<Usuario> {
  const q = exigir(e, "equipo");
  if ("error" in q) return fallo(q.error);
  if (u.nombre.trim().length < 2) return fallo("Poné el nombre.");
  if (u.sucursales.length === 0) return fallo("Elegí al menos una sucursal.");
  if (u.id === q.usuario.id && (!u.activo || u.rol !== "dueno")) return fallo("No podés darte de baja ni sacarte el rol de dueño/a a vos mismo/a.");
  const usuario: Usuario = { ...u, nombre: u.nombre.trim(), permisos: u.rol === "dueno" ? ROLES.dueno.permisos : u.permisos };
  const antes = e.usuarios.find((x) => x.id === u.id);
  const usuarios = antes ? e.usuarios.map((x) => (x.id === u.id ? usuario : x)) : [...e.usuarios, usuario];
  const cambios: string[] = [];
  if (antes) {
    const mas = usuario.permisos.filter((p) => !antes.permisos.includes(p)).map((p) => `+${PERMISOS[p].nombre}`);
    const menos = antes.permisos.filter((p) => !usuario.permisos.includes(p)).map((p) => `−${PERMISOS[p].nombre}`);
    cambios.push(...mas, ...menos);
    if (antes.activo !== usuario.activo) cambios.push(usuario.activo ? "reactivado" : "dado de baja");
    if (antes.rol !== usuario.rol) cambios.push(`rol ${ROLES[usuario.rol].nombre}`);
  }
  const detalle = antes ? `${usuario.nombre}: ${cambios.join(", ") || "datos actualizados"}` : `Nuevo: ${usuario.nombre} (${ROLES[usuario.rol].nombre})`;
  return listo({ ...e, usuarios, eventos: [evento(e, ctx, "equipo", antes ? "Cambió un usuario" : "Agregó un usuario", detalle, true), ...e.eventos] }, usuario);
}

/* ───────────── Reportes ───────────── */

export function inicioDelDia(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Ventas de los últimos `dias` días (hoy incluido), de una sucursal o de todas. */
export function ventasPorDia(e: EstadoPro, sucursalId: string | null, dias: number, ahora: number): { dia: number; total: number; cantidad: number }[] {
  const hoy = inicioDelDia(ahora);
  const salida = Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (dias - 1 - i));
    return { dia: d.getTime(), total: 0, cantidad: 0 };
  });
  for (const m of e.movimientos) {
    if (m.tipo !== "venta" || (sucursalId && m.sucursalId !== sucursalId)) continue;
    const dia = inicioDelDia(m.fecha);
    const fila = salida.find((s) => s.dia === dia);
    if (fila) {
      fila.total += m.monto;
      fila.cantidad += 1;
    }
  }
  return salida;
}

export interface ResumenVentas {
  total: number;
  cantidad: number;
  costo: number;
  margen: number;
  ticketPromedio: number;
  porMedio: Record<Medio, number>;
}

export function resumenVentas(e: EstadoPro, desde: number, sucursalId: string | null): ResumenVentas {
  const porMedio = Object.fromEntries(Object.keys(MEDIOS).map((m) => [m, 0])) as Record<Medio, number>;
  let total = 0;
  let cantidad = 0;
  let costo = 0;
  for (const m of e.movimientos) {
    if (m.tipo !== "venta" || m.fecha < desde || (sucursalId && m.sucursalId !== sucursalId)) continue;
    total += m.monto;
    costo += m.costo;
    cantidad += 1;
    porMedio[m.medio] += m.monto;
  }
  return { total, cantidad, costo, margen: total - costo, ticketPromedio: cantidad ? Math.round(total / cantidad) : 0, porMedio };
}

export function resumenEmpleados(e: EstadoPro, desde: number, sucursalId: string | null) {
  const mapa = new Map<string, { usuarioId: string; ventas: number; total: number; egresos: number; sensibles: number }>();
  const fila = (id: string) => {
    if (!mapa.has(id)) mapa.set(id, { usuarioId: id, ventas: 0, total: 0, egresos: 0, sensibles: 0 });
    return mapa.get(id)!;
  };
  for (const m of e.movimientos) {
    if (m.fecha < desde || (sucursalId && m.sucursalId !== sucursalId)) continue;
    if (m.tipo === "venta") {
      fila(m.usuarioId).ventas += 1;
      fila(m.usuarioId).total += m.monto;
    } else if (m.tipo === "egreso") fila(m.usuarioId).egresos += m.monto;
  }
  for (const ev of e.eventos) {
    if (ev.sensible && ev.fecha >= desde && (!sucursalId || ev.sucursalId === sucursalId)) fila(ev.usuarioId).sensibles += 1;
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

/** Los más vendidos (unidades) desde una fecha. */
export function masVendidos(e: EstadoPro, desde: number, sucursalId: string | null, cuantos = 5) {
  const mapa = new Map<string, { nombre: string; unidades: number; total: number }>();
  for (const c of e.comprobantes) {
    if (c.fecha < desde || (sucursalId && c.sucursalId !== sucursalId)) continue;
    for (const l of c.lineas) {
      const f = mapa.get(l.productoId) ?? { nombre: l.nombre, unidades: 0, total: 0 };
      f.unidades += l.cantidad;
      f.total += l.cantidad * l.precio;
      mapa.set(l.productoId, f);
    }
  }
  return [...mapa.values()].sort((a, b) => b.unidades - a.unidades).slice(0, cuantos);
}
