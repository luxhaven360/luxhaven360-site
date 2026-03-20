/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  siteguard-client.js — LuxHaven360                              ║
 * ║  v3.1 — Stabilità definitiva AbortError + timeout GAS          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  CHANGELOG v3.1 rispetto a v3.0:                                ║
 * ║                                                                  ║
 * ║  ✅ FIX 1 — FETCH_TIMEOUT_MS: 8000 → 15000                     ║
 * ║     GAS cold start può richiedere 10-25s. Con 8s il timeout     ║
 * ║     scattava quasi sempre al primo tentativo su server freddo,   ║
 * ║     causando AbortError + 3 retry inutili. 15s dà margine       ║
 * ║     sufficiente anche al cold start più lento.                   ║
 * ║                                                                  ║
 * ║  ✅ FIX 2 — abort() con TimeoutError reason                     ║
 * ║     Il setTimeout del wrap A ora chiama:                         ║
 * ║       controller.abort(new DOMException('GAS timeout','TimeoutError'))
 * ║     Questo permette a __lhIsNavAbort() di riconoscere il caso   ║
 * ║     e ai catch() di ignorarlo senza mostrare overlay errore.    ║
 * ║                                                                  ║
 * ║  ✅ FIX 3 — unhandledrejection: filtra AbortError               ║
 * ║     Le Promise rejection di tipo AbortError erano inviate al     ║
 * ║     monitoring backend come errori applicativi. Ora vengono      ║
 * ║     silenziosamente ignorate (sono da navigazione o timeout).   ║
 * ║                                                                  ║
 * ║  ✅ FIX 4 — fetchWithRetry: no retry su AbortError              ║
 * ║     Un abort da navigazione non deve essere rip rovato: la       ║
 * ║     pagina sta per essere congelata. Il retry veniva eseguito    ║
 * ║     nella pagina BFCache-restored, causando fetch "zombie".     ║
 * ║                                                                  ║
 * ║  ✅ FIX 5 — warmupGAS usa _nativeFetch (fetch vera)             ║
 * ║     Le chiamate di warm-up ora usano _nativeFetch (set da        ║
 * ║     bfcache-guard prima di qualsiasi wrapping). Questo evita    ║
 * ║     che i warm-up vengano registrati in _controllers e           ║
 * ║     abortiti su pagehide, generando AbortError spurî.           ║
 * ║                                                                  ║
 * ║  ✅ FIX 6 — sendToGuard usa _nativeFetch                        ║
 * ║     Il monitoring backend ora usa anch'esso la fetch nativa      ║
 * ║     per non interferire mai con il sistema di abort/retry.       ║
 * ║                                                                  ║
 * ║  INVARIATO da v3.0:                                              ║
 * ║   A. BFCache handler (pageshow persisted)                        ║
 * ║   B. visibilitychange → chiude spinner                           ║
 * ║   C. Safety timer 12s → sblocca body nascosto                   ║
 * ║   D. Monitoring checkout GAS, i18n, exchange rates              ║
 * ║   E. Preconnect Stripe                                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  /* ── Singleton guard ─────────────────────────────────────────── */
  if (window.__SiteGuardLoaded) return;
  window.__SiteGuardLoaded = true;

  /* ── Configurazione ──────────────────────────────────────────── */
  /*
   * ✅ FIX 1: 15000ms invece di 8000ms.
   * GAS cold start tipico: 10-25s. 8s causava timeout sistematici
   * al primo accesso dopo un periodo di inattività del server.
   */
  var FETCH_TIMEOUT_MS = 15000;
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

  /* ══════════════════════════════════════════════════════════════
     STEP 0 — Riferimenti fetch
     ──────────────────────────────────────────────────────────────
     _nativeFetch : la fetch vera del browser (salvata da bfcache-guard
                    PRIMA di qualsiasi wrapping). Usata per warmup e
                    monitoring, non ha AbortController né contatori.

     _originalFetch: compat con v3.0. Se bfcache-guard ha già wrappato
                     fetch, _originalFetch punta al suo wrapper.
                     Usato da fetchWithRetry (ha già il suo signal).
  ══════════════════════════════════════════════════════════════ */
  /* ✅ FIX 5+6: usa _nativeFetch se disponibile (set da bfcache-guard) */
  var _trueFetch = window._nativeFetch || window.fetch;

  /* Salva riferimento alla fetch corrente per compatibilità */
  window._originalFetch = window.fetch.bind(window);


  /* ══════════════════════════════════════════════════════════════
     A. FETCH INTERCEPTOR — timeout globale
     ──────────────────────────────────────────────────────────────
     Aggiunge AbortController con timeout di 15s a ogni fetch
     che non ha già un signal esplicito.
  ══════════════════════════════════════════════════════════════ */
  if (typeof window.fetch === 'function' && !window._sgFetchPatched) {
    var _baseFetch = window._originalFetch;

    window.fetch = function (input, init) {
      /* Fetch con signal esplicito: passa invariato */
      if (init && init.signal) {
        return _baseFetch(input, init);
      }

      var controller = new AbortController();

      /*
       * ✅ FIX 2: abort() con DOMException(name='TimeoutError').
       * __lhIsNavAbort() riconosce TimeoutError e i catch() possono
       * ignorarlo silenziosamente invece di mostrare l'overlay errore.
       */
      var timeoutId = setTimeout(function () {
        controller.abort(
          new DOMException('lh360:siteguard-timeout-' + FETCH_TIMEOUT_MS + 'ms', 'TimeoutError')
        );
      }, FETCH_TIMEOUT_MS);

      /* Registra con bfcache-guard per abort su pagehide */
      if (window.__lhReg) window.__lhReg(controller);

      var mergedInit = Object.assign({}, init || {}, { signal: controller.signal });

      return _baseFetch(input, mergedInit).finally(function () {
        clearTimeout(timeoutId);
        if (window.__lhUnreg) window.__lhUnreg(controller);
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
      /* Non contare fetch durante pagehide (pagina in chiusura) */
      if (!window.__lhPageHiding) {
        _activeFetches++;
        _lastFetchStart = Date.now();
      }
      return _timedFetch(input, init).finally(function () {
        _activeFetches = Math.max(0, _activeFetches - 1);
      });
    };
  }


  /* ══════════════════════════════════════════════════════════════
     B. BFCACHE HANDLER — pageshow persisted=true
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
     ──────────────────────────────────────────────────────────────
     ✅ FIX 5: usa _trueFetch (fetch vera, senza wrapper).
     Le chiamate warm-up non vengono registrate in _controllers
     e non generano AbortError su pagehide.
  ══════════════════════════════════════════════════════════════ */
  function warmupGAS() {
    GAS_WARMUP_URLS.forEach(function (url) {
      _trueFetch(url, { method: 'GET', cache: 'no-store', keepalive: false })
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

    /*
     * ✅ FIX 3: filtra AbortError e TimeoutError.
     * Questi provengono da navigazione (bfcache-guard pagehide)
     * o da timeout interno (wrap A) — NON sono errori applicativi.
     * Non vanno inviati al monitoring né mostrati all'utente.
     */
    var name = reason.name || '';
    if (name === 'AbortError' || name === 'TimeoutError') return;

    var msg = (reason.message || '').toLowerCase();
    if (msg.includes('failed to fetch') ||
        msg.includes('networkerror')    ||
        msg.includes('connection')) return;

    sendError('Unhandled Promise: ' + (reason.message || String(reason)), 'promise');
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
     ──────────────────────────────────────────────────────────────
     ✅ FIX 4: non riprovare mai su AbortError o TimeoutError.
     Se la richiesta è abortita da navigazione, riprovare è
     inutile (la pagina sta per essere congelata) e genera
     fetch "zombie" nella pagina BFCache-restored.
  ══════════════════════════════════════════════════════════════ */
  function fetchWithRetry(url, options, maxRetries) {
    options    = options    || {};
    maxRetries = maxRetries || 3;
    var start   = Date.now();
    /* Usa _trueFetch: bypass completo dei wrapper, controllo totale */
    var fetchFn = _trueFetch;
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
        /*
         * ✅ FIX 4: AbortError e TimeoutError NON vengono rip rovati.
         * Sono abort intenzionali (navigazione o timeout); propagare
         * l'errore permette al chiamante di gestirlo con __lhIsNavAbort().
         */
        var errName = (err && err.name) || '';
        if (errName === 'AbortError' || errName === 'TimeoutError') {
          log('fetchWithRetry: abort/timeout, no retry —', errName);
          throw err;
        }

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
     7. PRECONNECT A STRIPE
  ══════════════════════════════════════════════════════════════ */
  function addPreconnectIfMissing(origin) {
    if (document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) return;
    var link        = document.createElement('link');
    link.rel        = 'preconnect';
    link.href       = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    log('Preconnect aggiunto:', origin);
  }

  addPreconnectIfMissing('https://js.stripe.com');
  addPreconnectIfMissing('https://checkout.stripe.com');


  /* ══════════════════════════════════════════════════════════════
     SEND HELPERS — comunicazione backend monitoring
     ──────────────────────────────────────────────────────────────
     ✅ FIX 6: usa _trueFetch (fetch vera, no wrapper).
     Le chiamate di monitoring non vengono registrate in _controllers,
     non generano AbortError su pagehide e non interferiscono con
     il sistema di retry/timeout delle fetch applicative.
  ══════════════════════════════════════════════════════════════ */
  function sendToGuard(payload) {
    try {
      var body = JSON.stringify(payload);
      _trueFetch(SITEGUARD_URL, {
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

  log('✅ SiteGuard v3.1 attivo su:', window.location.pathname);

})();
