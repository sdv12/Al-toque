/* Reglas del salón, las reservas y la caja. Puras: reciben el estado y devuelven números. */
import { franjaDeHora } from "./horarios";
import { ID_MEDIOS, type Estado, type Item, type Local, type Medio, type Ocupada, type Plato, type PorMedio, type Promo, type Venta } from "./tipos";

export const totalItems = (items: Item[] = []) => items.reduce((s, i) => s + i.precio * i.cant, 0);
export const cantItems = (items: Item[] = []) => items.reduce((s, i) => s + i.cant, 0);

/** Cubiertos totales: la suma de lugares de las mesas. */
export const aforoDe = (st: Estado) => st.mesas.reduce((s, m) => s + (Number(m.cap) || 0), 0);

/** Personas en el salón ahora. */
export const enSalon = (st: Estado) => st.mesas.reduce((s, m) => s + (m.ocupada ? m.ocupada.personas : 0), 0);

/** Servicio de mesa de una cuenta. */
export const cubiertoDe = (local: Local, o: Ocupada) => (local.cubierto > 0 ? local.cubierto * o.personas : 0);

/** Lo que se cobra en una mesa: platos + servicio de mesa. */
export const totalMesa = (local: Local, o: Ocupada) => totalItems(o.items) + cubiertoDe(local, o);

const ACTIVAS = ["pendiente", "confirmada", "sentada"];

/** Lugares reservados en una franja (cuenta pendientes, confirmadas y ya sentadas). */
export const reservadosTurno = (st: Estado, fecha: string, franja: number, excepto?: string) =>
  st.reservas
    .filter((r) => r.id !== excepto && r.fecha === fecha && ACTIVAS.includes(r.estado) && franjaDeHora(st.local.horarios, fecha, r.hora) === franja)
    .reduce((s, r) => s + r.personas, 0);

export const cupoTurno = (st: Estado, fecha: string, franja: number) => Math.max(0, aforoDe(st) - reservadosTurno(st, fecha, franja));

export const comision = (local: Local, medio: Medio, monto: number) => (monto * (local.comisiones[medio] || 0)) / 100;

export type NivelOcupacion = "libre" | "casi" | "lleno";
export function ocupacion(n: number, aforo: number): { nivel: NivelOcupacion; texto: string } {
  const r = aforo ? n / aforo : 0;
  if (r >= 0.95) return { nivel: "lleno", texto: "Salón completo" };
  if (r >= 0.7) return { nivel: "casi", texto: "Quedan pocas mesas" };
  return { nivel: "libre", texto: "Hay lugar" };
}

export function resumenCaja(st: Estado) {
  const c = st.caja;
  const porMedio: PorMedio[] = ID_MEDIOS.map((m) => {
    const ventas = c.movs.filter((x) => x.tipo === "venta" && x.medio === m);
    const bruto = ventas.reduce((s, x) => s + x.monto, 0);
    const com = ventas.reduce((s, x) => s + comision(st.local, m, x.monto), 0);
    return { medio: m, cant: ventas.length, bruto, com, neto: bruto - com };
  });
  const bruto = porMedio.reduce((s, x) => s + x.bruto, 0);
  const com = porMedio.reduce((s, x) => s + x.com, 0);
  const suma = (tipo: string, medio?: Medio) =>
    c.movs.filter((x) => x.tipo === tipo && (!medio || x.medio === medio)).reduce((s, x) => s + x.monto, 0);
  const egresos = suma("egreso");
  const ingresos = suma("ingreso");
  const efectivoEsperado = c.fondo + suma("venta", "efectivo") + suma("ingreso", "efectivo") - suma("egreso", "efectivo");
  const ventas = c.movs.filter((x) => x.tipo === "venta").length;
  return { porMedio, bruto, com, neto: bruto - com, egresos, ingresos, efectivoEsperado, ventas, ticket: ventas ? bruto / ventas : 0 };
}

