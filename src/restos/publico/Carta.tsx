"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import ElegirOpciones, { lineaDe } from "../comun/Opciones";
import { precioVigente, promoActiva, saleHoy, textoDias } from "../lib/logica";
import { esCliente, useModo } from "../lib/modo";
import { useAhora, useResto } from "../lib/store";
import { ETIQUETAS, type Categoria, type Estado, type Etiqueta, type Item, type Plato } from "../lib/tipos";
import { plata } from "../lib/util";
import { usaPedidos } from "./comun";
import { useTitulo } from "./Secciones";

/** Secciones que se muestran en la web: con platos, y las de tienda solo si el módulo está prendido. */
export const seccionesVisibles = (st: Estado) =>
  st.categorias.filter((c) => (!c.tienda || st.local.modulos.tienda) && st.platos.some((p) => p.cat === c.id));

/** ¿Este plato se puede sumar a un pedido desde la web? Lo de tienda se puede retirar aunque no haya "para llevar". */
export function sePuedePedir(st: Estado, cat: Categoria | undefined, p: Plato, ahora: Date) {
  if (!p.disponible || !p.llevar || !saleHoy(p, ahora)) return false;
  if (cat?.tienda) return st.local.modulos.tienda;
  return usaPedidos(st);
}

export type Sumar = (linea: Pick<Item, "platoId" | "nombre" | "precio" | "opciones" | "nota">, delta: number) => void;

function PlatoCarta({ pl, n, bolsa, pedible, sumar, elegir }: { pl: Plato; n: number; bolsa: Item[]; pedible: boolean; sumar: Sumar; elegir: (p: Plato) => void }) {
  const { st } = useResto();
  const ahora = new Date(useAhora());
  const d = st.local.diseno;
  const { precio, lista, promo } = precioVigente(st.local, pl, ahora);
  const hoy = saleHoy(pl, ahora);
  const lineas = bolsa.filter((i) => i.platoId === pl.id);
  const en = lineas.reduce((s, i) => s + i.cant, 0);
  const simple = !pl.opciones?.length;
  const linea = lineaDe(st.local, pl, ahora);
  return (
    <li className={"plato" + (pl.destacado ? " dest" : "") + (pl.disponible && hoy ? "" : " agotado") + (promo ? " en-promo" : "")}>
      {d === "imprenta" && <span className="pl-num">Nº {String(n).padStart(2, "0")}</span>}
      <div className="pl-cab">
        <h4>{pl.nombre}</h4>
        <span className="pl-dots" aria-hidden />
        <span className="pl-precio">
          {promo && <s>{plata(lista)}</s>} {plata(precio)}
        </span>
      </div>
      {pl.desc && <p className="pl-desc">{pl.desc}</p>}
      {!simple && <p className="pl-ops">{pl.opciones!.map((g) => `${g.nombre}: ${g.valores.map((v) => v.nombre).join(", ")}`).join(" · ")}</p>}
      <div className="pl-pie">
        {pl.porcion && <span className="pl-porcion">{pl.porcion}</span>}
        {promo && <span className="pl-promo">{promo.nombre} −{promo.porcentaje} %</span>}
        {pl.dias?.length ? <span className="pl-dias">{textoDias(pl.dias)}</span> : null}
        {pl.etiquetas.map((e) => (
          <span key={e} className={"pl-et et-" + e} title={ETIQUETAS[e].nombre}>
            {ETIQUETAS[e].corto}
          </span>
        ))}
        {pl.destacado && <span className="pl-casa">{d === "pizarra" ? "¡recomendado!" : d === "nocturno" || d === "moderno" ? "Top" : "De la casa"}</span>}
        {!pl.disponible && <span className="pl-agotado">Se terminó por hoy</span>}
        {pl.disponible && !hoy && <span className="pl-agotado">Hoy no sale</span>}
        {pedible &&
          (en && simple ? (
            <span className="pl-cant">
              <button type="button" onClick={() => sumar(lineas[0] ?? linea, -1)} aria-label={"Quitar " + pl.nombre}>
                <Minus size={14} />
              </button>
              <b>{en}</b>
              <button type="button" onClick={() => sumar(lineas[0] ?? linea, 1)} aria-label={"Sumar " + pl.nombre}>
                <Plus size={14} />
              </button>
            </span>
          ) : (
            <button type="button" className="pl-llevar" onClick={() => (simple ? sumar(linea, 1) : elegir(pl))} aria-label={"Pedir " + pl.nombre}>
              <Plus size={14} /> {simple ? "Pedir" : en ? `Pedir otro (${en})` : "Elegir y pedir"}
            </button>
          ))}
      </div>
    </li>
  );
}

