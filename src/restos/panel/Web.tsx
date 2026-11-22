"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Monitor, Plus, Printer, QrCode, Smartphone, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { ACENTOS, DISENOS, TIPOGRAFIAS } from "../lib/disenos";
import { achicarImagen, enKB, ocupado, TOPE_BYTES } from "../lib/imagen";
import { useResto } from "../lib/store";
import { SECCIONES_WEB, type Evento, type IdSeccionWeb, type Resena } from "../lib/tipos";
import { fechaLarga, hoyISO, plata, uid } from "../lib/util";
import { Cabecera } from "./comun";

type IdTab = "secciones" | "textos" | "fotos" | "eventos" | "resenas" | "diseno" | "imprimir";
const TABS: { id: IdTab; nombre: string }[] = [
  { id: "secciones", nombre: "Secciones" },
  { id: "textos", nombre: "Textos" },
  { id: "fotos", nombre: "Fotos" },
  { id: "eventos", nombre: "Eventos" },
  { id: "resenas", nombre: "Reseñas" },
  { id: "diseno", nombre: "Diseño" },
  { id: "imprimir", nombre: "QR e impresión" },
];

/** Por qué una sección no se ve aunque esté prendida (le falta contenido o la función está apagada). */
function porQueNoSeVe(id: IdSeccionWeb, st: ReturnType<typeof useResto>["st"]): string {
  const { local } = st;
  const hoy = hoyISO();
  if (id === "ocupacion" && !(local.modulos.salon && local.modulos.ocupacionWeb)) return "Apagada en Ajustes → Funciones.";
  if (id === "reservar" && !local.modulos.reservas) return "Las reservas están apagadas en Ajustes → Funciones.";
  if (id === "eventos" && !local.web.eventos.some((e) => e.fecha >= hoy)) return "No hay eventos por venir.";
  if (id === "resenas" && !local.web.resenas.length) return "Todavía no cargaste reseñas.";
  if (id === "galeria" && !local.web.galeria.some((f) => f.src)) return "Sin fotos: en la demo se ven lugares de ejemplo.";
  return "";
}

