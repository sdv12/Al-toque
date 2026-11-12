import { describe, expect, it } from "vitest";
import {
  abrirCaja,
  ajustarStock,
  caeDemo,
  cerrarCaja,
  entrar,
  guardarUsuario,
  movimientoManual,
  pagoCuenta,
  porCodigo,
  puede,
  resumenVentas,
  saldo,
  sesionAbierta,
  siguienteNumero,
  stockDe,
  totalesSesion,
  validarVenta,
  vender,
  ventasPorDia,
  type Contexto,
  type Hecho,
} from "./logica";
import { estadoInicial } from "./semilla";
import type { EstadoPro } from "./tipos";

const AHORA = new Date(2026, 10, 12, 16, 30).getTime();
let n = 0;
const ctx = (ms = AHORA): Contexto => ({ ahora: ms, nuevoId: () => `t${++n}` });

function ok<T>(h: Hecho<T>): EstadoPro & { valor: T } {
  if (!h.ok) throw new Error(h.error);
  return Object.assign(h.estado, { valor: h.valor });
}

function como(usuarioId: string, sucursalId = "centro"): EstadoPro {
  return ok(entrar(estadoInicial(AHORA), usuarioId, sucursalId, ctx()));
}

describe("semilla", () => {
  const e = estadoInicial(AHORA);

  it("es la misma para la misma hora", () => {
    expect(JSON.stringify(estadoInicial(AHORA))).toBe(JSON.stringify(e));
  });

  it("una semana de ventas en las dos sucursales, con las cajas de hoy abiertas", () => {
    const dias = ventasPorDia(e, null, 7, AHORA);
    expect(dias.every((d) => d.cantidad > 0)).toBe(true);
    expect(sesionAbierta(e, "centro")).toBeDefined();
    expect(sesionAbierta(e, "cerro")).toBeDefined();
    expect(e.sesiones.filter((s) => s.cierre).length).toBe(12);
    expect(e.actual).toBeNull();
  });

  it("los números de factura son correlativos por sucursal y tipo", () => {
    for (const suc of ["centro", "cerro"]) {
      for (const tipo of ["Factura A", "Factura B"] as const) {
        const nums = e.comprobantes
          .filter((c) => c.sucursalId === suc && c.tipo === tipo)
          .map((c) => Number(c.numero.split("-")[1]))
          .sort((a, b) => a - b);
        expect(nums).toEqual(nums.map((_, i) => i + 1));
      }
    }
  });

  it("el stock nunca queda negativo y hay productos con stock bajo para mostrar", () => {
    for (const suc of Object.values(e.stock)) expect(Object.values(suc).every((q) => q >= 0)).toBe(true);
    expect(e.productos.some((p) => stockDe(e, "cerro", p.id) <= p.minimo)).toBe(true);
  });

  it("ninguna cuenta corriente pasa su límite ni queda en negativo", () => {
    for (const c of e.clientes) {
      const s = saldo(e, c.id);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(c.limite);
    }
    expect(e.clientes.some((c) => saldo(e, c.id) > 0)).toBe(true);
  });

  it("hay movimientos sensibles en la auditoría (permisos, diferencias de caja)", () => {
    expect(e.eventos.filter((ev) => ev.sensible).length).toBeGreaterThan(3);
    expect(e.eventos.some((ev) => ev.accion === "Cambió un usuario")).toBe(true);
    expect(e.sesiones.some((s) => s.cierre && s.contado !== s.esperado && s.motivo)).toBe(true);
  });

  it("los códigos de barras son únicos", () => {
    expect(new Set(e.productos.map((p) => p.codigo)).size).toBe(e.productos.length);
  });
});

describe("permisos", () => {
  it("cada uno entra solo a sus sucursales y si está activo", () => {
    const e = estadoInicial(AHORA);
    expect(entrar(e, "sofia", "cerro", ctx()).ok).toBe(false);
    expect(entrar(e, "carla", "cerro", ctx()).ok).toBe(false);
    expect(entrar(e, "lautaro", "cerro", ctx()).ok).toBe(true);
  });

  it("una vendedora vende pero no abre ni cierra la caja ni ajusta stock", () => {
    const e = como("sofia");
    expect(puede(e.usuarios.find((u) => u.id === "sofia"), "vender")).toBe(true);
    const cierre = cerrarCaja(e, 0, "x", ctx());
    expect(cierre.ok).toBe(false);
    if (!cierre.ok) expect(cierre.error).toMatch(/permiso de caja/);
    expect(ajustarStock(e, "p1", 3, "conteo", ctx()).ok).toBe(false);
    expect(guardarUsuario(e, { ...e.usuarios[2]!, permisos: ["vender", "caja"] }, ctx()).ok).toBe(false);
  });

  it("la dueña no se puede dar de baja a sí misma", () => {
    const e = como("graciela");
    expect(guardarUsuario(e, { ...e.usuarios[0]!, activo: false }, ctx()).ok).toBe(false);
  });
});

