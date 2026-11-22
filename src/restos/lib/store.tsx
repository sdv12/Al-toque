"use client";

/*
 * Estado de Resto al toque en el navegador (localStorage, una clave por restaurante). La web
 * pública, el panel y la pantalla de cocina abiertos en varias pestañas se sincronizan con el
 * evento `storage`.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { estadoAhora } from "./horarios";
import { claveItem, descuentoMesa, restanteMesa, totalItems } from "./logica";
import { migrar } from "./migrar";
import { semilla, vacio } from "./semilla";

export { migrar };
import type { Categoria, Comanda, Entrega, Espera, Estado, EstadoComanda, EstadoEspera, EstadoPedido, EstadoReserva, IdTipo, Item, Local, Medio, Mesa, Persona, Plato, Promo, Reserva, TipoMov, Venta } from "./tipos";
import { uid } from "./util";

export const claveDe = (id: string) => `altoque:resto:${id}`;

function valido(x: unknown, tipo: IdTipo): x is Estado {
  const st = x as Estado | null;
  return !!st && st.v === 1 && st.local?.tipo === tipo && Array.isArray(st.mesas) && Array.isArray(st.platos) && !!st.local.horarios;
}

/** Lee el restaurante guardado (o arma el ejemplo). Devuelve también el texto guardado, para saber si cambió. */
function cargar(clave: string, tipo: IdTipo, semillaPropia?: Estado): { estado: Estado; guardado: string | null } {
  let guardado: string | null = null;
  try {
    guardado = localStorage.getItem(clave);
    if (guardado) {
      const st: unknown = JSON.parse(guardado);
      if (valido(st, tipo)) return { estado: migrar(st), guardado };
    }
  } catch {
    /* dato corrupto: se reemplaza por el ejemplo */
  }
  return { estado: semillaPropia ? migrar(structuredClone(semillaPropia)) : semilla(tipo), guardado: null };
}

type NuevoPedido = { nombre: string; tel: string; hora: string; entrega: Entrega; direccion: string; envio: number; zonaEnvio?: string; pago: Medio; items: Item[]; nota?: string; origen?: "web" | "teléfono" };

/** La franja de ahora (para los números); fuera de horario, la última del día. */
const franjaActual = (s: Estado) => {
  const e = estadoAhora(s.local.horarios, new Date());
  return e.abierto ? e.franja : "Fuera de horario";
};

