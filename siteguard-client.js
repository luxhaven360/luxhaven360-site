/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  siteguard-client.js — LuxHaven360                              ║
 * ║  v4 — Sistema di monitoring + stabilizzazione unificato        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  PREREQUISITO: bfcache-guard.js deve essere caricato PRIMA.    ║
 * ║  bfcache-guard inizializza LuxFetchBus e _originalFetch.       ║
 * ║                                                                  ║
 * ║  COSA FA:                                                        ║
 * ║  A. Timeout GAS (20s) + emit eventi su LuxFetchBus             ║
 * ║     → connection-monitor ascolta gli eventi invece di          ║
 * ║       wrappare fetch (fix del bug di doppio-wrapping v3)       ║
 * ║  B. BFCache handler (pageshow persisted) → rilascia blocchi    ║
 * ║  C. visibilitychange → chiude spinner su back-navigation       ║
 * ║  D. GAS warm-up al primo idle → riduce cold start              ║
 * ║  E. Safety timer 12s → sblocca body nascosto                   ║
 * ║  1. Cattura errori JS globali + Promise rejection              ║
 * ║     AbortError FILTRATO (è comportamento atteso)               ║
 * ║  2. Performance pagina (pageLoad, TTFB, domReady)              ║
 * ║  3. Monitoraggio checkout GAS                                   ║
 * ║  4. Monitoraggio sistema i18n personalizzato                    ║
 * ║  5. Monitoraggio Exchange Rates                                 ║
 * ║  6. fetchWithRetry (3 tentativi, backoff progressivo)          ║
 * ║  7. Preconnect automatico a Stripe                              ║
 * ║                                                                  ║
 * ║  NOVITÀ v4 rispetto a v3:                                       ║
 * ║  - Non inizializza LuxFetchBus (spostato in bfcache-guard)     ║
 * ║  - Non wrappa window.fetch (già fatto da bfcache-guard)        ║
 * ║  - Aggiunge emit eventi GAS su LuxFetchBus per connection-mon  ║
 * ║  - AbortError filtrato ovunque (unhandledrejection + monitoring)║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  /* ── Singleton guard ─────────────────────────────────────────── */
  if (window.__SiteGuardLoaded) return;
  window.__SiteGuardLoaded = true;

  /* ── Configurazione ──────────────────────────────────────────── */
  var DEBUG = false;

  /* URL monitoring backend */
  var SITEGUARD_URL = 'https://script.google.com/macros/s/AKfycbyLT41A8PPuQwyjCHkFA6anJhp-ywVJhy7TlMpxydaw3osPuplcsfafiNANA3s1hzk7/exec';

  /* URL GAS warm-up */
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

  /* ── Helper: safe access a LuxFetchBus ──────────────────────── */
  function _emit(event, data) {
    try {
      if (window.LuxFetchBus) window.LuxFetchBus.emit(event, data);
    } catch (e) {}
  }

  /* ── Traccia fetch attive per BFCache handler ────────────────── */
  var _activeFetches  = 0;
  var _lastFetchStart = 0;

  /* ══════════════════════════════════════════════════════════════
     NOTA: window.fetch NON viene wrappato qui.
     Il wrapping GAS (timeout 20s + AbortController) è già fatto
     da bfcache-guard.js che si carica PRIMA.
     Questo evita il triple-wrapping che causava loop in v3.

     Aggiungiamo solo un layer contatore + emit LuxFetchBus sopra
     la fetch già wrappata da bfcache-guard.
  ══════════════════════════════════════════════════════════════ */
  if (!window._sgFetchPatched && typeof window.fetch === 'function') {
    var _prevFetch = window.fetch;

    window.fetch = function (input, init) {
      _activeFetches++;
      _lastFetchStart = Date.now();

      var url = typeof input === 'string' ? input
              : (input && input.url) ? input.url : '';
      var isGAS = url.indexOf('script.google.com') !== -1;
      var t0    = Date.now();

      return _prevFetch(input, init)
        .then(function (response) {
          _activeFetches = Math.max(0, _activeFetches - 1);
          var elapsed = Date.now() - t0;
          if (isGAS) {
            if (elapsed > 5000) {
              _emit('gas:slow', { url: url, elapsed: elapsed });
              sendMetric('fetch_slow', elapsed, { url: url });
            } else {
              _emit('gas:success', { url: url, elapsed: elapsed });
            }
          }
          return response;
        })
        .catch(function (err) {
          _activeFetches = Math.max(0, _activeFetches - 1);
          /* Non emette eventi per AbortError — sono attesi (timeout GAS, pagehide) */
          if (err.name !== 'AbortError') {
            if (isGAS) {
              _emit('gas:error', { url: url, error: err });
              sendError('GAS fetch error: ' + err.message, url);
            } else {
              _emit('net:error', { url: url, error: err });
            }
          }
          throw err;
        });
    };

    window._sgFetchPatched = true;
  }


  /* ══════════════════════════════════════════════════════════════
     B. BFCACHE HANDLER — pageshow con persisted=true
     Nota: bfcache-guard gestisce già l'abort delle fetch GAS.
     Qui gestiamo solo il ripristino della UI (loader, spinner).
  ══════════════════════════════════════════════════════════════ */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    _activeFetches = 0;
    _closeAllLoadingUI();
  });


  /* ══════════════════════════════════════════════════════════════
     C. VISIBILITYCHANGE — back-navigation mobile
  ══════════════════════════════════════════════════════════════ */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    _closeAllLoadingUI();
  });


  /* ══════════════════════════════════════════════════════════════
     D. GAS WARM-UP — riduce cold start
     Usa _originalFetch (fetch nativa) per non passare attraverso
     i wrapper applicativi e non inquinare i contatori.
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
     E. SAFETY TIMER — sblocca body dopo 12s
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
     HELPER: chiude tutti i loading UI noti del sito
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
    } catch (err) {}
  }


  /* ══════════════════════════════════════════════════════════════
     1. CATTURA ERRORI JS GLOBALI
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
    var reason = event.reason;
    if (!reason) return;

    /* AbortError è SEMPRE atteso (timeout GAS, pagehide, navigazione) — ignora */
    if (reason.name === 'AbortError') return;

    var msg = reason instanceof Error ? reason.message : String(reason);

    /* Errori di rete transitori — ignorati (gestiti da connection-monitor) */
    if (msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('aborted')) return;

    sendError('Unhandled Promise: ' + msg, 'promise');
  });


  /* ══════════════════════════════════════════════════════════════
     2. PERFORMANCE PAGINA
  ══════════════════════════════════════════════════════════════ */
  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        var nav = performance.getEntriesByType('navigation')[0];
        if (!nav) return;
        var metrics = {
          pageLoadMs: Math.round(nav.loadEventEnd - nav.startTime),
          ttfbMs:     Math.round(nav.responseStart - nav.requestStart),
          domReadyMs: Math.round(nav.domContentLoadedEventEnd - nav.responseEnd),
          page:       window.location.pathname,
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
     3. MONITORAGGIO CHECKOUT GAS
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
     4. MONITORAGGIO i18n
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
     5. MONITORAGGIO EXCHANGE RATES
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
     6. FETCH WITH RETRY
     Usa _originalFetch (fetch nativa) per avere pieno controllo
     sui tentativi, senza passare per i wrapper applicativi.
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
        /* Non riprova su AbortError — è intenzionale */
        if (err.name === 'AbortError') throw err;
        log('Tentativo', attempt + '/' + maxRetries, 'fallito:', err.message);
        if (attempt < maxRetries) {
          var delay = [4000, 8000, 15000][attempt - 1] || 15000;
          return new Promise(function (resolve) {
            setTimeout(resolve, delay);
          }).then(tryOnce);
        }
        sendError('fetchWithRetry esaurito: ' + err.message, url);
        throw err;
      });
    }

    return tryOnce();
  }


  /* ══════════════════════════════════════════════════════════════
     7. PRECONNECT A STRIPE
  ══════════════════════════════════════════════════════════════ */
  function addPreconnectIfMissing(origin) {
    if (document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    log('Preconnect aggiunto:', origin);
  }

  addPreconnectIfMissing('https://js.stripe.com');
  addPreconnectIfMissing('https://checkout.stripe.com');


  /* ══════════════════════════════════════════════════════════════
     SEND HELPERS — comunicazione backend monitoring
     Usano _originalFetch (fetch nativa) per non attivare i wrapper
     applicativi e non interferire con BFCache handler.
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
    } catch (_) {}
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
    checkoutStart:        checkoutStart,
    checkoutEnd:          checkoutEnd,
    i18nReady:            i18nReady,
    exchangeRatesFetched: exchangeRatesFetched,
    fetchWithRetry:       fetchWithRetry,
    sendMetric:           sendMetric,
    sendError:            sendError,
  };

  log('✅ SiteGuard v4 attivo su:', window.location.pathname);

})();
