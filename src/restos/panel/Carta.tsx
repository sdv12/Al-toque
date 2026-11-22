"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useResto } from "../lib/store";
import { DIAS, ORDEN_SEMANA } from "../lib/horarios";
import { editaCarta } from "../lib/permisos";
import { ETIQUETAS, type Categoria, type Etiqueta, type GrupoOpciones, type Plato } from "../lib/tipos";
import { plata } from "../lib/util";
import { textoDias } from "../lib/logica";
import { Cabecera, Cajon } from "./comun";
import { usePersona } from "./Panel";

type Borrador = Omit<Plato, "id" | "precio"> & { id?: string; precio: number | string };

/** Grupos de opciones de un plato: "Punto: Jugoso, A punto, Cocido", con extra de precio opcional. */
function EditorOpciones({ grupos, cambiar }: { grupos: GrupoOpciones[]; cambiar: (g: GrupoOpciones[]) => void }) {
  const set = (i: number, g: GrupoOpciones) => cambiar(grupos.map((x, j) => (j === i ? g : x)));
  return (
    <fieldset className="ed-opciones">
      <legend>Opciones para elegir</legend>
      <p className="nota-chica">Punto de la carne, guarnición, tamaño, gustos. El primer valor es el que viene por defecto; el extra suma (o resta) al precio.</p>
      {grupos.map((g, i) => (
        <div key={i} className="ed-grupo">
          <div className="ed-grupo-cab">
            <input value={g.nombre} onChange={(e) => set(i, { ...g, nombre: e.target.value })} placeholder="Punto, Guarnición, Tamaño…" aria-label="Nombre del grupo" />
            <button type="button" className="icono" onClick={() => cambiar(grupos.filter((_, j) => j !== i))} aria-label="Sacar grupo">
              <Trash2 size={15} />
            </button>
          </div>
          {g.valores.map((v, k) => (
            <div key={k} className="ed-valor">
              <input value={v.nombre} onChange={(e) => set(i, { ...g, valores: g.valores.map((x, j) => (j === k ? { ...x, nombre: e.target.value } : x)) })} placeholder="Opción" aria-label="Opción" />
              <input type="number" value={v.extra} onChange={(e) => set(i, { ...g, valores: g.valores.map((x, j) => (j === k ? { ...x, extra: Number(e.target.value) || 0 } : x)) })} aria-label="Extra de precio" title="Extra de precio (puede ser negativo)" />
              <button type="button" className="icono" disabled={g.valores.length <= 1} onClick={() => set(i, { ...g, valores: g.valores.filter((_, j) => j !== k) })} aria-label="Sacar opción">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" className="link" onClick={() => set(i, { ...g, valores: [...g.valores, { nombre: "", extra: 0 }] })}>
            <Plus size={13} /> Otra opción
          </button>
        </div>
      ))}
      <button type="button" className="link" onClick={() => cambiar([...grupos, { nombre: "", valores: [{ nombre: "", extra: 0 }, { nombre: "", extra: 0 }] }])}>
        <Plus size={13} /> Grupo de opciones
      </button>
    </fieldset>
  );
}

function Editor({ plato, cerrar }: { plato: Borrador; cerrar: () => void }) {
  const { st, act } = useResto();
  const [p, setP] = useState<Borrador>(plato);
  const [error, setError] = useState("");
  const texto = (k: "nombre" | "desc" | "porcion" | "cat") => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setP({ ...p, [k]: e.target.value });
  const check = (k: "disponible" | "llevar" | "destacado") => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: e.target.checked });
  const etiqueta = (e: Etiqueta) => setP({ ...p, etiquetas: p.etiquetas.includes(e) ? p.etiquetas.filter((x) => x !== e) : [...p.etiquetas, e] });
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.nombre.trim()) return setError("Poné el nombre del plato.");
    if (!(Number(p.precio) > 0)) return setError("Poné el precio.");
    const opciones = (p.opciones ?? [])
      .map((g) => ({ nombre: g.nombre.trim(), valores: g.valores.filter((v) => v.nombre.trim()).map((v) => ({ nombre: v.nombre.trim(), extra: v.extra })) }))
      .filter((g) => g.nombre && g.valores.length);
    const { opciones: _o, dias, ...resto } = p;
    void _o;
    act.guardarPlato({ ...resto, nombre: p.nombre.trim(), desc: p.desc.trim(), precio: Number(p.precio), ...(opciones.length ? { opciones } : {}), ...(dias?.length ? { dias } : {}) });
    cerrar();
  };
  return (
    <Cajon titulo={plato.id ? "Editar plato" : "Plato nuevo"} cerrar={cerrar}>
      <form onSubmit={guardar} className="form-plato">
        <div className="campos una">
          <label>
            Nombre
            <input value={p.nombre} onChange={texto("nombre")} autoFocus />
          </label>
          <label>
            Descripción
            <input value={p.desc} onChange={texto("desc")} placeholder="Qué lleva, cómo se hace" />
          </label>
          <label>
            Precio
            <input type="number" min="0" value={p.precio} onChange={(e) => setP({ ...p, precio: e.target.value })} />
          </label>
          <label>
            Porción o tamaño
            <input value={p.porcion} onChange={texto("porcion")} placeholder="Para 2, 400 g, Docena…" />
          </label>
          <label>
            Sección
            <select value={p.cat} onChange={texto("cat")}>
              {st.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="etiquetas">
            <legend>Etiquetas</legend>
            {(Object.keys(ETIQUETAS) as Etiqueta[]).map((e) => (
              <label key={e} className="check">
                <input type="checkbox" checked={p.etiquetas.includes(e)} onChange={() => etiqueta(e)} /> {ETIQUETAS[e].nombre}
              </label>
            ))}
          </fieldset>
          <fieldset className="etiquetas">
            <legend>Sale estos días</legend>
            {ORDEN_SEMANA.map((d) => {
              const dias = p.dias?.length ? p.dias : [0, 1, 2, 3, 4, 5, 6];
              return (
                <label key={d} className="check">
                  <input
                    type="checkbox"
                    checked={dias.includes(d)}
                    onChange={() => {
                      const nuevos = dias.includes(d) ? dias.filter((x) => x !== d) : [...dias, d];
                      setP({ ...p, dias: nuevos.length === 7 || !nuevos.length ? undefined : nuevos });
                    }}
                  />{" "}
                  {DIAS[d].slice(0, 3)}
                </label>
              );
            })}
          </fieldset>
          <EditorOpciones grupos={p.opciones ?? []} cambiar={(opciones) => setP({ ...p, opciones: opciones.length ? opciones : undefined })} />
          <label className="check">
            <input type="checkbox" checked={p.disponible} onChange={check("disponible")} /> Hay hoy
          </label>
          <label className="check">
            <input type="checkbox" checked={p.llevar} onChange={check("llevar")} /> Se puede pedir por la web
          </label>
          <label className="check">
            <input type="checkbox" checked={p.destacado} onChange={check("destacado")} /> Recomendado de la casa (sale arriba en la web)
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="fila-btns">
          {plato.id && (
            <button
              type="button"
              className="btn btn-3"
              onClick={() => {
                if (plato.id && confirm("¿Borrar el plato?")) {
                  act.borrarPlato(plato.id);
                  cerrar();
                }
              }}
            >
              <Trash2 size={15} /> Borrar
            </button>
          )}
          <button className="btn btn-1">Guardar</button>
        </div>
      </form>
    </Cajon>
  );
}

