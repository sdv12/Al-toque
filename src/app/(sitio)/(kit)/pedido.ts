import { linkWhatsApp } from "@/core/lib/mensajes";

/**
 * Envío de un pedido (landing del configurador o caja de /caja):
 * - WhatsApp lleva un mensaje corto con el número de pedido (#00015) y un resumen.
 * - La configuración completa (JSON legible + código para `pnpm publicar`) va a Netlify Forms,
 *   formulario `configuraciones` (declarado en public/__forms.html), que avisa por mail.
 * Si no se consigue número (falla /api/pedidos), el WhatsApp lleva el código completo como antes,
 * para que el pedido no se pierda.
 */

export type Pedido = {
  tipo: "Landing" | "Caja";
  negocio: string;
  /** Plantilla de la landing, o rubro y módulos de la caja. */
  detalle: string;
  estimado: string;
  slug: string;
  /** Primera línea del WhatsApp, sin el número. */
  saludo: string;
  /** Líneas del resumen para el WhatsApp ("Negocio: …"). */
  resumen: string[];
  configuracion: unknown;
  /** Código comprimido (LK1… / CJ1…) que entiende `pnpm publicar`. */
  codigo: string;
};

export type ResultadoPedido = {
  numero: string | null;
  /** Se abrió WhatsApp en otra pestaña. */
  porWhatsapp: boolean;
  /** Link de WhatsApp con el mensaje, por si el navegador bloqueó la pestaña. */
  link: string | null;
  respaldada: boolean;
};

export const formatearNumero = (n: number) => `#${String(n).padStart(5, "0")}`;

async function pedirNumero(): Promise<string | null> {
  try {
    const r = await fetch("/api/pedidos", { method: "POST" });
    if (!r.ok) return null;
    const { numero } = (await r.json()) as { numero?: unknown };
    return typeof numero === "number" ? formatearNumero(numero) : null;
  } catch {
    return null;
  }
}

/** Respaldo en Netlify Forms. En local no existe: devuelve false. */
async function respaldar(campos: Record<string, string>): Promise<boolean> {
  try {
    const r = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name": "configuraciones", ...campos }).toString(),
      keepalive: true,
    });
    return r.ok;
  } catch {
    return false;
  }
}

export function mensajePedido(p: Pedido, numero: string | null): string {
  if (numero) return [`${p.saludo} Pedido ${numero}.`, "", ...p.resumen].join("\n");
  return [p.saludo, "", ...p.resumen, "", "Código (no lo edites):", p.codigo].join("\n");
}

/**
 * Llamar directo desde el clic: la pestaña de WhatsApp se abre antes del primer await (si se abre
 * después, el navegador la bloquea como ventana emergente) y se le pone el link cuando hay número.
 */
export async function enviarPedido(p: Pedido, whatsapp: string | undefined): Promise<ResultadoPedido> {
  const ventana = whatsapp ? window.open("", "_blank") : null;
  if (ventana) {
    ventana.opener = null;
    try {
      ventana.document.title = "Abriendo WhatsApp…";
      ventana.document.body.textContent = "Abriendo WhatsApp…";
    } catch {}
  }

  const numero = await pedirNumero();
  const link = whatsapp ? linkWhatsApp(whatsapp, mensajePedido(p, numero)) : null;
  if (ventana && link) ventana.location.href = link;

  const titulo = `${numero ? `Pedido ${numero}` : "Pedido sin número"} · ${p.tipo} · ${p.negocio}`;
  const respaldada = await respaldar({
    subject: titulo,
    numero: numero ?? "sin número",
    tipo: p.tipo,
    negocio: p.negocio,
    detalle: p.detalle,
    estimado: p.estimado,
    slug: p.slug,
    configuracion: JSON.stringify(p.configuracion, null, 2),
    codigo: p.codigo,
  });

  return { numero, porWhatsapp: Boolean(ventana && link), link, respaldada };
}