describe("venta", () => {
  it("emite factura B a consumidor final, descuenta stock y suma a la caja", () => {
    const e = como("sofia");
    const sesion = sesionAbierta(e, "centro")!;
    const antes = totalesSesion(sesion, e.movimientos);
    const stockAntes = stockDe(e, "centro", "p1");
    const numero = siguienteNumero(e, "centro", "Factura B");
    const d = ok(vender(e, { carrito: [{ productoId: "p1", cantidad: 2 }], medio: "efectivo", clienteId: null }, ctx()));
    expect(d.valor).toMatchObject({ tipo: "Factura B", numero, total: 2 * e.productos[0]!.precio, clienteNombre: "Consumidor final" });
    expect(d.valor.cae).toMatch(/^\d{14}$/);
    expect(stockDe(d, "centro", "p1")).toBe(stockAntes - 2);
    const despues = totalesSesion(sesion, d.movimientos);
    expect(despues.porMedio.efectivo - antes.porMedio.efectivo).toBe(d.valor.total);
    expect(despues.esperado - antes.esperado).toBe(d.valor.total);
  });

  it("a un responsable inscripto le corresponde factura A", () => {
    const d = ok(vender(como("matias"), { carrito: [{ productoId: "p7", cantidad: 1 }], medio: "transferencia", clienteId: "rondeau" }, ctx()));
    expect(d.valor.tipo).toBe("Factura A");
    expect(d.valor.numero.startsWith("0001-")).toBe(true);
  });

  it("no vende más de lo que hay ni a cuenta por encima del límite", () => {
    const e = como("sofia");
    expect(validarVenta(e, [{ productoId: "p6", cantidad: 999 }], "efectivo", null)).toMatch(/quedan/);
    const quiroga = validarVenta(e, [{ productoId: "p1", cantidad: 1 }], "cuenta", "quiroga");
    expect(quiroga).toMatch(/no tiene cuenta corriente/);
    // 5 latas de látex (~$175.000) superan los $150.000 de límite de Bustos.
    expect(validarVenta(e, [{ productoId: "p25", cantidad: 5 }], "cuenta", "bustos")).toMatch(/crédito/);
  });

  it("a cuenta corriente suma deuda; el pago la baja y entra a la caja", () => {
    const e = como("matias");
    const deuda = saldo(e, "lucero");
    const v = ok(vender(e, { carrito: [{ productoId: "p13", cantidad: 3 }], medio: "cuenta", clienteId: "lucero" }, ctx()));
    expect(saldo(v, "lucero")).toBe(deuda + v.valor.total);
    const sesion = sesionAbierta(v, "centro")!;
    const efectivo = totalesSesion(sesion, v.movimientos).porMedio.efectivo;
    const p = ok(pagoCuenta(v, "lucero", 5000, "efectivo", ctx()));
    expect(saldo(p, "lucero")).toBe(deuda + v.valor.total - 5000);
    expect(totalesSesion(sesion, p.movimientos).porMedio.efectivo).toBe(efectivo + 5000);
    expect(pagoCuenta(p, "lucero", 10_000_000, "efectivo", ctx()).ok).toBe(false);
  });

  it("con la caja cerrada no se vende", () => {
    const e = como("matias");
    const t = totalesSesion(sesionAbierta(e, "centro")!, e.movimientos);
    const cerrada = ok(cerrarCaja(e, t.esperado, "", ctx()));
    expect(validarVenta(cerrada, [{ productoId: "p1", cantidad: 1 }], "efectivo", null)).toMatch(/cerrada/);
  });

  it("encuentra por código de barras exacto", () => {
    const e = estadoInicial(AHORA);
    const p = e.productos[4]!;
    expect(porCodigo(e, ` ${p.codigo} `)?.id).toBe(p.id);
    expect(porCodigo(e, p.codigo.slice(0, 5))).toBeUndefined();
  });
});

describe("caja", () => {
  it("cerrar con diferencia pide motivo y queda en la auditoría como sensible", () => {
    const e = como("matias");
    const t = totalesSesion(sesionAbierta(e, "centro")!, e.movimientos);
    expect(cerrarCaja(e, t.esperado - 100, "", ctx()).ok).toBe(false);
    const c = ok(cerrarCaja(e, t.esperado - 100, "Vuelto mal dado", ctx()));
    expect(c.valor).toMatchObject({ contado: t.esperado - 100, esperado: t.esperado, motivo: "Vuelto mal dado" });
    expect(c.eventos[0]).toMatchObject({ accion: "Cerró la caja", sensible: true });
    // Y se puede volver a abrir al otro día.
    expect(abrirCaja(c, 10000, ctx(AHORA + 3_600_000)).ok).toBe(true);
  });

  it("un egreso en efectivo baja lo esperado y no puede superar lo que hay", () => {
    const e = como("matias");
    const sesion = sesionAbierta(e, "centro")!;
    const t = totalesSesion(sesion, e.movimientos);
    const m = ok(movimientoManual(e, { tipo: "egreso", medio: "efectivo", monto: 1000, detalle: "Flete" }, ctx()));
    expect(totalesSesion(sesion, m.movimientos).esperado).toBe(t.esperado - 1000);
    expect(movimientoManual(e, { tipo: "egreso", medio: "efectivo", monto: t.esperado + 1, detalle: "x" }, ctx()).ok).toBe(false);
  });

  it("resumen de ventas: margen = total − costo", () => {
    const e = estadoInicial(AHORA);
    const r = resumenVentas(e, 0, null);
    expect(r.margen).toBe(r.total - r.costo);
    expect(Object.values(r.porMedio).reduce((a, b) => a + b, 0)).toBe(r.total);
  });
});

it("CAE de demo: 14 números y estable", () => {
  expect(caeDemo("x")).toMatch(/^\d{14}$/);
  expect(caeDemo("x")).toBe(caeDemo("x"));
  expect(caeDemo("x")).not.toBe(caeDemo("y"));
});
