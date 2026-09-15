// Minimal offline cache for Aramaki's theme editors.
// Each app is a single self-contained HTML file (all CSS/JS inlined), so this
// just needs to cache those files plus the PWA icons/manifests — there's no
// separate build output to track.
//
// Two editors, two manifests, one scope: the Tinfoil editor and the RomM
// Switch client editor install as separate apps from the same origin, and
// either one being open is enough to cache both.

const CACHE_NAME = 'aramaki-theme-editors-v4';
const ASSETS = [
  './index.html',
  './tinfoil-theme-editor.html',
  './manifest.json',
  './romm-theme-editor.html',
  './manifest-romm.json',
  './assets/logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for our own assets; everything else (e.g. a theme's remote
// background image or logo URL) goes straight to the network as normal,
// since those are user-supplied and shouldn't be cached indefinitely.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
