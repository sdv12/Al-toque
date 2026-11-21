/*
 * Datos legales del titular del servicio. Los usan los Términos, la Política de privacidad, el
 * botón de arrepentimiento y el de baja. Lo que dice "[A COMPLETAR …]" se ve resaltado en el sitio
 * a propósito: no publicar los textos legales hasta completarlo (lo exige la Ley 24.240, art. 4,
 * y la normativa de comercio electrónico: identificar al proveedor).
 */
export const PENDIENTE = "[A COMPLETAR";

export const TITULAR = {
  /** Nombre y apellido (o razón social) de quien presta el servicio y factura. */
  nombre: "[A COMPLETAR: nombre y apellido o razón social del titular]",
  /** Nombre comercial. */
  marca: "Al Toque",
  cuit: "[A COMPLETAR: CUIT]",
  /** Monotributo o Responsable inscripto: define si los precios incluyen IVA. */
  condicionIva: "[A COMPLETAR: condición frente al IVA]",
  domicilio: "[A COMPLETAR: domicilio legal], Córdoba, Argentina",
  email: "altoque.landing@gmail.com",
  sitio: "https://altoque-cba.com.ar",
  /** Inscripción de la base de datos de clientes y consultas en el Registro Nacional de Bases de Datos (AAIP). */
  registroBaseDatos: "[A COMPLETAR: número de inscripción en el Registro Nacional de Bases de Datos]",
  /** Tribunales para los clientes que no son consumidores (los consumidores eligen su domicilio). */
  jurisdiccion: "los tribunales ordinarios de la ciudad de Córdoba",
};

/** Fecha de la versión vigente de los textos legales (cambiarla al modificarlos). */
export const VIGENCIA = "2026-11-18";

export const fechaVigencia = () =>
  new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${VIGENCIA}T12:00:00Z`));

/** ¿Falta completar algún dato del titular? (lo usa un test y el aviso de las páginas legales). */
export function faltanDatos(): string[] {
  return Object.entries(TITULAR)
    .filter(([, v]) => v.includes(PENDIENTE))
    .map(([k]) => k);
}

/** Organismos y links oficiales que se citan. */
export const OFICIAL = {
  defensaConsumidor: "https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario",
  defensaConsumidorCordoba: "https://www.cba.gov.ar/reparticion/ministerio-de-desarrollo-humano/direccion-de-defensa-del-consumidor-y-lealtad-comercial/",
  aaip: "https://www.argentina.gob.ar/aaip/datospersonales",
};

/** La leyenda de la Agencia de Acceso a la Información Pública (Res. AAIP 14/2018, art. 3): va donde se piden datos. */
export const LEYENDA_AAIP =
  "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.";
