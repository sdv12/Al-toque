import type { ComponentType } from "react";
import { linkWhatsApp } from "@/core/lib/mensajes";
import type { TipoSeccion } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { DisponibilidadProvider } from "./disponibilidad/DisponibilidadContext";
import { boton, margen } from "./estilos";
import { BarraMovil, BotonVerFechas } from "./interactivos";
import { Disponibilidad } from "./secciones/Disponibilidad";
import { Entorno } from "./secciones/Entorno";
import { Faq } from "./secciones/Faq";
import { Mapa } from "./secciones/Mapa";
import { Recorrido } from "./secciones/Recorrido";
import { Testimonios } from "./secciones/Testimonios";

type Config = ConfigDe<"alojamiento">;
type PropsSeccion = { config: Config; variante: string };

const SECCIONES: Record<TipoSeccion<"alojamiento">, ComponentType<PropsSeccion>> = {
  recorrido: Recorrido as ComponentType<PropsSeccion>,
  mapa: Mapa as ComponentType<PropsSeccion>,
  disponibilidad: Disponibilidad as ComponentType<PropsSeccion>,
  entorno: Entorno as ComponentType<PropsSeccion>,
  testimonios: Testimonios as ComponentType<PropsSeccion>,
  faq: Faq as ComponentType<PropsSeccion>,
};

const NAV: Record<TipoSeccion<"alojamiento">, { id: string; etiqueta: string }> = {
  recorrido: { id: "casas", etiqueta: "Las casas" },
  mapa: { id: "zona", etiqueta: "La zona" },
  disponibilidad: { id: "fechas", etiqueta: "Fechas" },
  entorno: { id: "entorno", etiqueta: "El lugar" },
  testimonios: { id: "huespedes", etiqueta: "Huéspedes" },
  faq: { id: "preguntas", etiqueta: "Preguntas" },
};

/**
 * "Cuaderno de campo": property-first. Arranca recorriendo las casas (pistas horizontales con
 * ficha, fotos y reglas), el mapa ilustrado es protagonista y el calendario de disponibilidad
 * comparte estado con la barra inferior mobile y los botones de cada casa.
 */
export function LandingAlojamiento({ config }: { config: Config }) {
  const activas = config.secciones.filter((s) => s.activa);
  const { negocio } = config;

  return (
    <DisponibilidadProvider config={config}>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-acento-relleno px-4 py-2 text-sobre-acento focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>

      <header className={`${margen} flex items-center justify-between gap-6 border-b-[1.5px] border-dashed border-borde py-4`}>
        <a href="#casas" className="font-display text-subtitulo leading-tight">
          {negocio.nombre}
        </a>
        <nav aria-label="Secciones" className="hidden @4xl:block">
          <ul className="flex items-center gap-6 text-chico">
            {activas
              .filter((s) => s.tipo !== "recorrido")
              .map((s) => (
                <li key={s.tipo}>
                  <a href={`#${NAV[s.tipo].id}`} className="underline-offset-4 hover:text-acento-texto hover:underline">
                    {NAV[s.tipo].etiqueta}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
        {/* En mobile ya está en la barra inferior. */}
        <div className="hidden @4xl:block">
          <BotonVerFechas className={boton.secundario}>Consultar fechas</BotonVerFechas>
        </div>
      </header>

      <main id="contenido">
        {activas.map((s) => {
          const Seccion = SECCIONES[s.tipo];
          return <Seccion key={s.tipo} config={config} variante={s.variante} />;
        })}
      </main>

      <footer className={`${margen} border-t-[1.5px] border-dashed border-borde pb-10 pt-14`}>
        <div className="grid gap-8 @3xl:grid-cols-12">
          <div className="@3xl:col-span-6">
            <p className="font-display text-titulo">{negocio.nombre}</p>
            <p className="mt-2 text-chico text-tinta-suave">{negocio.direccion}</p>
          </div>
          <div className="space-y-2 text-chico @3xl:col-span-5 @3xl:col-start-8">
            <p className="text-tinta-suave">{negocio.horario}</p>
            <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className={boton.enlace}>
              <IconoWhatsApp className="size-4" /> Escribinos por WhatsApp
            </a>
            {negocio.instagram && (
              <p>
                <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className={boton.enlace}>
                  @{negocio.instagram} en Instagram
                </a>
              </p>
            )}
          </div>
        </div>
      </footer>

      <BarraMovil whatsapp={negocio.whatsapp} flotante={config.whatsappFlotante} />
    </DisponibilidadProvider>
  );
}