function TabSecciones() {
  const { st, act } = useResto();
  const secs = st.local.web.secciones;
  // Por id y no por posición: dos toques rápidos no mueven la sección equivocada.
  const mover = (id: IdSeccionWeb, d: -1 | 1) =>
    act.editarWeb((w) => {
      const i = w.secciones.findIndex((x) => x.id === id);
      const j = i + d;
      if (j < 0 || j >= w.secciones.length) return;
      const [x] = w.secciones.splice(i, 1);
      if (x) w.secciones.splice(j, 0, x);
    });
  return (
    <section className="tarjeta">
      <h3>Qué se ve y en qué orden</h3>
      <p className="nota-chica">El encabezado va siempre primero y la carta no se puede ocultar. Cada título se puede cambiar; vacío = el de siempre.</p>
      <ol className="secciones-web">
        {secs.map((x, i) => {
          const falta = porQueNoSeVe(x.id, st);
          const fija = x.id === "carta";
          return (
            <li key={x.id} className={x.visible ? "" : "off"}>
              <div className="sw-orden">
                <button className="icono" disabled={i === 0} onClick={() => mover(x.id, -1)} aria-label={`Subir ${SECCIONES_WEB[x.id].nombre}`}>
                  <ArrowUp size={16} />
                </button>
                <button className="icono" disabled={i === secs.length - 1} onClick={() => mover(x.id, 1)} aria-label={`Bajar ${SECCIONES_WEB[x.id].nombre}`}>
                  <ArrowDown size={16} />
                </button>
              </div>
              <div className="sw-datos">
                <b>{SECCIONES_WEB[x.id].nombre}</b>
                {x.id !== "ocupacion" && (
                  <input
                    defaultValue={x.titulo}
                    placeholder="Título de siempre"
                    aria-label={`Título de ${SECCIONES_WEB[x.id].nombre}`}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== x.titulo) act.editarWeb((w) => w.secciones.filter((y) => y.id === x.id).forEach((y) => (y.titulo = v)));
                    }}
                  />
                )}
                {x.visible && falta && <small className="aviso">{falta}</small>}
              </div>
              <button
                className={"toggle" + (x.visible ? " on" : "")}
                disabled={fija}
                aria-pressed={x.visible}
                onClick={() => act.editarWeb((w) => w.secciones.filter((y) => y.id === x.id).forEach((y) => (y.visible = !y.visible)))}
                title={fija ? "La carta siempre se ve" : undefined}
              >
                {x.visible ? <Eye size={14} /> : <EyeOff size={14} />} {x.visible ? "Se ve" : "Oculta"}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function TabTextos() {
  const { st, act } = useResto();
  const [t, setT] = useState(() => ({ ...st.local.textos, datos: [...st.local.textos.datos], larga: st.local.web.historiaLarga }));
  const [ok, setOk] = useState(false);
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    act.editarLocal((l) => {
      l.textos = { titulo: t.titulo.trim(), subtitulo: t.subtitulo.trim(), historia: t.historia.trim(), datos: t.datos.map((d) => d.trim()).filter(Boolean) };
      l.web.historiaLarga = t.larga.trim();
    });
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  };
  return (
    <form className="tarjeta" onSubmit={guardar}>
      <h3>Encabezado</h3>
      <div className="campos">
        <label>
          Título
          <input value={t.titulo} onChange={(e) => setT({ ...t, titulo: e.target.value })} maxLength={60} />
        </label>
        <label>
          Segunda línea
          <input value={t.subtitulo} onChange={(e) => setT({ ...t, subtitulo: e.target.value })} maxLength={60} />
        </label>
        <label className="ancho">
          Bajada (una o dos frases)
          <textarea rows={2} value={t.historia} onChange={(e) => setT({ ...t, historia: e.target.value })} maxLength={300} />
        </label>
        {[0, 1, 2].map((i) => (
          <label key={i}>
            Dato {i + 1}
            <input
              value={t.datos[i] ?? ""}
              onChange={(e) => {
                const datos = [...t.datos];
                datos[i] = e.target.value;
                setT({ ...t, datos });
              }}
              placeholder={["30 cubiertos", "Horno de barro", "Estacionamiento"][i]}
              maxLength={30}
            />
          </label>
        ))}
      </div>
      <h3>Nuestra historia</h3>
      <label className="campo">
        Cómo empezó, quiénes cocinan, de dónde sale lo que usan. Dejá una línea en blanco entre párrafos.
        <textarea rows={7} value={t.larga} onChange={(e) => setT({ ...t, larga: e.target.value })} maxLength={1500} />
      </label>
      <button className="btn btn-1">{ok ? "Guardado ✓" : "Guardar textos"}</button>
    </form>
  );
}

/** Subir una foto: la achica y avisa si ya no entra. */
function useSubirFoto() {
  const { st } = useResto();
  const [error, setError] = useState("");
  const subir = async (f: File | undefined, max: number, tipo: "foto" | "logo", guardar: (src: string) => void) => {
    setError("");
    if (!f) return;
    try {
      const src = await achicarImagen(f, max, tipo);
      if (ocupado(st) + src.length > TOPE_BYTES) return setError("No entra más: borrá alguna foto o subila más chica. Cuando pases a la nube, este límite desaparece.");
      guardar(src);
    } catch (e) {
      setError((e as Error).message || "No se pudo leer la imagen.");
    }
  };
  return { subir, error };
}

function CampoFoto({ titulo, texto, src, max, tipo = "foto", cambiar }: { titulo: string; texto: string; src: string; max: number; tipo?: "foto" | "logo"; cambiar: (src: string) => void }) {
  const { subir, error } = useSubirFoto();
  return (
    <div className="campo-foto">
      <div className={"cf-vista" + (tipo === "logo" ? " logo" : "")}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa de una foto guardada en el navegador
          <img src={src} alt={titulo} />
        ) : (
          <ImagePlus size={26} aria-hidden />
        )}
      </div>
      <div className="cf-txt">
        <b>{titulo}</b>
        <small>{texto}</small>
        <div className="fila-btns">
          <label className="btn btn-2 chico">
            {src ? "Cambiar" : "Subir"}
            <input type="file" accept="image/*" hidden onChange={(e) => subir(e.target.files?.[0], max, tipo, cambiar)} />
          </label>
          {src && (
            <button className="btn btn-3 chico" onClick={() => cambiar("")}>
              Sacar
            </button>
          )}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function TabFotos() {
  const { st, act } = useResto();
  const w = st.local.web;
  const { subir, error } = useSubirFoto();
  const usado = ocupado(st);
  return (
    <>
      <section className="tarjeta">
        <h3>Logo y fotos principales</h3>
        <CampoFoto titulo="Logo" texto="Cuadrado y con fondo transparente queda mejor. Reemplaza las iniciales en toda la web y el panel." src={w.logo} max={360} tipo="logo" cambiar={(src) => act.editarWeb((x) => (x.logo = src))} />
        <CampoFoto titulo="Foto de portada" texto="La que aparece en el encabezado (cada diseño la ubica distinto). Horizontal y con luz." src={w.portada} max={1400} cambiar={(src) => act.editarWeb((x) => (x.portada = src))} />
        <CampoFoto titulo="Foto de la historia" texto="El salón, la cocina o la familia: acompaña «Nuestra historia»." src={w.historiaFoto} max={1100} cambiar={(src) => act.editarWeb((x) => (x.historiaFoto = src))} />
      </section>
      <section className="tarjeta">
        <h3>Galería</h3>
        <p className="nota-chica">Hasta 12 fotos. La primera sale más grande. Los lugares vacíos solo se ven en la demo.</p>
        <ul className="galeria-ed">
          {w.galeria.map((f, i) => (
            <li key={f.id}>
              <div className="cf-vista">
                {f.src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vista previa de una foto guardada en el navegador
                  <img src={f.src} alt={f.texto} />
                ) : (
                  <label className="cf-subir">
                    <ImagePlus size={22} aria-hidden />
                    <span>Subir</span>
                    <input type="file" accept="image/*" hidden onChange={(e) => subir(e.target.files?.[0], 1200, "foto", (src) => act.editarWeb((x) => x.galeria.filter((g) => g.id === f.id).forEach((g) => (g.src = src))))} />
                  </label>
                )}
              </div>
              <input defaultValue={f.texto} placeholder="Qué se ve" aria-label="Texto de la foto" onBlur={(e) => e.target.value !== f.texto && act.editarWeb((x) => x.galeria.filter((g) => g.id === f.id).forEach((g) => (g.texto = e.target.value.trim())))} />
              <div className="fila-chica">
                <button className="icono" disabled={i === 0} onClick={() => act.editarWeb((x) => { const k = x.galeria.findIndex((g) => g.id === f.id); if (k > 0) x.galeria.splice(k - 1, 0, ...x.galeria.splice(k, 1)); })} aria-label="Mover antes">
                  <ArrowUp size={15} />
                </button>
                <button className="icono" onClick={() => act.editarWeb((x) => (x.galeria = x.galeria.filter((g) => g.id !== f.id)))} aria-label="Sacar foto">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {w.galeria.length < 12 && (
          <label className="btn btn-2">
            <Plus size={16} /> Agregar foto
            <input type="file" accept="image/*" hidden onChange={(e) => subir(e.target.files?.[0], 1200, "foto", (src) => act.editarWeb((x) => x.galeria.push({ id: uid(), src, texto: "" })))} />
          </label>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="espacio">
          <div className="barra">
            <i style={{ width: Math.min(100, (usado / TOPE_BYTES) * 100) + "%" }} />
          </div>
          <small>
            Espacio usado en este navegador: {enKB(usado)} de {enKB(TOPE_BYTES)}. Las fotos se achican solas al subirlas.
          </small>
        </div>
      </section>
    </>
  );
}

function TabEventos() {
  const { st, act } = useResto();
  const vacio: Evento = { id: "", titulo: "", fecha: hoyISO(), hora: "21:00", texto: "", precio: 0 };
  const [ed, setEd] = useState<Evento | null>(null);
  const [error, setError] = useState("");
  const hoy = hoyISO();
  const lista = [...st.local.web.eventos].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ed) return;
    if (!ed.titulo.trim()) return setError("Ponele un nombre al evento.");
    if (!ed.fecha) return setError("Elegí la fecha.");
    act.editarWeb((w) => {
      const datos = { ...ed, titulo: ed.titulo.trim(), texto: ed.texto.trim() };
      const i = w.eventos.findIndex((x) => x.id === ed.id);
      if (i >= 0) w.eventos[i] = datos;
      else w.eventos.push({ ...datos, id: uid() });
    });
    setEd(null);
    setError("");
  };
  return (
    <section className="tarjeta">
      <h3>Eventos</h3>
      <p className="nota-chica">Peñas, degustaciones, música en vivo, talleres. Los que ya pasaron no se muestran en la web.</p>
      <ul className="personal">
        {lista.map((e) => (
          <li key={e.id} className={e.fecha < hoy ? "off" : ""}>
            <div>
              <b>{e.titulo}</b>
              <small>
                {fechaLarga(e.fecha)} · {e.hora} · {e.precio ? plata(e.precio) : "sin cargo"}
                {e.fecha < hoy ? " · ya pasó" : ""}
              </small>
            </div>
            <button className="btn btn-3 chico" onClick={() => setEd({ ...e })}>
              Editar
            </button>
            <button className="icono" onClick={() => confirm("¿Borrar el evento?") && act.editarWeb((w) => (w.eventos = w.eventos.filter((x) => x.id !== e.id)))} aria-label={"Borrar " + e.titulo}>
              <Trash2 size={15} />
            </button>
          </li>
        ))}
        {!lista.length && <li className="vacio">Todavía no hay eventos.</li>}
      </ul>
      {ed ? (
        <form className="tarjeta form-nueva" onSubmit={guardar}>
          <h4>{ed.id ? "Editar evento" : "Evento nuevo"}</h4>
          <div className="campos">
            <label className="ancho">
              Nombre
              <input value={ed.titulo} onChange={(e) => setEd({ ...ed, titulo: e.target.value })} placeholder="Peña folklórica" autoFocus />
            </label>
            <label>
              Fecha
              <input type="date" value={ed.fecha} onChange={(e) => setEd({ ...ed, fecha: e.target.value })} />
            </label>
            <label>
              Hora
              <input type="time" value={ed.hora} onChange={(e) => setEd({ ...ed, hora: e.target.value })} />
            </label>
            <label>
              Precio (0 = sin cargo)
              <input type="number" min="0" value={ed.precio} onChange={(e) => setEd({ ...ed, precio: Math.max(0, Number(e.target.value) || 0) })} />
            </label>
            <label className="ancho">
              De qué se trata
              <textarea rows={2} value={ed.texto} onChange={(e) => setEd({ ...ed, texto: e.target.value })} maxLength={240} />
            </label>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="fila-btns">
            <button type="button" className="btn btn-2" onClick={() => setEd(null)}>
              Cancelar
            </button>
            <button className="btn btn-1">Guardar</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-2" onClick={() => setEd(vacio)}>
          <Plus size={16} /> Evento nuevo
        </button>
      )}
    </section>
  );
}

function TabResenas() {
  const { st, act } = useResto();
  const vacia: Resena = { id: "", nombre: "", texto: "", estrellas: 5, fuente: "Google", fecha: hoyISO() };
  const [ed, setEd] = useState<Resena | null>(null);
  const [error, setError] = useState("");
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ed) return;
    if (!ed.nombre.trim() || ed.texto.trim().length < 10) return setError("Poné quién la dejó y el texto de la reseña.");
    act.editarWeb((w) => {
      const datos = { ...ed, nombre: ed.nombre.trim(), texto: ed.texto.trim(), fuente: ed.fuente.trim() };
      const i = w.resenas.findIndex((x) => x.id === ed.id);
      if (i >= 0) w.resenas[i] = datos;
      else w.resenas.push({ ...datos, id: uid() });
    });
    setEd(null);
    setError("");
  };
  return (
    <section className="tarjeta">
      <h3>Reseñas</h3>
      <p className="nota-chica">Copiá reseñas reales que te dejaron en Google, Instagram o en el local, con el nombre como lo firmaron. No inventes reseñas: además de quedar mal, la ley de defensa del consumidor lo prohíbe.</p>
      <ul className="personal">
        {st.local.web.resenas.map((r) => (
          <li key={r.id}>
            <div>
              <b>
                {r.nombre} · {"★".repeat(r.estrellas)}
              </b>
              <small>
                “{r.texto.slice(0, 90)}
                {r.texto.length > 90 ? "…" : ""}” · {r.fuente}
              </small>
            </div>
            <button className="btn btn-3 chico" onClick={() => setEd({ ...r })}>
              Editar
            </button>
            <button className="icono" onClick={() => confirm("¿Borrar la reseña?") && act.editarWeb((w) => (w.resenas = w.resenas.filter((x) => x.id !== r.id)))} aria-label={"Borrar la reseña de " + r.nombre}>
              <Trash2 size={15} />
            </button>
          </li>
        ))}
        {!st.local.web.resenas.length && <li className="vacio">Todavía no hay reseñas: la sección no se muestra hasta que cargues la primera.</li>}
      </ul>
      {ed ? (
        <form className="tarjeta form-nueva" onSubmit={guardar}>
          <h4>{ed.id ? "Editar reseña" : "Reseña nueva"}</h4>
          <div className="campos">
            <label>
              Quién la dejó
              <input value={ed.nombre} onChange={(e) => setEd({ ...ed, nombre: e.target.value })} autoFocus />
            </label>
            <label>
              Dónde
              <input value={ed.fuente} onChange={(e) => setEd({ ...ed, fuente: e.target.value })} placeholder="Google, Instagram, en el local" />
            </label>
            <div className="estrellas-ed" role="radiogroup" aria-label="Estrellas">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} role="radio" aria-checked={ed.estrellas === n} aria-label={`${n} estrellas`} onClick={() => setEd({ ...ed, estrellas: n })}>
                  <Star size={22} className={n <= ed.estrellas ? "on" : ""} />
                </button>
              ))}
            </div>
            <label className="ancho">
              La reseña
              <textarea rows={3} value={ed.texto} onChange={(e) => setEd({ ...ed, texto: e.target.value })} maxLength={500} />
            </label>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="fila-btns">
            <button type="button" className="btn btn-2" onClick={() => setEd(null)}>
              Cancelar
            </button>
            <button className="btn btn-1">Guardar</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-2" onClick={() => setEd(vacia)}>
          <Plus size={16} /> Cargar una reseña
        </button>
      )}
    </section>
  );
}

