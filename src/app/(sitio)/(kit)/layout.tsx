import type { ReactNode } from "react";
import { fuentesKit } from "./fuentes";
import { RegistroEntrada } from "./RegistroEntrada";

export default function KitLayout({ children }: { children: ReactNode }) {
  return (
    <div data-kit className={`${fuentesKit} min-h-dvh`}>
      <RegistroEntrada />
      {children}
    </div>
  );
}
