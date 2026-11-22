import { describe, expect, it } from "vitest";
import { DISENOS } from "./lib/disenos";
import { abreEse, diasReservables, erroresDia, estadoAhora, franjaDeHora, horariosPedido, horasReserva, resumenHorarios } from "./lib/horarios";
import { LISTA_TIPOS, TIPOS } from "./lib/locales";
import { aforoDe, cupoTurno, ocupacion, reservadosTurno, resumenCaja, totalMesa } from "./lib/logica";
import { localDe, semilla, vacio } from "./lib/semilla";
import { ID_DISENOS, ID_TIPOS, type Horarios } from "./lib/tipos";
import { aHora, aMin, linkWhatsApp, primerNombre } from "./lib/util";

// 2026-11-17 es martes; 2026-11-16, lunes.
const MARTES = "2026-11-17";
const LUNES = "2026-11-16";
const a = (iso: string, hhmm: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(y!, m! - 1, d!, hh, mm);
};

describe("tipos de local", () => {
  it("hay un ejemplo completo para cada tipo, con diseño existente", () => {
    expect(LISTA_TIPOS.map((t) => t.id).sort()).toEqual([...ID_TIPOS].sort());
    for (const t of LISTA_TIPOS) {
      expect(ID_DISENOS).toContain(t.diseno);
      expect(t.carta.length).toBeGreaterThanOrEqual(12);
      expect(t.textos.datos).toHaveLength(3);
      const cats = new Set(t.categorias.map((c) => c.id));
      for (const [cat] of t.carta) expect(cats, `${t.id}: ${cat}`).toContain(cat);
      for (const c of t.categorias) expect(t.carta.some(([cat]) => cat === c.id), `${t.id}: sección vacía ${c.id}`).toBe(true);
      for (const d of t.semana) expect(erroresDia(d)).toEqual([]);
      if (t.modulos.salon) expect(t.salon.flatMap((z) => z.mesas).length).toBeGreaterThan(0);
      for (const c of t.barra) expect(cats, `${t.id}: barra ${c}`).toContain(c);
      for (const pr of t.promos) for (const c of pr.categorias) expect(cats, `${t.id}: promo ${c}`).toContain(c);
      if (t.modulos.delivery) expect(t.delivery.zona).not.toBe("");
    }
  });

  it("los 7 diseños están en la lista", () => {
    expect(DISENOS.map((d) => d.id)).toEqual([...ID_DISENOS]);
  });

  it("la semilla respeta los módulos de cada tipo", () => {
    const ahora = a(MARTES, "21:10");
    for (const t of LISTA_TIPOS) {
      const st = semilla(t.id, ahora);
      if (!t.modulos.salon) expect(st.mesas.every((m) => !m.ocupada)).toBe(true);
      if (!t.modulos.reservas) expect(st.reservas).toEqual([]);
      if (!t.modulos.llevar && !t.modulos.delivery) expect(st.pedidos).toEqual([]);
      if (!t.modulos.delivery) expect(st.pedidos.every((p) => p.entrega === "retiro")).toBe(true);
      if (!t.modulos.llevar && t.modulos.delivery) expect(st.pedidos.every((p) => p.entrega === "envio")).toBe(true);
      expect(st.caja.abierta).toBe(t.modulos.caja);
      for (const m of st.mesas) if (m.ocupada) expect(m.ocupada.personas).toBeLessThanOrEqual(capGrupo(st, m.id));
      for (const p of st.pedidos) expect(p.total).toBe(p.items.reduce((s, i) => s + i.precio * i.cant, 0) + p.envio);
    }
  });

  it("vacío arranca sin movimiento", () => {
    const st = vacio("bodegon");
    expect(st.reservas).toEqual([]);
    expect(st.caja.abierta).toBe(false);
    expect(aforoDe(st)).toBe(30);
  });
});

