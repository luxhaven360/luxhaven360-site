/**
 * LuxHaven360 — Service Worker (disattivato)
 * 
 * Questo file sostituisce il precedente sw.js che causava
 * unhandled AbortError rejections durante la navigazione rapida,
 * destabilizzando Chrome dopo ~10-20 cicli di back/forward.
 * 
 * La gestione dei fetch GAS è ora interamente delegata a
 * bfcache-guard.js (livello JS, AbortController).
 */
'use strict';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  /* Rimuovi tutte le cache precedenti del SW */
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Nessuna intercettazione fetch — tutto passa direttamente alla rete */
