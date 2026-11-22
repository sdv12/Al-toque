"use client";

import { useResto } from "../lib/store";
import { plata } from "../lib/util";
import { EstadoLocal, Ir, Sello, usaPedidos, usaReservas } from "./comun";

/** Los dos botones del encabezado, según lo que el restaurante tiene prendido. */
function Botones() {
  const { st } = useResto();
  const reservas = usaReservas(st);
  const pedidos = usaPedidos(st);
  return (
    <div className="hero-btns">
      {reservas ? (
        <Ir a="reservar" className="btn btn-1">
          Reservar mesa
        </Ir>
      ) : (
        <Ir a="carta" className="btn btn-1">
          {pedidos ? "Hacer un pedido" : "Ver la carta"}
        </Ir>
      )}
      <Ir a={reservas ? "carta" : "donde"} className="btn btn-2">
        {reservas ? (pedidos ? "Carta y pedidos" : "Ver la carta") : "Dónde estamos"}
      </Ir>
    </div>
  );
}

/** La foto de portada que subió el restaurante (cada diseño la pone en otro lugar). */
function FotoPortada({ className }: { className: string }) {
  const { st } = useResto();
  const foto = st.local.web.portada;
  // eslint-disable-next-line @next/next/no-img-element -- foto guardada en el navegador (data URL)
  return foto ? <img className={"hero-foto " + className} src={foto} alt={st.local.nombre} /> : null;
}

export default function Hero() {
  const { st } = useResto();
  const { local } = st;
  const { textos } = local;
  const dest = st.platos.filter((p) => p.destacado && p.disponible).slice(0, 4);
  const d = local.diseno;
  const foto = local.web.portada;

  if (d === "pizarra")
    return (
      <section className="hero hero-pizarra">
        <div className="pizarron">
          <div className="pz-izq">
            <Sello nombre={local.nombre} grande />
            <h1>
              {textos.titulo}
              <br />
              {textos.subtitulo}
            </h1>
            <p>{textos.historia.split(". ")[0]}.</p>
            <Botones />
          </div>
          <div className="pz-der">
            <FotoPortada className="pz-foto" />
            <h2>Hoy en el pizarrón</h2>
            <ul>
              {dest.map((p) => (
                <li key={p.id}>
                  <span>{p.nombre}</span>
                  <b>{plata(p.precio)}</b>
                </li>
              ))}
            </ul>
            <p className="pz-firma">— la cocina</p>
          </div>
        </div>
      </section>
    );

  if (d === "trattoria")
    return (
      <section className="hero hero-trattoria">
        <div className="tr-grid">
          <div className="tr-txt">
            <p className="tr-top">
              {local.bajada} · {local.ciudad}
            </p>
            <h1>
              {textos.titulo} <em>{textos.subtitulo}</em>
            </h1>
            <p className="tr-bajada">{textos.historia}</p>
            <Botones />
          </div>
          <div className="tr-plato" aria-hidden>
            <div className={"tr-disco" + (foto ? " con-foto" : "")}>
              {foto ? (
                <FotoPortada className="tr-foto" />
              ) : (
                <>
                  <Sello nombre={local.nombre} grande />
                  <span>{local.nombre}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <ul className="tr-datos">
          {textos.datos.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
    );

  if (d === "cafe")
    return (
      <section className="hero hero-cafe">
        <div className="cf-tarjeta">
          <EstadoLocal />
          <h1>
            {textos.titulo}
            <br />
            <span>{textos.subtitulo}</span>
          </h1>
          <p>{textos.historia}</p>
          <Botones />
        </div>
        <aside className="cf-lado">
          {foto ? <FotoPortada className="cf-foto" /> : <Sello nombre={local.nombre} grande />}
          <strong>{local.nombre}</strong>
          <small>{local.bajada}</small>
          <ul className="cf-datos">
            {textos.datos.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <ul className="cf-fav">
            {dest.slice(0, 3).map((p) => (
              <li key={p.id}>
                <span>{p.nombre}</span>
                <b>{plata(p.precio)}</b>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    );

  if (d === "nocturno")
    return (
      <section className={"hero hero-nocturno" + (foto ? " con-fondo" : "")} style={foto ? { backgroundImage: `linear-gradient(180deg, rgba(11,11,16,.55), rgba(11,11,16,.92)), url(${foto})` } : undefined}>
        <p className="nc-top">
          <EstadoLocal /> <span>{local.direccion}</span>
        </p>
        <h1>
          <span className="nc-neon">{textos.titulo}</span>
          <span>{textos.subtitulo}</span>
        </h1>
        <p className="nc-bajada">{textos.historia}</p>
        <Botones />
        <div className="nc-cinta" aria-hidden>
          <div>
            {[0, 1].map((k) => (
              <span key={k}>
                {textos.datos.map((x) => (
                  <b key={x}>{x} ✦ </b>
                ))}
                <b>{local.nombre} ✦ </b>
              </span>
            ))}
          </div>
        </div>
      </section>
    );

  if (d === "brasa")
    return (
      <section className={"hero hero-brasa" + (foto ? " con-fondo" : "")} style={foto ? { backgroundImage: `linear-gradient(90deg, rgba(23,17,13,.94) 30%, rgba(23,17,13,.55)), url(${foto})` } : undefined}>
        <div className="br-in">
          <p className="br-top">
            <Sello nombre={local.nombre} /> {local.nombre} · {local.bajada}
          </p>
          <h1>{textos.titulo}</h1>
          <p className="br-sub">{textos.subtitulo}</p>
          <Botones />
        </div>
        {dest.length > 0 && (
          <ol className="br-cortes">
            {dest.slice(0, 3).map((p, i) => (
              <li key={p.id}>
                <span className="br-n">0{i + 1}</span>
                <strong>{p.nombre}</strong>
                {p.porcion && <em>{p.porcion}</em>}
                <b>{plata(p.precio)}</b>
              </li>
            ))}
          </ol>
        )}
      </section>
    );

  if (d === "moderno")
    return (
      <section className="hero hero-moderno">
        <div className="md-txt">
          <EstadoLocal />
          <h1>
            {textos.titulo}
            <br />
            <span>{textos.subtitulo}</span>
          </h1>
          <p>{textos.historia}</p>
          <Botones />
        </div>
        <div className="md-lado">
          <FotoPortada className="md-foto" />
        <dl className="md-datos">
          {textos.datos.map((x, i) => (
            <div key={x}>
              <dt>0{i + 1}</dt>
              <dd>{x}</dd>
            </div>
          ))}
        </dl>
        </div>
      </section>
    );

  // imprenta (por defecto)
  return (
    <section className="hero hero-imprenta">
      <div className="imp-marco">
        <p className="imp-top">
          {local.ciudad} · {local.bajada}
        </p>
        <Sello nombre={local.nombre} grande />
        <p className="imp-nombre">{local.nombre}</p>
        <div className="filete" aria-hidden>
          <span>✦</span>
        </div>
        <h1>
          {textos.titulo}
          <br />
          <em>{textos.subtitulo}</em>
        </h1>
        <p className="imp-bajada">{textos.historia.split(". ")[0]}.</p>
        <Botones />
        <div className="imp-datos">
          {textos.datos.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <FotoPortada className="imp-foto" />
      </div>
    </section>
  );
}
