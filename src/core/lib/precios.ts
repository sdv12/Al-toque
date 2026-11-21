import { registry, seccionesDe, type Plantilla } from "../registry";
import type { LandingConfig } from "../schema/landing-config";

/*
 * PRECIOS DE REFERENCIA (ARS). Son estimados para la beta: cambiarlos acá actualiza a la vez la
 * calculadora del configurador y la sección de precios de la home.
 */

/**
 * Los precios se actualizan cada tres meses (1/1, 1/4, 1/7 y 1/10). Al actualizarlos, cambiar
 * `proxima` por la fecha de la siguiente: el aviso de la web y los textos de vigencia la toman de acá.
 */
export const ACTUALIZACION_PRECIOS = { cadaMeses: 3, proxima: "2027-01-01" } as const;

const LARGA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "1 de enero de 2027": cuándo cambian los precios. */
export function proximaActualizacion(): string {
  return LARGA.format(new Date(`${ACTUALIZACION_PRECIOS.proxima}T00:00:00Z`));
}

/** "31 de diciembre de 2026": hasta cuándo valen los precios publicados (el día anterior). */
export function preciosVigentesHasta(): string {
  return LARGA.format(new Date(Date.parse(`${ACTUALIZACION_PRECIOS.proxima}T00:00:00Z`) - 86_400_000));
}

/** Página con una plantilla de rubro (barbería, casas, portfolio). */
const PLANTILLA = { unico: 250_000, mensual: 15_000 };

/**
 * Perfil digital: el escalón de entrada. Una página corta armada con bloques (hasta 3, sin
 * componentes con sistema) en una dirección de Al Toque (negocio.altoque-cba.com.ar), sin dominio
 * propio. Si suma más bloques, un componente con sistema o el dominio propio, pasa a Personalizado.
 */
const PERFIL = { unico: 160_000, mensual: 15_000, bloquesMax: 3 };

/** Página "a tu medida" (nivel Personalizado): incluye cierta cantidad de bloques; los demás se cobran aparte. */
const A_MEDIDA = { unico: 320_000, mensual: 15_000, bloquesIncluidos: 6, bloqueExtra: 20_000 };

/**
 * Si hay al menos un componente con sistema: base de datos, servidor y su mantenimiento.
 * Plantilla + sistema + un componente = el plan "Con sistema" (desde $410.000 + $75.000/mes).
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
    const conSistema = activas.some((s) => defs[s.tipo]?.sistema);
    const esPerfil = basicos.length <= PERFIL.bloquesMax && !conSistema && !(config.extras ?? []).includes("dominio");
    if (esPerfil) {
      lineas.push({ concepto: `Perfil digital (hasta ${PERFIL.bloquesMax} bloques, en una dirección de Al Toque)`, unico: PERFIL.unico, mensual: PERFIL.mensual, sistema: false });
      for (const id of config.extras ?? []) {
        const extra = EXTRAS[id as IdExtra];
        if (extra) lineas.push({ concepto: extra.nombre, unico: extra.unico, mensual: extra.mensual, sistema: extra.sistema });
      }
      const usa = lineas.some((l) => l.sistema);
      if (usa) lineas.push({ concepto: "Base de datos y servidor", ...SISTEMA_BASE, sistema: true });
      return { lineas, total: sumar(lineas), usaSistema: usa };
    }
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
      nombre: "Listo para usar",
      bajada: "Una plantilla pensada para tu rubro, con tus textos, colores y precios.",
      desde: true,
      ...PLANTILLA,
      incluye: [
        "Plantilla de barbería, casas de campo o portfolio",
        "Turnos y consultas que llegan por WhatsApp",
        "Hosting, certificado de seguridad y cambios chicos",
        "Vista previa linda cuando compartís el link",
      ],
    },
    {
      id: "medida",
      nombre: "Personalizado",
      bajada: "Hoja en blanco con tu estilo: sumás solo los bloques que necesitás.",
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
      nombre: "Web + Turnos",
      bajada: "Tu página con turnos reales adentro. También para seña online o un panel propio.",
      desde: true,
      unico: PLANTILLA.unico + SISTEMA_BASE.unico + COMPONENTE_SISTEMA.unico,
      mensual: PLANTILLA.mensual + SISTEMA_BASE.mensual + COMPONENTE_SISTEMA.mensual,
      incluye: [
        "Todo lo de Listo para usar o Personalizado",
        "Turnos guardados, sin superposiciones",
        "Seña online, recordatorios o panel de gestión",
        "Base de datos y mantenimiento incluidos en el mensual",
      ],
    },
  ];
}

/** Perfil digital, el nivel de entrada. */
export function planPerfil() {
  return { ...PERFIL };
}

