/**
 * ================================================================
 *  LuxHaven360 — Service Worker  v2.0
 *  File: sw.js  (root del sito)
 * ================================================================
 *
 *  REGOLA FONDAMENTALE:
 *  Intercetta SOLO richieste fetch sub-resource verso GAS.
 *  NON intercettare MAI navigazioni documento (mode='navigate').
 *  NON intercettare MAI risorse same-origin (HTML, JS, CSS, img).
 *
 *  Perché: intercettare navigazioni causava RESULT_CODE_HUNG
 *  durante il redirect di 404.html — il browser aspettava una
 *  risposta dal SW che non arrivava mai.
 * ================================================================
 */
'use strict';

const _pending = new Map();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  /* NON chiamare clients.claim() — evita race condition con pagine
     che stanno eseguendo un redirect (404.html) */
  event.waitUntil(Promise.resolve());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = req.url;

  /* ── REGOLA 1: mai intercettare navigazioni documento ─────────
     Questo è il fix critico. Senza questo, il SW intercettava le
     navigazioni di 404.html causando RESULT_CODE_HUNG immediato.
  ─────────────────────────────────────────────────────────────── */
  if (req.mode === 'navigate') return;

  /* ── REGOLA 2: intercetta solo richieste GAS (cross-origin) ── */
  if (!url.includes('script.google.com')) return;

  /* ── REGOLA 3: solo XMLHttpRequest / fetch (non script tag) ── */
  if (req.destination === 'script') return;

  /* Traccia la richiesta con AbortController */
  const ctrl = new AbortController();
  const key  = Date.now() + '_' + Math.random();
  _pending.set(key, ctrl);

  const promise = fetch(req, { signal: ctrl.signal })
    .finally(() => { _pending.delete(key); });

  event.respondWith(promise);
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'ABORT_ALL') return;

  let count = 0;
  _pending.forEach((ctrl) => {
    try { ctrl.abort(); count++; } catch (e) {}
  });
  _pending.clear();

  if (event.source) {
    try { event.source.postMessage({ type: 'ABORTED', count }); } catch(e) {}
  }
});
