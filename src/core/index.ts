// API pública del core (headless).
export { landingConfigSchema, type LandingConfig, type ConfigDe } from "./schema/landing-config";
export { migrateConfig, type ResultadoConfig, type ErrorConfig } from "./schema/migrate";
export { VERSION_ACTUAL } from "./schema/version";
export * from "./schema/comun";
export * from "./schema/contenido";
export * from "./registry";
export { variablesDeEstilo, resolverModo, acentoPasaAA } from "./lib/estilo";
export { normalizarWhatsappAR, WHATSAPP_AR } from "./lib/whatsapp";
export type { DataAdapter, Slot, TurnoInput, ConsultaInput } from "./adapters/types";
