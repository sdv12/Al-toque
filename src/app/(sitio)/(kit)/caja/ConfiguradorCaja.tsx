"use client";

import { useEffect, useId, useState, type ReactNode, useSyncExternalStore } from "react";
import { COLORES_CAJA, cajaDesdeQuery, cajaPorDefecto, codificarCaja, validarCaja, type CajaConfig, type ColorCaja } from "@/cajas/config";
import { CLAVE_PRUEBA } from "@/cajas/prueba";
import { RUBROS, RUBROS_CAJA, type RubroCaja } from "@/cajas/rubros";
import { formatearPesos } from "@/core/lib/mensajes";
import { MODULOS_CAJA, cotizarCaja, preciosVigentesHasta, type IdModuloCaja } from "@/core/lib/precios";
import { claseControl } from "../configurador/campos";
import { slugDe } from "../configurador/estado";
import { afiche, boton, margen } from "../_home/Secciones";
import { enviarPedido, type ResultadoPedido } from "../pedido";
import { AvisoDatos } from "../legales/AvisoDatos";

type Envio = { estado: "enviando" } | ({ estado: "listo" } & ResultadoPedido) | { estado: "error" };

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

const sinSuscripcion = () => () => {};

/**
 * Llegando desde Alto la URL trae rubro, nombre y color (?rubro=…). En el servidor se dibuja la
 * caja por defecto; en el navegador, si hay datos en la URL, el formulario se vuelve a montar con ellos.
 */
export function ConfiguradorCaja({ whatsapp }: { whatsapp: string | undefined }) {
  const busqueda = useSyncExternalStore(sinSuscripcion, () => window.location.search, () => "");
  return <Formulario key={busqueda} inicial={busqueda ? cajaDesdeQuery(busqueda) : cajaPorDefecto()} whatsapp={whatsapp} />;
}

function Formulario({ whatsapp, inicial }: { whatsapp: string | undefined; inicial: CajaConfig }) {
  const [config, setConfig] = useState<CajaConfig>(inicial);
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
  const [envio, setEnvio] = useState<Envio | null>(null);

  async function pedir() {
    if (!whatsapp || !codigo) return;
    const nombre = config.negocio.nombre.trim();
    const rubro = RUBROS[config.rubro].nombre;
    const con = modulosElegidos.length ? modulosElegidos.map((m) => MODULOS_CAJA[m].nombre).join(", ") : "solo lo básico";
    // Sin await antes de enviarPedido: abre la pestaña de WhatsApp en este mismo clic.
    const pedido = enviarPedido(
      {
        tipo: "Caja",
        negocio: nombre,
        detalle: `${rubro} · ${con}`,
        estimado,
        slug: slugDe(nombre),
        saludo: "Hola! Quiero la caja para mi negocio.",
        resumen: [`Negocio: ${nombre}`, `Rubro: ${rubro}`, `Con: ${con}`, `Estimado: ${estimado}`],
        configuracion: config,
        codigo,
        nivel: "caja",
      },
      whatsapp,
    );
    setEnvio({ estado: "enviando" });
    const r = await pedido;
    setEnvio(r.porWhatsapp || r.respaldada || r.link ? { estado: "listo", ...r } : { estado: "error" });
  }

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

          <div className="rounded-base border-2 border-tinta bg-superficie p-6" data-precios>
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
              <button
                type="button"
                onClick={pedir}
                disabled={!whatsapp || !codigo || envio?.estado === "enviando"}
                className={`${boton.tinta} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {envio?.estado === "enviando" ? "Enviando…" : "Pedir mi caja por WhatsApp"}
              </button>
              <a href="/c/prueba" target="_blank" rel="noopener" className={boton.contorno}>
                Probarla en pantalla completa
              </a>
            </div>
            {envio?.estado === "listo" && (
              <p role="status" className="mt-3 text-chico">
                <span className="font-semibold">
                  ¡Listo! Recibimos tu pedido{envio.numero && <span className="tabular-nums"> {envio.numero}</span>}.
                </span>{" "}
                {envio.porWhatsapp ? (
                  "Se abrió WhatsApp con el mensaje: si todavía no lo mandaste, solo falta tocar enviar."
                ) : envio.link ? (
                  <>
                    <a href={envio.link} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                      Abrí WhatsApp
                    </a>{" "}
                    y mandanos el mensaje con tu número de pedido.
                  </>
                ) : null}
              </p>
            )}
            {envio?.estado === "error" && (
              <p role="alert" className="mt-3 text-chico text-[#b3261e]">
                No pudimos enviarlo. Probá de nuevo en un rato.
              </p>
            )}
            {!validacion.ok && <p className="mt-3 text-chico text-[#b3261e]">Completá el nombre del negocio para pedirla.</p>}
            {!whatsapp && <p className="mt-3 text-chico text-tinta-suave">Falta configurar NEXT_PUBLIC_OWNER_WHATSAPP.</p>}
            <AvisoDatos accion="Pedir mi caja por WhatsApp" className="mt-3" />
            <p className="mt-3 text-mini text-tinta-suave">
              Precios de referencia en pesos argentinos, vigentes hasta el {preciosVigentesHasta()} (se actualizan cada tres meses). El valor final se confirma al charlar tu caja.
            </p>
          </div>
        </form>

        {/* En pantallas chicas la caja no entra bien dentro de un marco: ahí se prueba con el botón
            «Probarla en pantalla completa» del final del formulario. */}
        <div className="hidden @3xl:block @5xl:col-span-5">
          <div className="@5xl:sticky @5xl:top-6">
            <p className="mb-3 text-center text-chico font-semibold">Probala acá: vendé, cambiá precios, anotá un fiado.</p>
            <div className="mx-auto w-fit rounded-[2.4rem] bg-tinta p-2.5 shadow-[0_30px_60px_-25px_rgb(23_21_15/0.55)]">
              {/* Pantalla con la proporción de un celular real. La caja se dibuja en un viewport 25% más
                  grande y se achica al 80%: así letras y botones quedan en escala con el marco. */}
              <div className="relative aspect-[390/844] h-[min(78svh,42rem)] overflow-hidden rounded-[1.9rem] bg-[#fffdf7]">
                {/* lazy: si el marco está oculto (celular), no se carga. */}
                <iframe
                  key={config.rubro}
                  src="/c/prueba?marco=1"
                  loading="lazy"
                  title={`Prueba de la caja de ${RUBROS[config.rubro].nombre.toLowerCase()}`}
                  className="absolute top-0 left-0 block h-[125%] w-[125%] origin-top-left scale-[0.8] border-0 bg-[#fffdf7]"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-mini text-tinta-suave">Lo que cargues en la prueba queda solo en este navegador.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