function crearAcciones(setSt: (fn: (prev: Estado) => Estado) => void, inicial: Estado, tipo: IdTipo) {
  /** El último estado conocido (para numerar pedidos sin esperar a que React vuelva a dibujar). */
  let ultimo = inicial;
  /** Número de pedido reservado en el momento (dos pedidos seguidos no repiten número). */
  let reservado = 0;
  const up = (fn: (s: Estado) => void) =>
    setSt((prev) => {
      const next = structuredClone(prev);
      fn(next);
      ultimo = next;
      return next;
    });
  const set = (nuevo: Estado) =>
    setSt(() => {
      ultimo = nuevo;
      return nuevo;
    });
  const asegurarCaja = (s: Estado) => {
    if (!s.caja.abierta) s.caja = { abierta: true, apertura: Date.now(), fondo: 0, movs: [], autoabierta: true };
  };
  /** Registra la venta en la caja (si el restaurante usa caja). Devuelve el id del movimiento. */
  const registrarVenta = (s: Estado, concepto: string, monto: number, medio: Medio) => {
    if (!s.local.modulos.caja) return null;
    asegurarCaja(s);
    const id = uid();
    s.caja.movs.push({ id, ts: Date.now(), tipo: "venta", concepto, monto, medio });
    return id;
  };
  const mesa = (s: Estado, id: string) => s.mesas.find((x) => x.id === id);
  const destinoDe = (s: Estado, platoId: string): Comanda["destino"] => (s.categorias.find((c) => c.id === s.platos.find((p) => p.id === platoId)?.cat)?.barra ? "barra" : "cocina");
  /** Manda a cocina y barra lo que falta de unas líneas (una comanda por destino). */
  const comandar = (s: Estado, items: Item[], datos: Pick<Comanda, "origen" | "mesaId" | "pedidoId" | "mozo">) => {
    const porDestino = new Map<Comanda["destino"], Comanda["items"]>();
    for (const i of items) {
      const falta = i.cant - (i.enviados ?? 0);
      if (falta <= 0) continue;
      const d = destinoDe(s, i.platoId);
      porDestino.set(d, [...(porDestino.get(d) ?? []), { nombre: i.nombre, cant: falta, ...(i.opciones?.length ? { opciones: i.opciones } : {}), ...(i.nota ? { nota: i.nota } : {}) }]);
      i.enviados = i.cant;
    }
    for (const [destino, its] of porDestino) s.comandas.push({ id: uid(), destino, ...datos, items: its, estado: "nueva", creada: Date.now() });
  };
  /** Cierra la mesa: guarda la venta para los números y libera las mesas del grupo. */
  const cerrarMesa = (s: Estado, m: Mesa) => {
    const o = m.ocupada;
    if (!o) return;
    const pagos = o.pagos ?? [];
    if (pagos.length) {
      const venta: Venta = {
        id: uid(),
        ts: Date.now(),
        tipo: "mesa",
        ref: `Mesa ${m.nombre}`,
        franja: franjaActual(s),
        mozo: o.mozo,
        personas: o.personas,
        items: o.items.map(({ platoId, nombre, cant, precio }) => ({ platoId, nombre, cant, precio })),
        descuento: descuentoMesa(s.local, o),
        propina: pagos.reduce((x, p) => x + p.propina, 0),
        total: pagos.reduce((x, p) => x + p.monto, 0),
        pagos: pagos.map((p) => ({ medio: p.medio, monto: p.monto })),
      };
      s.ventas.push(venta);
    }
    m.ocupada = null;
    s.llamados = s.llamados.filter((l) => l.mesaId !== m.id);
    s.mesas.forEach((x) => {
      if (x.unidaA === m.id) x.unidaA = null;
    });
    // Lo que quedó en cocina de esa mesa ya no hace falta mostrarlo.
    s.comandas.forEach((c) => {
      if (c.mesaId === m.id && c.estado === "lista") c.estado = "entregada";
    });
  };

  return {
    // ---------- Salón ----------
    sentar: (mesaId: string, personas: number, nombre = "", reservaId: string | null = null, mozo?: string) =>
      up((s) => {
        const m = mesa(s, mesaId);
        if (!m || m.ocupada || m.unidaA) return;
        m.ocupada = { personas, nombre, desde: Date.now(), items: [], reservaId, ...(mozo ? { mozo } : {}) };
        const r = reservaId ? s.reservas.find((x) => x.id === reservaId) : undefined;
        if (r) {
          r.estado = "sentada";
          r.mesa = m.nombre;
        }
      }),
    /** Suma (o resta) unidades de una línea. Si la línea no existe, la crea con el precio dado. */
    sumarItem: (mesaId: string, linea: Pick<Item, "platoId"> & Partial<Item>, delta: number) =>
      up((s) => {
        const o = mesa(s, mesaId)?.ocupada;
        if (!o) return;
        const clave = claveItem(linea);
        const it = o.items.find((i) => claveItem(i) === clave);
        if (it) it.cant = Math.max(0, it.cant + delta);
        else if (delta > 0 && linea.nombre) o.items.push({ platoId: linea.platoId, nombre: linea.nombre, precio: linea.precio ?? 0, cant: delta, ...(linea.opciones?.length ? { opciones: linea.opciones } : {}), ...(linea.nota ? { nota: linea.nota } : {}) });
        // No se puede bajar de lo ya cobrado por plato.
        o.items.forEach((i) => (i.cant = Math.max(i.cant, o.pagado?.[claveItem(i)] ?? 0)));
        o.items = o.items.filter((i) => i.cant > 0);
      }),
    cambiarPersonas: (mesaId: string, personas: number) =>
      up((s) => {
        const o = mesa(s, mesaId)?.ocupada;
        if (o) o.personas = Math.max(1, personas);
      }),
    editarOcupada: (mesaId: string, patch: { nombre?: string; mozo?: string; descuento?: number }) =>
      up((s) => {
        const o = mesa(s, mesaId)?.ocupada;
        if (o) Object.assign(o, patch);
      }),
    editarItem: (mesaId: string, clave: string, patch: Partial<Item>) =>
      up((s) => {
        const it = mesa(s, mesaId)?.ocupada?.items.find((i) => claveItem(i) === clave);
        if (it) Object.assign(it, patch);
      }),
    enviarACocina: (mesaId: string) =>
      up((s) => {
        const m = mesa(s, mesaId);
        if (m?.ocupada) comandar(s, m.ocupada.items, { origen: `Mesa ${m.nombre}`, mesaId: m.id, mozo: m.ocupada.mozo });
      }),
    /** Cobra una parte (o todo). Cuando no queda nada por cobrar, cierra la mesa. */
    cobrarParte: (mesaId: string, monto: number, medio: Medio, propina = 0, unidades?: Record<string, number>) =>
      up((s) => {
        const m = mesa(s, mesaId);
        const o = m?.ocupada;
        if (!m || !o) return;
        const quedaba = restanteMesa(s.local, o);
        const parte = Math.min(Math.max(0, Math.round(monto)), quedaba);
        const total = parte + Math.max(0, Math.round(propina));
        if (total > 0) registrarVenta(s, `Mesa ${m.nombre}` + (o.nombre ? ` · ${o.nombre}` : "") + (parte < quedaba || o.pagos?.length ? " (parte)" : ""), total, medio);
        o.pagos = [...(o.pagos ?? []), { monto: parte, medio, propina: Math.max(0, Math.round(propina)) }];
        if (unidades) {
          o.pagado ??= {};
          for (const [k, n] of Object.entries(unidades)) o.pagado[k] = (o.pagado[k] ?? 0) + n;
        }
        if (restanteMesa(s.local, o) <= 0) cerrarMesa(s, m);
      }),
    moverMesa: (origenId: string, destinoId: string) =>
      up((s) => {
        const a = mesa(s, origenId);
        const b = mesa(s, destinoId);
        if (!a?.ocupada || !b || b.ocupada || b.unidaA) return;
        b.ocupada = a.ocupada;
        a.ocupada = null;
        s.mesas.forEach((x) => {
          if (x.unidaA === a.id) x.unidaA = null;
        });
        const r = b.ocupada.reservaId ? s.reservas.find((x) => x.id === b.ocupada?.reservaId) : undefined;
        if (r) r.mesa = b.nombre;
        s.comandas.forEach((c) => {
          if (c.mesaId === a.id) {
            c.mesaId = b.id;
            c.origen = `Mesa ${b.nombre}`;
          }
        });
      }),
    /** Une una mesa libre a otra (para un grupo grande). */
    juntarMesas: (principalId: string, otraId: string) =>
      up((s) => {
        const p = mesa(s, principalId);
        const o = mesa(s, otraId);
        if (!p || !o || p.id === o.id || o.ocupada || o.unidaA || p.unidaA || s.mesas.some((x) => x.unidaA === o.id)) return;
        o.unidaA = p.id;
      }),
    separarMesa: (id: string) =>
      up((s) => {
        const m = mesa(s, id);
        if (m) m.unidaA = null;
      }),
    /** Reemplaza las mesas; conserva lo que está pasando en las que siguen. No borra mesas ocupadas. */
    guardarMesas: (lista: { id: string | null; nombre: string; cap: number; zona: string }[]) =>
      up((s) => {
        const prev = new Map(s.mesas.map((m) => [m.id, m]));
        if (s.mesas.some((m) => m.ocupada && !lista.some((x) => x.id === m.id))) return;
        s.mesas = lista.map(
          (m): Mesa => ({
            id: m.id || uid(),
            nombre: String(m.nombre).trim() || "?",
            cap: Math.max(1, Number(m.cap) || 1),
            zona: m.zona,
            unidaA: (m.id && prev.get(m.id)?.unidaA) || null,
            ocupada: (m.id && prev.get(m.id)?.ocupada) || null,
          }),
        );
        const ids = new Set(s.mesas.map((m) => m.id));
        s.mesas.forEach((m) => {
          if (m.unidaA && !ids.has(m.unidaA)) m.unidaA = null;
        });
      }),
    liberarMesa: (mesaId: string) =>
      up((s) => {
        const m = mesa(s, mesaId);
        if (m) {
          if (m.ocupada) m.ocupada.pagos = [];
          cerrarMesa(s, m);
        }
      }),

    // ---------- Cocina y barra ----------
    estadoComanda: (id: string, estado: EstadoComanda) =>
      up((s) => {
        const c = s.comandas.find((x) => x.id === id);
        if (!c) return;
        c.estado = estado;
        if (estado === "lista") c.lista = Date.now();
        // Un pedido queda listo cuando todas sus comandas están listas.
        if (c.pedidoId && (estado === "lista" || estado === "entregada")) {
          const p = s.pedidos.find((x) => x.id === c.pedidoId);
          const todas = s.comandas.filter((x) => x.pedidoId === c.pedidoId);
          if (p && p.estado === "cocina" && todas.every((x) => x.estado === "lista" || x.estado === "entregada")) p.estado = "listo";
        }
      }),
    limpiarComandas: () =>
      up((s) => {
        s.comandas = s.comandas.filter((c) => c.estado !== "entregada" || Date.now() - c.creada < 3 * 3600_000);
      }),

    // ---------- Lista de espera ----------
    anotarEspera: (datos: Pick<Espera, "nombre" | "personas" | "tel" | "origen">) => {
      const id = uid();
      up((s) => {
        s.espera.push({ ...datos, id, llegada: Date.now(), estado: "esperando" });
      });
      return id;
    },
    estadoEspera: (id: string, estado: EstadoEspera) =>
      up((s) => {
        const e = s.espera.find((x) => x.id === id);
        if (e) e.estado = estado;
      }),
    sentarEspera: (id: string, mesaId: string, mozo?: string) =>
      up((s) => {
        const e = s.espera.find((x) => x.id === id);
        const m = mesa(s, mesaId);
        if (!e || !m || m.ocupada || m.unidaA) return;
        m.ocupada = { personas: e.personas, nombre: e.nombre, desde: Date.now(), items: [], reservaId: null, ...(mozo ? { mozo } : {}) };
        e.estado = "sentado";
      }),

    // ---------- Reservas ----------
    nuevaReserva: (datos: Pick<Reserva, "fecha" | "hora" | "personas" | "nombre" | "tel" | "nota"> & Partial<Reserva>) => {
      const id = uid();
      up((s) => {
        s.reservas.push({ estado: "pendiente", origen: "web", ...datos, id, creada: Date.now() });
      });
      return id;
    },
    guardarReserva: (datos: Partial<Reserva> & { id: string }) =>
      up((s) => {
        const i = s.reservas.findIndex((x) => x.id === datos.id);
        if (i >= 0) s.reservas[i] = { ...s.reservas[i]!, ...datos };
      }),
    estadoReserva: (id: string, estado: EstadoReserva) =>
      up((s) => {
        const r = s.reservas.find((x) => x.id === id);
        if (r) r.estado = estado;
      }),

    // ---------- Pedidos ----------
    nuevoPedido: (datos: NuevoPedido) => {
      const num = Math.max(ultimo.proximoPedido, reservado + 1);
      reservado = num;
      up((s) => {
        s.proximoPedido = Math.max(s.proximoPedido, num + 1);
        s.pedidos.push({ estado: "nuevo", pagado: false, origen: "web", nota: "", ...datos, items: datos.items.map((i) => ({ ...i, enviados: 0 })), id: uid(), num, total: totalItems(datos.items) + datos.envio, creado: Date.now() });
      });
      return num;
    },
    estadoPedido: (id: string, estado: EstadoPedido) =>
      up((s) => {
        const p = s.pedidos.find((x) => x.id === id);
        if (!p) return;
        p.estado = estado;
        if (estado === "cocina") comandar(s, p.items, { origen: `Pedido #${p.num}`, pedidoId: p.id });
        if (estado === "entregado" || estado === "cancelado")
          s.comandas.forEach((c) => {
            if (c.pedidoId === p.id) c.estado = "entregada";
          });
      }),
    cobrarPedido: (id: string, medio: Medio) =>
      up((s) => {
        const p = s.pedidos.find((x) => x.id === id);
        if (!p || p.pagado) return;
        p.pagado = true;
        p.pago = medio;
        p.movId = registrarVenta(s, `Pedido #${p.num}`, p.total, medio);
        s.ventas.push({ id: "v-" + p.id, ts: Date.now(), tipo: "pedido", ref: `Pedido #${p.num}`, franja: franjaActual(s), personas: 0, items: p.items.map(({ platoId, nombre, cant, precio }) => ({ platoId, nombre, cant, precio })), descuento: 0, propina: 0, total: p.total, pagos: [{ medio, monto: p.total }] });
      }),
    /** Edita un pedido; si ya estaba cobrado, corrige el cobro en la caja y en los números. */
    guardarPedido: (datos: Partial<NuevoPedido> & { id: string }) =>
      up((s) => {
        const i = s.pedidos.findIndex((x) => x.id === datos.id);
        const ant = s.pedidos[i];
        if (!ant) return;
        const p = { ...ant, ...datos };
        if (p.entrega !== "envio") p.envio = 0;
        p.total = totalItems(p.items) + p.envio;
        s.pedidos[i] = p;
        const mov = p.pagado ? s.caja.movs.find((m) => m.id === p.movId) : undefined;
        if (mov) {
          mov.monto = p.total;
          mov.medio = p.pago;
        }
        const v = s.ventas.find((x) => x.id === "v-" + p.id);
        if (v) {
          v.total = p.total;
          v.pagos = [{ medio: p.pago, monto: p.total }];
          v.items = p.items.map(({ platoId, nombre, cant, precio }) => ({ platoId, nombre, cant, precio }));
        }
      }),
    anularCobroPedido: (id: string) =>
      up((s) => {
        const p = s.pedidos.find((x) => x.id === id);
        if (!p) return;
        s.caja.movs = s.caja.movs.filter((m) => m.id !== p.movId);
        s.ventas = s.ventas.filter((v) => v.id !== "v-" + p.id);
        p.pagado = false;
        p.movId = null;
      }),
    cancelarPedido: (id: string) =>
      up((s) => {
        const p = s.pedidos.find((x) => x.id === id);
        if (!p) return;
        p.estado = "cancelado";
        s.comandas.forEach((c) => {
          if (c.pedidoId === p.id) c.estado = "entregada";
        });
      }),

    // ---------- Caja ----------
    abrirCaja: (fondo: number) =>
      up((s) => {
        s.caja = { abierta: true, apertura: Date.now(), fondo: Number(fondo) || 0, movs: [] };
      }),
    movimiento: (tipo: TipoMov, concepto: string, monto: number, medio: Medio) =>
      up((s) => {
        asegurarCaja(s);
        s.caja.movs.push({ id: uid(), ts: Date.now(), tipo, concepto, monto: Number(monto) || 0, medio });
      }),
    editarMovimiento: (id: string, patch: { concepto: string; monto: number; medio: Medio; tipo: TipoMov }) =>
      up((s) => {
        const m = s.caja.movs.find((x) => x.id === id);
        if (!m) return;
        Object.assign(m, patch, { monto: Number(patch.monto) || 0 });
        const p = s.pedidos.find((x) => x.movId === id);
        if (p) p.pago = m.medio;
      }),
    editarFondo: (fondo: number) =>
      up((s) => {
        s.caja.fondo = Number(fondo) || 0;
        s.caja.autoabierta = false;
      }),
    borrarMovimiento: (id: string) =>
      up((s) => {
        const p = s.pedidos.find((x) => x.movId === id);
        if (p) {
          p.pagado = false;
          p.movId = null;
          s.ventas = s.ventas.filter((v) => v.id !== "v-" + p.id);
        }
        s.caja.movs = s.caja.movs.filter((x) => x.id !== id);
      }),
    cerrarCaja: (cierre: Omit<Estado["cierres"][number], "id" | "cierre" | "apertura" | "fondo">) =>
      up((s) => {
        s.cierres.unshift({ ...cierre, id: uid(), apertura: s.caja.apertura ?? Date.now(), cierre: Date.now(), fondo: s.caja.fondo });
        s.caja = { abierta: false, apertura: null, fondo: 0, movs: [] };
      }),

    // ---------- Carta ----------
    guardarPlato: (pl: Omit<Plato, "id"> & { id?: string }) =>
      up((s) => {
        const i = pl.id ? s.platos.findIndex((x) => x.id === pl.id) : -1;
        if (i >= 0) s.platos[i] = pl as Plato;
        else s.platos.push({ ...pl, id: uid() });
      }),
    borrarPlato: (id: string) =>
      up((s) => {
        s.platos = s.platos.filter((x) => x.id !== id);
      }),
    alternarPlato: (id: string, campo: "disponible" | "llevar" | "destacado") =>
      up((s) => {
        const pl = s.platos.find((x) => x.id === id);
        if (pl) pl[campo] = !pl[campo];
      }),
    reponerTodo: () =>
      up((s) => {
        s.platos.forEach((p) => (p.disponible = true));
      }),
    guardarCategoria: (c: Partial<Categoria> & { nombre: string }) =>
      up((s) => {
        const i = c.id ? s.categorias.findIndex((x) => x.id === c.id) : -1;
        if (i >= 0) s.categorias[i] = { ...s.categorias[i]!, ...c, id: s.categorias[i]!.id };
        else s.categorias.push({ id: uid(), nombre: c.nombre, nota: c.nota, tienda: c.tienda, barra: c.barra });
      }),
    moverCategoria: (id: string, delta: -1 | 1) =>
      up((s) => {
        const i = s.categorias.findIndex((x) => x.id === id);
        const j = i + delta;
        if (i < 0 || j < 0 || j >= s.categorias.length) return;
        const [c] = s.categorias.splice(i, 1);
        if (c) s.categorias.splice(j, 0, c);
      }),
    borrarCategoria: (id: string) =>
      up((s) => {
        if (s.platos.some((p) => p.cat === id)) return;
        s.categorias = s.categorias.filter((c) => c.id !== id);
        s.local.promos.forEach((p) => (p.categorias = p.categorias.filter((x) => x !== id)));
      }),

    // ---------- Personal y promos ----------
    guardarPersona: (p: Omit<Persona, "id"> & { id?: string }) =>
      up((s) => {
        const i = p.id ? s.local.personal.findIndex((x) => x.id === p.id) : -1;
        if (i >= 0) s.local.personal[i] = p as Persona;
        else s.local.personal.push({ ...p, id: uid() });
      }),
    borrarPersona: (id: string) =>
      up((s) => {
        const quedan = s.local.personal.filter((x) => x.id !== id);
        if (!quedan.some((x) => x.rol === "encargado" && x.activo)) return;
        s.local.personal = quedan;
      }),
    guardarPromo: (p: Omit<Promo, "id"> & { id?: string }) =>
      up((s) => {
        const i = p.id ? s.local.promos.findIndex((x) => x.id === p.id) : -1;
        if (i >= 0) s.local.promos[i] = p as Promo;
        else s.local.promos.push({ ...p, id: uid() });
      }),
    borrarPromo: (id: string) =>
      up((s) => {
        s.local.promos = s.local.promos.filter((x) => x.id !== id);
      }),

    // ---------- Llamados desde la mesa (QR) ----------
    llamar: (mesaId: string, tipo: "mozo" | "cuenta") =>
      up((s) => {
        if (s.llamados.some((l) => l.mesaId === mesaId && l.tipo === tipo)) return;
        s.llamados.push({ id: uid(), mesaId, tipo, ts: Date.now() });
      }),
    atenderLlamado: (id: string) =>
      up((s) => {
        s.llamados = s.llamados.filter((l) => l.id !== id);
      }),

    // ---------- Web ----------
    /** Cambia lo editable de la web (se recibe una copia para modificar). */
    editarWeb: (fn: (w: Local["web"]) => void) => up((s) => fn(s.local.web)),

    // ---------- Configuración y datos ----------
    /** Cambia la configuración del local (se recibe una copia para modificar). */
    editarLocal: (fn: (l: Local) => void) => up((s) => fn(s.local)),
    reiniciar: () => set(semilla(tipo)),
    /** Llegó un estado nuevo de otra pestaña o de una copia de seguridad. */
    reemplazar: (nuevo: Estado) => set(migrar(nuevo)),
    empezarDeCero: () =>
      up((s) => {
        const limpio = vacio(tipo);
        s.mesas = s.mesas.map((m) => ({ ...m, unidaA: null, ocupada: null }));
        s.reservas = [];
        s.pedidos = [];
        s.proximoPedido = 1;
        s.caja = limpio.caja;
        s.cierres = [];
        s.comandas = [];
        s.espera = [];
        s.ventas = [];
        s.llamados = [];
      }),
  };
}

