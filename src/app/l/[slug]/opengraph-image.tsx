import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { resolverModo, variablesDeEstilo } from "@/core/lib/estilo";
import { paletaDe, type Plantilla } from "@/core/registry";
import type { Esquinas } from "@/core/schema/comun";
import { cargarConfig, listarSlugs } from "./cargar";

/**
 * Imagen de vista previa por landing (WhatsApp, Instagram, Facebook): el nombre del negocio con
 * la tipografía, los colores y las esquinas de su plantilla. Se genera en el build.
 */
export const alt = "Vista previa de la página del negocio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await listarSlugs()).map((slug) => ({ slug }));
}

const LLAMADO: Record<Plantilla, string> = {
  barberia: "Reservá tu turno",
  consultorio: "Pedí tu turno online",
  alojamiento: "Consultá fechas",
  generico: "Pedí presupuesto",
};

const RADIO_BOTON: Record<Esquinas, number> = { recto: 0, suave: 10, redondeado: 999 };

async function fuentes(plantilla: Plantilla) {
  const dir = path.join(process.cwd(), "assets", "og");
  const [display, cuerpo] = await Promise.all([
    readFile(path.join(dir, `${plantilla}-display.ttf`)),
    readFile(path.join(dir, `${plantilla}-cuerpo.ttf`)),
  ]);
  return [
    { name: "display", data: display, style: "normal" as const },
    { name: "cuerpo", data: cuerpo, style: "normal" as const },
  ];
}

/** Detalle gráfico propio de cada plantilla (no se comparte entre plantillas). */
function Detalle({ plantilla, acento, borde }: { plantilla: Plantilla; acento: string; borde: string }) {
  switch (plantilla) {
    case "barberia":
      return <div style={{ position: "absolute", left: 80, top: 52, width: 96, height: 3, background: acento }} />;
    case "consultorio":
      return <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 14, background: acento }} />;
    case "alojamiento":
      return <div style={{ position: "absolute", left: 28, top: 28, right: 28, bottom: 28, border: `3px dashed ${borde}`, borderRadius: 28 }} />;
    case "generico":
      return <div style={{ position: "absolute", right: -140, top: -140, width: 420, height: 420, borderRadius: 999, background: acento }} />;
  }
}

export default async function Imagen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await cargarConfig(slug);
  if (!config) return new Response("No existe", { status: 404 });

  const { plantilla, negocio, estilo } = config;
  const paleta = paletaDe(plantilla, resolverModo(plantilla, estilo));
  const vars = variablesDeEstilo(plantilla, estilo);
  const largo = negocio.nombre.length;
  const tamNombre = largo <= 14 ? 124 : largo <= 24 ? 100 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          padding: "96px 80px 72px",
          background: paleta.fondo,
          color: paleta.texto,
          fontFamily: "cuerpo",
        }}
      >
        <Detalle plantilla={plantilla} acento={vars["--lk-acento"]} borde={vars["--lk-acento-texto"]} />

        <div style={{ display: "flex", flexDirection: "column", maxWidth: plantilla === "generico" ? 860 : 1040 }}>
          <div style={{ fontFamily: "display", fontSize: tamNombre, lineHeight: 0.98, letterSpacing: plantilla === "generico" ? -3 : -1 }}>
            {negocio.nombre}
          </div>
          <div style={{ marginTop: 28, fontSize: 38, lineHeight: 1.3, color: paleta.textoSuave, maxWidth: 940 }}>{negocio.eslogan}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
          <div
            style={{
              display: "flex",
              padding: "18px 34px",
              fontSize: 32,
              background: vars["--lk-acento-relleno"],
              color: vars["--lk-sobre-acento"],
              borderRadius: RADIO_BOTON[estilo.esquinas],
            }}
          >
            {LLAMADO[plantilla]}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: paleta.textoSuave, maxWidth: 560, textAlign: "right", lineHeight: 1.3 }}>
            {negocio.direccion}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await fuentes(plantilla) },
  );
}
