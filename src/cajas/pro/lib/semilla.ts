import { abrirCaja, ajustarStock, cerrarCaja, entrar, guardarProducto, guardarUsuario, inicioDelDia, movimientoManual, pagoCuenta, saldo, sesionAbierta, stockDe, totalesSesion, vender, type Contexto } from "./logica";
import { ROLES, type Cliente, type EstadoPro, type ItemCarrito, type Medio, type Producto, type Usuario } from "./tipos";

/*
 * Datos de la demo: una ferretería ficticia con dos sucursales y una semana de movimiento.
 * La semana se genera pasando por las mismas reglas que usa la app (vender, abrir y cerrar caja),
 * así los números de factura, el stock, las cuentas corrientes y la auditoría cierran entre sí.
 * Es determinística: la misma hora da los mismos datos.
 */

const SUCURSALES = [
  { id: "centro", nombre: "Centro", direccion: "San Martín 450", puntoVenta: 1 },
  { id: "cerro", nombre: "Cerro", direccion: "Av. Rafael Núñez 4820", puntoVenta: 2 },
];

const USUARIOS: Usuario[] = [
  { id: "graciela", nombre: "Graciela Ruiz", rol: "dueno", permisos: ROLES.dueno.permisos, sucursales: ["centro", "cerro"], activo: true },
  { id: "matias", nombre: "Matías Ortega", rol: "encargado", permisos: ROLES.encargado.permisos, sucursales: ["centro", "cerro"], activo: true },
  { id: "sofia", nombre: "Sofía Díaz", rol: "vendedor", permisos: ["vender", "clientes"], sucursales: ["centro"], activo: true },
  // Lautaro y Carla arrancan así; hace una semana la dueña cambió sus permisos (queda en la auditoría).
  { id: "lautaro", nombre: "Lautaro Ferreyra", rol: "vendedor", permisos: ["vender", "clientes"], sucursales: ["cerro"], activo: true },
  { id: "carla", nombre: "Carla Molina", rol: "vendedor", permisos: ["vender"], sucursales: ["cerro"], activo: true },
];

// [nombre, categoría, marca, precio, costo, mínimo, stock Centro, stock Cerro]
type Fila = [string, string, string, number, number, number, number, number];
const PRODUCTOS: Fila[] = [
  ["Martillo galponero 27 mm", "Herramientas", "Bahco", 18900, 11300, 4, 14, 8],
  ["Destornillador Phillips PH2", "Herramientas", "Stanley", 6200, 3500, 6, 25, 12],
  ["Juego de llaves combinadas x8", "Herramientas", "Bremen", 34500, 21800, 2, 7, 3],
  ["Pinza universal 8\"", "Herramientas", "Bahco", 14800, 8900, 4, 12, 6],
  ["Cinta métrica 5 m", "Herramientas", "Stanley", 8900, 5100, 6, 30, 14],
  ["Taladro percutor 650 W", "Herramientas", "Black+Decker", 89900, 61000, 2, 5, 2],
  ["Mecha para hormigón 8 mm", "Herramientas", "Bosch", 3200, 1700, 10, 60, 30],
  ["Disco de corte 115 mm", "Herramientas", "Tyrolit", 1900, 950, 15, 90, 45],
  ["Tarugos Fischer 8 mm x100", "Fijaciones", "Fischer", 7400, 4200, 6, 40, 18],
  ["Tornillos madera 4x40 x100", "Fijaciones", "Fadeco", 4600, 2400, 8, 45, 20],
  ["Clavos punta París 2\" x1 kg", "Fijaciones", "Acindar", 5200, 3000, 6, 28, 12],
  ["Silicona transparente 280 ml", "Fijaciones", "Fischer", 6900, 3900, 6, 26, 10],
  ["Cinta aisladora 20 m", "Electricidad", "3M", 2400, 1200, 12, 80, 35],
  ["Lámpara LED 12 W", "Electricidad", "Philips", 3800, 2100, 15, 70, 30],
  ["Toma doble con tierra", "Electricidad", "Cambre", 5600, 3300, 8, 34, 15],
  ["Interruptor de luz simple", "Electricidad", "Cambre", 3900, 2200, 8, 40, 16],
  ["Cable unipolar 2,5 mm x metro", "Electricidad", "Prysmian", 1100, 620, 50, 400, 180],
  ["Zapatilla 5 tomas con llave", "Electricidad", "Kalop", 12500, 7400, 4, 16, 7],
  ["Llave de paso 1/2\"", "Plomería", "FV", 11800, 7100, 4, 15, 6],
  ["Teflón 3/4\" x 20 m", "Plomería", "Sellatodo", 1500, 700, 15, 85, 40],
  ["Flexible para canilla 30 cm", "Plomería", "FV", 4900, 2700, 8, 30, 12],
  ["Codo PVC 90° 40 mm", "Plomería", "Tigre", 1300, 650, 20, 110, 50],
  ["Canilla monocomando cocina", "Plomería", "FV", 74900, 49800, 2, 4, 1],
  ["Pegamento PVC 100 cc", "Plomería", "Tigre", 3600, 1900, 6, 24, 9],
  ["Látex interior blanco 4 L", "Pinturería", "Alba", 32900, 21500, 4, 18, 8],
  ["Esmalte sintético negro 1 L", "Pinturería", "Sherwin", 19800, 12600, 3, 10, 5],
  ["Rodillo antigota 22 cm", "Pinturería", "El Galgo", 8400, 4700, 5, 20, 9],
  ["Pincel nº 20", "Pinturería", "El Galgo", 3900, 2000, 8, 35, 15],
  ["Lija al agua grano 180", "Pinturería", "Doble A", 900, 420, 25, 150, 70],
  ["Cinta de enmascarar 24 mm", "Pinturería", "Tacsa", 2700, 1400, 12, 60, 4],
];