/** Lo más pedido entre mesas abiertas y pedidos del día (para el panel). */
export function masPedidos(st: Estado, n = 5) {
  const cuenta = new Map<string, { nombre: string; cant: number }>();
  const sumar = (items: Item[]) =>
    items.forEach((i) => {
      const prev = cuenta.get(i.platoId) ?? { nombre: i.nombre, cant: 0 };
      prev.cant += i.cant;
      cuenta.set(i.platoId, prev);
    });
  st.mesas.forEach((m) => m.ocupada && sumar(m.ocupada.items));
  st.pedidos.filter((p) => p.estado !== "cancelado").forEach((p) => sumar(p.items));
  return [...cuenta.values()].sort((a, b) => b.cant - a.cant).slice(0, n);
}

/** Pedido mínimo de delivery: cuánto falta (0 = alcanza). */
export const faltaMinimo = (minimo: number, subtotal: number) => Math.max(0, minimo - subtotal);

// ---------------------------------------------------------------- R2

/** Identifica una línea de la cuenta: mismo plato con otras opciones o nota = otra línea. */
export const claveItem = (i: Pick<Item, "platoId" | "opciones" | "nota">) => `${i.platoId}|${(i.opciones ?? []).join("·")}|${i.nota ?? ""}`;

/** ¿El plato sale hoy? (platos de algunos días, como el locro de fin de semana). */
export const saleHoy = (p: Plato, ahora: Date) => !p.dias?.length || p.dias.includes(ahora.getDay());

const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
export const textoDias = (dias: number[]) => (dias.length === 7 ? "Todos los días" : "Solo " + [1, 2, 3, 4, 5, 6, 0].filter((d) => dias.includes(d)).map((d) => DIAS_CORTOS[d]).join(", "));

/** La promo que corre ahora para una sección (si hay varias, la de mayor descuento). */
export function promoActiva(local: Local, cat: string, ahora: Date): Promo | undefined {
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  const dia = ahora.getDay();
  const ayer = (dia + 6) % 7;
  return local.promos
    .filter((p) => {
      if (!p.activa || p.porcentaje <= 0 || !p.categorias.includes(cat)) return false;
      const ini = aMinutos(p.desde);
      let fin = aMinutos(p.hasta);
      if (fin <= ini) fin += 1440;
      return (p.dias.includes(dia) && m >= ini && m < fin) || (p.dias.includes(ayer) && m + 1440 >= ini && m + 1440 < fin);
    })
    .sort((a, b) => b.porcentaje - a.porcentaje)[0];
}
const aMinutos = (h: string) => {
  const [a = 0, b = 0] = h.split(":").map(Number);
  return a * 60 + b;
};

/** Precio de lista con la promo de ahora aplicada (redondeado a $ 10). */
export function precioVigente(local: Local, p: Plato, ahora: Date, extra = 0) {
  const base = p.precio + extra;
  const promo = promoActiva(local, p.cat, ahora);
  return { precio: promo ? Math.round((base * (100 - promo.porcentaje)) / 1000) * 10 : base, lista: base, promo };
}

/** Suma de extras de las opciones elegidas. */
export function extraOpciones(p: Plato, elegidas: string[]) {
  return (p.opciones ?? []).reduce((s, g, i) => s + (g.valores.find((v) => v.nombre === elegidas[i])?.extra ?? 0), 0);
}

/** Descuento de la mesa en pesos. */
export const descuentoMesa = (local: Local, o: Ocupada) => Math.round((totalMesa(local, o) * (o.descuento ?? 0)) / 100);

/** Lo que falta cobrar de una mesa (cuenta con descuento menos las partes ya cobradas). */
export const restanteMesa = (local: Local, o: Ocupada) => Math.max(0, totalMesa(local, o) - descuentoMesa(local, o) - (o.pagos ?? []).reduce((s, p) => s + p.monto, 0));

/** Unidades que todavía no se cobraron, por línea (para dividir por plato). */
export function unidadesPendientes(o: Ocupada) {
  return o.items.map((i) => ({ item: i, clave: claveItem(i), quedan: i.cant - (o.pagado?.[claveItem(i)] ?? 0) })).filter((x) => x.quedan > 0);
}

/** Unidades de cada línea que faltan mandar a cocina o barra. */
export const sinEnviar = (o: Ocupada) => o.items.reduce((s, i) => s + Math.max(0, i.cant - (i.enviados ?? 0)), 0);

