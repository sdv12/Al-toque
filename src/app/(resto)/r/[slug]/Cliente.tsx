"use client";

import dynamic from "next/dynamic";
import type { RestoPublicado } from "@/restos/lib/publicado";

/** Solo en el navegador: el panel lee y guarda en el equipo del local. */
const App = dynamic(() => import("@/restos/RaizCliente"), {
  ssr: false,
  loading: () => <p style={{ padding: "2rem", fontFamily: "system-ui" }}>Cargando…</p>,
});

export function Cliente({ slug, publicado }: { slug: string; publicado: RestoPublicado }) {
  return <App slug={slug} publicado={publicado} />;
}