describe("horarios", () => {
  const bodegon = localDe("bodegon");
  const bar = localDe("bar");

  it("lunes cerrado, martes abre; un día cerrado puntual también cierra", () => {
    expect(abreEse(bodegon.horarios, LUNES)).toBe(false);
    expect(abreEse(bodegon.horarios, MARTES)).toBe(true);
    const h: Horarios = { ...bodegon.horarios, cerrados: [{ fecha: MARTES, motivo: "Feriado" }] };
    expect(abreEse(h, MARTES)).toBe(false);
  });

  it("franja de una hora, también después de medianoche", () => {
    expect(franjaDeHora(bodegon.horarios, MARTES, "13:00")).toBe(0);
    expect(franjaDeHora(bodegon.horarios, MARTES, "21:30")).toBe(1);
    expect(franjaDeHora(bodegon.horarios, MARTES, "00:15")).toBe(1);
    expect(franjaDeHora(bodegon.horarios, LUNES, "21:00")).toBe(-1);
  });

  it("horarios para reservar: cada 30 min hasta 90 antes del cierre, y hoy solo los que faltan", () => {
    expect(horasReserva(bodegon, MARTES, 0, a(LUNES, "10:00"))).toEqual(["12:30", "13:00", "13:30", "14:00"]);
    expect(horasReserva(bodegon, MARTES, 1, a(LUNES, "10:00"))).toEqual(["20:30", "21:00", "21:30", "22:00", "22:30", "23:00"]);
    expect(horasReserva(bodegon, MARTES, 1, a(MARTES, "21:10"))).toEqual(["21:30", "22:00", "22:30", "23:00"]);
  });

  it("días reservables saltean los cerrados", () => {
    const dias = diasReservables(bodegon, a(LUNES, "10:00"));
    expect(dias[0]).toBe(MARTES);
    expect(dias).not.toContain(LUNES);
    expect(dias).toHaveLength(12); // 15 días desde el lunes 16, menos los lunes 16, 23 y 30
  });

  it("abierto ahora, también la madrugada de una franja de ayer", () => {
    expect(estadoAhora(bodegon.horarios, a(MARTES, "13:00"))).toEqual({ abierto: true, franja: "Mediodía", cierra: "15:30" });
    expect(estadoAhora(bar.horarios, a("2026-11-21", "02:30"))).toMatchObject({ abierto: true, cierra: "03:00" });
    expect(estadoAhora(bodegon.horarios, a(MARTES, "17:00"))).toEqual({ abierto: false, proximo: { iso: MARTES, desde: "20:30", franja: "Noche" } });
    expect(estadoAhora(bodegon.horarios, a(LUNES, "12:00"))).toMatchObject({ abierto: false, proximo: { iso: MARTES, desde: "12:30" } });
  });

  it("horarios para retirar: desde ahora + demora, redondeado a 15", () => {
    const hs = horariosPedido(bodegon.horarios, a(MARTES, "21:05"), 30);
    expect(hs[0]).toBe("21:45");
    expect(hs.at(-1)).toBe("00:15");
    expect(horariosPedido(bodegon.horarios, a(LUNES, "21:05"), 30)).toEqual([]);
  });

  it("resumen agrupa días seguidos iguales", () => {
    expect(resumenHorarios(bodegon.horarios)).toEqual([
      { dias: "Lun", texto: "Cerrado" },
      { dias: "Mar a sáb", texto: "12:30 a 15:30 y 20:30 a 00:30" },
      { dias: "Dom", texto: "12:30 a 16:00" },
    ]);
    expect(resumenHorarios(localDe("cafe").horarios)[0]).toEqual({ dias: "Lun a vie", texto: "08:00 a 20:00" });
  });

  it("valida franjas", () => {
    expect(erroresDia([{ nombre: "", desde: "20:00", hasta: "23:00" }])).toHaveLength(1);
    expect(erroresDia([{ nombre: "Noche", desde: "8", hasta: "23:00" }])).toEqual(["Las horas van como 20:30."]);
    expect(erroresDia([{ nombre: "A", desde: "12:00", hasta: "16:00" }, { nombre: "B", desde: "15:00", hasta: "18:00" }])).toEqual(["Hay dos franjas que se pisan."]);
    expect(erroresDia([{ nombre: "Noche", desde: "19:00", hasta: "03:00" }])).toEqual([]);
  });
});

