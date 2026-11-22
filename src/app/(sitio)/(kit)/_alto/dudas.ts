import { formatearPesos } from "@/core/lib/mensajes";
import { ACTUALIZACION_PRECIOS, CAJA_PRO_A_MEDIDA, EXTRAS, ahorroWebTurnos, planAgenda, planCaja, planPerfil, planes, planesResto, proximaActualizacion } from "@/core/lib/precios";

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
      const perfil = planPerfil();
      return [
        `Páginas: Perfil digital ${mes(perfil.unico, perfil.mensual)}; Listo para usar desde ${mes(vidriera!.unico, vidriera!.mensual)}; Personalizado desde ${mes(medida!.unico, medida!.mensual)}; Web + Turnos desde ${mes(sistema!.unico, sistema!.mensual)}.`,
        `Agenda de turnos sola: ${mes(planAgenda().unico, planAgenda().mensual)}. Caja simple: desde ${mes(planCaja().unico, planCaja().mensual)}. La caja pro y los desarrollos a medida se presupuestan según lo que necesites.`,
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
    claves: ["datos", "privacidad", "seguro", "seguridad", "informacion"],
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
    id: "planes",
    pregunta: "¿Qué diferencia hay entre los planes?",
    claves: ["diferencia", "planes", "plan", "niveles", "cual me conviene", "conviene", "opciones"],
    respuesta: () => [
      "Perfil digital: una página corta con lo esencial (quién sos, qué hacés, cómo contactarte) en una dirección de Al Toque. Ideal para arrancar.",
      "Listo para usar: una plantilla completa pensada para tu rubro. Personalizado: hoja en blanco con tu estilo y los bloques que quieras, con dominio propio si querés.",
      "Web + Turnos: tu página con turnos reales adentro. Desarrollo a medida: diseño y funciones exclusivas, presupuestado.",
      "Si me contás qué necesitás, te digo cuál te conviene.",
    ],
  },
  {
    id: "perfil",
    pregunta: "¿Qué es el Perfil digital?",
    claves: ["perfil digital", "perfil", "lo mas barato", "mas barato", "economico", "simple", "basico"],
    respuesta: () => {
      const p = planPerfil();
      return [
        `Es el plan de entrada: ${mes(p.unico, p.mensual)}. Una página corta con hasta ${p.bloquesMax} bloques (quién sos, qué hacés y cómo contactarte), botón de WhatsApp y tus redes, en tunegocio.altoque-cba.com.ar.`,
        "Cuando quieras más (otra sección, tu propio dominio, turnos), lo pasamos a Personalizado sin empezar de cero.",
      ];
    },
  },
  {
    id: "paquete",
    pregunta: "¿Conviene la web con turnos juntos?",
    claves: ["paquete", "juntos", "web y turnos", "pagina y turnos", "combo", "descuento", "promo"],
    respuesta: () => {
      const a = ahorroWebTurnos();
      const [, , sistema] = planes();
      return [
        `Sí: el paquete Web + Turnos sale desde ${mes(sistema!.unico, sistema!.mensual)} y te ahorrás ${formatearPesos(a.unico)} frente a contratar la página y la agenda por separado.`,
        "Los turnos quedan dentro de tu página: tus clientes te conocen y reservan en el mismo lugar.",
      ];
    },
  },
  {
    id: "resto",
    pregunta: "¿Tienen algo para restaurantes, bares o cafés?",
    claves: ["resto", "restaurante", "restaurant", "bodegon", "parrilla", "pizzeria", "cafe", "cafeteria", "bar", "cerveceria", "sushi", "hamburgueseria", "rotiseria", "carta", "menu", "comandas", "mesas", "mozo", "delivery"],
    respuesta: () => {
      const p = planesResto();
      return [
        `Sí: Al Toque Resto. «${p.carta.nombre}» es tu web con la carta, pedidos para retirar o con envío y reservas por turno: ${mes(p.carta.unico, p.carta.mensual)}.`,
        `«${p.completo.nombre}» suma el panel del salón (mesas, comandas a cocina, cuenta dividida, caja, números y personal): ${mes(p.completo.unico, p.completo.mensual)}.`,
        "Viene armado para bodegones, parrillas, pizzerías, cafés, bares, sushi, hamburgueserías y rotiserías. Probá la demo con tu tipo de local en /resto.",
      ];
    },
  },
  {
    id: "cajapro",
    pregunta: "¿Cuánto sale la caja pro?",
    claves: ["caja pro", "sucursales", "empleados", "stock", "lector", "codigo de barras"],
    respuesta: () => [
      `No tiene un precio fijo: ${CAJA_PRO_A_MEDIDA.texto.charAt(0).toLowerCase()}${CAJA_PRO_A_MEDIDA.texto.slice(1)}`,
      "Contame cómo es tu comercio (o hacé las preguntas conmigo) y te mandamos el presupuesto. Mientras, podés probar la demo en /c/pro.",
    ],
  },
  {
    id: "subdominio",
    pregunta: "¿Qué dirección va a tener mi página?",
    claves: ["subdominio", "direccion", "link", "altoque-cba", "mi propia direccion"],
    respuesta: () => [
      "Con Perfil digital o Listo para usar, tu página va en tunegocio.altoque-cba.com.ar, sin costo extra.",
      `Si querés tu propio dominio (tunegocio.com.ar), lo registramos a tu nombre y lo conectamos: el alta y la configuración salen ${formatearPesos(EXTRAS.dominio.unico)}; la renovación anual va aparte.`,
    ],
  },
  {
    id: "soporte",
    pregunta: "¿Y si algo no anda o necesito ayuda?",
    claves: ["soporte", "ayuda", "no anda", "problema", "falla", "error", "atencion", "contesta"],
    respuesta: () => [
      "Nos escribís por WhatsApp o correo y te respondemos dentro de las 48 horas hábiles. Si algo dejó de andar por nuestra parte, lo arreglamos sin costo.",
      "Hablás con las personas que lo hicieron, no con un bot de soporte (bueno, salvo conmigo 😅).",
    ],
  },
  {
    id: "capacitacion",
    pregunta: "¿Me enseñan a usarlo?",
    claves: ["enseñan", "ensenan", "aprender", "capacitacion", "explican", "como se usa", "tutorial"],
    respuesta: () => [
      "Sí. Al entregarte la agenda o la caja te mostramos cómo se usa (en el local o por videollamada) y te dejamos una guía corta.",
      "Si después se suma alguien de tu equipo, una explicación más va dentro del soporte; capacitaciones largas se cotizan aparte.",
    ],
  },
  {
    id: "internet",
    pregunta: "¿La caja anda sin internet?",
    claves: ["sin internet", "internet", "se corta", "offline", "conexion", "wifi"],
    respuesta: () => [
      "La caja simple sí: guarda todo en el equipo donde la usás y sigue vendiendo aunque se corte internet.",
      "Por eso mismo, los datos viven en ese equipo. Con «Guardar una copia» los mandás a tu WhatsApp, Drive o mail, y si el equipo se rompe los recuperás en otro. Te lo recuerda cada semana.",
    ],
  },
  {
    id: "migrar",
    pregunta: "Ya tengo una página, ¿la pueden mejorar?",
    claves: ["ya tengo", "mi pagina actual", "migrar", "pasar", "renovar", "mejorar", "rehacer", "wix", "wordpress"],
    respuesta: () => [
      "Sí. Miramos la que tenés y la rehacemos en Al Toque con tus textos y fotos. Si ya tenés dominio, lo usamos: no lo perdés.",
      "Contame la dirección al final de las preguntas y la revisamos.",
    ],
  },
  {
    id: "logo",
    pregunta: "¿Hacen logos o fotos?",
    claves: ["logo", "diseño grafico", "fotografo", "fotos profesionales", "identidad", "marca"],
    respuesta: () => [
      "El logo y las fotos profesionales se cotizan aparte. Si todavía no tenés logo, arrancamos con tu nombre bien tipografiado y queda prolijo igual.",
    ],
  },
  {
    id: "mora",
    pregunta: "¿Qué pasa si me atraso con el mensual?",
    claves: ["atraso", "me atraso", "no pago", "deuda", "mora", "vencimiento", "corta"],
    respuesta: () => [
      "Te avisamos antes. Si pasan 15 días del vencimiento, el servicio se suspende (con aviso de 5 días) hasta que se regularice; nada se borra en ese tiempo.",
      "Si se complica un mes, escribinos y lo charlamos. Está todo en los Términos y condiciones.",
    ],
  },
  {
    id: "turnoslimite",
    pregunta: "¿Hay límite de turnos o de profesionales?",
    claves: ["limite", "cuantos turnos", "profesionales", "barberos", "varios", "empleados", "sillas"],
    respuesta: () => [
      "No hay límite de turnos. Podés tener varios profesionales: cada cliente elige con quién se atiende y cada uno tiene su agenda.",
    ],
  },
  {
    id: "recordatorios",
    pregunta: "¿Les avisa a mis clientes antes del turno?",
    claves: ["recordatorio", "recordatorios", "avisa", "aviso", "olvidan", "faltan", "falten", "no vienen", "antes del turno"],
    respuesta: () => [
      "Desde el panel les mandás el recordatorio por WhatsApp con un toque, y pueden agendar el turno en su calendario.",
      `Los recordatorios automáticos (al reservar y el día anterior) se suman por ${formatearPesos(EXTRAS.recordatorios.unico)} + ${formatearPesos(EXTRAS.recordatorios.mensual)} por mes.`,
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

/** En qué página está Alto: cambia el saludo, las dudas que muestra primero y lo que sugiere marcar. */
export type ContextoAlto = "inicio" | "web" | "turnos" | "caja" | "resto" | "tienda";

export const CONTEXTOS: Record<ContextoAlto, { saludo: string | null; vineta: string; dudas: string[]; funciones: string[] }> = {
  inicio: { saludo: null, vineta: "¿Te ayudo a encontrar la solución para tu negocio?", dudas: ["precio", "planes", "tiempo", "pago", "mensual", "baja"], funciones: [] },
  web: {
    saludo: "Veo que estás mirando las páginas web. Te ayudo a elegir el nivel que te conviene, o en un par de minutos armamos la tuya.",
    vineta: "¿Te ayudo a elegir tu página?",
    dudas: ["planes", "perfil", "subdominio", "precio", "tiempo", "migrar"],
    funciones: ["web"],
  },
  turnos: {
    saludo: "Estás mirando los turnos online. Te cuento cómo funciona, cuánto sale sola o con tu página, y te dejo una demo con tu rubro.",
    vineta: "¿Te ayudo a organizar tus turnos?",
    dudas: ["paquete", "turnoslimite", "recordatorios", "precio", "capacitacion"],
    funciones: ["turnos"],
  },
  caja: {
    saludo: "Estás mirando la caja. Te ayudo a ver si te sirve la simple o si conviene la pro, y te armo la tuya con tus productos.",
    vineta: "¿Te ayudo con la caja de tu negocio?",
    dudas: ["internet", "cajapro", "factura", "capacitacion", "precio"],
    funciones: ["cajaSimple"],
  },
  resto: {
    saludo: "Estás mirando Al Toque Resto. Te ayudo a elegir entre la carta con la web o el panel completo, y te armo la demo con tu local.",
    vineta: "¿Te ayudo con la web de tu restaurante?",
    dudas: ["resto", "pedidos", "precio", "tiempo", "fotos"],
    funciones: ["web", "menu", "pedidos"],
  },
  tienda: {
    saludo: "La tienda online todavía no está, pero ya podés vender con un catálogo y pedidos por WhatsApp. Si querés, te ayudo con eso.",
    vineta: "¿Querés vender por internet?",
    dudas: ["tienda", "pedidos", "planes", "precio"],
    funciones: ["catalogo", "pedidos"],
  },
};

/** Las dudas en el orden de la página: primero las del contexto, después el resto. */
export function dudasPara(contexto: ContextoAlto): Duda[] {
  const primero = CONTEXTOS[contexto].dudas;
  return [...primero.map((id) => DUDAS.find((d) => d.id === id)!).filter(Boolean), ...DUDAS.filter((d) => !primero.includes(d.id))];
}