function Seccion({ c, i, total }: { c: Categoria; i: number; total: number }) {
  const { st, act } = useResto();
  const n = st.platos.filter((p) => p.cat === c.id).length;
  return (
    <li>
      <div className="sec-adm-cab">
        <input
          defaultValue={c.nombre}
          aria-label="Nombre de la sección"
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== c.nombre) act.guardarCategoria({ id: c.id, nombre: v });
            else e.target.value = c.nombre;
          }}
        />
        <small>{n} platos</small>
        <button className="icono" disabled={i === 0} onClick={() => act.moverCategoria(c.id, -1)} aria-label="Subir sección">
          <ArrowUp size={16} />
        </button>
        <button className="icono" disabled={i === total - 1} onClick={() => act.moverCategoria(c.id, 1)} aria-label="Bajar sección">
          <ArrowDown size={16} />
        </button>
        <button className="icono" disabled={n > 0} title={n ? "Tiene platos: movelos antes de borrarla" : "Borrar sección"} onClick={() => act.borrarCategoria(c.id)} aria-label="Borrar sección">
          <Trash2 size={16} />
        </button>
      </div>
      <input
        className="sec-adm-nota"
        defaultValue={c.nota ?? ""}
        placeholder="Aclaración debajo del título (opcional)"
        aria-label={`Aclaración de ${c.nombre}`}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v !== (c.nota ?? "")) act.guardarCategoria({ id: c.id, nombre: c.nombre, nota: v || undefined });
        }}
      />
      <label className="check">
        <input type="checkbox" checked={!!c.barra} onChange={(e) => act.guardarCategoria({ id: c.id, nombre: c.nombre, barra: e.target.checked })} /> Va a la barra (no a la cocina)
      </label>
      {st.local.modulos.tienda && (
        <label className="check">
          <input type="checkbox" checked={!!c.tienda} onChange={(e) => act.guardarCategoria({ id: c.id, nombre: c.nombre, tienda: e.target.checked })} /> Es tienda (productos para llevarse a casa)
        </label>
      )}
    </li>
  );
}