const CLIENTES: Cliente[] = [
  { id: "arguello", nombre: "Construcciones Argüello SRL", documento: "30712345674", condicionIva: "Responsable inscripto", telefono: "351 555-0142", limite: 900000 },
  { id: "rondeau", nombre: "Consorcio Edificio Rondeau", documento: "30709876543", condicionIva: "Responsable inscripto", telefono: "351 555-0198", limite: 400000 },
  { id: "bustos", nombre: "Pedro Bustos (plomero)", documento: "20281234569", condicionIva: "Monotributo", telefono: "351 555-0177", limite: 150000 },
  { id: "lucero", nombre: "Electricidad Lucero", documento: "27304561238", condicionIva: "Monotributo", telefono: "351 555-0120", limite: 200000 },
  { id: "quiroga", nombre: "Marta Quiroga", documento: "23456789", condicionIva: "Consumidor final", telefono: "351 555-0111", limite: 0 },
];

/** Generador pseudoaleatorio con semilla (mulberry32): mismos datos en cada carga. */
function aleatorio(semilla: number) {
  let a = semilla >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    r,
    entero: (min: number, max: number) => min + Math.floor(r() * (max - min + 1)),
    uno: <T>(lista: readonly T[]): T => lista[Math.floor(r() * lista.length)]!,
  };
}

function base(): EstadoPro {
  const productos: Producto[] = PRODUCTOS.map(([nombre, categoria, marca, precio, costo, minimo], i) => ({
    id: `p${i + 1}`,
    codigo: `779${String(1000000000 + i * 7919).slice(0, 10)}`,
    nombre,
    categoria,
    marca,
    precio,
    costo,
    minimo,
    activo: true,
  }));
  const stock: EstadoPro["stock"] = { centro: {}, cerro: {} };
  // Cerro es más chica pero no tiene que parecer desabastecida: solo la canilla y la cinta de
  // enmascarar arrancan bajas, para que se vea el aviso de stock bajo.
  const BAJOS_A_PROPOSITO = ["p23", "p30"];
  PRODUCTOS.forEach(([, , , , , minimo, centro, cerro], i) => {
    const id = `p${i + 1}`;
    stock.centro![id] = centro;
    stock.cerro![id] = BAJOS_A_PROPOSITO.includes(id) ? cerro : cerro + minimo;
  });
  return {
    version: 1,
    negocio: { nombre: "Ferretería El Tornillo", razonSocial: "El Tornillo SRL", cuit: "30716549871" },
    sucursales: SUCURSALES,
    usuarios: USUARIOS,
    productos,
    stock,
    clientes: CLIENTES,
    cuentas: [],
    sesiones: [],
    movimientos: [],
    comprobantes: [],
    eventos: [],
    actual: null,
  };
}

const MEDIOS_PESO: Medio[] = ["efectivo", "efectivo", "efectivo", "debito", "debito", "credito", "transferencia", "qr", "qr"];
const EGRESOS = ["Flete de mercadería", "Artículos de limpieza", "Viáticos del repartidor", "Bidones de agua", "Arreglo de la persiana"];

