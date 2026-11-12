/**
 * Publica la landing de un cliente a partir de lo que mandó desde el configurador.
 *
 *   pnpm publicar "<mensaje de WhatsApp con el código LK1…>"
 *   pnpm publicar --archivo descargas/mi-negocio.json
 *   pnpm publicar "<…>" --slug barberia-don-mario       (URL a elección)
 *   pnpm publicar "<…>" --probar                         (solo valida, no toca nada)
 *   pnpm publicar "<…>" --sin-deploy                     (guarda y commitea; deploy después)
 *   pnpm publicar "<…>" --reemplazar                     (actualiza una landing existente)
 *
 * Pasos: lee y valida la config → la guarda en configs/<slug>.json → commit (solo ese archivo)
 * → push a GitHub → deploy a Netlify. Si algo falla, frena y dice por qué.
 *
 * También publica cajas: si el mensaje trae un código CJ1 (o el JSON de una caja), la guarda en
 * configs/cajas/<slug>.json y queda en /c/<slug>. Mismas opciones.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { leerCodigoCaja, validarCaja } from "../src/cajas/config";
import { RUBROS } from "../src/cajas/rubros";
import { leerEntradaConfig } from "../src/core/lib/codigo";
import { SLUG_VALIDO, slugDe } from "../src/core/lib/slug";
import { registry } from "../src/core/registry";
import { migrateConfig } from "../src/core/schema/migrate";

const RAIZ = path.resolve(import.meta.dirname, "..");
const SITIO = process.env.NEXT_PUBLIC_SITE_URL ?? "https://altoque-cba.com.ar";

type Opciones = { entrada?: string; archivo?: string; slug?: string; probar: boolean; sinDeploy: boolean; reemplazar: boolean };

function leerArgumentos(argv: string[]): Opciones {
  const o: Opciones = { probar: false, sinDeploy: false, reemplazar: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--archivo") o.archivo = argv[++i];
    else if (a === "--slug") o.slug = argv[++i];
    else if (a === "--probar") o.probar = true;
    else if (a === "--sin-deploy") o.sinDeploy = true;
    else if (a === "--reemplazar") o.reemplazar = true;
    else if (a.startsWith("--")) salir(`Opción desconocida: ${a}`);
    else o.entrada = o.entrada ? `${o.entrada} ${a}` : a;
  }
  return o;
}

function salir(mensaje: string): never {
  console.error(`\n✗ ${mensaje}\n`);
  process.exit(1);
}

function correr(comando: string, args: string[]) {
  execFileSync(comando, args, { cwd: RAIZ, stdio: "inherit" });
}

function leer(comando: string, args: string[]): string {
  return execFileSync(comando, args, { cwd: RAIZ, encoding: "utf8" }).trim();
}

async function main() {
  const o = leerArgumentos(process.argv.slice(2));

  // 1. Leer lo que mandó el cliente (código LK1, JSON pegado o archivo descargado).
  const texto = o.archivo ? await readFile(path.resolve(o.archivo), "utf8") : o.entrada;
  if (!texto?.trim()) salir('Pasame el mensaje con el código LK1 (o CJ1) entre comillas, o --archivo <ruta.json>.');
  if (esCaja(texto)) return publicarCaja(texto, o);
  const leida = await leerEntradaConfig(texto);
  if (!leida.ok) salir(leida.error);

  // 2. Validar con el mismo schema y migrador que usa la app.
  const r = migrateConfig(leida.valor);
  if (!r.ok) salir(`La configuración tiene errores:\n${r.errores.map((e) => `  · ${e.ruta || "(general)"}: ${e.mensaje}`).join("\n")}`);
  const config = { ...r.config };
  if (config.demo) {
    delete config.demo;
    console.warn("! La config venía marcada como demo: se publica sin ocupación simulada.");
  }

  // 3. Elegir la URL.
  const slug = o.slug ?? slugDe(config.negocio.nombre);
  if (!SLUG_VALIDO.test(slug)) salir(`El slug "${slug}" no sirve: minúsculas, números y guiones.`);
  if (slug.startsWith("demo-")) salir('Los slugs "demo-…" están reservados para las demos del kit.');
  const destino = path.join(RAIZ, "configs", `${slug}.json`);
  const existe = existsSync(destino);
  if (existe && !o.reemplazar) salir(`Ya existe configs/${slug}.json. Usá --reemplazar para actualizarla o --slug para otra URL.`);

  const url = `${SITIO.replace(/\/$/, "")}/l/${slug}`;
  console.log(`\n✓ Configuración válida`);
  console.log(`  Negocio:   ${config.negocio.nombre}`);
  console.log(`  Plantilla: ${registry[config.plantilla].meta.nombre}`);
  console.log(`  URL:       ${url}${existe ? "  (actualización)" : ""}`);
  if (o.probar) {
    console.log("\n(--probar: no se guardó nada)\n");
    return;
  }

  await guardarYPublicar(o, { destino, contenido: config, nombre: config.negocio.nombre, url, existe });
}

/** ¿Es el pedido de una caja? (código CJ1, o JSON con "tipo": "simple"). */
function esCaja(texto: string): boolean {
  if (/CJ1\.[A-Za-z0-9_-]/.test(texto)) return true;
  try {
    return (JSON.parse(texto.trim()) as { tipo?: unknown }).tipo === "simple";
  } catch {
    return false;
  }
}

