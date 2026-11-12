import { registry, seccionesDe, type Plantilla } from "../registry";
import type { LandingConfig } from "../schema/landing-config";

/*
 * PRECIOS DE REFERENCIA (ARS). Son estimados para la beta: cambiarlos acá actualiza a la vez la
 * calculadora del configurador y la sección de precios de la home.
 */

/** Página con una plantilla de rubro (barbería, consultorio, casas, portfolio). */
const PLANTILLA = { unico: 190_000, mensual: 15_000 };

/** Página "a tu medida": incluye cierta cantidad de bloques; los demás se cobran aparte. */
const A_MEDIDA = { unico: 250_000, mensual: 15_000, bloquesIncluidos: 6, bloqueExtra: 15_000 };

/**
 * Si hay al menos un componente con sistema: base de datos, servidor y su mantenimiento.
 * Plantilla + sistema + un componente = el plan "Con sistema" (desde $350.000 + $75.000/mes).
 */
const SISTEMA_BASE = { unico: 100_000, mensual: 50_000 };

/** Cada componente con sistema (agenda real, calendario real, formulario con panel, pagos). */
const COMPONENTE_SISTEMA = { unico: 60_000, mensual: 10_000 };

/** Funciones que no son bloques de la página pero se pueden sumar. */
export const EXTRAS = {
  "agenda-real": {
    nombre: "Agenda con base de datos",
    descripcion: "Los turnos de la plantilla se guardan y no se superponen (hoy se confirman por WhatsApp).",
    unico: 60_000,
    mensual: 10_000,
    sistema: true,
  },
  recordatorios: {
    nombre: "Recordatorios automáticos por WhatsApp",
    descripcion: "Confirmación al reservar y aviso el día anterior.",
    unico: 50_000,
    mensual: 10_000,
    sistema: true,
  },
  panel: {
    nombre: "Panel para gestionar turnos y consultas",
    descripcion: "Ver, confirmar y cancelar desde el celular.",
    unico: 80_000,
    mensual: 0,
    sistema: true,
  },
  dominio: {
    nombre: "Dominio propio (.com.ar)",
    descripcion: "Tu página en tunegocio.com.ar. Incluye alta y configuración; la renovación anual va aparte.",
    unico: 35_000,
    mensual: 0,
    sistema: false,
  },
} as const satisfies Record<string, { nombre: string; descripcion: string; unico: number; mensual: number; sistema: boolean }>;

export type IdExtra = keyof typeof EXTRAS;

export type Monto = { unico: number; mensual: number };
export type LineaPrecio = Monto & { concepto: string; sistema: boolean };
export type Cotizacion = { lineas: LineaPrecio[]; total: Monto; usaSistema: boolean };

function sumar(lineas: readonly Monto[]): Monto {
  return lineas.reduce((t, l) => ({ unico: t.unico + l.unico, mensual: t.mensual + l.mensual }), { unico: 0, mensual: 0 });
}

/** Presupuesto estimado de una configuración, renglón por renglón. */
export function cotizar(config: Pick<LandingConfig, "plantilla" | "secciones" | "extras">): Cotizacion {
  const lineas: LineaPrecio[] = [];
  const defs = seccionesDe(config.plantilla);
  const activas = (config.secciones as readonly { tipo: string; activa: boolean }[]).filter((s) => s.activa);

  if (config.plantilla === "libre") {
    const basicos = activas.filter((s) => !defs[s.tipo]?.sistema);
    lineas.push({ concepto: `Página a tu medida (hasta ${A_MEDIDA.bloquesIncluidos} bloques)`, unico: A_MEDIDA.unico, mensual: A_MEDIDA.mensual, sistema: false });
    const extra = Math.max(0, basicos.length - A_MEDIDA.bloquesIncluidos);
    if (extra > 0) lineas.push({ concepto: `${extra} ${extra === 1 ? "bloque extra" : "bloques extra"}`, unico: extra * A_MEDIDA.bloqueExtra, mensual: 0, sistema: false });
    for (const s of activas.filter((x) => defs[x.tipo]?.sistema)) {
      lineas.push({ concepto: `${defs[s.tipo]!.etiqueta} (con sistema)`, ...COMPONENTE_SISTEMA, sistema: true });
    }
  } else {
    lineas.push({ concepto: `Página con plantilla ${registry[config.plantilla].meta.nombre}`, ...PLANTILLA, sistema: false });
  }

  for (const id of config.extras ?? []) {
    const extra = EXTRAS[id as IdExtra];
    if (extra) lineas.push({ concepto: extra.nombre, unico: extra.unico, mensual: extra.mensual, sistema: extra.sistema });
  }

  const usaSistema = lineas.some((l) => l.sistema);
  if (usaSistema) lineas.push({ concepto: "Base de datos y servidor", ...SISTEMA_BASE, sistema: true });

  return { lineas, total: sumar(lineas), usaSistema };
}

