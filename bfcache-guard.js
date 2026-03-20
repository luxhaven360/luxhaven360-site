/**
 * ================================================================
 *  LuxHaven360 — BFCache Guard  v5.0
 *  File: bfcache-guard.js
 *  Da includere come PRIMO <script> in ogni pagina del sito.
 * ================================================================
 *
 *  COSA FA:
 *  1. Inizializza LuxFetchBus — event bus leggero per comunicazione
 *     tra moduli (siteguard → connection-monitor, ecc.) senza
 *     bisogno di wrapper fetch aggiuntivi.
 *  2. Salva window._originalFetch = browser nativo PRIMA di qualsiasi
 *     patch, garantendo che i moduli interni usino sempre la fetch
 *     nativa per le proprie chiamate di monitoring.
 *  3. Wrappa window.fetch per le sole chiamate GAS (script.google.com)
 *     con AbortController + timeout 20s + registro per abort su pagehide.
 *  4. Su pagehide: aborta tutte le fetch GAS pendenti (BFCache compat).
 *  5. Su pageshow(persisted): ripristina canali Supabase RT se presenti.
 *
 *  PERCHÉ v5.0 rispetto a v4:
 *  - Aggiunta init LuxFetchBus (prima era in siteguard, causava
 *    race condition se si cambiava l'ordine di caricamento)
 *  - Nessun'altra modifica funzionale a v4
 * ================================================================
 */
(function (global) {
  'use strict';

  if (global.__lhBFCacheGuard) return;
  global.__lhBFCacheGuard = true;

  /* ══════════════════════════════════════════════════════════════
     0. LuxFetchBus — event bus inter-modulo (init anticipato)
     Inizializzato qui perché bfcache-guard è il PRIMO script.
     Tutti i moduli successivi (siteguard, connection-monitor,
     lux-resilience) possono pubblicare/sottoscrivere eventi senza
     rischi di race condition.
  ══════════════════════════════════════════════════════════════ */
  if (!global.LuxFetchBus) {
    var _busListeners = {};
    global.LuxFetchBus = {
      /**
       * Sottoscrive un evento.
       * @param {string}   event - 'gas:error' | 'gas:slow' | 'gas:success' |
       *                           'net:error' | 'net:offline' | 'net:restored'
       * @param {function} fn    - callback(data)
       */
      on: function (event, fn) {
        if (!_busListeners[event]) _busListeners[event] = [];
        _busListeners[event].push(fn);
      },
      /**
       * Emette un evento verso tutti i subscriber.
       * @param {string} event
       * @param {*}      data
       */
      emit: function (event, data) {
        var listeners = _busListeners[event] || [];
        for (var i = 0; i < listeners.length; i++) {
          try { listeners[i](data); } catch (e) { /* mai bloccare il sito */ }
        }
      },
    };
  }

  /* ══════════════════════════════════════════════════════════════
     1. Salva riferimento alla fetch NATIVA del browser.
     Usato internamente da tutti i moduli per le chiamate di
     monitoring/warm-up, bypassando i wrapper applicativi.
  ══════════════════════════════════════════════════════════════ */
  global._originalFetch = global.fetch.bind(global);

  /* ══════════════════════════════════════════════════════════════
     2. REGISTRO AbortController — fetch GAS
     __lhReg/__lhUnreg usati da siteguard-client.js
  ══════════════════════════════════════════════════════════════ */
  var _controllers = new Set();

  global.__lhReg   = function (c) { if (c && c.abort) _controllers.add(c); };
  global.__lhUnreg = function (c) { _controllers.delete(c); };

  /* ══════════════════════════════════════════════════════════════
     3. WRAP window.fetch — solo chiamate GAS (script.google.com)
     con AbortController + timeout 20s.
     - Chiamate non-GAS: passano invariate alla fetch nativa.
     - Chiamate con signal esplicito: passano invariate.
  ══════════════════════════════════════════════════════════════ */
  if (typeof global.fetch === 'function' && !global.__lhFetchWrapped) {

    var _origFetch = global._originalFetch;

    global.fetch = function (input, init) {
      /* Fetch con signal esplicito: il chiamante gestisce il proprio abort */
      if (init && init.signal) {
        return _origFetch(input, init);
      }

      var url = typeof input === 'string' ? input
              : (input && input.url) ? input.url : '';

      /* Solo chiamate verso Google Apps Script ricevono il timeout GAS */
      if (url.indexOf('script.google.com') !== -1) {
        var ctrl = new AbortController();
        /* Timeout 20s — GAS cold start può richiedere fino a ~20s */
        var tid  = setTimeout(function () { ctrl.abort(); }, 20000);
        _controllers.add(ctrl);
        var merged = Object.assign({}, init || {}, { signal: ctrl.signal });

        return _origFetch(input, merged).finally(function () {
          clearTimeout(tid);
          _controllers.delete(ctrl);
        });
      }

      /* Tutte le altre fetch (Vimeo, Stripe, ipapi, ecc.): nessun wrapper */
      return _origFetch(input, init);
    };

    global.__lhFetchWrapped = true;
  }

  /* ══════════════════════════════════════════════════════════════
     4. PAGEHIDE — abort fetch GAS + cleanup Supabase
     NON usa beforeunload (disabiliterebbe BFCache di Chrome).
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
      if (global._sbChannels) {
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
     5. PAGESHOW — ripristino Supabase RT dopo BFCache restore
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;

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