/** Aviso arriba de la carta cuando corre una promo. */
function PromosAhora() {
  const { st } = useResto();
  const ahora = new Date(useAhora());
  const activas = st.categorias.map((c) => ({ c, p: promoActiva(st.local, c.id, ahora) })).filter((x) => x.p);
  if (!activas.length) return null;
  const porPromo = new Map<string, { nombre: string; hasta: string; porcentaje: number; secciones: string[] }>();
  for (const { c, p } of activas) {
    const x = porPromo.get(p!.id) ?? { nombre: p!.nombre, hasta: p!.hasta, porcentaje: p!.porcentaje, secciones: [] };
    x.secciones.push(c.nombre);
    porPromo.set(p!.id, x);
  }
  return (
    <div className="promo-ahora" role="status">
      {[...porPromo.values()].map((p) => (
        <p key={p.nombre}>
          <b>{p.nombre}</b> hasta las {p.hasta}: {p.porcentaje} % menos en {p.secciones.join(", ").toLowerCase()}.
        </p>
      ))}
    </div>
  );
}

export default function Carta({ bolsa, sumar }: { bolsa: Item[]; sumar: Sumar }) {
  const { st } = useResto();
  const ahora = new Date(useAhora());
  const d = st.local.diseno;
  const [cat, setCat] = useState("todas");
  const [filtro, setFiltro] = useState<Etiqueta | null>(null);
  const [eligiendo, setEligiendo] = useState<Plato | null>(null);
  const cliente = esCliente(useModo());
  const cats = useMemo(() => seccionesVisibles(st), [st]);
  const hayEtiquetas = (["sintacc", "vegetariano", "vegano"] as Etiqueta[]).filter((e) => st.platos.some((p) => p.etiquetas.includes(e)));
  const visibles = cat === "todas" ? cats : cats.filter((c) => c.id === cat);
  const pedidos = usaPedidos(st) || (st.local.modulos.tienda && cats.some((c) => c.tienda));
  let n = 0;

  const titulo = useTitulo("carta", { pizarra: "Lo que sale de la cocina", nocturno: "La carta de la noche", cafe: "Para hoy", brasa: "Del fuego a la mesa", moderno: "Menú", trattoria: "Il menù", imprenta: "Se come como en casa" }[d]);

  return (
    <section id="carta" className={"carta carta-" + d}>
      <div className="sec-cab">
        <span className="sec-et">{d === "pizarra" ? "Escrito hoy" : "La carta"}</span>
        <h2>{titulo}</h2>
        <p>
          {pedidos
            ? "Lo que tiene el botón Pedir lo sumás a tu pedido" + (st.local.modulos.delivery ? " y te lo llevamos o lo pasás a buscar." : " y lo pasás a buscar.")
            : "Precios por plato. Consultá por opciones del día en el salón."}
        </p>
      </div>
      <PromosAhora />
      <div className="cats" role="tablist" aria-label="Secciones de la carta">
        <button role="tab" aria-selected={cat === "todas"} className={cat === "todas" ? "on" : ""} onClick={() => setCat("todas")}>
          Todo
        </button>
        {cats.map((c) => (
          <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? "on" : ""} onClick={() => setCat(c.id)}>
            {c.nombre}
          </button>
        ))}
      </div>
      {hayEtiquetas.length > 0 && (
        <div className="filtros" aria-label="Filtrar la carta">
          <span>Mostrar solo:</span>
          {hayEtiquetas.map((e) => (
            <button key={e} type="button" aria-pressed={filtro === e} className={filtro === e ? "on" : ""} onClick={() => setFiltro(filtro === e ? null : e)}>
              {ETIQUETAS[e].nombre}
            </button>
          ))}
        </div>
      )}
      <div className="carta-cuerpo">
        {visibles.map((c) => {
          const lista = st.platos.filter((p) => p.cat === c.id && (!filtro || p.etiquetas.includes(filtro)));
          if (!lista.length) return null;
          return (
            <div key={c.id} className={"cat-bloque" + (c.tienda ? " tienda" : "")}>
              <h3>
                {d === "imprenta" && <span aria-hidden>❦ </span>}
                {c.nombre}
                {d === "imprenta" && <span aria-hidden> ❦</span>}
              </h3>
              {c.nota && <p className="cat-nota">{c.nota}</p>}
              <ul>
                {lista.map((pl) => (
                  <PlatoCarta key={pl.id} pl={pl} n={++n} bolsa={bolsa} pedible={sePuedePedir(st, c, pl, ahora)} sumar={sumar} elegir={setEligiendo} />
                ))}
              </ul>
            </div>
          );
        })}
        {filtro && !visibles.some((c) => st.platos.some((p) => p.cat === c.id && p.etiquetas.includes(filtro))) && (
          <p className="vacio">No hay platos {ETIQUETAS[filtro].nombre.toLowerCase()} en esta sección.</p>
        )}
      </div>
      {!cliente && <p className="carta-aviso">Precios de ejemplo para la demo.</p>}
      {eligiendo && <ElegirOpciones plato={eligiendo} accion="Sumar al pedido" onElegir={(linea, cant) => sumar(linea, cant)} cerrar={() => setEligiendo(null)} />}
    </section>
  );
}

