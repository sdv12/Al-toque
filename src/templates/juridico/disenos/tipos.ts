import type { ComponentType } from "react";
import type { SeccionJu } from "../datos";

/** Un diseño arma su cabecera con la portada y cada sección a su manera; el orden lo pone la config. */
export interface Diseno {
  Portada: ComponentType;
  secciones: Record<SeccionJu, ComponentType>;
  /** Clases del pie (fondo y color) para que cierre con el diseño. */
  pie?: string;
}
