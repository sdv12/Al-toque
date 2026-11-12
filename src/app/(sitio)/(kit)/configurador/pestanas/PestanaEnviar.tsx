"use client";

import { useState } from "react";
import { leerEntradaConfig } from "@/core/lib/codigo";
import { linkWhatsApp } from "@/core/lib/mensajes";
import { registry } from "@/core/registry";
import type { LandingConfig } from "@/core/schema/landing-config";
import { migrateConfig, type ErrorConfig } from "@/core/schema/migrate";
import { Bloque, botonKit, claseControl } from "../campos";
import { totalCorto } from "./PestanaPrecio";
import { pestanaDeRuta, rutaLegible, slugDe, useCodigoConfig, type Pestana } from "../estado";

type Props = {
  config: LandingConfig;
  errores: ErrorConfig[];
  reemplazar: (c: LandingConfig) => void;
  irA: (p: Pestana) => void;
  /** Con /configurador?admin: herramientas internas (JSON, importar). El cliente no las ve. */
  admin: boolean;
};

const DUENO = process.env.NEXT_PUBLIC_OWNER_WHATSAPP;

/** Respaldo en Netlify Forms (declarado en public/__forms.html). En local no existe: devuelve false. */
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

type Envio = { estado: "enviando" } | { estado: "listo"; porWhatsapp: boolean } | { estado: "error" };

export function PestanaEnviar({ config, errores, reemplazar, irA, admin }: Props) {
  const codigo = useCodigoConfig(config);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const lista = errores.length === 0;
  const slug = slugDe(config.negocio.nombre);
  const plantilla = registry[config.plantilla].meta.nombre;

  const mensaje =
    codigo &&
    [
      `Hola! Te mando la configuración de mi landing.`,
      ``,
      `Negocio: ${config.negocio.nombre}`,
      `Plantilla: ${plantilla}`,
      `Estimado: ${totalCorto(config)}`,
      ``,
      `Código (no lo edites):`,
      codigo,
    ].join("\n");

  async function enviar() {
    if (!lista || !codigo || !mensaje) return;
    // WhatsApp se abre en el mismo clic: si se abre después de un await, el navegador lo bloquea como ventana emergente.
    let porWhatsapp = false;
    if (DUENO) {
      const ventana = window.open(linkWhatsApp(DUENO, mensaje), "_blank");
      if (ventana) {
        ventana.opener = null;
        porWhatsapp = true;
      }
    }
    setEnvio({ estado: "enviando" });
    // El respaldo llega aunque la persona no termine de mandar el WhatsApp.
    const respaldada = await respaldar({ negocio: config.negocio.nombre, plantilla, estimado: totalCorto(config), slug, codigo });
    setEnvio(porWhatsapp || respaldada ? { estado: "listo", porWhatsapp } : { estado: "error" });
  }

  return (
    <>
      {!lista && (
        <Bloque titulo="Antes de enviar" descripcion="Falta completar esto. Tocá cada punto para ir a corregirlo.">
          <ul className="space-y-2">
            {errores.map((e, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => irA(pestanaDeRuta(e.ruta))}
                  className="w-full rounded-base border border-[#b3261e]/40 bg-superficie px-3 py-2 text-left text-chico hover:border-[#b3261e]"
                >
                  <span className="block text-mini text-tinta-suave">{rutaLegible(e.ruta)}</span>
                  {e.mensaje}
                </button>
              </li>
            ))}
          </ul>
        </Bloque>
      )}

      <Bloque titulo="Enviar" descripcion="Una vez lista tu configuración, ya podés enviarla para que la revisemos.">
        {envio?.estado === "listo" ? (
          <div role="status" className="space-y-2 rounded-base border border-borde bg-superficie p-4 text-chico">
            <p className="font-semibold">¡Listo! Recibimos tu configuración.</p>
            {envio.porWhatsapp && <p>Se abrió WhatsApp con el mensaje armado: si todavía no lo mandaste, solo falta tocar enviar.</p>}
            <p>Te escribimos por WhatsApp cuando esté lista tu página.</p>
            <p className="text-tinta-suave">
              En caso de querer modificar algo, no dudes en contactarte
              {DUENO ? (
                <>
                  {" "}
                  <a href={linkWhatsApp(DUENO)} target="_blank" rel="noopener noreferrer" className="font-semibold text-tinta underline underline-offset-2">
                    por WhatsApp
                  </a>
                  .
                </>
              ) : (
                "."
              )}
            </p>
            <button type="button" className="text-mini underline underline-offset-2" onClick={() => setEnvio(null)}>
              Enviar de nuevo
            </button>
          </div>
        ) : (
          <>
            <button type="button" onClick={enviar} disabled={!lista || !codigo || envio?.estado === "enviando"} className={`${botonKit.primario} w-full`}>
              {envio?.estado === "enviando" ? "Enviando…" : "Enviar"}
            </button>
            {envio?.estado === "error" && (
              <p role="alert" className="text-chico text-[#b3261e]">
                No pudimos enviarla. Probá de nuevo en un rato.
              </p>
            )}
          </>
        )}
      </Bloque>

      {admin && <HerramientasAdmin config={config} slug={slug} reemplazar={reemplazar} />}
    </>
  );
}

