import type { ConfigDe } from "../schema/landing-config";

/** Estudio inventado para la demo y el configurador. Sin promesas de resultado: lo pide la ética profesional. */
export const juridicoDefault: ConfigDe<"juridico"> = {
  version: 2,
  plantilla: "juridico",
  estilo: { acento: "#22385c", esquinas: "recto", modo: "claro" },
  negocio: {
    nombre: "Lagos & Varela",
    eslogan: "Tu caso, explicado en palabras claras.",
    subtitulo:
      "Estudio jurídico en el centro de Córdoba. Familia, trabajo, consumo y contratos: te escuchamos, te contamos qué opciones tenés y cuánto puede costar antes de empezar.",
    whatsapp: "5493515550192",
    direccion: "Caseros 344, piso 5 B, Centro, Córdoba",
    horario: "Lunes a viernes de 9 a 13 y de 16 a 19 h",
    redes: [
      { red: "instagram", url: "https://instagram.com/lagosvarela.abogados" },
      { red: "linkedin", url: "https://linkedin.com/company/lagos-varela-abogados" },
    ],
  },
  agenda: {
    dias: [1, 2, 3, 4, 5].map((dia) => ({
      dia,
      franjas: [
        { desde: "09:00", hasta: "13:00" },
        { desde: "16:00", hasta: "19:00" },
      ],
    })),
    intervaloMin: 30,
    anticipacionMinHoras: 12,
    diasHaciaAdelante: 21,
  },
  secciones: [
    { tipo: "portada", variante: "clasico", activa: true },
    { tipo: "areas", variante: "diseno", activa: true },
    { tipo: "equipo", variante: "diseno", activa: true },
    { tipo: "proceso", variante: "diseno", activa: true },
    { tipo: "reunion", variante: "diseno", activa: true },
    { tipo: "preguntas", variante: "diseno", activa: true },
    { tipo: "contacto", variante: "diseno", activa: true },
  ],
  contenido: {
    servicios: [
      { id: "familia", nombre: "Familia y divorcios", descripcion: "Divorcios, cuota alimentaria, cuidado personal y régimen de comunicación con los hijos. Buscamos primero el acuerdo.", precio: null, duracionMin: 60, categoria: "Familia", modalidad: "ambas", profesionalIds: ["lagos"] },
      { id: "sucesiones", nombre: "Sucesiones", descripcion: "Declaratoria de herederos, testamentos y partición de bienes, con un presupuesto claro desde el inicio.", precio: null, duracionMin: 45, categoria: "Familia", modalidad: "ambas", profesionalIds: ["lagos", "quinteros"] },
      { id: "laboral", nombre: "Despidos y reclamos laborales", descripcion: "Despidos, trabajo no registrado, diferencias salariales y accidentes de trabajo con la ART.", precio: null, duracionMin: 45, categoria: "Trabajo", modalidad: "ambas", profesionalIds: ["varela"] },
      { id: "consumidor", nombre: "Defensa del consumidor", descripcion: "Reclamos a bancos, tarjetas, prepagas, empresas de servicios y compras online.", precio: null, duracionMin: 30, categoria: "Consumo", modalidad: "virtual", profesionalIds: ["varela"] },
      { id: "contratos", nombre: "Contratos y alquileres", descripcion: "Redacción y revisión de contratos, alquileres, boletos de compraventa y desalojos.", precio: null, duracionMin: 45, categoria: "Civil", modalidad: "ambas", profesionalIds: ["quinteros"] },
      { id: "pymes", nombre: "Pymes y comercios", descripcion: "Asesoramiento continuo para comercios y pequeñas empresas: contratos, empleados y reclamos.", precio: null, duracionMin: 60, categoria: "Empresas", modalidad: "ambas", profesionalIds: ["quinteros", "varela"] },
    ],
    equipo: [
      { id: "lagos", nombre: "Dra. Inés Lagos", rol: "Socia", especialidad: "Familia y sucesiones", matricula: "M.P. 1-30418", bio: "Abogada (UNC) con especialización en derecho de familia. Mediadora. Atiende los casos de familia con la idea de cerrar acuerdos antes de ir a juicio.", agenda: { dias: [1, 3, 5].map((dia) => ({ dia, franjas: [{ desde: "09:00", hasta: "13:00" }] })) } },
      { id: "varela", nombre: "Dr. Tomás Varela", rol: "Socio", especialidad: "Derecho laboral y del consumidor", matricula: "M.P. 1-33906", bio: "Abogado (UNC). Trabaja con trabajadores y consumidores: despidos, ART y reclamos a empresas.", agenda: { dias: [1, 2, 4].map((dia) => ({ dia, franjas: [{ desde: "16:00", hasta: "19:00" }] })) } },
      { id: "quinteros", nombre: "Dra. Carla Quinteros", rol: "Asociada", especialidad: "Civil, contratos e inmobiliario", matricula: "M.P. 1-38215", bio: "Abogada (UCC). Redacta y revisa contratos, alquileres y operaciones inmobiliarias, y asesora a comercios.", agenda: { dias: [2, 3, 4, 5].map((dia) => ({ dia, franjas: [{ desde: "09:00", hasta: "13:00" }] })) } },
    ],
    primeraConsulta: [
      "Pedís la reunión acá o por WhatsApp: en el estudio o por videollamada.",
      "Traé lo que tengas: DNI, contratos, recibos, telegramas o notificaciones.",
      "Te explicamos las alternativas, los tiempos posibles y los costos, sin compromiso de seguir.",
      "Si avanzamos, firmamos un acuerdo de honorarios por escrito y te contamos cada novedad del expediente.",
    ],
    faq: [
      { id: "costo", pregunta: "¿Cuánto cuesta la primera reunión?", respuesta: "Tiene un honorario fijo que te informamos cuando la pedís. Si después avanzamos con el caso, ese monto se descuenta de los honorarios." },
      { id: "virtual", pregunta: "¿Atienden por videollamada?", respuesta: "Sí. La mayoría de las áreas se pueden ver por videollamada y te mandamos el link por WhatsApp. Los expedientes son electrónicos, así que podemos llevar casos de toda la provincia." },
      { id: "traer", pregunta: "¿Qué tengo que llevar?", respuesta: "Tu DNI y todo papel relacionado con el tema: contratos, recibos de sueldo, telegramas, cartas documento, capturas o notificaciones. Si no tenés nada, venís igual y vemos cómo conseguirlo." },
      { id: "plazos", pregunta: "¿Cuánto tarda un juicio?", respuesta: "Depende del tipo de caso y del juzgado. En la reunión te damos un estimado realista; no prometemos resultados ni plazos que no dependen de nosotros." },
      { id: "honorarios", pregunta: "¿Cómo se pagan los honorarios?", respuesta: "Según el caso: un monto fijo por etapa, un porcentaje del resultado (en reclamos laborales, por ejemplo) o un abono mensual para comercios. Siempre queda por escrito antes de empezar." },
    ],
  },
  whatsappFlotante: false,
};
