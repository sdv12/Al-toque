"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { DATOS_INICIALES, SEMILLAS } from "@/core/defaults/libre";
import { formatearPesos } from "@/core/lib/mensajes";
import { cotizar } from "@/core/lib/precios";
import { seccionesDe, type DefSeccion } from "@/core/registry";
import type { Contenido } from "@/core/schema/contenido";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque, CampoArea, CampoTexto, Selector, botonKit } from "../campos";
import { nuevoId } from "../estado";

type Editar = (f: (c: LandingConfig) => void) => void;
type Instancia = { id: string; tipo: string; variante: string; activa: boolean; datos?: Record<string, string | undefined> };

const lista = (c: LandingConfig) => c.secciones as unknown as Instancia[];

export function PestanaBloques({ config, editar }: { config: LandingConfig; editar: Editar }) {
  const defs = seccionesDe(config.plantilla);
  const bloques = lista(config);
  const [aviso, setAviso] = useState("");
  const [recien, setRecien] = useState<string | null>(null);
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // Al agregar un bloque, la vista previa lo muestra.
  useEffect(() => {
    if (!recien) return;
    const t = setTimeout(() => document.getElementById(recien)?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    return () => clearTimeout(t);
  }, [recien]);

  // Lo que cuesta sumar un componente con sistema (la primera vez incluye la base de datos).
  const costoSistema = (() => {
    const actual = cotizar(config).total;
    const conUno = cotizar({ ...config, secciones: [...config.secciones, { id: "x", tipo: "turnos", variante: "agenda", activa: true }] as typeof config.secciones }).total;
    return { unico: conUno.unico - actual.unico, mensual: conUno.mensual - actual.mensual };
  })();

  function agregar(tipo: string, def: DefSeccion) {
    const id = nuevoId(tipo);
    editar((c) => {
      // Si el bloque necesita contenido y no hay, se carga uno de ejemplo para editar.
      for (const clave of def.requiere ?? []) {
        const actual = c.contenido[clave] as unknown[] | undefined;
        const semilla = SEMILLAS[clave];
        if ((!actual || actual.length === 0) && semilla) (c.contenido as Record<string, unknown>)[clave] = structuredClone(semilla) as Contenido[typeof clave];
      }
      const nueva: Instancia = { id, tipo, variante: Object.keys(def.variantes)[0]!, activa: true };
      const datos = DATOS_INICIALES[tipo];
      if (datos) nueva.datos = structuredClone(datos) as Instancia["datos"];
      lista(c).push(nueva);
    });
    setAviso(`Agregaste «${def.etiqueta}» al final de la página.`);
    setRecien(id);
  }

  const mover = (desde: number, hasta: number) => editar((c) => void (c.secciones = arrayMove(lista(c), desde, hasta) as unknown as typeof c.secciones));
  const actualizar = (id: string, cambio: (b: Instancia) => void) =>
    editar((c) => {
      const b = lista(c).find((x) => x.id === id);
      if (b) cambio(b);
    });
  const quitar = (id: string, etiqueta: string) => {
    editar((c) => void (c.secciones = lista(c).filter((x) => x.id !== id) as unknown as typeof c.secciones));
    setAviso(`Quitaste «${etiqueta}».`);
  };

  const alSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    mover(
      bloques.findIndex((b) => b.id === active.id),
      bloques.findIndex((b) => b.id === over.id),
    );
  };

  const presentes = new Set(bloques.map((b) => b.tipo));
  const entradas = Object.entries(defs);
  const basicos = entradas.filter(([, d]) => !d.sistema);
  const conSistema = entradas.filter(([, d]) => d.sistema);

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>
      <Bloque titulo="Tu página" descripcion="Arrastrá o usá las flechas para ordenar. Cada bloque toma tu estilo solo.">
        {bloques.length === 0 ? (
          <p className="rounded-base border-2 border-dashed border-borde p-4 text-center text-chico text-tinta-suave">
            Está en blanco: solo tiene encabezado y pie. Sumá bloques desde abajo.
          </p>
        ) : (
          <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
            <SortableContext items={bloques.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <ol className="space-y-2">
                {bloques.map((b, i) => (
                  <FilaBloque
                    key={b.id}
                    bloque={b}
                    def={defs[b.tipo]!}
                    onSubir={i > 0 ? () => mover(i, i - 1) : undefined}
                    onBajar={i < bloques.length - 1 ? () => mover(i, i + 1) : undefined}
                    onQuitar={() => quitar(b.id, defs[b.tipo]?.etiqueta ?? b.tipo)}
                    actualizar={(cambio) => actualizar(b.id, cambio)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
      </Bloque>

      <Bloque titulo="Agregar bloques" descripcion="Los básicos arman una página vidriera: muestran tu negocio y te contactan por WhatsApp.">
        <Biblioteca items={basicos} presentes={presentes} agregar={agregar} />
      </Bloque>

      <Bloque titulo="Componentes con sistema" descripcion="Para turnos, fechas, consultas o pagos que se guardan y se gestionan.">
        <div role="note" className="rounded-base border-2 border-[#e9a23b] bg-[#fff6e5] p-3 text-chico text-[#5c3a00]">
          <p className="font-semibold">Estos componentes necesitan un sistema detrás (base de datos y servidor), por eso salen más caros.</p>
          <p className="mt-1">
            El primero suma {formatearPesos(costoSistema.unico)} de instalación y {formatearPesos(costoSistema.mensual)} por mes (incluye la base de datos). En esta
            beta funcionan con confirmación por WhatsApp.
          </p>
        </div>
        <Biblioteca items={conSistema} presentes={presentes} agregar={agregar} />
      </Bloque>
    </>
  );
}

/** Lista de bloques para agregar (los no repetibles se deshabilitan si ya están). */
function Biblioteca({
  items,
  presentes,
  agregar,
}: {
  items: [string, DefSeccion][];
  presentes: ReadonlySet<string>;
  agregar: (tipo: string, def: DefSeccion) => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map(([tipo, def]) => {
        const usado = presentes.has(tipo) && !def.repetible;
        return (
          <li key={tipo}>
            <button
              type="button"
              disabled={usado}
              onClick={() => agregar(tipo, def)}
              className="flex w-full items-start gap-3 rounded-base border border-borde bg-superficie p-3 text-left hover:border-tinta-suave disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-control bg-superficie-2 font-semibold">
                +
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  <span>
                    <span className="sr-only">Agregar </span>
                    {def.etiqueta}
                  </span>
                  {def.sistema && <span className="rounded-full bg-[#fde7c2] px-2 text-mini font-semibold text-[#7a4a00]">Con sistema</span>}
                  {usado && <span className="text-mini font-normal text-tinta-suave">Ya está en tu página</span>}
                </span>
                <span className="block text-mini text-tinta-suave">{def.descripcion}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function FilaBloque({
  bloque: b,
  def,
  onSubir,
  onBajar,
  onQuitar,
  actualizar,
}: {
  bloque: Instancia;
  def: DefSeccion;
  onSubir: (() => void) | undefined;
  onBajar: (() => void) | undefined;
  onQuitar: () => void;
  actualizar: (cambio: (b: Instancia) => void) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
  const variantes = Object.entries(def.variantes).map(([valor, texto]) => ({ valor, texto }));
  const datos = b.datos ?? {};
  const setDato = (clave: string, valor: string) => actualizar((x) => void (x.datos = { ...(x.datos ?? {}), [clave]: valor || undefined }));

  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "relative z-10 shadow-lg" : ""}>
      <div className={`rounded-base border bg-superficie p-3 ${def.sistema ? "border-[#e9a23b]" : "border-borde"}`}>
        <div className="flex items-center gap-2">
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Mover ${def.etiqueta}`}
            className="grid h-9 w-7 shrink-0 cursor-grab touch-none place-items-center text-tinta-suave hover:text-tinta"
          >
            <svg viewBox="0 0 10 16" className="h-4 w-2.5" fill="currentColor" aria-hidden>
              {[2, 8, 14].flatMap((y) => [<circle key={`a${y}`} cx="2" cy={y} r="1.4" />, <circle key={`b${y}`} cx="8" cy={y} r="1.4" />])}
            </svg>
          </button>
          <span className="flex-1 font-medium">
            {def.etiqueta}
            {def.sistema && <span className="ml-2 text-mini font-semibold text-[#7a4a00]">con sistema</span>}
          </span>
          <button type="button" className={botonKit.icono} onClick={onSubir} disabled={!onSubir} aria-label={`Subir ${def.etiqueta}`}>
            <span aria-hidden>↑</span>
          </button>
          <button type="button" className={botonKit.icono} onClick={onBajar} disabled={!onBajar} aria-label={`Bajar ${def.etiqueta}`}>
            <span aria-hidden>↓</span>
          </button>
          <button type="button" className={botonKit.icono} onClick={onQuitar} aria-label={`Quitar ${def.etiqueta}`}>
            <span aria-hidden>×</span>
          </button>
        </div>
        <div className="mt-2 space-y-3 pl-9">
          {variantes.length > 1 && (
            <Selector etiqueta={`Variante de ${def.etiqueta}`} oculto valor={b.variante} opciones={variantes} onCambio={(v) => actualizar((x) => void (x.variante = v))} />
          )}
          {b.tipo === "texto" && (
            <>
              <CampoTexto etiqueta="Título (opcional)" valor={datos.titulo ?? ""} maxLength={80} onCambio={(v) => setDato("titulo", v)} />
              <CampoArea etiqueta="Texto" ayuda="Dejá una línea en blanco para separar párrafos." filas={4} maxLength={1200} valor={datos.cuerpo ?? ""} onCambio={(v) => setDato("cuerpo", v)} />
            </>
          )}
          {b.tipo === "cta" && (
            <>
              <CampoTexto etiqueta="Frase" valor={datos.titulo ?? ""} maxLength={80} onCambio={(v) => setDato("titulo", v)} />
              <CampoTexto etiqueta="Bajada (opcional)" valor={datos.texto ?? ""} maxLength={200} onCambio={(v) => setDato("texto", v)} />
              <CampoTexto etiqueta="Texto del botón" valor={datos.boton ?? ""} maxLength={30} onCambio={(v) => setDato("boton", v)} />
            </>
          )}
          {def.requiere?.length ? <p className="text-mini text-tinta-suave">Su contenido se edita en la pestaña Contenido.</p> : null}
        </div>
      </div>
    </li>
  );
}
