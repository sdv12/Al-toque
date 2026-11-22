"use client";

import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DIAS, erroresDia, ORDEN_SEMANA } from "../lib/horarios";
import { aforoDe, textoDias } from "../lib/logica";
import { armarCopia, leerCopia, nombreCopia } from "../lib/respaldo";
import { useModo } from "../lib/modo";
import { useResto } from "../lib/store";
import { ID_MEDIOS, MEDIOS, ROLES, type Franja, type Local, type Modulos, type Persona, type Promo, type Rol } from "../lib/tipos";
import { fechaLarga, HORA_VALIDA, uid } from "../lib/util";
import { Cabecera } from "./comun";
import { usePersona } from "./Panel";

type IdPestana = "local" | "horarios" | "reservas" | "funciones" | "personal" | "promos" | "cobros" | "datos";
const PESTANAS: { id: IdPestana; nombre: string }[] = [
  { id: "local", nombre: "El local" },
  { id: "horarios", nombre: "Horarios" },
  { id: "reservas", nombre: "Reservas y pedidos" },
  { id: "funciones", nombre: "Funciones" },
  { id: "personal", nombre: "Personal" },
  { id: "promos", nombre: "Promos" },
  { id: "cobros", nombre: "Cobros" },
  { id: "datos", nombre: "Copia y datos" },
];

/** Botón de guardar que avisa un momento que guardó. */
function useGuardado() {
  const [ok, setOk] = useState(false);
  const marcar = () => {
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  };
  return { ok, marcar, texto: ok ? "Guardado ✓" : "Guardar cambios" };
}

function TabLocal() {
  const { st, act } = useResto();
  const [l, setL] = useState(() => ({ nombre: st.local.nombre, bajada: st.local.bajada, ciudad: st.local.ciudad, direccion: st.local.direccion, whatsapp: st.local.whatsapp, instagram: st.local.instagram }));
  const [error, setError] = useState("");
  const g = useGuardado();
  const set = (k: "nombre" | "bajada" | "ciudad" | "direccion" | "whatsapp" | "instagram") => (e: React.ChangeEvent<HTMLInputElement>) => setL({ ...l, [k]: e.target.value });
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (l.nombre.trim().length < 2) return setError("Poné el nombre del local.");
    if (l.whatsapp && l.whatsapp.replace(/\D/g, "").length < 8) return setError("El WhatsApp parece incompleto (código de área y número).");
    setError("");
    act.editarLocal((x) => {
      Object.assign(x, { ...l, nombre: l.nombre.trim(), instagram: l.instagram.replace(/^@/, "").trim() });
    });
    g.marcar();
  };
  return (
    <form className="tarjeta" onSubmit={guardar}>
      <h3>Datos del local</h3>
      <p className="nota-chica">Los textos, las fotos y el diseño de la web se cambian en la sección Web.</p>
      <div className="campos">
        <label>
          Nombre
          <input value={l.nombre} onChange={set("nombre")} maxLength={40} />
        </label>
        <label>
          Qué es, en pocas palabras
          <input value={l.bajada} onChange={set("bajada")} placeholder="Bodegón · Almacén" maxLength={50} />
        </label>
        <label>
          Dirección
          <input value={l.direccion} onChange={set("direccion")} />
        </label>
        <label>
          Ciudad
          <input value={l.ciudad} onChange={set("ciudad")} />
        </label>
        <label>
          WhatsApp del local
          <input value={l.whatsapp} onChange={set("whatsapp")} inputMode="tel" placeholder="351 555-0000" />
        </label>
        <label>
          Instagram
          <input value={l.instagram} onChange={set("instagram")} placeholder="tu.local" />
        </label>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-1">{g.texto}</button>
    </form>
  );
}

