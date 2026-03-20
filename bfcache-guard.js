/**
 * ================================================================
 *  LuxHaven360 — BFCache Guard  v4.1
 *  File: bfcache-guard.js
 *  Da includere come PRIMO <script> in ogni pagina del sito.
 * ================================================================
 *
 *  CHANGELOG v4.1 rispetto a v4.0:
 *
 *  ✅ FIX 1 — window._nativeFetch
 *     Salva il riferimento alla fetch VERA del browser PRIMA di
 *     qualsiasi wrapping. siteguard-client.js e warmupGAS la usano
 *     per bypassare tutti i wrapper e accedere direttamente alla
 *     rete, eliminando la catena di AbortController annidati.
 *
 *  ✅ FIX 2 — abort() con reason (NAV_ABORT_REASON)
 *     Tutte le chiamate c.abort() ora passano un DOMException con
 *     messaggio riconoscibile. Questo permette ai catch() di
 *     distinguere un abort da navigazione da un errore reale e
 *     NON mostrare l'overlay di errore all'utente.
 *
 *  ✅ FIX 3 — window.__lhIsNavAbort(err)
 *     Funzione di utilità esposta globalmente. Ogni script del sito
 *     può chiamarla nel proprio catch() per sapere se l'errore è
 *     dovuto a navigazione (e quindi ignorarlo silenziosamente).
 *
 *  ✅ FIX 4 — window.__lhPageHiding flag
 *     Flag booleano impostato a true su pagehide e false su
 *     pageshow. Permette ai timeout/poll di auto-cancellarsi
 *     quando sanno che la pagina sta per essere congelata.
 *
 *  INVARIATO da v4.0:
 *  - setInterval NON tracciato (causa dell'accumulo pre-v4)
 *  - Solo fetch GAS intercettate e abortite su pagehide
 *  - Supabase RT gestito su pageshow/pagehide
 * ================================================================
 */
(function (global) {
  'use strict';

  if (global.__lhBFCacheGuard) return;
  global.__lhBFCacheGuard = true;

  /* ══════════════════════════════════════════════════════════════
     0. SALVA FETCH NATIVA — PRIMA DI QUALSIASI WRAPPING
     ──────────────────────────────────────────────────────────────
     _nativeFetch = la window.fetch originale del browser.
     È usata da warmupGAS e sendToGuard per chiamate "pure"
     senza AbortController aggiuntivi o contatori attivi.
     Questo è il punto più importante dell'intera catena:
     bfcache-guard gira PRIMO, quindi qui fetch è ancora nativa.
  ══════════════════════════════════════════════════════════════ */
  if (!global._nativeFetch) {
    global._nativeFetch = global.fetch;
  }

  /* ══════════════════════════════════════════════════════════════
     COSTANTE DI ABORT — usata in tutti i c.abort()
     Un DOMException con nome 'AbortError' e messaggio univoco.
     __lhIsNavAbort() riconosce questo messaggio specifico.
  ══════════════════════════════════════════════════════════════ */
  var NAV_ABORT_MSG    = 'lh360:navigation-pagehide';
  var NAV_ABORT_REASON = new DOMException(NAV_ABORT_MSG, 'AbortError');

  /* ══════════════════════════════════════════════════════════════
     1. UTILITY GLOBALE — window.__lhIsNavAbort(err)
     ──────────────────────────────────────────────────────────────
     Ritorna true se l'errore è un abort da navigazione (pagehide)
     o da timeout interno (name=TimeoutError).
     USO NEI CATCH:
       .catch(function(err) {
         if (window.__lhIsNavAbort(err)) return; // silenzioso
         LuxError.show('loading', retryFn);
       });
  ══════════════════════════════════════════════════════════════ */
  global.__lhIsNavAbort = function (err) {
    if (!err) return false;
    var name = err.name  || '';
    var msg  = err.message || '';
    /* Abort esplicito da navigazione (questo file) */
    if (name === 'AbortError' && msg === NAV_ABORT_MSG) return true;
    /* Abort da timeout (siteguard-client wrap A) */
    if (name === 'TimeoutError') return true;
    /* Abort generico senza reason (browser vecchi o code path legacy) */
    if (name === 'AbortError' && msg === 'signal is aborted without reason') return true;
    /* Abort generico senza messaggio */
    if (name === 'AbortError' && !msg) return true;
    return false;
  };

  /* ══════════════════════════════════════════════════════════════
     2. FLAG DI PAGINA IN CHIUSURA — window.__lhPageHiding
     ──────────────────────────────────────────────────────────────
     Impostato su pagehide, resettato su pageshow.
     I polling loop possono fare `if (window.__lhPageHiding) return;`
     invece di chiamare clearInterval (che potrebbe usare un ID
     non più valido dopo BFCache restore).
  ══════════════════════════════════════════════════════════════ */
  global.__lhPageHiding = false;

  /* ══════════════════════════════════════════════════════════════
     3. REGISTRO AbortController — fetch GAS
     __lhReg/__lhUnreg usati da siteguard-client.js
  ══════════════════════════════════════════════════════════════ */
  var _controllers = new Set();

  global.__lhReg   = function (c) { if (c && c.abort) _controllers.add(c); };
  global.__lhUnreg = function (c) { _controllers.delete(c); };

  /* ══════════════════════════════════════════════════════════════
     4. WRAP window.fetch
     Ogni chiamata GAS senza signal esplicito riceve un
     AbortController registrato in _controllers.
     Il timeout interno usa NAV_ABORT_REASON per coerenza.
  ══════════════════════════════════════════════════════════════ */
  if (typeof global.fetch === 'function' && !global.__lhFetchWrapped) {

    var _origFetch = global._nativeFetch;

    global.fetch = function (input, init) {
      /* Fetch con signal esplicito: passa invariato */
      if (init && init.signal) {
        return _origFetch(input, init);
      }

      var url = typeof input === 'string' ? input
              : (input && input.url) ? input.url : '';

      if (url.indexOf('script.google.com') !== -1) {
        var ctrl   = new AbortController();
        /* Timeout di sicurezza: 8s → abort con reason riconoscibile */
        var tid    = setTimeout(function () {
          ctrl.abort(new DOMException('lh360:bfcache-timeout-8s', 'TimeoutError'));
        }, 8000);
        _controllers.add(ctrl);
        var merged = Object.assign({}, init || {}, { signal: ctrl.signal });

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
     5. PAGEHIDE — abort fetch GAS + cleanup Supabase
     ──────────────────────────────────────────────────────────────
     Ora c.abort() riceve NAV_ABORT_REASON: i catch() che usano
     __lhIsNavAbort() sapranno ignorare questi errori silenziosamente.
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pagehide', function () {

    global.__lhPageHiding = true;

    /* Abort tutti i fetch GAS pendenti CON REASON riconoscibile */
    _controllers.forEach(function (c) {
      try { c.abort(NAV_ABORT_REASON); } catch (e) {}
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
     6. PAGESHOW — ripristino dopo BFCache restore
  ══════════════════════════════════════════════════════════════ */
  global.addEventListener('pageshow', function (e) {

    global.__lhPageHiding = false;

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
