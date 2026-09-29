"use client";

import { AGENDA_POR_DEFECTO } from "@/core/lib/agenda";
import { formatearPrecio } from "@/core/lib/mensajes";
import { seccionesDe } from "@/core/registry";
import type { Agenda, Imagen } from "@/core/schema/comun";
import type { ClaveContenido, Contenido } from "@/core/schema/contenido";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque, CampoArea, CampoLineas, CampoNumero, CampoTexto, Interruptor, Selector, botonKit, claseControl } from "../campos";
import { nuevoId } from "../estado";
import { EditorCasas, EditorPuntos } from "./EditoresAlojamiento";
import { ListaEditable, mover } from "./ListaEditable";

type Editar = (f: (c: LandingConfig) => void) => void;
type Props = { config: LandingConfig; editar: Editar; errorDe: (ruta: string) => string | undefined };

/** Colecciones que usa la plantilla actual (según lo que exigen sus secciones). */
function coleccionesDe(config: LandingConfig): Set<ClaveContenido> {
  return new Set(Object.values(seccionesDe(config.plantilla)).flatMap((d) => d.requiere ?? []));
}

const USA_TURNOS = new Set(["barberia", "consultorio"]);

export function PestanaContenido({ config, editar, errorDe }: Props) {
  const usadas = coleccionesDe(config);
  const c = config.contenido;
  const esConsultorio = config.plantilla === "consultorio";
  const editarLineas = (clave: "obrasSociales" | "primeraConsulta", lista: string[]) =>
    editar((b) => {
      b.contenido[clave] = lista;
    });

  /** Edita una colección entera sobre la copia del borrador. */
  const editarLista = <K extends ClaveContenido>(clave: K, cambio: (lista: NonNullable<Contenido[K]>) => void) =>
    editar((borrador) => {
      const lista = (borrador.contenido[clave] ?? []) as NonNullable<Contenido[K]>;
      cambio(lista);
      borrador.contenido[clave] = lista;
    });

  return (
    <>
      {usadas.has("propiedades") && <EditorCasas config={config} editar={editar} errorDe={errorDe} />}
      {usadas.has("puntosInteres") && <EditorPuntos config={config} editar={editar} errorDe={errorDe} />}
      {usadas.has("casos") && (
        <Bloque titulo="Trabajos" descripcion="Cada trabajo como un caso: el problema, lo que hiciste y el resultado. Con fotos de antes y después.">
          <ListaEditable
            items={c.casos ?? []}
            resumen={(k) => k.titulo || "Sin título"}
            textoAgregar="Agregar trabajo"
            onAgregar={() =>
              editarLista("casos", (l) =>
                void l.push({
                  id: nuevoId("caso"),
                  titulo: "Nuevo trabajo",
                  problema: "Qué pasaba antes.",
                  solucion: "Qué hicimos.",
                  antes: { alt: "Antes" },
                  despues: { alt: "Después" },
                }),
              )
            }
            onQuitar={(i) => editarLista("casos", (l) => void l.splice(i, 1))}
            onMover={(i, j) => editarLista("casos", (l) => mover(l, i, j))}
            render={(k, i) => {
              const set = (cambio: Partial<typeof k>) => editarLista("casos", (l) => void Object.assign(l[i]!, cambio));
              const ruta = `contenido.casos.${i}`;
              return (
                <>
                  <CampoTexto etiqueta="Título" valor={k.titulo} maxLength={80} onCambio={(v) => set({ titulo: v })} error={errorDe(`${ruta}.titulo`)} />
                  <CampoTexto etiqueta="Cliente o lugar (opcional)" valor={k.cliente ?? ""} maxLength={60} onCambio={(v) => set({ cliente: v || undefined })} />
                  <CampoArea etiqueta="El problema" filas={2} maxLength={300} valor={k.problema} onCambio={(v) => set({ problema: v })} error={errorDe(`${ruta}.problema`)} />
                  <CampoArea etiqueta="Lo que hicimos" filas={2} maxLength={300} valor={k.solucion} onCambio={(v) => set({ solucion: v })} error={errorDe(`${ruta}.solucion`)} />
                  <CampoTexto etiqueta="Resultado (opcional)" ayuda="Algo medible si se puede: «40 % más de guardado»." valor={k.resultado ?? ""} maxLength={200} onCambio={(v) => set({ resultado: v || undefined })} />
                  <fieldset className="space-y-3 rounded-base border border-borde p-3">
                    <legend className="px-1 text-chico font-medium">Foto de antes</legend>
                    <CampoImagen imagen={k.antes} textoAlt="Antes" onCambio={(antes) => set({ antes })} error={errorDe(`${ruta}.antes.src`)} />
                  </fieldset>
                  <fieldset className="space-y-3 rounded-base border border-borde p-3">
                    <legend className="px-1 text-chico font-medium">Foto de después</legend>
                    <CampoImagen imagen={k.despues} textoAlt="Después" onCambio={(despues) => set({ despues })} error={errorDe(`${ruta}.despues.src`)} />
                  </fieldset>
                </>
              );
            }}
          />
        </Bloque>
      )}

      {usadas.has("servicios") && (
        <Bloque titulo="Servicios y precios" descripcion="Precios en pesos, sin puntos. Vacío = «A consultar».">
          <ListaEditable
            items={c.servicios ?? []}
            resumen={(s) => `${s.nombre || "Sin nombre"} · ${formatearPrecio(s)}`}
            textoAgregar="Agregar servicio"
            onAgregar={() => editarLista("servicios", (l) => void l.push({ id: nuevoId("servicio"), nombre: "Nuevo servicio", precio: null, duracionMin: 30 }))}
            onQuitar={(i) => editarLista("servicios", (l) => void l.splice(i, 1))}
            onMover={(i, j) => editarLista("servicios", (l) => mover(l, i, j))}
            render={(s, i) => {
              const set = (cambio: Partial<typeof s>) => editarLista("servicios", (l) => void Object.assign(l[i]!, cambio));
              const ruta = `contenido.servicios.${i}`;
              return (
                <>
                  <CampoTexto etiqueta="Nombre" valor={s.nombre} onCambio={(v) => set({ nombre: v })} error={errorDe(`${ruta}.nombre`)} />
                  <div className="grid grid-cols-2 gap-3">
                    <CampoNumero etiqueta="Precio" prefijo="$" paso={500} valor={s.precio} onCambio={(v) => set({ precio: v })} />
                    <CampoNumero etiqueta="Duración (min)" paso={5} min={5} valor={s.duracionMin} onCambio={(v) => set({ duracionMin: v ?? 30 })} />
                  </div>
                  <Interruptor etiqueta="Mostrar como «desde»" marcado={!!s.precioDesde} onCambio={(v) => set({ precioDesde: v })} />
                  <CampoTexto etiqueta="Categoría" ayuda="Agrupa la carta (ej.: Pelo, Barba, Combos)." valor={s.categoria ?? ""} onCambio={(v) => set({ categoria: v || undefined })} />
                  <CampoArea etiqueta="Descripción" filas={2} maxLength={200} valor={s.descripcion ?? ""} onCambio={(v) => set({ descripcion: v || undefined })} />
                  {esConsultorio && (
                    <div className="grid grid-cols-2 gap-3">
                      <Selector
                        etiqueta="Modalidad"
                        valor={s.modalidad ?? "presencial"}
                        opciones={[
                          { valor: "presencial", texto: "Presencial" },
                          { valor: "virtual", texto: "Virtual" },
                          { valor: "ambas", texto: "Las dos" },
                        ]}
                        onCambio={(v) => set({ modalidad: v })}
                      />
                      <Selector
                        etiqueta="Cobertura"
                        valor={s.cobertura ?? "ambas"}
                        opciones={[
                          { valor: "particular", texto: "Solo particular" },
                          { valor: "obra-social", texto: "Solo obra social" },
                          { valor: "ambas", texto: "Las dos" },
                        ]}
                        onCambio={(v) => set({ cobertura: v })}
                      />
                    </div>
                  )}
                  {(c.equipo?.length ?? 0) > 0 && (
                    <fieldset>
                      <legend className="text-chico font-medium">Lo hacen</legend>
                      <p className="text-mini text-tinta-suave">Sin marcar ninguno = lo hace todo el equipo.</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {c.equipo!.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-chico">
                            <input
                              type="checkbox"
                              className="size-4 accent-[var(--lk-acento)]"
                              checked={s.profesionalIds?.includes(p.id) ?? false}
                              onChange={(e) => {
                                const ids = new Set(s.profesionalIds ?? []);
                                if (e.target.checked) ids.add(p.id);
                                else ids.delete(p.id);
                                set({ profesionalIds: ids.size ? [...ids] : undefined });
                              }}
                            />
                            {p.nombre}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}
                </>
              );
            }}
          />
        </Bloque>
      )}

      {usadas.has("equipo") && (
        <Bloque titulo="Equipo">
          <ListaEditable
            items={c.equipo ?? []}
            resumen={(p) => p.nombre || "Sin nombre"}
            textoAgregar="Agregar persona"
            onAgregar={() => editarLista("equipo", (l) => void l.push({ id: nuevoId("persona"), nombre: "Nombre Apellido", rol: "Barbero", especialidad: "" }))}
            onQuitar={(i) =>
              editar((b) => {
                const id = b.contenido.equipo?.[i]?.id;
                b.contenido.equipo?.splice(i, 1);
                // Limpia referencias desde servicios.
                for (const s of b.contenido.servicios ?? []) {
                  s.profesionalIds = s.profesionalIds?.filter((x) => x !== id);
                  if (!s.profesionalIds?.length) delete s.profesionalIds;
                }
              })
            }
            onMover={(i, j) => editarLista("equipo", (l) => mover(l, i, j))}
            render={(p, i) => {
              const set = (cambio: Partial<typeof p>) => editarLista("equipo", (l) => void Object.assign(l[i]!, cambio));
              const ruta = `contenido.equipo.${i}`;
              return (
                <>
                  <CampoTexto etiqueta="Nombre" valor={p.nombre} onCambio={(v) => set({ nombre: v })} error={errorDe(`${ruta}.nombre`)} />
                  <div className="grid grid-cols-2 gap-3">
                    <CampoTexto etiqueta="Rol" valor={p.rol} onCambio={(v) => set({ rol: v })} error={errorDe(`${ruta}.rol`)} />
                    <CampoTexto etiqueta="Especialidad" valor={p.especialidad} onCambio={(v) => set({ especialidad: v })} />
                  </div>
                  {esConsultorio && (
                    <CampoTexto
                      etiqueta="Matrícula"
                      placeholder="MP 12.345 · ME 6.789"
                      ayuda="Se muestra junto al nombre y en el pie de la página."
                      valor={p.matricula ?? ""}
                      maxLength={30}
                      onCambio={(v) => set({ matricula: v || undefined })}
                    />
                  )}
                  <CampoArea etiqueta="Bio corta" filas={2} maxLength={280} valor={p.bio ?? ""} onCambio={(v) => set({ bio: v || undefined })} />
                  <CampoTexto etiqueta="Instagram" valor={p.instagram ?? ""} onCambio={(v) => set({ instagram: v.replace(/^@/, "") || undefined })} />
                  <CampoImagen imagen={p.foto} textoAlt={`Retrato de ${p.nombre}`} onCambio={(foto) => set({ foto })} error={errorDe(`${ruta}.foto.src`)} />
                </>
              );
            }}
          />
        </Bloque>
      )}

      {USA_TURNOS.has(config.plantilla) && <EditorAgenda agenda={config.agenda} editar={editar} />}

      {usadas.has("obrasSociales") && (
        <Bloque titulo="Obras sociales" descripcion="Una por línea. Aparecen en la lista buscable y en el selector de cobertura del turno.">
          <CampoLineas
            etiqueta="Coberturas aceptadas"
            filas={8}
            valor={c.obrasSociales ?? []}
            onCambio={(v) => editarLineas("obrasSociales", v)}
            error={errorDe("contenido.obrasSociales")}
          />
        </Bloque>
      )}

      {usadas.has("primeraConsulta") && (
        <Bloque titulo="Primera consulta" descripcion="Qué tiene que traer o saber el paciente. Una indicación por línea.">
          <CampoLineas
            etiqueta="Indicaciones"
            filas={6}
            valor={c.primeraConsulta ?? []}
            onCambio={(v) => editarLineas("primeraConsulta", v)}
            error={errorDe("contenido.primeraConsulta")}
          />
        </Bloque>
      )}

      {usadas.has("galeria") && (
        <Bloque titulo="Galería" descripcion="Hasta tener fotos, se muestran recuadros «Tu foto acá» con la descripción.">
          <ListaEditable
            items={c.galeria ?? []}
            resumen={(f) => f.epigrafe || f.alt || "Foto"}
            textoAgregar="Agregar foto"
            onAgregar={() => editarLista("galeria", (l) => void l.push({ alt: "Descripción de la foto" }))}
            onQuitar={(i) => editarLista("galeria", (l) => void l.splice(i, 1))}
            onMover={(i, j) => editarLista("galeria", (l) => mover(l, i, j))}
            render={(f, i) => (
              <>
                <CampoImagen imagen={f} textoAlt="" onCambio={(img) => editarLista("galeria", (l) => void (l[i] = { ...l[i]!, ...img }))} error={errorDe(`contenido.galeria.${i}.src`)} />
                <CampoTexto
                  etiqueta="Epígrafe (opcional)"
                  valor={f.epigrafe ?? ""}
                  onCambio={(v) => editarLista("galeria", (l) => void (l[i]!.epigrafe = v || undefined))}
                />
              </>
            )}
          />
        </Bloque>
      )}

      {usadas.has("testimonios") && (
        <Bloque titulo="Testimonios">
          <ListaEditable
            items={c.testimonios ?? []}
            resumen={(t) => t.autor || "Sin autor"}
            textoAgregar="Agregar testimonio"
            onAgregar={() => editarLista("testimonios", (l) => void l.push({ id: nuevoId("t"), autor: "Nombre", texto: "Lo que contó." }))}
            onQuitar={(i) => editarLista("testimonios", (l) => void l.splice(i, 1))}
            onMover={(i, j) => editarLista("testimonios", (l) => mover(l, i, j))}
            render={(t, i) => {
              const set = (cambio: Partial<typeof t>) => editarLista("testimonios", (l) => void Object.assign(l[i]!, cambio));
              return (
                <>
                  <CampoTexto etiqueta="Autor" valor={t.autor} onCambio={(v) => set({ autor: v })} error={errorDe(`contenido.testimonios.${i}.autor`)} />
                  <CampoArea etiqueta="Testimonio" valor={t.texto} maxLength={400} onCambio={(v) => set({ texto: v })} error={errorDe(`contenido.testimonios.${i}.texto`)} />
                  <CampoTexto etiqueta="Detalle (opcional)" ayuda="Ej.: «Cliente desde 2021»." valor={t.detalle ?? ""} onCambio={(v) => set({ detalle: v || undefined })} />
                </>
              );
            }}
          />
        </Bloque>
      )}

      {usadas.has("faq") && (
        <Bloque titulo="Preguntas frecuentes">
          <ListaEditable
            items={c.faq ?? []}
            resumen={(f) => f.pregunta || "Sin pregunta"}
            textoAgregar="Agregar pregunta"
            onAgregar={() => editarLista("faq", (l) => void l.push({ id: nuevoId("faq"), pregunta: "¿…?", respuesta: "Respuesta." }))}
            onQuitar={(i) => editarLista("faq", (l) => void l.splice(i, 1))}
            onMover={(i, j) => editarLista("faq", (l) => mover(l, i, j))}
            render={(f, i) => {
              const set = (cambio: Partial<typeof f>) => editarLista("faq", (l) => void Object.assign(l[i]!, cambio));
              return (
                <>
                  <CampoTexto etiqueta="Pregunta" valor={f.pregunta} onCambio={(v) => set({ pregunta: v })} error={errorDe(`contenido.faq.${i}.pregunta`)} />
                  <CampoArea etiqueta="Respuesta" valor={f.respuesta} maxLength={600} onCambio={(v) => set({ respuesta: v })} error={errorDe(`contenido.faq.${i}.respuesta`)} />
                </>
              );
            }}
          />
        </Bloque>
      )}
    </>
  );
}

function CampoImagen({
  imagen,
  textoAlt,
  onCambio,
  error,
}: {
  imagen: Imagen | undefined;
  textoAlt: string;
  onCambio: (img: Imagen) => void;
  error: string | undefined;
}) {
  const actual = imagen ?? { alt: textoAlt };
  return (
    <div className="grid gap-3">
      <CampoTexto
        etiqueta="Link de la foto (opcional)"
        tipo="url"
        placeholder="https://…"
        ayuda="Por ahora, un link público https. La carga de archivos llega con Supabase."
        valor={actual.src ?? ""}
        onCambio={(v) => {
          const siguiente: Imagen = { ...actual };
          if (v.trim()) siguiente.src = v.trim();
          else delete siguiente.src;
          onCambio(siguiente);
        }}
        error={error}
      />
      <CampoTexto etiqueta="Qué se ve en la foto" ayuda="Se usa como texto alternativo y en el recuadro «Tu foto acá»." valor={actual.alt} onCambio={(v) => onCambio({ ...actual, alt: v })} />
    </div>
  );
}

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

function EditorAgenda({ agenda, editar }: { agenda: Agenda | undefined; editar: Editar }) {
  const a = agenda ?? AGENDA_POR_DEFECTO;
  const editarAgenda = (cambio: (ag: Agenda) => void) =>
    editar((c) => {
      const ag = c.agenda ?? structuredClone(AGENDA_POR_DEFECTO);
      cambio(ag);
      ag.dias.sort((x, y) => ORDEN_SEMANA.indexOf(x.dia) - ORDEN_SEMANA.indexOf(y.dia));
      c.agenda = ag;
    });

  return (
    <Bloque
      titulo="Horarios de turnos"
      descripcion={agenda ? "Con estos horarios se arman los turnos que se pueden reservar." : "Todavía usa el horario por defecto. Cualquier cambio lo guarda como propio."}
    >
      <ul className="space-y-2">
        {ORDEN_SEMANA.map((d) => {
          const dia = a.dias.find((x) => x.dia === d);
          return (
            <li key={d} className="rounded-base border border-borde bg-superficie px-3 py-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <label className="flex w-28 items-center gap-2 text-chico font-medium">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--lk-acento)]"
                    checked={!!dia}
                    onChange={(e) =>
                      editarAgenda((ag) => {
                        ag.dias = ag.dias.filter((x) => x.dia !== d);
                        if (e.target.checked) ag.dias.push({ dia: d, franjas: [{ desde: "09:00", hasta: "18:00" }] });
                      })
                    }
                  />
                  {DIAS[d]}
                </label>
                {dia ? (
                  <div className="flex flex-1 flex-col gap-2">
                    {dia.franjas.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-chico">
                        <input
                          type="time"
                          aria-label={`${DIAS[d]}, desde`}
                          value={f.desde}
                          step={900}
                          onChange={(e) => editarAgenda((ag) => void (ag.dias.find((x) => x.dia === d)!.franjas[i]!.desde = e.target.value))}
                          className={`${claseControl} w-auto py-1`}
                        />
                        a
                        <input
                          type="time"
                          aria-label={`${DIAS[d]}, hasta`}
                          value={f.hasta}
                          step={900}
                          onChange={(e) => editarAgenda((ag) => void (ag.dias.find((x) => x.dia === d)!.franjas[i]!.hasta = e.target.value))}
                          className={`${claseControl} w-auto py-1`}
                        />
                        {dia.franjas.length > 1 && (
                          <button
                            type="button"
                            className={botonKit.icono}
                            aria-label={`Quitar franja ${i + 1} del ${DIAS[d]}`}
                            onClick={() => editarAgenda((ag) => void ag.dias.find((x) => x.dia === d)!.franjas.splice(i, 1))}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {dia.franjas.length < 3 && (
                      <button
                        type="button"
                        className="self-start text-mini underline underline-offset-2"
                        onClick={() => editarAgenda((ag) => void ag.dias.find((x) => x.dia === d)!.franjas.push({ desde: "16:00", hasta: "20:00" }))}
                      >
                        + Otra franja (ej.: corte al mediodía)
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-chico text-tinta-suave">Cerrado</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="grid grid-cols-2 gap-3">
        <CampoNumero etiqueta="Turnos cada (min)" min={5} max={240} paso={5} valor={a.intervaloMin} onCambio={(v) => editarAgenda((ag) => void (ag.intervaloMin = v ?? 30))} />
        <CampoNumero
          etiqueta="Anticipación mínima (h)"
          min={0}
          max={168}
          valor={a.anticipacionMinHoras}
          onCambio={(v) => editarAgenda((ag) => void (ag.anticipacionMinHoras = v ?? 0))}
        />
      </div>
      <CampoNumero
        etiqueta="Se puede reservar hasta (días adelante)"
        min={1}
        max={120}
        valor={a.diasHaciaAdelante}
        onCambio={(v) => editarAgenda((ag) => void (ag.diasHaciaAdelante = v ?? 21))}
      />
    </Bloque>
  );
}
