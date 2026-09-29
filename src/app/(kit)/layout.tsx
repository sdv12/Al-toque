import type { ReactNode } from "react";
import { fuentesKit } from "./fuentes";

export default function KitLayout({ children }: { children: ReactNode }) {
  return (
    <div data-kit className={`${fuentesKit} min-h-dvh`}>
      {children}
    </div>
  );
}
