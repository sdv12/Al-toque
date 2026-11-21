// Guardado local en el celular (IndexedDB), sin librerías.
// Todo se guarda acá primero; la sincronización con internet llega en otra fase.
// Cada caja tiene su propia base (ver activa.ts): la prueba de un rubro no pisa la de otro.

import { cajaActiva } from "./activa";

const DB_VERSION = 5;
export const STORES = ["products", "sales", "customers", "fiado", "closes", "stock", "meta"] as const;
export type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;
let dbBase: string | null = null;

function open(): Promise<IDBDatabase> {
  if (dbBase !== cajaActiva().base) {
    dbPromise?.then((db) => db.close()).catch(() => {});
    dbPromise = null;
    dbBase = cajaActiva().base;
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(cajaActiva().base, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("products")) db.createObjectStore("products", { keyPath: "id" });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
      if (!db.objectStoreNames.contains("sales")) db.createObjectStore("sales", { keyPath: "id" });
      if (!db.objectStoreNames.contains("customers")) db.createObjectStore("customers", { keyPath: "id" });
      if (!db.objectStoreNames.contains("fiado")) db.createObjectStore("fiado", { keyPath: "id" });
      if (!db.objectStoreNames.contains("closes")) db.createObjectStore("closes", { keyPath: "id" });
      if (!db.objectStoreNames.contains("stock")) db.createObjectStore("stock", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function done<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await open();
  return done(db.transaction(store).objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function put<T>(store: StoreName, value: T, key?: IDBValidKey): Promise<void> {
  const db = await open();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value, key);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function putMany<T>(store: StoreName, values: T[]): Promise<void> {
  const db = await open();
  const tx = db.transaction(store, "readwrite");
  const os = tx.objectStore(store);
  for (const v of values) os.put(v);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await open();
  return done(db.transaction("meta").objectStore("meta").get(key) as IDBRequest<T | undefined>);
}

/** Borra todo lo guardado de la caja activa (demos y prueba: "Empezar de cero"). */
export async function deleteDatabase(): Promise<void> {
  if (dbPromise) (await dbPromise.catch(() => null))?.close();
  dbPromise = null;
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(cajaActiva().base);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

/** Le pide al navegador que no borre los datos aunque falte espacio. */
export function askPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {});
}

export async function deleteMeta(key: string): Promise<void> {
  const db = await open();
  const tx = db.transaction("meta", "readwrite");
  tx.objectStore("meta").delete(key);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Todo lo guardado en la caja activa (para la copia de seguridad). */
export async function leerTodo(): Promise<{ datos: Record<string, unknown[]>; meta: [string, unknown][] }> {
  const db = await open();
  const tx = db.transaction([...STORES], "readonly");
  const datos: Record<string, unknown[]> = {};
  const pedidos = STORES.filter((s) => s !== "meta").map(async (s) => {
    datos[s] = await done(tx.objectStore(s).getAll());
  });
  const metaStore = tx.objectStore("meta");
  const [claves, valores] = await Promise.all([done(metaStore.getAllKeys()), done(metaStore.getAll())]);
  await Promise.all(pedidos);
  return { datos, meta: claves.map((k, i) => [String(k), valores[i]]) };
}

/**
 * Reemplaza todo lo de la caja activa por lo de una copia, en una sola transacción: si algo falla,
 * no queda nada a medias.
 */
export async function reemplazarTodo(datos: Record<string, unknown[]>, meta: [string, unknown][]): Promise<void> {
  const db = await open();
  const tx = db.transaction([...STORES], "readwrite");
  for (const s of STORES) tx.objectStore(s).clear();
  for (const s of STORES) if (s !== "meta") for (const fila of datos[s] ?? []) tx.objectStore(s).put(fila);
  for (const [clave, valor] of meta) tx.objectStore("meta").put(valor, clave);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
