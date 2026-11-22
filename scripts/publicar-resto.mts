/**
 * Publica un restaurante a partir de la copia que mandó el cliente (Ajustes → Copia y datos).
 *
 *   pnpm publicar-resto <copia.json> <slug> <carta|completo>
 *
 * Saca la operación de la demo (mesas, reservas, pedidos, caja, números), valida que esté listo
 * (WhatsApp del local, carta, encargado sin el PIN de la demo…) y escribe configs/restos/<slug>.json.
 * Después: revisar /r/<slug> con `pnpm dev`, commitear ese archivo y hacer push (Netlify publica solo).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { FORMATO_RESTO } from "../src/restos/lib/respaldo";
import { PLANES, prepararPublicacion, SLUG, SLUGS_RESERVADOS, validarPublicado, type PlanResto } from "../src/restos/lib/publicado";

const [archivo, slug, plan] = process.argv.slice(2);
const salir = (msj: string) => {
  console.error(msj);
  process.exit(1);
};

if (!archivo || !slug || !plan) salir("Uso: pnpm publicar-resto <copia.json> <slug> <carta|completo>");
if (!SLUG.test(slug!) || SLUGS_RESERVADOS.includes(slug!)) salir(`Slug inválido: «${slug}» (minúsculas, números y guiones; no ${SLUGS_RESERVADOS.join(", ")}).`);
if (!PLANES.includes(plan as PlanResto)) salir(`Plan inválido: «${plan}» (va ${PLANES.join(" o ")}).`);

const copia = JSON.parse(await readFile(archivo!, "utf8"));
if (copia?.formato !== FORMATO_RESTO || !copia.estado) salir("El archivo no es una copia de Al Toque Resto.");

const r = validarPublicado(prepararPublicacion(copia.estado, plan as PlanResto));
if (!r.ok) salir(`No se puede publicar todavía:\n  • ${r.errores.join("\n  • ")}`);

const destino = path.join(process.cwd(), "configs", "restos", `${slug}.json`);
await mkdir(path.dirname(destino), { recursive: true });
const texto = JSON.stringify(r.ok ? r.valor : null, null, 2) + "\n";
await writeFile(destino, texto);
const l = r.ok ? r.valor.estado.local : null;
console.log(`✓ ${l?.nombre} → configs/restos/${slug}.json (${Math.round(texto.length / 1024)} KB, plan ${plan})`);
console.log(`  Revisalo en /r/${slug} con pnpm dev; después commit de ese archivo y push.`);
