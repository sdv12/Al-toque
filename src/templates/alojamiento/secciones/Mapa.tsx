import { hash } from "@/core/lib/aleatorio";
import type { VarianteDe } from "@/core/registry";
import type { PuntoInteres } from "@/core/schema/contenido";
import type { ConfigDe } from "@/core/schema/landing-config";
import { margen, separador, tituloSeccion } from "../estilos";

type Props = { config: ConfigDe<"alojamiento">; variante: VarianteDe<"alojamiento", "mapa"> };
type Punto = { x: number; y: number };

const TIPOS: Record<PuntoInteres["tipo"], string> = {
  pueblo: "Pueblo",
  rio: "Río o arroyo",
  ruta: "Ruta",
  sendero: "Sendero",
  comercio: "Comercio",
  otro: "Lugar",
};

/** Número de cada punto según cercanía: lo comparten el mapa (en mobile) y la lista. */
function numerar(puntos: PuntoInteres[]): Map<string, number> {
  return new Map([...puntos].sort((a, b) => a.distanciaKm - b.distanciaKm).map((p, i) => [p.id, i + 1]));
}

function Numero({ n }: { n: number }) {
  return (
    <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-tinta text-mini font-semibold text-fondo">
      {n}
    </span>
  );
}

function distancia(p: PuntoInteres): string {
  const km = p.distanciaKm < 1 ? `${Math.round(p.distanciaKm * 1000)} m` : `${p.distanciaKm.toLocaleString("es-AR")} km`;
  return p.minutos ? `${km} · ${p.minutos} min` : km;
}

/** Curva cerrada suave (Catmull-Rom → Bézier) por los puntos dados. */
function curvaCerrada(puntos: Punto[]): string {
  const n = puntos.length;
  const p = (i: number) => puntos[((i % n) + n) % n]!;
  let d = `M ${p(0).x.toFixed(2)} ${p(0).y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return `${d} Z`;
}

/** Curvas de nivel decorativas alrededor de un cerro (deterministas por nombre del negocio). */
function curvasDeNivel(centro: Punto, semilla: string): string[] {
  return [1, 2, 3, 4].map((k) => {
    const puntos = Array.from({ length: 10 }, (_, j) => {
      const angulo = (j / 10) * Math.PI * 2;
      const r = 5 + k * 6 + ((hash(`${semilla}|${k}|${j}`) % 100) / 100) * 3.5;
      return { x: centro.x + Math.cos(angulo) * r * 1.25, y: centro.y + Math.sin(angulo) * r };
    });
    return curvaCerrada(puntos);
  });
}

function Marcador({ tipo }: { tipo: PuntoInteres["tipo"] | "casa" }) {
  const clase = "size-5 shrink-0 text-tinta";
  switch (tipo) {
    case "casa":
      return (
        <svg viewBox="0 0 20 20" aria-hidden className="size-7 shrink-0 text-acento-texto">
          <path d="M3 10 10 3.5 17 10v7H3z" fill="var(--lk-superficie)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8 17v-4.5h4V17" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "pueblo":
      return (
        <svg viewBox="0 0 20 20" aria-hidden className={clase}>
          <circle cx="10" cy="10" r="5" fill="currentColor" />
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "rio":
      return (
        <svg viewBox="0 0 20 20" aria-hidden className={clase}>
          <path d="M2 8c3-3 5 3 8 0s5 3 8 0M2 13c3-3 5 3 8 0s5 3 8 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "sendero":
      return (
        <svg viewBox="0 0 20 20" aria-hidden className={clase}>
          <path d="M2 17 8 6l3 5 2-3 5 9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "ruta":
      return (
        <svg viewBox="0 0 20 20" aria-hidden className={clase}>
          <rect x="4" y="4" width="12" height="12" rx="2" fill="var(--lk-superficie)" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6.5v7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" aria-hidden className={clase}>
          <circle cx="10" cy="10" r="4.5" fill="var(--lk-superficie)" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}

function MapaIlustrado({ config }: { config: ConfigDe<"alojamiento"> }) {
  const puntos = config.contenido.puntosInteres ?? [];
  const casas = (config.contenido.propiedades ?? []).filter((p) => p.mapa);
  const origen: Punto = casas.length
    ? { x: casas.reduce((s, c) => s + c.mapa!.x, 0) / casas.length, y: casas.reduce((s, c) => s + c.mapa!.y, 0) / casas.length }
    : { x: 50, y: 50 };
  const rio = puntos.find((p) => p.tipo === "rio");
  const cerro = puntos.find((p) => p.tipo === "sendero") ?? { x: 20, y: 25 };
  const numeros = numerar(puntos);

  return (
    <figure className="relative aspect-square overflow-hidden rounded-base border-[1.5px] border-borde bg-superficie textura @2xl:aspect-[4/3]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full">
        <g fill="none" stroke="var(--lk-borde)" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {curvasDeNivel(cerro, config.negocio.nombre).map((d, i) => (
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        {rio && (
          <g fill="none" strokeLinecap="round">
            <path
              d={`M -2 ${rio.y + 14} C 18 ${rio.y + 20}, ${rio.x - 18} ${rio.y - 6}, ${rio.x} ${rio.y} S ${Math.min(rio.x + 30, 90)} ${rio.y - 16}, 102 ${rio.y - 8}`}
              stroke="color-mix(in srgb, var(--lk-acento) 35%, var(--lk-borde))"
              strokeWidth="5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M -2 ${rio.y + 14} C 18 ${rio.y + 20}, ${rio.x - 18} ${rio.y - 6}, ${rio.x} ${rio.y} S ${Math.min(rio.x + 30, 90)} ${rio.y - 16}, 102 ${rio.y - 8}`}
              stroke="var(--lk-superficie)"
              strokeWidth="1.5"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
        <g fill="none" stroke="var(--lk-texto-suave)" strokeLinecap="round">
          {puntos
            .filter((p) => p.tipo !== "rio")
            .map((p) => (
              <path
                key={p.id}
                d={`M ${origen.x} ${origen.y} Q ${(origen.x + p.x) / 2 + (p.y - origen.y) * 0.15} ${(origen.y + p.y) / 2 - (p.x - origen.x) * 0.15} ${p.x} ${p.y}`}
                strokeWidth={p.tipo === "ruta" ? 2 : 1.2}
                strokeDasharray={p.tipo === "ruta" ? "8 5" : "2 4"}
                vectorEffect="non-scaling-stroke"
              />
            ))}
        </g>
      </svg>

      {/* Etiquetas en HTML: texto nítido y tipografía de la plantilla. En contenedores angostos,
          solo el número (la lista de al lado tiene los nombres y distancias). */}
      {puntos.map((p) => {
        const izquierda = p.x > 75;
        return (
          <div key={p.id} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <div className="-translate-x-1/2 -translate-y-1/2 @2xl:hidden">
              <Numero n={numeros.get(p.id) ?? 0} />
            </div>
            <div
              className={`hidden items-center gap-1.5 @2xl:flex ${izquierda ? "flex-row-reverse text-right" : ""}`}
              style={{ transform: `translate(${izquierda ? "calc(-100% + 10px)" : "-10px"}, -50%)` }}
            >
              <Marcador tipo={p.tipo} />
              <span className="rounded-base bg-superficie/85 px-1.5 leading-tight">
                <span className="block whitespace-nowrap font-nota text-subtitulo leading-none">{p.nombre}</span>
                <span className="block whitespace-nowrap text-mini text-tinta-suave">{distancia(p)}</span>
              </span>
            </div>
          </div>
        );
      })}

      <div className="absolute flex items-center gap-1" style={{ left: `${origen.x}%`, top: `${origen.y}%`, transform: "translate(-14px, -60%)" }}>
        <Marcador tipo="casa" />
        <span className="rounded-base bg-superficie/85 px-1.5 font-nota text-subtitulo font-bold leading-none text-acento-texto">Las casas</span>
      </div>

      <div aria-hidden className="absolute right-4 top-4 grid place-items-center text-tinta-suave">
        <svg viewBox="0 0 24 32" className="h-8 w-6">
          <path d="M12 2 17 20 12 16 7 20z" fill="currentColor" />
        </svg>
        <span className="font-nota text-chico">N</span>
      </div>
      <figcaption className="absolute bottom-3 left-4 text-mini text-tinta-suave">Dibujo ilustrativo, no está a escala.</figcaption>
    </figure>
  );
}

