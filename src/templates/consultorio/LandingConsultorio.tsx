import type { ComponentType } from "react";
import { linkWhatsApp } from "@/core/lib/mensajes";
import type { TipoSeccion } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { boton } from "./estilos";
import { BotonPedirTurno, Indice } from "./interactivos";
import { Faq, ObrasSociales, PrimeraConsulta, Prestaciones, Profesionales, Ubicacion } from "./secciones/Informacion";
import { Portada } from "./secciones/Portada";
import { TurnosProvider } from "./turnos/TurnosContext";

type Config = ConfigDe<"consultorio">;
type PropsSeccion = { config: Config; variante: string };
type Informativa = Exclude<TipoSeccion<"consultorio">, "portada">;

const SECCIONES: Record<Informativa, { componente: ComponentType<PropsSeccion>; id: string; etiqueta: string }> = {
  prestaciones: { componente: Prestaciones as ComponentType<PropsSeccion>, id: "prestaciones", etiqueta: "Prestaciones" },
  profesionales: { componente: Profesionales as ComponentType<PropsSeccion>, id: "profesionales", etiqueta: "Profesionales" },
  obrasSociales: { componente: ObrasSociales as ComponentType<PropsSeccion>, id: "obras-sociales", etiqueta: "Obras sociales" },
  primeraConsulta: { componente: PrimeraConsulta as ComponentType<PropsSeccion>, id: "primera-consulta", etiqueta: "Primera consulta" },
  faq: { componente: Faq as ComponentType<PropsSeccion>, id: "preguntas", etiqueta: "Preguntas frecuentes" },
  ubicacion: { componente: Ubicacion as ComponentType<PropsSeccion>, id: "ubicacion", etiqueta: "Cómo llegar" },
};

/**
 * "Clínica clara": booking-first. El widget de turnos vive en la portada; debajo, una sola
 * columna de información con índice lateral sticky (desktop). Barra superior fija con
 * "Pedir turno" para volver al widget desde cualquier punto.
 */
export function LandingConsultorio({ config }: { config: Config }) {
  const { negocio } = config;
  const activas = config.secciones.filter((s) => s.activa);
  const portada = activas.find((s) => s.tipo === "portada");
  const informativas = activas.flatMap((s) => (s.tipo === "portada" ? [] : [{ ...SECCIONES[s.tipo], tipo: s.tipo, variante: s.variante }]));
  const profesionales = (config.contenido.equipo ?? []).filter((p) => p.matricula);

  return (
    <TurnosProvider config={config}>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-acento-relleno px-4 py-2 text-sobre-acento focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-30 border-b border-borde bg-superficie/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 @4xl:px-10">
          <a href="#inicio" className="min-w-0 truncate font-bold">
            {negocio.nombre}
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={linkWhatsApp(negocio.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 items-center gap-2 px-3 text-chico font-semibold text-tinta-suave hover:text-tinta @2xl:inline-flex"
            >
              <IconoWhatsApp className="size-5" /> WhatsApp
            </a>
            <BotonPedirTurno className={`${boton.primario} min-h-10 px-4 py-2 text-chico`}>Pedir turno</BotonPedirTurno>
          </div>
        </div>
      </header>

      <main id="contenido">
        {portada && <Portada config={config} variante={portada.variante as "turnos-lateral" | "turnos-central"} />}

        {informativas.length > 0 && (
          <div className="mx-auto max-w-6xl px-5 py-14 @4xl:px-10 @5xl:grid @5xl:grid-cols-[12rem_minmax(0,1fr)] @5xl:gap-16">
            <aside className="hidden @5xl:block">
              <Indice items={informativas.map(({ id, etiqueta }) => ({ id, etiqueta }))} />
            </aside>
            <div className="max-w-[46rem]">
              {informativas.map(({ componente: Seccion, tipo, variante }) => (
                <Seccion key={tipo} config={config} variante={variante} />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-borde bg-superficie">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-chico @3xl:grid-cols-2 @4xl:px-10">
          <div>
            <p className="font-bold">{negocio.nombre}</p>
            <p className="mt-1 text-tinta-suave">{negocio.direccion}</p>
            <p className="text-tinta-suave">{negocio.horario}</p>
            {negocio.instagram && (
              <p className="mt-3">
                <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-acento-texto">
                  @{negocio.instagram} en Instagram
                </a>
              </p>
            )}
          </div>
          {profesionales.length > 0 && (
            <ul className="space-y-1 text-tinta-suave @3xl:text-right">
              {profesionales.map((p) => (
                <li key={p.id}>
                  {p.nombre} · {p.matricula}
                </li>
              ))}
            </ul>
          )}
        </div>
      </footer>

      {config.whatsappFlotante && (
        // Sticky al final del documento: queda abajo a la derecha mientras se recorre la página.
        <div className="pointer-events-none sticky bottom-0 z-20 flex justify-end p-4">
          <a
            href={linkWhatsApp(negocio.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="pointer-events-auto grid size-14 place-items-center rounded-full bg-acento-relleno text-sobre-acento shadow-[0_8px_24px_-8px_rgb(21_34_45/0.5)] hover:brightness-110"
          >
            <IconoWhatsApp className="size-7" />
          </a>
        </div>
      )}
    </TurnosProvider>
  );
}
