/**
 * ================================================================
 *  LuxHaven360 — Service Worker  v1.0
 *  File: sw.js  (root del sito, stessa cartella di index.html)
 * ================================================================
 *
 *  SCOPO: eliminare definitivamente RESULT_CODE_HUNG ("Uffa!")
 *
 *  PROBLEMA ROOT:
 *  Google Apps Script (GAS) in cold start impiega 10-30 secondi.
 *  Quando l'utente preme Indietro/Avanti durante una richiesta GAS,
 *  il browser non riesce a mettere la pagina in BFCache perché c'è
 *  una rete request pendente → renderer hung → "Uffa!"
 *
 *  SOLUZIONE:
 *  Il Service Worker intercetta TUTTE le richieste di rete.
 *  Quando bfcache-guard.js segnala pagehide, il SW chiude OGNI
 *  connessione GAS pendente — a prescindere da come è stata aperta
 *  (fetch, JSONP script tag, XHR, ecc.) e a prescindere da quale
 *  wrapper JS fosse in uso (siteguard, bfcache-guard, codice inline).
 *
 *  INSTALLAZIONE:
 *  1. Carica sw.js nella ROOT del sito (stesso livello di index.html)
 *  2. bfcache-guard.js registra il SW automaticamente
 *  3. Nessuna altra modifica necessaria
 * ================================================================
 */

'use strict';

/* Mappa delle richieste GAS pendenti: url → AbortController */
const _pending = new Map();

/* ── INSTALL: attiva immediatamente ────────────────────────────── */
self.addEventListener('install', () => {
  self.skipWaiting();
});

/* ── ACTIVATE: prende il controllo subito ───────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

/* ── FETCH: intercetta ogni richiesta ───────────────────────────── */
self.addEventListener('fetch', event => {
  const url = event.request.url;

  /* Intercetta SOLO richieste GAS (quelle che causano il hang) */
  if (!url.includes('script.google.com')) {
    /* Per tutto il resto: passa direttamente alla rete, senza modifiche */
    return;
  }

  /* Crea un AbortController per questa richiesta GAS */
  const ctrl = new AbortController();
  const key  = url + '_' + Date.now() + '_' + Math.random();
  _pending.set(key, ctrl);

  const fetchPromise = fetch(event.request, {
    signal: ctrl.signal
  }).finally(() => {
    _pending.delete(key);
  });

  event.respondWith(fetchPromise);
});

/* ── MESSAGE: ricevi 'ABORT_ALL' da bfcache-guard.js ────────────── */
self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'ABORT_ALL') return;

  /* Abortisce TUTTE le richieste GAS pendenti */
  let count = 0;
  _pending.forEach((ctrl, key) => {
    try {
      ctrl.abort();
      count++;
    } catch (e) {}
  });
  _pending.clear();

  /* Risponde al mittente per conferma (utile per debug) */
  if (event.source) {
    event.source.postMessage({ type: 'ABORTED', count });
  }
});
