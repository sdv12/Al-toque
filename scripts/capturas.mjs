/**
 * Genera las capturas de las demos que usa la home (public/muestras).
 * Se corre contra un build de producción (sin el indicador de dev de Next):
 *
 *   pnpm build && pnpm start -p 3124     # en otra terminal
 *   pnpm capturas                        # BASE=http://localhost:3124 por defecto
 *
 * Usa el Chromium de Playwright; si no lo encuentra, indicá CHROME_PATH=/ruta/a/chrome.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3124";
const SALIDA = new URL("../public/muestras/", import.meta.url);

const DEMOS = [
  { plantilla: "barberia", slug: "demo-barberia" },
  { plantilla: "consultorio", slug: "demo-consultorio" },
  { plantilla: "alojamiento", slug: "demo-casas" },
  { plantilla: "generico", slug: "demo-portfolio" },
];

const VISTAS = [
  { nombre: "escritorio", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  { nombre: "celular", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true },
];

async function lanzar() {
  const opciones = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
  return chromium.launch(opciones);
}

async function capturar(navegador, url, vista, archivo, preparar) {
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
  await pagina.screenshot({ path: new URL(archivo, SALIDA).pathname, type: "jpeg", quality: 82 });
  await contexto.close();
  console.log("✓", archivo);
}

await mkdir(SALIDA, { recursive: true });
const navegador = await lanzar();
try {
  for (const demo of DEMOS) {
    for (const vista of VISTAS) {
      await capturar(navegador, `${BASE}/l/${demo.slug}`, vista, `${demo.plantilla}-${vista.nombre}.jpg`);
    }
  }
  // El configurador, con el borrador limpio y una plantilla elegida para que se vea el preview.
  await capturar(navegador, `${BASE}/configurador`, VISTAS[0], "configurador.jpg", async (p) => {
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: "networkidle" });
    await p.getByRole("tab", { name: "Estilo" }).click();
    await p.waitForTimeout(400);
  });
} finally {
  await navegador.close();
}