/** Costo y mínimo de envío para una zona (o los generales si no hay zonas). */
export function envioPara(local: Local, zonaId?: string) {
  const z = local.delivery.zonas.find((x) => x.id === zonaId);
  return z ? { costo: z.costo, minimo: z.minimo, nombre: z.nombre } : { costo: local.delivery.costo, minimo: local.delivery.minimo, nombre: local.delivery.zona };
}

/** Mesas que forman grupo con esta (la principal y las unidas a ella). */
export const grupoDe = (st: Estado, mesaId: string) => {
  const m = st.mesas.find((x) => x.id === mesaId);
  const principal = m?.unidaA ?? mesaId;
  return st.mesas.filter((x) => x.id === principal || x.unidaA === principal);
};
export const capGrupo = (st: Estado, mesaId: string) => grupoDe(st, mesaId).reduce((s, m) => s + m.cap, 0);

// ---------------------------------------------------------------- Números

export interface Numeros {
  ventas: number;
  total: number;
  ticket: number;
  personas: number;
  porPersona: number;
  propinas: number;
  descuentos: number;
  porDia: { fecha: string; total: number; ventas: number }[];
  porFranja: { nombre: string; total: number; ventas: number }[];
  porMozo: { id: string; total: number; ventas: number; personas: number }[];
  porMedio: { medio: Medio; total: number }[];
  platos: { nombre: string; cant: number; total: number }[];
  mesas: number;
  pedidos: number;
}

/** Números de las ventas cerradas entre dos instantes. */
export function numeros(ventas: Venta[], desde: number, hasta: number): Numeros {
  const vs = ventas.filter((v) => v.ts >= desde && v.ts < hasta);
  const total = vs.reduce((s, v) => s + v.total, 0);
  const personas = vs.filter((v) => v.tipo === "mesa").reduce((s, v) => s + v.personas, 0);
  const totalMesas = vs.filter((v) => v.tipo === "mesa").reduce((s, v) => s + v.total, 0);
  const agrupar = <K extends string>(clave: (v: Venta) => K | undefined) => {
    const m = new Map<K, { total: number; ventas: number; personas: number }>();
    for (const v of vs) {
      const k = clave(v);
      if (k === undefined) continue;
      const x = m.get(k) ?? { total: 0, ventas: 0, personas: 0 };
      x.total += v.total;
      x.ventas++;
      x.personas += v.tipo === "mesa" ? v.personas : 0;
      m.set(k, x);
    }
    return m;
  };
  const dia = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const platos = new Map<string, { nombre: string; cant: number; total: number }>();
  for (const v of vs)
    for (const i of v.items) {
      const x = platos.get(i.nombre) ?? { nombre: i.nombre, cant: 0, total: 0 };
      x.cant += i.cant;
      x.total += i.cant * i.precio;
      platos.set(i.nombre, x);
    }
  const medios = new Map<Medio, number>();
  for (const v of vs) for (const p of v.pagos) medios.set(p.medio, (medios.get(p.medio) ?? 0) + p.monto);
  return {
    ventas: vs.length,
    total,
    ticket: vs.length ? total / vs.length : 0,
    personas,
    porPersona: personas ? totalMesas / personas : 0,
    propinas: vs.reduce((s, v) => s + v.propina, 0),
    descuentos: vs.reduce((s, v) => s + v.descuento, 0),
    porDia: [...agrupar((v) => dia(v.ts))].map(([fecha, x]) => ({ fecha, total: x.total, ventas: x.ventas })).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    porFranja: [...agrupar((v) => v.franja)].map(([nombre, x]) => ({ nombre, total: x.total, ventas: x.ventas })).sort((a, b) => b.total - a.total),
    porMozo: [...agrupar((v) => (v.tipo === "mesa" ? (v.mozo ?? "—") : undefined))].map(([id, x]) => ({ id, ...x })).sort((a, b) => b.total - a.total),
    porMedio: [...medios].map(([medio, t]) => ({ medio, total: t })).sort((a, b) => b.total - a.total),
    platos: [...platos.values()].sort((a, b) => b.cant - a.cant),
    mesas: vs.filter((v) => v.tipo === "mesa").length,
    pedidos: vs.filter((v) => v.tipo === "pedido").length,
  };
}