function TabDiseno() {
  const { st, act } = useResto();
  return (
    <section className="tarjeta">
      <h3>Diseño</h3>
      <p className="nota-chica">Cada diseño cambia la forma de la página, no solo los colores.</p>
      <div className="disenos">
        {DISENOS.map((d) => (
          <button key={d.id} type="button" className={"diseno-op" + (st.local.diseno === d.id ? " on" : "")} aria-pressed={st.local.diseno === d.id} onClick={() => act.editarLocal((l) => (l.diseno = d.id))}>
            <span className={"muestra m-" + d.id} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <b>{d.nombre}</b>
            <small>{d.bajada}</small>
          </button>
        ))}
      </div>
      <h3>Color principal</h3>
      <div className="acentos">
        {ACENTOS.map((a) => (
          <button key={a.id || "base"} type="button" className={"acento-op" + (st.local.acento === a.id ? " on" : "")} aria-pressed={st.local.acento === a.id} onClick={() => act.editarLocal((l) => (l.acento = a.id))} title={a.nombre}>
            <span style={a.id ? { background: a.id } : undefined} className={a.id ? "" : "base"} aria-hidden />
            {a.nombre}
          </button>
        ))}
      </div>
      <h3>Tipografía</h3>
      <div className="tipografias">
        <button type="button" className={"tipo-op" + (!st.local.web.tipografia ? " on" : "")} aria-pressed={!st.local.web.tipografia} onClick={() => act.editarWeb((w) => (w.tipografia = ""))}>
          <b>La del diseño</b>
          <small>Cada diseño trae la suya</small>
        </button>
        {TIPOGRAFIAS.map((t) => (
          <button key={t.id} type="button" className={"tipo-op" + (st.local.web.tipografia === t.id ? " on" : "")} aria-pressed={st.local.web.tipografia === t.id} onClick={() => act.editarWeb((w) => (w.tipografia = t.id))}>
            <b style={{ fontFamily: t.disp }}>{t.nombre}</b>
            <small style={{ fontFamily: t.texto }}>Milanesa napolitana · $ 26.500</small>
          </button>
        ))}
      </div>
      <h3>Mapa</h3>
      <label className="check-linea">
        <input type="checkbox" checked={st.local.web.mapa} onChange={(e) => act.editarWeb((w) => (w.mapa = e.target.checked))} /> Mostrar el botón «Ver el mapa» (Google Maps se carga solo si lo tocan)
      </label>
    </section>
  );
}

