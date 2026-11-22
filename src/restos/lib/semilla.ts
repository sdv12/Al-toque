/*
 * Arma un restaurante de ejemplo a partir de su tipo: la configuración (Local) y un servicio en
 * marcha para la demo (mesas ocupadas, comandas, lista de espera, reservas, pedidos, caja abierta y
 * cuatro semanas de ventas para los números). Todo inventado.
 */
import { estadoAhora, franjasDel, rango } from "./horarios";
import { webDe } from "./contenidoWeb";
import { TIPOS } from "./locales";
import { claveItem, totalItems } from "./logica";
import type { Comanda, Espera, Estado, IdTipo, Item, Local, Medio, Mesa, Movimiento, Pedido, Persona, Plato, Reserva, Venta } from "./tipos";
import { aHora, hoyISO, sumarDias, uid } from "./util";

export const COMISIONES_MP = { efectivo: 0, transferencia: 0, qr: 0.8, debito: 1.41, credito: 6.29 };

/** El equipo de ejemplo. El PIN 1234 es el del encargado (el de la demo). */
export const PERSONAL_DEMO: Omit<Persona, "id">[] = [
  { nombre: "Marta", rol: "encargado", pin: "1234", activo: true },
  { nombre: "Lucas", rol: "mozo", pin: "1111", activo: true },
  { nombre: "Sofi", rol: "mozo", pin: "2222", activo: true },
  { nombre: "Cocina", rol: "cocina", pin: "3333", activo: true },
  { nombre: "Caja", rol: "caja", pin: "4444", activo: true },
];

const idZona = (nombre: string) =>
  nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

export function localDe(tipo: IdTipo, ahora = new Date()): Local {
  const t = TIPOS[tipo];
  return {
    tipo,
    nombre: t.ejemplo,
    bajada: t.bajada,
    ciudad: "Córdoba",
    direccion: t.direccion,
    whatsapp: "",
    instagram: t.instagram,
    diseno: t.diseno,
    acento: t.acento,
    textos: { ...t.textos, datos: [...t.textos.datos] },
    modulos: { ...t.modulos },
    horarios: { semana: t.semana.map((fs) => fs.map((f) => ({ ...f }))), cerrados: [] },
    reservas: { ...t.reservas },
    demoraLlevar: t.demoraLlevar,
    delivery: { ...t.delivery, zonas: t.envios.map((z) => ({ ...z, id: idZona(z.nombre) })) },
    cubierto: t.cubierto,
    comisiones: { ...COMISIONES_MP },
    zonas: t.salon.map((z) => ({ id: idZona(z.zona), nombre: z.zona })),
    personal: PERSONAL_DEMO.map((p, i) => ({ ...p, id: "p" + (i + 1) })),
    promos: t.promos.map((p, i) => ({ ...p, id: "promo" + (i + 1), categorias: [...p.categorias], dias: [...p.dias] })),
    bloqueos: [],
    web: webDe(tipo, ahora),
  };
}

export function platosDe(tipo: IdTipo): Plato[] {
  const t = TIPOS[tipo];
  const buscar = <T,>(mapa: Record<string, T>, nombre: string) => Object.entries(mapa).find(([k]) => nombre.startsWith(k))?.[1];
  return t.carta.map(([cat, nombre, desc, precio, extra = {}]) => {
    const opciones = buscar(t.opciones, nombre)?.(precio);
    const dias = buscar(t.dias, nombre);
    return {
      id: uid(),
      cat,
      nombre,
      desc,
      precio,
      porcion: extra.porcion ?? "",
      disponible: true,
      llevar: extra.llevar ?? true,
      destacado: extra.destacado ?? false,
      etiquetas: extra.etiquetas ?? [],
      ...(opciones ? { opciones } : {}),
      ...(dias ? { dias: [...dias] } : {}),
    };
  });
}

