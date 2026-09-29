import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { linkWhatsApp } from "@/core/lib/mensajes";
import { boton, seccion } from "../estilos";
import { IconoInstagram, IconoWhatsApp } from "../iconos";

type Props = { config: ConfigDe<"barberia">; variante: VarianteDe<"barberia", "ubicacion"> };

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// La semana arranca el lunes.
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

const hora = (h: string) => (h.endsWith(":00") ? h.slice(0, 2).replace(/^0/, "") : h.replace(/^0/, ""));

function linkMapa(direccion: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

function Contacto({ config }: { config: ConfigDe<"barberia"> }) {
  const { negocio } = config;
  return (
    <ul className="mt-8 space-y-3 text-chico">
      <li>
        <a href={linkWhatsApp(negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-acento-texto">
          <IconoWhatsApp className="size-5" /> Escribinos por WhatsApp
        </a>
      </li>
      {negocio.instagram && (
        <li>
          <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-acento-texto">
            <IconoInstagram className="size-5" /> @{negocio.instagram}
          </a>
        </li>
      )}
    </ul>
  );
}

export function Ubicacion({ config, variante }: Props) {
  const { negocio, agenda } = config;

  if (variante === "mapa-texto") {
    return (
      <section id="ubicacion" aria-labelledby="ubicacion-titulo" className={seccion}>
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-16">
          <div>
            <h2 id="ubicacion-titulo" className="font-display text-titulo">
              {negocio.direccion}
            </h2>
            <p className="mt-4 text-tinta-suave">{negocio.horario}</p>
            <Contacto config={config} />
          </div>
          <a
            href={linkMapa(negocio.direccion)}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative grid min-h-64 place-items-center overflow-hidden rounded-base border border-borde"
            style={{ background: "var(--lk-placeholder-trama), var(--lk-superficie)" }}
          >
            <span className="rounded-control bg-fondo px-5 py-3 text-chico transition-colors group-hover:text-acento-texto">
              Abrir en Google Maps<span className="sr-only"> (se abre en otra pestaña)</span>
            </span>
          </a>
        </div>
      </section>
    );
  }

  // horario-grande: la semana entera como protagonista
  const semana = agenda
    ? ORDEN_SEMANA.map((d) => ({
        dia: DIAS[d]!,
        texto: agenda.dias.find((x) => x.dia === d)?.franjas.map((f) => `${hora(f.desde)} a ${hora(f.hasta)}`).join(" y ") ?? null,
      }))
    : null;

  return (
    <section id="ubicacion" aria-labelledby="ubicacion-titulo" className={seccion}>
      <div className="grid gap-14 @3xl:grid-cols-12">
        <div className="@3xl:col-span-7">
          <h2 id="ubicacion-titulo" className="font-display text-titulo italic">
            Cuándo venir
          </h2>
          {semana ? (
            <dl className="mt-8">
              {semana.map(({ dia, texto }) => (
                <div key={dia} className="flex items-baseline justify-between gap-4 border-b border-borde py-3">
                  <dt className={texto ? "" : "text-tinta-suave"}>{dia}</dt>
                  <dd className={`font-display tabular-nums ${texto ? "text-subtitulo" : "text-tinta-suave"}`}>
                    {texto ? `${texto} h` : "Cerrado"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-8 font-display text-display">{negocio.horario}</p>
          )}
        </div>
        <div className="@3xl:col-span-4 @3xl:col-start-9 @3xl:pt-20">
          <h3 className="font-display text-subtitulo">Dónde</h3>
          <p className="mt-2">{negocio.direccion}</p>
          <a href={linkMapa(negocio.direccion)} target="_blank" rel="noopener noreferrer" className={boton.secundario}>
            Cómo llegar<span className="sr-only"> (se abre en Google Maps)</span>
          </a>
          <Contacto config={config} />
        </div>
      </div>
    </section>
  );
}
