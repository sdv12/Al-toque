"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cajaActiva } from "@/cajas/simple/lib/activa";
import { periodStart } from "@/cajas/simple/lib/caja";
import { deleteDatabase } from "@/cajas/simple/lib/db";
import { formatMoney } from "@/cajas/simple/lib/format";
import { loadStore, setOpening, useStore } from "@/cajas/simple/lib/store";
import CajaScreen from "@/cajas/simple/screens/CajaScreen";
import CajonesScreen from "@/cajas/simple/screens/CajonesScreen";
import FiadoScreen from "@/cajas/simple/screens/FiadoScreen";
import PreciosScreen from "@/cajas/simple/screens/PreciosScreen";
import VenderScreen from "@/cajas/simple/screens/VenderScreen";
import BottomNav, { TABS, type Tab } from "./BottomNav";
import OpenSheet from "./OpenSheet";
import { ToastProvider, useToast } from "./Toast";

// Una sola página: las 4 secciones se cambian al instante, sin cargar nada.
// La sección va en la dirección (#precios) para que no se pierda al recargar.

// "#cajones" es la otra mitad de la sección Precios (cajones y lista del mercado).
function tabFromHash(): Tab {
  const h = window.location.hash.replace("#", "");
  if (h === "cajones") return "precios";
  return tabsActivas().some((t) => t.id === h) ? (h as Tab) : "vender";
}

/** Sin el módulo de fiado, la barra de abajo queda con 3 botones. */
function tabsActivas() {
  return TABS.filter((t) => t.id !== "fiado" || cajaActiva().fiado);
}

const TITLES: Record<Tab, string> = {
  vender: "Vender",
  precios: "Precios",
  fiado: "Fiado",
  caja: "Caja del día",
};

export default function App() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>("vender");
  const [cajones, setCajones] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadStore().catch(() => setError(true));
    const sync = () => {
      setTab(tabFromHash());
      setCajones(cajaActiva().cajones && window.location.hash === "#cajones");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Las cajas de verdad abren sin internet. Las demos y la prueba no se instalan.
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && !cajaActiva().ejemplo && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/c/sw.js", { scope: "/c/" }).catch(() => {});
    }
  }, []);

  function go(next: Tab | "cajones") {
    const nextTab = next === "cajones" ? "precios" : next;
    const nextCajones = next === "cajones";
    if (nextTab === tab && nextCajones === cajones) return;
    // replace: así "Atrás" no te pasea por todas las secciones.
    history.replaceState(null, "", `#${next}`);
    setTab(nextTab);
    setCajones(nextCajones);
  }

  const caja = cajaActiva();
  const version = (
    <footer className="py-6 text-center text-base text-gris">
      {caja.nombre} · Caja hecha con{" "}
      <Link href="/" className="underline">
        Al toque
      </Link>{" "}
      · Versión {process.env.NEXT_PUBLIC_VERSION}
    </footer>
  );

  // Todo entra justo en la pantalla: el contenido se desplaza y la barra de abajo queda quieta.
  return (
    <ToastProvider>
      <div className="flex h-dvh flex-col">
        {caja.ejemplo && <AvisoPrueba />}
        {ready && !error && tab === "vender" ? (
          <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3">
            <h1 className="sr-only">Vender</h1>
            <VenderScreen />
          </main>
        ) : (
          <div key={tab + cajones} className="min-h-0 flex-1 overflow-y-auto">
            <main className="mx-auto w-full max-w-3xl px-3">
              {tab === "precios" && ready && caja.cajones && (
                <div className="grid grid-cols-2 gap-2 pt-3" role="group" aria-label="Qué querés ver">
                  {[false, true].map((c) => (
                    <button
                      key={String(c)}
                      type="button"
                      aria-pressed={cajones === c}
                      onClick={() => go(c ? "cajones" : "precios")}
                      className={`min-h-14 rounded-2xl border-2 px-2 text-lg font-bold leading-tight ${
                        cajones === c ? "border-acento bg-acento text-white" : "border-borde bg-white"
                      }`}
                    >
                      {c ? "📦 Cajones y mercado" : "🏷️ Precios"}
                    </button>
                  ))}
                </div>
              )}
              <h1 className="pt-4 pb-3 text-3xl font-extrabold">{tab === "precios" && cajones ? "Cajones y mercado" : TITLES[tab]}</h1>
              {error ? (
                <p role="alert" className="rounded-2xl bg-rojo-claro p-4 text-xl font-bold text-rojo">
                  No se pudieron abrir los datos guardados. Cerrá la app y volvé a abrirla.
                </p>
              ) : !ready ? (
                <p className="p-4 text-xl">Cargando…</p>
              ) : tab === "precios" ? (
                cajones ? <CajonesScreen /> : <PreciosScreen />
              ) : tab === "fiado" ? (
                <FiadoScreen />
              ) : (
                <CajaScreen onMarket={caja.cajones ? () => go("cajones") : undefined} />
              )}
              {version}
            </main>
          </div>
        )}
        <BottomNav tabs={tabsActivas()} tab={tab} onChange={go} />
      </div>
      {ready && <MorningPrompt />}
    </ToastProvider>
  );
}

/**
 * Al abrir la app sin la caja abierta y sin ventas todavía: "¡Buen día! ¿Con cuánta plata arrancás?".
 * Se muestra una sola vez; con "Ahora no" se puede abrir después desde Caja.
 */
function MorningPrompt() {
  const { opening, sales, closes } = useStore();
  const toast = useToast();
  const [show, setShow] = useState(() => {
    const from = periodStart(closes);
    return !opening && !sales.some((s) => !s.deleted && s.createdAt > from);
  });
  if (!show) return null;
  return (
    <OpenSheet
      greeting
      onClose={() => setShow(false)}
      onSave={(amount) => {
        setShow(false);
        setOpening({ amount, at: Date.now() });
        toast(`¡Listo! Caja abierta con ${formatMoney(amount)}`, () => setOpening(null));
      }}
    />
  );
}

/** Demos y prueba: aviso de dónde quedan los datos y botón para volver a los de ejemplo. */
function AvisoPrueba() {
  const [confirmar, setConfirmar] = useState(false);
  const boton = "min-h-9 shrink-0 rounded-xl px-3 text-sm font-bold";
  return (
    <div data-aviso-prueba className="flex shrink-0 items-center justify-center gap-3 bg-amarillo-claro px-3 py-1 text-sm leading-tight">
      <span>
        {confirmar ? (
          "¿Borrar todo y volver a los datos de ejemplo?"
        ) : (
          <>
            <strong>Prueba:</strong> se guarda solo en este navegador.
          </>
        )}
      </span>
      {confirmar ? (
        <>
          <button
            type="button"
            className={`${boton} bg-rojo text-white`}
            onClick={async () => {
              await deleteDatabase();
              window.location.reload();
            }}
          >
            Sí
          </button>
          <button type="button" className={`${boton} border-2 border-borde bg-white`} onClick={() => setConfirmar(false)}>
            No
          </button>
        </>
      ) : (
        <button type="button" className={`${boton} border-2 border-borde bg-white`} onClick={() => setConfirmar(true)}>
          Empezar de cero
        </button>
      )}
    </div>
  );
}
