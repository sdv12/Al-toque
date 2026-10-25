/**
 * Genera las capturas de las demos que usa la home (public/muestras).
 * Se corre contra un build de producción (sin el indicador de dev de Next):
 *
 *   pnpm build && pnpm start -p 3124     # en otra terminal
 *   pnpm capturas                        # BASE=http://localhost:3124 por defecto
 *   SOLO=proyectos pnpm capturas         # solo los proyectos reales (sitios en vivo, sin servidor local)
 *
 * Usa el Chromium de Playwright; si no lo encuentra, indicá CHROME_PATH=/ruta/a/chrome.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3124";
const SOLO_PROYECTOS = process.env.SOLO === "proyectos";
const SALIDA = new URL("../public/muestras/", import.meta.url);

const DEMOS = [
  { plantilla: "barberia", slug: "demo-barberia" },
  { plantilla: "consultorio", slug: "demo-consultorio" },
  { plantilla: "alojamiento", slug: "demo-casas" },
  { plantilla: "generico", slug: "demo-portfolio" },
];

/** Proyectos reales que se muestran en la home (sección "Proyectos"): se capturan en vivo. */
const PROYECTOS = [
  { id: "cuervo", url: "https://cuervo-pelu.netlify.app" },
  { id: "1918", url: "https://1918-peluqueria.netlify.app" },
  { id: "lunagui", url: "https://lunagui-viajes.netlify.app" },
  { id: "for-her", url: "https://for-her-estudio.netlify.app" },
  { id: "casas-de-sierra", url: "https://casas-de-sierra-cba.netlify.app" },
];

/** Oculta el cartel "Powered by Netlify" que Netlify agrega en sus sitios (un iframe fijo). */
async function sinCartelNetlify(pagina) {
  await pagina.addStyleTag({ content: "#nl-badge-frame{display:none!important}" });
}

const VISTAS = [
  { nombre: "escritorio", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  { nombre: "celular", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true },
];

async function lanzar() {
  const opciones = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
  return chromium.launch(opciones);
}

async function capturar(navegador, url, vista, archivo, preparar, carpeta = SALIDA) {
  const contexto = await navegador.newContext({
    viewport: vista.viewport,
    deviceScaleFactor: vista.deviceScaleFactor,
    isMobile: vista.isMobile,
    hasTouch: vista.isMobile,
    reducedMotion: "reduce",
  });
  const pagina = await contexto.newPage();
  await pagina.goto(url, { waitUntil: "networkidle" });
  if (preparar) await preparar(pagina);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.addStyleTag({ content: "::-webkit-scrollbar{display:none} *{scrollbar-width:none}" });
  await pagina.waitForTimeout(300);
  await pagina.screenshot({ path: new URL(archivo, carpeta).pathname, type: "jpeg", quality: 82 });
  await contexto.close();
  console.log("✓", archivo);
}

await mkdir(SALIDA, { recursive: true });
const navegador = await lanzar();
try {
  for (const demo of SOLO_PROYECTOS ? [] : DEMOS) {
    for (const vista of VISTAS) {
      await capturar(navegador, `${BASE}/l/${demo.slug}`, vista, `${demo.plantilla}-${vista.nombre}.jpg`);
    }
  }
  // El configurador, con el borrador limpio y una plantilla elegida para que se vea el preview.
  if (!SOLO_PROYECTOS) await capturar(navegador, `${BASE}/configurador`, VISTAS[0], "configurador.jpg", async (p) => {
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: "networkidle" });
    await p.getByRole("tab", { name: "Estilo" }).click();
    await p.waitForTimeout(400);
  });
  // Proyectos reales (sitios en vivo, no dependen de BASE).
  const carpetaProyectos = new URL("../public/proyectos/", import.meta.url);
  await mkdir(carpetaProyectos, { recursive: true });
  for (const proyecto of PROYECTOS) {
    await capturar(navegador, proyecto.url, VISTAS[0], `${proyecto.id}.jpg`, sinCartelNetlify, carpetaProyectos);
  }
} finally {
  await navegador.close();
}