function Secciones() {
  const { st, act } = useResto();
  const [nueva, setNueva] = useState("");
  return (
    <section className="tarjeta">
      <h3>Secciones de la carta</h3>
      <p className="nota-chica">El orden de acá es el orden de la web.</p>
      <ul className="cats-adm">
        {st.categorias.map((c, i) => (
          <Seccion key={c.id} c={c} i={i} total={st.categorias.length} />
        ))}
      </ul>
      <form
        className="fila-btns"
        onSubmit={(e) => {
          e.preventDefault();
          if (nueva.trim()) {
            act.guardarCategoria({ nombre: nueva.trim() });
            setNueva("");
          }
        }}
      >
        <input value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Nueva sección (ej.: Minutas)" aria-label="Nueva sección" style={{ flex: 2 }} />
        <button className="btn btn-2">
          <Plus size={16} /> Agregar
        </button>
      </form>
    </section>
  );
}

export default function Carta() {
  const { st, act } = useResto();
  const edita = editaCarta(usePersona().rol);
  const [edit, setEdit] = useState<Borrador | null>(null);
  const agotados = st.platos.filter((p) => !p.disponible).length;
  const nuevo = (): Borrador => ({ nombre: "", desc: "", precio: "", porcion: "", cat: st.categorias[0]?.id ?? "", disponible: true, llevar: true, destacado: false, etiquetas: [] });
  return (
    <div className="vista">
      <Cabecera et={`${st.platos.length} platos · ${agotados} se terminaron`} titulo="Carta">
        {agotados > 0 && (
          <button className="btn btn-3" onClick={() => act.reponerTodo()}>
            <RotateCcw size={15} /> Hay de todo
          </button>
        )}
        {edita && (
          <button className="btn btn-1" onClick={() => setEdit(nuevo())}>
            <Plus size={16} /> Plato nuevo
          </button>
        )}
      </Cabecera>
      <p className="nota-chica">Tocá “Hay / Se terminó” durante el servicio: la web lo muestra al instante y no se puede pedir. Al empezar el turno, “Hay de todo” vuelve a habilitar todo.</p>
      {st.categorias.map((c) => {
        const lista = st.platos.filter((p) => p.cat === c.id);
        if (!lista.length) return null;
        return (
          <section key={c.id} className="tarjeta">
            <h3>
              {c.nombre} {c.tienda && <small className="et-tienda">tienda</small>}
            </h3>
            <ul className="carta-adm">
              {lista.map((p) => (
                <li key={p.id} className={p.disponible ? "" : "off"}>
                  <div>
                    <strong>{p.nombre}</strong>
                    <small>{[p.porcion, p.llevar ? "se pide por la web" : "solo en el local", p.destacado && "recomendado", p.opciones?.length && "con opciones", p.dias?.length && textoDias(p.dias), ...p.etiquetas.map((e) => ETIQUETAS[e].nombre)].filter(Boolean).join(" · ")}</small>
                  </div>
                  <b>{plata(p.precio)}</b>
                  <button className={"toggle" + (p.disponible ? " on" : "")} onClick={() => act.alternarPlato(p.id, "disponible")} aria-pressed={p.disponible}>
                    {p.disponible ? "Hay" : "Se terminó"}
                  </button>
                  {edita && (
                    <button className="icono" onClick={() => setEdit(p)} aria-label={"Editar " + p.nombre}>
                      <Pencil size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {edita ? <Secciones /> : <p className="nota-chica">Los precios y los platos los cambia el encargado.</p>}
      {edit && <Editor plato={edit} cerrar={() => setEdit(null)} />}
    </div>
  );
}