/** Un restaurante recién configurado, sin movimiento (para empezar de cero). */
export function vacio(tipo: IdTipo, ahora = new Date()): Estado {
  const t = TIPOS[tipo];
  let n = 0;
  const mesas: Mesa[] = t.salon.flatMap((z) => z.mesas.map((cap) => ({ id: "m" + ++n, nombre: String(n), cap, zona: idZona(z.zona), unidaA: null, ocupada: null })));
  return {
    v: 1,
    local: localDe(tipo, ahora),
    categorias: t.categorias.map((c) => ({ ...c, ...(t.barra.includes(c.id) ? { barra: true } : {}) })),
    platos: platosDe(tipo),
    mesas,
    reservas: [],
    pedidos: [],
    proximoPedido: 1,
    caja: { abierta: false, apertura: null, fondo: 0, movs: [] },
    cierres: [],
    comandas: [],
    espera: [],
    ventas: [],
    llamados: [],
  };
}

const NOMBRES = ["Gómez, Pablo", "Luque, Carla", "Bustos, Raúl", "Peña, Sofía", "Moyano, Ana", "Carranza, Luis", "Ferreyra, Julieta", "Ortiz, Juan", "Sosa, Verónica", "Paz, Diego", "Quinteros, Lucía", "Vélez, Martín"];
const NOTAS = ["Aniversario", "", "Una persona celíaca", "", "Cumpleaños, traen torta", "", "Silla para bebé", ""];