describe("salón, reservas y caja", () => {
  it("cupo por franja con reservas activas", () => {
    const st = vacio("bodegon");
    const r = (hora: string, personas: number, estado: "pendiente" | "cancelada" = "pendiente") => ({ id: hora + personas, fecha: MARTES, hora, personas, nombre: "X", tel: "", nota: "", estado, origen: "web" as const, creada: 0 });
    st.reservas = [r("21:00", 4), r("21:30", 6), r("13:00", 2), r("22:00", 8, "cancelada")];
    expect(reservadosTurno(st, MARTES, 1)).toBe(10);
    expect(cupoTurno(st, MARTES, 1)).toBe(20);
    expect(cupoTurno(st, MARTES, 0)).toBe(28);
  });

  it("la cuenta suma el servicio de mesa por persona", () => {
    const local = localDe("bodegon");
    expect(totalMesa(local, { personas: 3, nombre: "", desde: 0, reservaId: null, items: [{ platoId: "a", nombre: "A", precio: 10000, cant: 2 }] })).toBe(20000 + 3 * 2500);
  });

  it("resumen de caja con comisiones y efectivo esperado", () => {
    const st = vacio("bodegon");
    st.caja = {
      abierta: true,
      apertura: 0,
      fondo: 10000,
      movs: [
        { id: "1", ts: 0, tipo: "venta", concepto: "", monto: 100000, medio: "credito" },
        { id: "2", ts: 0, tipo: "venta", concepto: "", monto: 50000, medio: "efectivo" },
        { id: "3", ts: 0, tipo: "egreso", concepto: "", monto: 5000, medio: "efectivo" },
      ],
    };
    const r = resumenCaja(st);
    expect(r.bruto).toBe(150000);
    expect(r.com).toBeCloseTo(6290);
    expect(r.efectivoEsperado).toBe(55000);
    expect(r.ticket).toBe(75000);
  });

  it("nivel de ocupación", () => {
    expect(ocupacion(29, 30).nivel).toBe("lleno");
    expect(ocupacion(22, 30).nivel).toBe("casi");
    expect(ocupacion(3, 30).nivel).toBe("libre");
    expect(ocupacion(0, 0).nivel).toBe("libre");
  });
});

describe("util", () => {
  it("horas y minutos", () => {
    expect(aMin("20:30")).toBe(1230);
    expect(aHora(1470)).toBe("00:30");
  });
  it("WhatsApp argentino y primer nombre", () => {
    expect(linkWhatsApp("351 555-0142", "Hola")).toBe("https://wa.me/5493515550142?text=Hola");
    expect(primerNombre("Gómez, Pablo")).toBe("Pablo");
    expect(primerNombre("Vero Sosa")).toBe("Vero");
  });
  it("el ejemplo de cada tipo tiene nombre propio", () => {
    expect(new Set(Object.values(TIPOS).map((t) => t.ejemplo)).size).toBe(ID_TIPOS.length);
  });
});

// ---------------------------------------------------------------- R2
import { capGrupo, claveItem, descuentoMesa, envioPara, extraOpciones, grupoDe, numeros, precioVigente, promoActiva, restanteMesa, saleHoy, sinEnviar, unidadesPendientes } from "./lib/logica";
import { bloqueo } from "./lib/horarios";
import { migrar } from "./lib/store";
import { PERMISOS } from "./lib/permisos";
import { armarCopia, leerCopia } from "./lib/respaldo";
import type { Estado, Ocupada, Venta } from "./lib/tipos";

