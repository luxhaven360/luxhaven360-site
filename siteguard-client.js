/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  siteguard-client.js — LuxHaven360                              ║
 * ║  v3 — Unified: Stabilizzazione + Monitoring Frontend           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  INCLUDE TUTTE LE FUNZIONALITÀ DI v1 + v2                       ║
 * ║                                                                  ║
 * ║  STABILIZZAZIONE (ex v2)                                         ║
 * ║   A. Fetch timeout globale (8s) → previene RESULT_CODE_HUNG     ║
 * ║   B. BFCache handler (pageshow persisted) → rilascia blocchi    ║
 * ║   C. visibilitychange → chiude spinner su back-navigation       ║
 * ║   D. GAS warm-up al primo idle → riduce cold start              ║
 * ║   E. Safety timer 12s → sblocca body nascosto                   ║
 * ║                                                                  ║
 * ║  MONITORING (ex v1)                                              ║
 * ║   1. Cattura errori JS globali + Promise rejection              ║
 * ║   2. Performance pagina (pageLoad, TTFB, domReady)              ║
 * ║   3. Monitoraggio checkout GAS                                   ║
 * ║   4. Monitoraggio sistema i18n personalizzato                    ║
 * ║   5. Monitoraggio Exchange Rates                                 ║
 * ║   6. fetchWithRetry (3 tentativi, backoff 1.2s)                 ║
 * ║   7. Preconnect automatico a Stripe                              ║
 * ║                                                                  ║
 * ║  INSTALLAZIONE                                                   ║
 * ║  Questo file deve essere il PRIMO <script> di ogni pagina:      ║
 * ║    <script src="siteguard-client.js"></script>        ← root    ║
 * ║    <script src="../siteguard-client.js"></script>     ← sub     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  /* ── Singleton guard ─────────────────────────────────────────── */
  if (window.__SiteGuardLoaded) return;
  window.__SiteGuardLoaded = true;

  /* ── Configurazione ──────────────────────────────────────────── */
  var FETCH_TIMEOUT_MS = 8000;
  var DEBUG = false;

  /* URL monitoring backend (v1) */
  var SITEGUARD_URL = 'https://script.google.com/macros/s/AKfycbyLT41A8PPuQwyjCHkFA6anJhp-ywVJhy7TlMpxydaw3osPuplcsfafiNANA3s1hzk7/exec';

  /* URL GAS warm-up (v2) */
  var GAS_WARMUP_URLS = [
    'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec?action=ping',
    'https://script.google.com/macros/s/AKfycbyLb-E_43gf3inu4cC062Cn-OpbXK1fM8QiflQ8k6F_uxRrorcTVhWVUOgOWTJrOFwa/exec?action=ping'
  ];

  function log() {
    if (DEBUG) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[SiteGuard]');
      console.log.apply(console, args);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     STEP 0 — Salva riferimento alla fetch originale PRIMA di
     qualsiasi patch, così i metodi interni di monitoring la usano
     direttamente ed evitano loop o timeout indesiderati.
  ══════════════════════════════════════════════════════════════ */
  window._originalFetch = window.fetch.bind(window);


  /* ══════════════════════════════════════════════════════════════
     A. FETCH INTERCEPTOR — timeout globale (ex v2)
     Aggiunge AbortController con timeout di 8s a ogni fetch
     che non ha già un signal esplicito.
  ══════════════════════════════════════════════════════════════ */
  if (typeof window.fetch === 'function' && !window._sgFetchPatched) {
    var _origFetch = window._originalFetch;

    window.fetch = function (input, init) {
      if (init && init.signal) {
        return _origFetch(input, init);
      }
      var controller = new AbortController();
      var timeoutId  = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);
      var mergedInit = Object.assign({}, init || {}, { signal: controller.signal });
      return _origFetch(input, mergedInit).finally(function () {
        clearTimeout(timeoutId);
      });
    };

    window._sgFetchPatched = true;
  }

  /* ── Traccia fetch attive per BFCache handler ─────────────── */
  var _activeFetches  = 0;
  var _lastFetchStart = 0;

  if (window._sgFetchPatched) {
    var _timedFetch = window.fetch;
    window.fetch = function (input, init) {
      _activeFetches++;
      _lastFetchStart = Date.now();
      return _timedFetch(input, init).finally(function () {
        _activeFetches = Math.max(0, _activeFetches - 1);
      });
    };
  }


  /* ══════════════════════════════════════════════════════════════
     B. BFCACHE HANDLER — pageshow con persisted=true (ex v2)
  ══════════════════════════════════════════════════════════════ */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    var staleFetch = _activeFetches > 0 && (Date.now() - _lastFetchStart) > 5000;
    if (staleFetch) {
      window.location.reload();
      return;
    }
    _closeAllLoadingUI();
  });


  /* ══════════════════════════════════════════════════════════════
     C. VISIBILITYCHANGE — back-navigation mobile (ex v2)
  ══════════════════════════════════════════════════════════════ */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    _closeAllLoadingUI();
  });


  /* ══════════════════════════════════════════════════════════════
     D. GAS WARM-UP — riduce cold start (ex v2)
  ══════════════════════════════════════════════════════════════ */
  function warmupGAS() {
    GAS_WARMUP_URLS.forEach(function (url) {
      window._originalFetch(url, { method: 'GET', cache: 'no-store', keepalive: false })
        .catch(function () {});
    });
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(warmupGAS, { timeout: 3000 });
  } else {
    setTimeout(warmupGAS, 1500);
  }


  /* ══════════════════════════════════════════════════════════════
     E. SAFETY TIMER — sblocca body dopo 12s (ex v2)
  ══════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (document.body && document.body.style.visibility === 'hidden') {
        document.body.style.visibility = '';
      }
      if (document.body && document.body.style.opacity === '0') {
        document.body.style.opacity = '';
      }
      _closeAllLoadingUI();
    }, 12000);
  });


  /* ══════════════════════════════════════════════════════════════
     HELPER: chiude tutti i loading UI noti del sito (ex v2)
  ══════════════════════════════════════════════════════════════ */
  function _closeAllLoadingUI() {
    try {
      var cartLoading = document.getElementById('lhCartLoading');
      if (cartLoading) cartLoading.style.display = 'none';

      var stripeLoading = document.getElementById('stripeLoading');
      if (stripeLoading) stripeLoading.style.display = 'none';

      var authOverlay = document.getElementById('authOverlay');
      if (authOverlay && authOverlay.classList.contains('open') &&
          stripeLoading && stripeLoading.style.display !== 'none') {
        authOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }

      var loaders = document.querySelectorAll('[id*="loading"], [id*="Loading"], [class*="lh-loading"]');
      loaders.forEach(function (el) {
        if (el.style.display !== 'none') el.style.display = 'none';
      });
    } catch (err) {
      /* Non interferire mai con il rendering principale */
    }
  }


  /* ══════════════════════════════════════════════════════════════
     1. CATTURA ERRORI JS GLOBALI (ex v1)
  ══════════════════════════════════════════════════════════════ */
  window.addEventListener('error', function (event) {
    if (!event.filename || event.filename.includes('extension://')) return;
    if (event.target && event.target !== window) return;
    sendError(
      event.message,
      event.filename + ':' + event.lineno,
      event.error ? event.error.stack : ''
    );
  });

  window.addEventListener('unhandledrejection', function (event) {
    var msg = event.reason instanceof Error
      ? event.reason.message
      : String(event.reason || 'Unhandled rejection');
    if (msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('failed to fetch')) return;
    sendError('Unhandled Promise: ' + msg, 'promise');
  });


  /* ══════════════════════════════════════════════════════════════
     2. PERFORMANCE PAGINA (ex v1)
  ══════════════════════════════════════════════════════════════ */
  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        var nav = performance.getEntriesByType('navigation')[0];
        if (!nav) return;
        var metrics = {
          pageLoadMs:  Math.round(nav.loadEventEnd - nav.startTime),
          ttfbMs:      Math.round(nav.responseStart - nav.requestStart),
          domReadyMs:  Math.round(nav.domContentLoadedEventEnd - nav.responseEnd),
          page:        window.location.pathname,
        };
        log('Performance:', metrics);
        sendMetric('page_load', metrics.pageLoadMs, metrics);
        if (metrics.pageLoadMs > 8000) {
          sendMetric('page_load_slow', metrics.pageLoadMs, {
            page: metrics.page,
            ttfb: metrics.ttfbMs
          });
        }
      } catch (_) {}
    }, 500);
  });


  /* ══════════════════════════════════════════════════════════════
     3. MONITORAGGIO CHECKOUT GAS (ex v1)
  ══════════════════════════════════════════════════════════════ */
  var _checkoutStartTime = null;

  function checkoutStart() {
    _checkoutStartTime = Date.now();
    log('Checkout avviato');
  }

  function checkoutEnd(outcome, detail) {
    outcome = outcome || 'success';
    detail  = detail  || '';
    if (!_checkoutStartTime) return;
    var duration = Date.now() - _checkoutStartTime;
    _checkoutStartTime = null;
    log('Checkout', outcome, duration + 'ms');
    sendMetric('checkout_' + outcome, duration, {
      page:   window.location.pathname,
      detail: detail || undefined,
    });
  }


  /* ══════════════════════════════════════════════════════════════
     4. MONITORAGGIO i18n (ex v1)
  ══════════════════════════════════════════════════════════════ */
  function i18nReady(ok, lang) {
    if (ok === undefined) ok = true;
    lang = lang || '';
    if (!ok) {
      sendError('i18n: init fallito', 'i18n-custom');
    } else {
      sendMetric('i18n_load', 1, {
        lang: lang || navigator.language || 'unknown',
        page: window.location.pathname,
      });
    }
    log('i18n pronto:', ok, lang);
  }


  /* ══════════════════════════════════════════════════════════════
     5. MONITORAGGIO EXCHANGE RATES (ex v1)
  ══════════════════════════════════════════════════════════════ */
  function exchangeRatesFetched(ok, rates) {
    if (ok === undefined) ok = true;
    rates = rates || {};
    if (!ok) {
      sendError('Exchange rates fetch fallito', 'ExchangeRates');
    } else {
      sendMetric('exchange_rates_ok', 1, {
        usd: rates.USD || null,
        gbp: rates.GBP || null,
      });
    }
    log('Exchange rates:', ok, rates);
  }


  /* ══════════════════════════════════════════════════════════════
     6. FETCH WITH RETRY (ex v1)
     Usa _originalFetch per bypassare il timeout globale e avere
     il pieno controllo sui tentativi.
  ══════════════════════════════════════════════════════════════ */
  function fetchWithRetry(url, options, maxRetries) {
    options    = options    || {};
    maxRetries = maxRetries || 3;
    var start   = Date.now();
    var fetchFn = window._originalFetch;
    var attempt = 0;

    function tryOnce() {
      attempt++;
      return fetchFn(url, options).then(function (response) {
        var elapsed = Date.now() - start;
        if (!response.ok) throw new Error('HTTP ' + response.status);
        if (attempt > 1) sendMetric('fetch_retry_success', attempt, { url: url, elapsed: elapsed });
        if (elapsed > 5000) sendMetric('fetch_slow', elapsed, { url: url });
        return response;
      }).catch(function (err) {
        log('Tentativo', attempt + '/' + maxRetries, 'fallito:', err.message);
        if (attempt < maxRetries) {
          return new Promise(function (resolve) {
            setTimeout(resolve, 1200 * attempt);
          }).then(tryOnce);
        }
        sendError('fetchWithRetry esaurito: ' + err.message, url);
        throw err;
      });
    }

    return tryOnce();
  }


  /* ══════════════════════════════════════════════════════════════
     7. PRECONNECT A STRIPE (ex v1)
  ══════════════════════════════════════════════════════════════ */
  function addPreconnectIfMissing(origin) {
    if (document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) return;
    var link       = document.createElement('link');
    link.rel       = 'preconnect';
    link.href      = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    log('Preconnect aggiunto:', origin);
  }

  addPreconnectIfMissing('https://js.stripe.com');
  addPreconnectIfMissing('https://checkout.stripe.com');


  /* ══════════════════════════════════════════════════════════════
     SEND HELPERS — comunicazione backend monitoring (ex v1)
     Usano _originalFetch: bypassano timeout globale e contatore
     fetch attive, così non interferiscono con BFCache handler.
  ══════════════════════════════════════════════════════════════ */
  function sendToGuard(payload) {
    try {
      var body = JSON.stringify(payload);
      window._originalFetch(SITEGUARD_URL, {
        method:  'POST',
        body:    body,
        mode:    'no-cors',
        headers: { 'Content-Type': 'text/plain' },
      }).catch(function () {});
      log('Inviato:', payload.action, payload.name || payload.message || '');
    } catch (_) {
      /* Mai bloccare il sito per colpa del monitoring */
    }
  }

  function sendMetric(name, value, meta) {
    sendToGuard({ action: 'metric', name: name, value: value, meta: meta || {} });
  }

  function sendError(message, source, stack) {
    sendToGuard({ action: 'error', message: message, source: source || '', stack: stack || '' });
  }


  /* ══════════════════════════════════════════════════════════════
     API PUBBLICA → window.SiteGuard
  ══════════════════════════════════════════════════════════════ */
  window.SiteGuard = {
    /* Monitoring */
    checkoutStart:        checkoutStart,
    checkoutEnd:          checkoutEnd,
    i18nReady:            i18nReady,
    exchangeRatesFetched: exchangeRatesFetched,
    fetchWithRetry:       fetchWithRetry,
    sendMetric:           sendMetric,
    sendError:            sendError,
  };

  log('✅ SiteGuard v3 (unified) attivo su:', window.location.pathname);

})();