export function estadoInicial(ahora = Date.now()): EstadoPro {
  const azar = aleatorio(20261112);
  let n = 0;
  let e = base();
  const ctx = (ms: number): Contexto => ({ ahora: ms, nuevoId: () => `d${++n}` });
  /** Aplica una acción como si la hiciera `usuarioId` en `sucursalId` a la hora `ms`. */
  const como = (usuarioId: string, sucursalId: string, ms: number, accion: (x: EstadoPro, c: Contexto) => { ok: boolean; estado?: EstadoPro }) => {
    const dentro = entrar(e, usuarioId, sucursalId, ctx(ms));
    if (!dentro.ok) return;
    // El "entró" de cada operación no se guarda: llenaría la auditoría de la demo.
    const sinEntrada = { ...dentro.estado, eventos: e.eventos };
    const r = accion(sinEntrada, ctx(ms));
    if (r.ok && r.estado) e = r.estado;
  };

  const hoy = inicioDelDia(ahora);
  const hora = (dia: number, h: number, m = 0) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - dia);
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };

  // Hace una semana: la dueña le sumó el permiso de caja a Lautaro y dio de baja a Carla.
  como("graciela", "centro", hora(7, 8, 40), (x, c) => guardarUsuario(x, { ...USUARIOS[3]!, permisos: ["vender", "caja", "clientes"] }, c));
  como("graciela", "centro", hora(7, 8, 42), (x, c) => guardarUsuario(x, { ...USUARIOS[4]!, activo: false }, c));
  // Hace 3 días: aumento del látex.
  como("graciela", "centro", hora(3, 8, 30), (x, c) => {
    const latex = x.productos.find((p) => p.id === "p25")!;
    return guardarProducto(x, { ...latex, precio: latex.precio + 2000 }, c);
  });

  for (let dia = 6; dia >= 0; dia--) {
    for (const suc of SUCURSALES) {
      const vendedores = e.usuarios.filter((u) => u.activo && u.sucursales.includes(suc.id) && u.id !== "graciela");
      const abre = suc.id === "centro" ? "matias" : "lautaro";
      // Hoy: la caja abrió a las 9 o, si todavía es temprano, hace dos horas.
      const apertura = dia === 0 ? Math.min(hora(0, 9), ahora - 2 * 3_600_000) : hora(dia, 9);
      const fin = dia === 0 ? ahora - 5 * 60_000 : hora(dia, 20);
      como(abre, suc.id, apertura, (x, c) => abrirCaja(x, suc.id === "centro" ? 30000 : 20000, c));

      const cantidad = dia === 0 ? azar.entero(6, 9) : suc.id === "centro" ? azar.entero(9, 14) : azar.entero(5, 9);
      const horas = Array.from({ length: cantidad }, () => apertura + 10 * 60_000 + azar.r() * (fin - apertura - 20 * 60_000)).sort((a, b) => a - b);
      for (const ms of horas) {
        const vendedor = azar.uno(vendedores);
        const carrito: ItemCarrito[] = [];
        for (let k = azar.entero(1, 3); k > 0; k--) {
          const p = azar.uno(e.productos);
          if (carrito.some((c) => c.productoId === p.id)) continue;
          const cant = p.precio < 4000 ? azar.entero(1, 6) : 1;
          if (stockDe(e, suc.id, p.id) - cant > 1) carrito.push({ productoId: p.id, cantidad: cant });
        }
        if (!carrito.length) continue;
        const cliente = azar.r() < 0.3 ? azar.uno(CLIENTES) : undefined;
        const aCuenta = !!cliente && cliente.limite > 0 && azar.r() < 0.6;
        const medio = aCuenta ? "cuenta" : azar.uno(MEDIOS_PESO);
        como(vendedor.id, suc.id, ms, (x, c) =>
          vender(x, { carrito, medio, clienteId: cliente?.id ?? null, referencia: medio === "qr" ? String(1300000000 + azar.entero(0, 99999999)) : undefined }, c),
        );
      }

      if (azar.r() < 0.6) {
        const ms = apertura + (fin - apertura) * 0.6;
        como(abre, suc.id, ms, (x, c) => movimientoManual(x, { tipo: "egreso", medio: "efectivo", monto: azar.entero(3, 15) * 1000, detalle: azar.uno(EGRESOS) }, c));
      }
      // Un cliente paga parte de lo que debe.
      if (suc.id === "centro" && dia % 2 === 0) {
        const deudor = CLIENTES.find((cl) => saldo(e, cl.id) > 20000);
        if (deudor) {
          const monto = Math.floor(saldo(e, deudor.id) / 2 / 1000) * 1000;
          como("matias", "centro", apertura + (fin - apertura) * 0.4, (x, c) => pagoCuenta(x, deudor.id, monto, "transferencia", c));
        }
      }

      if (dia > 0) {
        const sesion = sesionAbierta(e, suc.id);
        if (sesion) {
          const esperado = totalesSesion(sesion, e.movimientos).esperado;
          // Un par de cierres con faltante, como pasa en la vida real.
          const falta = (dia === 4 && suc.id === "cerro") || (dia === 2 && suc.id === "centro") ? 1500 : 0;
          como(abre, suc.id, fin, (x, c) => cerrarCaja(x, esperado - falta, falta ? "Faltó cambio, se revisa mañana" : "", c));
        }
      }
    }
  }

  // Ayer a la tarde: llegó mercadería a Centro y en Cerro se dañó un rollo de cinta.
  como("matias", "cerro", hora(1, 18), (x, c) => ajustarStock(x, "p30", stockDe(x, "cerro", "p30") - 1, "Rollo dañado en el depósito", c));
  como("matias", "centro", hora(1, 17), (x, c) => ajustarStock(x, "p23", stockDe(x, "centro", "p23") + 2, "Llegó pedido de FV", c));

  return { ...e, eventos: [...e.eventos].sort((a, b) => b.fecha - a.fecha), actual: null };
}
