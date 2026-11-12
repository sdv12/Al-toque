"use client";

export type Tab = "vender" | "precios" | "fiado" | "caja";

export const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "vender", label: "Vender", icon: "🛒" },
  { id: "precios", label: "Precios", icon: "🏷️" },
  { id: "fiado", label: "Fiado", icon: "📒" },
  { id: "caja", label: "Caja", icon: "💵" },
];

const COLUMNAS: Record<number, string> = { 3: "grid-cols-3", 4: "grid-cols-4" };

/** Barra fija de abajo con los botones grandes (3 o 4, según los módulos de la caja). */
export default function BottomNav({ tabs = TABS, tab, onChange }: { tabs?: typeof TABS; tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      aria-label="Secciones"
      className="shrink-0 border-t-2 border-borde bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className={`mx-auto grid max-w-3xl ${COLUMNAS[tabs.length] ?? "grid-cols-4"} gap-1 p-1.5`}>
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onChange(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-x-2 rounded-2xl short:min-h-14 short:flex-row text-lg font-bold leading-tight ${
                  active ? "bg-acento text-white" : "text-tinta active:bg-acento-claro"
                }`}
              >
                <span aria-hidden="true" className="text-3xl leading-none short:text-2xl">{t.icon}</span>
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
