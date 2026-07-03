"use strict";
/* アルゴランド service worker
   更新手順: リリースごとに CACHE のバージョン文字列を必ず上げる
   (index.html の ?v= / .app-version と同じ値に揃える) */
const CACHE = 'algoland-v2026.07.04.6';
const ASSETS = [
  './',
  'index.html',
  'css/style.css',
  'manifest.webmanifest',
  'js/core.js',
  'js/audio.js',
  'js/speech.js',
  'js/rewards.js',
  'js/pad.js',
  'js/timer.js',
  'js/options.js',
  'js/ui.js',
  'js/games/g1-train.js',
  'js/games/g2-height.js',
  'js/games/g3-pattern.js',
  'js/games/g4-robot.js',
  'js/games/g5-sort.js',
  'js/games/g6-shapes.js',
  'js/games/g7-debug.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    // cache:'reload' — bypass the HTTP cache so a new version is never seeded with stale files
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* same-origin GET: stale-while-revalidate — instant (offline-capable) response,
   fresh copy fetched in the background for next load.
   cache key = URL WITHOUT query, so css?v=X matches AND revalidation overwrites
   the same entry (a queried put would otherwise never be served again).
   cross-origin (Google Fonts) is left to the browser. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  url.search = '';
  const key = url.href;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(key).then(cached => {
        const fetched = fetch(e.request)
          .then(res => {
            if (res && res.ok) cache.put(key, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fetched;
      })
    )
  );
});
