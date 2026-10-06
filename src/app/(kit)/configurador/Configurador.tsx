"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { registry } from "@/core/registry";
import { useBorrador, type Pestana } from "./estado";
import { PestanaContenido } from "./pestanas/PestanaContenido";
import { PestanaEnviar } from "./pestanas/PestanaEnviar";
import { PestanaEstilo } from "./pestanas/PestanaEstilo";
import { PestanaBloques } from "./pestanas/PestanaBloques";
import { PestanaPlantilla } from "./pestanas/PestanaPlantilla";
import { PestanaPrecio, totalCorto } from "./pestanas/PestanaPrecio";
import { PestanaSecciones } from "./pestanas/PestanaSecciones";
import { PestanaTextos } from "./pestanas/PestanaTextos";
import { Preview, type Dispositivo } from "./Preview";

const PESTANAS: { id: Pestana; texto: string }[] = [
  { id: "plantilla", texto: "Plantilla" },
  { id: "estilo", texto: "Estilo" },
  { id: "secciones", texto: "Secciones" },
  { id: "textos", texto: "Textos" },
  { id: "contenido", texto: "Contenido" },
  { id: "precio", texto: "Precio" },
  { id: "enviar", texto: "Enviar" },
];

export default function Configurador() {
  const { config, editar, reemplazar, usarEjemplo, errores, guardado, pendiente, resolverPendiente } = useBorrador();
  const [pestana, setPestana] = useState<Pestana>("plantilla");
  const [dispositivo, setDispositivo] = useState<Dispositivo>("escritorio");
  // Mobile: hoja inferior plegable sobre el preview.
  const [hojaAbierta, setHojaAbierta] = useState(true);

  const errorDe = (ruta: string) => errores.find((e) => e.ruta === ruta)?.mensaje;
  const irA = (p: Pestana) => {
    setPestana(p);
    setHojaAbierta(true);
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-borde bg-superficie px-4">
        <div className="min-w-0">
          <h1 className="truncate text-chico font-semibold">Configurador</h1>
          <p className="truncate text-mini text-tinta-suave">
            {registry[config.plantilla].meta.nombre} ·{" "}
            <span aria-live="polite">
              {guardado === "guardado" ? "Borrador guardado" : guardado === "pendiente" ? "Guardando…" : "Sin guardado local"}
            </span>
            <span className="tabular-nums"> · v{process.env.NEXT_PUBLIC_VERSION}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => irA("precio")}
          className="ml-auto shrink-0 rounded-control border border-borde px-3 py-1 text-right hover:border-tinta-suave"
          aria-label={`Presupuesto estimado: ${totalCorto(config)}. Ver detalle`}
        >
          <span className="block text-mini text-tinta-suave">Estimado</span>
          <span className="block text-chico font-semibold tabular-nums">{totalCorto(config)}</span>
        </button>
        <fieldset className="hidden @5xl:block">
          <legend className="sr-only">Tamaño de la vista previa</legend>
          <div className="flex rounded-control border border-borde p-0.5">
            {(["escritorio", "celular"] as const).map((d) => (
              <label key={d} className="cursor-pointer">
                <input type="radio" name="dispositivo" value={d} checked={dispositivo === d} onChange={() => setDispositivo(d)} className="peer sr-only" />
                <span className="block rounded-[4px] px-3 py-1 text-chico capitalize text-tinta-suave peer-checked:bg-acento-relleno peer-checked:text-sobre-acento peer-focus-visible:outline-2 peer-focus-visible:outline-foco">
                  {d}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </header>

      <div className="flex min-h-0 flex-1 flex-col @5xl:grid @5xl:grid-cols-[26rem_minmax(0,1fr)]">
        <Tabs.Root
          value={pestana}
          onValueChange={(v) => setPestana(v as Pestana)}
          className={`order-2 z-20 flex shrink-0 flex-col border-t border-borde bg-fondo shadow-[0_-12px_32px_-12px_rgb(0_0_0/0.25)] transition-[height] duration-200 @5xl:order-1 @5xl:h-auto @5xl:min-h-0 @5xl:border-r @5xl:border-t-0 @5xl:shadow-none ${
            hojaAbierta ? "h-[58dvh]" : "h-[6.5rem]"
          }`}
        >
          <button
            type="button"
            onClick={() => setHojaAbierta((a) => !a)}
            aria-expanded={hojaAbierta}
            className="flex shrink-0 items-center justify-center gap-2 py-2 text-mini text-tinta-suave @5xl:hidden"
          >
            <span aria-hidden className="h-1 w-10 rounded-full bg-borde" />
            {hojaAbierta ? "Ver más de la vista previa" : "Abrir el panel de edición"}
          </button>
          <Tabs.List aria-label="Pasos de la configuración" className="flex shrink-0 gap-1 overflow-x-auto border-b border-borde px-3 pb-2 @5xl:pt-3">
            {PESTANAS.map((p) => (
              <Tabs.Trigger
                key={p.id}
                value={p.id}
                onClick={() => setHojaAbierta(true)}
                className="shrink-0 rounded-control px-3 py-1.5 text-chico text-tinta-suave hover:text-tinta data-[state=active]:bg-acento-relleno data-[state=active]:text-sobre-acento"
              >
                {p.id === "secciones" && config.plantilla === "libre" ? "Bloques" : p.texto}
                {p.id === "enviar" && errores.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#b3261e] px-1.5 text-mini text-white" aria-label={`${errores.length} para revisar`}>
                    {errores.length}
                  </span>
                )}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Tabs.Content value="plantilla">
              <PestanaPlantilla config={config} usarEjemplo={usarEjemplo} pendiente={pendiente} resolverPendiente={resolverPendiente} />
            </Tabs.Content>
            <Tabs.Content value="estilo">
              <PestanaEstilo key={`${config.plantilla}-${config.estilo.modo ?? ""}`} config={config} editar={editar} />
            </Tabs.Content>
            <Tabs.Content value="secciones">
              {config.plantilla === "libre" ? <PestanaBloques config={config} editar={editar} /> : <PestanaSecciones config={config} editar={editar} />}
            </Tabs.Content>
            <Tabs.Content value="textos">
              <PestanaTextos config={config} editar={editar} errorDe={errorDe} />
            </Tabs.Content>
            <Tabs.Content value="contenido">
              <PestanaContenido config={config} editar={editar} errorDe={errorDe} />
            </Tabs.Content>
            <Tabs.Content value="precio">
              <PestanaPrecio config={config} editar={editar} />
            </Tabs.Content>
            <Tabs.Content value="enviar">
              <PestanaEnviar config={config} errores={errores} reemplazar={reemplazar} irA={irA} />
            </Tabs.Content>
          </div>
        </Tabs.Root>

        <div className="order-1 min-h-0 flex-1 @5xl:order-2 @5xl:h-full">
          <Preview config={config} dispositivo={dispositivo} />
        </div>
      </div>
    </div>
  );
}
