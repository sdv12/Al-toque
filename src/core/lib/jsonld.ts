import type { Plantilla } from "../registry";
import type { Agenda } from "../schema/comun";
import type { LandingConfig } from "../schema/landing-config";

const TIPO_SCHEMA_ORG: Record<Plantilla, string> = {
  barberia: "BarberShop",
  consultorio: "MedicalClinic",
  alojamiento: "LodgingBusiness",
  generico: "LocalBusiness",
};

const DIAS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

function horarios(agenda: Agenda) {
  return agenda.dias.flatMap(({ dia, franjas }) =>
    franjas.map((f) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DIAS[dia]}`,
      opens: f.desde,
      closes: f.hasta,
    })),
  );
}

/** JSON-LD de LocalBusiness (o subtipo según la plantilla) para el <head> de la landing. */
export function jsonLdNegocio(config: LandingConfig, url?: string): Record<string, unknown> {
  const { negocio } = config;
  const precios = (config.contenido.servicios ?? []).map((s) => s.precio).filter((p): p is number => typeof p === "number" && p > 0);

  return {
    "@context": "https://schema.org",
    "@type": TIPO_SCHEMA_ORG[config.plantilla],
    name: negocio.nombre,
    description: negocio.subtitulo || negocio.eslogan,
    telephone: `+${negocio.whatsapp}`,
    ...(url ? { url } : {}),
    ...(negocio.direccion
      ? { address: { "@type": "PostalAddress", streetAddress: negocio.direccion, addressRegion: "Córdoba", addressCountry: "AR" } }
      : {}),
    ...(negocio.instagram ? { sameAs: [`https://instagram.com/${negocio.instagram}`] } : {}),
    ...(config.agenda ? { openingHoursSpecification: horarios(config.agenda) } : {}),
    ...(precios.length ? { priceRange: `$${Math.min(...precios)} - $${Math.max(...precios)}`, currenciesAccepted: "ARS" } : {}),
  };
}
