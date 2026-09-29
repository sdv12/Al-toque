import Link from "next/link";
import { PLANTILLAS, registry } from "@/core/registry";

export default function Inicio() {
  return (
    <main className="mx-auto max-w-medida px-4 py-12">
      <h1 className="font-display text-display">Landing Kit</h1>
      <p className="mt-2 text-tinta-suave">Landings configurables por rubro.</p>
      <ul className="mt-6 flex flex-wrap gap-3">
        <li>
          <Link href="/configurador" className="inline-block rounded-control bg-acento-relleno px-4 py-2 text-chico font-medium text-sobre-acento">
            Abrir el configurador
          </Link>
        </li>
        {[
          ["demo-barberia", "Barbería"],
          ["demo-consultorio", "Consultorio"],
          ["demo-casas", "Casas de campo"],
          ["demo-portfolio", "Portfolio"],
        ].map(([slug, nombre]) => (
          <li key={slug}>
            <Link href={`/l/${slug}`} className="inline-block rounded-control border border-borde px-4 py-2 text-chico font-medium">
              Demo: {nombre}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-titulo font-semibold">Plantillas</h2>
      <ul className="mt-3 divide-y divide-borde border-y border-borde">
        {PLANTILLAS.map((p) => {
          const { meta, secciones } = registry[p];
          return (
            <li key={p} className="py-3">
              <p>
                <strong>{meta.nombre}</strong> <span className="text-tinta-suave">· {meta.rubro}</span>
              </p>
              <p className="text-chico text-tinta-suave">
                {Object.keys(secciones).length} secciones · modos: {meta.modos.join(", ")}
              </p>
            </li>
          );
        })}
      </ul>

      {process.env.NODE_ENV !== "production" && (
        <p className="mt-8">
          <Link href="/dev/tokens" className="underline underline-offset-4">
            Ver los sets de tokens
          </Link>
        </p>
      )}
    </main>
  );
}
