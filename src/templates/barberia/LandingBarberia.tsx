import type { ComponentType } from "react";
import { linkWhatsApp } from "@/core/lib/mensajes";
import type { TipoSeccion } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { boton } from "./estilos";
import { IconoInstagram, IconoWhatsApp } from "./iconos";
import { BotonReservar } from "./reserva/BotonReservar";
import { ReservaProvider } from "./reserva/ReservaContext";
import { Equipo } from "./secciones/Equipo";
import { Faq } from "./secciones/Faq";
import { Galeria } from "./secciones/Galeria";
import { Portada } from "./secciones/Portada";
import { Servicios } from "./secciones/Servicios";
import { Testimonios } from "./secciones/Testimonios";
import { Ubicacion } from "./secciones/Ubicacion";

type Config = ConfigDe<"barberia">;
type PropsSeccion = { config: Config; variante: string };

const SECCIONES: Record<TipoSeccion<"barberia">, ComponentType<PropsSeccion>> = {
  portada: Portada as ComponentType<PropsSeccion>,
  servicios: Servicios as ComponentType<PropsSeccion>,
  equipo: Equipo as ComponentType<PropsSeccion>,
  galeria: Galeria as ComponentType<PropsSeccion>,
  testimonios: Testimonios as ComponentType<PropsSeccion>,
  faq: Faq as ComponentType<PropsSeccion>,
  ubicacion: Ubicacion as ComponentType<PropsSeccion>,
};

const ETIQUETAS_NAV: Partial<Record<TipoSeccion<"barberia">, string>> = {
  servicios: "Precios",
  equipo: "Barberos",
  galeria: "Trabajos",
  testimonios: "Clientes",
  ubicacion: "Horarios",
  faq: "Preguntas",
};

/**
 * "Nocturna editorial": navegación lateral vertical (desktop), barra inferior con Reservar
 * (mobile), secciones en columnas desfasadas y reserva en panel lateral.
 * Todo el responsive usa container queries: responde al ancho de la raíz, no de la ventana.
 */
export function LandingBarberia({ config }: { config: Config }) {
  const activas = config.secciones.filter((s) => s.activa);
  const nav = activas.flatMap((s) => {
    const etiqueta = ETIQUETAS_NAV[s.tipo];
    return etiqueta ? [{ id: s.tipo, etiqueta }] : [];
  });

  return (
    <ReservaProvider config={config}>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-acento-relleno px-4 py-2 text-sobre-acento focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>

      <div className="@4xl:grid @4xl:grid-cols-[5.5rem_minmax(0,1fr)]">
        <NavLateral config={config} nav={nav} />

        <div>
          <main id="contenido">
            {activas.map((s) => {
              const Seccion = SECCIONES[s.tipo];
              return <Seccion key={s.tipo} config={config} variante={s.variante} />;
            })}
          </main>
          <Pie config={config} />
          <BarraMovil config={config} />
        </div>
      </div>
    </ReservaProvider>
  );
}

function NavLateral({ config, nav }: { config: Config; nav: { id: string; etiqueta: string }[] }) {
  return (
    <aside className="sticky top-0 hidden h-[var(--lk-alto-vista,100dvh)] flex-col items-center justify-between border-r border-borde py-8 @4xl:flex">
      <a href="#inicio" className="rotate-180 whitespace-nowrap font-display text-subtitulo italic [writing-mode:vertical-rl] hover:text-acento-texto">
        {config.negocio.nombre}
      </a>

      <nav aria-label="Secciones">
        <ul className="flex flex-col items-center gap-5">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className="block rotate-180 py-1 text-mini text-tinta-suave [writing-mode:vertical-rl] hover:text-tinta"
              >
                {n.etiqueta}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col items-center gap-4">
        {config.whatsappFlotante && (
          <a
            href={linkWhatsApp(config.negocio.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="grid size-11 place-items-center text-tinta-suave hover:text-acento-texto"
          >
            <IconoWhatsApp className="size-6" />
          </a>
        )}
        <BotonReservar className="rounded-control bg-acento-relleno px-3 py-5 text-chico font-medium text-sobre-acento [writing-mode:vertical-rl] rotate-180 hover:brightness-110">
          Reservar
        </BotonReservar>
      </div>
    </aside>
  );
}

/** Mobile: siempre a mano, pegada abajo (sticky, así también funciona dentro del preview). */
function BarraMovil({ config }: { config: Config }) {
  return (
    <div className="sticky bottom-0 z-30 flex items-center gap-3 border-t border-borde bg-fondo/95 px-4 py-3 backdrop-blur @4xl:hidden">
      <a href="#servicios" className="px-2 py-3 text-chico text-tinta-suave">
        Precios
      </a>
      {config.whatsappFlotante && (
        <a
          href={linkWhatsApp(config.negocio.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribinos por WhatsApp"
          className="grid size-11 place-items-center rounded-control border border-borde"
        >
          <IconoWhatsApp className="size-5" />
        </a>
      )}
      <BotonReservar className={`${boton.primario} flex-1`}>Reservar turno</BotonReservar>
    </div>
  );
}

function Pie({ config }: { config: Config }) {
  const { negocio } = config;
  return (
    <footer className="border-t border-borde px-5 pb-10 pt-16 @4xl:px-12">
      <p className="font-display text-titulo italic">{negocio.nombre}</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-mini text-tinta-suave">
        <p>
          {negocio.direccion} · {negocio.horario}
        </p>
        <div className="flex items-center gap-5">
          {negocio.instagram && (
            <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-tinta">
              <IconoInstagram className="size-4" />@{negocio.instagram}
            </a>
          )}
          <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-tinta">
            <IconoWhatsApp className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
