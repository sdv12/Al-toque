import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { configsPorDefecto } from "@/core/defaults";
import { AA_TEXTO, contraste } from "@/core/lib/color";
import { variablesDeEstilo } from "@/core/lib/estilo";
import { PLANTILLAS, paletaDe, registry, type Plantilla } from "@/core/registry";
import { ESQUINAS, type Estilo, type Modo } from "@/core/schema/comun";
import { fuentes as fuentesAlojamiento } from "@/templates/alojamiento";
import { fuentes as fuentesBarberia } from "@/templates/barberia";
import { fuentes as fuentesConsultorio } from "@/templates/consultorio";
import { fuentes as fuentesGenerico } from "@/templates/generico";
import { fuentes as fuentesLibre } from "@/templates/libre";
import { PlantillaRaiz } from "@/ui/PlantillaRaiz";
import { Placeholder } from "@/ui/primitives/Placeholder";

export const metadata: Metadata = { title: "Tokens · Landing Kit", robots: { index: false } };

const FUENTES: Record<Plantilla, string> = {
  barberia: fuentesBarberia,
  consultorio: fuentesConsultorio,
  alojamiento: fuentesAlojamiento,
  generico: fuentesGenerico,
  libre: fuentesLibre,
};

const variantes = PLANTILLAS.flatMap((plantilla) =>
  (registry[plantilla].meta.modos as readonly Modo[]).map((modo) => ({ plantilla, modo })),
);

export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main>
      <header className="mx-auto max-w-medida px-4 py-10">
        <h1 className="font-display text-display">Sets de tokens</h1>
        <p className="mt-2 text-tinta-suave">
          Cada banda usa sus propios tokens, fuentes y escala. Los ratios se calculan con el acento por defecto de la plantilla.
        </p>
      </header>
      {variantes.map(({ plantilla, modo }) => (
        <Muestra key={`${plantilla}-${modo}`} plantilla={plantilla} modo={modo} />
      ))}
    </main>
  );
}

function Muestra({ plantilla, modo }: { plantilla: Plantilla; modo: Modo }) {
  const config = configsPorDefecto[plantilla];
  const { meta } = registry[plantilla];
  const estilo: Estilo = { ...config.estilo, modo };
  const paleta = paletaDe(plantilla, modo);
  const vars = variablesDeEstilo(plantilla, estilo);

  const pares = [
    { nombre: "Texto / fondo", a: paleta.texto, b: paleta.fondo },
    { nombre: "Texto suave / fondo", a: paleta.textoSuave, b: paleta.fondo },
    { nombre: "Acento texto / fondo", a: vars["--lk-acento-texto"], b: paleta.fondo },
    { nombre: "Botón", a: vars["--lk-sobre-acento"], b: vars["--lk-acento-relleno"] },
  ];

  return (
    <PlantillaRaiz plantilla={plantilla} estilo={estilo} fuentes={FUENTES[plantilla]} className="textura border-t border-borde">
      <section aria-labelledby={`t-${plantilla}-${modo}`} className="mx-auto max-w-6xl px-4 py-12 @3xl:grid @3xl:grid-cols-[1fr_2fr] @3xl:gap-12">
        <div>
          <p className="text-mini text-tinta-suave">
            {meta.rubro} · {modo}
          </p>
          <h2 id={`t-${plantilla}-${modo}`} className="font-display text-titulo">
            {meta.nombre}
          </h2>

          <ul className="mt-6 grid grid-cols-2 gap-2 text-mini">
            {(
              [
                ["fondo", "bg-fondo"],
                ["superficie", "bg-superficie"],
                ["superficie 2", "bg-superficie-2"],
                ["borde", "bg-borde"],
                ["acento", "bg-acento"],
                ["relleno", "bg-acento-relleno"],
              ] as const
            ).map(([nombre, clase]) => (
              <li key={nombre} className="flex items-center gap-2">
                <span aria-hidden className={`size-6 rounded-base borde-base ${clase}`} />
                {nombre}
              </li>
            ))}
          </ul>

          <table className="mt-6 w-full text-mini">
            <caption className="sr-only">Contraste de pares de color</caption>
            <tbody>
              {pares.map(({ nombre, a, b }) => {
                const ratio = contraste(a, b);
                return (
                  <tr key={nombre} className="border-b border-borde">
                    <th scope="row" className="py-1 text-left font-normal">
                      {nombre}
                    </th>
                    <td className="py-1 text-right tabular-nums">{ratio.toFixed(2)}:1</td>
                    <td className="py-1 pl-2 text-right">{ratio >= AA_TEXTO ? "AA" : "falla"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-6 flex flex-wrap gap-3">
            {ESQUINAS.map((esquinas) => (
              <PlantillaRaiz key={esquinas} plantilla={plantilla} estilo={{ ...estilo, esquinas }} fuentes="" className="bg-transparent [container-type:normal]">
                <span className="inline-block rounded-control bg-acento-relleno px-4 py-2 text-chico font-medium text-sobre-acento">
                  {esquinas}
                </span>
              </PlantillaRaiz>
            ))}
          </div>
        </div>

        <div className="mt-10 @3xl:mt-0">
          <p className="font-display text-display">{config.negocio.nombre}</p>
          <p className="mt-4 font-display text-titulo">{config.negocio.eslogan}</p>
          <p className="mt-4 text-subtitulo">Subtítulo: una línea que acompaña al título.</p>
          <p className="mt-4 max-w-medida">{config.negocio.subtitulo}</p>
          <p className="mt-3 text-chico text-tinta-suave">
            Texto chico: {config.negocio.direccion} · {config.negocio.horario}
          </p>
          <p className="mt-1 text-mini text-tinta-suave">Texto mini: aclaraciones y notas al pie.</p>
          <p className="mt-3 font-nota text-subtitulo text-acento-texto">Nota: a 40 pasos del arroyo</p>
          <div className="mt-6 grid grid-cols-2 gap-3 @2xl:grid-cols-3">
            <Placeholder descripcion="Frente del local" aspecto="4 / 5" />
            <Placeholder descripcion="Detalle" aspecto="4 / 5" />
            <Placeholder descripcion="Ambiente" aspecto="4 / 5" className="hidden @2xl:grid" />
          </div>
        </div>
      </section>
    </PlantillaRaiz>
  );
}
