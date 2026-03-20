/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  siteguard-client.js  —  LuxHaven360                                 ║
 * ║  v4.0 — Unified Wrapper: unico livello fetch + monitoring           ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  RESPONSABILITÀ:                                                     ║
 * ║   A. Salva _originalFetch (unica copia della fetch nativa)          ║
 * ║   B. Fetch wrapper UNICO con timeout adattivo:                      ║
 * ║       • GAS / script.google.com → 25 s                              ║
 * ║       • Stripe / ipapi / altre API → 15 s                           ║
 * ║       • Risorse generiche → 12 s                                    ║
 * ║   C. Registra ogni AbortController con bfcache-guard                ║
 * ║   D. GAS warm-up al primo idle (riduce cold start)                  ║
 * ║   E. Safety timer 12 s (sblocca body nascosto)                      ║
 * ║   F. Cattura errori JS globali + Promise rejection                  ║
 * ║   G. Performance monitoring (pageLoad, TTFB, domReady)              ║
 * ║   H. API pubblica: window.SiteGuard                                 ║
 * ║                                                                      ║
 * ║  NON FA:                                                             ║
 * ║   - NON wrappa fetch se già wrappata (guard _sgUnifiedWrap)         ║
 * ║   - NON rileva la connessione (delegato a connection-monitor.js)    ║
 * ║                                                                      ║
 * ║  ORDINE DI CARICAMENTO: SECONDO script (dopo bfcache-guard.js)      ║
 * ║   <script src="siteguard-client.js"></script>                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
