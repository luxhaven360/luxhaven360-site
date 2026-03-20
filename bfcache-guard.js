/**
 * ================================================================
 *  LuxHaven360 — BFCache Guard  v4.0
 *  File: bfcache-guard.js
 *  Da includere come PRIMO <script> in ogni pagina del sito.
 * ================================================================
 *
 *  PERCHÉ v4.0:
 *  Le versioni precedenti tracciavano i setInterval e li
 *  "ripristinavano" su pageshow (BFCache restore). Questo causava
 *  un'accumulo di intervalli: ogni ciclo back/forward creava nuovi
 *  ID che non potevano più essere rimossi da clearInterval() del
 *  codice originale. Dopo 10-15 cicli, decine di polling paralleli
 *  saturavano le richieste GAS → RESULT_CODE_HUNG.
 *
 *  SOLUZIONE v4.0:
 *  - setInterval NON più tracciato (causa dell'accumulo)
 *  - Solo fetch GAS viene intercettato e abortito su pagehide
 *  - connection-monitor.js gestisce autonomamente il proprio
 *    ciclo di vita su pagehide/pageshow
 *  - community-hub: Supabase RT gestito su pageshow
 * ================================================================
 */
(function (global) {
  'use strict';

  if (global.__lhBFCacheGuard) return;
  global.__lhBFCacheGuard = true;

  /* ══════════════════════════════════════════════════════════════
     1. REGISTRO AbortController — fetch GAS
     __lhReg/__lhUnreg usati da siteguard-client.js
  ══════════════════════════════════════════════════════════════ */
  var _controllers = new Set();

  global.__lhReg   = function (c) { if (c && c.abort) _controllers.add(c); };
  global.__lhUnreg = function (c) { _controllers.delete(c); };

  /* ══════════════════════════════════════════════════════════════
     2. WRAP window.fetch
     Ogni chiamata GAS senza signal esplicito riceve un
     AbortController registrato in _controllers.
  ══════════════════════════════════════════════════════════════ */
  if (typeof global.fetch === 'function' && !global.__lhFetchWrapped) {

    var _origFetch = global._originalFetch || global.fetch;

    global.fetch = function (input, init) {
      /* Fetch con signal esplicito: passa invariato */
      if (init && init.signal) {
        return _origFetch(input, init);
      }

      var url = typeof input === 'string' ? input
              : (input && input.url) ? input.url : '';

      if (url.indexOf('script.google.com') !== -1) {
        var ctrl    = new AbortController();
        // ✅ FIX: aumentato da 8000 a 20000ms — allineato con siteguard-client.js.
        // GAS cold start può richiedere 10-20s; con 8s il timeout scattava troppo presto.
        var tid     = setTimeout(function () { ctrl.abort(); }, 20000);
        _controllers.add(ctrl);
        var merged  = Object.assign({}, init || {}, { signal: ctrl.signal });

        return _origFetch(input, merged).finally(function () {
          clearTimeout(tid);
          _controllers.delete(ctrl);
        });
      }

      return _origFetch(input, init);
    };

    global.__lhFetchWrapped = true;
  }

  /* ══════════════════════════════════════════════════════════════
     3. PAGEHIDE — abort fetch GAS + cleanup Supabase
     NON tocca setInterval: ogni modulo gestisce autonomamente
     i propri intervalli via pagehide (connection-monitor lo fa già).
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pagehide', function () {

    /* Abort tutti i fetch GAS pendenti */
    _controllers.forEach(function (c) {
      try { c.abort(); } catch (e) {}
    });
    _controllers.clear();

    /* Rimuovi tag <script> JSONP verso GAS (tracking-order) */
    try {
      document.querySelectorAll('script[src*="script.google.com"]')
        .forEach(function (s) { try { s.remove(); } catch (e) {} });
    } catch (e) {}

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
     4. PAGESHOW — ripristino Supabase RT dopo BFCache restore
     (solo community-hub; le altre pagine non necessitano azione)
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;

    setTimeout(function () {
      try {
        var session = null;
        try { session = localStorage.getItem('lh360_community_session'); } catch (x) {}
        if (!session || !global.currentUser) return;

        /* Pulisci canali residui prima di ricrearli */
        try {
          if (global._sbChannels) {
            Object.values(global._sbChannels).forEach(function (ch) {
              try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (x) {}
            });
            global._sbChannels = {};
          }
        } catch (x) {}

        /* Riavvia logica RT tramite initApp() */
        if (typeof global.initApp === 'function') global.initApp();
      } catch (x) {}
    }, 80);

  }, { capture: true });

}(window));
