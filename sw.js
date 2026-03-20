/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  sw.js  —  LuxHaven360 Service Worker                               ║
 * ║  v2.0 — Passivo: zero intercettazione fetch, cache-free             ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  PERCHÉ PASSIVO:                                                     ║
 * ║  Il sito usa GAS (Google Apps Script) come backend. GAS richiede    ║
 * ║  redirect multipli prima di rispondere. Un SW che intercetta fetch  ║
 * ║  può bloccare questi redirect, causare AbortError non gestiti e      ║
 * ║  disabilitare la BFCache di Chrome (RESULT_CODE_HUNG).              ║
 * ║                                                                      ║
 * ║  COSA FA:                                                            ║
 * ║   • install  → skipWaiting() (attivazione immediata)               ║
 * ║   • activate → rimuove TUTTE le cache precedenti + clients.claim()  ║
 * ║   • fetch    → NON intercettato (pass-through alla rete)            ║
 * ║                                                                      ║
 * ║  PERCHÉ CANCELLA LE CACHE:                                          ║
 * ║  Versioni precedenti del SW mettevano in cache risorse statiche.    ║
 * ║  Cache stale (asset vecchi, script obsoleti) causano comportamenti  ║
 * ║  imprevedibili. Questo SW v2 fa pulizia completa e poi si mette     ║
 * ║  da parte, lasciando HTTP cache control gestire la CDN.             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
'use strict';

/* ════════════════════════════════════════════════════════════════════
   INSTALL — attivazione immediata senza attendere chiusura tab
════════════════════════════════════════════════════════════════════ */
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

/* ════════════════════════════════════════════════════════════════════
   ACTIVATE — elimina TUTTE le cache + claim clients
════════════════════════════════════════════════════════════════════ */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            return caches.delete(key);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

/* ════════════════════════════════════════════════════════════════════
   FETCH — pass-through totale (nessuna intercettazione)

   Il SW è registrato ma non intercetta nulla. Questo garantisce:
   - BFCache funzionante (Chrome non rileva fetch-handlers attivi)
   - GAS redirect non bloccati
   - Nessun AbortError spurio da SW
   - Zero cache stale
════════════════════════════════════════════════════════════════════ */

/* Nessun listener 'fetch' registrato — pass-through automatico */