/** Números al azar pero siempre los mismos (la demo se ve igual cada vez). */
function azar(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** El restaurante de ejemplo con un servicio en marcha. */
export function semilla(tipo: IdTipo, ahora = new Date()): Estado {
  const st = vacio(tipo, ahora);
  const { local, platos } = st;
  const t0 = ahora.getTime();
  const hace = (min: number) => t0 - min * 60000;
  const hoy = hoyISO(ahora);
  const cats = st.categorias.filter((c) => !c.tienda).map((c) => platos.filter((p) => p.cat === c.id));
  /** El plato n de la categoría i (dando la vuelta). */
  const plato = (i: number, n: number) => {
    const lista = cats[((i % cats.length) + cats.length) % Math.max(1, cats.length)] ?? [];
    return lista[n % Math.max(1, lista.length)];
  };
  /** Una línea con la primera opción de cada grupo. */
  const linea = (p: Plato | undefined, cant = 1, enviados = cant): Item[] => {
    if (!p) return [];
    const opciones = p.opciones?.map((g) => g.valores[0]?.nombre ?? "");
    return [{ platoId: p.id, nombre: p.nombre, precio: p.precio, cant, enviados, ...(opciones ? { opciones } : {}) }];
  };
  const mozos = local.personal.filter((p) => p.rol === "mozo");
  const barra = new Set(st.categorias.filter((c) => c.barra).map((c) => c.id));

  // ---------- Salón: casi la mitad de las mesas ocupadas, con su mozo ----------
  if (local.modulos.salon && st.mesas.length) {
    const ms = st.mesas;
    const sentar = (m: Mesa | undefined, personas: number, nombre: string, min: number, items: Item[], mozo: number) => {
      if (m) m.ocupada = { personas, nombre, desde: hace(min), items, reservaId: null, mozo: mozos[mozo % mozos.length]?.id };
    };
    const ultima = ms[ms.length - 1];
    const ante = ms[ms.length - 2];
    sentar(ms[2], 4, "Familia Ferreyra", 52, [...linea(plato(0, 0)), ...linea(plato(1, 0), 2), ...linea(plato(-1, 0), 2), ...linea(plato(-2, 0), 2, 0)], 0);
    sentar(ms[0], 2, "", 25, [...linea(plato(1, 1)), ...linea(plato(-1, 1))], 1);
    // El cumpleaños ocupa las dos últimas mesas unidas.
    if (ultima && ante && ante.zona === ultima.zona) {
      ante.unidaA = ultima.id;
      sentar(ultima, Math.min(9, ultima.cap + ante.cap), "Cumple de Marta", 70, [...linea(plato(0, 1), 2), ...linea(plato(1, 2), 3), ...linea(plato(2, 0), 2), ...linea(plato(-1, 2), 3), ...linea(plato(-2, 1), 2, 0)], 0);
    }
    sentar(ms[5], 3, "", 12, [...linea(plato(-1, 3)), ...linea(plato(1, 3), 2, 0)], 1);
    for (const m of ms) if (m.ocupada) m.ocupada.personas = Math.min(m.ocupada.personas, m.cap + (ms.filter((x) => x.unidaA === m.id).reduce((s, x) => s + x.cap, 0)));

    // Comandas: lo ya enviado de cada mesa, en distintos estados.
    const comandas: Comanda[] = [];
    const estados: Comanda["estado"][] = ["preparando", "nueva", "lista", "entregada"];
    ms.filter((m) => m.ocupada).forEach((m, k) => {
      const o = m.ocupada!;
      for (const destino of ["cocina", "barra"] as const) {
        const items = o.items
          .filter((i) => (i.enviados ?? 0) > 0 && (destino === "barra") === barra.has(platos.find((p) => p.id === i.platoId)?.cat ?? ""))
          .map((i) => ({ nombre: i.nombre, cant: i.enviados ?? i.cant, ...(i.opciones ? { opciones: i.opciones } : {}) }));
        if (items.length) comandas.push({ id: uid(), destino, origen: `Mesa ${m.nombre}`, mesaId: m.id, mozo: o.mozo, items, estado: estados[(k + (destino === "barra" ? 2 : 0)) % 4]!, creada: hace(6 + k * 7) });
      }
    });
    st.comandas = comandas;

    // Lista de espera: dos grupos esperando, uno ya avisado.
    const espera: Espera[] = [
      { id: uid(), nombre: "Romero", personas: 4, tel: "351 555-0301", llegada: hace(14), estado: "avisado", origen: "local" },
      { id: uid(), nombre: "Aguirre", personas: 2, tel: "351 555-0302", llegada: hace(6), estado: "esperando", origen: "web" },
    ];
    st.espera = espera;
    if (ms[5]?.ocupada) st.llamados = [{ id: uid(), mesaId: ms[5].id, tipo: "cuenta", ts: hace(2) }];
  }

  // ---------- Reservas: hoy y los próximos días que abre ----------
  if (local.modulos.reservas && st.mesas.length) {
    const reservas: Reserva[] = [];
    let k = 0;
    for (let d = 0, dias = 0; d < 10 && dias < 3; d++) {
      const fecha = sumarDias(hoy, d);
      const franjas = franjasDel(local.horarios, fecha);
      if (!franjas.length) continue;
      dias++;
      franjas.forEach((f) => {
        const { ini } = rango(f);
        const cuantas = d === 0 ? 3 : 2;
        for (let j = 0; j < cuantas; j++) {
          reservas.push({
            id: uid(),
            fecha,
            hora: aHora(ini + 30 + j * 30),
            personas: [4, 2, 4, 6, 2, 8, 5][k % 7]!,
            nombre: NOMBRES[k % NOMBRES.length]!,
            tel: `351 555-01${String(10 + k).padStart(2, "0")}`,
            nota: NOTAS[k % NOTAS.length]!,
            estado: k % 3 === 1 ? "pendiente" : "confirmada",
            origen: k % 4 === 3 ? "teléfono" : "web",
            creada: hace(600 + k * 45),
          });
          k++;
        }
      });
    }
    st.reservas = reservas;
  }

  // ---------- Pedidos para llevar / delivery ----------
  const conPedidos = local.modulos.llevar || local.modulos.delivery;
  if (conPedidos) {
    const entrega = (i: number) => (local.modulos.delivery && (!local.modulos.llevar || i % 2 === 1) ? "envio" : "retiro");
    const zonas = local.delivery.zonas;
    const ped = (num: number, nombre: string, i: number, items: Item[], estado: Pedido["estado"], pago: Pedido["pago"], pagado: boolean, min: number, horaMin: number): Pedido => {
      const e = entrega(i);
      const zona = e === "envio" ? zonas[i % Math.max(1, zonas.length)] : undefined;
      const envio = e === "envio" ? (zona?.costo ?? local.delivery.costo) : 0;
      return {
        id: uid(),
        num,
        nombre,
        tel: `351 555-02${10 + i}`,
        hora: aHora(Math.max(0, ahora.getHours() * 60 + ahora.getMinutes() + horaMin)),
        entrega: e,
        direccion: e === "envio" ? ["Duarte Quirós 1240", "Av. Colón 2200, 3° B", "Belgrano 455"][i % 3]! : "",
        envio,
        ...(zona ? { zonaEnvio: zona.id } : {}),
        items,
        total: totalItems(items) + envio,
        estado,
        pago,
        pagado,
        creado: hace(min),
        origen: i === 1 ? "teléfono" : "web",
        nota: i === 0 ? "Sin sal, por favor" : "",
      };
    };
    st.pedidos = [
      ped(41, "Juan Ortiz", 0, [...linea(plato(1, 0)), ...linea(plato(-2, 1), 2)], "cocina", "efectivo", false, 18, 15),
      ped(42, "Vero Sosa", 1, [...linea(plato(0, 1), 1, 0), ...linea(plato(1, 1), 1, 0)], "nuevo", "transferencia", false, 4, 35),
      ped(40, "Diego Paz", 2, [...linea(plato(1, 2)), ...linea(plato(0, 0))], "listo", "qr", true, 35, 0),
    ];
    st.proximoPedido = 43;
    const p41 = st.pedidos[0]!;
    st.comandas.push({ id: uid(), destino: "cocina", origen: `Pedido #41`, pedidoId: p41.id, items: p41.items.map((i) => ({ nombre: i.nombre, cant: i.cant, ...(i.opciones ? { opciones: i.opciones } : {}) })), estado: "preparando", creada: hace(16) });
  }

  // ---------- Caja abierta con lo cobrado en el turno ----------
  const r = azar(tipo.length * 7919 + 13);
  const MEDIOS_AZAR: Medio[] = ["efectivo", "efectivo", "debito", "credito", "qr", "qr", "transferencia"];
  const ventas: Venta[] = [];
  const franjaAhora = (() => {
    const e = estadoAhora(local.horarios, ahora);
    return e.abierto ? e.franja : (franjasDel(local.horarios, hoy).at(-1)?.nombre ?? "Fuera de horario");
  })();

  if (local.modulos.caja) {
    const movs: Movimiento[] = [];
    const vender = (min: number, concepto: string, items: Item[], medio: Medio, tipoV: "mesa" | "pedido", personas: number) => {
      const total = totalItems(items) + (tipoV === "mesa" ? local.cubierto * personas : 0);
      const m: Movimiento = { id: uid(), ts: hace(min), tipo: "venta", concepto, monto: total, medio };
      movs.push(m);
      ventas.push({ id: uid(), ts: m.ts, tipo: tipoV, ref: concepto, franja: franjaAhora, mozo: tipoV === "mesa" ? mozos[ventas.length % mozos.length]?.id : undefined, personas, items: items.map(({ platoId, nombre, cant, precio }) => ({ platoId, nombre, cant, precio })), descuento: 0, propina: 0, total, pagos: [{ medio, monto: total }] });
      return m;
    };
    const ticket = (a: number, b: number) => [...linea(plato(1, a), 2), ...linea(plato(0, b))];
    const salon = local.modulos.salon;
    vender(200, salon ? "Mesa 4" : "Mostrador", ticket(0, 1), "credito", salon ? "mesa" : "pedido", 2);
    vender(185, salon ? "Mesa 2" : "Mostrador", ticket(1, 0), "efectivo", salon ? "mesa" : "pedido", 2);
    vender(160, salon ? "Mesa 7" : "Mostrador", ticket(2, 2), "qr", salon ? "mesa" : "pedido", 3);
    movs.push({ id: uid(), ts: hace(130), tipo: "egreso", concepto: "Hielo y soda (proveedor)", monto: 8500, medio: "efectivo" });
    vender(110, salon ? "Mesa 5" : "Mostrador", ticket(3, 1), "debito", salon ? "mesa" : "pedido", 2);
    if (conPedidos) {
      vender(140, "Pedido #38", ticket(0, 0), "transferencia", "pedido", 0);
      vender(90, "Pedido #39", ticket(1, 1), "efectivo", "pedido", 0);
      const p40 = st.pedidos.find((p) => p.num === 40);
      if (p40) {
        const m = vender(35, "Pedido #40", p40.items, "qr", "pedido", 0);
        m.monto = p40.total;
        p40.movId = m.id;
      }
    }
    st.caja = { abierta: true, apertura: hace(240), fondo: 20000, movs };
  } else {
    st.pedidos.forEach((p) => (p.movId = null));
  }

  // ---------- Cuatro semanas de ventas para los números ----------
  for (let d = 28; d >= 1; d--) {
    const fecha = sumarDias(hoy, -d);
    const [y, mo, di] = fecha.split("-").map(Number);
    for (const f of franjasDel(local.horarios, fecha)) {
      const { ini, fin } = rango(f);
      const finde = [0, 5, 6].includes(new Date(y!, mo! - 1, di!).getDay());
      const mesasN = local.modulos.salon && st.mesas.length ? Math.round((finde ? 9 : 5) + r() * 6) : 0;
      const pedidosN = conPedidos ? Math.round((finde ? 6 : 3) + r() * 5) : 0;
      for (let k = 0; k < mesasN + pedidosN; k++) {
        const esMesa = k < mesasN;
        const personas = esMesa ? 2 + Math.floor(r() * 4) : 0;
        const items: Item[] = [];
        const n = esMesa ? personas + 1 + Math.floor(r() * 3) : 1 + Math.floor(r() * 3);
        for (let j = 0; j < n; j++) {
          const p = plato(Math.floor(r() * cats.length), Math.floor(r() * 8));
          if (!p) continue;
          const ya = items.find((x) => x.platoId === p.id);
          if (ya) ya.cant++;
          else items.push({ platoId: p.id, nombre: p.nombre, precio: p.precio, cant: 1 });
        }
        const bruto = totalItems(items) + (esMesa ? local.cubierto * personas : 0);
        const descuento = r() < 0.08 ? Math.round(bruto * 0.1) : 0;
        const total = bruto - descuento;
        const propina = esMesa && r() < 0.5 ? Math.round((total * 0.1) / 100) * 100 : 0;
        const ts = new Date(y!, mo! - 1, di!).getTime() + (ini + Math.floor(r() * Math.max(30, fin - ini - 30))) * 60000;
        ventas.push({
          id: uid(),
          ts,
          tipo: esMesa ? "mesa" : "pedido",
          ref: esMesa ? `Mesa ${1 + Math.floor(r() * st.mesas.length)}` : `Pedido`,
          franja: f.nombre,
          mozo: esMesa ? mozos[Math.floor(r() * mozos.length)]?.id : undefined,
          personas,
          items: items.map(({ platoId, nombre, cant, precio }) => ({ platoId, nombre, cant, precio })),
          descuento,
          propina,
          total,
          pagos: [{ medio: MEDIOS_AZAR[Math.floor(r() * MEDIOS_AZAR.length)]!, monto: total }],
        });
      }
    }
  }
  st.ventas = ventas.sort((a, b) => a.ts - b.ts);

  // Las claves de ítem tienen que ser únicas por mesa (la semilla nunca repite plato+opciones).
  for (const m of st.mesas) if (m.ocupada) m.ocupada.items = m.ocupada.items.filter((i, k, a) => a.findIndex((x) => claveItem(x) === claveItem(i)) === k);
  return st;
}