describe("R2: promos, opciones y días", () => {
  const bar = semilla("bar", a(MARTES, "21:00"));
  const ipa = bar.platos.find((p) => p.nombre === "IPA")!;

  it("el happy hour corre los días y en el horario de la promo, también cruzando medianoche", () => {
    expect(promoActiva(bar.local, "tiradas", a("2026-11-20", "19:30"))?.nombre).toBe("Happy hour");
    expect(promoActiva(bar.local, "tiradas", a("2026-11-20", "21:00"))).toBeUndefined();
    expect(promoActiva(bar.local, "tragos", a("2026-11-20", "19:30"))).toBeUndefined();
    const noche = { ...bar.local, promos: [{ id: "x", nombre: "Trasnoche", dias: [5], desde: "23:00", hasta: "02:00", porcentaje: 10, categorias: ["tiradas"], activa: true }] };
    expect(promoActiva(noche, "tiradas", a("2026-11-21", "01:00"))?.nombre).toBe("Trasnoche");
    expect(promoActiva({ ...noche, promos: noche.promos.map((p) => ({ ...p, activa: false })) }, "tiradas", a("2026-11-21", "01:00"))).toBeUndefined();
  });

  it("precio vigente con promo y con opciones", () => {
    const v = precioVigente(bar.local, ipa, a("2026-11-20", "19:30"));
    expect(v.lista).toBe(5200);
    expect(v.precio).toBe(3900);
    expect(extraOpciones(ipa, ["Media pinta"])).toBe(-1800);
    expect(precioVigente(bar.local, ipa, a("2026-11-20", "22:00"), -1800).precio).toBe(3400);
  });

  it("los platos de algunos días", () => {
    const locro = semilla("bodegon").platos.find((p) => p.nombre.startsWith("Locro"))!;
    expect(locro.dias).toEqual([0, 6]);
    expect(saleHoy(locro, a("2026-11-21", "13:00"))).toBe(true);
    expect(saleHoy(locro, a(MARTES, "13:00"))).toBe(false);
  });

  it("mismo plato con otras opciones es otra línea", () => {
    expect(claveItem({ platoId: "a", opciones: ["Jugoso"] })).not.toBe(claveItem({ platoId: "a", opciones: ["Cocido"] }));
    expect(claveItem({ platoId: "a" })).toBe(claveItem({ platoId: "a", opciones: [] }));
  });
});

describe("R2: cuenta dividida, comandas y mesas juntas", () => {
  const local = localDe("bodegon");
  const o: Ocupada = {
    personas: 2,
    nombre: "",
    desde: 0,
    reservaId: null,
    items: [
      { platoId: "a", nombre: "A", precio: 10000, cant: 2, enviados: 2 },
      { platoId: "b", nombre: "B", precio: 5000, cant: 1, enviados: 0 },
    ],
  };

  it("descuento y lo que falta cobrar después de una parte", () => {
    const con = { ...o, descuento: 10 };
    expect(descuentoMesa(local, con)).toBe(3000);
    expect(restanteMesa(local, con)).toBe(27000);
    expect(restanteMesa(local, { ...con, pagos: [{ monto: 13500, medio: "efectivo", propina: 1000 }] })).toBe(13500);
  });

  it("por plato: quedan las unidades que nadie pagó", () => {
    const k = claveItem(o.items[0]!);
    expect(unidadesPendientes({ ...o, pagado: { [k]: 1 } }).map((x) => x.quedan)).toEqual([1, 1]);
    expect(unidadesPendientes({ ...o, pagado: { [k]: 2 } })).toHaveLength(1);
  });

  it("cuenta lo que falta mandar a cocina", () => {
    expect(sinEnviar(o)).toBe(1);
  });

  it("mesas juntas suman lugares", () => {
    const st = vacio("bodegon");
    st.mesas[1]!.unidaA = st.mesas[0]!.id;
    expect(grupoDe(st, st.mesas[1]!.id).map((m) => m.id)).toEqual([st.mesas[0]!.id, st.mesas[1]!.id]);
    expect(capGrupo(st, st.mesas[0]!.id)).toBe(4);
  });

  it("la semilla une las dos últimas mesas para el cumpleaños y manda comandas", () => {
    const st = semilla("bodegon", a(MARTES, "21:00"));
    const ult = st.mesas.at(-1)!;
    expect(st.mesas.at(-2)!.unidaA).toBe(ult.id);
    expect(ult.ocupada!.personas).toBeGreaterThan(ult.cap);
    expect(st.comandas.some((c) => c.destino === "barra")).toBe(true);
    expect(st.comandas.some((c) => c.destino === "cocina")).toBe(true);
    expect(st.espera.length).toBeGreaterThan(0);
  });
});