/** Lo que el paquete Web + Turnos ahorra frente a contratar la página y la agenda por separado. */
export function ahorroWebTurnos(): Monto {
  const [vidriera, , sistema] = planes();
  return { unico: vidriera!.unico + AGENDA.unico - sistema!.unico, mensual: vidriera!.mensual + AGENDA.mensual - sistema!.mensual };
}

/**
 * Los niveles de Al Toque Web, del más simple al más completo. El último (desarrollo a medida) no
 * tiene precio publicado: se presupuesta según el alcance.
 */
export function niveles() {
  const [vidriera, medida, sistema] = planes();
  return [
    {
      id: "perfil",
      nombre: "Perfil digital",
      bajada: "Lo justo para que te encuentren y te escriban.",
      precio: { unico: PERFIL.unico, mensual: PERFIL.mensual, desde: false } as { unico: number; mensual: number; desde: boolean } | null,
      incluye: [
        `Hasta ${PERFIL.bloquesMax} bloques: quién sos, qué hacés y cómo contactarte`,
        "En una dirección de Al Toque: tunegocio.altoque-cba.com.ar",
        "Botón de WhatsApp y tus redes",
        "Hosting, certificado de seguridad y cambios chicos",
      ],
      href: "/configurador?plantilla=libre",
      accion: "Armar mi perfil",
    },
    { ...vidriera!, precio: { unico: vidriera!.unico, mensual: vidriera!.mensual, desde: true }, href: "/configurador", accion: "Elegir plantilla" },
    { ...medida!, precio: { unico: medida!.unico, mensual: medida!.mensual, desde: true }, href: "/configurador?plantilla=libre", accion: "Armar desde cero" },
    { ...sistema!, precio: { unico: sistema!.unico, mensual: sistema!.mensual, desde: true }, href: "/turnos", accion: "Ver turnos" },
    {
      id: "premium",
      nombre: "Desarrollo a medida",
      bajada: "Diseño y funciones exclusivas para tu negocio.",
      precio: null,
      incluye: ["Diseño propio, desde cero", "Integraciones y automatizaciones", "Sistemas de gestión a tu medida", "Soporte y evolución presupuestados"],
      href: "/#contacto",
      accion: "Contanos tu proyecto",
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
const CAJA_SIMPLE = { unico: 150_000, mensual: 15_000 };

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
 * Mercado Pago, stock con lector, cuentas corrientes y auditoría. NO tiene precio publicado: es un
 * proyecto a medida y se presupuesta según el alcance y la complejidad (sucursales, usuarios,
 * facturación, integraciones, carga de productos). Referencia interna para presupuestar: base de
 * datos + servicio de facturación (~$35.000/mes por cliente vía TusFacturasAPP) + soporte.
 */
export const CAJA_PRO_A_MEDIDA = {
  titulo: "Presupuesto a medida",
  texto: "El precio depende del alcance y la complejidad: cuántas sucursales y usuarios, si facturás, qué integraciones necesitás y cuántos productos hay que cargar.",
} as const;

/**
 * Agenda al toque sola (página de reservas + panel con agenda, caja y números, sin landing): más
 * barata que "Con sistema" porque no lleva página web, pero por encima de las apps de turnos
 * ($15–35k/mes, sin costo inicial): incluye la puesta en marcha (servicios, horarios, diseño) y la
 * base de datos para que varios clientes reserven sobre la misma agenda.
 */
const AGENDA = { unico: 280_000, mensual: 60_000 };

export function planAgenda() {
  return { ...AGENDA };
}
