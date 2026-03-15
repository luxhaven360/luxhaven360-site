/**
 * ================================================================
 *  LuxHaven360 — BFCache Guard  v2.0
 *  File: bfcache-guard.js
 *  Da includere come PRIMO <script> in ogni pagina del sito.
 * ================================================================
 *
 *  STRATEGIA A DUE LIVELLI:
 *
 *  Livello 1 — Service Worker (sw.js):
 *    Intercetta TUTTE le richieste GAS a livello di rete.
 *    Su pagehide → SW riceve ABORT_ALL → cancella TUTTO.
 *    Questo è il livello più affidabile: funziona a prescindere
 *    da come la richiesta è stata aperta (fetch, JSONP, XHR...).
 *
 *  Livello 2 — AbortController + setInterval + Supabase (fallback):
 *    Se il SW non è ancora attivo o non è supportato, questo livello
 *    fa la stessa cosa a livello JS.
 *    - Intercetta window.fetch verso GAS e aggiunge AbortController
 *    - Traccia tutti i setInterval (li ferma su pagehide)
 *    - Chiude canali Supabase Realtime su pagehide
 *
 *  Su pageshow (BFCache restore): ripristina setInterval e Supabase.
 * ================================================================
 */
(function (global) {
  'use strict';

  /* ── Singleton guard ────────────────────────────────────────── */
  if (global.__lhBFCacheGuard) return;
  global.__lhBFCacheGuard = true;

  /* ══════════════════════════════════════════════════════════════
     LIVELLO 1 — Registrazione Service Worker
     Il SW intercetta tutte le richieste GAS a livello di rete.
  ══════════════════════════════════════════════════════════════ */
  var _swRegistration = null;

  if ('serviceWorker' in navigator) {
    /* Il SW è nella root, path assoluto */
    /* updateViaCache:'none' forza sempre il check della nuova versione sw.js */
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    })
      .then(function (reg) {
        _swRegistration = reg;
        /* Forza update immediato se c'è una nuova versione in attesa */
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      })
      .catch(function (err) {
        /* SW non disponibile: il livello 2 (AbortController JS) copre */
      });
  }

  /* Invia messaggio ABORT_ALL al Service Worker */
  function _swAbortAll() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
    try {
      navigator.serviceWorker.controller.postMessage({ type: 'ABORT_ALL' });
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════
     LIVELLO 2a — Registro AbortController (fallback JS)
     Usato da siteguard-client.js tramite window.__lhReg/__lhUnreg.
  ══════════════════════════════════════════════════════════════ */
  var _controllers = new Set();

  global.__lhReg   = function (c) { if (c && c.abort) _controllers.add(c); };
  global.__lhUnreg = function (c) { _controllers.delete(c); };

  /* Intercetta window.fetch: aggiunge AbortController su chiamate GAS */
  if (typeof global.fetch === 'function' && !global.__lhFetchWrapped) {

    var _origFetch = global._originalFetch || global.fetch;

    global.fetch = function (input, init) {
      if (init && init.signal) {
        return _origFetch(input, init);
      }

      var url = (typeof input === 'string') ? input
              : (input && input.url) ? input.url : '';
      var isGAS = url.indexOf('script.google.com') !== -1;

      if (isGAS) {
        var ctrl    = new AbortController();
        var timeout = setTimeout(function () { ctrl.abort(); }, 8000);
        _controllers.add(ctrl);
        var merged = Object.assign({}, init || {}, { signal: ctrl.signal });
        return _origFetch(input, merged).finally(function () {
          clearTimeout(timeout);
          _controllers.delete(ctrl);
        });
      }

      return _origFetch(input, init);
    };

    global.__lhFetchWrapped = true;
  }

  /* ══════════════════════════════════════════════════════════════
     LIVELLO 2b — Registro setInterval
     Tutti gli intervalli vengono tracciati. Su pagehide → stop.
     Su pageshow → ripristino.
  ══════════════════════════════════════════════════════════════ */
  var _intervals = new Map();

  var _origSetInterval   = global.setInterval;
  var _origClearInterval = global.clearInterval;

  global.setInterval = function (fn, delay) {
    var id = _origSetInterval.apply(global, arguments);
    _intervals.set(id, { fn: fn, delay: delay });
    return id;
  };

  global.clearInterval = function (id) {
    _intervals.delete(id);
    return _origClearInterval.apply(global, arguments);
  };

  /* ══════════════════════════════════════════════════════════════
     PAGEHIDE — L1 + L2: abort tutto
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pagehide', function () {

    /* L1: Service Worker abortisce tutte le richieste GAS a livello rete */
    _swAbortAll();

    /* L2a: Fallback JS — abortisce controller registrati */
    _controllers.forEach(function (c) {
      try { c.abort(); } catch (e) {}
    });
    _controllers.clear();

    /* L2b: Rimuovi tag <script> JSONP verso GAS (tracking-order) */
    try {
      var gasScripts = document.querySelectorAll('script[src*="script.google.com"]');
      gasScripts.forEach(function (s) { try { s.remove(); } catch (e) {} });
    } catch (e) {}

    /* L2c: Ferma tutti i setInterval */
    _intervals.forEach(function (info, id) {
      try { _origClearInterval(id); } catch (e) {}
    });

    /* L2d: Chiudi canali Supabase Realtime (community-hub) */
    try {
      if (global._sbChannels && typeof global._sbChannels === 'object') {
        Object.values(global._sbChannels).forEach(function (ch) {
          try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (e) {}
        });
      }
    } catch (e) {}

    try {
      if (global._sb && typeof global._sb.removeAllChannels === 'function') {
        global._sb.removeAllChannels();
      }
    } catch (e) {}

  }, { capture: true });

  /* ══════════════════════════════════════════════════════════════
     PAGESHOW — ripristino dopo BFCache restore
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;

    /* Ripristina setInterval */
    var toRestore = [];
    _intervals.forEach(function (info) { toRestore.push(info); });
    _intervals.clear();

    toRestore.forEach(function (info) {
      try {
        var newId = _origSetInterval(info.fn, info.delay);
        _intervals.set(newId, info);
      } catch (e) {}
    });

    /* Ripristina Supabase RT (community-hub) */
    setTimeout(function () {
      try {
        var session = null;
        try { session = localStorage.getItem('lh360_community_session'); } catch (ex) {}
        if (!session || !global.currentUser) return;

        try {
          if (global._sbChannels) {
            Object.values(global._sbChannels).forEach(function (ch) {
              try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (ex) {}
            });
            global._sbChannels = {};
          }
        } catch (ex) {}

        if (typeof global.initApp === 'function') {
          global.initApp();
        }
      } catch (ex) {}
    }, 80);

  }, { capture: true });

}(window));
