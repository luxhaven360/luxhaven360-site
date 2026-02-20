/**
 * ============================================================
 *  siteguard-client.js — LuxHaven360
 *  Monitoring & Stabilizzazione Frontend
 * ============================================================
 *
 *  COMPATIBILITÀ VERIFICATA CON:
 *   ✅ Sistema i18n personalizzato (window.i18n / window.i18nPDP)
 *   ✅ connection-monitor.js (nessun conflitto: non rewrappa window.fetch)
 *   ✅ Checkout via GAS (nessuna dipendenza da Stripe.js frontend)
 *   ✅ ExchangeRates via Frankfurter API
 *   ✅ GitHub Pages (no server-side)
 *
 *  COME INCLUDERLO:
 *  Aggiungi in CIMA all'<head> di ogni pagina HTML,
 *  come PRIMO script, prima di tutto il resto:
 *
 *    <head>
 *      <script src="./siteguard-client.js"></script>   ← index.html (root)
 *      <script src="../siteguard-client.js"></script>  ← product-details/*.html
 *
 *  NON modifica alcuna logica esistente.
 *  Se rimosso, il sito funziona identicamente a prima.
 *
 * ============================================================
 */

(function () {
  "use strict";

  const SITEGUARD_URL = "https://script.google.com/macros/s/AKfycbyLT41A8PPuQwyjCHkFA6anJhp-ywVJhy7TlMpxydaw3osPuplcsfafiNANA3s1hzk7/exec";

  const DEBUG = false;

  if (window.__SiteGuardLoaded) return;
  window.__SiteGuardLoaded = true;

  function log(...args) {
    if (DEBUG) console.log("[SiteGuard]", ...args);
  }

  /**
   * Invia payload al backend SiteGuard in modo silenzioso e non bloccante.
   *
   * FIX CORS: Google Apps Script non restituisce l'header
   * Access-Control-Allow-Origin in risposta al preflight OPTIONS.
   * sendBeacon con application/json e fetch con application/json
   * scatenano entrambi il preflight → blocco CORS.
   *
   * Soluzione: fetch con mode "no-cors" + Content-Type "text/plain".
   * Le richieste "semplici" non generano preflight → nessun blocco.
   * Il GAS legge il corpo tramite e.postData.contents + JSON.parse.
   */
  function sendToGuard(payload) {
    try {
      const body = JSON.stringify(payload);
      const fetchFn = window._originalFetch || window.fetch;
      fetchFn(SITEGUARD_URL, {
        method: "POST",
        body,
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
      }).catch(() => {});
      log("Inviato:", payload.action, payload.name || payload.message || "");
    } catch (_) {
      // Mai bloccare il sito per colpa del monitoring
    }
  }

  function sendMetric(name, value, meta = {}) {
    sendToGuard({ action: "metric", name, value, meta });
  }

  function sendError(message, source = "", stack = "") {
    sendToGuard({ action: "error", message, source, stack });
  }

  // ─────────────────────────────────────────────────────────
  //  1. CATTURA ERRORI JAVASCRIPT GLOBALI
  // ─────────────────────────────────────────────────────────

  window.addEventListener("error", function (event) {
    if (!event.filename || event.filename.includes("extension://")) return;
    if (event.target && event.target !== window) return;
    sendError(
      event.message,
      event.filename + ":" + event.lineno,
      event.error ? event.error.stack : ""
    );
  });

  window.addEventListener("unhandledrejection", function (event) {
    const msg =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason || "Unhandled rejection");
    if (msg.toLowerCase().includes("network") ||
        msg.toLowerCase().includes("failed to fetch")) return;
    sendError("Unhandled Promise: " + msg, "promise");
  });

  // ─────────────────────────────────────────────────────────
  //  2. PERFORMANCE PAGINA
  // ─────────────────────────────────────────────────────────

  window.addEventListener("load", function () {
    setTimeout(function () {
      try {
        const nav = performance.getEntriesByType("navigation")[0];
        if (!nav) return;
        const metrics = {
          pageLoadMs: Math.round(nav.loadEventEnd - nav.startTime),
          ttfbMs: Math.round(nav.responseStart - nav.requestStart),
          domReadyMs: Math.round(nav.domContentLoadedEventEnd - nav.responseEnd),
          page: window.location.pathname,
        };
        log("Performance:", metrics);
        sendMetric("page_load", metrics.pageLoadMs, metrics);
        if (metrics.pageLoadMs > 8000) {
          sendMetric("page_load_slow", metrics.pageLoadMs, {
            page: metrics.page,
            ttfb: metrics.ttfbMs
          });
        }
      } catch (_) {}
    }, 500);
  });

  // ─────────────────────────────────────────────────────────
  //  3. MONITORAGGIO CHECKOUT GAS
  // ─────────────────────────────────────────────────────────

  let _checkoutStartTime = null;

  function checkoutStart() {
    _checkoutStartTime = Date.now();
    log("Checkout avviato");
  }

  function checkoutEnd(outcome = "success", detail = "") {
    if (!_checkoutStartTime) return;
    const duration = Date.now() - _checkoutStartTime;
    _checkoutStartTime = null;
    log("Checkout", outcome, duration + "ms");
    sendMetric("checkout_" + outcome, duration, {
      page: window.location.pathname,
      detail: detail || undefined,
    });
  }

  // ─────────────────────────────────────────────────────────
  //  4. MONITORAGGIO SISTEMA i18n PERSONALIZZATO
  // ─────────────────────────────────────────────────────────

  function i18nReady(ok = true, lang = "") {
    if (!ok) {
      sendError("i18n: init fallito", "i18n-custom");
    } else {
      sendMetric("i18n_load", 1, {
        lang: lang || navigator.language || "unknown",
        page: window.location.pathname,
      });
    }
    log("i18n pronto:", ok, lang);
  }

  // ─────────────────────────────────────────────────────────
  //  5. MONITORAGGIO EXCHANGE RATES
  // ─────────────────────────────────────────────────────────

  function exchangeRatesFetched(ok = true, rates = {}) {
    if (!ok) {
      sendError("Exchange rates fetch fallito", "ExchangeRates");
    } else {
      sendMetric("exchange_rates_ok", 1, {
        usd: rates.USD || null,
        gbp: rates.GBP || null,
      });
    }
    log("Exchange rates:", ok, rates);
  }

  // ─────────────────────────────────────────────────────────
  //  6. FETCH CON RETRY
  // ─────────────────────────────────────────────────────────

  async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    const start = Date.now();
    const fetchFn = window._originalFetch || window.fetch;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetchFn(url, options);
        const elapsed = Date.now() - start;
        if (!response.ok) throw new Error("HTTP " + response.status);
        if (attempt > 1) sendMetric("fetch_retry_success", attempt, { url, elapsed });
        if (elapsed > 5000) sendMetric("fetch_slow", elapsed, { url });
        return response;
      } catch (err) {
        log("Tentativo", attempt + "/" + maxRetries, "fallito:", err.message);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1200 * attempt));
        } else {
          sendError("fetchWithRetry esaurito: " + err.message, url);
          throw err;
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  //  7. PRECONNECT A STRIPE
  // ─────────────────────────────────────────────────────────

  function addPreconnectIfMissing(origin) {
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    log("Preconnect aggiunto:", origin);
  }

  addPreconnectIfMissing("https://js.stripe.com");
  addPreconnectIfMissing("https://checkout.stripe.com");

  // ─────────────────────────────────────────────────────────
  //  API PUBBLICA → window.SiteGuard
  // ─────────────────────────────────────────────────────────

  window.SiteGuard = {
    checkoutStart,
    checkoutEnd,
    i18nReady,
    exchangeRatesFetched,
    fetchWithRetry,
    sendMetric,
    sendError,
  };

  log("✅ SiteGuard attivo su:", window.location.pathname);

})();
