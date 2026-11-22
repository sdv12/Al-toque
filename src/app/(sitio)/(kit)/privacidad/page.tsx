import type { Metadata } from "next";
import Link from "next/link";
import { LEYENDA_AAIP, OFICIAL, TITULAR } from "../legales/datos";
import { Documento, Oficial, type Seccion } from "../legales/Documento";

export const metadata: Metadata = {
  title: "Política de privacidad · Al Toque",
  description: "Qué datos personales pedimos, para qué, con quién los compartimos y cómo ejercer tus derechos (Ley 25.326).",
  alternates: { canonical: "/privacidad" },
};

const t = TITULAR;

const SECCIONES: Seccion[] = [
  {
    id: "responsable",
    titulo: "Quién es responsable de tus datos",
    cuerpo: (
      <>
        <p>
          El responsable de la base de datos es {t.nombre} («{t.marca}»), CUIT {t.cuit}, con domicilio en {t.domicilio}. Correo:{" "}
          <a href={`mailto:${t.email}`}>{t.email}</a>.
        </p>
        <p>Base de datos de clientes y consultas inscripta en el Registro Nacional de Bases de Datos: {t.registroBaseDatos}.</p>
      </>
    ),
  },
  {
    id: "que-datos",
    titulo: "Qué datos pedimos y dónde",
    cuerpo: (
      <ul>
        <li>
          <strong>Pedidos del configurador, de /caja, de /resto y de la agenda:</strong> nombre del negocio y los datos que cargues para tu página o sistema (WhatsApp,
          dirección, horarios, servicios, precios, redes, textos).
        </li>
        <li>
          <strong>Alto, el asistente:</strong> las respuestas que elijas, tu nombre, tu WhatsApp y lo que quieras comentarnos.
        </li>
        <li>
          <strong>Lista de espera de Al Toque Tienda:</strong> tu nombre, tu WhatsApp o correo, y lo que nos cuentes de tu negocio, para avisarte
          cuando la tienda esté lista.
        </li>
        <li>
          <strong>Botones de arrepentimiento y de baja:</strong> nombre, correo o WhatsApp, número de pedido y el motivo, si lo contás.
        </li>
        <li>
          <strong>Clientes:</strong> además, los datos de facturación y de pago necesarios para el servicio.
        </li>
        <li>
          <strong>Datos técnicos:</strong> nuestro proveedor de alojamiento registra datos técnicos de las visitas (dirección IP, navegador, páginas
          pedidas) por seguridad y funcionamiento.
        </li>
      </ul>
    ),
  },
  {
    id: "para-que",
    titulo: "Para qué los usamos",
    cuerpo: (
      <ul>
        <li>Responder tu consulta y armarte un presupuesto.</li>
        <li>Prestar el servicio contratado: armar, publicar y mantener tu página o sistema.</li>
        <li>Facturar, cobrar y cumplir obligaciones legales.</li>
        <li>Gestionar arrepentimientos, bajas y reclamos.</li>
        <li>Mantener la seguridad del sitio.</li>
      </ul>
    ),
  },
  {
    id: "obligatorio",
    titulo: "¿Es obligatorio darlos?",
    cuerpo: (
      <p>
        No. Darnos tus datos es voluntario. Sin un medio de contacto no podemos responderte, y sin los datos de tu negocio no podemos armar tu página o tu
        sistema. Si los datos que nos das son inexactos, el servicio puede salir con errores: podés corregirlos cuando quieras.
      </p>
    ),
  },
  {
    id: "destinatarios",
    titulo: "Con quién los compartimos",
    cuerpo: (
      <>
        <p>No vendemos ni cedemos tus datos. Los comparten solo los proveedores que necesitamos para funcionar, que los tratan por cuenta nuestra:</p>
        <ul>
          <li>
            <strong>Netlify, Inc.</strong> (Estados Unidos): alojamiento del sitio y recepción de los formularios (los pedidos y los avisos que nos llegan por
            correo).
          </li>
          <li>
            <strong>Supabase</strong>: bases de datos de los sistemas, cuando se contratan.
          </li>
          <li>
            <strong>Google</strong>: el correo donde recibimos los avisos y las tipografías de la página de turnos de demostración.
          </li>
          <li>
            <strong>WhatsApp (Meta)</strong>: cuando elegís escribirnos por WhatsApp.
          </li>
          <li>Organismos públicos, cuando la ley lo exija.</li>
        </ul>
        <p>
          Algunos de estos proveedores guardan información fuera de la Argentina. Al darnos tus datos prestás tu consentimiento para esa transferencia
          internacional, que hacemos con proveedores que ofrecen medidas de seguridad adecuadas (art. 12 de la Ley 25.326).
        </p>
      </>
    ),
  },
  {
    id: "navegador",
    titulo: "Lo que se guarda en tu navegador",
    cuerpo: (
      <>
        <p>
          <strong>No usamos cookies de seguimiento, publicidad ni analítica.</strong> Para que las demos funcionen, tu navegador guarda información en su
          almacenamiento local (localStorage), que nunca nos llega:
        </p>
        <ul>
          <li>El borrador del configurador y la configuración de la caja de prueba.</li>
          <li>Los datos de ejemplo de las demos de cajas, turnos y restaurantes (incluidas las fotos que subas a la demo).</li>
          <li>Si ya cerraste avisos (precios, bienvenida de Alto) y lo que pensás invertir, si lo elegís en el configurador.</li>
          <li>La página por la que entraste, solo durante la visita.</li>
        </ul>
        <p>
          Cuando mandás un pedido contamos, <strong>sin ningún dato tuyo</strong>, por qué página entraste, desde cuál pediste y qué elegiste: son
          números para saber qué se pide más.
        </p>
        <p>
          La copia de seguridad de la caja o del restaurante es un archivo que guardás vos (en tu equipo, tu WhatsApp, Drive o correo): solo nos llega si nos
          la mandás para publicar tu restaurante.
        </p>
        <p>Lo podés borrar cuando quieras desde la configuración de tu navegador o con «Empezar de cero» en cada demo.</p>
      </>
    ),
  },
  {
    id: "clientes-de-clientes",
    titulo: "Datos de los clientes de nuestros clientes",
    cuerpo: (
      <p>
        Si sos cliente de un negocio que usa nuestra agenda, caja, web de restaurante o formularios (por ejemplo, al reservar una mesa o hacer un pedido),
        el responsable de tus datos es <strong>ese negocio</strong>; nosotros solo
        los procesamos por su cuenta como encargados (art. 25 de la Ley 25.326). Para ejercer tus derechos, dirigite al negocio; si nos escribís, le
        pasamos tu pedido.
      </p>
    ),
  },
  {
    id: "conservacion",
    titulo: "Cuánto tiempo los guardamos",
    cuerpo: (
      <ul>
        <li>Consultas y pedidos que no terminan en contratación: hasta 12 meses.</li>
        <li>Clientes: mientras dure el servicio y, después, solo lo que exijan las normas fiscales y contables, por el plazo que fijan.</li>
        <li>Solicitudes de arrepentimiento, baja y reclamos: el tiempo necesario para resolverlas y acreditar que lo hicimos.</li>
      </ul>
    ),
  },
  {
    id: "seguridad",
    titulo: "Seguridad",
    cuerpo: (
      <p>
        Usamos conexiones cifradas (HTTPS), proveedores con medidas de seguridad reconocidas y acceso restringido a la información. Ningún sistema es
        infalible: si ocurriera un incidente que afecte tus datos, te avisamos.
      </p>
    ),
  },
  {
    id: "derechos",
    titulo: "Tus derechos y cómo ejercerlos",
    cuerpo: (
      <>
        <p>Podés pedirnos en cualquier momento, escribiendo a <a href={`mailto:${t.email}`}>{t.email}</a>:</p>
        <ul>
          <li>
            <strong>Acceso:</strong> saber qué datos tuyos tenemos. Es gratuito si lo pedís a intervalos no menores a seis meses, salvo interés legítimo
            (art. 14 de la Ley 25.326). Respondemos dentro de los 10 días corridos.
          </li>
          <li>
            <strong>Rectificación, actualización y supresión:</strong> corregir o borrar tus datos. Lo hacemos dentro de los 5 días hábiles (art. 16), salvo
            lo que debamos conservar por ley.
          </li>
          <li>
            <strong>Retirar tu consentimiento</strong> y dejar de recibir mensajes nuestros.
          </li>
        </ul>
        <p>Para protegerte, podemos pedirte que acredites que sos el titular de los datos.</p>
      </>
    ),
  },
  {
    id: "aaip",
    titulo: "Órgano de control",
    cuerpo: (
      <>
        <p>{LEYENDA_AAIP}</p>
        <p>
          Más información en la <Oficial href={OFICIAL.aaip}>Agencia de Acceso a la Información Pública</Oficial>.
        </p>
      </>
    ),
  },
  {
    id: "menores",
    titulo: "Menores de edad",
    cuerpo: <p>Nuestros servicios son para mayores de 18 años. No pedimos a sabiendas datos de menores; si nos enteramos de que los recibimos, los borramos.</p>,
  },
  {
    id: "cambios",
    titulo: "Cambios en esta política",
    cuerpo: (
      <p>
        Si la cambiamos, publicamos la nueva versión con su fecha en esta página y, si el cambio es importante, se lo avisamos a nuestros clientes. Ver
        también los <Link href="/terminos">Términos y condiciones</Link>.
      </p>
    ),
  },
];

export default function Privacidad() {
  return (
    <Documento
      actual="/privacidad"
      titulo="Política de privacidad"
      bajada={<p>Qué datos te pedimos, para qué, con quién los compartimos y cómo ejercer tus derechos según la Ley 25.326 de Protección de Datos Personales.</p>}
      secciones={SECCIONES}
    />
  );
}
