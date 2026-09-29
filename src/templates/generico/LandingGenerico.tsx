import type { ComponentType } from "react";
import { linkWhatsApp } from "@/core/lib/mensajes";
import type { TipoSeccion } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { margen } from "./estilos";
import { Bento } from "./secciones/Bento";
import { Casos, Contacto, Faq, Servicios, Testimonios } from "./secciones/Secciones";

type Config = ConfigDe<"generico">;
type PropsSeccion = { config: Config; variante: string };

const SECCIONES: Record<TipoSeccion<"generico">, ComponentType<PropsSeccion>> = {
  bento: Bento as ComponentType<PropsSeccion>,
  casos: Casos as ComponentType<PropsSeccion>,
  servicios: Servicios as ComponentType<PropsSeccion>,
  testimonios: Testimonios as ComponentType<PropsSeccion>,
  contacto: Contacto as ComponentType<PropsSeccion>,
  faq: Faq as ComponentType<PropsSeccion>,
};

const NAV: Partial<Record<TipoSeccion<"generico">, { id: string; etiqueta: string }>> = {
  casos: { id: "casos", etiqueta: "Trabajos" },
  servicios: { id: "servicios", etiqueta: "Servicios" },
  contacto: { id: "contacto", etiqueta: "Contacto" },
};

/**
 * "Portfolio modular": la home es un bento que resume todo (presentación, trabajo destacado,
 * servicios, testimonio, contacto); después, trabajos como casos y un contacto corto que
 * termina en WhatsApp. Grotesca expresiva y un solo acento fuerte.
 */
export function LandingGenerico({ config }: { config: Config }) {
  const { negocio } = config;
  const activas = config.secciones.filter((s) => s.activa);
  const nav = activas.flatMap((s) => (NAV[s.tipo] ? [NAV[s.tipo]!] : []));

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-acento-relleno px-4 py-2 text-sobre-acento focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>

      <header className={`${margen} flex h-16 items-center justify-between gap-4`}>
        <a href="#inicio" className="truncate font-display text-subtitulo font-bold">
          {negocio.nombre}
        </a>
        <nav aria-label="Secciones">
          <ul className="flex items-center gap-1 @2xl:gap-2">
            {nav.map((n) => (
              <li key={n.id} className={n.id === "contacto" ? "" : "hidden @2xl:block"}>
                <a
                  href={`#${n.id}`}
                  className={
                    n.id === "contacto"
                      ? "inline-flex min-h-10 items-center rounded-control bg-tinta px-4 text-chico font-semibold text-fondo hover:bg-acento-relleno hover:text-sobre-acento"
                      : "inline-flex min-h-10 items-center px-3 text-chico font-semibold hover:text-acento-texto"
                  }
                >
                  {n.etiqueta}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="contenido">
        {activas.map((s) => {
          const Seccion = SECCIONES[s.tipo];
          return <Seccion key={s.tipo} config={config} variante={s.variante} />;
        })}
      </main>

      <footer className={`${margen} overflow-hidden pb-8 pt-16`}>
        <div className="flex flex-wrap justify-between gap-4 border-t-2 border-tinta pt-6 text-chico">
          <p>
            {negocio.direccion} · {negocio.horario}
          </p>
          <p className="flex gap-5">
            {negocio.instagram && (
              <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-acento-texto">
                Instagram
              </a>
            )}
            <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-acento-texto">
              WhatsApp
            </a>
          </p>
        </div>
        <p aria-hidden className="mt-10 whitespace-nowrap font-display text-[clamp(3.5rem,17cqi,15rem)] font-extrabold leading-[0.8] tracking-[-0.05em]">
          {negocio.nombre}
        </p>
      </footer>

      {config.whatsappFlotante && (
        <div className="pointer-events-none sticky bottom-0 z-20 flex justify-end p-4">
          <a
            href={linkWhatsApp(negocio.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-control bg-tinta px-5 font-semibold text-fondo shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] hover:bg-acento-relleno hover:text-sobre-acento"
          >
            <IconoWhatsApp className="size-5" /> WhatsApp
          </a>
        </div>
      )}
    </>
  );
}
