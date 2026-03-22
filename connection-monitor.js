/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  connection-monitor.js  —  LuxHaven360                               ║
 * ║  v5.0 — Sistema multilivello: 5 stati, rilevamento istantaneo       ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  ARCHITETTURA:                                                       ║
 * ║   · Prober      — multi-endpoint ping con timeout preciso           ║
 * ║   · Analyzer    — scoring latenza, jitter, fail-rate                ║
 * ║   · StateManager— debounce, smoothing, storico 8 probe             ║
 * ║   · UI          — pill persistente + banner + overlay offline       ║
 * ║                                                                      ║
 * ║  5 LIVELLI: excellent · good · unstable · poor · offline            ║
 * ║  LINGUE:    it · en · fr · de · es                                  ║
 * ║                                                                      ║
 * ║  ORDINE CARICAMENTO: DOPO siteguard-client.js                       ║
 * ║  CSS: connection-monitor.css (unica fonte, NO inline injection)     ║
 * ║                                                                      ║
 * ║  DEBUG: window.CM.debug() — simula offline: window.CM.sim('offline')║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     CONFIGURAZIONE
  ══════════════════════════════════════════════════════ */
  var CFG = {
    /* Intervalli polling (ms) */
    INTERVAL_NORMAL:   20000,  // 20s — connessione buona
    INTERVAL_DEGRADED:  5000,  // 5s  — connessione degradata
    INTERVAL_OFFLINE:   3000,  // 3s  — offline (retry rapido)

    /* Probe */
    PROBE_TIMEOUT:  4000,   // timeout singolo probe
    HISTORY_SIZE:      8,   // quante misurazioni conservare
    MIN_PROBES_TO_ACT: 2,   // probe minimi prima di mostrare UI

    /* Soglie latenza (ms) */
    THR_EXCELLENT:  200,   // < 200ms  → ottima
    THR_GOOD:       600,   // < 600ms  → buona
    THR_UNSTABLE:  1500,   // < 1500ms → instabile
    // ≥ 1500ms → scarsa

    /* Soglie jitter (ms) */
    JITTER_UNSTABLE: 150,  // varianza > 150ms → instabile
    JITTER_POOR:     400,  // varianza > 400ms → scarsa

    /* Soglie fail-rate */
    FAIL_UNSTABLE:  0.25,  // 25% fallimenti → instabile
    FAIL_POOR:      0.60,  // 60% fallimenti → scarsa

    /* UI */
    BANNER_AUTO_HIDE:   8000,  // ms prima di nascondere banner ripristino
    DEBOUNCE_UI:         800,  // ms prima di aggiornare UI dopo cambio stato
    RESTORED_SHOW_MS:   5000,  // quanto mostrare il banner "ripristinata"

    /* Endpoint probe (usati in rotazione) */
    PROBES: [
      'https://www.google.com/favicon.ico',
      'https://www.cloudflare.com/favicon.ico',
      'https://1.1.1.1/favicon.ico'
    ]
  };

  /* ══════════════════════════════════════════════════════
     TRADUZIONI — 5 lingue
  ══════════════════════════════════════════════════════ */
  var TRANS = {
    it: {
      excellent:     'Connessione Ottima',
      good:          'Connessione Buona',
      unstable:      'Connessione Instabile',
      poor:          'Connessione Scarsa',
      offline:       'Nessuna Connessione',
      sub_unstable:  'Leggeri rallentamenti potrebbero verificarsi',
      sub_poor:      'Latenza elevata — la navigazione potrebbe essere lenta',
      sub_offline:   'Impossibile raggiungere Internet. Controlla la tua rete.',
      restored:      'Connessione Ripristinata',
      sub_restored:  'La connessione è tornata stabile',
      retry:         'Ricarica Pagina',
      dismiss:       'Chiudi'
    },
    en: {
      excellent:     'Excellent Connection',
      good:          'Good Connection',
      unstable:      'Unstable Connection',
      poor:          'Poor Connection',
      offline:       'No Connection',
      sub_unstable:  'Minor slowdowns may occur while browsing',
      sub_poor:      'High latency — browsing may be slow',
      sub_offline:   'Unable to reach the Internet. Check your network.',
      restored:      'Connection Restored',
      sub_restored:  'Your connection is back to normal',
      retry:         'Reload Page',
      dismiss:       'Dismiss'
    },
    fr: {
      excellent:     'Connexion Excellente',
      good:          'Bonne Connexion',
      unstable:      'Connexion Instable',
      poor:          'Connexion Médiocre',
      offline:       'Aucune Connexion',
      sub_unstable:  'De légers ralentissements peuvent se produire',
      sub_poor:      'Latence élevée — la navigation peut être lente',
      sub_offline:   'Impossible d\'accéder à Internet. Vérifiez votre réseau.',
      restored:      'Connexion Rétablie',
      sub_restored:  'Votre connexion est revenue à la normale',
      retry:         'Recharger la Page',
      dismiss:       'Fermer'
    },
    de: {
      excellent:     'Ausgezeichnete Verbindung',
      good:          'Gute Verbindung',
      unstable:      'Instabile Verbindung',
      poor:          'Schlechte Verbindung',
      offline:       'Keine Verbindung',
      sub_unstable:  'Leichte Verlangsamungen können auftreten',
      sub_poor:      'Hohe Latenz — das Surfen kann langsam sein',
      sub_offline:   'Kein Internetzugang. Überprüfen Sie Ihr Netzwerk.',
      restored:      'Verbindung Wiederhergestellt',
      sub_restored:  'Ihre Verbindung ist wieder normal',
      retry:         'Seite Neu Laden',
      dismiss:       'Schließen'
    },
    es: {
      excellent:     'Conexión Excelente',
      good:          'Buena Conexión',
      unstable:      'Conexión Inestable',
      poor:          'Conexión Deficiente',
      offline:       'Sin Conexión',
      sub_unstable:  'Pueden producirse pequeñas ralentizaciones',
      sub_poor:      'Latencia alta — la navegación puede ser lenta',
      sub_offline:   'No se puede acceder a Internet. Comprueba tu red.',
      restored:      'Conexión Restablecida',
      sub_restored:  'Tu conexión ha vuelto a la normalidad',
      retry:         'Recargar Página',
      dismiss:       'Cerrar'
    }
  };

  function t() {
    var lang = 'it';
    try { lang = localStorage.getItem('lh360_lang') || 'it'; } catch (_) {}
    return TRANS[lang] || TRANS.it;
  }

  /* ══════════════════════════════════════════════════════
     1. PROBER — ping multi-endpoint con timeout preciso
  ══════════════════════════════════════════════════════ */
  var Prober = (function () {
    var _probeIdx = 0;
    var _fetchFn  = null;

    function _getFetch() {
      if (!_fetchFn) _fetchFn = window._originalFetch || window.fetch;
      return _fetchFn;
    }

    /**
     * Esegue un probe e restituisce { latency, success } via callback.
     * latency = -1 se fallito/timeout.
     */
    function probe(cb) {
      if (!navigator.onLine) { cb({ latency: -1, success: false, reason: 'offline_api' }); return; }

      var endpoint = CFG.PROBES[_probeIdx % CFG.PROBES.length];
      _probeIdx++;

      var ac    = new AbortController();
      var timer = setTimeout(function () { try { ac.abort(); } catch (_) {} }, CFG.PROBE_TIMEOUT);
      var start = Date.now();

      _getFetch()(endpoint, {
        method: 'HEAD',
        mode:   'no-cors',
        cache:  'no-store',
        signal: ac.signal
      })
      .then(function () {
        clearTimeout(timer);
        cb({ latency: Date.now() - start, success: true });
      })
      .catch(function (err) {
        clearTimeout(timer);
        var reason = err.name === 'AbortError' ? 'timeout' : 'fetch_error';
        if (reason === 'timeout') {
          cb({ latency: CFG.PROBE_TIMEOUT, success: false, reason: reason });
        } else {
          cb({ latency: -1, success: false, reason: reason });
        }
      });
    }

    return { probe: probe };
  })();

  /* ══════════════════════════════════════════════════════
     2. ANALYZER — calcola qualità da storico probe
  ══════════════════════════════════════════════════════ */
  var Analyzer = (function () {

    /**
     * history: Array di { latency, success }
     * Ritorna: 'excellent' | 'good' | 'unstable' | 'poor' | 'offline'
     */
    function analyze(history) {
      if (!history || history.length === 0) return 'unknown';

      var total   = history.length;
      var failed  = history.filter(function (h) { return !h.success; }).length;
      var failRate = failed / total;

      /* Tutti falliti → offline o poor */
      if (failRate === 1) {
        return !navigator.onLine ? 'offline' : 'poor';
      }

      /* Successi: calcola latenza media e jitter */
      var successes = history.filter(function (h) { return h.success && h.latency > 0; });
      if (successes.length === 0) return 'poor';

      var latencies = successes.map(function (h) { return h.latency; });
      var avgLat    = latencies.reduce(function (a, b) { return a + b; }, 0) / latencies.length;
      var minLat    = Math.min.apply(null, latencies);
      var maxLat    = Math.max.apply(null, latencies);
      var jitter    = maxLat - minLat;

      /* Criteri qualità */
      var qualByLatency = avgLat < CFG.THR_EXCELLENT ? 'excellent'
                        : avgLat < CFG.THR_GOOD      ? 'good'
                        : avgLat < CFG.THR_UNSTABLE  ? 'unstable'
                        : 'poor';

      var qualByJitter = jitter < CFG.JITTER_UNSTABLE ? null
                       : jitter < CFG.JITTER_POOR     ? 'unstable'
                       : 'poor';

      var qualByFail = failRate < CFG.FAIL_UNSTABLE ? null
                     : failRate < CFG.FAIL_POOR     ? 'unstable'
                     : 'poor';

      /* Prende il peggiore tra latenza, jitter e fail-rate */
      var ORDER = ['excellent', 'good', 'unstable', 'poor', 'offline'];
      function worst(a, b) {
        if (!b) return a;
        return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
      }

      var quality = worst(qualByLatency, qualByJitter);
      quality = worst(quality, qualByFail);

      return quality;
    }

    return { analyze: analyze };
  })();

  /* ══════════════════════════════════════════════════════
     3. STATE MANAGER — debounce + smoothing + intervallo adattivo
  ══════════════════════════════════════════════════════ */
  function StateManager(onQualityChange) {
    this._history      = [];          // ultimi N probe
    this._state        = 'unknown';   // stato corrente
    this._pendingState = null;        // stato in attesa di conferma
    this._pendingCount = 0;           // quante volte confermato
    this._interval     = null;
    this._uiTimer      = null;
    this._probeCount   = 0;
    this._onChange     = onQualityChange;
    this._sim          = null;        // simulazione debug
  }

  StateManager.prototype._addProbe = function (result) {
    this._history.push(result);
    if (this._history.length > CFG.HISTORY_SIZE) {
      this._history = this._history.slice(-CFG.HISTORY_SIZE);
    }
  };

  StateManager.prototype._scheduleNext = function (quality) {
    var self = this;
    var delay = quality === 'excellent' || quality === 'good'
              ? CFG.INTERVAL_NORMAL
              : quality === 'offline'
              ? CFG.INTERVAL_OFFLINE
              : CFG.INTERVAL_DEGRADED;

    clearInterval(this._interval);
    this._interval = setInterval(function () { self._doProbe(); }, delay);
  };

  StateManager.prototype._doProbe = function () {
    if (this._sim) {
      this._onResult({ latency: -1, success: false, reason: 'simulated' }, true);
      return;
    }
    var self = this;
    Prober.probe(function (result) { self._onResult(result, false); });
  };

  StateManager.prototype._onResult = function (result, isSim) {
    this._probeCount++;
    if (!isSim) this._addProbe(result);

    /* Non agisce finché non ha abbastanza campioni */
    if (this._history.length < CFG.MIN_PROBES_TO_ACT && !isSim) return;

    var quality = isSim
      ? (this._sim || 'offline')
      : Analyzer.analyze(this._history);

    /* Offline immediato: nessun debounce */
    if (quality === 'offline' || !navigator.onLine) {
      this._commitState('offline');
      return;
    }

    /* Debounce: richiede 2 probe consecutivi con lo stesso stato degradato */
    if (quality !== this._state) {
      if (quality === this._pendingState) {
        this._pendingCount++;
      } else {
        this._pendingState = quality;
        this._pendingCount = 1;
      }
      /* Eccellente/buona: accetta subito. Degradata: richiede conferma */
      var threshold = (quality === 'excellent' || quality === 'good') ? 1 : 2;
      if (this._pendingCount >= threshold) {
        this._commitState(quality);
      }
    } else {
      /* Stesso stato → reset pending */
      this._pendingState = null;
      this._pendingCount = 0;
    }

    this._scheduleNext(this._state);
  };

  StateManager.prototype._commitState = function (quality) {
    var prev = this._state;
    this._state        = quality;
    this._pendingState = null;
    this._pendingCount = 0;

    if (quality !== prev) {
      this._onChange(quality, prev, this._getLastLatency());
    }
    this._scheduleNext(quality);
  };

  StateManager.prototype._getLastLatency = function () {
    var succ = this._history.filter(function (h) { return h.success; });
    if (succ.length === 0) return null;
    return succ[succ.length - 1].latency;
  };

  StateManager.prototype.start = function () {
    var self = this;
    /* Probe iniziale immediato */
    Prober.probe(function (r) { self._onResult(r, false); });
    /* Secondo probe dopo 2s per avere subito 2 campioni */
    setTimeout(function () {
      if (self._history.length < 2) {
        Prober.probe(function (r) { self._onResult(r, false); });
      }
    }, 2000);
    /* Intervallo base */
    this._interval = setInterval(function () { self._doProbe(); }, CFG.INTERVAL_NORMAL);
  };

  StateManager.prototype.stop = function () {
    clearInterval(this._interval);
    this._interval = null;
  };

  StateManager.prototype.simulate = function (state) {
    this._sim = state || null;
    if (state) this._onResult({ latency: -1, success: false, reason: 'simulated' }, true);
    else       { this._history = []; this._doProbe(); }
  };

  /* ══════════════════════════════════════════════════════
     4. UI CONTROLLER — pill + banner + overlay
  ══════════════════════════════════════════════════════ */
  function UI() {
    this._pill    = null;
    this._banner  = null;
    this._overlay = null;
    this._bannerTimer  = null;
    this._dismissedFor = null;  // stato per cui l'utente ha chiuso il banner
    this._currentState = null;
    this._build();
  }

  UI.prototype._build = function () {
    /* ── Pill ── */
    var pill = document.createElement('div');
    pill.id  = 'cm-pill';
    pill.className = 'cm-pill';
    pill.innerHTML =
      '<span class="cm-pill-dot"></span>' +
      '<span class="cm-pill-label"></span>' +
      '<span class="cm-pill-ms"></span>';
    document.body.appendChild(pill);
    this._pill = pill;

    /* ── Banner ── */
    var banner = document.createElement('div');
    banner.id  = 'cm-banner';
    banner.className = 'cm-banner';
    banner.innerHTML =
      '<div class="cm-banner-inner">' +
        '<span class="cm-banner-icon"></span>' +
        '<div class="cm-banner-body">' +
          '<div class="cm-banner-title"></div>' +
          '<div class="cm-banner-sub"></div>' +
        '</div>' +
        '<button class="cm-banner-close" aria-label="Chiudi">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>' +
          '</svg>' +
        '</button>' +
      '</div>';
    var self = this;
    banner.querySelector('.cm-banner-close').addEventListener('click', function () {
      self._dismissedFor = self._currentState;
      self._hideBanner();
    });
    document.body.appendChild(banner);
    this._banner = banner;

    /* ── Overlay offline ── */
    var overlay = document.createElement('div');
    overlay.id  = 'cm-overlay';
    overlay.className = 'cm-overlay';
    overlay.innerHTML =
      '<div class="cm-offline-card">' +
        '<div class="cm-offline-icon">📡</div>' +
        '<div class="cm-offline-title" id="cm-ov-title"></div>' +
        '<p class="cm-offline-text" id="cm-ov-text"></p>' +
        '<div class="cm-retry-bar"><div class="cm-retry-fill" id="cm-retry-fill"></div></div>' +
        '<button class="cm-offline-btn" id="cm-ov-btn"></button>' +
      '</div>';
    overlay.querySelector('.cm-offline-btn').addEventListener('click', function () {
      window.location.reload();
    });
    document.body.appendChild(overlay);
    this._overlay = overlay;
  };

  /* Aggiorna l'intera UI in base al nuovo stato */
  UI.prototype.update = function (quality, prevQuality, latencyMs) {
    var self = this;
    this._currentState = quality;
    var tr = t();

    /* Mappa qualità → etichette e icone */
    var INFO = {
      excellent: { icon: '●',  label: tr.excellent,  sub: null,           pill: false },
      good:      { icon: '●',  label: tr.good,        sub: null,           pill: true  },
      unstable:  { icon: '▲',  label: tr.unstable,    sub: tr.sub_unstable, pill: true  },
      poor:      { icon: '■',  label: tr.poor,        sub: tr.sub_poor,    pill: true  },
      offline:   { icon: '✕',  label: tr.offline,     sub: tr.sub_offline, pill: true  }
    };
    var info = INFO[quality] || INFO.unstable;

    /* ── Pill ── */
    this._pill.className = 'cm-pill cm-' + quality;
    if (info.pill) {
      this._pill.querySelector('.cm-pill-label').textContent = info.label;
      this._pill.querySelector('.cm-pill-ms').textContent =
        (latencyMs && latencyMs > 0) ? latencyMs + 'ms' : '';
      /* Piccolo delay per animazione */
      setTimeout(function () { self._pill.classList.add('cm-visible'); }, 50);
    } else {
      this._pill.classList.remove('cm-visible');
    }

    /* ── Overlay offline ── */
    if (quality === 'offline') {
      this._hideBanner();
      this._showOverlay(tr);
    } else {
      this._hideOverlay();

      /* ── Banner ── */
      if (quality === 'unstable' || quality === 'poor') {
        /* Non riaprire se l'utente ha chiuso questo stesso stato */
        if (this._dismissedFor !== quality) {
          this._showBanner(quality, info, tr, latencyMs);
        }
      } else if (quality === 'excellent' || quality === 'good') {
        this._hideBanner();
        /* Banner ripristino solo se si torna da offline/poor */
        if (prevQuality === 'offline' || prevQuality === 'poor') {
          this._showRestoredBanner(tr);
        }
        this._dismissedFor = null;
      }
    }
  };

  UI.prototype._showBanner = function (quality, info, tr, latencyMs) {
    clearTimeout(this._bannerTimer);
    var b = this._banner;
    b.className = 'cm-banner cm-' + quality;
    b.querySelector('.cm-banner-icon').textContent = info.icon;
    b.querySelector('.cm-banner-title').textContent = info.label;
    var subText = info.sub || '';
    if (latencyMs && latencyMs > 0) subText += (subText ? ' · ' : '') + latencyMs + ' ms';
    b.querySelector('.cm-banner-sub').textContent = subText;
    /* reset visibilità */
    b.classList.remove('cm-visible');
    var self = this;
    setTimeout(function () { b.classList.add('cm-visible'); }, 30);
  };

  UI.prototype._showRestoredBanner = function (tr) {
    var b = this._banner;
    b.className = 'cm-banner cm-restored';
    b.querySelector('.cm-banner-icon').textContent = '✓';
    b.querySelector('.cm-banner-title').textContent = tr.restored;
    b.querySelector('.cm-banner-sub').textContent   = tr.sub_restored;
    b.classList.remove('cm-visible');
    var self = this;
    setTimeout(function () { b.classList.add('cm-visible'); }, 30);
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(function () { self._hideBanner(); }, CFG.RESTORED_SHOW_MS);
  };

  UI.prototype._hideBanner = function () {
    this._banner.classList.remove('cm-visible');
  };

  UI.prototype._showOverlay = function (tr) {
    var ov = this._overlay;
    document.getElementById('cm-ov-title').textContent = tr.offline;
    document.getElementById('cm-ov-text').textContent  = tr.sub_offline;
    document.getElementById('cm-ov-btn').textContent   = '↻ ' + tr.retry;
    ov.classList.add('cm-visible');
    this._startRetryBar();
  };

  UI.prototype._hideOverlay = function () {
    this._overlay.classList.remove('cm-visible');
    this._stopRetryBar();
  };

  /* Barra di progresso retry — visual feedback del prossimo tentativo */
  UI.prototype._startRetryBar = function () {
    var fill = document.getElementById('cm-retry-fill');
    if (!fill) return;
    var self = this;
    var start = Date.now();
    var total = CFG.INTERVAL_OFFLINE;
    clearInterval(this._retryBarTimer);
    fill.style.width = '0%';
    this._retryBarTimer = setInterval(function () {
      var pct = Math.min(100, ((Date.now() - start) / total) * 100);
      fill.style.width = pct + '%';
      if (pct >= 100) {
        start = Date.now();
        fill.style.transition = 'none';
        fill.style.width = '0%';
        /* micro-reflow per ripristinare transition */
        void fill.offsetHeight;
        fill.style.transition = 'width 0.1s linear';
      }
    }, 80);
  };

  UI.prototype._stopRetryBar = function () {
    clearInterval(this._retryBarTimer);
    var fill = document.getElementById('cm-retry-fill');
    if (fill) fill.style.width = '0%';
  };

  UI.prototype.updateTexts = function () {
    if (this._currentState) this.update(this._currentState, null, null);
  };

  UI.prototype.destroy = function () {
    clearTimeout(this._bannerTimer);
    clearInterval(this._retryBarTimer);
    ['cm-pill','cm-banner','cm-overlay'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  };

  /* ══════════════════════════════════════════════════════
     5. CONNECTION MONITOR — orchestratore principale
  ══════════════════════════════════════════════════════ */
  function ConnectionMonitor() {
    var self = this;
    this._ui = new UI();

    this._sm = new StateManager(function (quality, prev, latency) {
      self._ui.update(quality, prev, latency);
    });

    /* Browser events — reazione immediata */
    window.addEventListener('offline', function () {
      self._sm._onResult({ latency: -1, success: false, reason: 'browser_event' }, false);
    });

    window.addEventListener('online', function () {
      /* Probe subito dopo il segnale online */
      setTimeout(function () {
        self._sm._history = [];
        self._sm._doProbe();
      }, 300);
    });

    /* Ritorno in foreground */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) self._sm._doProbe();
    });

    /* Cambio lingua */
    document.addEventListener('languageChanged', function () {
      self._ui.updateTexts();
    });

    /* BFCache */
    window.addEventListener('pagehide', function () { self._sm.stop(); }, { capture: true });
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      self._sm._history = [];
      self._sm.start();
    }, { capture: true });

    this._sm.start();
  }

  /* API debug pubblica */
  ConnectionMonitor.prototype.debug = function () {
    console.table(this._sm._history);
    console.log('State:', this._sm._state, '| Probes:', this._sm._probeCount);
  };

  ConnectionMonitor.prototype.simulate = function (state) {
    this._sm.simulate(state);
  };

  ConnectionMonitor.prototype.dismiss = function () {
    this._ui._dismissedFor = this._ui._currentState;
    this._ui._hideBanner();
  };

  /* ══════════════════════════════════════════════════════
     INIZIALIZZAZIONE
  ══════════════════════════════════════════════════════ */
  var CM;

  function _init() {
    CM = new ConnectionMonitor();
    window.CM                    = CM;
    window.luxConnectionMonitor  = CM;  // compat. con versioni precedenti
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
