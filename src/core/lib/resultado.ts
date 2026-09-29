export type Resultado<T, E = string> = { ok: true; valor: T } | { ok: false; error: E };

export const ok = <T>(valor: T): Resultado<T, never> => ({ ok: true, valor });
export const fallo = <E>(error: E): Resultado<never, E> => ({ ok: false, error });
