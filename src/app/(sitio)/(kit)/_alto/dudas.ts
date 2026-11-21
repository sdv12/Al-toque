import { formatearPesos } from "@/core/lib/mensajes";
import { ACTUALIZACION_PRECIOS, planAgenda, planCaja, planCajaPro, planes, proximaActualizacion } from "@/core/lib/precios";

/*
 * Lo que Alto sabe contestar. Cada duda tiene palabras clave para encontrarla cuando la persona
 * escribe su pregunta con sus palabras. Los precios salen de precios.ts (no se repiten a mano).
 */

export interface Duda {
  id: string;
  pregunta: string;
  claves: string[];
  respuesta: () => string[];
}

const mes = (unico: number, mensual: number) => `${formatearPesos(unico)} + ${formatearPesos(mensual)} por mes`;

export const DUDAS: Duda[] = [
  {
    id: "precio",
    pregunta: "¿Cuánto sale?",
    claves: ["cuanto", "precio", "sale", "cuesta", "valor", "cobran", "plata", "presupuesto", "costo", "tarifa"],
    respuesta: () => {
      const [vidriera, medida, sistema] = planes();
      return [
        `Página con plantilla: desde ${mes(vidriera!.unico, vidriera!.mensual)}. A tu medida: desde ${mes(medida!.unico, medida!.mensual)}. Con turnos o sistema: desde ${mes(sistema!.unico, sistema!.mensual)}.`,
        `Agenda de turnos sola: ${mes(planAgenda().unico, planAgenda().mensual)}. Caja simple: ${mes(planCaja().unico, planCaja().mensual)}. Caja pro: ${mes(planCajaPro().unico, planCajaPro().mensual)}.`,
        "Si me contás de tu negocio, te armo el número exacto para lo tuyo.",
      ];
    },
  },
  {
    id: "mensual",
    pregunta: "¿Qué incluye el mensual?",
    claves: ["mensual", "abono", "mantenimiento", "incluye", "hosting", "cuota", "por mes"],
    respuesta: () => [
      "El alojamiento, el certificado de seguridad, el mantenimiento y las actualizaciones. En los sistemas, también la base de datos.",
      "Y cambios chicos todos los meses: textos, precios, horarios, fotos o datos de contacto (hasta una hora por mes).",
    ],
  },
  {
    id: "tiempo",
    pregunta: "¿Cuánto tarda?",
    claves: ["tarda", "demora", "para cuando", "cuanto tiempo", "plazo", "dias", "rapido", "listo", "entrega"],
    respuesta: () => [
      "Una página con plantilla suele estar en pocos días desde que tenemos tus textos y fotos. Los sistemas (turnos, caja pro) llevan un poco más.",
      "El plazo exacto va en el presupuesto, y corre desde que nos pasás los materiales.",
    ],
  },
  {
    id: "pago",
    pregunta: "¿Cómo se paga?",
    claves: ["pago", "pagar", "transferencia", "mercado pago", "tarjeta", "cuotas", "anticipo", "seña", "efectivo"],
    respuesta: () => [
      "Por transferencia o Mercado Pago. Del pago único se abona la mitad para empezar y el resto antes de publicar; el mensual, por adelantado del 1 al 10 de cada mes.",
      "Te mandamos la factura de todo.",
    ],
  },
  {
    id: "cambios",
    pregunta: "¿Puedo cambiar cosas después?",
    claves: ["cambiar", "modificar", "editar", "actualizar", "despues", "cambios"],
    respuesta: () => [
      "Sí. Antes de publicar tenés dos rondas de ajustes, y después los cambios chicos van incluidos en el mensual.",
      "Si querés algo más grande (otra plantilla, secciones nuevas), te lo cotizamos.",
    ],
  },
  {
    id: "baja",
    pregunta: "¿Y si me quiero dar de baja?",
    claves: ["baja", "cancelar", "irme", "dejar", "rescindir", "permanencia", "contrato", "atado"],
    respuesta: () => [
      "Te das de baja cuando quieras, sin penalidad ni permanencia mínima: desde el «Botón de baja» al pie de la página o por el mismo medio por el que contrataste.",
      "Rige al terminar el mes pagado y te llevás tu contenido y tus datos.",
    ],
  },
  {
    id: "arrepentimiento",
    pregunta: "¿Me puedo arrepentir?",
    claves: ["arrepentir", "arrepentimiento", "devolucion", "devuelven", "reembolso"],
    respuesta: () => ["Sí: tenés 10 días corridos desde que contratás para arrepentirte sin costo, con el «Botón de arrepentimiento» del pie de la página. Te devolvemos lo que pagaste."],
  },
  {
    id: "dominio",
    pregunta: "¿Qué es el dominio?",
    claves: ["dominio", ".com", "com.ar", "direccion", "url", "nombre de la pagina", "nic"],
    respuesta: () => [
      "Es la dirección de tu página, por ejemplo tunegocio.com.ar. Se registra a tu nombre, así es tuyo aunque algún día te vayas.",
      "Si no tenés, arrancás con una dirección nuestra y lo sumás cuando quieras.",
    ],
  },
  {
    id: "saber",
    pregunta: "¿Tengo que saber de computación?",
    claves: ["saber", "computacion", "dificil", "complicado", "tecnologia", "programar", "facil", "manejar"],
    respuesta: () => ["No. Elegís opciones y nos pasás tus textos y fotos; el resto lo hacemos nosotros. Las cajas y la agenda están pensadas para usarse con botones grandes, sin cursos."],
  },
  {
    id: "celular",
    pregunta: "¿Se ve bien en el celular?",
    claves: ["celular", "movil", "telefono", "iphone", "android", "tablet", "app"],
    respuesta: () => ["Sí, todo está pensado primero para el celular. La caja y la agenda además se pueden instalar como una app."],
  },
  {
    id: "datos",
    pregunta: "¿Qué hacen con mis datos?",
    claves: ["datos", "privacidad", "seguro", "seguridad", "informacion", "clientes"],
    respuesta: () => [
      "Los usamos solo para responderte y prestarte el servicio; no los vendemos ni los cedemos. Los datos de tus clientes son tuyos.",
      "Está todo explicado en la Política de privacidad, al pie de la página.",
    ],
  },
  {
    id: "factura",
    pregunta: "¿Puedo hacer factura electrónica?",
    claves: ["factura", "facturar", "arca", "afip", "fiscal", "cae"],
    respuesta: () => ["Sí, con la caja pro: factura A o B con tu CUIT, desde la misma venta. La caja simple no factura: es para llevar las ventas del mostrador."],
  },
  {
    id: "redes",
    pregunta: "¿Me manejan las redes?",
    claves: ["redes", "instagram", "facebook", "tiktok", "publicidad", "anuncios", "marketing", "seguidores"],
    respuesta: () => ["No gestionamos redes ni publicidad, pero tu página puede mostrar tu Instagram y llevar a tus redes, y te pasamos el link para que lo pongas en tu bio."],
  },
  {
    id: "tienda",
    pregunta: "¿Puedo vender online con envíos?",
    claves: ["tienda", "ecommerce", "envio", "envios", "carrito", "vender online", "venta online"],
    respuesta: () => ["Por ahora no armamos tiendas con carrito y envíos, pero sí un catálogo con pedidos por WhatsApp. Si necesitás tienda completa, contanos y lo vemos aparte."],
  },
  {
    id: "fotos",
    pregunta: "¿Y si todavía no tengo fotos?",
    claves: ["fotos", "foto", "imagenes", "logo"],
    respuesta: () => [
      "Se publica igual: donde va cada foto aparece un recuadro que dice qué foto corresponde, y cuando las tengas las sumamos. Nada de fotos de stock que no son tuyas.",
      "Si necesitás logo o fotos profesionales, te lo cotizamos aparte.",
    ],
  },
  {
    id: "pedidos",
    pregunta: "¿Cómo me llegan los turnos y las consultas?",
    claves: ["me llegan", "llegan", "avisan", "notificacion", "whatsapp", "reservas"],
    respuesta: () => [
      "Por WhatsApp, con el mensaje ya armado: qué servicio, qué día, a qué hora y a nombre de quién. Con la agenda de turnos, además, quedan en tu panel.",
    ],
  },
  {
    id: "actualizacion",
    pregunta: "¿Los precios aumentan?",
    claves: ["aumento", "aumentan", "actualizan", "inflacion", "suben", "ajuste"],
    respuesta: () => [
      `Se actualizan cada ${ACTUALIZACION_PRECIOS.cadaMeses} meses; la próxima vez es el ${proximaActualizacion()}. Si ya tenés abono, te avisamos con 30 días y podés darte de baja sin costo si no te sirve.`,
    ],
  },
];

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Busca la duda que mejor coincide con lo que escribió la persona (o null si no hay ninguna clara). */
export function buscarDuda(texto: string): Duda | null {
  const t = ` ${normalizar(texto)} `;
  let mejor: Duda | null = null;
  let puntos = 0;
  for (const d of DUDAS) {
    const p = d.claves.reduce((n, c) => n + (t.includes(normalizar(c)) ? c.length : 0), 0);
    if (p > puntos) {
      mejor = d;
      puntos = p;
    }
  }
  return puntos >= 4 ? mejor : null;
}

export const SIN_RESPUESTA = [
  "Esa no la sé contestar yo, pero te la responde una persona del equipo.",
  "Dejala en el comentario del final, cuando armemos tu pedido, o escribinos por WhatsApp.",
];
