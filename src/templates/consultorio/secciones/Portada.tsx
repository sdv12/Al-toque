import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { WidgetTurnos } from "../turnos/WidgetTurnos";

type Props = { config: ConfigDe<"consultorio">; variante: VarianteDe<"consultorio", "portada"> };

function Icono({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="mt-0.5 size-5 shrink-0 text-acento-texto">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Datos que dan confianza antes de pedir el turno. */
function Credenciales({ config, enFila }: { config: ConfigDe<"consultorio">; enFila?: boolean }) {
  const { negocio, contenido } = config;
  const obras = contenido.obrasSociales?.length ?? 0;
  const equipo = contenido.equipo?.length ?? 0;
  const items = [
    { d: "M10 18s6-5.2 6-10A6 6 0 0 0 4 8c0 4.8 6 10 6 10Zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", texto: negocio.direccion },
    { d: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4l3 2", texto: negocio.horario },
    ...(obras ? [{ d: "M4 10.5 8 14.5 16 5.5", texto: `Particular y ${obras} obras sociales` }] : []),
    ...(equipo ? [{ d: "M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 8a6 6 0 0 1 12 0", texto: `${equipo} ${equipo === 1 ? "profesional matriculado" : "profesionales matriculados"}` }] : []),
  ].filter((i) => i.texto);

  return (
    <ul className={enFila ? "flex flex-wrap justify-center gap-x-8 gap-y-3 text-chico" : "grid gap-3 text-chico"}>
      {items.map((i) => (
        <li key={i.texto} className="flex gap-2.5">
          <Icono d={i.d} />
          {i.texto}
        </li>
      ))}
    </ul>
  );
}

export function Portada({ config, variante }: Props) {
  const { negocio } = config;
  const obras = config.contenido.obrasSociales ?? [];

  if (variante === "turnos-central") {
    return (
      <section id="inicio" aria-labelledby="portada-titulo" className="border-b border-borde bg-superficie">
        <div className="mx-auto max-w-3xl px-5 pb-14 pt-10 text-center @4xl:pt-16">
          <h1 id="portada-titulo" className="text-display">
            {negocio.nombre}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-subtitulo text-tinta-suave">{negocio.eslogan}</p>
          <div className="mt-8 text-left">
            <WidgetTurnos obrasSociales={obras} ancho />
          </div>
          <div className="mt-8">
            <Credenciales config={config} enFila />
          </div>
        </div>
      </section>
    );
  }

  // turnos-lateral: información a la izquierda, turnos a la derecha (en mobile, turnos enseguida)
  return (
    <section id="inicio" aria-labelledby="portada-titulo" className="border-b border-borde">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(22rem,27rem)] @4xl:gap-14 @4xl:px-10 @4xl:pb-16 @4xl:pt-14">
        <div className="@4xl:pt-4">
          <h1 id="portada-titulo" className="text-display">
            {negocio.nombre}
          </h1>
          <p className="mt-3 max-w-xl text-subtitulo text-tinta-suave">{negocio.eslogan}</p>
          <div className="hidden @4xl:block">
            {negocio.subtitulo && <p className="mt-6 max-w-medida">{negocio.subtitulo}</p>}
            <div className="mt-8">
              <Credenciales config={config} />
            </div>
          </div>
        </div>
        <WidgetTurnos obrasSociales={obras} />
        <div className="space-y-6 @4xl:hidden">
          {negocio.subtitulo && <p>{negocio.subtitulo}</p>}
          <Credenciales config={config} />
        </div>
      </div>
    </section>
  );
}