describe("R2: envíos, bloqueos, personal y números", () => {
  it("zonas de envío con su costo y mínimo", () => {
    const l = localDe("pizzeria");
    expect(l.delivery.zonas.length).toBe(4);
    expect(envioPara(l, l.delivery.zonas[0]!.id)).toMatchObject({ costo: 2000, minimo: 12000 });
    expect(envioPara(l, "otra")).toMatchObject({ costo: 2500, minimo: 15000 });
  });

  it("un bloqueo saca las reservas de ese turno sin cerrar el local", () => {
    const l = { ...localDe("bodegon"), bloqueos: [{ fecha: MARTES, franja: "Noche", motivo: "Evento privado" }] };
    expect(bloqueo(l, MARTES, "Noche")?.motivo).toBe("Evento privado");
    expect(horasReserva(l, MARTES, 1, a(LUNES, "10:00"))).toEqual([]);
    expect(horasReserva(l, MARTES, 0, a(LUNES, "10:00")).length).toBeGreaterThan(0);
    const todo = { ...l, bloqueos: [{ fecha: MARTES, franja: "", motivo: "x" }] };
    expect(diasReservables(todo, a(LUNES, "10:00"))).not.toContain(MARTES);
    expect(abreEse(todo.horarios, MARTES)).toBe(true);
  });

  it("cada rol ve lo suyo; solo el encargado ve números y ajustes", () => {
    expect(PERMISOS.cocina).toEqual(["cocina", "carta"]);
    expect(PERMISOS.mozo).not.toContain("caja");
    expect(PERMISOS.caja).not.toContain("ajustes");
    for (const r of ["mozo", "cocina", "caja"] as const) expect(PERMISOS[r]).not.toContain("numeros");
    expect(localDe("bar").personal.filter((p) => p.rol === "encargado")).toHaveLength(1);
  });

  it("números: total, ticket, por persona, por mozo y platos", () => {
    const v = (ts: number, total: number, personas: number, mozo?: string): Venta => ({ id: String(ts), ts, tipo: personas ? "mesa" : "pedido", ref: "", franja: "Noche", mozo, personas, items: [{ platoId: "a", nombre: "A", cant: 2, precio: total / 2 }], descuento: 0, propina: 100, total, pagos: [{ medio: "efectivo", monto: total }] });
    const n = numeros([v(10, 20000, 2, "p2"), v(20, 10000, 0), v(30, 30000, 3, "p3"), v(999, 1, 1)], 0, 100);
    expect(n.total).toBe(60000);
    expect(n.ventas).toBe(3);
    expect(n.ticket).toBe(20000);
    expect(n.porPersona).toBe(10000);
    expect(n.porMozo.map((m) => m.id)).toEqual(["p3", "p2"]);
    expect(n.platos[0]).toEqual({ nombre: "A", cant: 6, total: 60000 });
    expect(n.propinas).toBe(300);
  });

  it("la semilla trae cuatro semanas de ventas y solo de días que abre", () => {
    const st = semilla("bodegon", a(MARTES, "21:00"));
    expect(st.ventas.length).toBeGreaterThan(100);
    const lunes = st.ventas.filter((v) => new Date(v.ts).getDay() === 1 && v.ts < a(MARTES, "00:00").getTime() - 86400000);
    expect(lunes).toEqual([]);
  });
});

