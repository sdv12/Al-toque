import type { Metadata } from "next";
import Link from "next/link";
import { ACTUALIZACION_PRECIOS } from "@/core/lib/precios";
import { OFICIAL, TITULAR } from "../legales/datos";
import { Documento, Oficial, type Seccion } from "../legales/Documento";

export const metadata: Metadata = {
  title: "Términos y condiciones · Al Toque",
  description: "Condiciones de uso del sitio y de contratación de páginas web, agendas de turnos y cajas (contrato de adhesión, Ley 24.240).",
  alternates: { canonical: "/terminos" },
};

const t = TITULAR;
const meses = ACTUALIZACION_PRECIOS.cadaMeses;

const SECCIONES: Seccion[] = [
  {
    id: "titular",
    titulo: "Quiénes somos",
    cuerpo: (
      <>
        <p>
          «{t.marca}» (en adelante, <strong>«nosotros»</strong>) es un servicio de {t.nombre}, CUIT {t.cuit}, {t.condicionIva}, con domicilio en {t.domicilio}.
          Correo de contacto: <a href={`mailto:${t.email}`}>{t.email}</a>. Sitio: {t.sitio}.
        </p>
      </>
    ),
  },
  {
    id: "aceptacion",
    titulo: "Qué es este documento y cuándo lo aceptás",
    cuerpo: (
      <>
        <p>
          Estos Términos y condiciones son el contrato de adhesión (Ley 24.240 de Defensa del Consumidor) que rige el uso del sitio y la contratación de
          nuestros servicios. Junto con la <Link href="/privacidad">Política de privacidad</Link> y el presupuesto que te mandemos por escrito, forman el
          acuerdo completo entre vos (<strong>«el Cliente»</strong>) y nosotros.
        </p>
        <p>
          Los aceptás cuando usás el sitio, cuando enviás un pedido o una consulta (desde el configurador, la caja, la agenda o Alto) y, sobre todo, cuando
          aceptás un presupuesto o hacés un pago. Si algo del presupuesto contradice estos términos, vale lo del presupuesto para ese trabajo.
        </p>
        <p>
          Para contratar tenés que ser mayor de 18 años y tener capacidad legal. Si contratás en nombre de un negocio, una sociedad o un tercero, declarás que
          tenés facultades para hacerlo.
        </p>
      </>
    ),
  },
  {
    id: "definiciones",
    titulo: "Definiciones",
    cuerpo: (
      <ul>
        <li>
          <strong>Página web o landing:</strong> el sitio del Cliente armado con una de nuestras plantillas o «a tu medida», publicado en una dirección
          nuestra o en el dominio del Cliente.
        </li>
        <li>
          <strong>Agenda:</strong> el sistema de turnos online (página de reservas y panel del negocio).
        </li>
        <li>
          <strong>Caja simple:</strong> la aplicación de caja para el mostrador que guarda la información en el dispositivo del Cliente.
        </li>
        <li>
          <strong>Caja pro:</strong> el sistema de gestión con sucursales, usuarios, stock, cuentas corrientes y, si se contrata, facturación electrónica y
          cobros con QR.
        </li>
        <li>
          <strong>Sistema:</strong> cualquier servicio que guarda datos en un servidor (agenda real, caja pro, recordatorios, panel, seña online).
        </li>
        <li>
          <strong>Pago único:</strong> lo que se paga una vez por armar y poner en marcha el servicio. <strong>Abono mensual:</strong> lo que se paga cada mes
          para mantenerlo funcionando.
        </li>
        <li>
          <strong>Demo:</strong> las páginas, cajas y agendas de ejemplo del sitio, el configurador y las pruebas «con tus datos».
        </li>
        <li>
          <strong>Alto:</strong> el asistente automático del sitio.
        </li>
      </ul>
    ),
  },
  {
    id: "servicios",
    titulo: "Los servicios y lo que incluyen",
    cuerpo: (
      <>
        <p>El alcance exacto de cada trabajo es el del presupuesto aceptado. En general:</p>
        <ul>
          <li>
            <strong>Página web:</strong> armado sobre la plantilla elegida con los textos, fotos, colores y datos que nos des; adaptación a celular;
            certificado de seguridad; vista previa al compartir el link; botón de WhatsApp.
          </li>
          <li>
            <strong>Agenda:</strong> carga inicial de servicios, horarios y diseño; página de reservas; panel con agenda, caja, números y clientes.
          </li>
          <li>
            <strong>Caja simple:</strong> carga inicial de productos y precios, módulos contratados y una explicación de uso.
          </li>
          <li>
            <strong>Caja pro:</strong> configuración de sucursales, usuarios y permisos, carga inicial y puesta en marcha de los módulos contratados.
          </li>
        </ul>
        <p>
          <strong>No incluyen</strong>, salvo que figure en el presupuesto: diseño de logo, redacción de textos extensos, fotografía, tienda online con
          envíos, campañas de publicidad, gestión de redes sociales, posicionamiento garantizado en buscadores, carga masiva de datos fuera de lo acordado ni
          integraciones con sistemas de terceros no mencionados.
        </p>
      </>
    ),
  },
  {
    id: "demos",
    titulo: "Demos, configurador y Alto",
    cuerpo: (
      <>
        <p>
          Las demos son de prueba: usan datos de ejemplo, guardan lo que cargues solo en tu navegador y se pueden borrar en cualquier momento (por ejemplo,
          al limpiar el navegador). No las uses para guardar información real de tu negocio: no garantizamos su conservación.
        </p>
        <p>
          Las facturas, los CAE y los códigos QR de las demos son simulados y <strong>no tienen validez fiscal</strong>. Los negocios, personas y datos de
          las demos son inventados.
        </p>
        <p>
          Alto es un asistente automático que funciona con reglas; no es una persona ni usa inteligencia artificial. Sus recomendaciones y los precios que
          muestra son orientativos y <strong>no constituyen una oferta vinculante</strong>: el precio final es el del presupuesto escrito.
        </p>
      </>
    ),
  },
  {
    id: "precios",
    titulo: "Precios, presupuesto y actualización",
    cuerpo: (
      <>
        <p>
          Los precios del sitio son de referencia, en pesos argentinos. Antes de empezar te mandamos un presupuesto por escrito (correo o WhatsApp) con el
          alcance, el pago único, el abono mensual y el plazo estimado. El presupuesto vale por 15 días corridos.
        </p>
        <p>Los precios se informan según nuestra condición frente al IVA ({t.condicionIva}).</p>
        <p>
          Los precios de lista y los abonos se actualizan cada {meses} meses (el 1 de enero, abril, julio y octubre). A quienes ya tienen un abono les
          avisamos el nuevo valor con al menos 30 días de anticipación; si no estás de acuerdo, podés darte de baja sin costo antes de que rija.
        </p>
      </>
    ),
  },
  {
    id: "contratacion",
    titulo: "Cómo se contrata",
    cuerpo: (
      <ol>
        <li>Nos mandás tu pedido o consulta (con su número de pedido).</li>
        <li>Te enviamos el presupuesto por escrito.</li>
        <li>Lo aceptás por escrito (un «acepto» por correo o WhatsApp alcanza) y abonás el anticipo.</li>
        <li>Empezamos a trabajar con los materiales que nos des.</li>
        <li>Te mostramos la versión para revisar, hacés tus comentarios y, con el pago total, la publicamos.</li>
      </ol>
    ),
  },
  {
    id: "pagos",
    titulo: "Pagos",
    cuerpo: (
      <>
        <ul>
          <li>
            <strong>Pago único:</strong> 50 % de anticipo para empezar y el saldo antes de publicar. La publicación, la entrega final y el traspaso del
            dominio se hacen con el pago completo.
          </li>
          <li>
            <strong>Abono mensual:</strong> por adelantado, del 1 al 10 de cada mes. El primer abono se paga al publicar.
          </li>
          <li>Medios: transferencia bancaria o Mercado Pago (u otros que acordemos). Te enviamos la factura correspondiente.</li>
        </ul>
      </>
    ),
  },
  {
    id: "mora",
    titulo: "Falta de pago y suspensión",
    cuerpo: (
      <>
        <p>
          Si un abono vence sin pagarse te avisamos por correo o WhatsApp. Si pasados <strong>15 días corridos</strong> del vencimiento sigue impago, y con
          un aviso previo de al menos 5 días, podemos suspender la página o el sistema hasta que se regularice. Mientras dura la suspensión conservamos tu
          contenido y tus datos.
        </p>
        <p>
          Si la deuda sigue <strong>60 días corridos</strong> después de la suspensión, damos el servicio por terminado: te ofrecemos tu contenido y tus datos
          exportables y después los borramos. Las sumas adeudadas pueden devengar un interés moratorio equivalente a la tasa activa del Banco de la Nación
          Argentina.
        </p>
      </>
    ),
  },
  {
    id: "plazos",
    titulo: "Plazos de entrega y materiales",
    cuerpo: (
      <>
        <p>
          El plazo del presupuesto es estimado y corre desde que tenemos el anticipo y los materiales necesarios (textos, fotos, logo, precios, datos de
          contacto, accesos).
        </p>
        <p>
          Si los materiales o las respuestas que necesitamos se demoran más de <strong>30 días corridos</strong>, pausamos el trabajo. Si pasan{" "}
          <strong>90 días corridos</strong> sin novedades, damos el trabajo por concluido en el estado en que esté: lo abonado queda como pago del trabajo
          hecho hasta ese momento y lo podemos retomar con un nuevo presupuesto.
        </p>
      </>
    ),
  },
  {
    id: "revisiones",
    titulo: "Revisiones, aprobación y cambios",
    cuerpo: (
      <>
        <p>
          Antes de publicar incluimos <strong>dos rondas de ajustes</strong> sobre lo presupuestado. Los cambios que van más allá del alcance acordado (por
          ejemplo, cambiar de plantilla, sumar secciones o funciones) se cotizan aparte.
        </p>
        <p>
          Si te entregamos la versión final y no recibimos observaciones en <strong>7 días corridos</strong>, se considera aprobada y la publicamos (con el
          pago completo).
        </p>
      </>
    ),
  },
  {
    id: "abono",
    titulo: "Qué incluye el abono mensual",
    cuerpo: (
      <>
        <ul>
          <li>Alojamiento (hosting), certificado de seguridad y mantenimiento técnico.</li>
          <li>Actualizaciones de seguridad y mejoras generales de la plataforma.</li>
          <li>En los sistemas: la base de datos y sus copias de resguardo.</li>
          <li>
            Cambios chicos: textos, precios, horarios, fotos o datos de contacto, hasta una hora de trabajo por mes (no acumulable). Lo que exceda se
            cotiza.
          </li>
          <li>Soporte por correo o WhatsApp en días hábiles, de 9 a 18; respondemos dentro de las 48 horas hábiles.</li>
        </ul>
        <p>No incluye rediseños, funciones nuevas, carga masiva de contenido ni el costo de servicios de terceros que figuren aparte (por ejemplo, el dominio).</p>
      </>
    ),
  },
  {
    id: "dominio",
    titulo: "Dominio",
    cuerpo: (
      <p>
        Si contratás un dominio (por ejemplo, tunegocio.com.ar), se registra <strong>a nombre del Cliente</strong> en NIC Argentina u otro registrador. El alta
        y la configuración están incluidas si se presupuestan; la renovación anual corre por cuenta del Cliente. Te avisamos antes del vencimiento cuando lo
        gestionemos nosotros, pero no respondemos por la pérdida del dominio por falta de renovación o por datos del titular desactualizados.
      </p>
    ),
  },
  {
    id: "terceros",
    titulo: "Disponibilidad y servicios de terceros",
    cuerpo: (
      <>
        <p>
          Trabajamos para que todo funcione sin interrupciones, pero no podemos garantizar una disponibilidad del 100 %. Puede haber mantenimientos
          (avisamos los programados) y fallas de proveedores.
        </p>
        <p>
          Usamos servicios de terceros como Netlify (alojamiento y formularios), Supabase (bases de datos), Google Fonts (tipografías), WhatsApp de Meta,
          Mercado Pago, ARCA y NIC Argentina. No respondemos por sus caídas, cambios de condiciones o de precios, pero te ayudamos a gestionar el reclamo y
          buscamos alternativas.
        </p>
      </>
    ),
  },
  {
    id: "cliente",
    titulo: "Responsabilidades del Cliente",
    cuerpo: (
      <ul>
        <li>
          Que el contenido que nos das (textos, fotos, logos, precios, promociones, reseñas) sea veraz y que tengas derecho a usarlo. Sos responsable por
          lo que se publica a tu pedido.
        </li>
        <li>
          Cumplir las normas de tu actividad: habilitaciones, matrículas, reglas de publicidad de tu profesión, información de precios
          y las obligaciones con tus propios clientes como consumidores.
        </li>
        <li>
          Cumplir la Ley 25.326 con los datos de tus clientes que se guarden en tu agenda, caja o formularios: sos el responsable de esa base de datos.
        </li>
        <li>Cuidar tus accesos (usuarios, contraseñas, PIN) y avisarnos enseguida si sospechás un uso no autorizado.</li>
        <li>Mantener tus datos de contacto y de facturación al día.</li>
        <li>Cumplir tus obligaciones fiscales; los sistemas son herramientas y no te reemplazan ante ARCA ni ante otros organismos.</li>
      </ul>
    ),
  },
  {
    id: "prohibido",
    titulo: "Usos prohibidos",
    cuerpo: (
      <p>
        No se puede usar el sitio ni los servicios para actividades ilícitas, engañosas o que violen derechos de terceros; para enviar spam; para publicar
        contenido discriminatorio, violento o sexual explícito; para intentar vulnerar la seguridad, sobrecargar o copiar la plataforma; ni para revender
        los servicios sin un acuerdo previo por escrito. Ante un uso así podemos suspender el servicio de inmediato.
      </p>
    ),
  },
  {
    id: "propiedad",
    titulo: "Propiedad intelectual",
    cuerpo: (
      <>
        <p>
          Las plantillas, el diseño, el código, el configurador, las cajas, la agenda, Alto y la marca son nuestros o de nuestros licenciantes. Mientras el
          servicio esté vigente y al día, te damos una <strong>licencia de uso no exclusiva e intransferible</strong> para tu página o sistema. No incluye
          el derecho a copiar, modificar o redistribuir el código; si lo necesitás, lo cotizamos.
        </p>
        <p>
          Tu contenido (textos, fotos, logo, datos) es tuyo: nos das permiso para usarlo solo para prestarte el servicio. Al terminar el servicio te
          entregamos tu contenido y tus datos en un formato exportable.
        </p>
        <p>Salvo que nos pidas lo contrario por escrito, podemos mostrar tu página como ejemplo de nuestro trabajo.</p>
      </>
    ),
  },
  {
    id: "datos",
    titulo: "Datos personales y encargado de tratamiento",
    cuerpo: (
      <>
        <p>
          Cómo tratamos tus datos está en la <Link href="/privacidad">Política de privacidad</Link>.
        </p>
        <p>
          Cuando un sistema guarda datos de tus clientes (turnos, ventas, cuentas corrientes), vos sos el responsable de esa base y nosotros actuamos como{" "}
          <strong>encargados del tratamiento</strong> (art. 25 de la Ley 25.326): usamos esos datos solo para prestarte el servicio y según tus
          instrucciones, los mantenemos confidenciales y con medidas de seguridad razonables, no los cedemos a terceros (salvo a los proveedores técnicos
          necesarios) y, al terminar el servicio, te los devolvemos o los destruimos.
        </p>
      </>
    ),
  },
  {
    id: "cajas",
    titulo: "Cajas: avisos importantes",
    cuerpo: (
      <ul>
        <li>
          La <strong>caja simple</strong> guarda la información en el dispositivo donde se usa. Si el dispositivo se rompe, se pierde o se borra el
          navegador, la información puede perderse: es responsabilidad del Cliente resguardarla (por ejemplo, con el respaldo en la nube cuando esté
          disponible).
        </li>
        <li>
          La caja simple <strong>no es un controlador fiscal ni emite comprobantes válidos</strong>: es una herramienta de gestión.
        </li>
        <li>
          En la <strong>caja pro</strong> con facturación, los comprobantes se emiten con el CUIT, el punto de venta y el certificado del Cliente. El Cliente
          es responsable de su situación fiscal y de los datos con los que factura; nosotros, del correcto funcionamiento de la herramienta.
        </li>
        <li>Los cobros con Mercado Pago u otros medios se rigen también por las condiciones de esos proveedores, que fijan sus propias comisiones.</li>
      </ul>
    ),
  },
  {
    id: "agenda",
    titulo: "Agenda: avisos importantes",
    cuerpo: (
      <p>
        El Cliente es responsable de la atención, de sus horarios, de las cancelaciones y de las condiciones que informa a sus clientes. Los recordatorios
        por WhatsApp y las señas online dependen de servicios de terceros. Mientras la agenda funcione sin base de datos (beta), las reservas se confirman por
        WhatsApp.
      </p>
    ),
  },
  {
    id: "arrepentimiento",
    titulo: "Derecho de arrepentimiento",
    cuerpo: (
      <>
        <p>
          Si contratás como consumidor por internet, podés revocar la aceptación <strong>dentro de los 10 días corridos</strong> desde que se celebró el
          contrato, sin dar explicaciones y sin costo (art. 34 de la Ley 24.240 y art. 1110 del Código Civil y Comercial). Te devolvemos lo que hayas
          pagado.
        </p>
        <p>
          Lo podés hacer desde el <Link href="/arrepentimiento">Botón de arrepentimiento</Link>, sin registrarte: te damos un código de identificación de tu
          solicitud en el momento y te lo confirmamos por el mismo medio dentro de las 24 horas.
        </p>
        <p>Para cuidar este derecho, empezamos a trabajar cuando pasaron esos 10 días, salvo que nos pidas por escrito empezar antes.</p>
      </>
    ),
  },
  {
    id: "baja",
    titulo: "Baja del servicio",
    cuerpo: (
      <>
        <p>
          Podés dar de baja el abono cuando quieras, sin penalidad, por el mismo medio por el que contrataste o desde el{" "}
          <Link href="/baja">Botón de baja</Link> (art. 10 ter de la Ley 24.240). La baja rige al terminar el período ya pagado; no se cobran meses futuros.
        </p>
        <p>
          Al darte de baja te entregamos tu contenido y tus datos en un formato exportable. Los guardamos 30 días por si cambiás de idea y después los
          borramos, salvo lo que debamos conservar por ley (por ejemplo, datos de facturación).
        </p>
      </>
    ),
  },
  {
    id: "responsabilidad",
    titulo: "Garantía y límite de responsabilidad",
    cuerpo: (
      <>
        <p>
          Si algo de lo que hicimos no funciona como se acordó, lo corregimos sin cargo. No garantizamos resultados comerciales (ventas, turnos, posición en
          buscadores), que dependen de muchos factores ajenos.
        </p>
        <p>
          Cuando el Cliente contrata para su actividad comercial o profesional, nuestra responsabilidad total por cualquier reclamo se limita al monto que nos
          haya pagado en los 12 meses anteriores al hecho, y no respondemos por lucro cesante ni por daños indirectos.
        </p>
        <p>
          <strong>Nada de esta sección limita los derechos que la ley reconoce a los consumidores</strong> (que no pueden renunciarse, art. 37 de la Ley
          24.240), ni nuestra responsabilidad por dolo o culpa grave.
        </p>
      </>
    ),
  },
  {
    id: "indemnidad",
    titulo: "Indemnidad",
    cuerpo: (
      <p>
        El Cliente se compromete a mantenernos indemnes ante reclamos de terceros originados en el contenido que nos proveyó, en el uso que haga de los
        servicios o en el incumplimiento de estos términos o de la normativa de su actividad.
      </p>
    ),
  },
  {
    id: "fuerza-mayor",
    titulo: "Caso fortuito y fuerza mayor",
    cuerpo: <p>Ninguna de las partes responde por demoras o incumplimientos causados por hechos ajenos e imprevisibles (art. 1730 del Código Civil y Comercial), mientras duren.</p>,
  },
  {
    id: "confidencialidad",
    titulo: "Confidencialidad",
    cuerpo: <p>Tratamos como confidencial la información de tu negocio que no sea pública (accesos, datos de clientes, números) y solo la usamos para prestarte el servicio.</p>,
  },
  {
    id: "comunicaciones",
    titulo: "Comunicaciones",
    cuerpo: (
      <p>
        Las comunicaciones entre las partes son válidas por correo electrónico y por WhatsApp, a las direcciones y números informados al contratar. Cada parte
        debe avisar si cambian.
      </p>
    ),
  },
  {
    id: "cambios",
    titulo: "Cambios en estos términos",
    cuerpo: (
      <p>
        Podemos actualizar estos términos; la versión vigente está siempre en esta página, con su fecha. A los clientes con abono les avisamos los cambios
        importantes con 30 días de anticipación y, si no están de acuerdo, pueden darse de baja sin costo. Los trabajos ya presupuestados se rigen por la
        versión vigente al aceptarlos.
      </p>
    ),
  },
  {
    id: "ley",
    titulo: "Ley aplicable y jurisdicción",
    cuerpo: (
      <p>
        Se aplica la ley de la República Argentina. Si sos consumidor, es competente el juez del lugar donde recibiste o debías recibir el servicio, y
        cualquier pacto en contrario no vale (art. 1109 del Código Civil y Comercial). En los demás casos, las partes se someten a {t.jurisdiccion}.
      </p>
    ),
  },
  {
    id: "reclamos",
    titulo: "Consultas y reclamos",
    cuerpo: (
      <>
        <p>
          Escribinos primero a <a href={`mailto:${t.email}`}>{t.email}</a>: casi todo se resuelve hablando.
        </p>
        <p>
          <Oficial href={OFICIAL.defensaConsumidor}>Defensa de las y los Consumidores. Para reclamos ingrese aquí</Oficial>. También podés acudir a la
          Dirección de Defensa del Consumidor de la Provincia de Córdoba o al organismo de tu localidad.
        </p>
      </>
    ),
  },
];

export default function Terminos() {
  return (
    <Documento
      actual="/terminos"
      titulo="Términos y condiciones"
      bajada={
        <p>
          Contrato de adhesión (Ley 24.240). Están escritos en simple a propósito: si algo no se entiende, preguntanos antes de contratar.
        </p>
      }
      secciones={SECCIONES}
    />
  );
}
