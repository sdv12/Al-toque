"use client";

import { formatearPesos } from "@/core/lib/mensajes";
import { EXTRAS, PRESUPUESTOS, cotizar, nivelDe, sugerenciasParaPresupuesto, type IdExtra, type IdPresupuesto } from "@/core/lib/precios";
import { slugDe } from "../estado";
import { elegirPresupuesto, usePresupuesto } from "../presupuesto";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque } from "../campos";

type Editar = (f: (c: LandingConfig) => void) => void;

/** Total estimado corto para la cabecera del configurador. */
export function totalCorto(config: LandingConfig): string {
  const { total } = cotizar(config);
  return `${formatearPesos(total.unico)} + ${formatearPesos(total.mensual)}/mes`;
}

export function PestanaPrecio({ config, editar }: { config: LandingConfig; editar: Editar }) {
  const c = cotizar(config);
  const elegidos = new Set(config.extras ?? []);
  const nivel = nivelDe(config);
  const presupuesto = usePresupuesto();
  const sugerencias = presupuesto ? sugerenciasParaPresupuesto(config, presupuesto) : [];
  const slug = slugDe(config.negocio.nombre) || "tunegocio";
  const propio = elegidos.has("dominio");

  const alternar = (id: IdExtra, activo: boolean) =>
    editar((b) => {
      const s = new Set(b.extras ?? []);
      if (activo) s.add(id);
      else s.delete(id);
      if (s.size) b.extras = [...s];
      else delete b.extras;
    });

  return (
    <>
      <Bloque titulo="Tu dirección" descripcion="Dónde va a estar tu página. La podés cambiar después.">
        <fieldset className="space-y-2">
          <legend className="sr-only">Dirección de la página</legend>
          {[
            { valor: false, titulo: "Dirección de Al Toque · sin costo", texto: `${slug}.altoque-cba.com.ar` },
            { valor: true, titulo: `Dominio propio · +${formatearPesos(EXTRAS.dominio.unico)}`, texto: `${slug}.com.ar, registrado a tu nombre (la renovación anual va aparte)` },
          ].map((o) => (
            <label key={String(o.valor)} className="flex cursor-pointer items-start gap-3 rounded-base border border-borde bg-superficie p-3 has-[:checked]:border-tinta">
              <input type="radio" name="direccion" checked={propio === o.valor} onChange={() => alternar("dominio", o.valor)} className="mt-1 size-4 accent-[var(--lk-acento)]" />
              <span className="min-w-0">
                <span className="block font-medium">{o.titulo}</span>
                <span className="block break-all font-mono text-mini text-tinta-suave">{o.texto}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Bloque>

      <Bloque titulo="Tu presupuesto estimado" descripcion="Se actualiza mientras armás la página. Son precios de referencia en pesos: el valor final se confirma al ver tu proyecto.">
        <p className="mb-3 rounded-base bg-superficie-2 px-3 py-2 text-chico">
          Nivel: <strong className="font-semibold">{nivel.nombre}</strong>
          {nivel.id === "perfil" && " · hasta 3 bloques en una dirección de Al Toque"}
        </p>
        <table className="w-full text-chico">
          <caption className="sr-only">Detalle del presupuesto</caption>
          <thead>
            <tr className="border-b border-borde text-left text-mini text-tinta-suave">
              <th scope="col" className="py-2 font-normal">
                Concepto
              </th>
              <th scope="col" className="py-2 text-right font-normal">
                Único
              </th>
              <th scope="col" className="py-2 text-right font-normal">
                Por mes
              </th>
            </tr>
          </thead>
          <tbody>
            {c.lineas.map((l) => (
              <tr key={l.concepto} className="border-b border-borde align-top">
                <th scope="row" className="py-2 pr-2 text-left font-normal">
                  {l.concepto}
                  {l.sistema && <span className="ml-1 rounded-full bg-[#fde7c2] px-1.5 text-mini font-semibold text-[#7a4a00]">sistema</span>}
                </th>
                <td className="whitespace-nowrap py-2 pl-3 text-right tabular-nums">{l.unico ? formatearPesos(l.unico) : "—"}</td>
                <td className="whitespace-nowrap py-2 pl-3 text-right tabular-nums">{l.mensual ? formatearPesos(l.mensual) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-cuerpo font-semibold">
              <th scope="row" className="pt-3 text-left">
                Total
              </th>
              <td className="whitespace-nowrap pt-3 pl-3 text-right tabular-nums">{formatearPesos(c.total.unico)}</td>
              <td className="whitespace-nowrap pt-3 pl-3 text-right tabular-nums">{formatearPesos(c.total.mensual)}</td>
            </tr>
          </tfoot>
        </table>
        {c.usaSistema && (
          <p role="note" className="rounded-base border-2 border-[#e9a23b] bg-[#fff6e5] p-3 text-chico text-[#5c3a00]">
            Tu página usa componentes con sistema: necesitan base de datos y servidor, por eso suman instalación y un costo mensual de mantenimiento.
          </p>
        )}
      </Bloque>

      <Bloque titulo="¿Cuánto pensás invertir?" descripcion="Opcional. Si lo que armaste se pasa, te decimos cómo hacerlo entrar. Nos llega con tu pedido.">
        <label className="block">
          <span className="sr-only">Lo que pensás invertir (pago único)</span>
          <select
            className="block w-full rounded-control border border-borde bg-superficie px-3 py-2 text-cuerpo"
            value={presupuesto ?? ""}
            onChange={(e) => elegirPresupuesto((e.target.value || null) as IdPresupuesto | null)}
          >
            <option value="">Prefiero no decirlo</option>
            {(Object.entries(PRESUPUESTOS) as [IdPresupuesto, (typeof PRESUPUESTOS)[IdPresupuesto]][]).map(([id, p]) => (
              <option key={id} value={id}>
                {p.etiqueta}
              </option>
            ))}
          </select>
        </label>
        {presupuesto && (sugerencias.length ? (
          <div role="status" className="mt-3 rounded-base border-2 border-[#e9a23b] bg-[#fff6e5] p-3 text-chico text-[#5c3a00]">
            <p className="font-semibold">Lo que armaste pasa lo que pensabas invertir. Algunas ideas:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {sugerencias.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p role="status" className="mt-3 rounded-base bg-superficie-2 px-3 py-2 text-chico">
            Entra en lo que pensabas invertir. 👌
          </p>
        ))}
      </Bloque>

      <Bloque titulo="Sumar funciones" descripcion="Opcionales. Las marcadas «sistema» necesitan base de datos.">
        <ul className="space-y-2">
          {(Object.entries(EXTRAS) as [IdExtra, (typeof EXTRAS)[IdExtra]][]).filter(([id]) => id !== "dominio").map(([id, e]) => (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-base border border-borde bg-superficie p-3">
                <input type="checkbox" checked={elegidos.has(id)} onChange={(ev) => alternar(id, ev.target.checked)} className="mt-1 size-4 accent-[var(--lk-acento)]" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {e.nombre}
                    {e.sistema && <span className="rounded-full bg-[#fde7c2] px-1.5 text-mini font-semibold text-[#7a4a00]">sistema</span>}
                  </span>
                  <span className="block text-mini text-tinta-suave">{e.descripcion}</span>
                  <span className="mt-1 block text-mini tabular-nums">
                    {e.unico ? `${formatearPesos(e.unico)} único` : ""}
                    {e.unico && e.mensual ? " · " : ""}
                    {e.mensual ? `${formatearPesos(e.mensual)} por mes` : ""}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Bloque>
    </>
  );
}
