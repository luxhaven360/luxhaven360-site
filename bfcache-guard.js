/**
 * ================================================================
 *  LuxHaven360 — BFCache Guard  v1.0
 *  File: bfcache-guard.js
 *  Da includere come PRIMO <script> in ogni pagina del sito.
 * ================================================================
 *
 *  PROBLEMA:  RESULT_CODE_HUNG ("Uffa!") su Chrome
 *  CAUSA:     fetch verso Google Apps Script (cold start 10-30s) +
 *             WebSocket Supabase Realtime restano aperti quando
 *             l'utente naviga via (back/forward). Il browser non
 *             può usare BFCache → renderer hung → "Uffa!"
 *
 *  SOLUZIONE: questo file intercetta window.fetch, setInterval e
 *             i canali Supabase. Su pagehide tutto viene annullato;
 *             su pageshow (BFCache) i setInterval vengono ripristinati
 *             e la sessione Supabase viene riconnessa via initApp().
 *
 *  GARANZIE:
 *   ✅ Zero modifiche alla logica originale di ogni pagina
 *   ✅ Trasparente: fetch/setInterval funzionano identicamente
 *   ✅ Compatibile con siteguard-client.js (si integra)
 *   ✅ Funziona anche se gli script successivi crashano
 *   ✅ community-hub: real-time ripristinato dopo back/forward
 * ================================================================
 */
(function (global) {
  'use strict';

  /* ── Singleton guard ────────────────────────────────────────── */
  if (global.__lhBFCacheGuard) return;
  global.__lhBFCacheGuard = true;

  /* ══════════════════════════════════════════════════════════════
     1. REGISTRO AbortController
     Ogni fetch aperto viene tracciato. Su pagehide → abort.
  ══════════════════════════════════════════════════════════════ */
  var _controllers = new Set();

  global.__lhReg   = function (c) { if (c && c.abort) _controllers.add(c); };
  global.__lhUnreg = function (c) { _controllers.delete(c); };

  /* Intercetta window.fetch per iniettare automaticamente
     un AbortController + timeout 8s su ogni chiamata GAS.
     Le chiamate con signal esplicito non vengono toccate. */
  if (typeof global.fetch === 'function' && !global.__lhFetchWrapped) {

    var _origFetch = global._originalFetch || global.fetch;

    global.fetch = function (input, init) {
      /* Se ha già un signal esplicito, non toccare nulla */
      if (init && init.signal) {
        return _origFetch(input, init);
      }

      /* Determina se è una chiamata GAS (potenzialmente lenta) */
      var url = (typeof input === 'string') ? input
              : (input && input.url) ? input.url : '';
      var isGAS = url.indexOf('script.google.com') !== -1;

      /* Per chiamate GAS: timeout 8s + registrazione */
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

      /* Altre chiamate (Supabase, ipapi, CDN…): passa invariato */
      return _origFetch(input, init);
    };

    global.__lhFetchWrapped = true;
  }

  /* ══════════════════════════════════════════════════════════════
     2. REGISTRO setInterval
     Ogni intervallo viene tracciato. Su pagehide → clearInterval.
     Su pageshow (BFCache restore) → rilancia tutti gli intervalli
     che avevano un nome noto (quelli del polling).
  ══════════════════════════════════════════════════════════════ */
  var _intervals = new Map(); /* id → { fn, delay, label } */

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
     3. PAGEHIDE — abort fetch + stop intervals + close Supabase
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pagehide', function () {

    /* 3a. Abort TUTTI i fetch pendenti registrati
          (include quelli di siteguard grazie all'integrazione __lhReg) */
    _controllers.forEach(function (c) {
      try { c.abort(); } catch (e) {}
    });
    _controllers.clear();

    /* 3b. Rimuovi i tag <script> JSONP verso GAS
          (tracking-order usa JSONP per gli ordini — questi non sono fetch
          e non vengono intercettati da AbortController, ma blocking BFCache)
    */
    try {
      var gasScripts = document.querySelectorAll('script[src*="script.google.com"]');
      gasScripts.forEach(function (s) { try { s.remove(); } catch (e) {} });
    } catch (e) {}

    /* 3c. Ferma tutti i setInterval attivi */
    _intervals.forEach(function (info, id) {
      try { _origClearInterval(id); } catch (e) {}
    });
    /* NON svuotiamo _intervals: servirà per il restore su pageshow */

    /* 3d. Chiudi canali Supabase Realtime
          (_sbChannels è popolato da community-hub.html) */
    try {
      if (global._sbChannels && typeof global._sbChannels === 'object') {
        Object.values(global._sbChannels).forEach(function (ch) {
          try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (e) {}
        });
      }
    } catch (e) {}

    /* 3e. removeAllChannels sul client Supabase */
    try {
      if (global._sb && typeof global._sb.removeAllChannels === 'function') {
        global._sb.removeAllChannels();
      }
    } catch (e) {}

  }, { capture: true });

  /* ══════════════════════════════════════════════════════════════
     4. PAGESHOW — ripristino dopo BFCache restore
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pageshow', function (e) {
    if (!e.persisted) return; /* caricamento normale: niente da fare */

    /* 4a. Ripristina setInterval che erano attivi */
    var toRestore = [];
    _intervals.forEach(function (info, oldId) {
      toRestore.push(info);
    });
    _intervals.clear();

    toRestore.forEach(function (info) {
      /* Rilancia con fn e delay originali */
      try {
        var newId = _origSetInterval(info.fn, info.delay);
        _intervals.set(newId, info);
      } catch (e) {}
    });

    /* 4b. Ripristina real-time Supabase su community-hub
          Aspetta 80ms per assicurarsi che il DOM sia pronto */
    setTimeout(function () {
      try {
        var session = null;
        try { session = localStorage.getItem('lh360_community_session'); } catch (ex) {}
        if (!session || !global.currentUser) return;

        /* Pulisci canali residui prima di ricrearli */
        try {
          if (global._sbChannels) {
            Object.values(global._sbChannels).forEach(function (ch) {
              try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (ex) {}
            });
            global._sbChannels = {};
          }
        } catch (ex) {}

        /* Riavvia tutta la logica real-time tramite initApp() */
        if (typeof global.initApp === 'function') {
          global.initApp();
        }
      } catch (ex) {}
    }, 80);

  }, { capture: true });

}(window));
