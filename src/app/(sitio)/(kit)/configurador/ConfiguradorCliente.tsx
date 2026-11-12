"use client";

import dynamic from "next/dynamic";

// Solo en el cliente: el borrador vive en localStorage y el preview mide el marco.
const Configurador = dynamic(() => import("./Configurador"), {
  ssr: false,
  loading: () => <p className="p-6 text-chico text-tinta-suave">Cargando el configurador…</p>,
});

export function ConfiguradorCliente() {
  return <Configurador />;
}
