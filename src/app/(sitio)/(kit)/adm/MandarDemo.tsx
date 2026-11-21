"use client";

import { useState, useSyncExternalStore } from "react";
import { RUBROS } from "../_alto/alto";
import { afiche } from "../_home/estilos";
import { PRODUCTOS, linkDemo, mensajeDemo, type Producto } from "./demos-mandar";

/*
 * Demos para mandar: escribís el nombre del negocio, elegís el rubro y el producto, y sale el link
 * de la demo ya personalizada con un mensaje armado para WhatsApp. Para prospectar.
 */

const nada = () => () => {};

export function MandarDemo() {
  const [nombre, setNombre] = useState("");
  const [rubro, setRubro] = useState(RUBROS[0]!.id);
  const [producto, setProducto] = useState<Producto>("web");
  const [copiado, setCopiado] = useState<string | null>(null);
  const ruta = linkDemo(producto, rubro, nombre);
  const origen = useSyncExternalStore(nada, () => window.location.origin, () => "");
  const url = ruta ? `${origen}${ruta}` : null;
  const mensaje = url ? mensajeDemo(producto, nombre, url) : "";
  const disponibles = (Object.keys(PRODUCTOS) as Producto[]).filter((p) => linkDemo(p, rubro, nombre));

  const copiar = async (texto: string, que: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(que);
      setTimeout(() => setCopiado(null), 2000);
    } catch {}
  };

  const control = "block min-h-11 w-full rounded-control border-2 border-tinta/20 bg-superficie px-3 text-cuerpo";
  return (
    <>
      <div className="pt-10 pb-6">
        <h1 className={`${afiche} text-titulo`}>Mandar una demo</h1>
        <p className="mt-2 max-w-medida text-subtitulo">La demo sale con el nombre y el rubro del negocio: así el cliente se imagina el suyo funcionando.</p>
      </div>
      <div className="grid gap-6 @4xl:grid-cols-2">
        <div className="space-y-4 rounded-base border-2 border-tinta bg-superficie p-6">
          <label className="block">
            <span className="mb-1 block text-chico font-semibold">Nombre del negocio</span>
            <input className={control} value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} placeholder="Ej: Barbería Lo de Juan" />
          </label>
          <label className="block">
            <span className="mb-1 block text-chico font-semibold">Rubro</span>
            <select
              className={control}
              value={rubro}
              onChange={(e) => {
                setRubro(e.target.value);
                if (!linkDemo(producto, e.target.value, nombre)) setProducto("web");
              }}
            >
              {RUBROS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="mb-1 block text-chico font-semibold">Qué le mostrás</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRODUCTOS) as Producto[]).map((p) => (
                <label key={p} className={`cursor-pointer ${disponibles.includes(p) ? "" : "pointer-events-none opacity-40"}`}>
                  <input type="radio" name="producto" value={p} checked={producto === p} disabled={!disponibles.includes(p)} onChange={() => setProducto(p)} className="peer sr-only" />
                  <span className="inline-flex min-h-10 items-center rounded-full border-2 border-tinta px-4 text-chico font-semibold peer-checked:bg-tinta peer-checked:text-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-foco">
                    {PRODUCTOS[p]}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-mini text-tinta-suave">Turnos y caja aparecen si el rubro los usa.</p>
          </fieldset>
        </div>

        <div className="flex flex-col gap-4 rounded-base border-2 border-tinta bg-superficie-2 p-6">
          {url ? (
            <>
              <p className="text-chico font-semibold">El link</p>
              <p className="break-all rounded-base bg-superficie p-3 font-mono text-mini">{url}</p>
              <p className="text-chico font-semibold">El mensaje</p>
              <p className="whitespace-pre-line rounded-base bg-superficie p-3 text-chico [overflow-wrap:anywhere]">{mensaje}</p>
              <div className="mt-auto flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-control bg-tinta px-5 text-chico font-semibold text-fondo">
                  Mandar por WhatsApp
                </a>
                <button type="button" onClick={() => copiar(mensaje, "mensaje")} className="inline-flex min-h-11 items-center rounded-control border-2 border-tinta px-5 text-chico font-semibold">
                  {copiado === "mensaje" ? "¡Copiado!" : "Copiar el mensaje"}
                </button>
                <button type="button" onClick={() => copiar(url, "link")} className="inline-flex min-h-11 items-center rounded-control border-2 border-tinta px-5 text-chico font-semibold">
                  {copiado === "link" ? "¡Copiado!" : "Copiar el link"}
                </button>
                <a href={ruta!} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-control px-3 text-chico font-semibold underline underline-offset-4">
                  Verla antes
                </a>
              </div>
            </>
          ) : (
            <p className="text-chico">Elegí qué le querés mostrar.</p>
          )}
        </div>
      </div>
    </>
  );
}
