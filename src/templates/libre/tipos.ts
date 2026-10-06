import type { ConfigDe } from "@/core/schema/landing-config";

export type Config = ConfigDe<"libre">;
/** Una instancia de bloque tal como viene en la config. */
export type Bloque = Config["secciones"][number];
export type PropsBloque = { config: Config; bloque: Bloque; anclaId: string };
