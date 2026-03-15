/**
 * ================================================================
 *  LuxHaven360 — BFCache Guard  v3.0  (pure JS, no Service Worker)
 *  File: bfcache-guard.js
 *  Da includere come PRIMO <script> in ogni pagina del sito.
 * ================================================================
 *
 *  APPROCCIO: 100% JavaScript, senza Service Worker.
 *
 *  Il Service Worker è stato rimosso perché causava unhandled
 *  AbortError rejections che si accumulavano durante navigazione
 *  rapida (back/forward ripetuto), destabilizzando Chrome dopo
 *  ~10-20 cicli → RESULT_CODE_HUNG.
 *
 *  COME FUNZIONA:
 *
 *  1. window.fetch viene avvolto: ogni chiamata GAS riceve
 *     automaticamente un AbortController con timeout 8s.
 *     Il controller viene registrato in _controllers.
 *
 *  2. siteguard-client.js chiama window.__lhReg(controller)
 *     per registrare i propri controller → tutti tracciati.
 *
 *  3. pagehide → _controllers.forEach(abort) → TUTTE le
 *     richieste GAS pendenti vengono cancellate istantaneamente.
 *     Chrome vede zero richieste pendenti → rilascia il renderer.
 *     Nessun HUNG, nessun "Uffa!".
 *
 *  4. setInterval tracciati → fermati su pagehide → riavviati
 *     su pageshow (BFCache restore).
 *
 *  5. Supabase canali chiusi su pagehide → riaperti su pageshow.
 * ================================================================
 */
(function (global) {
  'use strict';

  if (global.__lhBFCacheGuard) return;
  global.__lhBFCacheGuard = true;

  /* ══════════════════════════════════════════════════════════════
     1. REGISTRO AbortController
     Esposto come __lhReg/__lhUnreg per integrazione con siteguard.
  ══════════════════════════════════════════════════════════════ */
  var _controllers = new Set();

  global.__lhReg   = function (c) { if (c && c.abort) _controllers.add(c); };
  global.__lhUnreg = function (c) { _controllers.delete(c); };

  /* ══════════════════════════════════════════════════════════════
     2. WRAP window.fetch
     Aggiunge AbortController + timeout 8s a OGNI chiamata GAS
     che non ha già un signal esplicito.
  ══════════════════════════════════════════════════════════════ */
  if (typeof global.fetch === 'function' && !global.__lhFetchWrapped) {

    var _origFetch = global._originalFetch || global.fetch;

    global.fetch = function (input, init) {
      /* Lascia passare fetch con signal già impostato */
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
        return _origFetch(input, merged)
          .catch(function (err) {
            /* Gestisci AbortError silenziosamente: è un abort intenzionale */
            if (err && err.name === 'AbortError') return new Response('null', { status: 200 });
            throw err;
          })
          .finally(function () {
            clearTimeout(timeout);
            _controllers.delete(ctrl);
          });
      }

      return _origFetch(input, init);
    };

    global.__lhFetchWrapped = true;
  }

  /* ══════════════════════════════════════════════════════════════
     3. WRAP setInterval / clearInterval
     Tutti gli intervalli vengono tracciati per stop/restore.
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
     4. PAGEHIDE — abort tutto, stop intervalli, chiudi Supabase
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pagehide', function () {

    /* Abort tutti i fetch GAS registrati */
    _controllers.forEach(function (c) {
      try { c.abort(); } catch (e) {}
    });
    _controllers.clear();

    /* Rimuovi tag <script> JSONP verso GAS (tracking-order) */
    try {
      document.querySelectorAll('script[src*="script.google.com"]')
        .forEach(function (s) { try { s.remove(); } catch (e) {} });
    } catch (e) {}

    /* Ferma tutti i setInterval */
    _intervals.forEach(function (_, id) {
      try { _origClearInterval(id); } catch (e) {}
    });
    /* Non svuotiamo _intervals: serve per pageshow restore */

    /* Chiudi canali Supabase Realtime (community-hub) */
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
     5. PAGESHOW — ripristino dopo BFCache restore
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
        try { session = localStorage.getItem('lh360_community_session'); } catch (x) {}
        if (!session || !global.currentUser) return;
        try {
          if (global._sbChannels) {
            Object.values(global._sbChannels).forEach(function (ch) {
              try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (x) {}
            });
            global._sbChannels = {};
          }
        } catch (x) {}
        if (typeof global.initApp === 'function') global.initApp();
      } catch (x) {}
    }, 80);

  }, { capture: true });

}(window));
