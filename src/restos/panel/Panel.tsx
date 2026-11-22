"use client";

import { BarChart3, BookOpen, CalendarDays, ChefHat, ExternalLink, Globe, LayoutGrid, LogOut, Settings, ShoppingBag, UserRound, Wallet, type LucideIcon } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { aforoDe, enSalon } from "../lib/logica";
import { puede, type IdSeccion } from "../lib/permisos";
import { useModo } from "../lib/modo";
import { useResto } from "../lib/store";
import { ROLES, type Estado, type Persona } from "../lib/tipos";
import { Sello } from "../publico/comun";
import Ajustes from "./Ajustes";
import Caja from "./Caja";
import Carta from "./Carta";
import Cocina from "./Cocina";
import Numeros from "./Numeros";
import Pedidos from "./Pedidos";
import Reservas from "./Reservas";
import Salon from "./Salon";
import Web from "./Web";

const sesion = (clave: string) => clave + ":sesion";

const PersonaCtx = createContext<Persona | null>(null);
/** Quién está usando el panel. */
export function usePersona() {
  const p = useContext(PersonaCtx);
  if (!p) throw new Error("usePersona fuera del panel");
  return p;
}

function Pin({ ok }: { ok: (p: Persona) => void }) {
  const { st, clave } = useResto();
  const modo = useModo();
  const [pin, setPin] = useState("");
  const [mal, setMal] = useState(false);
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const p = st.local.personal.find((x) => x.activo && x.pin === pin);
    if (p) {
      sessionStorage.setItem(sesion(clave), p.id);
      ok(p);
    } else {
      setMal(true);
      setPin("");
    }
  };
  return (
    <div className="pin-fondo">
      <form className="pin" onSubmit={enviar}>
        <Sello nombre={st.local.nombre} grande />
        <h1>Panel de {st.local.nombre}</h1>
        <label>
          Tu PIN
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setMal(false);
            }}
          />
        </label>
        {mal && (
          <p className="error" role="alert">
            PIN incorrecto
          </p>
        )}
        <button className="btn btn-1 ancho">Entrar</button>
        {modo.tipo === "demo" && <p className="pin-demo">Demo: 1234 encargada · 1111 mozo · 3333 cocina · 4444 caja</p>}
        <a href="#/">← Volver a la web</a>
      </form>
    </div>
  );
}

const SECCIONES: { id: IdSeccion; nombre: string; icono: LucideIcon; usa: (st: Estado) => boolean }[] = [
  { id: "salon", nombre: "Salón", icono: LayoutGrid, usa: (st) => st.local.modulos.salon },
  { id: "cocina", nombre: "Cocina", icono: ChefHat, usa: (st) => st.local.modulos.salon || st.local.modulos.llevar || st.local.modulos.delivery },
  { id: "reservas", nombre: "Reservas", icono: CalendarDays, usa: (st) => st.local.modulos.reservas },
  { id: "pedidos", nombre: "Pedidos", icono: ShoppingBag, usa: (st) => st.local.modulos.llevar || st.local.modulos.delivery || st.local.modulos.tienda },
  { id: "caja", nombre: "Caja", icono: Wallet, usa: (st) => st.local.modulos.caja },
  { id: "numeros", nombre: "Números", icono: BarChart3, usa: () => true },
  { id: "carta", nombre: "Carta", icono: BookOpen, usa: () => true },
  { id: "web", nombre: "Web", icono: Globe, usa: () => true },
  { id: "ajustes", nombre: "Ajustes", icono: Settings, usa: () => true },
];
const VISTAS = { salon: Salon, cocina: Cocina, reservas: Reservas, pedidos: Pedidos, caja: Caja, numeros: Numeros, carta: Carta, web: Web, ajustes: Ajustes };

export default function Panel({ ruta }: { ruta: string }) {
  const { st, clave } = useResto();
  const modo = useModo();
  const [personaId, setPersonaId] = useState(() => sessionStorage.getItem(sesion(clave)));
  const persona = st.local.personal.find((p) => p.id === personaId && p.activo);
  if (!persona) return <Pin ok={(p) => setPersonaId(p.id)} />;

  // Plan «Carta y web»: sin panel del salón; se edita la carta, la web y los datos del local.
  const delPlan = (id: IdSeccion) => !(modo.tipo === "cliente" && modo.plan === "carta") || ["carta", "web", "ajustes"].includes(id);
  const visibles = SECCIONES.filter((s) => s.usa(st) && puede(persona.rol, s.id) && delPlan(s.id));
  const pedida = ruta.split("/")[2] as IdSeccion | undefined;
  const sec = visibles.find((s) => s.id === pedida)?.id ?? visibles[0]!.id;
  const pendientes: Partial<Record<IdSeccion, number>> = {
    reservas: st.reservas.filter((r) => r.estado === "pendiente").length,
    pedidos: st.pedidos.filter((p) => p.estado === "nuevo").length,
    cocina: st.comandas.filter((c) => c.estado === "nueva").length,
    salon: st.llamados.length,
  };
  const Vista = VISTAS[sec];
  const aforo = aforoDe(st);

  return (
    <PersonaCtx.Provider value={persona}>
      <div className={"pnl" + (sec === "cocina" ? " pnl-cocina" : "") + (sec === "web" ? " pnl-web" : "")}>
        <aside className="pnl-lat">
          <a href="#/panel" className="pnl-marca">
            <Sello nombre={st.local.nombre} />
            <span>
              {st.local.nombre}
              <small>{st.local.modulos.salon && aforo ? `${enSalon(st)}/${aforo} en el salón` : st.local.bajada}</small>
            </span>
          </a>
          <nav aria-label="Panel">
            {visibles.map(({ id, nombre, icono: I }) => (
              <a key={id} href={"#/panel/" + id} className={sec === id ? "on" : ""} aria-current={sec === id ? "page" : undefined}>
                <I size={18} /> <span>{nombre}</span>
                {(pendientes[id] ?? 0) > 0 && <em>{pendientes[id]}</em>}
              </a>
            ))}
          </nav>
          <div className="pnl-lat-pie">
            <span className="pnl-quien">
              <UserRound size={16} /> <span>{persona.nombre}</span> <small>{ROLES[persona.rol].nombre}</small>
            </span>
            <a href="#/" target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> <span>Ver la web</span>
            </a>
            <button
              onClick={() => {
                sessionStorage.removeItem(sesion(clave));
                setPersonaId(null);
              }}
            >
              <LogOut size={16} /> <span>Cambiar de usuario</span>
            </button>
            <small>Al Toque · v{process.env.NEXT_PUBLIC_VERSION}</small>
          </div>
        </aside>
        <main className="pnl-main">
          {modo.tipo === "cliente" && (sec === "carta" || sec === "web") && (
            <p className="aviso-publicar" role="note">
              Lo que cambies acá queda guardado en este equipo. Para que se vea en tu página, descargá la copia (Ajustes → Copia y datos) y mandánosla por WhatsApp: la publicamos en el día. Cuando pases a la nube, se
              publica sola.
            </p>
          )}
          <Vista />
        </main>
      </div>
    </PersonaCtx.Provider>
  );
}