(function () {
  'use strict';

  /* ── Singleton guard ─────────────────────────────────────────────── */
  if (window.__SiteGuardLoaded) return;
  window.__SiteGuardLoaded = true;

  /* ════════════════════════════════════════════════════════════════════
     CONFIGURAZIONE
  ════════════════════════════════════════════════════════════════════ */
  var CFG = {
    /* Timeout per URL GAS (cold start = 10-30 s) */
    TIMEOUT_GAS:     25000,
    /* Timeout per API esterne (Stripe, ipapi, ecc.) */
    TIMEOUT_API:     15000,
    /* Timeout generico per tutto il resto */
    TIMEOUT_DEFAULT: 12000,
    /* URL monitoring backend */
    SITEGUARD_URL:   'https://script.google.com/macros/s/AKfycbyLT41A8PPuQwyjCHkFA6anJhp-ywVJhy7TlMpxydaw3osPuplcsfafiNANA3s1hzk7/exec',
    /* URL GAS warm-up */
    GAS_WARMUP_URLS: [
      'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec?action=ping',
      'https://script.google.com/macros/s/AKfycbyLb-E_43gf3inu4cC062Cn-OpbXK1fM8QiflQ8k6F_uxRrorcTVhWVUOgOWTJrOFwa/exec?action=ping'
    ],
    DEBUG: false
  };

  function log() {
    if (CFG.DEBUG) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[SiteGuard]');
      console.log.apply(console, args);
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     STEP 0 — Salva riferimento alla fetch NATIVA prima di qualsiasi
     altra operazione. _originalFetch non viene mai sovrascritto.
  ════════════════════════════════════════════════════════════════════ */
  if (!window._originalFetch) {
    window._originalFetch = window.fetch.bind(window);
  }
  var _nativeFetch = window._originalFetch;

  /* ════════════════════════════════════════════════════════════════════
     HELPER: determina timeout in ms in base all'URL
  ════════════════════════════════════════════════════════════════════ */
  function _timeoutFor(input) {
    var url = '';
    try {
      url = (typeof input === 'string') ? input
          : (input && input.url)        ? input.url
          : String(input);
    } catch (_) {}
    if (url.indexOf('script.google.com') !== -1) return CFG.TIMEOUT_GAS;
    if (url.indexOf('stripe.com')        !== -1) return CFG.TIMEOUT_API;
    if (url.indexOf('ipapi.co')          !== -1) return CFG.TIMEOUT_API;
    if (url.indexOf('frankfurter.app')   !== -1) return CFG.TIMEOUT_API;
    return CFG.TIMEOUT_DEFAULT;
  }

  /* ════════════════════════════════════════════════════════════════════
     A. FETCH WRAPPER UNICO
     Aggiunge timeout adattivo + registra l'AbortController con
     bfcache-guard. Non fa nulla se la chiamata ha già un signal.
  ════════════════════════════════════════════════════════════════════ */
  if (!window._sgUnifiedWrap) {
    window.fetch = function (input, init) {
      /* Se ha già un signal esplicito, passa diretto senza modifiche */
      if (init && init.signal) {
        return _nativeFetch(input, init);
      }

      var timeout    = _timeoutFor(input);
      var controller = new AbortController();
      var timeoutId  = setTimeout(function () {
        controller.abort();
        log('Timeout (' + timeout + 'ms):', typeof input === 'string' ? input.substring(0, 80) : '(Request)');
      }, timeout);

      /* Registra con bfcache-guard per abort su pagehide */
      if (window.__lhReg) window.__lhReg(controller);

      var mergedInit = Object.assign({}, init || {}, { signal: controller.signal });

      return _nativeFetch(input, mergedInit)
        .finally(function () {
          clearTimeout(timeoutId);
          if (window.__lhUnreg) window.__lhUnreg(controller);
        });
    };

    window._sgUnifiedWrap = true;
    log('✅ Fetch wrapper unificato attivo');
  }

  /* ════════════════════════════════════════════════════════════════════
     B. PAGESHOW — BFCache restore: reset UI e riprendi operazioni
  ════════════════════════════════════════════════════════════════════ */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    log('BFCache restore — chiudo spinner residui');
    _closeAllLoadingUI();
  });

  /* ════════════════════════════════════════════════════════════════════
     C. VISIBILITYCHANGE — back-navigation mobile
  ════════════════════════════════════════════════════════════════════ */
  window.__lhOnVisible = function () {
    _closeAllLoadingUI();
  };

  /* ════════════════════════════════════════════════════════════════════
     D. GAS WARM-UP — riduce cold start al primo idle
  ════════════════════════════════════════════════════════════════════ */
  function _warmupGAS() {
    CFG.GAS_WARMUP_URLS.forEach(function (url) {
      /* Usa _nativeFetch: non deve passare per il wrapper né per retry */
      _nativeFetch(url, { method: 'GET', cache: 'no-store', keepalive: false })
        .catch(function () {});
    });
    log('GAS warm-up inviato');
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(_warmupGAS, { timeout: 3000 });
  } else {
    setTimeout(_warmupGAS, 1500);
  }

  /* ════════════════════════════════════════════════════════════════════
     E. SAFETY TIMER — sblocca body dopo 12 s (failsafe)
  ════════════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (document.body) {
        if (document.body.style.visibility === 'hidden') document.body.style.visibility = '';
        if (document.body.style.opacity    === '0')      document.body.style.opacity    = '';
      }
      _closeAllLoadingUI();
    }, 12000);
  });

  /* ════════════════════════════════════════════════════════════════════
     F. CATTURA ERRORI JS GLOBALI
  ════════════════════════════════════════════════════════════════════ */
  window.addEventListener('error', function (event) {
    /* Ignora errori da estensioni browser e errori su elementi (img, ecc.) */
    if (!event.filename)                                    return;
    if (event.filename.indexOf('extension://') !== -1)     return;
    if (event.target && event.target !== window)           return;
    _sendError(event.message, event.filename + ':' + event.lineno,
      event.error ? event.error.stack : '');
  });

  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    var msg    = (reason instanceof Error) ? reason.message : String(reason || '');

    /* Filtra errori attesi che non richiedono monitoring */
    if (reason instanceof Error && reason.name === 'AbortError')       return; // timeout/pagehide normali
    if (msg.toLowerCase().indexOf('aborted')        !== -1)            return;
    if (msg.toLowerCase().indexOf('failed to fetch') !== -1)           return;
    if (msg.toLowerCase().indexOf('networkerror')    !== -1)           return;
    if (msg.toLowerCase().indexOf('network request failed') !== -1)    return;
    if (msg.toLowerCase().indexOf('load failed')     !== -1)           return;
    if (!msg || msg === 'undefined' || msg === 'null')                 return;

    _sendError('Unhandled Promise: ' + msg, 'promise');
    log('Unhandled rejection catturata:', msg);
  });

  /* ════════════════════════════════════════════════════════════════════
     G. PERFORMANCE MONITORING
  ════════════════════════════════════════════════════════════════════ */
  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        var nav = performance.getEntriesByType('navigation')[0];
        if (!nav) return;
        var metrics = {
          pageLoadMs: Math.round(nav.loadEventEnd  - nav.startTime),
          ttfbMs:     Math.round(nav.responseStart - nav.requestStart),
          domReadyMs: Math.round(nav.domContentLoadedEventEnd - nav.responseEnd),
          page:       window.location.pathname
        };
        log('Performance:', metrics);
        _sendMetric('page_load', metrics.pageLoadMs, metrics);
        if (metrics.pageLoadMs > 8000) {
          _sendMetric('page_load_slow', metrics.pageLoadMs, { page: metrics.page, ttfb: metrics.ttfbMs });
        }
      } catch (_) {}
    }, 500);
  });

  /* ════════════════════════════════════════════════════════════════════
     HELPER: chiude loading UI noti del sito
  ════════════════════════════════════════════════════════════════════ */
  function _closeAllLoadingUI() {
    try {
      ['lhCartLoading', 'stripeLoading'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      document.querySelectorAll('[id*="loading"],[id*="Loading"],[class*="lh-loading"]')
        .forEach(function (el) { if (el.style.display !== 'none') el.style.display = 'none'; });
    } catch (_) {}
  }

  /* ════════════════════════════════════════════════════════════════════
     FETCH WITH RETRY — per chiamate GAS critiche
     Usa _nativeFetch con timeout esplicito per il pieno controllo.
     Non riprova se il documento è nascosto (navigazione in corso).
  ════════════════════════════════════════════════════════════════════ */
  function fetchWithRetry(url, options, maxRetries) {
    options    = options    || {};
    maxRetries = maxRetries || 3;
    var start  = Date.now();

    function tryOnce(attempt) {
      /* Non riprovare se la pagina è in background — evita loop zombi */
      if (document.hidden || document.visibilityState === 'hidden') {
        return Promise.reject(new Error('Page not visible — retry aborted'));
      }

      var controller = new AbortController();
      var timeoutId  = setTimeout(function () { controller.abort(); }, CFG.TIMEOUT_GAS);
      if (window.__lhReg) window.__lhReg(controller);

      var mergedOptions = Object.assign({}, options, { signal: controller.signal });

      return _nativeFetch(url, mergedOptions)
        .finally(function () {
          clearTimeout(timeoutId);
          if (window.__lhUnreg) window.__lhUnreg(controller);
        })
        .then(function (response) {
          var elapsed = Date.now() - start;
          if (!response.ok) throw new Error('HTTP ' + response.status);
          if (attempt > 1) _sendMetric('fetch_retry_success', attempt, { url: url, elapsed: elapsed });
          if (elapsed > 6000) _sendMetric('fetch_slow', elapsed, { url: url });
          return response;
        })
        .catch(function (err) {
          /* Non riprovare AbortError da pagehide */
          if (err.name === 'AbortError' && document.hidden) throw err;

          log('Tentativo', attempt + '/' + maxRetries, 'fallito:', err.message);

          if (attempt < maxRetries) {
            /* Backoff progressivo: 3s, 7s, 12s */
            var delays = [0, 3000, 7000, 12000];
            var delay  = delays[attempt] || 5000;
            return new Promise(function (resolve) { setTimeout(resolve, delay); })
              .then(function () { return tryOnce(attempt + 1); });
          }

          _sendError('fetchWithRetry esaurito: ' + err.message, url);
          throw err;
        });
    }

    return tryOnce(1);
  }

  /* ════════════════════════════════════════════════════════════════════
     PRECONNECT STRIPE / VIMEO
  ════════════════════════════════════════════════════════════════════ */
  function _addPreconnect(origin) {
    if (document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) return;
    var link = document.createElement('link');
    link.rel         = 'preconnect';
    link.href        = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
  _addPreconnect('https://js.stripe.com');
  _addPreconnect('https://checkout.stripe.com');

  /* ════════════════════════════════════════════════════════════════════
     SEND HELPERS — backend monitoring
     Usano sempre _nativeFetch: bypassa wrapper + timeout globali.
  ════════════════════════════════════════════════════════════════════ */
  function _sendToGuard(payload) {
    try {
      _nativeFetch(CFG.SITEGUARD_URL, {
        method:  'POST',
        body:    JSON.stringify(payload),
        mode:    'no-cors',
        headers: { 'Content-Type': 'text/plain' }
      }).catch(function () {});
    } catch (_) {}
  }

  function _sendMetric(name, value, meta) {
    _sendToGuard({ action: 'metric', name: name, value: value, meta: meta || {} });
  }

  function _sendError(message, source, stack) {
    _sendToGuard({ action: 'error', message: message, source: source || '', stack: stack || '' });
  }

  /* ════════════════════════════════════════════════════════════════════
     MONITORAGGIO CHECKOUT GAS
  ════════════════════════════════════════════════════════════════════ */
  var _checkoutStartTime = null;

  function checkoutStart() {
    _checkoutStartTime = Date.now();
    log('Checkout avviato');
  }

  function checkoutEnd(outcome, detail) {
    if (!_checkoutStartTime) return;
    var duration = Date.now() - _checkoutStartTime;
    _checkoutStartTime = null;
    outcome = outcome || 'success';
    log('Checkout', outcome, duration + 'ms');
    _sendMetric('checkout_' + outcome, duration, { page: window.location.pathname, detail: detail });
  }

  /* ════════════════════════════════════════════════════════════════════
     MONITORAGGIO i18n
  ════════════════════════════════════════════════════════════════════ */
  function i18nReady(ok, lang) {
    if (ok === undefined) ok = true;
    if (!ok) {
      _sendError('i18n: init fallito', 'i18n-custom');
    } else {
      _sendMetric('i18n_load', 1, { lang: lang || navigator.language || 'unknown', page: window.location.pathname });
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     MONITORAGGIO EXCHANGE RATES
  ════════════════════════════════════════════════════════════════════ */
  function exchangeRatesFetched(ok, rates) {
    if (ok === undefined) ok = true;
    if (!ok) {
      _sendError('Exchange rates fetch fallito', 'ExchangeRates');
    } else {
      _sendMetric('exchange_rates_ok', 1, { usd: (rates || {}).USD || null, gbp: (rates || {}).GBP || null });
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     API PUBBLICA → window.SiteGuard
  ════════════════════════════════════════════════════════════════════ */
  window.SiteGuard = {
    checkoutStart:        checkoutStart,
    checkoutEnd:          checkoutEnd,
    i18nReady:            i18nReady,
    exchangeRatesFetched: exchangeRatesFetched,
    fetchWithRetry:       fetchWithRetry,
    sendMetric:           _sendMetric,
    sendError:            _sendError
  };

  log('✅ SiteGuard v4 (unified wrapper) attivo su:', window.location.pathname);

})();