export type Acciones = ReturnType<typeof crearAcciones>;
const Ctx = createContext<{ st: Estado; act: Acciones; clave: string } | null>(null);

export function StoreProvider({
  id,
  tipo,
  preparar,
  soloLectura = false,
  inicial: fijo,
  semillaPropia,
  children,
}: {
  id: string;
  tipo: IdTipo;
  preparar?: (st: Estado) => Estado;
  /** La vista previa del editor o la web de un cliente: muestra, nunca escribe. */
  soloLectura?: boolean;
  /** Arrancar con este estado sin leer el navegador (la web publicada de un cliente). */
  inicial?: Estado;
  /** Si no hay nada guardado, arrancar con este estado en vez del ejemplo (el panel de un cliente). */
  semillaPropia?: Estado;
  children: ReactNode;
}) {
  const clave = claveDe(id);
  const [{ inicial, sinCambios }] = useState(() => {
    const { estado, guardado } = fijo ? { estado: migrar(structuredClone(fijo)), guardado: null } : cargar(clave, tipo, semillaPropia);
    const listo = preparar ? preparar(structuredClone(estado)) : estado;
    return { inicial: listo, sinCambios: guardado !== null && guardado === JSON.stringify(listo) };
  });
  const [st, setSt] = useState(inicial);
  const [act] = useState(() => crearAcciones(setSt, inicial, tipo));
  // Si lo que se leyó ya está guardado tal cual, no se vuelve a escribir al arrancar: otra pestaña
  // (la vista previa del editor, la cocina) podría pisar cambios más nuevos con lo que leyó al abrir.
  const propio = useRef(!sinCambios);

  useEffect(() => {
    if (propio.current && !soloLectura) {
      try {
        localStorage.setItem(clave, JSON.stringify(st));
      } catch {
        /* sin espacio: se mantiene en memoria */
      }
    }
    propio.current = true;
  }, [st, clave, soloLectura]);

  useEffect(() => {
    if (fijo) return;
    const on = (e: StorageEvent) => {
      if (e.key !== clave || !e.newValue) return;
      try {
        const nuevo: unknown = JSON.parse(e.newValue);
        if (valido(nuevo, tipo)) {
          propio.current = false;
          act.reemplazar(nuevo);
        }
      } catch {
        /* ignorar */
      }
    };
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, [clave, tipo, act, fijo]);

  return <Ctx.Provider value={{ st, act, clave }}>{children}</Ctx.Provider>;
}

export function useResto() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useResto fuera de StoreProvider");
  return c;
}

/** La hora actual, que se actualiza sola (para "hace 12 min", "abierto ahora"…). */
export function useAhora(ms = 30_000) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return ahora;
}

