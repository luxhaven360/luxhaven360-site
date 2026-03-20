/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  bfcache-guard.js  —  LuxHaven360                                    ║
 * ║  v5.0 — Registry-only: zero fetch wrapping                          ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  RESPONSABILITÀ:                                                     ║
 * ║   1. Registro AbortController attivi (__lhReg / __lhUnreg)          ║
 * ║   2. pagehide → abort di tutte le fetch pendenti                    ║
 * ║   3. pageshow → restore state per community-hub (Supabase)          ║
 * ║                                                                      ║
 * ║  NON FA:                                                             ║
 * ║   - NON wrappa window.fetch (delegato a siteguard-client.js)        ║
 * ║   - NON gestisce timeout (delegato a siteguard-client.js)           ║
 * ║   - NON monitora la connessione (delegato a connection-monitor.js)  ║
 * ║                                                                      ║
 * ║  ORDINE DI CARICAMENTO: PRIMO script in ogni pagina                 ║
 * ║   <script src="bfcache-guard.js"></script>                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
(function (global) {
  'use strict';

  /* ── Singleton guard ─────────────────────────────────────────────── */
  if (global.__lhBFCacheGuard) return;
  global.__lhBFCacheGuard = true;

  /* ════════════════════════════════════════════════════════════════════
     1. REGISTRO ABORTCONTROLLER
     Usato da siteguard-client.js per registrare ogni fetch attiva.
     Su pagehide, abortiremo tutto ciò che è in volo.
  ════════════════════════════════════════════════════════════════════ */
  var _controllers = new Set();

  /** Registra un AbortController. Chiamato da siteguard-client.js. */
  global.__lhReg = function (c) {
    if (c && typeof c.abort === 'function') _controllers.add(c);
  };

  /** Deregistra un AbortController al completamento della fetch. */
  global.__lhUnreg = function (c) {
    _controllers.delete(c);
  };

  /** Restituisce il numero di fetch attive (utile per debug). */
  global.__lhActiveFetches = function () {
    return _controllers.size;
  };

  /* ════════════════════════════════════════════════════════════════════
     2. PAGEHIDE — abort fetch pendenti + cleanup terze parti
     NON usiamo beforeunload: disabiliterebbe la BFCache di Chrome
     causando RESULT_CODE_HUNG.
  ════════════════════════════════════════════════════════════════════ */
  global.addEventListener('pagehide', function () {

    /* 2a. Abort tutte le fetch registrate */
    _controllers.forEach(function (c) {
      try { c.abort(); } catch (_) {}
    });
    _controllers.clear();

    /* 2b. Rimuovi tag <script> JSONP residui verso GAS (tracking-order) */
    try {
      document.querySelectorAll('script[src*="script.google.com"]')
        .forEach(function (s) { try { s.remove(); } catch (_) {} });
    } catch (_) {}

    /* 2c. Chiudi canali Supabase Realtime (community-hub) */
    try {
      if (global._sbChannels && typeof global._sbChannels === 'object') {
        Object.values(global._sbChannels).forEach(function (ch) {
          try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (_) {}
        });
      }
    } catch (_) {}

    try {
      if (global._sb && typeof global._sb.removeAllChannels === 'function') {
        global._sb.removeAllChannels();
      }
    } catch (_) {}

  }, { capture: true });

  /* ════════════════════════════════════════════════════════════════════
     3. PAGESHOW — restore dopo BFCache (community-hub Supabase RT)
  ════════════════════════════════════════════════════════════════════ */
  global.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;

    /* Reset contatore fetch (potrebbe essere sporco dal BFCache snapshot) */
    _controllers.clear();

    /* Restore canali Supabase solo su community-hub */
    setTimeout(function () {
      try {
        var session = null;
        try { session = localStorage.getItem('lh360_community_session'); } catch (_) {}
        if (!session || !global.currentUser) return;

        try {
          if (global._sbChannels) {
            Object.values(global._sbChannels).forEach(function (ch) {
              try { if (ch && ch.unsubscribe) ch.unsubscribe(); } catch (_) {}
            });
            global._sbChannels = {};
          }
        } catch (_) {}

        if (typeof global.initApp === 'function') global.initApp();
      } catch (_) {}
    }, 80);

  }, { capture: true });

  /* ════════════════════════════════════════════════════════════════════
     4. VISIBILITYCHANGE — reset UI loading su back-navigation mobile
  ════════════════════════════════════════════════════════════════════ */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    /* Notifica siteguard-client che può chiudere spinner residui */
    try {
      if (typeof global.__lhOnVisible === 'function') global.__lhOnVisible();
    } catch (_) {}
  });

}(window));
