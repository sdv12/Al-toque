"use client";

import { useState } from "react";
import { leerEntradaConfig } from "@/core/lib/codigo";
import { linkWhatsApp } from "@/core/lib/mensajes";
import { registry } from "@/core/registry";
import type { LandingConfig } from "@/core/schema/landing-config";
import { migrateConfig, type ErrorConfig } from "@/core/schema/migrate";
import { Bloque, botonKit, claseControl } from "../campos";
import { pestanaDeRuta, rutaLegible, slugDe, useCodigoConfig, type Pestana } from "../estado";

type Props = {
  config: LandingConfig;
  errores: ErrorConfig[];
  reemplazar: (c: LandingConfig) => void;
  irA: (p: Pestana) => void;
};

const DUENO = process.env.NEXT_PUBLIC_OWNER_WHATSAPP;

export function PestanaEnviar({ config, errores, reemplazar, irA }: Props) {
  const codigo = useCodigoConfig(config);
  const [aviso, setAviso] = useState<string | null>(null);
  const [entrada, setEntrada] = useState("");
  const [erroresImportar, setErroresImportar] = useState<string[]>([]);
  const lista = errores.length === 0;
  const slug = slugDe(config.negocio.nombre);
  const json = JSON.stringify(config, null, 2);

  const mensaje =
    codigo &&
    [
      `Hola! Te mando la configuración de mi landing.`,
      ``,
      `Negocio: ${config.negocio.nombre}`,
      `Plantilla: ${registry[config.plantilla].meta.nombre}`,
      ``,
      `Código (no lo edites):`,
      codigo,
    ].join("\n");

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
      <Bloque titulo={lista ? "Todo listo" : "Revisá antes de enviar"}>
        {lista ? (
          <p className="text-chico">La configuración está completa. Mandámela y armo tu landing con esto.</p>
        ) : (
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
        )}
      </Bloque>

      <Bloque titulo="Enviar" descripcion={`Se guardaría como /l/${slug}`}>
        {DUENO ? (
          <a
            href={lista && mensaje ? linkWhatsApp(DUENO, mensaje) : undefined}
            aria-disabled={!lista || !mensaje}
            target="_blank"
            rel="noopener noreferrer"
            className={`${botonKit.primario} w-full ${lista && mensaje ? "" : "pointer-events-none opacity-40"}`}
          >
            Enviar por WhatsApp
          </a>
        ) : (
          <p className="rounded-base border border-borde bg-superficie-2 p-3 text-chico">
            Falta configurar <code className="font-nota">NEXT_PUBLIC_OWNER_WHATSAPP</code> para enviar por WhatsApp.
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
