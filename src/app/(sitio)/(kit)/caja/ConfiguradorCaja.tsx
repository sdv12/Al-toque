"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { COLORES_CAJA, cajaPorDefecto, codificarCaja, validarCaja, type CajaConfig, type ColorCaja } from "@/cajas/config";
import { CLAVE_PRUEBA } from "@/cajas/prueba";
import { RUBROS, RUBROS_CAJA, type RubroCaja } from "@/cajas/rubros";
import { formatearPesos, linkWhatsApp } from "@/core/lib/mensajes";
import { MODULOS_CAJA, cotizarCaja, type IdModuloCaja } from "@/core/lib/precios";
import { claseControl } from "../configurador/campos";
import { afiche, boton, margen } from "../_home/Secciones";

const tarjeta =
  "flex cursor-pointer gap-3 rounded-base border-2 border-tinta/25 bg-superficie p-4 transition-colors hover:border-tinta has-checked:border-tinta has-checked:bg-acento-relleno has-checked:text-sobre-acento has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foco has-disabled:cursor-not-allowed has-disabled:opacity-50";

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <fieldset className="border-t-2 border-tinta pt-6">
      <legend className="float-left mb-4 flex w-full items-baseline gap-3">
        <span className={`${afiche} text-[2rem] leading-none tabular-nums`}>{String(n).padStart(2, "0")}</span>
        <span className="text-subtitulo font-semibold">{titulo}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

