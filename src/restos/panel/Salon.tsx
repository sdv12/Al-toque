"use client";

import { ArrowRightLeft, Bell, BellRing, Check, ChefHat, Clock, Link2, Minus, Pencil, Plus, Trash2, Unlink, Users } from "lucide-react";
import { useState } from "react";
import { estadoAhora, franjaDeHora } from "../lib/horarios";
import { aforoDe, capGrupo, claveItem, cubiertoDe, cupoTurno, descuentoMesa, enSalon, grupoDe, masPedidos, restanteMesa, resumenCaja, sinEnviar, totalItems, totalMesa, unidadesPendientes } from "../lib/logica";
import { useAhora, useResto } from "../lib/store";
import { MEDIOS, type Mesa } from "../lib/tipos";
import { duracion, hoyISO, plata, uid } from "../lib/util";
import { Cabecera, Cajon, Cobro, Selector } from "./comun";
import Espera from "./Espera";
import { usePersona } from "./Panel";

/** Elegir quién atiende la mesa. */
function SelectMozo({ valor, cambiar }: { valor?: string; cambiar: (id: string) => void }) {
  const { st } = useResto();
  const mozos = st.local.personal.filter((p) => p.activo && (p.rol === "mozo" || p.rol === "encargado"));
  return (
    <label className="campo">
      Atiende
      <select value={valor ?? ""} onChange={(e) => cambiar(e.target.value)}>
        <option value="">Sin asignar</option>
        {mozos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

function Sentar({ mesa, cerrar }: { mesa: Mesa; cerrar: () => void }) {
  const { st, act } = useResto();
  const persona = usePersona();
  const ahora = useAhora();
  const cap = capGrupo(st, mesa.id);
  const [personas, setPersonas] = useState(Math.min(2, cap));
  const [nombre, setNombre] = useState("");
  const [mozo, setMozo] = useState(persona.rol === "mozo" ? persona.id : "");
  const hoy = hoyISO(new Date(ahora));
  const reservas = st.local.modulos.reservas ? st.reservas.filter((r) => r.fecha === hoy && ["pendiente", "confirmada"].includes(r.estado)).sort((a, b) => a.hora.localeCompare(b.hora)) : [];
  const libresParaJuntar = st.mesas.filter((m) => m.id !== mesa.id && !m.ocupada && !m.unidaA && !st.mesas.some((x) => x.unidaA === m.id));
  const unidas = grupoDe(st, mesa.id).filter((m) => m.id !== mesa.id);

  return (
    <>
      {st.local.modulos.reservas && (
        <>
          <h4>Llegó una reserva</h4>
          {reservas.length ? (
            <ul className="lista-res">
              {reservas.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => {
                      act.sentar(mesa.id, r.personas, r.nombre, r.id, mozo || undefined);
                      cerrar();
                    }}
                  >
                    <b>{r.hora}</b> {r.nombre} · {r.personas} p.
                    {r.personas > cap && <small className="aviso"> (mesa para {cap})</small>}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="vacio">No hay reservas pendientes para hoy.</p>
          )}
          <h4>Sin reserva</h4>
        </>
      )}
      <div className="contador">
        <button onClick={() => setPersonas(Math.max(1, personas - 1))} aria-label="Menos">
          −
        </button>
        <output>
          {personas} {personas === 1 ? "persona" : "personas"}
        </output>
        <button onClick={() => setPersonas(personas + 1)} aria-label="Más">
          +
        </button>
      </div>
      {personas > cap && <p className="aviso">La mesa es para {cap}: juntala con otra o sumá sillas.</p>}
      <label className="campo">
        Nombre (opcional)
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </label>
      <SelectMozo valor={mozo} cambiar={setMozo} />
      <button
        className="btn btn-1 ancho"
        onClick={() => {
          act.sentar(mesa.id, personas, nombre.trim(), null, mozo || undefined);
          cerrar();
        }}
      >
        Sentar en mesa {mesa.nombre}
      </button>
      <h4>Mesas juntas</h4>
      {unidas.length > 0 && (
        <p className="nota-chica">
          Unida con {unidas.map((m) => `mesa ${m.nombre}`).join(", ")} · {cap} lugares.
        </p>
      )}
      <label className="campo">
        <span>
          <Link2 size={14} /> Juntar con otra mesa libre
        </span>
        <select value="" onChange={(e) => e.target.value && act.juntarMesas(mesa.id, e.target.value)}>
          <option value="">Elegí una mesa…</option>
          {libresParaJuntar.map((m) => (
            <option key={m.id} value={m.id}>
              Mesa {m.nombre} ({m.cap} lugares)
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

type Modo = { tipo: "cuenta" } | { tipo: "sumar" } | { tipo: "dividir" } | { tipo: "cobrar"; monto: number; unidades?: Record<string, number>; texto: string };

function Dividir({ mesa, cobrar, volver }: { mesa: Mesa; cobrar: (monto: number, texto: string, unidades?: Record<string, number>) => void; volver: () => void }) {
  const { st } = useResto();
  const o = mesa.ocupada!;
  const restante = restanteMesa(st.local, o);
  const pagadas = o.pagos?.length ?? 0;
  const [como, setComo] = useState<"iguales" | "plato">("iguales");
  const [partes, setPartes] = useState(Math.max(1, o.personas - pagadas));
  const pend = unidadesPendientes(o);
  const [sel, setSel] = useState<Record<string, number>>({});
  const [conCubierto, setConCubierto] = useState(st.local.cubierto > 0);
  const factor = 1 - (o.descuento ?? 0) / 100;
  const subtotal = pend.reduce((s, x) => s + (sel[x.clave] ?? 0) * x.item.precio, 0) + (conCubierto ? st.local.cubierto : 0);
  const porPlato = Math.min(restante, Math.round(subtotal * factor));
  const igual = Math.round(restante / Math.max(1, partes));

  return (
    <>
      <button className="btn btn-2 ancho" onClick={volver}>
        ← Volver a la cuenta
      </button>
      <p className="bolsa-total">
        <span>Falta cobrar</span>
        <b>{plata(restante)}</b>
      </p>
      <div className="chips" role="tablist">
        <button role="tab" aria-selected={como === "iguales"} className={como === "iguales" ? "on" : ""} onClick={() => setComo("iguales")}>
          En partes iguales
        </button>
        <button role="tab" aria-selected={como === "plato"} className={como === "plato" ? "on" : ""} onClick={() => setComo("plato")}>
          Cada uno lo suyo
        </button>
      </div>
      {como === "iguales" ? (
        <>
          <div className="contador">
            <button onClick={() => setPartes(Math.max(1, partes - 1))} aria-label="Menos partes">
              −
            </button>
            <output>{partes} partes</output>
            <button onClick={() => setPartes(partes + 1)} aria-label="Más partes">
              +
            </button>
          </div>
          <p className="nota-chica">Cada parte paga {plata(igual)}. Se cobran de a una, cada una con su forma de pago.</p>
          <button className="btn btn-1 ancho" onClick={() => cobrar(partes <= 1 ? restante : igual, partes <= 1 ? "Lo que falta" : `1 de ${partes} partes`)}>
            Cobrar una parte · {plata(partes <= 1 ? restante : igual)}
          </button>
        </>
      ) : (
        <>
          <p className="nota-chica">Marcá lo que paga esta persona.{(o.descuento ?? 0) > 0 ? ` Incluye el ${o.descuento} % de descuento.` : ""}</p>
          <ul className="cuenta">
            {pend.map(({ item, clave, quedan }) => (
              <li key={clave}>
                <span className="pl-cant">
                  <button onClick={() => setSel({ ...sel, [clave]: Math.max(0, (sel[clave] ?? 0) - 1) })} aria-label={"Menos " + item.nombre}>
                    <Minus size={14} />
                  </button>
                  <b>{sel[clave] ?? 0}</b>
                  <button onClick={() => setSel({ ...sel, [clave]: Math.min(quedan, (sel[clave] ?? 0) + 1) })} aria-label={"Más " + item.nombre}>
                    <Plus size={14} />
                  </button>
                </span>
                <span>
                  {item.nombre}
                  <small className="linea-ops">
                    quedan {quedan} · {plata(item.precio)} c/u
                  </small>
                </span>
                <b>{plata((sel[clave] ?? 0) * item.precio)}</b>
              </li>
            ))}
            {!pend.length && <li className="vacio">Ya se cobraron todos los platos.</li>}
          </ul>
          {st.local.cubierto > 0 && (
            <label className="check-linea">
              <input type="checkbox" checked={conCubierto} onChange={(e) => setConCubierto(e.target.checked)} /> Su servicio de mesa ({plata(st.local.cubierto)})
            </label>
          )}
          <button
            className="btn btn-1 ancho"
            disabled={porPlato <= 0}
            onClick={() =>
              cobrar(
                porPlato,
                "Lo suyo",
                Object.fromEntries(Object.entries(sel).filter(([, n]) => n > 0)),
              )
            }
          >
            Cobrar lo marcado · {plata(porPlato)}
          </button>
        </>
      )}
    </>
  );
}

function Cuenta({ mesa, cerrar }: { mesa: Mesa; cerrar: () => void }) {
  const { st, act } = useResto();
  const ahora = useAhora();
  const [modo, setModo] = useState<Modo>({ tipo: "cuenta" });
  const [precios, setPrecios] = useState(false);
  const libres = st.mesas.filter((m) => !m.ocupada && !m.unidaA && m.id !== mesa.id);
  const o = mesa.ocupada!;
  const cubierto = cubiertoDe(st.local, o);
  const total = totalMesa(st.local, o);
  const desc = descuentoMesa(st.local, o);
  const restante = restanteMesa(st.local, o);
  const faltan = sinEnviar(o);
  const comandas = st.comandas.filter((c) => c.mesaId === mesa.id && c.estado !== "entregada");
  const listas = comandas.filter((c) => c.estado === "lista");

  if (modo.tipo === "cobrar")
    return (
      <>
        <p className="nota-chica cobro-que">{modo.texto}</p>
        <Cobro
          total={modo.monto}
          conPropina
          onCancelar={() => setModo({ tipo: "cuenta" })}
          onCobrar={(medio, propina) => {
            const cierra = modo.monto >= restante;
            act.cobrarParte(mesa.id, modo.monto, medio, propina, modo.unidades);
            if (cierra) cerrar();
            else setModo({ tipo: "dividir" });
          }}
        />
      </>
    );

  if (modo.tipo === "dividir") return <Dividir mesa={mesa} volver={() => setModo({ tipo: "cuenta" })} cobrar={(monto, texto, unidades) => setModo({ tipo: "cobrar", monto, texto, unidades })} />;

  if (modo.tipo === "sumar")
    return (
      <>
        <button className="btn btn-2 ancho" onClick={() => setModo({ tipo: "cuenta" })}>
          ← Volver a la cuenta ({plata(total)})
        </button>
        <Selector onSumar={(linea, cant) => act.sumarItem(mesa.id, linea, cant)} />
      </>
    );

  return (
    <>
      <label className="campo">
        Nombre o referencia
        <input value={o.nombre} onChange={(e) => act.editarOcupada(mesa.id, { nombre: e.target.value })} placeholder="Ej.: Familia Pérez" />
      </label>
      <div className="mesa-meta">
        <span className="contador chico">
          <button onClick={() => act.cambiarPersonas(mesa.id, o.personas - 1)} aria-label="Menos personas">
            −
          </button>
          <output>
            <Users size={14} /> {o.personas}
          </output>
          <button onClick={() => act.cambiarPersonas(mesa.id, o.personas + 1)} aria-label="Más personas">
            +
          </button>
        </span>
        <span>
          <Clock size={14} /> {duracion(o.desde, ahora)}
        </span>
      </div>
      <SelectMozo valor={o.mozo} cambiar={(id) => act.editarOcupada(mesa.id, { mozo: id || undefined })} />
      {listas.length > 0 && (
        <div className="aviso-listo" role="status">
          <Bell size={16} /> {listas.length === 1 ? "Hay un plato listo para servir" : "Hay platos listos para servir"} ({listas.map((c) => c.destino).join(" y ")}).
          {listas.map((c) => (
            <button key={c.id} className="btn btn-1 chico" onClick={() => act.estadoComanda(c.id, "entregada")}>
              <Check size={14} /> Servido ({c.destino})
            </button>
          ))}
        </div>
      )}
      <ul className="cuenta">
        {o.items.map((i) => {
          const k = claveItem(i);
          const enviado = (i.enviados ?? 0) >= i.cant;
          return (
            <li key={k}>
              <span className="pl-cant">
                <button onClick={() => act.sumarItem(mesa.id, i, -1)} aria-label={"Quitar " + i.nombre}>
                  <Minus size={14} />
                </button>
                <b>{i.cant}</b>
                <button onClick={() => act.sumarItem(mesa.id, i, 1)} aria-label={"Sumar " + i.nombre}>
                  <Plus size={14} />
                </button>
              </span>
              <span>
                {i.nombre}
                <small className="linea-ops">
                  {[...(i.opciones ?? []), i.nota].filter(Boolean).join(" · ")}
                  <em className={enviado ? "enviado" : "sin-enviar"}>{enviado ? " ✓ en cocina" : ` · ${i.cant - (i.enviados ?? 0)} sin mandar`}</em>
                </small>
              </span>
              {precios ? (
                <input className="precio-in" type="number" min="0" value={i.precio} onChange={(e) => act.editarItem(mesa.id, k, { precio: Number(e.target.value) || 0 })} aria-label={"Precio de " + i.nombre} />
              ) : (
                <b>{plata(i.precio * i.cant)}</b>
              )}
            </li>
          );
        })}
        {!o.items.length && <li className="vacio">Todavía no pidieron nada.</li>}
        {cubierto > 0 && (
          <li className="cubierto">
            <span>{o.personas}×</span>
            <span>Servicio de mesa</span>
            <b>{plata(cubierto)}</b>
          </li>
        )}
      </ul>
      {o.items.length > 0 && (
        <button className="link" onClick={() => setPrecios(!precios)}>
          <Pencil size={13} /> {precios ? "Listo, volver a totales" : "Editar precios (invitación, cambio)"}
        </button>
      )}
      <div className="cobro-propina">
        <span>Descuento</span>
        {[0, 10, 15, 20].map((p) => (
          <button type="button" key={p} className={(o.descuento ?? 0) === p ? "on" : ""} onClick={() => act.editarOcupada(mesa.id, { descuento: p })}>
            {p ? p + " %" : "No"}
          </button>
        ))}
      </div>
      <dl className="cobro-cuentas">
        <div>
          <dt>Cuenta</dt>
          <dd>{plata(total)}</dd>
        </div>
        {desc > 0 && (
          <div className="com">
            <dt>Descuento {o.descuento} %</dt>
            <dd>− {plata(desc)}</dd>
          </div>
        )}
        {(o.pagos ?? []).map((p, i) => (
          <div key={i} className="pagado-parte">
            <dt>
              Pagó la parte {i + 1} · {MEDIOS[p.medio]}
            </dt>
            <dd>− {plata(p.monto)}</dd>
          </div>
        ))}
        <div className="neto">
          <dt>{o.pagos?.length ? "Falta cobrar" : "Total"}</dt>
          <dd>{plata(restante)}</dd>
        </div>
      </dl>
      <div className="fila-btns">
        <button className="btn btn-2" onClick={() => setModo({ tipo: "sumar" })}>
          <Plus size={16} /> Agregar
        </button>
        {faltan > 0 && (
          <button className="btn btn-2 btn-cocina" onClick={() => act.enviarACocina(mesa.id)}>
            <ChefHat size={16} /> Mandar a cocina ({faltan})
          </button>
        )}
      </div>
      <div className="fila-btns">
        <button className="btn btn-2" onClick={() => setModo({ tipo: "dividir" })} disabled={!o.items.length || restante <= 0}>
          Dividir la cuenta
        </button>
        <button className="btn btn-1" onClick={() => setModo({ tipo: "cobrar", monto: restante, texto: o.pagos?.length ? "Lo que falta" : "Toda la cuenta" })} disabled={!o.items.length || restante <= 0}>
          Cobrar {plata(restante)}
        </button>
      </div>
      {libres.length > 0 && (
        <label className="campo mover">
          <span>
            <ArrowRightLeft size={14} /> Cambiar de mesa
          </span>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                act.moverMesa(mesa.id, e.target.value);
                cerrar();
              }
            }}
          >
            <option value="">Elegí una mesa libre…</option>
            {libres.map((m) => (
              <option key={m.id} value={m.id}>
                Mesa {m.nombre} ({m.cap} lugares)
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        className="link-peligro"
        onClick={() => {
          if (confirm(o.pagos?.length ? "¿Liberar la mesa? Lo ya cobrado queda en la caja." : "¿Liberar la mesa sin cobrar?")) {
            act.liberarMesa(mesa.id);
            cerrar();
          }
        }}
      >
        Liberar sin cobrar
      </button>
    </>
  );
}

function EditorMesas({ cerrar }: { cerrar: () => void }) {
  const { st, act } = useResto();
  const [zonas, setZonas] = useState(() => st.local.zonas.map((z) => ({ ...z })));
  const [lista, setLista] = useState(() => st.mesas.map(({ id, nombre, cap, zona, ocupada }) => ({ id: id as string | null, nombre, cap, zona, ocupada: !!ocupada })));
  const [nuevaZona, setNuevaZona] = useState("");
  const set = (i: number, patch: Partial<(typeof lista)[number]>) => setLista(lista.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const total = lista.reduce((s, m) => s + (Number(m.cap) || 0), 0);
  const nombres = lista.map((m) => String(m.nombre).trim());
  const repetidos = nombres.filter((n, i) => n && nombres.indexOf(n) !== i);
  const agregar = (zona: string) => {
    const nums = lista.map((m) => parseInt(m.nombre, 10)).filter((n) => !isNaN(n));
    setLista([...lista, { id: null, nombre: String((nums.length ? Math.max(...nums) : 0) + 1), cap: 4, zona, ocupada: false }]);
  };
  const guardar = () => {
    if (repetidos.length || nombres.some((n) => !n) || zonas.some((z) => !z.nombre.trim())) return;
    act.editarLocal((l) => {
      l.zonas = zonas.map((z) => ({ ...z, nombre: z.nombre.trim() }));
    });
    act.guardarMesas(lista);
    cerrar();
  };
  return (
    <>
      <p className="nota-chica">Zonas del salón (adentro, vereda, terraza, barra) y sus mesas: número o nombre y cuántos lugares. Las ocupadas no se pueden borrar.</p>
      {zonas.map((z, zi) => {
        const deZona = lista.map((m, i) => ({ m, i })).filter(({ m }) => m.zona === z.id);
        return (
          <section key={z.id} className="ed-zona">
            <div className="ed-zona-cab">
              <input value={z.nombre} onChange={(e) => setZonas(zonas.map((x, j) => (j === zi ? { ...x, nombre: e.target.value } : x)))} aria-label="Nombre de la zona" />
              <button type="button" className="icono" disabled={deZona.length > 0 || zonas.length === 1} title={deZona.length ? "Tiene mesas" : "Borrar zona"} onClick={() => setZonas(zonas.filter((_, j) => j !== zi))} aria-label="Borrar zona">
                <Trash2 size={16} />
              </button>
            </div>
            <ul className="ed-mesas">
              {deZona.map(({ m, i }) => (
                <li key={m.id || "n" + i}>
                  <label>
                    Mesa
                    <input value={m.nombre} onChange={(e) => set(i, { nombre: e.target.value })} aria-label="Número de mesa" />
                  </label>
                  <span className="contador chico">
                    <button type="button" onClick={() => set(i, { cap: Math.max(1, m.cap - 1) })} aria-label="Menos lugares">
                      −
                    </button>
                    <output>{m.cap} lug.</output>
                    <button type="button" onClick={() => set(i, { cap: m.cap + 1 })} aria-label="Más lugares">
                      +
                    </button>
                  </span>
                  {zonas.length > 1 && (
                    <select value={m.zona} onChange={(e) => set(i, { zona: e.target.value })} aria-label="Zona" className="ed-mesa-zona">
                      {zonas.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                  <button type="button" className="icono" disabled={m.ocupada} title={m.ocupada ? "Está ocupada" : "Borrar mesa"} onClick={() => setLista(lista.filter((_, j) => j !== i))} aria-label="Borrar mesa">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="link" onClick={() => agregar(z.id)}>
              <Plus size={14} /> Mesa en {z.nombre || "esta zona"}
            </button>
          </section>
        );
      })}
      <div className="fila-btns">
        <input value={nuevaZona} onChange={(e) => setNuevaZona(e.target.value)} placeholder="Nueva zona (Terraza, Barra…)" aria-label="Nueva zona" style={{ flex: 2 }} />
        <button
          type="button"
          className="btn btn-2"
          disabled={!nuevaZona.trim()}
          onClick={() => {
            setZonas([...zonas, { id: uid(), nombre: nuevaZona.trim() }]);
            setNuevaZona("");
          }}
        >
          <Plus size={16} /> Zona
        </button>
      </div>
      {repetidos.length > 0 && <p className="error">Hay mesas con el mismo nombre: {repetidos.join(", ")}</p>}
      <p className="bolsa-total">
        <span>{lista.length} mesas</span>
        <b>{total} lugares</b>
      </p>
      <button className="btn btn-1 ancho" onClick={guardar}>
        Guardar salón
      </button>
    </>
  );
}

function TarjetaMesa({ m, sel, abrir, ahora }: { m: Mesa; sel: boolean; abrir: () => void; ahora: number }) {
  const { st } = useResto();
  if (m.unidaA) {
    const p = st.mesas.find((x) => x.id === m.unidaA);
    return (
      <button className={"mesa unida" + (sel ? " sel" : "")} onClick={abrir} aria-label={`Mesa ${m.nombre}, unida a la mesa ${p?.nombre}`}>
        <span className="mesa-num">{m.nombre}</span>
        <span className="mesa-info">
          <Link2 size={13} /> Unida a la {p?.nombre}
        </span>
      </button>
    );
  }
  const o = m.ocupada;
  const larga = o && ahora - o.desde > 90 * 60000;
  const cap = capGrupo(st, m.id);
  const mozo = o?.mozo ? st.local.personal.find((p) => p.id === o.mozo)?.nombre : null;
  const listas = o ? st.comandas.filter((c) => c.mesaId === m.id && c.estado === "lista").length : 0;
  const faltan = o ? sinEnviar(o) : 0;
  const pagadas = o?.pagos?.length ?? 0;
  return (
    <button
      className={"mesa" + (cap >= 6 ? " grande" : "") + (o ? " ocupada" : "") + (larga ? " larga" : "") + (listas ? " servir" : "") + (sel ? " sel" : "")}
      onClick={abrir}
      aria-label={`Mesa ${m.nombre}, ${o ? `ocupada, ${o.personas} personas` : "libre"}`}
    >
      <span className="mesa-num">
        {m.nombre}
        {cap > m.cap && <small> +{grupoDe(st, m.id).filter((x) => x.id !== m.id).map((x) => x.nombre).join(" +")}</small>}
      </span>
      <span className="mesa-sillas" aria-hidden>
        {Array.from({ length: cap }, (_, k) => (
          <i key={k} className={o && k < o.personas ? "on" : ""} />
        ))}
      </span>
      {o ? (
        <>
          <span className="mesa-info">
            {o.personas} p. · {duracion(o.desde, ahora)}
            {mozo ? ` · ${mozo}` : ""}
          </span>
          <span className="mesa-total">{plata(totalItems(o.items))}</span>
          {o.nombre && <span className="mesa-nombre">{o.nombre}</span>}
          <span className="mesa-badges">
            {listas > 0 && (
              <em className="b-servir">
                <Bell size={12} /> Para servir
              </em>
            )}
            {faltan > 0 && <em className="b-faltan">{faltan} sin mandar</em>}
            {pagadas > 0 && <em className="b-parcial">Pagó {pagadas}</em>}
            {st.llamados
              .filter((l) => l.mesaId === m.id)
              .map((l) => (
                <em key={l.id} className="b-llama">
                  <BellRing size={12} /> {l.tipo === "cuenta" ? "Pide la cuenta" : "Llama"}
                </em>
              ))}
          </span>
        </>
      ) : (
        <span className="mesa-info">Libre · {cap} lugares</span>
      )}
    </button>
  );
}

export default function Salon() {
  const ahora = useAhora();
  const { st, act } = useResto();
  const [abierta, setAbierta] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [zona, setZona] = useState("todas");
  const mesa = st.mesas.find((m) => m.id === abierta);
  const n = enSalon(st);
  const aforo = aforoDe(st);
  const ocupadas = st.mesas.filter((m) => m.ocupada).length;
  const fecha = new Date(ahora);
  const hoy = hoyISO(fecha);
  const estado = estadoAhora(st.local.horarios, fecha);
  const hh = `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
  const franja = franjaDeHora(st.local.horarios, hoy, hh);
  const proximas = st.local.modulos.reservas ? st.reservas.filter((r) => r.fecha === hoy && ["pendiente", "confirmada"].includes(r.estado)).sort((a, b) => a.hora.localeCompare(b.hora)) : [];
  const caja = resumenCaja(st);
  const abiertoTotal = st.mesas.reduce((s, m) => s + (m.ocupada ? totalMesa(st.local, m.ocupada) : 0), 0);
  const paraServir = st.comandas.filter((c) => c.mesaId && c.estado === "lista").length;
  const esperando = st.espera.filter((e) => e.estado === "esperando" || e.estado === "avisado");
  const top = masPedidos(st, 4);
  const zonas = st.local.zonas.filter((z) => st.mesas.some((m) => m.zona === z.id));
  const zonasVistas = zona === "todas" ? zonas : zonas.filter((z) => z.id === zona);
  const huerfanas = st.mesas.filter((m) => !st.local.zonas.some((z) => z.id === m.zona));

  return (
    <div className="vista">
      <Cabecera et={estado.abierto ? `Abierto · ${estado.franja} · cierra ${estado.cierra}` : "Ahora cerrado"} titulo="Salón">
        <button className="btn btn-2" onClick={() => setEditando(true)}>
          <Pencil size={16} /> Editar salón
        </button>
      </Cabecera>

      <div className="kpis">
        <div className="kpi grande">
          <span>En el salón</span>
          <strong>
            {n}
            <small>/{aforo}</small>
          </strong>
          <div className="barra">
            <i style={{ width: Math.min(100, aforo ? (n / aforo) * 100 : 0) + "%" }} />
          </div>
          <small>
            {ocupadas} de {st.mesas.length} mesas ocupadas
          </small>
        </div>
        <div className="kpi">
          <span>Cuentas abiertas</span>
          <strong>{plata(abiertoTotal)}</strong>
          <small>{paraServir ? `${paraServir} comanda${paraServir > 1 ? "s" : ""} para servir` : "sin cobrar todavía"}</small>
        </div>
        {st.local.modulos.reservas && (
          <div className="kpi">
            <span>Reservas por llegar</span>
            <strong>{proximas.length}</strong>
            <small>
              {proximas.reduce((s, r) => s + r.personas, 0)} personas{franja >= 0 ? ` · cupo ${cupoTurno(st, hoy, franja)}` : ""}
            </small>
          </div>
        )}
        <div className="kpi">
          <span>Esperando mesa</span>
          <strong>{esperando.length}</strong>
          <small>{st.local.modulos.caja ? `Caja: ${plata(caja.bruto)} en el turno` : `${esperando.reduce((s, e) => s + e.personas, 0)} personas`}</small>
        </div>
      </div>

      {st.llamados.length > 0 && (
        <ul className="llamados" aria-live="polite">
          {st.llamados.map((l) => {
            const m = st.mesas.find((x) => x.id === l.mesaId);
            return (
              <li key={l.id} className={"llamado " + l.tipo}>
                <BellRing size={16} aria-hidden />
                <span>
                  <b>Mesa {m?.nombre ?? "?"}</b> {l.tipo === "cuenta" ? "pide la cuenta" : "llama al mozo"} · hace {Math.max(0, Math.round((ahora - l.ts) / 60000))} min
                </span>
                <button className="btn btn-1 chico" onClick={() => act.atenderLlamado(l.id)}>
                  <Check size={14} /> Voy
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {zonas.length > 1 && (
        <div className="chips zonas" role="tablist" aria-label="Zonas del salón">
          <button role="tab" aria-selected={zona === "todas"} className={zona === "todas" ? "on" : ""} onClick={() => setZona("todas")}>
            Todo el salón
          </button>
          {zonas.map((z) => {
            const ms = st.mesas.filter((m) => m.zona === z.id);
            return (
              <button key={z.id} role="tab" aria-selected={zona === z.id} className={zona === z.id ? "on" : ""} onClick={() => setZona(z.id)}>
                {z.nombre} · {ms.filter((m) => m.ocupada || m.unidaA).length}/{ms.length}
              </button>
            );
          })}
        </div>
      )}

      <div className="salon-grid">
        <div className="planos">
          {[...zonasVistas.map((z) => ({ id: z.id, nombre: z.nombre, mesas: st.mesas.filter((m) => m.zona === z.id) })), ...(zona === "todas" && huerfanas.length ? [{ id: "_", nombre: "Sin zona", mesas: huerfanas }] : [])].map((z) => (
            <section key={z.id} className="zona">
              {zonas.length > 1 && <h3 className="zona-nombre">{z.nombre}</h3>}
              <div className="plano">
                {z.mesas.map((m) => (
                  <TarjetaMesa key={m.id} m={m} sel={abierta === m.id} abrir={() => setAbierta(m.id)} ahora={ahora} />
                ))}
              </div>
            </section>
          ))}
          {!st.mesas.length && <p className="vacio">No hay mesas cargadas. Tocá “Editar salón”.</p>}
        </div>

        <aside className="proximas">
          <Espera />
          {st.local.modulos.reservas && (
            <>
              <h3>Llegan hoy</h3>
              {proximas.length ? (
                <ul>
                  {proximas.map((r) => (
                    <li key={r.id} className={r.estado}>
                      <b>{r.hora}</b>
                      <span>
                        {r.nombre}
                        <small>
                          {r.personas} personas{r.nota ? " · " + r.nota : ""}
                        </small>
                      </span>
                      {r.estado === "pendiente" && <em>sin confirmar</em>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="vacio">Nada pendiente para hoy.</p>
              )}
              <a href="#/panel/reservas" className="link">
                Ver todas las reservas →
              </a>
            </>
          )}
          {top.length > 0 && (
            <>
              <h3>Lo que más sale</h3>
              <ol className="top-platos">
                {top.map((p) => (
                  <li key={p.nombre}>
                    <span>{p.nombre}</span>
                    <b>{p.cant}</b>
                  </li>
                ))}
              </ol>
            </>
          )}
        </aside>
      </div>

      {editando && (
        <Cajon titulo="Salón y mesas" cerrar={() => setEditando(false)}>
          <EditorMesas cerrar={() => setEditando(false)} />
        </Cajon>
      )}
      {mesa && (
        <Cajon titulo={`Mesa ${mesa.nombre}`} sub={mesa.ocupada?.nombre || `${capGrupo(st, mesa.id)} lugares`} cerrar={() => setAbierta(null)}>
          {mesa.unidaA ? (
            <>
              <p>
                Está unida a la mesa {st.mesas.find((x) => x.id === mesa.unidaA)?.nombre}
                {st.mesas.find((x) => x.id === mesa.unidaA)?.ocupada ? ", que está ocupada" : ""}.
              </p>
              <button
                className="btn btn-2 ancho"
                onClick={() => {
                  act.separarMesa(mesa.id);
                  setAbierta(null);
                }}
              >
                <Unlink size={16} /> Separar
              </button>
            </>
          ) : mesa.ocupada ? (
            <Cuenta key={mesa.id} mesa={mesa} cerrar={() => setAbierta(null)} />
          ) : (
            <Sentar mesa={mesa} cerrar={() => setAbierta(null)} />
          )}
        </Cajon>
      )}
    </div>
  );
}
