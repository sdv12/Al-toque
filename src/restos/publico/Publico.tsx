"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { cantItems, claveItem, totalItems } from "../lib/logica";
import { useResto } from "../lib/store";
import type { IdSeccionWeb, Item } from "../lib/tipos";
import { plata } from "../lib/util";
import Bolsa from "./Bolsa";
import Carta, { seccionesVisibles, type Sumar } from "./Carta";
import { Ir, muestraOcupacion, Ocupacion, PildoraTop, Sello, usaPedidos, usaReservas } from "./comun";
import Hero from "./Hero";
import Reservar from "./Reservar";
import { BarraMesa, Donde, Eventos, eventosQueVienen, Galeria, Historia, Resenas } from "./Secciones";
import { useAhora } from "../lib/store";
import { esCliente, useModo } from "../lib/modo";

export function Pie() {
  const { st } = useResto();
  const { local } = st;
  return (
    <footer className="pie">
      <div className="pie-in">
        <div className="pie-marca">
          <Sello nombre={local.nombre} />
          <div>
            <strong>{local.nombre}</strong>
            <span>{local.bajada}</span>
          </div>
        </div>
        <div className="pie-links">
          <a href="#/terminos">Términos y condiciones</a>
          <a href="#/panel">Ingreso del personal</a>
        </div>
        <div className="pie-legal">
          <span>
            © {new Date().getFullYear()} {local.nombre}
          </span>
          <span>
            Hecho con <Link href="/">Al Toque</Link> · v{process.env.NEXT_PUBLIC_VERSION}
          </span>
        </div>
      </div>
    </footer>
  );
}

/** La mesa del QR (?mesa=3), si el local usa salón y la mesa existe. */
function mesaDelQR(st: ReturnType<typeof useResto>["st"]) {
  const q = new URLSearchParams(location.search).get("mesa");
  if (!q || !st.local.modulos.salon) return undefined;
  return st.mesas.find((m) => m.id === q || m.nombre === q);
}

export default function Publico({ demo }: { demo: boolean }) {
  const { st } = useResto();
  const { local } = st;
  const ahora = useAhora();
  const cliente = esCliente(useModo());
  const [mesaQR] = useState(() => mesaDelQR(st)?.id);
  const mesa = st.mesas.find((m) => m.id === mesaQR);
  const [bolsa, setBolsa] = useState<Item[]>([]);
  const [verBolsa, setVerBolsa] = useState(false);
  const tiendas = new Set(st.categorias.filter((c) => c.tienda).map((c) => c.id));
  const soloTienda = bolsa.length > 0 && bolsa.every((i) => tiendas.has(st.platos.find((p) => p.id === i.platoId)?.cat ?? ""));

  /** Suma o resta una línea de la bolsa (mismo plato con otras opciones = otra línea). */
  const sumar: Sumar = (linea, delta) =>
    setBolsa((b) => {
      const k = claveItem(linea);
      const ex = b.find((i) => claveItem(i) === k);
      const nb = ex ? b.map((i) => (claveItem(i) === k ? { ...i, cant: i.cant + delta } : i)) : delta > 0 ? [...b, { ...linea, cant: delta }] : b;
      return nb.filter((i) => i.cant > 0);
    });

  const hayTienda = local.modulos.tienda && seccionesVisibles(st).some((c) => c.tienda);
  const web = local.web;
  const visible = (id: IdSeccionWeb) => web.secciones.find((x) => x.id === id)?.visible !== false;

  // Cada sección se dibuja en el orden que eligió el restaurante (si está visible y tiene contenido).
  const SECCION: Record<IdSeccionWeb, () => ReactNode> = {
    ocupacion: () =>
      muestraOcupacion(st) && !cliente ? (
        <section className="franja-ocu">
          <Ocupacion />
        </section>
      ) : null,
    carta: () => <Carta bolsa={bolsa} sumar={sumar} />,
    reservar: () => (usaReservas(st) ? <Reservar /> : null),
    eventos: () => <Eventos />,
    galeria: () => <Galeria demo={demo} />,
    historia: () => <Historia />,
    resenas: () => <Resenas />,
    donde: () => <Donde />,
  };
  const enMenu = (id: IdSeccionWeb) => visible(id);

  return (
    <div className={"pub pub-" + local.diseno}>
      <header className="top">
        <a href="#/" className="top-marca" aria-label={`${local.nombre}, inicio`} onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}>
          <Sello nombre={local.nombre} />
          <span>{local.nombre}</span>
        </a>
        <nav className="top-nav" aria-label="Secciones">
          {enMenu("carta") && <Ir a="carta">Carta</Ir>}
          {usaReservas(st) && enMenu("reservar") && <Ir a="reservar">Reservar</Ir>}
          {(usaPedidos(st) || hayTienda) && enMenu("carta") && <Ir a="carta">Pedir</Ir>}
          {enMenu("eventos") && eventosQueVienen(web.eventos, ahora).length > 0 && <Ir a="eventos">Eventos</Ir>}
          {enMenu("donde") && <Ir a="donde">Dónde y cuándo</Ir>}
        </nav>
        <PildoraTop />
      </header>

      <Hero />

      {web.secciones.filter((x) => x.visible).map((x) => (
        <Fragment key={x.id}>{SECCION[x.id]()}</Fragment>
      ))}

      <Pie />

      {/* Llamar al mozo desde la mesa necesita la nube: en la web de un cliente, el QR abre la carta. */}
      {mesa && !cliente && <BarraMesa mesa={mesa} />}

      {bolsa.length > 0 && !verBolsa && (
        <button className={"bolsa-flot" + (mesa && !cliente ? " con-mesa" : "")} onClick={() => setVerBolsa(true)}>
          <ShoppingBag size={18} /> Tu pedido · {cantItems(bolsa)} · <b>{plata(totalItems(bolsa))}</b>
        </button>
      )}
      {verBolsa && <Bolsa bolsa={bolsa} soloTienda={soloTienda} sumar={sumar} vaciar={() => setBolsa([])} cerrar={() => setVerBolsa(false)} />}
    </div>
  );
}

export function Terminos() {
  const { st } = useResto();
  const { local } = st;
  return (
    <div className={"pub pub-" + local.diseno}>
      <main className="terminos">
        <a href="#/" className="volver">
          ← Volver
        </a>
        <h1>Términos y condiciones</h1>
        {local.modulos.reservas && (
          <>
            <h2>Reservas</h2>
            <p>
              Las reservas hechas en esta web quedan pendientes hasta que {local.nombre} las confirma por WhatsApp. La mesa se guarda {local.reservas.tolerancia} minutos después del horario
              reservado. Para grupos de más de {local.reservas.maxPersonas} personas, consultá por WhatsApp.
            </p>
          </>
        )}
        {(local.modulos.llevar || local.modulos.delivery || local.modulos.tienda) && (
          <>
            <h2>Pedidos</h2>
            <p>
              Los pedidos se preparan para el horario elegido. Los precios publicados pueden cambiar sin previo aviso; vale el precio vigente al confirmar el pedido. Si algo se terminó, te avisamos antes
              de prepararlo.
              {local.modulos.delivery && ` Los envíos llegan a ${local.delivery.zona}, con un costo de ${plata(local.delivery.costo)}.`}
            </p>
          </>
        )}
        <h2>Datos personales</h2>
        <p>Usamos tu nombre, teléfono y dirección solo para gestionar tu reserva o pedido. No los compartimos con terceros.</p>
      </main>
      <Pie />
    </div>
  );
}