function TabImprimir() {
  const { st } = useResto();
  return (
    <section className="tarjeta">
      <h3>QR por mesa</h3>
      <p className="nota-chica">
        Una tarjeta por mesa con su QR. Al escanearlo, el cliente ve la carta y puede llamar al mozo o pedir la cuenta: te llega al panel, en el salón. Imprimilas, recortalas y ponelas en un portacarta.
      </p>
      <a className="btn btn-1" href="#/imprimir/qr" target="_blank" rel="noreferrer">
        <QrCode size={16} /> Ver los QR de las {st.mesas.length} mesas
      </a>
      <h3>Carta para imprimir</h3>
      <p className="nota-chica">La carta completa en hoja A4, con tu diseño y tipografía, con o sin precios. Desde ahí se imprime o se guarda en PDF.</p>
      <a className="btn btn-2" href="#/imprimir/carta" target="_blank" rel="noreferrer">
        <Printer size={16} /> Ver la carta para imprimir
      </a>
    </section>
  );
}

/** Editor de la web del restaurante con vista previa al costado. */
export default function Web() {
  const { st } = useResto();
  const [tab, setTab] = useState<IdTab>("secciones");
  const [previa, setPrevia] = useState<"pc" | "cel" | null>("cel");
  const src = (() => {
    const u = new URL(location.href);
    u.hash = "/";
    u.searchParams.set("vista", "previa");
    u.searchParams.set("tipo", st.local.tipo);
    u.searchParams.delete("nombre");
    u.searchParams.delete("d");
    return u.pathname + u.search + u.hash;
  })();
  return (
    <div className={"vista editor-web" + (previa ? " con-previa previa-" + previa : "")}>
      <Cabecera et="Cómo se ve tu página" titulo="Web">
        <div className="chips" role="group" aria-label="Vista previa">
          <button className={previa === "cel" ? "on" : ""} onClick={() => setPrevia(previa === "cel" ? null : "cel")} aria-pressed={previa === "cel"}>
            <Smartphone size={15} /> Celular
          </button>
          <button className={previa === "pc" ? "on" : ""} onClick={() => setPrevia(previa === "pc" ? null : "pc")} aria-pressed={previa === "pc"}>
            <Monitor size={15} /> Computadora
          </button>
        </div>
      </Cabecera>
      <div className="editor-cuerpo">
        <div className="editor-form">
          <div className="chips pestanas" role="tablist" aria-label="Partes de la web">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
                {t.nombre}
              </button>
            ))}
          </div>
          {tab === "secciones" && <TabSecciones />}
          {tab === "textos" && <TabTextos />}
          {tab === "fotos" && <TabFotos />}
          {tab === "eventos" && <TabEventos />}
          {tab === "resenas" && <TabResenas />}
          {tab === "diseno" && <TabDiseno />}
          {tab === "imprimir" && <TabImprimir />}
        </div>
        {previa && (
          <div className="editor-previa" aria-label="Vista previa de la web">
            <iframe title="Vista previa de la web" src={src} />
            <small>Se actualiza sola mientras editás.</small>
          </div>
        )}
      </div>
    </div>
  );
}
