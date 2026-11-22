"use client";

import { Bike, MessageCircle, Minus, Pencil, Plus, Store } from "lucide-react";
import { useState } from "react";
import { claveItem, envioPara, totalItems } from "../lib/logica";
import { useAhora, useResto } from "../lib/store";
import { ID_MEDIOS, MEDIOS, type Entrega, type EstadoPedido, type Item, type Medio, type Pedido } from "../lib/tipos";
import { linkWhatsApp, minutosDesde, plata, primerNombre } from "../lib/util";
import { Cabecera, Cajon, Cobro, Selector, type Linea } from "./comun";

const COLS: { id: EstadoPedido; nombre: string; sig: EstadoPedido; accion: string }[] = [
  { id: "nuevo", nombre: "Entraron", sig: "cocina", accion: "A cocina" },
  { id: "cocina", nombre: "En cocina", sig: "listo", accion: "Está listo" },
  { id: "listo", nombre: "Listos", sig: "entregado", accion: "Entregado" },
];

function FormPedido({ pedido, cerrar }: { pedido?: Pedido; cerrar: () => void }) {
  const { st, act } = useResto();
  const { local } = st;
  const entregas: Entrega[] = [...(local.modulos.llevar || local.modulos.tienda ? (["retiro"] as const) : []), ...(local.modulos.delivery ? (["envio"] as const) : [])];
  const [items, setItems] = useState<Item[]>(pedido?.items ?? []);
  const [nombre, setNombre] = useState(pedido?.nombre ?? "");
  const [tel, setTel] = useState(pedido?.tel ?? "");
  const [hora, setHora] = useState(pedido && /^\d\d:\d\d$/.test(pedido.hora) ? pedido.hora : "");
  const [entrega, setEntrega] = useState<Entrega>(pedido?.entrega ?? entregas[0] ?? "retiro");
  const [direccion, setDireccion] = useState(pedido?.direccion ?? "");
  const [pago, setPago] = useState<Medio>(pedido?.pago ?? "efectivo");
  const [nota, setNota] = useState(pedido?.nota ?? "");
  const [zonaEnvio, setZonaEnvio] = useState(pedido?.zonaEnvio ?? "");
  const sumar = (linea: Linea | Item, d: number) =>
    setItems((it) => {
      const k = claveItem(linea);
      const ex = it.find((i) => claveItem(i) === k);
      const nx = ex ? it.map((i) => (claveItem(i) === k ? { ...i, cant: i.cant + d } : i)) : d > 0 ? [...it, { ...linea, cant: d }] : it;
      return nx.filter((i) => i.cant > 0);
    });
  const precio = (k: string, v: string) => setItems((it) => it.map((i) => (claveItem(i) === k ? { ...i, precio: Number(v) || 0 } : i)));
  const mismoEnvio = pedido?.entrega === "envio" && (pedido.zonaEnvio ?? "") === zonaEnvio;
  const envio = entrega === "envio" ? (mismoEnvio ? pedido!.envio : envioPara(local, zonaEnvio).costo) : 0;
  const guardar = () => {
    if (!items.length || !nombre.trim()) return;
    const datos = { nombre: nombre.trim(), tel, hora: hora || pedido?.hora || "Cuanto antes", entrega, direccion: entrega === "envio" ? direccion.trim() : "", envio, ...(entrega === "envio" && zonaEnvio ? { zonaEnvio } : {}), pago, nota, items };
    if (pedido) act.guardarPedido({ ...datos, id: pedido.id });
    else act.nuevoPedido({ ...datos, origen: "teléfono" });
    cerrar();
  };
  return (
    <Cajon titulo={pedido ? `Editar pedido #${pedido.num}` : "Pedido por teléfono"} ancho cerrar={cerrar}>
      <div className="dos-col">
        <Selector soloLlevar onSumar={(linea, cant) => sumar(linea, cant)} />
        <div className="col-form">
          <ul className="cuenta">
            {items.map((i) => (
              <li key={claveItem(i)}>
                <span className="pl-cant">
                  <button onClick={() => sumar(i, -1)} aria-label={"Quitar " + i.nombre}>
                    <Minus size={14} />
                  </button>
                  <b>{i.cant}</b>
                  <button onClick={() => sumar(i, 1)} aria-label={"Sumar " + i.nombre}>
                    <Plus size={14} />
                  </button>
                </span>
                <span>
                  {i.nombre}
                  {(i.opciones?.length || i.nota) && <small className="linea-ops">{[...(i.opciones ?? []), i.nota].filter(Boolean).join(" · ")}</small>}
                </span>
                <input className="precio-in" type="number" min="0" value={i.precio} onChange={(e) => precio(claveItem(i), e.target.value)} aria-label={"Precio de " + i.nombre} />
              </li>
            ))}
            {!items.length && <li className="vacio">Sumá platos de la lista.</li>}
          </ul>
          {envio > 0 && (
            <p className="bolsa-linea">
              <span>Envío</span>
              <span>{plata(envio)}</span>
            </p>
          )}
          <p className="bolsa-total">
            <span>Total</span>
            <b>{plata(totalItems(items) + envio)}</b>
          </p>
          {entregas.length > 1 && (
            <div className="chips chico">
              {entregas.map((e) => (
                <button key={e} type="button" className={entrega === e ? "on" : ""} onClick={() => setEntrega(e)}>
                  {e === "envio" ? "Envío" : "Retira"}
                </button>
              ))}
            </div>
          )}
          <div className="campos">
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label>
              Teléfono
              <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" />
            </label>
            {entrega === "envio" && local.delivery.zonas.length > 0 && (
              <label className="ancho">
                Barrio
                <select value={zonaEnvio} onChange={(e) => setZonaEnvio(e.target.value)}>
                  <option value="">Costo general ({plata(local.delivery.costo)})</option>
                  {local.delivery.zonas.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre} · {plata(z.costo)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {entrega === "envio" && (
              <label className="ancho">
                Dirección
                <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
              </label>
            )}
            <label>
              {entrega === "envio" ? "Entregar a las" : "Retira a las"}
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </label>
            <label>
              Forma de pago
              <select value={pago} onChange={(e) => setPago(e.target.value as Medio)}>
                {ID_MEDIOS.map((k) => (
                  <option key={k} value={k}>
                    {MEDIOS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="ancho">
              Nota
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Sin sal, cortar en porciones…" />
            </label>
          </div>
          {pedido?.pagado && (
            <p className="nota-chica">
              Ya está cobrado: si cambiás platos, precios o forma de pago, se corrige el cobro en la caja.{" "}
              <button
                type="button"
                className="link-peligro"
                onClick={() => {
                  if (confirm("¿Anular el cobro? Se saca de la caja.")) {
                    act.anularCobroPedido(pedido.id);
                    cerrar();
                  }
                }}
              >
                Anular cobro
              </button>
            </p>
          )}
          <button className="btn btn-1 ancho" onClick={guardar} disabled={!items.length || !nombre.trim()}>
            {pedido ? "Guardar cambios" : "Cargar pedido"}
          </button>
        </div>
      </div>
    </Cajon>
  );
}

export default function Pedidos() {
  const ahora = useAhora();
  const { st, act } = useResto();
  const { local } = st;
  const [nuevo, setNuevo] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [cobrando, setCobrando] = useState<string | null>(null);
  const pedEdit = st.pedidos.find((p) => p.id === editando);
  const ped = st.pedidos.find((p) => p.id === cobrando);
  const entregados = st.pedidos
    .filter((p) => p.estado === "entregado")
    .sort((a, b) => b.creado - a.creado)
    .slice(0, 10);
  const aviso = (p: Pedido) =>
    p.entrega === "envio"
      ? `¡Hola ${primerNombre(p.nombre)}! Tu pedido #${p.num} de ${local.nombre} ya salió para ${p.direccion}. Total ${plata(p.total)}${p.pagado ? " (ya pagado)" : ""}.`
      : `¡Hola ${primerNombre(p.nombre)}! Tu pedido #${p.num} de ${local.nombre} ya está listo para retirar en ${local.direccion}. Total ${plata(p.total)}${p.pagado ? " (ya pagado)" : ""}.`;

  return (
    <div className="vista">
      <Cabecera et="Comandas" titulo="Pedidos">
        <button className="btn btn-1" onClick={() => setNuevo(true)}>
          <Plus size={16} /> Pedido por teléfono
        </button>
      </Cabecera>

      <div className="tablero">
        {COLS.map((c) => {
          const lista = st.pedidos.filter((p) => p.estado === c.id).sort((a, b) => String(a.hora).localeCompare(String(b.hora)));
          return (
            <section key={c.id} className={"col col-" + c.id}>
              <h2>
                {c.nombre} <span>{lista.length}</span>
              </h2>
              {lista.map((p) => (
                <article key={p.id} className="comanda">
                  <header>
                    <b>#{p.num}</b>
                    <span className={"entrega-et " + p.entrega}>
                      {p.entrega === "envio" ? <Bike size={14} /> : <Store size={14} />} {p.entrega === "envio" ? "Envío" : "Retira"} {p.hora}
                    </span>
                  </header>
                  <strong>{p.nombre}</strong>
                  {p.entrega === "envio" && <small className="res-nota">{p.direccion}</small>}
                  <ul>
                    {p.items.map((i) => (
                      <li key={i.platoId}>
                        <b>{i.cant}×</b> {i.nombre}
                        {i.opciones?.length ? <small> ({i.opciones.join(", ")})</small> : null}
                      </li>
                    ))}
                  </ul>
                  {p.nota && <small className="res-nota">“{p.nota}”</small>}
                  <footer>
                    <span className={p.pagado ? "pagado" : "apagar"}>{p.pagado ? `Pagado · ${MEDIOS[p.pago]}` : `A cobrar · ${MEDIOS[p.pago]}`}</span>
                    <b>{plata(p.total)}</b>
                  </footer>
                  <small className="hace">
                    hace {minutosDesde(p.creado, ahora)} min · {p.origen}
                  </small>
                  <div className="fila-btns">
                    {!p.pagado && (
                      <button className="btn btn-2 chico" onClick={() => setCobrando(p.id)}>
                        Cobrar
                      </button>
                    )}
                    <button className="btn btn-1 chico" onClick={() => act.estadoPedido(p.id, c.sig)} disabled={c.sig === "entregado" && !p.pagado} title={c.sig === "entregado" && !p.pagado ? "Cobralo antes de entregar" : ""}>
                      {c.accion}
                    </button>
                  </div>
                  {c.id === "listo" && p.tel && (
                    <a className="link" href={linkWhatsApp(p.tel, aviso(p))} target="_blank" rel="noreferrer">
                      <MessageCircle size={13} /> {p.entrega === "envio" ? "Avisar que salió" : "Avisar que está listo"}
                    </a>
                  )}
                  <button className="link" onClick={() => setEditando(p.id)}>
                    <Pencil size={13} /> Editar
                  </button>
                  {c.id === "nuevo" && (
                    <button className="link-peligro" onClick={() => confirm(`¿Cancelar el pedido #${p.num}?`) && act.cancelarPedido(p.id)}>
                      Cancelar
                    </button>
                  )}
                </article>
              ))}
              {!lista.length && <p className="vacio">—</p>}
            </section>
          );
        })}
      </div>

      {entregados.length > 0 && (
        <section className="tarjeta">
          <h3>Entregados hoy</h3>
          <ul className="simple">
            {entregados.map((p) => (
              <li key={p.id}>
                <b>#{p.num}</b> {p.nombre}{" "}
                <span>
                  {plata(p.total)} · {MEDIOS[p.pago]} · {p.entrega === "envio" ? "envío" : "retiro"}
                </span>
                <button className="link" onClick={() => setEditando(p.id)}>
                  <Pencil size={13} /> Editar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nuevo && <FormPedido cerrar={() => setNuevo(false)} />}
      {pedEdit && <FormPedido key={pedEdit.id} pedido={pedEdit} cerrar={() => setEditando(null)} />}
      {ped && (
        <Cajon titulo={`Cobrar #${ped.num}`} sub={ped.nombre} cerrar={() => setCobrando(null)}>
          <Cobro
            total={ped.total}
            inicial={ped.pago}
            onCancelar={() => setCobrando(null)}
            onCobrar={(medio) => {
              act.cobrarPedido(ped.id, medio);
              setCobrando(null);
            }}
          />
        </Cajon>
      )}
    </div>
  );
}
