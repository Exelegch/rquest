/* R Quest service worker.
 * - The app page is fetched from the network first, so updates show up straight away,
 *   with the saved copy used when the device is offline.
 * - The R engine (webR), fonts and the Supabase library are versioned files, so they are
 *   served from the saved copy first. After the first visit the large R files (about 20 MB)
 *   are not downloaded again, which saves mobile data. R itself still needs a connection to
 *   start, because a few small files are loaded in a way service workers cannot intercept.
 * - Requests to Supabase (accounts, saving, usage counts) are never cached.
 * Bump CACHE_VERSION whenever this file's caching rules change.
 */
const CACHE_VERSION = 'rq-v1';
const APP_CACHE = `${CACHE_VERSION}-app`;
const LIB_CACHE = `${CACHE_VERSION}-libs`;
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const LIB_HOSTS = ['webr.r-wasm.org', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const saved = await cache.match(request, { ignoreSearch: true }) || await cache.match('./index.html');
    if (saved) return saved;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(LIB_CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;
  const fresh = await fetch(request);
  if (fresh.ok || fresh.type === 'opaque') cache.put(request, fresh.clone());
  return fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.hostname.endsWith('supabase.co')) return;
  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith('/admin.html')) return;
    event.respondWith(networkFirst(request));
    return;
  }
  if (LIB_HOSTS.includes(url.hostname)) {
    // Google's font stylesheet is not versioned, so refresh it in the background.
    if (url.hostname === 'fonts.googleapis.com') {
      event.respondWith(caches.open(LIB_CACHE).then(async (cache) => {
        const saved = await cache.match(request);
        const fresh = fetch(request).then((r) => { if (r.ok) cache.put(request, r.clone()); return r; }).catch(() => saved);
        return saved || fresh;
      }));
      return;
    }
    event.respondWith(cacheFirst(request));
  }
});
