/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  connection-monitor.js  —  LuxHaven360                               ║
 * ║  v4.0 — Smart Monitor: no fetch wrapping, _originalFetch only       ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  RESPONSABILITÀ:                                                     ║
 * ║   1. Rileva stato connessione (offline / lenta / instabile / buona) ║
 * ║   2. Mostra/nasconde UI non invasiva                                 ║
 * ║   3. Aggiorna testi al cambio lingua                                 ║
 * ║                                                                      ║
 * ║  NON FA:                                                             ║
 * ║   - NON wrappa window.fetch (evita conflitti con siteguard-client)  ║
 * ║   - Non imposta _originalFetch (già fatto da siteguard-client.js)   ║
 * ║   - Non intercetta altri moduli del sito                            ║
 * ║                                                                      ║
 * ║  LINGUE: it · en · fr · de · es                                     ║
 * ║                                                                      ║
 * ║  ORDINE DI CARICAMENTO: DOPO siteguard-client.js                    ║
 * ║   (può essere in fondo al <body> o <script defer>)                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     TRADUZIONI (5 lingue)
     Nuovo: aggiunto 'retrying' per feedback auto-retry
  ════════════════════════════════════════════════════════════════════ */
  var _TRANS = {
    it: {
      slow:          'Connessione Lenta',
      unstable:      'Connessione Instabile',
      warning_text:  'Potrebbero verificarsi rallentamenti durante la navigazione',
      offline_title: 'Connessione Assente',
      offline_text:  'Impossibile connettersi a Internet.<br>Verifica la tua connessione e ricarica la pagina.',
      offline_btn:   'Ricarica Pagina',
      restored:      'Connessione Ristabilita',
      checking:      'Verifica connessione...',
      dismiss:       'Chiudi'
    },
    en: {
      slow:          'Slow Connection',
      unstable:      'Unstable Connection',
      warning_text:  'You may experience slowdowns while browsing',
      offline_title: 'No Connection',
      offline_text:  'Unable to connect to the Internet.<br>Check your connection and reload the page.',
      offline_btn:   'Reload Page',
      restored:      'Connection Restored',
      checking:      'Checking connection...',
      dismiss:       'Dismiss'
    },
    fr: {
      slow:          'Connexion Lente',
      unstable:      'Connexion Instable',
      warning_text:  'Des ralentissements pourraient se produire lors de la navigation',
      offline_title: 'Connexion Absente',
      offline_text:  'Impossible de se connecter à Internet.<br>Vérifiez votre connexion et rechargez la page.',
      offline_btn:   'Recharger la Page',
      restored:      'Connexion Rétablie',
      checking:      'Vérification de la connexion...',
      dismiss:       'Fermer'
    },
    de: {
      slow:          'Langsame Verbindung',
      unstable:      'Instabile Verbindung',
      warning_text:  'Beim Surfen können Verlangsamungen auftreten',
      offline_title: 'Keine Verbindung',
      offline_text:  'Keine Internetverbindung möglich.<br>Prüfen Sie Ihre Verbindung und laden Sie die Seite neu.',
      offline_btn:   'Seite Neu Laden',
      restored:      'Verbindung Wiederhergestellt',
      checking:      'Verbindung wird geprüft...',
      dismiss:       'Schließen'
    },
    es: {
      slow:          'Conexión Lenta',
      unstable:      'Conexión Inestable',
      warning_text:  'Pueden producirse ralentizaciones durante la navegación',
      offline_title: 'Sin Conexión',
      offline_text:  'No es posible conectarse a Internet.<br>Comprueba tu conexión y recarga la página.',
      offline_btn:   'Recargar Página',
      restored:      'Conexión Restablecida',
      checking:      'Comprobando conexión...',
      dismiss:       'Cerrar'
    }
  };

  function _t() {
    var lang = 'it';
    try { lang = localStorage.getItem('lh360_lang') || 'it'; } catch (_) {}
    return _TRANS[lang] || _TRANS.it;
  }

  /* ════════════════════════════════════════════════════════════════════
     INIETTA STILI CSS
  ════════════════════════════════════════════════════════════════════ */
  function _injectStyles() {
    if (document.getElementById('lh-cm-styles')) return;
    var s = document.createElement('style');
    s.id = 'lh-cm-styles';
    s.textContent = [
      /* Banner (slow/unstable/restored) */
      '.lh-connection-banner{',
        'position:fixed;bottom:-80px;left:50%;transform:translateX(-50%);',
        'z-index:99998;min-width:280px;max-width:500px;width:90%;',
        'border-radius:8px;transition:bottom 0.4s cubic-bezier(0.34,1.56,0.64,1);',
        'box-shadow:0 8px 32px rgba(0,0,0,0.5);',
      '}',
      '.lh-connection-banner.show{bottom:24px;}',
      '.lh-connection-banner.weak{',
        'background:linear-gradient(135deg,#1a1208,#2a1e08);',
        'border:1px solid rgba(212,175,55,0.3);',
      '}',
      '.lh-connection-banner.success{',
        'background:linear-gradient(135deg,#0a1f0a,#0d2b0d);',
        'border:1px solid rgba(74,222,128,0.3);',
      '}',
      '.lh-banner-content{display:flex;align-items:center;gap:12px;padding:14px 18px;}',
      '.lh-banner-icon{font-size:1.25rem;flex-shrink:0;}',
      '.lh-banner-text{flex:1;display:flex;flex-direction:column;gap:2px;}',
      '.lh-banner-text strong{font-size:0.875rem;color:#f5f5f5;font-family:Georgia,serif;letter-spacing:0.04em;}',
      '.lh-banner-text span{font-size:0.78rem;color:rgba(245,245,245,0.55);font-family:Georgia,serif;}',
      '.lh-banner-close{',
        'background:none;border:none;color:rgba(245,245,245,0.4);',
        'cursor:pointer;font-size:1.25rem;padding:4px;line-height:1;',
        'transition:color 0.2s;flex-shrink:0;',
      '}',
      '.lh-banner-close:hover{color:rgba(245,245,245,0.8);}',
      /* Overlay offline */
      '.lh-connection-overlay{',
        'position:fixed;inset:0;z-index:99997;',
        'display:flex;align-items:center;justify-content:center;',
        'background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);',
        'opacity:0;transition:opacity 0.3s ease;padding:1.5rem;',
        'pointer-events:none;',
      '}',
      '.lh-connection-overlay.show{opacity:1;pointer-events:auto;}',
      '.lh-offline-card{',
        'background:#111;border:1px solid rgba(212,175,55,0.2);',
        'border-radius:4px;padding:2.5rem 3rem;max-width:420px;width:100%;',
        'text-align:center;',
      '}',
      '.lh-offline-icon{font-size:2.5rem;margin-bottom:1rem;}',
      '.lh-offline-title{',
        'font-family:Georgia,serif;font-size:1.25rem;color:#f5f5f5;',
        'margin:0 0 0.75rem;letter-spacing:0.04em;',
      '}',
      '.lh-offline-text{',
        'font-family:Georgia,serif;font-size:0.875rem;color:rgba(245,245,245,0.5);',
        'line-height:1.6;margin:0 0 1.5rem;',
      '}',
      '.lh-offline-btn{',
        'display:inline-block;padding:0.7rem 2rem;',
        'background:linear-gradient(135deg,#D4AF37,#B8941F);',
        'color:#0a0a0a;font-family:Georgia,serif;font-size:0.8rem;',
        'letter-spacing:0.1em;text-transform:uppercase;border:none;',
        'cursor:pointer;border-radius:1px;font-weight:600;',
        'transition:opacity 0.2s;',
      '}',
      '.lh-offline-btn:hover{opacity:0.85;}',
      '@media(max-width:480px){',
        '.lh-offline-card{padding:2rem 1.5rem;}',
        '.lh-connection-banner{width:calc(100% - 32px);}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ════════════════════════════════════════════════════════════════════
     MONITOR CLASS
  ════════════════════════════════════════════════════════════════════ */
  function LuxConnectionMonitor() {
    this.quality          = 'unknown'; // good | fair | poor | offline
    this.prevQuality      = 'unknown';
    this.wasOffline       = false;
    this.warningShown     = false;
    this.initialDone      = false;
    this._interval        = null;
    this._abortControllers = new Set();

    _injectStyles();
    this._bind();
  }

  /* ── Setup event listeners ───────────────────────────────────── */
  LuxConnectionMonitor.prototype._bind = function () {
    var self = this;

    window.addEventListener('online',  function () { self._onOnline();  });
    window.addEventListener('offline', function () { self._onOffline(); });

    /* BFCache compatibility */
    window.addEventListener('pagehide', function () { self._destroy(); }, { capture: true });
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      self.quality          = 'unknown';
      self.warningShown     = false;
      self.initialDone      = false;
      self._abortControllers = new Set();
      setTimeout(function () { self._check(true); }, 600);
    }, { capture: true });

    /* Cambio lingua */
    document.addEventListener('languageChanged', function () { self._updateTexts(); });

    /* Visibility change: ricontrolla quando l'utente torna sulla tab */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && navigator.onLine) self._check(true);
    });

    /* Check iniziale (silenzioso) */
    self._check(true);

    /* Conferma dopo 3s */
    setTimeout(function () {
      if (!self.initialDone) { self._check(false); self.initialDone = true; }
    }, 3000);

    /* Check periodico ogni 45s */
    self._interval = setInterval(function () {
      if (navigator.onLine) self._check(true);
    }, 45000);
  };

  /* ── Controllo connessione ─────────────────────────────────── */
  LuxConnectionMonitor.prototype._check = function (silent) {
    if (silent === undefined) silent = true;
    if (!navigator.onLine) { this._setQuality('offline', silent); return; }

    var self = this;
    var ac   = new AbortController();
    self._abortControllers.add(ac);
    var start = Date.now();

    /* IMPORTANTE: usa _originalFetch (fetch nativa, senza wrapper).
       Questo evita che il timeout di siteguard-client interferisca
       con i check di connessione, e previene loop di AbortError. */
    var fetchFn = window._originalFetch || window.fetch;

    fetchFn('https://www.google.com/favicon.ico', {
      method:  'HEAD',
      mode:    'no-cors',
      cache:   'no-cache',
      signal:  ac.signal
    })
    .then(function () {
      self._abortControllers.delete(ac);
      var latency = Date.now() - start;
      var q = latency < 600 ? 'good' : latency < 1800 ? 'fair' : 'poor';
      self._setQuality(q, silent);

      /* Se primo check silenzioso mostra problema, riconferma dopo 2s */
      if (silent && !self.initialDone && q !== 'good') {
        setTimeout(function () {
          if (!self.initialDone) { self._check(false); self.initialDone = true; }
        }, 2000);
      }
    })
    .catch(function (err) {
      self._abortControllers.delete(ac);
      if (err.name === 'AbortError') return; /* pagehide — ignorato */
      self._setQuality(navigator.onLine ? 'poor' : 'offline', silent);
    });
  };

  /* ── Aggiorna qualità e decide se mostrare UI ──────────────── */
  LuxConnectionMonitor.prototype._setQuality = function (q, silent) {
    this.prevQuality = this.quality;
    this.quality     = q;

    if (q === 'offline') this.wasOffline = true;

    if (silent && q !== 'offline') return; /* check silenzioso: nessuna UI */

    if (q === 'offline') {
      this._showOffline();
    } else if (q === 'poor' || q === 'fair') {
      if (!this.warningShown) this._showBanner();
    } else if (q === 'good') {
      this._hideAll();
      if (this.wasOffline && this.prevQuality === 'offline') {
        this._showRestored();
        this.wasOffline = false;
      }
    }
  };

  /* ── Event handlers ────────────────────────────────────────── */
  LuxConnectionMonitor.prototype._onOnline = function () {
    setTimeout(function () { this._check(false); }.bind(this), 400);
  };

  LuxConnectionMonitor.prototype._onOffline = function () {
    this.wasOffline = true;
    this._setQuality('offline', false);
  };

  /* ── UI: banner warning ─────────────────────────────────────── */
  LuxConnectionMonitor.prototype._showBanner = function () {
    this._hideAll();
    var t    = _t();
    var self = this;

    var div = document.createElement('div');
    div.id  = 'lh-conn-warn';
    div.className = 'lh-connection-banner weak';
    div.innerHTML =
      '<div class="lh-banner-content">' +
        '<div class="lh-banner-icon">⚠️</div>' +
        '<div class="lh-banner-text">' +
          '<strong id="lh-cw-title">' + (this.quality === 'fair' ? t.slow : t.unstable) + '</strong>' +
          '<span id="lh-cw-text">' + t.warning_text + '</span>' +
        '</div>' +
        '<button class="lh-banner-close" aria-label="' + t.dismiss + '" onclick="luxConnectionMonitor.dismiss()">×</button>' +
      '</div>';
    document.body.appendChild(div);
    setTimeout(function () { div.classList.add('show'); }, 60);
    this.warningShown = true;
  };

  /* ── UI: overlay offline ────────────────────────────────────── */
  LuxConnectionMonitor.prototype._showOffline = function () {
    this._hideAll();
    var t = _t();

    var div = document.createElement('div');
    div.id  = 'lh-conn-offline';
    div.className = 'lh-connection-overlay';
    div.innerHTML =
      '<div class="lh-offline-card">' +
        '<div class="lh-offline-icon">📡</div>' +
        '<h2 class="lh-offline-title" id="lh-co-title">' + t.offline_title + '</h2>' +
        '<p class="lh-offline-text" id="lh-co-text">' + t.offline_text + '</p>' +
        '<button class="lh-offline-btn" id="lh-co-btn" onclick="window.location.reload()">🔄 ' + t.offline_btn + '</button>' +
      '</div>';
    document.body.appendChild(div);
    setTimeout(function () { div.classList.add('show'); }, 60);
  };

  /* ── UI: notifica riconnessione ─────────────────────────────── */
  LuxConnectionMonitor.prototype._showRestored = function () {
    var t   = _t();
    var div = document.createElement('div');
    div.id  = 'lh-conn-ok';
    div.className = 'lh-connection-banner success';
    div.innerHTML =
      '<div class="lh-banner-content">' +
        '<div class="lh-banner-icon">✓</div>' +
        '<div class="lh-banner-text">' +
          '<strong>' + t.restored + '</strong>' +
        '</div>' +
      '</div>';
    document.body.appendChild(div);
    setTimeout(function () { div.classList.add('show'); }, 60);
    setTimeout(function () {
      div.classList.remove('show');
      setTimeout(function () { if (div.parentNode) div.remove(); }, 500);
    }, 4000);
  };

  /* ── Aggiorna testi al cambio lingua ────────────────────────── */
  LuxConnectionMonitor.prototype._updateTexts = function () {
    var t = _t();

    var titleEl = document.getElementById('lh-cw-title');
    var textEl  = document.getElementById('lh-cw-text');
    if (titleEl) titleEl.textContent = this.quality === 'fair' ? t.slow : t.unstable;
    if (textEl)  textEl.textContent  = t.warning_text;

    var offTitle = document.getElementById('lh-co-title');
    var offText  = document.getElementById('lh-co-text');
    var offBtn   = document.getElementById('lh-co-btn');
    if (offTitle) offTitle.textContent = t.offline_title;
    if (offText)  offText.innerHTML    = t.offline_text;
    if (offBtn)   offBtn.innerHTML     = '🔄 ' + t.offline_btn;
  };

  /* ── Nascondi tutto ─────────────────────────────────────────── */
  LuxConnectionMonitor.prototype._hideAll = function () {
    ['lh-conn-warn', 'lh-conn-offline', 'lh-conn-ok'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.remove(); }, 500);
    });
    this.warningShown = false;
  };

  /** Dismiss manuale (chiamato dall'utente via pulsante chiudi) */
  LuxConnectionMonitor.prototype.dismiss = function () {
    this._hideAll();
  };

  /** Cleanup BFCache-safe */
  LuxConnectionMonitor.prototype._destroy = function () {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
    this._abortControllers.forEach(function (ac) { try { ac.abort(); } catch (_) {} });
    this._abortControllers.clear();
    this._hideAll();
  };

  /* ════════════════════════════════════════════════════════════════════
     INIZIALIZZAZIONE
  ════════════════════════════════════════════════════════════════════ */
  var luxConnectionMonitor;

  function _init() {
    luxConnectionMonitor = new LuxConnectionMonitor();
    window.luxConnectionMonitor = luxConnectionMonitor;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
