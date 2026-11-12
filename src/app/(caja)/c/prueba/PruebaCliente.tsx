"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import CajaCliente from "@/cajas/CajaCliente";
import { CLAVE_PRUEBA, configDePrueba } from "@/cajas/prueba";

function suscribir(avisar: () => void) {
  window.addEventListener("storage", avisar);
  return () => window.removeEventListener("storage", avisar);
}

function leer(): string | null {
  try {
    return localStorage.getItem(CLAVE_PRUEBA);
  } catch {
    return null;
  }
}

export default function PruebaCliente() {
  // En el servidor no hay configuración: se dibuja "Cargando…" y se completa en el navegador.
  const texto = useSyncExternalStore(suscribir, leer, () => undefined);
  const config = useMemo(() => (texto === undefined ? null : configDePrueba(texto)), [texto]);
  const rubro = config?.rubro;

  // Cambiar de rubro es cambiar de caja (otros productos, otra base): se recarga la página.
  useEffect(() => {
    if (!rubro) return;
    const alCambiar = () => {
      if (configDePrueba(leer()).rubro !== rubro) window.location.reload();
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, [rubro]);

  if (!config) return <p className="p-4 text-xl">Cargando…</p>;
  return <CajaCliente config={config} base={`caja-prueba-${config.rubro}`} />;
}
