// Service worker de las cajas (/c/…): guarda la caja en el celular para que abra aunque no haya
// internet. Solo lo registran las cajas publicadas (no las demos ni la prueba).
// - Páginas de /c/…: primero internet (para tener siempre lo último); si no hay, la copia guardada.
// - Archivos de /_next/static: nunca cambian (tienen un código en el nombre), se guardan una vez.
const CACHE = "caja-v1";
const ICONOS = ["/c/icon-192.png", "/c/icon-512.png", "/c/icon-maskable-512.png", "/c/apple-touch-icon.png"];

async function guardarArchivosDe(cache, html) {
  const urls = new Set();
  for (const m of html.matchAll(/["'(](\/_next\/static\/[^"'()\s]+)/g)) urls.add(m[1]);
  await Promise.all(
    [...urls].map(async (url) => {
      if (await cache.match(url)) return;
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch {}
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(ICONOS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate" && url.pathname.startsWith("/c/")) {
    const pagina = url.pathname.replace(/\/$/, "");
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(req);
          if (res.ok) {
            const copia = res.clone();
            event.waitUntil(
              (async () => {
                await cache.put(pagina, copia.clone());
                await guardarArchivosDe(cache, await copia.text());
              })(),
            );
          }
          return res;
        } catch {
          return (await cache.match(pagina)) || Response.error();
        }
      })(),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || ICONOS.includes(url.pathname) || url.pathname.endsWith("/manifest.webmanifest")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })(),
    );
  }
});
