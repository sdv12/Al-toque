"use client";

import { useId } from "react";
import { formatearPesos } from "@/core/lib/mensajes";
import { TIPOS_PUNTO, type Propiedad, type PuntoInteres } from "@/core/schema/contenido";
import type { Imagen } from "@/core/schema/comun";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque, CampoArea, CampoLineas, CampoNumero, CampoTexto, Selector, botonKit, claseControl } from "../campos";
import { nuevoId } from "../estado";
import { ListaEditable, mover } from "./ListaEditable";

type Editar = (f: (c: LandingConfig) => void) => void;
type Props = { config: LandingConfig; editar: Editar; errorDe: (ruta: string) => string | undefined };

const TEXTO_TIPO: Record<PuntoInteres["tipo"], string> = {
  pueblo: "Pueblo",
  rio: "Río o arroyo",
  ruta: "Ruta",
  sendero: "Sendero o cerro",
  comercio: "Comercio",
  otro: "Otro",
};

function nuevaCasa(): Propiedad {
  return {
    id: nuevoId("casa"),
    nombre: "Nueva casa",
    resumen: "",
    capacidad: 4,
    dormitorios: 1,
    banos: 1,
    amenities: [],
    reglas: { mascotas: "consultar", checkIn: "14:00", checkOut: "10:00", senaPorcentaje: 30, otras: [] },
    precioNoche: null,
    minNoches: 2,
    fotos: [],
    mapa: { x: 50, y: 50 },
  };
}

/**
 * Posición en el mapa ilustrado: se hace clic en el recuadro (o se escriben los números).
 * Los demás puntos se ven tenues como referencia.
 */
function SelectorPosicion({
  valor,
  otros,
  onCambio,
}: {
  valor: { x: number; y: number } | undefined;
  otros: { x: number; y: number; nombre: string }[];
  onCambio: (v: { x: number; y: number }) => void;
}) {
  const id = useId();
  const v = valor ?? { x: 50, y: 50 };
  return (
    <div>
      <p id={id} className="text-chico font-medium">
        Ubicación en el mapa
      </p>
      <p className="text-mini text-tinta-suave">Hacé clic en el recuadro, o ajustá los números (0 a 100).</p>
      <div
        role="presentation"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onCambio({
            x: Math.round(((e.clientX - r.left) / r.width) * 100),
            y: Math.round(((e.clientY - r.top) / r.height) * 100),
          });
        }}
        className="relative mt-2 aspect-[4/3] cursor-crosshair overflow-hidden rounded-base border border-borde bg-superficie-2"
      >
        {otros.map((o, i) => (
          <span
            key={i}
            title={o.nombre}
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tinta-suave/50"
            style={{ left: `${o.x}%`, top: `${o.y}%` }}
          />
        ))}
        <span
          aria-hidden
          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-superficie bg-acento-relleno shadow"
          style={{ left: `${v.x}%`, top: `${v.y}%` }}
        />
      </div>
      <div role="group" aria-labelledby={id} className="mt-2 grid grid-cols-2 gap-3">
        <CampoNumero etiqueta="Horizontal (x)" min={0} max={100} valor={v.x} onCambio={(x) => onCambio({ ...v, x: Math.min(100, x ?? 0) })} />
        <CampoNumero etiqueta="Vertical (y)" min={0} max={100} valor={v.y} onCambio={(y) => onCambio({ ...v, y: Math.min(100, y ?? 0) })} />
      </div>
    </div>
  );
}