async function publicarCaja(texto: string, o: Opciones) {
  let valor: unknown;
  try {
    valor = await leerCodigoCaja(texto);
  } catch {
    salir("No se pudo leer el código de la caja: el texto está incompleto o dañado.");
  }
  const r = validarCaja(valor);
  if (!r.ok) salir(`La caja tiene errores:\n${r.errores.map((e) => `  · ${e.ruta || "(general)"}: ${e.mensaje}`).join("\n")}`);
  const config = { ...r.config };
  if (config.demo) {
    delete config.demo;
    console.warn("! La caja venía marcada como demo: se publica sin datos de ejemplo.");
  }

  const slug = o.slug ?? slugDe(config.negocio.nombre);
  if (!SLUG_VALIDO.test(slug)) salir(`El slug "${slug}" no sirve: minúsculas, números y guiones.`);
  if (slug.startsWith("demo-") || slug === "prueba" || slug === "pro") salir(`"${slug}" está reservado para las demos de la caja.`);
  const destino = path.join(RAIZ, "configs", "cajas", `${slug}.json`);
  const existe = existsSync(destino);
  if (existe && !o.reemplazar) salir(`Ya existe configs/cajas/${slug}.json. Usá --reemplazar para actualizarla o --slug para otra URL.`);

  const url = `${SITIO.replace(/\/$/, "")}/c/${slug}`;
  const modulos = [config.modulos.fiado && "fiado", config.modulos.cajones && "cajones y mercado"].filter(Boolean).join(", ") || "solo lo básico";
  console.log(`\n✓ Caja válida`);
  console.log(`  Negocio: ${config.negocio.nombre}`);
  console.log(`  Rubro:   ${RUBROS[config.rubro].nombre} (${modulos})`);
  console.log(`  URL:     ${url}${existe ? "  (actualización)" : ""}`);
  if (o.probar) {
    console.log("\n(--probar: no se guardó nada)\n");
    return;
  }
  await guardarYPublicar(o, { destino, contenido: config, nombre: config.negocio.nombre, url, existe, caja: true });
  console.log("  Para instalarla: abrir el link en el celular del local → menú → «Agregar a la pantalla de inicio».\n");
}

async function guardarYPublicar(
  o: Opciones,
  { destino, contenido, nombre, url, existe, caja = false }: { destino: string; contenido: unknown; nombre: string; url: string; existe: boolean; caja?: boolean },
) {
  // Guardar y commitear solo ese archivo, firmado con la identidad del repo.
  // Proyecto personal: nunca con la cuenta del trabajo (la identidad global de git de esta máquina).
  const email = leer("git", ["config", "user.email"]);
  if (/@teco\.com\.ar$/i.test(email)) {
    salir(
      `Git va a firmar como ${email} (cuenta del trabajo). Configurá la de sdv12 en este repo:\n` +
        `  git config user.name "Sergio Daniel Villegas"\n  git config user.email "98487968+sdv12@users.noreply.github.com"`,
    );
  }
  if (leer("git", ["diff", "--cached", "--name-only"])) salir("Hay cambios en staging que no son de esta publicación. Commitealos o sacalos antes.");
  await writeFile(destino, `${JSON.stringify(contenido, null, 2)}\n`);
  const archivoRel = path.relative(RAIZ, destino);
  const ruta = new URL(url).pathname;
  correr("git", ["add", archivoRel]);
  correr("git", ["commit", "--quiet", "-m", `${existe ? "Actualizar" : "Publicar"} ${caja ? "caja de " : ""}${nombre} (${ruta})`, "--", archivoRel]);
  console.log(`✓ Commit: ${leer("git", ["log", "-1", "--format=%h %an <%ae>"])}`);

  // Subir a GitHub (si hay remoto) y desplegar.
  if (leer("git", ["remote"]).includes("origin")) {
    correr("git", ["push", "--quiet", "origin", "HEAD"]);
    console.log("✓ Subido a GitHub");
  }
  if (o.sinDeploy) {
    console.log(`\nListo sin deploy. Cuando quieras: netlify deploy --build --prod\nVa a quedar en ${url}\n`);
    return;
  }
  correr("netlify", ["deploy", "--build", "--prod", "--message", `Publicar ${caja ? "caja de " : ""}${nombre}`]);
  console.log(`\n✓ Publicada: ${url}\n  Mandale ese link a ${nombre}.\n`);
}

main().catch((e: unknown) => salir(e instanceof Error ? e.message : String(e)));
