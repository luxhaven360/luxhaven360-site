/**
 * ════════════════════════════════════════════════════════════════════
 *  LuxHaven360 — lux-resilience.js  v1.0
 *  Sistema centralizzato di resilienza: retry intelligente,
 *  circuit breaker, toast notifications, health monitoring GAS.
 * ════════════════════════════════════════════════════════════════════
 *
 *  PREREQUISITI (nell'ordine):
 *    1. bfcache-guard.js   → inizializza LuxFetchBus + _originalFetch
 *    2. siteguard-client.js → emette eventi su LuxFetchBus
 *    3. lux-resilience.js  ← questo file
 *
 *  API PUBBLICA:
 *    window.LuxRetry   — fetch con retry + backoff + circuit breaker
 *    window.LuxToast   — toast notifications non-bloccanti
 *    window.LuxGAS     — health monitoring Google Apps Script
 *
 *  PERCHÉ QUESTO FILE:
 *    Le logiche di retry erano duplicate in script.js, pdp-products,
 *    booking.html, cart.html, showcase.html con parametri inconsistenti.
 *    lux-resilience centralizza tutto in un unico modulo riutilizzabile
 *    da qualsiasi pagina o script del sito.
 * ════════════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';

  if (global.__LuxResilienceLoaded) return;
  global.__LuxResilienceLoaded = true;

  /* ── Configurazione globale ──────────────────────────────────── */
  var CFG = {
    RETRY_DELAYS:      [4000, 8000, 15000], // ms tra tentativi
    CB_THRESHOLD:      3,                   // circuit breaker: apre dopo N errori
    CB_RESET_MS:       30000,               // circuit breaker: si chiude dopo 30s
    TOAST_DEFAULT_MS:  5000,                // auto-dismiss toast
    GAS_PROBE_MS:      60000,               // health probe GAS ogni 60s
  };

  /* ════════════════════════════════════════════════════════════
     LuxToast — Notifiche non-bloccanti (toast)
     Visibili in basso a destra, auto-dismiss, click per chiudere.
     Non interferisce con la navigazione o il contenuto della pagina.
  ════════════════════════════════════════════════════════════ */

  var _TOAST_I18N = {
    it: { retrying: 'Nuovo tentativo...', gasDown: 'Servizi temporaneamente non raggiungibili', gasRestored: 'Servizi ripristinati ✓' },
    en: { retrying: 'Retrying…',          gasDown: 'Services temporarily unavailable',          gasRestored: 'Services restored ✓'     },
    fr: { retrying: 'Nouvelle tentative…',gasDown: 'Services temporairement indisponibles',    gasRestored: 'Services rétablis ✓'      },
    de: { retrying: 'Erneuter Versuch…',  gasDown: 'Dienste vorübergehend nicht erreichbar',   gasRestored: 'Dienste wiederhergestellt ✓'},
    es: { retrying: 'Reintentando…',      gasDown: 'Servicios temporalmente no disponibles',   gasRestored: 'Servicios restaurados ✓'  },
  };

  function _lang() {
    try { return localStorage.getItem('lh360_lang') || 'it'; } catch (e) { return 'it'; }
  }
  function _toastI18n(key) {
    return (_TOAST_I18N[_lang()] || _TOAST_I18N.it)[key] || key;
  }

  /* Inietta stili toast (una volta sola, non dipende da CSS esterni) */
  function _injectToastStyles() {
    if (document.getElementById('lux-toast-styles')) return;
    var style = document.createElement('style');
    style.id = 'lux-toast-styles';
    style.textContent = [
      '#lux-toast-container{',
        'position:fixed;bottom:24px;right:24px;z-index:100000;',
        'display:flex;flex-direction:column;gap:8px;',
        'pointer-events:none;max-width:360px;',
      '}',
      '.lux-toast{',
        'display:flex;align-items:center;gap:10px;',
        'background:rgba(15,15,18,0.97);',
        'border:1px solid var(--lux-toast-border,rgba(212,175,55,0.35));',
        'border-radius:10px;padding:12px 16px;',
        'box-shadow:0 8px 32px rgba(0,0,0,0.65);',
        'opacity:0;transform:translateX(20px);',
        'transition:opacity .3s ease,transform .3s ease;',
        'pointer-events:all;cursor:pointer;',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
        'font-size:0.84rem;color:#e4e4e7;',
        'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
        'max-width:360px;word-break:break-word;line-height:1.45;',
      '}',
      '.lux-toast.lux-toast-in{opacity:1;transform:translateX(0);}',
      '.lux-toast.lux-toast-out{opacity:0;transform:translateX(20px);}',
      '.lux-toast-icon{flex-shrink:0;font-size:1.05rem;}',
      '.lux-toast-msg{flex:1;}',
      '.lux-toast-close{',
        'background:none;border:none;color:rgba(255,255,255,0.3);',
        'font-size:1.1rem;cursor:pointer;padding:0;line-height:1;',
        'transition:color .2s;flex-shrink:0;',
      '}',
      '.lux-toast-close:hover{color:rgba(255,255,255,0.7);}',
      '@media(max-width:480px){',
        '#lux-toast-container{bottom:16px;right:12px;left:12px;max-width:none;}',
      '}',
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }

  var _toastContainer = null;

  function _getToastContainer() {
    if (_toastContainer && document.body.contains(_toastContainer)) return _toastContainer;
    _injectToastStyles();
    _toastContainer = document.createElement('div');
    _toastContainer.id = 'lux-toast-container';
    document.body.appendChild(_toastContainer);
    return _toastContainer;
  }

  var _TOAST_PALETTES = {
    info:    { border: 'rgba(212,175,55,0.4)',  icon: 'ℹ', color: '#D4AF37' },
    success: { border: 'rgba(16,185,129,0.45)', icon: '✓', color: '#10b981' },
    warning: { border: 'rgba(251,191,36,0.45)', icon: '⚠', color: '#fbbf24' },
    error:   { border: 'rgba(239,68,68,0.45)',  icon: '✕', color: '#f87171' },
  };

  var LuxToast = {
    /**
     * Mostra un toast.
     * @param {string}  message
     * @param {'info'|'success'|'warning'|'error'} [type='info']
     * @param {number}  [durationMs=5000]  0 = non si chiude da solo
     * @returns {HTMLElement|undefined}
     */
    show: function (message, type, durationMs) {
      type       = type       || 'info';
      if (durationMs === undefined) durationMs = CFG.TOAST_DEFAULT_MS;

      var p = _TOAST_PALETTES[type] || _TOAST_PALETTES.info;

      /* Se DOM non ancora pronto, rinvia */
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', function () {
          LuxToast.show(message, type, durationMs);
        });
        return;
      }

      var toast = document.createElement('div');
      toast.className = 'lux-toast';
      toast.style.setProperty('--lux-toast-border', p.border);
      toast.innerHTML =
        '<span class="lux-toast-icon" style="color:' + p.color + '">' + p.icon + '</span>' +
        '<span class="lux-toast-msg">' + message + '</span>' +
        '<button class="lux-toast-close" aria-label="Chiudi">×</button>';

      toast.querySelector('.lux-toast-close').addEventListener('click', function (e) {
        e.stopPropagation();
        _dismissToast(toast);
      });
      toast.addEventListener('click', function () { _dismissToast(toast); });

      _getToastContainer().appendChild(toast);

      /* Forza reflow per attivare transizione CSS */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          toast.classList.add('lux-toast-in');
        });
      });

      if (durationMs > 0) {
        setTimeout(function () { _dismissToast(toast); }, durationMs);
      }

      return toast;
    },

    /** Chiude tutti i toast visibili */
    dismissAll: function () {
      var container = document.getElementById('lux-toast-container');
      if (!container) return;
      Array.prototype.slice.call(container.children).forEach(_dismissToast);
    },

    t: _toastI18n,
  };

  function _dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('lux-toast-in');
    toast.classList.add('lux-toast-out');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }


  /* ════════════════════════════════════════════════════════════
     Circuit Breaker — per endpoint GAS
     Previene chiamate a un endpoint che ha già fallito N volte,
     lasciandogli tempo di recuperare (30s di pausa).
     Dopo la pausa passa in HALF_OPEN: il primo tentativo decide
     se tornare CLOSED (successo) o riaprire (errore).
  ════════════════════════════════════════════════════════════ */
  function CircuitBreaker(name) {
    this.name   = name;
    this.fails  = 0;
    this.state  = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
    this._timer = null;
  }

  CircuitBreaker.prototype.onSuccess = function () {
    this.fails = 0;
    if (this.state !== 'CLOSED') {
      this.state = 'CLOSED';
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    }
  };

  CircuitBreaker.prototype.onFailure = function () {
    this.fails++;
    if (this.fails >= CFG.CB_THRESHOLD && this.state === 'CLOSED') {
      this._open();
    } else if (this.state === 'HALF_OPEN') {
      this._open(); // fallisce anche in HALF_OPEN → riapre
    }
  };

  CircuitBreaker.prototype._open = function () {
    var self = this;
    this.state = 'OPEN';
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(function () {
      self.state = 'HALF_OPEN';
      self.fails = 0;
    }, CFG.CB_RESET_MS);
  };

  CircuitBreaker.prototype.isOpen = function () {
    return this.state === 'OPEN';
  };

  var _cbRegistry = {};
  function _getCB(url) {
    var key = url.replace(/\?.*/, '').slice(0, 100);
    if (!_cbRegistry[key]) _cbRegistry[key] = new CircuitBreaker(key);
    return _cbRegistry[key];
  }


  /* ════════════════════════════════════════════════════════════
     LuxRetry — fetch con retry intelligente
     Centralizza la logica di retry che era duplicata in:
     script.js, pdp-products.html, booking.html, cart.html,
     showcase.html (tutti con parametri diversi).
  ════════════════════════════════════════════════════════════ */
  var LuxRetry = {
    /**
     * Esegue una fetch con retry automatico e backoff progressivo.
     *
     * @param {string|Request} url
     * @param {RequestInit}    [options]
     * @param {Object}         [config]
     *   config.maxRetries  {number}    default 3
     *   config.delays      {number[]}  default [4000, 8000, 15000]
     *   config.circuit     {boolean}   abilita circuit breaker, default true
     *   config.onRetry     {function(attempt, error)} callback prima di retry
     *   config.signal      {AbortSignal} segnale abort esterno
     * @returns {Promise<Response>}
     */
    fetch: function (url, options, config) {
      config      = config      || {};
      var maxRetry = config.maxRetries !== undefined ? config.maxRetries : 3;
      var delays   = config.delays || CFG.RETRY_DELAYS;
      var useCirc  = config.circuit !== false;
      var onRetry  = config.onRetry || null;
      var attempt  = 0;

      var urlStr = typeof url === 'string' ? url : (url && url.url) || '';
      var cb     = useCirc ? _getCB(urlStr) : null;

      function tryOnce() {
        /* Circuit OPEN → fallisci immediatamente */
        if (cb && cb.isOpen()) {
          return Promise.reject(new Error('[LuxRetry] Circuit open — ' + urlStr.slice(0, 60)));
        }

        /* Merge dell'AbortSignal esterno (se fornito) con le options */
        var fetchOpts = Object.assign({}, options || {});
        if (config.signal) fetchOpts.signal = config.signal;

        /* Usa _originalFetch (fetch nativa) per non accumulate wrapper */
        return (global._originalFetch || global.fetch)(url, fetchOpts)
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            if (cb) cb.onSuccess();
            return res;
          })
          .catch(function (err) {
            /* AbortError = abort intenzionale — non riprova mai */
            if (err.name === 'AbortError') throw err;

            if (cb) cb.onFailure();
            attempt++;

            if (attempt <= maxRetry) {
              var delay = delays[attempt - 1] || delays[delays.length - 1];
              if (onRetry) { try { onRetry(attempt, err); } catch (x) {} }
              return new Promise(function (resolve) {
                setTimeout(resolve, delay);
              }).then(tryOnce);
            }

            throw err;
          });
      }

      return tryOnce();
    },

    /**
     * Versione semplificata con toast automatico al primo retry.
     * Utile per chiamate GAS dall'UI (prodotti, categorie, ecc.)
     */
    fetchGAS: function (url, options) {
      return LuxRetry.fetch(url, options, {
        maxRetries: 3,
        delays:     CFG.RETRY_DELAYS,
        circuit:    true,
        onRetry: function (attempt) {
          if (attempt === 1) {
            LuxToast.show(LuxToast.t('retrying'), 'warning', 4000);
          }
        },
      });
    },
  };


  /* ════════════════════════════════════════════════════════════
     LuxGAS — Health monitoring Google Apps Script
     Fa probing periodico per sapere se GAS è raggiungibile.
     Mostra toast quando GAS torna online dopo un'interruzione.
  ════════════════════════════════════════════════════════════ */
  var _gasHealthy     = null; // null=sconosciuto, true=ok, false=down
  var _gasConsecFails = 0;
  var _gasProbeTimer  = null;
  var _gasListeners   = [];

  var LuxGAS = {
    /** Stato corrente: null | true | false */
    isHealthy: function () { return _gasHealthy; },

    /** Registra callback chiamata a ogni cambio di stato */
    onStatusChange: function (fn) { _gasListeners.push(fn); },

    /** Esegue una singola probe silenziosa */
    probe: function (gasUrl) {
      if (!gasUrl) return Promise.resolve();
      var probeUrl = gasUrl.replace(/\?.*/, '') + '?action=ping&t=' + Date.now();
      return (global._originalFetch || global.fetch)(probeUrl, {
        method: 'GET', cache: 'no-store',
      })
        .then(function () { LuxGAS._setHealthy(true); })
        .catch(function (err) {
          if (err.name !== 'AbortError') LuxGAS._setHealthy(false);
        });
    },

    _setHealthy: function (ok) {
      if (ok) {
        _gasConsecFails = 0;
        if (_gasHealthy === false) {
          /* Era giù, ora torna su → toast riconnessione */
          LuxToast.show(LuxToast.t('gasRestored'), 'success', 5000);
        }
        if (_gasHealthy !== true) {
          _gasHealthy = true;
          _gasListeners.forEach(function (fn) { try { fn(true); } catch (e) {} });
        }
      } else {
        _gasConsecFails++;
        if (_gasConsecFails >= 2 && _gasHealthy !== false) {
          _gasHealthy = false;
          _gasListeners.forEach(function (fn) { try { fn(false); } catch (e) {} });
          LuxToast.show(LuxToast.t('gasDown'), 'error', 8000);
        }
      }
    },

    /** Avvia probing periodico */
    startProbing: function (gasUrl, intervalMs) {
      if (_gasProbeTimer) return;
      if (!gasUrl) return;
      intervalMs = intervalMs || CFG.GAS_PROBE_MS;
      _gasProbeTimer = setInterval(function () {
        LuxGAS.probe(gasUrl);
      }, intervalMs);
    },

    /** Ferma probing (chiamato su pagehide) */
    stopProbing: function () {
      if (_gasProbeTimer) { clearInterval(_gasProbeTimer); _gasProbeTimer = null; }
    },
  };

  /* BFCache: ferma probe su pagehide, ripristina su pageshow */
  global.addEventListener('pagehide', function () { LuxGAS.stopProbing(); });
  global.addEventListener('pageshow', function (e) {
    if (e.persisted && !_gasProbeTimer && global.WEB_APP_URL) {
      LuxGAS.startProbing(global.WEB_APP_URL);
    }
  });


  /* ════════════════════════════════════════════════════════════
     Integrazione con LuxFetchBus
     Ascolta gli eventi GAS emessi da siteguard-client.js per
     aggiornare lo stato del health monitor senza fare probe extra.
  ════════════════════════════════════════════════════════════ */
  if (global.LuxFetchBus) {
    global.LuxFetchBus.on('gas:error', function (data) {
      LuxGAS._setHealthy(false);
    });
    global.LuxFetchBus.on('gas:success', function () {
      LuxGAS._setHealthy(true);
    });
  }


  /* ════════════════════════════════════════════════════════════
     Auto-avvio: se WEB_APP_URL è già definito al caricamento,
     avvia subito il probing GAS. Altrimenti lo script che
     definisce WEB_APP_URL può chiamare LuxGAS.startProbing()
     manualmente.
  ════════════════════════════════════════════════════════════ */
  if (typeof global.WEB_APP_URL === 'string' && global.WEB_APP_URL) {
    /* Ritardo di 5s per lasciare il tempo al sito di caricarsi prima */
    setTimeout(function () {
      LuxGAS.startProbing(global.WEB_APP_URL);
    }, 5000);
  } else {
    /* Aspetta DOMContentLoaded nel caso WEB_APP_URL sia definito inline */
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof global.WEB_APP_URL === 'string' && global.WEB_APP_URL && !_gasProbeTimer) {
        setTimeout(function () { LuxGAS.startProbing(global.WEB_APP_URL); }, 5000);
      }
    });
  }


  /* ════════════════════════════════════════════════════════════
     API pubblica
  ════════════════════════════════════════════════════════════ */
  global.LuxToast = LuxToast;
  global.LuxRetry = LuxRetry;
  global.LuxGAS   = LuxGAS;

}(window));