function Fotos({ fotos, onCambio, nombreCasa }: { fotos: Imagen[]; onCambio: (f: Imagen[]) => void; nombreCasa: string }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-chico font-medium">Fotos</legend>
      <p className="text-mini text-tinta-suave">Sin link se muestra «Tu foto acá» con la descripción.</p>
      {fotos.map((f, i) => (
        <div key={i} className="space-y-2 rounded-base border border-borde p-2">
          <input
            aria-label={`Link de la foto ${i + 1}`}
            placeholder="https://…"
            type="url"
            value={f.src ?? ""}
            onChange={(e) => {
              const copia = [...fotos];
              const foto: Imagen = { alt: f.alt };
              if (e.target.value.trim()) foto.src = e.target.value.trim();
              copia[i] = foto;
              onCambio(copia);
            }}
            className={claseControl}
          />
          <div className="flex gap-2">
            <input
              aria-label={`Qué se ve en la foto ${i + 1}`}
              value={f.alt}
              onChange={(e) => onCambio(fotos.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
              className={claseControl}
            />
            <button type="button" className={botonKit.icono} aria-label={`Quitar foto ${i + 1}`} onClick={() => onCambio(fotos.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
        </div>
      ))}
      <button type="button" className={botonKit.secundario} onClick={() => onCambio([...fotos, { alt: `Foto de ${nombreCasa}` }])}>
        + Agregar foto
      </button>
    </fieldset>
  );
}

export function EditorCasas({ config, editar, errorDe }: Props) {
  const casas = config.contenido.propiedades ?? [];
  const puntos = config.contenido.puntosInteres ?? [];
  const editarCasas = (cambio: (l: Propiedad[]) => void) =>
    editar((c) => {
      const l = c.contenido.propiedades ?? [];
      cambio(l);
      c.contenido.propiedades = l;
    });

  return (
    <Bloque titulo="Casas" descripcion="Cada casa tiene su ficha, fotos, reglas y precio por noche en pesos.">
      <ListaEditable
        items={casas}
        resumen={(p) => `${p.nombre || "Sin nombre"} · ${p.precioNoche === null ? "a consultar" : `${formatearPesos(p.precioNoche)}/noche`}`}
        textoAgregar="Agregar casa"
        onAgregar={() => editarCasas((l) => void l.push(nuevaCasa()))}
        onQuitar={(i) => editarCasas((l) => void l.splice(i, 1))}
        onMover={(i, j) => editarCasas((l) => mover(l, i, j))}
        render={(p, i) => {
          const set = (cambio: Partial<Propiedad>) => editarCasas((l) => void Object.assign(l[i]!, cambio));
          const setReglas = (cambio: Partial<Propiedad["reglas"]>) => editarCasas((l) => void Object.assign(l[i]!.reglas, cambio));
          const ruta = `contenido.propiedades.${i}`;
          return (
            <>
              <CampoTexto etiqueta="Nombre" valor={p.nombre} onCambio={(v) => set({ nombre: v })} error={errorDe(`${ruta}.nombre`)} />
              <CampoArea etiqueta="Resumen" ayuda="Una o dos líneas: qué la hace especial." filas={2} maxLength={240} valor={p.resumen} onCambio={(v) => set({ resumen: v })} />
              <div className="grid grid-cols-2 gap-3">
                <CampoNumero etiqueta="Precio por noche" prefijo="$" paso={1000} valor={p.precioNoche} onCambio={(v) => set({ precioNoche: v })} ayuda="Vacío = a consultar" />
                <CampoNumero etiqueta="Mínimo de noches" min={1} max={30} valor={p.minNoches} onCambio={(v) => set({ minNoches: v ?? 1 })} />
                <CampoNumero etiqueta="Capacidad" min={1} max={40} valor={p.capacidad} onCambio={(v) => set({ capacidad: v ?? 1 })} error={errorDe(`${ruta}.maxHuespedes`)} />
                <CampoNumero etiqueta="Dormitorios" min={0} max={20} valor={p.dormitorios} onCambio={(v) => set({ dormitorios: v ?? 0 })} ayuda="0 = monoambiente" />
                <CampoNumero etiqueta="Baños" min={0} max={20} valor={p.banos} onCambio={(v) => set({ banos: v ?? 0 })} />
              </div>
              <CampoTexto etiqueta="Camas" placeholder="1 matrimonial + 2 simples" valor={p.camas ?? ""} onCambio={(v) => set({ camas: v || undefined })} />
              <CampoLineas
                etiqueta="Qué hay (una por línea)"
                filas={4}
                valor={p.amenities}
                onCambio={(v) => set({ amenities: v })}
                error={errorDe(`${ruta}.amenities`)}
              />
              <fieldset className="space-y-3 rounded-base border border-borde p-3">
                <legend className="px-1 text-chico font-medium">Reglas</legend>
                <Selector
                  etiqueta="Mascotas"
                  valor={p.reglas.mascotas}
                  opciones={[
                    { valor: "si", texto: "Se aceptan" },
                    { valor: "no", texto: "No se aceptan" },
                    { valor: "consultar", texto: "A consultar" },
                  ]}
                  onCambio={(v) => setReglas({ mascotas: v })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-chico font-medium">
                    Entrada desde
                    <input type="time" value={p.reglas.checkIn} onChange={(e) => setReglas({ checkIn: e.target.value })} className={`${claseControl} mt-1`} />
                  </label>
                  <label className="text-chico font-medium">
                    Salida hasta
                    <input type="time" value={p.reglas.checkOut} onChange={(e) => setReglas({ checkOut: e.target.value })} className={`${claseControl} mt-1`} />
                  </label>
                </div>
                <CampoNumero etiqueta="Seña (%)" min={0} max={100} valor={p.reglas.senaPorcentaje} onCambio={(v) => setReglas({ senaPorcentaje: Math.min(100, v ?? 0) })} />
                <CampoLineas etiqueta="Otras reglas (una por línea)" filas={3} valor={p.reglas.otras} onCambio={(v) => setReglas({ otras: v })} />
              </fieldset>
              <Fotos fotos={p.fotos} nombreCasa={p.nombre} onCambio={(fotos) => set({ fotos })} />
              <SelectorPosicion
                valor={p.mapa}
                otros={[...puntos, ...casas.filter((c) => c.id !== p.id && c.mapa).map((c) => ({ ...c.mapa!, nombre: c.nombre }))]}
                onCambio={(mapa) => set({ mapa })}
              />
            </>
          );
        }}
      />
    </Bloque>
  );
}

export function EditorPuntos({ config, editar, errorDe }: Props) {
  const puntos = config.contenido.puntosInteres ?? [];
  const casas = (config.contenido.propiedades ?? []).filter((c) => c.mapa);
  const editarPuntos = (cambio: (l: PuntoInteres[]) => void) =>
    editar((c) => {
      const l = c.contenido.puntosInteres ?? [];
      cambio(l);
      c.contenido.puntosInteres = l;
    });

  return (
    <Bloque titulo="La zona" descripcion="Pueblos, ríos, rutas y paseos con la distancia desde las casas. Arman el mapa ilustrado.">
      <ListaEditable
        items={puntos}
        resumen={(p) => `${p.nombre || "Sin nombre"} · ${p.distanciaKm} km`}
        textoAgregar="Agregar lugar"
        onAgregar={() => editarPuntos((l) => void l.push({ id: nuevoId("lugar"), nombre: "Nuevo lugar", tipo: "pueblo", distanciaKm: 5, x: 30, y: 30 }))}
        onQuitar={(i) => editarPuntos((l) => void l.splice(i, 1))}
        onMover={(i, j) => editarPuntos((l) => mover(l, i, j))}
        render={(p, i) => {
          const set = (cambio: Partial<PuntoInteres>) => editarPuntos((l) => void Object.assign(l[i]!, cambio));
          const ruta = `contenido.puntosInteres.${i}`;
          return (
            <>
              <CampoTexto etiqueta="Nombre" valor={p.nombre} onCambio={(v) => set({ nombre: v })} error={errorDe(`${ruta}.nombre`)} />
              <Selector etiqueta="Tipo" valor={p.tipo} opciones={TIPOS_PUNTO.map((t) => ({ valor: t, texto: TEXTO_TIPO[t] }))} onCambio={(v) => set({ tipo: v })} />
              <div className="grid grid-cols-2 gap-3">
                <CampoNumero etiqueta="Distancia (km)" decimales paso={0.5} valor={p.distanciaKm} onCambio={(v) => set({ distanciaKm: v ?? 0 })} />
                <CampoNumero etiqueta="Minutos en auto" valor={p.minutos ?? null} onCambio={(v) => set({ minutos: v ?? undefined })} />
              </div>
              <CampoTexto etiqueta="Nota (opcional)" placeholder="Ollas para bañarse" valor={p.nota ?? ""} maxLength={80} onCambio={(v) => set({ nota: v || undefined })} />
              <SelectorPosicion
                valor={{ x: p.x, y: p.y }}
                otros={[...puntos.filter((o) => o.id !== p.id), ...casas.map((c) => ({ ...c.mapa!, nombre: c.nombre }))]}
                onCambio={(pos) => set(pos)}
              />
            </>
          );
        }}
      />
    </Bloque>
  );
}