function ListaDistancias({ puntos, compacta }: { puntos: PuntoInteres[]; compacta?: boolean }) {
  const ordenados = [...puntos].sort((a, b) => a.distanciaKm - b.distanciaKm);
  const numeros = numerar(puntos);
  return (
    <ol className={compacta ? "divide-y-[1.5px] divide-dashed divide-borde" : "grid gap-x-12 @3xl:grid-cols-2"}>
      {ordenados.map((p) => (
        <li key={p.id} className={`flex items-baseline gap-3 py-3 ${compacta ? "" : "border-b-[1.5px] border-dashed border-borde"}`}>
          {compacta && (
            <span className="self-center @2xl:hidden">
              <Numero n={numeros.get(p.id) ?? 0} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block font-display text-subtitulo">{p.nombre}</span>
            <span className="block text-mini text-tinta-suave">
              {TIPOS[p.tipo]}
              {p.nota && ` · ${p.nota}`}
            </span>
          </span>
          <span aria-hidden className="min-w-4 flex-1 translate-y-[-0.3em] border-b-[1.5px] border-dotted border-tinta-suave/50" />
          <span className="shrink-0 text-chico tabular-nums">{distancia(p)}</span>
        </li>
      ))}
    </ol>
  );
}

export function Mapa({ config, variante }: Props) {
  const puntos = config.contenido.puntosInteres ?? [];

  if (variante === "distancias") {
    return (
      <section id="zona" aria-labelledby="zona-titulo" className={`${separador} ${margen} py-20`}>
        <h2 id="zona-titulo" className={tituloSeccion}>
          Qué hay cerca
        </h2>
        <p className="mt-2 max-w-medida text-tinta-suave">Distancias desde las casas, en auto.</p>
        <div className="mt-10">
          <ListaDistancias puntos={puntos} />
        </div>
      </section>
    );
  }

  // ilustrado: el mapa como protagonista, la lista como alternativa de texto
  return (
    <section id="zona" aria-labelledby="zona-titulo" className={`${separador} py-20`}>
      <div className={margen}>
        <h2 id="zona-titulo" className={tituloSeccion}>
          La zona
        </h2>
        <p className="mt-2 max-w-medida text-tinta-suave">{config.negocio.direccion}. Distancias desde las casas, en auto.</p>
      </div>
      <div className={`${margen} mt-10 grid gap-10 @4xl:grid-cols-12`}>
        <div className="@4xl:col-span-8">
          <MapaIlustrado config={config} />
        </div>
        <div className="@4xl:col-span-4">
          <h3 className="font-nota text-subtitulo text-acento-texto">De más cerca a más lejos</h3>
          <ListaDistancias puntos={puntos} compacta />
        </div>
      </div>
    </section>
  );
}