/** Solo con ?admin: ver/bajar el JSON y cargar una configuración que llegó por WhatsApp. */
function HerramientasAdmin({ config, slug, reemplazar }: { config: LandingConfig; slug: string; reemplazar: (c: LandingConfig) => void }) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [entrada, setEntrada] = useState("");
  const [erroresImportar, setErroresImportar] = useState<string[]>([]);
  const json = JSON.stringify(config, null, 2);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(json);
      setAviso("JSON copiado al portapapeles.");
    } catch {
      setAviso("No se pudo copiar. Usá «Descargar JSON».");
    }
  }

  function descargar() {
    const url = URL.createObjectURL(new Blob([json + "\n"], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAviso(`Descargado ${slug}.json.`);
  }

  async function importar() {
    setErroresImportar([]);
    const leida = await leerEntradaConfig(entrada);
    if (!leida.ok) return setErroresImportar([leida.error]);
    const r = migrateConfig(leida.valor);
    if (!r.ok) return setErroresImportar(r.errores.map((e) => `${rutaLegible(e.ruta)}: ${e.mensaje}`));
    if (window.confirm(`Cargar la configuración de «${r.config.negocio.nombre}»? Reemplaza lo que tenés ahora.`)) {
      reemplazar(r.config);
      setEntrada("");
      setAviso(`Cargada la configuración de ${r.config.negocio.nombre}.`);
    }
  }

  return (
    <>
      <Bloque titulo="Admin" descripcion={`Solo se ve con ?admin. Se publicaría como /l/${slug}`}>
        {!DUENO && (
          <p className="rounded-base border border-borde bg-superficie-2 p-3 text-chico">
            Falta configurar <code className="font-nota">NEXT_PUBLIC_OWNER_WHATSAPP</code>: sin eso, «Enviar» solo guarda el respaldo en Netlify Forms.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={botonKit.secundario} onClick={copiar}>
            Copiar JSON
          </button>
          <button type="button" className={botonKit.secundario} onClick={descargar}>
            Descargar JSON
          </button>
        </div>
        <p aria-live="polite" className="min-h-5 text-mini text-tinta-suave">
          {aviso}
        </p>
      </Bloque>

      <Bloque titulo="Importar" descripcion="Pegá un JSON o el mensaje con el código LK1 que llegó por WhatsApp.">
        <label htmlFor="importar" className="sr-only">
          Configuración a importar
        </label>
        <textarea id="importar" rows={4} value={entrada} onChange={(e) => setEntrada(e.target.value)} className={`${claseControl} font-nota text-mini`} />
        <button type="button" className={botonKit.secundario} disabled={!entrada.trim()} onClick={importar}>
          Cargar
        </button>
        {erroresImportar.length > 0 && (
          <ul role="alert" className="space-y-1 text-mini text-[#b3261e]">
            {erroresImportar.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </Bloque>
    </>
  );
}