/** Planes para la sección de precios de la home (derivados de los mismos valores). */
export function planes() {
  return [
    {
      id: "vidriera",
      nombre: "Vidriera",
      bajada: "Una plantilla pensada para tu rubro, con tus textos, colores y precios.",
      desde: true,
      ...PLANTILLA,
      incluye: [
        "Plantilla de barbería, consultorio, casas de campo o portfolio",
        "Turnos y consultas que llegan por WhatsApp",
        "Hosting, certificado de seguridad y cambios chicos",
        "Vista previa linda cuando compartís el link",
      ],
    },
    {
      id: "medida",
      nombre: "A tu medida",
      bajada: "Hoja en blanco: sumás solo los bloques que necesitás.",
      desde: true,
      unico: A_MEDIDA.unico,
      mensual: A_MEDIDA.mensual,
      incluye: [
        `Hasta ${A_MEDIDA.bloquesIncluidos} bloques a elección`,
        `Bloques extra a $${A_MEDIDA.bloqueExtra.toLocaleString("es-AR")} cada uno`,
        "Tu estilo: colores, fondo, esquinas y tamaño de texto",
        "Hosting, certificado de seguridad y cambios chicos",
      ],
    },
    {
      id: "sistema",
      nombre: "Con sistema",
      bajada: "Para los que necesitan agenda real, pagos o un panel propio.",
      desde: true,
      unico: PLANTILLA.unico + SISTEMA_BASE.unico + COMPONENTE_SISTEMA.unico,
      mensual: PLANTILLA.mensual + SISTEMA_BASE.mensual + COMPONENTE_SISTEMA.mensual,
      incluye: [
        "Todo lo de Vidriera o A tu medida",
        "Turnos guardados, sin superposiciones",
        "Seña online, recordatorios o panel de gestión",
        "Base de datos y mantenimiento incluidos en el mensual",
      ],
    },
  ];
}

/** ¿El bloque necesita backend real? (para el cartel de advertencia del configurador). */
export function esBloqueConSistema(plantilla: Plantilla, tipo: string): boolean {
  return !!seccionesDe(plantilla)[tipo]?.sistema;
}

/* ───────────── Caja al toque ───────────── */

/**
 * Caja simple: app para el celular, la tablet o la compu del local. Los datos quedan en ese equipo
 * (todavía no hay servidor): el mensual cubre hosting, soporte y actualizaciones (y, cuando exista,
 * el respaldo en la nube). Incluye el fiado, la carga inicial de productos y la explicación en el local.
 */
const CAJA_SIMPLE = { unico: 99_000, mensual: 15_000 };

export const MODULOS_CAJA = {
  fiado: {
    nombre: "Fiado",
    descripcion: "Clientes con cuenta: anotar, cobrar y mandarles el saldo por WhatsApp.",
    /** Incluido en la caja simple: casi todas las cajas del mercado lo traen. */
    unico: 0,
    mensual: 0,
  },
  cajones: {
    nombre: "Cajones y mercado",
    descripcion: "Cuánto queda de cada cosa, compras del mercado, merma y lista de compras.",
    unico: 20_000,
    mensual: 0,
  },
} as const satisfies Record<string, { nombre: string; descripcion: string; unico: number; mensual: number }>;

export type IdModuloCaja = keyof typeof MODULOS_CAJA;

/** Presupuesto estimado de una caja (recibe solo los módulos: el core no conoce el formato de la caja). */
export function cotizarCaja(caja: { modulos: Record<IdModuloCaja, boolean> }): Cotizacion {
  const lineas: LineaPrecio[] = [{ concepto: "Caja simple (vender, precios y caja del día)", ...CAJA_SIMPLE, sistema: false }];
  for (const id of Object.keys(MODULOS_CAJA) as IdModuloCaja[]) {
    // Los módulos incluidos (sin costo) no suman renglón.
    if (caja.modulos[id] && (MODULOS_CAJA[id].unico || MODULOS_CAJA[id].mensual)) lineas.push({ concepto: MODULOS_CAJA[id].nombre, unico: MODULOS_CAJA[id].unico, mensual: MODULOS_CAJA[id].mensual, sistema: false });
  }
  return { lineas, total: sumar(lineas), usaSistema: false };
}

/** Plan de la caja simple para la home (desde: sin módulos). */
export function planCaja() {
  return { ...CAJA_SIMPLE, modulos: MODULOS_CAJA };
}

/**
 * Caja pro: varias cajas y sucursales, usuarios con permisos, factura electrónica (ARCA), QR de
 * Mercado Pago, stock con lector, cuentas corrientes y auditoría. Necesita servidor y base de
 * datos. El mensual incluye 1 sucursal y hasta 1.000 facturas por mes: cubre la base de datos, el
 * servicio de facturación (~$35.000/mes por cliente si es vía TusFacturasAPP), soporte y
 * actualizaciones. Cada sucursal extra suma.
 */
const CAJA_PRO = { unico: 450_000, mensual: 75_000, sucursalExtra: 25_000, facturasIncluidas: 1_000 };

export function planCajaPro() {
  return CAJA_PRO;
}
