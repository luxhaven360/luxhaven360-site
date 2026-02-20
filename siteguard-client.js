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
 *      <script src="/siteguard-client.js"></script>    ← index.html (root)
 *      <script src="../siteguard-client.js"></script>  ← product-details/*.html
 *
 *  NON modifica alcuna logica esistente.
 *  Se rimosso, il sito funziona identicamente a prima.
 *
 * ============================================================
 */

(function () {
  "use strict";

  // ─────────────────────────────────────────────────────────
  //  CONFIGURAZIONE — sostituisci con il tuo URL SiteGuard
  // ─────────────────────────────────────────────────────────

  /**
   * URL della Web App SiteGuard.gs (il progetto GAS separato).
   * NON è lo stesso URL del tuo backend principale (Code.gs).
   * Lo trovi in: Apps Script → Distribuisci → Gestisci distribuzioni
   */
  const SITEGUARD_URL = "https://script.google.com/macros/s/AKfycbyLT41A8PPuQwyjCHkFA6anJhp-ywVJhy7TlMpxydaw3osPuplcsfafiNANA3s1hzk7/exec";

  // true = log in console durante sviluppo; false = silenzioso in produzione
  const DEBUG = false;

  // ─────────────────────────────────────────────────────────
  //  GUARDIA: evita doppia inizializzazione
  // ─────────────────────────────────────────────────────────
  if (window.__SiteGuardLoaded) return;
  window.__SiteGuardLoaded = true;

  // ─────────────────────────────────────────────────────────
  //  UTILITÀ INTERNE
  // ─────────────────────────────────────────────────────────

  function log(...args) {
    if (DEBUG) console.log("[SiteGuard]", ...args);
  }

  /**
   * Invia payload al backend SiteGuard in modo silenzioso e non bloccante.
   * Usa sendBeacon (fire-and-forget, sopravvive al navigare via pagina)
   * con fallback a fetch keepalive.
   * Non lancia MAI eccezioni: se il monitor va giù, il sito non ne risente.
   */
  function sendToGuard(payload) {
    try {
      const body = JSON.stringify(payload);
      const sent = navigator.sendBeacon
        ? navigator.sendBeacon(SITEGUARD_URL, new Blob([body], { type: "application/json" }))
        : false;

      if (!sent) {
        // Usa il fetch originale (pre-monkeypatch di connection-monitor.js)
        // per evitare di far scattare la sua logica di retry/alert
        const fetchFn = window._originalFetch || window.fetch;
        fetchFn(SITEGUARD_URL, {
          method: "POST",
          body,
          keepalive: true,
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
      }
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
  //
  //  connection-monitor.js intercetta errori di RETE (fetch falliti).
  //  Qui catturiamo gli errori JavaScript applicativi
  //  (TypeError, ReferenceError, errori nel codice) che il
  //  connection-monitor non vede.
  // ─────────────────────────────────────────────────────────

  window.addEventListener("error", function (event) {
    // Ignora errori da estensioni browser
    if (!event.filename || event.filename.includes("extension://")) return;
    // Ignora errori di risorse (immagini non trovate, script 404)
    if (event.target && event.target !== window) return;

    sendError(
      event.message,
      event.filename + ":" + event.lineno,
      event.error ? event.error.stack : ""
    );
  });

  // Cattura Promise non gestite (es. async senza .catch())
  // NOTA: connection-monitor.js non gestisce questo caso
  window.addEventListener("unhandledrejection", function (event) {
    const msg =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason || "Unhandled rejection");

    // Filtra errori di rete già gestiti da connection-monitor.js
    if (msg.toLowerCase().includes("network") ||
        msg.toLowerCase().includes("failed to fetch")) return;

    sendError("Unhandled Promise: " + msg, "promise");
  });

  // ─────────────────────────────────────────────────────────
  //  2. PERFORMANCE PAGINA
  //
  //  Misura TTFB e tempo totale di caricamento.
  //  Dati visibili nel foglio SiteGuard Log su Google Sheets.
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
  //
  //  Il checkout di LuxHaven360 NON usa Stripe.js direttamente
  //  nel frontend. Il frontend fa una fetch al GAS (Code.gs)
  //  con action=create_checkout_session, e il GAS crea la
  //  sessione Stripe e restituisce l'URL di redirect.
  //
  //  Da aggiungere nel tuo __script.js / pdp-products.html:
  //   window.SiteGuard.checkoutStart()  → prima della fetch a GAS
  //   window.SiteGuard.checkoutEnd("success") → su success.html
  //   window.SiteGuard.checkoutEnd("error", msg) → se fetch fallisce
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
  //
  //  Il sito usa un sistema i18n custom (NON i18next).
  //  Esponiamo window.SiteGuard.i18nReady(ok, lang).
  //  Vedere sezione "Dove aggiungere" per i punti esatti.
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
  //  5. MONITORAGGIO EXCHANGE RATES (Frankfurter API via GAS)
  //
  //  Quando il tuo JS carica i tassi dal GAS (action=get_exchange_rates),
  //  chiama window.SiteGuard.exchangeRatesFetched(ok, rates)
  //  per loggare se i tassi sono stati caricati o se il GAS
  //  stava usando i valori di fallback hardcoded.
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
  //  6. FETCH CON RETRY per chiamate critiche al backend GAS
  //
  //  IMPORTANTE: NON rewrappa window.fetch globalmente.
  //  Lo fa già connection-monitor.js e un secondo wrap
  //  causerebbe conflitti e doppio conteggio degli errori.
  //
  //  Questo è un wrapper ESPLICITO da usare SOLO dove vuoi
  //  retry automatici per chiamate critiche.
  //
  //  Es. in tracking-order.html:
  //    const res = await window.SiteGuard.fetchWithRetry(
  //      GAS_URL + "?action=get_orders&email=" + email
  //    );
  // ─────────────────────────────────────────────────────────

  async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    const start = Date.now();
    const fetchFn = window._originalFetch || window.fetch;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetchFn(url, options);
        const elapsed = Date.now() - start;

        if (!response.ok) throw new Error("HTTP " + response.status);

        if (attempt > 1) {
          sendMetric("fetch_retry_success", attempt, { url, elapsed });
        }
        if (elapsed > 5000) {
          sendMetric("fetch_slow", elapsed, { url });
        }
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
  //  7. PRECONNECT A STRIPE (riduce latenza checkout)
  //
  //  Aggiunge <link rel="preconnect"> a Stripe se non già
  //  presente nell'HTML, così quando l'utente preme
  //  "Paga" e il GAS restituisce l'URL Stripe, il browser
  //  ha già la connessione aperta.
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
    /** Chiama PRIMA della fetch GAS per creare sessione Stripe */
    checkoutStart,
    /** Chiama DOPO redirect o errore ("success" | "error" | "cancelled") */
    checkoutEnd,
    /** Chiama dopo init del sistema i18n personalizzato */
    i18nReady,
    /** Chiama quando ricevi i tassi di cambio dal GAS */
    exchangeRatesFetched,
    /** fetch con retry sicuro (non interferisce con connection-monitor) */
    fetchWithRetry,
    /** Invia metrica custom al log su Sheets */
    sendMetric,
    /** Segnala errore custom al log su Sheets */
    sendError,
  };

  log("✅ SiteGuard attivo su:", window.location.pathname);

})();