describe("R2: migración y copia", () => {
  it("datos de R1 se completan solos (el PIN pasa al encargado)", () => {
    const viejo = structuredClone(vacio("cafe")) as Estado & { local: { pin?: string } };
    viejo.local.pin = "9876";
    delete (viejo.local as Partial<Estado["local"]>).personal;
    delete (viejo.local as Partial<Estado["local"]>).zonas;
    delete (viejo as Partial<Estado>).comandas;
    delete (viejo as Partial<Estado>).ventas;
    viejo.mesas.forEach((m) => delete (m as Partial<typeof m>).zona);
    const st = migrar(viejo);
    expect(st.local.personal[0]).toMatchObject({ rol: "encargado", pin: "9876" });
    expect("pin" in st.local).toBe(false);
    expect(st.mesas.every((m) => m.zona === st.local.zonas[0]!.id)).toBe(true);
    expect(st.comandas).toEqual([]);
    expect(st.ventas).toEqual([]);
  });

  it("copia de seguridad: ida y vuelta, y rechaza otras", () => {
    const st = semilla("sushi", a(MARTES, "21:00"));
    const r = leerCopia(armarCopia(st), "sushi");
    expect(r.ok && r.estado.local.nombre).toBe("Kumo");
    expect(leerCopia(armarCopia(st), "bar")).toEqual({ ok: false, error: "La copia es de otro tipo de local." });
    expect(leerCopia("{}", "sushi").ok).toBe(false);
  });
});

// ---------------------------------------------------------------- R3
import { completarSecciones, webDe } from "./lib/contenidoWeb";
import { TIPOGRAFIAS } from "./lib/disenos";
import { ID_TIPOGRAFIAS, SECCIONES_WEB } from "./lib/tipos";

describe("R3: web editable", () => {
  it("cada tipo trae su historia, lugares para la galería, eventos por venir y ninguna reseña inventada", () => {
    for (const t of ID_TIPOS) {
      const w = webDe(t, a(MARTES, "12:00"));
      expect(w.historiaLarga.split(/\n\s*\n/).length).toBeGreaterThanOrEqual(2);
      expect(w.galeria.length).toBe(6);
      expect(w.galeria.every((f) => f.src === "")).toBe(true);
      expect(w.resenas).toEqual([]);
      for (const e of w.eventos) expect(e.fecha > MARTES).toBe(true);
      expect(w.secciones.map((s) => s.id).sort()).toEqual(Object.keys(SECCIONES_WEB).sort());
    }
  });

  it("los eventos caen en el día de la semana que corresponde", () => {
    const peña = webDe("bodegon", a(MARTES, "12:00")).eventos.find((e) => e.titulo === "Peña folklórica")!;
    expect(peña.fecha).toBe("2026-11-20");
  });

  it("completa secciones que falten y descarta desconocidas", () => {
    const w = webDe("cafe");
    w.secciones = [{ id: "carta", visible: true, titulo: "Para hoy" }, { id: "otra" as never, visible: true, titulo: "" }];
    const s = completarSecciones(w);
    expect(s[0]).toEqual({ id: "carta", visible: true, titulo: "Para hoy" });
    expect(s).toHaveLength(Object.keys(SECCIONES_WEB).length);
  });

  it("las tipografías existen todas", () => {
    expect(TIPOGRAFIAS.map((t) => t.id)).toEqual([...ID_TIPOGRAFIAS]);
  });

  it("datos de antes de R3 se completan con la web y los llamados", () => {
    const viejo = structuredClone(vacio("bar"));
    delete (viejo.local as Partial<Estado["local"]>).web;
    delete (viejo as Partial<Estado>).llamados;
    const st = migrar(viejo);
    expect(st.local.web.galeria.length).toBe(6);
    expect(st.llamados).toEqual([]);
  });

  it("la semilla trae un llamado de ejemplo en una mesa ocupada", () => {
    const st = semilla("bodegon", a(MARTES, "21:00"));
    const l = st.llamados[0]!;
    expect(st.mesas.find((m) => m.id === l.mesaId)?.ocupada).toBeTruthy();
  });
});