/** Código CJ1 de la config, calculado un rato después del último cambio (comprimir es asíncrono). */
function useCodigo(config: CajaConfig, valida: boolean): string | null {
  const [codigo, setCodigo] = useState<string | null>(null);
  useEffect(() => {
    if (!valida) return;
    let vigente = true;
    const t = setTimeout(() => void codificarCaja(config).then((c) => vigente && setCodigo(c)), 300);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [config, valida]);
  return valida ? codigo : null;
}

export function ConfiguradorCaja({ whatsapp }: { whatsapp: string | undefined }) {
  const [config, setConfig] = useState<CajaConfig>(() => cajaPorDefecto());
  const idNombre = useId();
  const validacion = validarCaja(config);
  const errorNombre = validacion.ok ? undefined : validacion.errores.find((e) => e.ruta === "negocio.nombre")?.mensaje;
  const codigo = useCodigo(config, validacion.ok);
  const cotizacion = cotizarCaja(config);

  // La vista previa (/c/prueba, en el iframe o en otra pestaña) lee la config de acá.
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_PRUEBA, JSON.stringify(config));
    } catch {}
  }, [config]);

  const cambiarRubro = (rubro: RubroCaja) =>
    setConfig((c) => {
      // Si el nombre era el de ejemplo del rubro anterior, se cambia por el del nuevo.
      const nombre = c.negocio.nombre === RUBROS[c.rubro].ejemplo ? RUBROS[rubro].ejemplo : c.negocio.nombre;
      return { ...c, rubro, negocio: { nombre }, modulos: { ...c.modulos, cajones: RUBROS[rubro].cajones && (c.modulos.cajones || c.rubro !== rubro) } };
    });

  const modulosElegidos = (Object.keys(MODULOS_CAJA) as IdModuloCaja[]).filter((m) => config.modulos[m]);
  const estimado = `${formatearPesos(cotizacion.total.unico)} + ${formatearPesos(cotizacion.total.mensual)}/mes`;
  const mensaje =
    codigo &&
    [
      "Hola! Quiero la caja para mi negocio.",
      "",
      `Negocio: ${config.negocio.nombre.trim()}`,
      `Rubro: ${RUBROS[config.rubro].nombre}`,
      `Con: ${modulosElegidos.length ? modulosElegidos.map((m) => MODULOS_CAJA[m].nombre).join(", ") : "solo lo básico"}`,
      `Estimado: ${estimado}`,
      "",
      "Código (no lo edites):",
      codigo,
    ].join("\n");

  return (
    <section id="armala" aria-labelledby="armala-titulo" className={`${margen} scroll-mt-4 pb-10`}>
      <h2 id="armala-titulo" className="sr-only">
        Armá tu caja
      </h2>
      <div className="grid gap-12 @5xl:grid-cols-12">
        <form className="space-y-10 @5xl:col-span-7" onSubmit={(e) => e.preventDefault()}>
          <Paso n={1} titulo="¿Qué negocio tenés?">
            <div className="grid gap-3 @xl:grid-cols-2">
              {RUBROS_CAJA.map((r) => (
                <label key={r} className={tarjeta}>
                  <input type="radio" name="rubro" value={r} checked={config.rubro === r} onChange={() => cambiarRubro(r)} className="sr-only" />
                  <span aria-hidden className="text-[2rem] leading-none">
                    {RUBROS[r].emoji}
                  </span>
                  <span>
                    <span className="block font-semibold">{RUBROS[r].nombre}</span>
                    <span className="block text-chico opacity-80">{RUBROS[r].bajada}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-chico text-tinta-suave">Arranca con los productos típicos del rubro y sus precios de referencia. Después cambiás lo que quieras.</p>
          </Paso>

          <Paso n={2} titulo="¿Cómo se llama?">
            <label htmlFor={idNombre} className="sr-only">
              Nombre del negocio
            </label>
            <input
              id={idNombre}
              type="text"
              value={config.negocio.nombre}
              maxLength={40}
              autoComplete="organization"
              aria-invalid={!!errorNombre}
              aria-describedby={errorNombre ? `${idNombre}-error` : undefined}
              onChange={(e) => {
                const nombre = e.target.value;
                setConfig((c) => ({ ...c, negocio: { nombre } }));
              }}
              className={`${claseControl} text-subtitulo`}
            />
            {errorNombre ? (
              <p id={`${idNombre}-error`} className="mt-2 text-chico text-[#b3261e]">
                {errorNombre}
              </p>
            ) : (
              <p className="mt-2 text-chico text-tinta-suave">Aparece en la caja y en los mensajes de fiado que mandás por WhatsApp.</p>
            )}
          </Paso>

          <Paso n={3} titulo="Elegí el color">
            <div className="flex flex-wrap gap-3">
              {(Object.keys(COLORES_CAJA) as ColorCaja[]).map((c) => (
                <label key={c} className={`${tarjeta} items-center py-3 pr-5`}>
                  <input type="radio" name="color" value={c} checked={config.color === c} onChange={() => setConfig((x) => ({ ...x, color: c }))} className="sr-only" />
                  <span aria-hidden className="size-8 rounded-full border-2 border-fondo shadow-[0_0_0_2px_currentColor]" style={{ background: COLORES_CAJA[c].acento }} />
                  <span className="font-semibold">{COLORES_CAJA[c].nombre}</span>
                </label>
              ))}
            </div>
          </Paso>

          <Paso n={4} titulo="¿Qué más necesitás?">
            <div className="grid gap-3">
              {(Object.keys(MODULOS_CAJA) as IdModuloCaja[]).map((m) => {
                const noDisponible = m === "cajones" && !RUBROS[config.rubro].cajones;
                return (
                  <label key={m} className={tarjeta}>
                    <input
                      type="checkbox"
                      checked={config.modulos[m] && !noDisponible}
                      disabled={noDisponible}
                      onChange={(e) => {
                        const activo = e.target.checked;
                        setConfig((c) => ({ ...c, modulos: { ...c.modulos, [m]: activo } }));
                      }}
                      className="mt-1 size-5 shrink-0 accent-[currentColor]"
                    />
                    <span className="flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className="font-semibold">{MODULOS_CAJA[m].nombre}</span>
                        <span className="text-chico tabular-nums">{MODULOS_CAJA[m].unico ? `+ ${formatearPesos(MODULOS_CAJA[m].unico)}` : "Incluido"}</span>
                      </span>
                      <span className="block text-chico opacity-80">
                        {noDisponible ? `Por ahora, solo para verdulería.` : MODULOS_CAJA[m].descripcion}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-chico text-tinta-suave">Vender, precios y la caja del día (apertura, ventas por medio de pago y cierre) vienen siempre.</p>
          </Paso>

          <div className="rounded-base border-2 border-tinta bg-superficie p-6">
            <ul className="space-y-1.5 text-chico">
              {cotizacion.lineas.map((l) => (
                <li key={l.concepto} className="flex justify-between gap-4">
                  <span>{l.concepto}</span>
                  <span className="shrink-0 tabular-nums">{formatearPesos(l.unico)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex flex-wrap items-end justify-between gap-x-4 border-t-2 border-tinta pt-4">
              <span className="font-semibold">Total estimado</span>
              <span className="text-right">
                <span className={`${afiche} block text-[2.5rem] leading-none tabular-nums`}>{formatearPesos(cotizacion.total.unico)}</span>
                <span className="text-chico">+ {formatearPesos(cotizacion.total.mensual)} por mes (hosting y actualizaciones)</span>
              </span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {whatsapp && mensaje ? (
                <a href={linkWhatsApp(whatsapp, mensaje)} target="_blank" rel="noopener noreferrer" className={boton.tinta}>
                  Pedir mi caja por WhatsApp
                </a>
              ) : (
                <button type="button" disabled className={`${boton.tinta} cursor-not-allowed opacity-40`}>
                  Pedir mi caja por WhatsApp
                </button>
              )}
              <a href="/c/prueba" target="_blank" rel="noopener" className={boton.contorno}>
                Probarla en pantalla completa
              </a>
            </div>
            {!validacion.ok && <p className="mt-3 text-chico text-[#b3261e]">Completá el nombre del negocio para pedirla.</p>}
            {!whatsapp && <p className="mt-3 text-chico text-tinta-suave">Falta configurar NEXT_PUBLIC_OWNER_WHATSAPP.</p>}
            <p className="mt-3 text-mini text-tinta-suave">Precios de referencia en pesos argentinos. El valor final se confirma al charlar tu caja.</p>
          </div>
        </form>

        {/* En pantallas chicas la caja no entra bien dentro de un marco: ahí se prueba con el botón
            «Probarla en pantalla completa» del final del formulario. */}
        <div className="hidden @3xl:block @5xl:col-span-5">
          <div className="@5xl:sticky @5xl:top-6">
            <p className="mb-3 text-center text-chico font-semibold">Probala acá: vendé, cambiá precios, anotá un fiado.</p>
            <div className="mx-auto w-full max-w-[24rem] rounded-[2.6rem] bg-tinta p-3 shadow-[0_30px_60px_-25px_rgb(23_21_15/0.55)]">
              {/* lazy: si el marco está oculto (celular), no se carga. */}
              <iframe
                key={config.rubro}
                src="/c/prueba"
                loading="lazy"
                title={`Prueba de la caja de ${RUBROS[config.rubro].nombre.toLowerCase()}`}
                className="block h-[min(80svh,46rem)] w-full rounded-[2rem] bg-[#fffdf7]"
              />
            </div>
            <p className="mt-3 text-center text-mini text-tinta-suave">Lo que cargues en la prueba queda solo en este navegador.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
