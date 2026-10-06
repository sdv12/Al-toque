import type { ComponentType } from "react";
import { linkWhatsApp } from "@/core/lib/mensajes";
import type { TipoSeccion } from "@/core/registry";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { Cta, Faq, Galeria, Portada, Redes, Servicios, Testimonios, Texto, Ubicacion } from "./bloques/Basicos";
import { Contacto, Disponibilidad, Formulario, Pagos, Turnos } from "./bloques/Interactivos";
import { boton, contenedor, margen } from "./estilos";
import type { Config, PropsBloque } from "./tipos";

const BLOQUES: Record<TipoSeccion<"libre">, ComponentType<PropsBloque>> = {
  portada: Portada,
  texto: Texto,
  servicios: Servicios,
  galeria: Galeria,
  testimonios: Testimonios,
  faq: Faq,
  ubicacion: Ubicacion,
  contacto: Contacto,
  redes: Redes,
  cta: Cta,
  turnos: Turnos,
  disponibilidad: Disponibilidad,
  formulario: Formulario,
  pagos: Pagos,
};

/**
 * "A tu medida": header y footer fijos; en el medio, los bloques que eligió el cliente, en su
 * orden. Sin bloques, la página es una hoja en blanco (solo se ve así en la vista previa).
 */
export function LandingLibre({ config }: { config: Config }) {
  const { negocio } = config;
  const activos = config.secciones.filter((s) => s.activa);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-acento-relleno px-4 py-2 text-sobre-acento focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>
      <header className={`${margen} border-b border-borde bg-superficie`}>
        <div className={`${contenedor} flex h-16 items-center justify-between gap-4`}>
          <a href="#contenido" className="truncate font-display text-subtitulo font-extrabold">
            {negocio.nombre}
          </a>
          <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className={`${boton.primario} min-h-10 shrink-0 px-4 text-chico`}>
            <IconoWhatsApp className="size-4" /> Escribinos
          </a>
        </div>
      </header>

      <main id="contenido" className="min-h-[50vh]">
        {activos.length === 0 ? (
          <div className={`${margen} py-24`}>
            <div className={`${contenedor} grid min-h-72 place-items-center rounded-base border-2 border-dashed border-borde p-8 text-center`}>
              <div>
                <p className="font-display text-titulo font-extrabold">Tu página está en blanco</p>
                <p className="mt-3 text-tinta-suave">Sumá bloques desde el panel y se van acomodando acá, con tu estilo.</p>
              </div>
            </div>
          </div>
        ) : (
          activos.map((b, i) => {
            const Bloque = BLOQUES[b.tipo];
            const anclaId = b.id ?? `${b.tipo}-${i}`;
            return <Bloque key={anclaId} config={config} bloque={b} anclaId={anclaId} />;
          })
        )}
      </main>

      <footer className={`${margen} border-t border-borde bg-superficie py-10`}>
        <div className={`${contenedor} flex flex-wrap items-end justify-between gap-6 text-chico`}>
          <div>
            <p className="font-display text-subtitulo font-extrabold">{negocio.nombre}</p>
            {negocio.direccion && <p className="mt-1 text-tinta-suave">{negocio.direccion}</p>}
            {negocio.horario && <p className="text-tinta-suave">{negocio.horario}</p>}
          </div>
          <div className="flex gap-5 font-semibold">
            {negocio.instagram && (
              <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-acento-texto">
                Instagram
              </a>
            )}
            <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-acento-texto">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>

      {config.whatsappFlotante && (
        <div className="pointer-events-none sticky bottom-0 z-20 flex justify-end p-4">
          <a
            href={linkWhatsApp(negocio.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="pointer-events-auto grid size-14 place-items-center rounded-full bg-acento-relleno text-sobre-acento shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]"
          >
            <IconoWhatsApp className="size-7" />
          </a>
        </div>
      )}
    </>
  );
}