// ---------------------------------------------------------------- R4
import { aplicarPlan, linkDemoResto, mensajePedidoWeb, mensajeReserva, prepararPublicacion, validarPublicado } from "./lib/publicado";
import { PLANES_RESTO, planesResto } from "@/core/lib/precios";

/** Un restaurante como lo mandaría un cliente: el ejemplo con su WhatsApp y PINs propios. */
function delCliente(tipo: Parameters<typeof semilla>[0] = "bodegon") {
  const st = semilla(tipo, a(MARTES, "21:00"));
  st.local.whatsapp = "351 555-9999";
  st.local.personal = st.local.personal.map((p, i) => ({ ...p, pin: String(7000 + i) }));
  return st;
}

describe("R4: precios y publicación", () => {
  it("los dos planes de Resto, con el completo por encima", () => {
    expect(planesResto().carta).toMatchObject({ unico: 250_000, mensual: 15_000 });
    expect(planesResto().completo).toMatchObject({ unico: 450_000, mensual: 75_000 });
    expect(PLANES_RESTO.completo.unico).toBeGreaterThan(PLANES_RESTO.carta.unico);
  });

  it("publicar saca la operación de la demo y valida", () => {
    const p = prepararPublicacion(delCliente(), "completo");
    expect(p.estado.mesas.every((m) => !m.ocupada && !m.unidaA)).toBe(true);
    expect([p.estado.reservas, p.estado.pedidos, p.estado.ventas, p.estado.comandas, p.estado.espera, p.estado.llamados].every((x) => x.length === 0)).toBe(true);
    expect(p.estado.caja.abierta).toBe(false);
    expect(p.estado.local.web.galeria).toEqual([]);
    expect(validarPublicado(p).ok).toBe(true);
  });

  it("no publica sin WhatsApp ni con el PIN de la demo", () => {
    const st = semilla("bodegon", a(MARTES, "21:00"));
    const r = validarPublicado(prepararPublicacion(st, "carta"));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.some((e) => e.includes("WhatsApp"))).toBe(true);
      expect(r.errores.some((e) => e.includes("1234"))).toBe(true);
    }
    expect(validarPublicado({ version: 2 }).ok).toBe(false);
  });

  it("el plan «Carta y web» apaga salón, ocupación y caja", () => {
    const st = aplicarPlan(vacio("parrilla"), "carta");
    expect(st.local.modulos).toMatchObject({ salon: false, ocupacionWeb: false, caja: false, reservas: true });
  });

  it("mensajes de WhatsApp de la web real", () => {
    const st = delCliente("pizzeria");
    const r = mensajeReserva(st, { fecha: "2026-11-21", hora: "21:00", personas: 4, nombre: "Ana", tel: "351", nota: "Cumple" });
    expect(r).toContain("Mamma Tina");
    expect(r).toContain("Somos: 4");
    expect(r).toContain("Nota: Cumple");
    const m = mensajePedidoWeb(st, { nombre: "Ana", tel: "351", hora: "Cuanto antes", entrega: "envio", direccion: "Belgrano 1", envio: 2000, zona: "Güemes", items: [{ platoId: "x", nombre: "Muzzarella", precio: 10000, cant: 2, opciones: ["Media"] }], pago: "qr", nota: "" });
    expect(m).toContain("• 2 × Muzzarella (Media)");
    expect(m).toContain("Envío a Güemes: $ 2.000");
    expect(m).toContain("Total: $ 22.000");
    expect(m).toContain("Dirección: Belgrano 1");
  });

  it("link a la demo con lo elegido", () => {
    expect(linkDemoResto({ tipo: "bar", nombre: "La Birra", diseno: "nocturno" })).toBe("/resto/demo?tipo=bar&d=nocturno&nombre=La+Birra");
    expect(linkDemoResto({ tipo: "cafe", nombre: "" })).toBe("/resto/demo?tipo=cafe");
  });
});