function TabHorarios() {
  const { st, act } = useResto();
  const [semana, setSemana] = useState<Franja[][]>(() => st.local.horarios.semana.map((fs) => fs.map((f) => ({ ...f }))));
  const [cerrados, setCerrados] = useState(() => [...st.local.horarios.cerrados]);
  const [nuevoCerrado, setNuevoCerrado] = useState({ fecha: "", motivo: "" });
  const g = useGuardado();
  const errores = semana.map(erroresDia);
  const hayErrores = errores.some((e) => e.length);
  const cambiar = (d: number, fn: (fs: Franja[]) => Franja[]) => setSemana(semana.map((fs, i) => (i === d ? fn(fs.map((f) => ({ ...f }))) : fs)));
  const editarFranja = (d: number, i: number, patch: Partial<Franja>) => cambiar(d, (x) => x.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  const guardar = () => {
    if (hayErrores) return;
    act.editarLocal((l) => {
      l.horarios = { semana, cerrados: [...cerrados].sort((a, b) => a.fecha.localeCompare(b.fecha)) };
    });
    g.marcar();
  };

  return (
    <section className="tarjeta">
      <h3>Días y horarios de atención</h3>
      <p className="nota-chica">Cada día puede tener una o más franjas (mediodía, noche). Si cierra después de medianoche, poné la hora igual (por ejemplo 20:30 a 01:00). Los horarios de reservas y pedidos salen de acá.</p>
      <ul className="semana">
        {ORDEN_SEMANA.map((d, k) => {
          const fs = semana[d] ?? [];
          const anterior = k > 0 ? ORDEN_SEMANA[k - 1] : undefined;
          return (
            <li key={d} className={fs.length ? "" : "cerrado"}>
              <div className="semana-dia">
                <strong>{DIAS[d]}</strong>
                {!fs.length && <span>Cerrado</span>}
              </div>
              <div className="semana-franjas">
                {fs.map((f, i) => (
                  <div key={i} className="franja">
                    <input value={f.nombre} onChange={(e) => editarFranja(d, i, { nombre: e.target.value })} aria-label={`Nombre de la franja ${i + 1} del ${DIAS[d]}`} placeholder="Noche" />
                    <input type="time" value={HORA_VALIDA.test(f.desde) ? f.desde : ""} onChange={(e) => editarFranja(d, i, { desde: e.target.value })} aria-label="Abre" />
                    <span>a</span>
                    <input type="time" value={HORA_VALIDA.test(f.hasta) ? f.hasta : ""} onChange={(e) => editarFranja(d, i, { hasta: e.target.value })} aria-label="Cierra" />
                    <button type="button" className="icono" onClick={() => cambiar(d, (x) => x.filter((_, j) => j !== i))} aria-label="Sacar franja">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {errores[d]?.map((e) => (
                  <p key={e} className="error">
                    {e}
                  </p>
                ))}
                <div className="fila-chica">
                  <button type="button" className="link" onClick={() => cambiar(d, (x) => [...x, x.length ? { nombre: "Noche", desde: "20:00", hasta: "00:00" } : { nombre: "Mediodía", desde: "12:00", hasta: "15:30" }])}>
                    <Plus size={13} /> {fs.length ? "Otra franja" : "Abrir este día"}
                  </button>
                  {anterior !== undefined && (
                    <button type="button" className="link" onClick={() => cambiar(d, () => (semana[anterior] ?? []).map((f) => ({ ...f })))}>
                      <Copy size={13} /> Igual que el {DIAS[anterior].toLowerCase()}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <h3>Feriados y vacaciones</h3>
      <p className="nota-chica">Días puntuales en que no abren: la web no deja reservar ni pedir y muestra que está cerrado.</p>
      <ul className="simple">
        {cerrados.map((c) => (
          <li key={c.fecha}>
            <b>{fechaLarga(c.fecha)}</b> <span>{c.motivo}</span>
            <button type="button" className="icono" onClick={() => setCerrados(cerrados.filter((x) => x.fecha !== c.fecha))} aria-label="Quitar día cerrado">
              <Trash2 size={15} />
            </button>
          </li>
        ))}
        {!cerrados.length && <li className="vacio">Ninguno cargado.</li>}
      </ul>
      <div className="fila-btns">
        <input type="date" value={nuevoCerrado.fecha} onChange={(e) => setNuevoCerrado({ ...nuevoCerrado, fecha: e.target.value })} aria-label="Fecha cerrada" />
        <input value={nuevoCerrado.motivo} onChange={(e) => setNuevoCerrado({ ...nuevoCerrado, motivo: e.target.value })} placeholder="Motivo (Feriado, vacaciones…)" aria-label="Motivo" />
        <button
          type="button"
          className="btn btn-2"
          disabled={!nuevoCerrado.fecha}
          onClick={() => {
            if (!cerrados.some((c) => c.fecha === nuevoCerrado.fecha)) setCerrados([...cerrados, { fecha: nuevoCerrado.fecha, motivo: nuevoCerrado.motivo.trim() || "Cerrado" }]);
            setNuevoCerrado({ fecha: "", motivo: "" });
          }}
        >
          <Plus size={16} /> Agregar
        </button>
      </div>
      {hayErrores && <p className="error">Revisá los horarios marcados antes de guardar.</p>}
      <button className="btn btn-1" onClick={guardar} disabled={hayErrores}>
        {g.texto}
      </button>
    </section>
  );
}

const num = (v: string) => Math.max(0, Math.round(Number(String(v).replace(",", ".")) || 0));

function TabReservas() {
  const { st, act } = useResto();
  const { local } = st;
  const [r, setR] = useState(() => ({ ...local.reservas }));
  const [demoraLlevar, setDemora] = useState(local.demoraLlevar);
  const [dl, setDl] = useState(() => ({ ...local.delivery, zonas: local.delivery.zonas.map((z) => ({ ...z })) }));
  const [bloqueos, setBloqueos] = useState(() => [...local.bloqueos]);
  const [nb, setNb] = useState({ fecha: "", franja: "", motivo: "" });
  const g = useGuardado();
  const franjasNombres = [...new Set(local.horarios.semana.flat().map((f) => f.nombre))];
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    act.editarLocal((l) => {
      l.reservas = { ...r, maxPersonas: Math.max(1, r.maxPersonas), diasAnticipacion: Math.min(90, r.diasAnticipacion) };
      l.demoraLlevar = demoraLlevar;
      l.delivery = { ...dl, zona: dl.zona.trim(), zonas: dl.zonas.filter((z) => z.nombre.trim()).map((z) => ({ ...z, nombre: z.nombre.trim() })) };
      l.bloqueos = [...bloqueos].sort((a, b) => a.fecha.localeCompare(b.fecha));
    });
    g.marcar();
  };
  const zona = (i: number, patch: Partial<(typeof dl.zonas)[number]>) => setDl({ ...dl, zonas: dl.zonas.map((z, j) => (j === i ? { ...z, ...patch } : z)) });
  return (
    <form className="tarjeta" onSubmit={guardar}>
      <h3>Reservas</h3>
      {!local.modulos.reservas && <p className="aviso">Las reservas están apagadas (Funciones). Igual podés dejar esto listo.</p>}
      <div className="campos">
        <label>
          Horarios cada
          <select value={r.intervalo} onChange={(e) => setR({ ...r, intervalo: Number(e.target.value) as 15 | 30 | 60 })}>
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
          </select>
        </label>
        <label>
          Última reserva (minutos antes de cerrar)
          <input type="number" min="0" value={r.margenCierre} onChange={(e) => setR({ ...r, margenCierre: num(e.target.value) })} />
        </label>
        <label>
          Se puede reservar hasta (días)
          <input type="number" min="0" max="90" value={r.diasAnticipacion} onChange={(e) => setR({ ...r, diasAnticipacion: num(e.target.value) })} />
        </label>
        <label>
          Máximo de personas por reserva web
          <input type="number" min="1" value={r.maxPersonas} onChange={(e) => setR({ ...r, maxPersonas: num(e.target.value) })} />
        </label>
        <label>
          Se guarda la mesa (minutos)
          <input type="number" min="0" value={r.tolerancia} onChange={(e) => setR({ ...r, tolerancia: num(e.target.value) })} />
        </label>
      </div>
      <h4>Días sin reservas por la web</h4>
      <p className="nota-chica">Para un evento privado o un día que ya sabés que se llena: el local abre, pero la web no ofrece reservas ese día (o ese turno).</p>
      <ul className="simple">
        {bloqueos.map((b, i) => (
          <li key={b.fecha + b.franja + i}>
            <b>{fechaLarga(b.fecha)}</b> <span>{b.franja || "todo el día"} · {b.motivo}</span>
            <button type="button" className="icono" onClick={() => setBloqueos(bloqueos.filter((_, j) => j !== i))} aria-label="Quitar bloqueo">
              <Trash2 size={15} />
            </button>
          </li>
        ))}
        {!bloqueos.length && <li className="vacio">Ninguno.</li>}
      </ul>
      <div className="fila-btns">
        <input type="date" value={nb.fecha} onChange={(e) => setNb({ ...nb, fecha: e.target.value })} aria-label="Fecha sin reservas" />
        <select value={nb.franja} onChange={(e) => setNb({ ...nb, franja: e.target.value })} aria-label="Turno sin reservas">
          <option value="">Todo el día</option>
          {franjasNombres.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input value={nb.motivo} onChange={(e) => setNb({ ...nb, motivo: e.target.value })} placeholder="Motivo (evento privado…)" aria-label="Motivo del bloqueo" />
        <button
          type="button"
          className="btn btn-2"
          disabled={!nb.fecha}
          onClick={() => {
            setBloqueos([...bloqueos, { fecha: nb.fecha, franja: nb.franja, motivo: nb.motivo.trim() || "Sin reservas" }]);
            setNb({ fecha: "", franja: "", motivo: "" });
          }}
        >
          <Plus size={16} /> Bloquear
        </button>
      </div>
      <h3>Para retirar</h3>
      <div className="campos">
        <label>
          Tarda en estar listo (minutos)
          <input type="number" min="0" value={demoraLlevar} onChange={(e) => setDemora(num(e.target.value))} />
        </label>
      </div>
      <h3>Envíos</h3>
      {!local.modulos.delivery && <p className="aviso">Los envíos están apagados (Funciones).</p>}
      <div className="campos">
        <label>
          Costo del envío
          <input type="number" min="0" value={dl.costo} onChange={(e) => setDl({ ...dl, costo: num(e.target.value) })} />
        </label>
        <label>
          Pedido mínimo
          <input type="number" min="0" value={dl.minimo} onChange={(e) => setDl({ ...dl, minimo: num(e.target.value) })} />
        </label>
        <label>
          Tarda en llegar (minutos)
          <input type="number" min="0" value={dl.demora} onChange={(e) => setDl({ ...dl, demora: num(e.target.value) })} />
        </label>
        <label className="ancho">
          Zona de envío
          <input value={dl.zona} onChange={(e) => setDl({ ...dl, zona: e.target.value })} placeholder="Barrios o distancia: Hasta 3 km, Centro y Güemes…" />
        </label>
      </div>
      <h4>Zonas con su propio costo</h4>
      <p className="nota-chica">Si cargás zonas, el cliente elige su barrio y paga el envío y el mínimo de esa zona. Sin zonas, valen el costo y el mínimo de arriba.</p>
      <ul className="zonas-envio">
        {dl.zonas.map((z, i) => (
          <li key={z.id}>
            <input value={z.nombre} onChange={(e) => zona(i, { nombre: e.target.value })} aria-label="Barrio o zona" placeholder="Barrio" />
            <label>
              Envío
              <input type="number" min="0" value={z.costo} onChange={(e) => zona(i, { costo: num(e.target.value) })} />
            </label>
            <label>
              Mínimo
              <input type="number" min="0" value={z.minimo} onChange={(e) => zona(i, { minimo: num(e.target.value) })} />
            </label>
            <button type="button" className="icono" onClick={() => setDl({ ...dl, zonas: dl.zonas.filter((_, j) => j !== i) })} aria-label="Quitar zona">
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="link" onClick={() => setDl({ ...dl, zonas: [...dl.zonas, { id: uid(), nombre: "", costo: dl.costo, minimo: dl.minimo }] })}>
        <Plus size={14} /> Agregar zona
      </button>
      <button className="btn btn-1">{g.texto}</button>
    </form>
  );
}

const FUNCIONES: { id: keyof Modulos; nombre: string; texto: string }[] = [
  { id: "salon", nombre: "Salón y mesas", texto: "Zonas y mesas, mozos, comandas a cocina, cuenta dividida y lista de espera." },
  { id: "ocupacionWeb", nombre: "Ocupación en vivo en la web", texto: "La web muestra cuánta gente hay ahora (“Hay lugar”, “Quedan pocas mesas”)." },
  { id: "reservas", nombre: "Reservas por la web", texto: "Reservas por turno con cupo según tus mesas; las confirmás por WhatsApp." },
  { id: "llevar", nombre: "Pedidos para retirar", texto: "El cliente arma el pedido en la carta y elige a qué hora lo busca." },
  { id: "delivery", nombre: "Envíos a domicilio", texto: "Pedido con dirección; costo y mínimo por zona o barrio." },
  { id: "caja", nombre: "Caja", texto: "Cada cobro entra a la caja, con comisiones de Mercado Pago, gastos y cierre con arqueo." },
  { id: "tienda", nombre: "Tienda", texto: "Secciones de productos para llevarse a casa (almacén, café en grano, growlers)." },
];

function TabFunciones() {
  const { st, act } = useResto();
  const modo = useModo();
  const soloCarta = modo.tipo === "cliente" && modo.plan === "carta";
  const m = st.local.modulos;
  const sinMesas = aforoDe(st) === 0;
  const alternar = (id: keyof Modulos) =>
    act.editarLocal((l) => {
      l.modulos[id] = !l.modulos[id];
      if (id === "salon" && !l.modulos.salon) l.modulos.ocupacionWeb = false;
    });
  return (
    <section className="tarjeta">
      <h3>Qué usa tu restaurante</h3>
      <p className="nota-chica">Prendé solo lo que te sirve: la web y el panel se acomodan solos. Se puede cambiar cuando quieras.</p>
      <ul className="funciones">
        {FUNCIONES.map((f) => {
          const delPlan = soloCarta && (f.id === "salon" || f.id === "ocupacionWeb" || f.id === "caja");
          const bloqueada = delPlan || (f.id === "ocupacionWeb" && !m.salon) || ((f.id === "reservas" || f.id === "ocupacionWeb") && sinMesas);
          return (
            <li key={f.id}>
              <label className={"interruptor" + (bloqueada ? " bloqueado" : "")}>
                <input type="checkbox" role="switch" checked={m[f.id] && !bloqueada} disabled={bloqueada} onChange={() => alternar(f.id)} />
                <span aria-hidden className="perilla" />
                <span>
                  <b>{f.nombre}</b>
                  <small>{delPlan ? "Viene con el plan Web + panel." : bloqueada ? (sinMesas ? "Primero cargá mesas en el salón." : "Necesita Salón y mesas.") : f.texto}</small>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TabCobros() {
  const { st, act } = useResto();
  const [com, setCom] = useState<Record<string, string>>(() => Object.fromEntries(ID_MEDIOS.map((k) => [k, String(st.local.comisiones[k]).replace(".", ",")])));
  const [cubierto, setCubierto] = useState(String(st.local.cubierto));
  const g = useGuardado();
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    act.editarLocal((l) => {
      l.comisiones = Object.fromEntries(ID_MEDIOS.map((k) => [k, Math.max(0, Number(String(com[k]).replace(",", ".")) || 0)])) as Local["comisiones"];
      l.cubierto = num(cubierto);
    });
    g.marcar();
  };
  return (
    <form className="tarjeta" onSubmit={guardar}>
      <h3>Servicio de mesa</h3>
      <div className="campos">
        <label>
          Por persona (0 = no se cobra)
          <input type="number" min="0" value={cubierto} onChange={(e) => setCubierto(e.target.value)} />
        </label>
      </div>
      <h3>Comisiones de Mercado Pago (%)</h3>
      <p className="nota-chica">Las de la app de Mercado Pago, “Costos y cuotas”. Se usan para calcular cuánto entra limpio en la caja.</p>
      <div className="campos">
        {ID_MEDIOS.map((k) => (
          <label key={k}>
            {MEDIOS[k]}
            <input inputMode="decimal" value={com[k]} onChange={(e) => setCom({ ...com, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      <button className="btn btn-1">{g.texto}</button>
    </form>
  );
}

function TabPersonal() {
  const { st, act } = useResto();
  const yo = usePersona();
  const vacio = { nombre: "", rol: "mozo" as Rol, pin: "", activo: true };
  const [ed, setEd] = useState<(Omit<Persona, "id"> & { id?: string }) | null>(null);
  const [error, setError] = useState("");
  const encargados = st.local.personal.filter((p) => p.rol === "encargado" && p.activo);
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ed) return;
    if (!ed.nombre.trim()) return setError("Poné el nombre.");
    if (!/^\d{4,8}$/.test(ed.pin)) return setError("El PIN va de 4 a 8 números.");
    if (st.local.personal.some((p) => p.pin === ed.pin && p.id !== ed.id)) return setError("Ese PIN ya lo usa otra persona.");
    const dejaSinEncargado = ed.id && encargados.length === 1 && encargados[0]!.id === ed.id && (ed.rol !== "encargado" || !ed.activo);
    if (dejaSinEncargado) return setError("Tiene que quedar al menos un encargado activo.");
    act.guardarPersona({ ...ed, nombre: ed.nombre.trim() });
    setEd(null);
    setError("");
  };
  return (
    <section className="tarjeta">
      <h3>Personal</h3>
      <p className="nota-chica">Cada persona entra al panel con su PIN y ve solo lo que le toca. Las mesas quedan a nombre del mozo y los números se pueden ver por mozo.</p>
      <ul className="personal">
        {st.local.personal.map((p) => (
          <li key={p.id} className={p.activo ? "" : "off"}>
            <div>
              <b>
                {p.nombre}
                {p.id === yo.id ? " (vos)" : ""}
              </b>
              <small>
                {ROLES[p.rol].nombre} · PIN {"•".repeat(p.pin.length)}
                {p.activo ? "" : " · no activo"}
              </small>
            </div>
            <button className="icono" onClick={() => setEd({ ...p })} aria-label={"Editar " + p.nombre}>
              <Pencil size={16} />
            </button>
          </li>
        ))}
      </ul>
      {ed ? (
        <form className="tarjeta form-nueva" onSubmit={guardar}>
          <h4>{ed.id ? `Editar a ${ed.nombre}` : "Persona nueva"}</h4>
          <div className="campos">
            <label>
              Nombre
              <input value={ed.nombre} onChange={(e) => setEd({ ...ed, nombre: e.target.value })} autoFocus />
            </label>
            <label>
              PIN
              <input value={ed.pin} onChange={(e) => setEd({ ...ed, pin: e.target.value.replace(/\D/g, "").slice(0, 8) })} inputMode="numeric" />
            </label>
          </div>
          <div className="roles">
            {(Object.keys(ROLES) as Rol[]).map((r) => (
              <label key={r} className={"rol-op" + (ed.rol === r ? " on" : "")}>
                <input type="radio" name="rol" checked={ed.rol === r} onChange={() => setEd({ ...ed, rol: r })} />
                <b>{ROLES[r].nombre}</b>
                <small>{ROLES[r].texto}</small>
              </label>
            ))}
          </div>
          <label className="check-linea">
            <input type="checkbox" checked={ed.activo} onChange={(e) => setEd({ ...ed, activo: e.target.checked })} /> Activo (puede entrar)
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="fila-btns">
            {ed.id && ed.id !== yo.id && (
              <button
                type="button"
                className="btn btn-3"
                onClick={() => {
                  if (ed.id && confirm(`¿Sacar a ${ed.nombre} del equipo?`)) {
                    act.borrarPersona(ed.id);
                    setEd(null);
                  }
                }}
              >
                <Trash2 size={15} /> Sacar
              </button>
            )}
            <button type="button" className="btn btn-2" onClick={() => setEd(null)}>
              Cancelar
            </button>
            <button className="btn btn-1">Guardar</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-2" onClick={() => setEd(vacio)}>
          <Plus size={16} /> Sumar a alguien
        </button>
      )}
    </section>
  );
}

function TabPromos() {
  const { st, act } = useResto();
  const vacia = { nombre: "", dias: [1, 2, 3, 4, 5], desde: "18:00", hasta: "20:00", porcentaje: 20, categorias: [] as string[], activa: true };
  const [ed, setEd] = useState<(Omit<Promo, "id"> & { id?: string }) | null>(null);
  const [error, setError] = useState("");
  const nombreCat = (id: string) => st.categorias.find((c) => c.id === id)?.nombre ?? "";
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ed) return;
    if (!ed.nombre.trim()) return setError("Ponele un nombre (Happy hour, Menú del mediodía…).");
    if (!ed.dias.length) return setError("Elegí al menos un día.");
    if (!ed.categorias.length) return setError("Elegí a qué secciones de la carta se aplica.");
    if (!HORA_VALIDA.test(ed.desde) || !HORA_VALIDA.test(ed.hasta) || ed.desde === ed.hasta) return setError("Revisá el horario.");
    if (!(ed.porcentaje > 0 && ed.porcentaje < 100)) return setError("El descuento va de 1 a 99 %.");
    act.guardarPromo({ ...ed, nombre: ed.nombre.trim() });
    setEd(null);
    setError("");
  };
  return (
    <section className="tarjeta">
      <h3>Promos con horario</h3>
      <p className="nota-chica">Happy hour, menú del mediodía, martes de pizza: un descuento sobre algunas secciones, ciertos días y en un horario. La web muestra el precio tachado y el aviso solo mientras corre; en el panel se cobra solo.</p>
      <ul className="personal">
        {st.local.promos.map((p) => (
          <li key={p.id} className={p.activa ? "" : "off"}>
            <div>
              <b>
                {p.nombre} · {p.porcentaje} %
              </b>
              <small>
                {textoDias(p.dias)} · {p.desde} a {p.hasta} · {p.categorias.map(nombreCat).filter(Boolean).join(", ")}
              </small>
            </div>
            <button className={"toggle" + (p.activa ? " on" : "")} onClick={() => act.guardarPromo({ ...p, activa: !p.activa })} aria-pressed={p.activa}>
              {p.activa ? "Prendida" : "Apagada"}
            </button>
            <button className="icono" onClick={() => setEd({ ...p, dias: [...p.dias], categorias: [...p.categorias] })} aria-label={"Editar " + p.nombre}>
              <Pencil size={16} />
            </button>
          </li>
        ))}
        {!st.local.promos.length && <li className="vacio">Todavía no hay promos.</li>}
      </ul>
      {ed ? (
        <form className="tarjeta form-nueva" onSubmit={guardar}>
          <h4>{ed.id ? "Editar promo" : "Promo nueva"}</h4>
          <div className="campos">
            <label>
              Nombre
              <input value={ed.nombre} onChange={(e) => setEd({ ...ed, nombre: e.target.value })} placeholder="Happy hour" autoFocus />
            </label>
            <label>
              Descuento (%)
              <input type="number" min="1" max="99" value={ed.porcentaje} onChange={(e) => setEd({ ...ed, porcentaje: num(e.target.value) })} />
            </label>
            <label>
              Desde
              <input type="time" value={ed.desde} onChange={(e) => setEd({ ...ed, desde: e.target.value })} />
            </label>
            <label>
              Hasta
              <input type="time" value={ed.hasta} onChange={(e) => setEd({ ...ed, hasta: e.target.value })} />
            </label>
          </div>
          <fieldset className="etiquetas">
            <legend>Días</legend>
            {ORDEN_SEMANA.map((d) => (
              <label key={d} className="check">
                <input type="checkbox" checked={ed.dias.includes(d)} onChange={() => setEd({ ...ed, dias: ed.dias.includes(d) ? ed.dias.filter((x) => x !== d) : [...ed.dias, d] })} /> {DIAS[d]}
              </label>
            ))}
          </fieldset>
          <fieldset className="etiquetas">
            <legend>Secciones de la carta</legend>
            {st.categorias.map((c) => (
              <label key={c.id} className="check">
                <input type="checkbox" checked={ed.categorias.includes(c.id)} onChange={() => setEd({ ...ed, categorias: ed.categorias.includes(c.id) ? ed.categorias.filter((x) => x !== c.id) : [...ed.categorias, c.id] })} /> {c.nombre}
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="fila-btns">
            {ed.id && (
              <button
                type="button"
                className="btn btn-3"
                onClick={() => {
                  if (ed.id && confirm("¿Borrar la promo?")) {
                    act.borrarPromo(ed.id);
                    setEd(null);
                  }
                }}
              >
                <Trash2 size={15} /> Borrar
              </button>
            )}
            <button type="button" className="btn btn-2" onClick={() => setEd(null)}>
              Cancelar
            </button>
            <button className="btn btn-1">Guardar</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-2" onClick={() => setEd(vacia)}>
          <Plus size={16} /> Promo nueva
        </button>
      )}
    </section>
  );
}

function TabDatos({ demo }: { demo: boolean }) {
  const { st, act } = useResto();
  const [msj, setMsj] = useState<{ ok: boolean; texto: string } | null>(null);
  const descargar = () => {
    const blob = new Blob([armarCopia(st)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombreCopia(st);
    a.click();
    URL.revokeObjectURL(a.href);
    setMsj({ ok: true, texto: "Copia descargada. Guardala en Drive, en el mail o en un pendrive." });
  };
  const recuperar = async (f: File | undefined) => {
    if (!f) return;
    const r = leerCopia(await f.text(), st.local.tipo);
    if (!r.ok) return setMsj({ ok: false, texto: r.error });
    if (!confirm(`¿Reemplazar todo por la copia de ${r.estado.local.nombre}? Lo que hay ahora se pierde.`)) return;
    act.reemplazar(r.estado);
    setMsj({ ok: true, texto: "Listo: se recuperó la copia." });
  };
  return (
    <section className="tarjeta">
      <h3>Copia de seguridad</h3>
      <p className="nota-chica">Por ahora todo queda en este dispositivo (en el navegador). Una copia guarda carta, mesas, personal, reservas, caja y números; sirve para no perder nada o para pasar todo a otra computadora.</p>
      <div className="fila-btns">
        <button className="btn btn-1" onClick={descargar}>
          Guardar una copia
        </button>
        <label className="btn btn-2">
          Recuperar desde una copia
          <input type="file" accept="application/json,.json" hidden onChange={(e) => recuperar(e.target.files?.[0])} />
        </label>
      </div>
      {msj && (
        <p className={msj.ok ? "ok-msj" : "error"} role="status">
          {msj.texto}
        </p>
      )}
      <h3>Empezar de nuevo</h3>
      <div className="fila-btns">
        <button className="btn btn-3" onClick={() => confirm("¿Borrar mesas abiertas, reservas, pedidos, comandas, caja y números? La carta, el personal y la configuración quedan.") && act.empezarDeCero()}>
          Empezar de cero (dejar carta y configuración)
        </button>
        {demo && (
          <button className="btn btn-3" onClick={() => confirm("¿Volver al restaurante de ejemplo? Se pierde todo lo que cambiaste.") && act.reiniciar()}>
            Volver al ejemplo
          </button>
        )}
      </div>
    </section>
  );
}

export default function Ajustes() {
  const [tab, setTab] = useState<IdPestana>("local");
  const modo = useModo();
  return (
    <div className="vista">
      <Cabecera et="Configuración" titulo="Ajustes" />
      <div className="chips pestanas" role="tablist" aria-label="Ajustes">
        {PESTANAS.map((p) => (
          <button key={p.id} role="tab" aria-selected={tab === p.id} className={tab === p.id ? "on" : ""} onClick={() => setTab(p.id)}>
            {p.nombre}
          </button>
        ))}
      </div>
      {tab === "local" && <TabLocal />}
      {tab === "horarios" && <TabHorarios />}
      {tab === "reservas" && <TabReservas />}
      {tab === "funciones" && <TabFunciones />}
      {tab === "cobros" && <TabCobros />}
      {tab === "personal" && <TabPersonal />}
      {tab === "promos" && <TabPromos />}
      {tab === "datos" && <TabDatos demo={modo.tipo === "demo"} />}
    </div>
  );
}
