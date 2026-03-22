/**
 * connection-monitor.js — LuxHaven360 v6.0
 * Fix: scoring pesato (latenza recente domina), UI solo quando necessario
 */
(function () {
  'use strict';

  /* ── Configurazione ─────────────────────────────────────────────── */
  var CFG = {
    INTERVAL_NORMAL:   25000,   // 25s — connessione buona
    INTERVAL_DEGRADED:  6000,   //  6s — connessione degradata
    INTERVAL_OFFLINE:   3500,   //  3.5s — offline (retry rapido)
    PROBE_TIMEOUT:      5000,   // timeout singolo probe
    HISTORY_SIZE:          6,   // campioni conservati
    MIN_PROBES_TO_ACT:     2,   // probe minimi prima di agire

    /* Soglie latenza (ms) — solo per probe riusciti */
    THR_EXCELLENT:  300,   // < 300ms  → ottima
    THR_GOOD:       900,   // < 900ms  → buona
    THR_UNSTABLE:  2500,   // < 2500ms → instabile
    /* ≥ 2500ms o timeout → scarsa */

    /* Peso del probe più recente (0–1): 0.6 = 60% del punteggio */
    RECENT_WEIGHT: 0.60,

    /* Fail-rate: solo segnale secondario — non può da solo dichiarare 'poor' */
    FAIL_DEGRADED:  0.50,   // ≥ 50% fallimenti → instabile (max)
    /* Se l'ultimo probe è riuscito con latenza buona, fail-rate viene ignorato */

    RESTORED_SHOW_MS:  5000,   // ms per banner "ripristinata"

    PROBES: [
      'https://www.google.com/favicon.ico',
      'https://www.cloudflare.com/favicon.ico',
      'https://1.1.1.1/favicon.ico'
    ]
  };

  /* ── Traduzioni ─────────────────────────────────────────────────── */
  var TRANS = {
    it: {
      unstable:      'Connessione Instabile',
      poor:          'Connessione Scarsa',
      offline:       'Nessuna Connessione',
      sub_unstable:  'Leggeri rallentamenti potrebbero verificarsi',
      sub_poor:      'Latenza elevata — la navigazione potrebbe essere lenta',
      sub_offline:   'Impossibile raggiungere Internet. Controlla la tua rete.',
      restored:      'Connessione Ripristinata',
      sub_restored:  'La connessione è tornata normale',
      retry:         'Ricarica Pagina', dismiss: 'Chiudi'
    },
    en: {
      unstable:      'Unstable Connection',
      poor:          'Poor Connection',
      offline:       'No Connection',
      sub_unstable:  'Minor slowdowns may occur while browsing',
      sub_poor:      'High latency — browsing may be slow',
      sub_offline:   'Unable to reach the Internet. Check your network.',
      restored:      'Connection Restored',
      sub_restored:  'Your connection is back to normal',
      retry:         'Reload Page', dismiss: 'Dismiss'
    },
    fr: {
      unstable:      'Connexion Instable',
      poor:          'Connexion Médiocre',
      offline:       'Aucune Connexion',
      sub_unstable:  'De légers ralentissements peuvent se produire',
      sub_poor:      'Latence élevée — la navigation peut être lente',
      sub_offline:   "Impossible d'accéder à Internet. Vérifiez votre réseau.",
      restored:      'Connexion Rétablie',
      sub_restored:  'Votre connexion est revenue à la normale',
      retry:         'Recharger', dismiss: 'Fermer'
    },
    de: {
      unstable:      'Instabile Verbindung',
      poor:          'Schlechte Verbindung',
      offline:       'Keine Verbindung',
      sub_unstable:  'Leichte Verlangsamungen können auftreten',
      sub_poor:      'Hohe Latenz — das Surfen kann langsam sein',
      sub_offline:   'Kein Internetzugang. Überprüfen Sie Ihr Netzwerk.',
      restored:      'Verbindung Wiederhergestellt',
      sub_restored:  'Ihre Verbindung ist wieder normal',
      retry:         'Neu Laden', dismiss: 'Schließen'
    },
    es: {
      unstable:      'Conexión Inestable',
      poor:          'Conexión Deficiente',
      offline:       'Sin Conexión',
      sub_unstable:  'Pueden producirse pequeñas ralentizaciones',
      sub_poor:      'Latencia alta — la navegación puede ser lenta',
      sub_offline:   'No se puede acceder a Internet. Comprueba tu red.',
      restored:      'Conexión Restablecida',
      sub_restored:  'Tu conexión ha vuelto a la normalidad',
      retry:         'Recargar', dismiss: 'Cerrar'
    }
  };

  function tr() {
    var lang = 'it';
    try { lang = localStorage.getItem('lh360_lang') || 'it'; } catch (_) {}
    return TRANS[lang] || TRANS.it;
  }

  /* ── SVG Icons ──────────────────────────────────────────────────── */
  var ICONS = {
    unstable: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    poor:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l7.5 7.5L12 10l3.5 3.5L23 6"/><path d="M1 18l7.5-7.5L12 14l3.5-3.5L23 18" opacity="0.3"/></svg>',
    offline:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    restored: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    offline_lg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>'
  };

  /* ── Prober ─────────────────────────────────────────────────────── */
  var _probeIdx = 0;
  var _fetchFn  = null;

  function _probe(cb) {
    if (!navigator.onLine) { cb({ latency: -1, success: false, reason: 'api_offline' }); return; }
    if (!_fetchFn) _fetchFn = window._originalFetch || window.fetch;

    var endpoint = CFG.PROBES[_probeIdx % CFG.PROBES.length];
    _probeIdx++;

    var ac = new AbortController();
    var timer = setTimeout(function () { try { ac.abort(); } catch (_) {} }, CFG.PROBE_TIMEOUT);
    var t0 = Date.now();

    _fetchFn(endpoint, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: ac.signal })
      .then(function () {
        clearTimeout(timer);
        cb({ latency: Date.now() - t0, success: true });
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          cb({ latency: CFG.PROBE_TIMEOUT, success: false, reason: 'timeout' });
        } else {
          cb({ latency: -1, success: false, reason: 'error' });
        }
      });
  }

  /* ── Analyzer — scoring pesato (latenza recente domina) ─────────── */
  function _analyze(history) {
    if (!history || history.length === 0) return 'unknown';

    var total  = history.length;
    var failed = history.filter(function (h) { return !h.success; }).length;

    /* Tutti falliti */
    if (failed === total) return navigator.onLine ? 'poor' : 'offline';

    var successes = history.filter(function (h) { return h.success && h.latency > 0; });
    if (successes.length === 0) return 'poor';

    /* ── ULTIMO probe riuscito: se recente e buono, dà il beneficio del dubbio ── */
    var lastSuccess = successes[successes.length - 1];
    var lastLat     = lastSuccess.latency;

    /* Se l'ultimo probe è eccellente, ignora lo storico di fallimenti */
    if (lastLat < CFG.THR_EXCELLENT) {
      /* Verifica solo che NON siano tutti gli altri falliti (≥ 80%) */
      var failRate = failed / total;
      if (failRate < 0.80) return 'excellent';
    }

    /* ── Scoring pesato: 60% ultimo probe, 40% media storica ── */
    var lats    = successes.map(function (h) { return h.latency; });
    var avgHist = lats.reduce(function (a, b) { return a + b; }, 0) / lats.length;
    var weighted = lastLat * CFG.RECENT_WEIGHT + avgHist * (1 - CFG.RECENT_WEIGHT);

    /* Qualità dalla latenza pesata */
    var qualLat = weighted < CFG.THR_EXCELLENT ? 'excellent'
                : weighted < CFG.THR_GOOD      ? 'good'
                : weighted < CFG.THR_UNSTABLE  ? 'unstable'
                : 'poor';

    /* Fail-rate: segnale secondario — può solo peggiorare di un livello */
    var failRate = failed / total;
    var ORDER    = ['excellent', 'good', 'unstable', 'poor', 'offline'];
    if (failRate >= CFG.FAIL_DEGRADED && qualLat !== 'poor') {
      var idx = ORDER.indexOf(qualLat);
      qualLat = ORDER[Math.min(idx + 1, 3)]; // max 'poor'
    }

    return qualLat;
  }

  /* ── State Manager ──────────────────────────────────────────────── */
  function StateManager(onChange) {
    this._history      = [];
    this._state        = 'unknown';
    this._pendingState = null;
    this._pendingCount = 0;
    this._interval     = null;
    this._probeCount   = 0;
    this._onChange     = onChange;
    this._sim          = null;
  }

  StateManager.prototype._addProbe = function (r) {
    this._history.push(r);
    if (this._history.length > CFG.HISTORY_SIZE)
      this._history = this._history.slice(-CFG.HISTORY_SIZE);
  };

  StateManager.prototype._scheduleNext = function (q) {
    clearInterval(this._interval);
    var self  = this;
    var delay = (q === 'excellent' || q === 'good') ? CFG.INTERVAL_NORMAL
              : q === 'offline' ? CFG.INTERVAL_OFFLINE
              : CFG.INTERVAL_DEGRADED;
    this._interval = setInterval(function () { self._doProbe(); }, delay);
  };

  StateManager.prototype._doProbe = function () {
    var self = this;
    if (this._sim) { this._onResult({ latency: -1, success: false }, true); return; }
    _probe(function (r) { self._onResult(r, false); });
  };

  StateManager.prototype._onResult = function (r, isSim) {
    this._probeCount++;
    if (!isSim) this._addProbe(r);
    if (this._history.length < CFG.MIN_PROBES_TO_ACT && !isSim) return;

    var q = isSim ? (this._sim || 'offline') : _analyze(this._history);

    /* Offline: azione immediata */
    if (q === 'offline' || !navigator.onLine) { this._commit('offline'); return; }

    /* Debounce: degradamenti richiedono 2 conferme consecutive */
    if (q !== this._state) {
      if (q === this._pendingState) {
        this._pendingCount++;
      } else {
        this._pendingState = q;
        this._pendingCount = 1;
      }
      var need = (q === 'excellent' || q === 'good') ? 1 : 2;
      if (this._pendingCount >= need) this._commit(q);
    } else {
      this._pendingState = null;
      this._pendingCount = 0;
    }

    this._scheduleNext(this._state);
  };

  StateManager.prototype._commit = function (q) {
    var prev = this._state;
    this._state        = q;
    this._pendingState = null;
    this._pendingCount = 0;
    if (q !== prev) {
      var lat = null;
      var s = this._history.filter(function (h) { return h.success; });
      if (s.length) lat = s[s.length - 1].latency;
      this._onChange(q, prev, lat);
    }
    this._scheduleNext(q);
  };

  StateManager.prototype.start = function () {
    var self = this;
    _probe(function (r) { self._onResult(r, false); });
    /* Secondo probe dopo 2s per raggiungere MIN_PROBES_TO_ACT rapidamente */
    setTimeout(function () {
      if (self._history.length < 2) _probe(function (r) { self._onResult(r, false); });
    }, 2000);
    var self2 = this;
    this._interval = setInterval(function () { self2._doProbe(); }, CFG.INTERVAL_NORMAL);
  };

  StateManager.prototype.stop = function () {
    clearInterval(this._interval);
    this._interval = null;
  };

  StateManager.prototype.simulate = function (s) {
    this._sim = s || null;
    if (s) this._onResult({ latency: -1, success: false }, true);
    else   { this._history = []; this._doProbe(); }
  };

  /* ── UI ─────────────────────────────────────────────────────────── */
  function UI() {
    this._banner       = null;
    this._overlay      = null;
    this._bannerTimer  = null;
    this._retryTimer   = null;
    this._dismissed    = null;  // stato per cui l'utente ha chiuso
    this._cur          = null;
    this._build();
  }

  UI.prototype._build = function () {
    /* Banner */
    var b = document.createElement('div');
    b.id = 'cm-banner';
    b.className = 'cm-banner';
    b.innerHTML =
      '<div class="cm-banner-inner">' +
        '<div class="cm-banner-icon" id="cm-b-icon"></div>' +
        '<div class="cm-banner-body">' +
          '<div class="cm-banner-title" id="cm-b-title"></div>' +
          '<div class="cm-banner-sub" id="cm-b-sub"></div>' +
        '</div>' +
        '<button class="cm-banner-close" id="cm-b-close" aria-label="Chiudi">' +
          '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
            '<line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>' +
          '</svg>' +
        '</button>' +
      '</div>';
    var self = this;
    b.querySelector('#cm-b-close').addEventListener('click', function () {
      self._dismissed = self._cur;
      self._hideBanner();
    });
    document.body.appendChild(b);
    this._banner = b;

    /* Overlay offline */
    var ov = document.createElement('div');
    ov.id = 'cm-overlay';
    ov.className = 'cm-overlay';
    ov.innerHTML =
      '<div class="cm-offline-card">' +
        '<div class="cm-offline-icon" id="cm-ov-icon">' + ICONS.offline_lg + '</div>' +
        '<div class="cm-offline-title" id="cm-ov-title"></div>' +
        '<p class="cm-offline-text" id="cm-ov-text"></p>' +
        '<div class="cm-retry-bar"><div class="cm-retry-fill" id="cm-retry-fill"></div></div>' +
        '<button class="cm-offline-btn" id="cm-ov-btn"></button>' +
      '</div>';
    ov.querySelector('#cm-ov-btn').addEventListener('click', function () { window.location.reload(); });
    document.body.appendChild(ov);
    this._overlay = ov;
  };

  UI.prototype.update = function (q, prev, latMs) {
    this._cur = q;
    var t = tr();

    if (q === 'offline') {
      this._hideBanner();
      this._showOverlay(t);
      return;
    }

    this._hideOverlay();

    if (q === 'unstable' || q === 'poor') {
      /* Non riaprire se l'utente ha già chiuso questo stesso stato */
      if (this._dismissed !== q) this._showBanner(q, latMs, t);
    } else {
      /* excellent o good */
      this._hideBanner();
      if (prev === 'offline' || prev === 'poor' || prev === 'unstable') {
        this._showRestored(t);
      }
      this._dismissed = null;
    }
  };

  UI.prototype._showBanner = function (q, latMs, t) {
    clearTimeout(this._bannerTimer);
    var b = this._banner;
    b.className = 'cm-banner cm-' + q;

    b.querySelector('#cm-b-icon').innerHTML = ICONS[q] || '';
    b.querySelector('#cm-b-title').textContent = t[q] || q;

    var sub = t['sub_' + q] || '';
    if (latMs && latMs > 0) sub += (sub ? ' · ' : '') + latMs + ' ms';
    b.querySelector('#cm-b-sub').textContent = sub;

    b.classList.remove('cm-visible');
    setTimeout(function () { b.classList.add('cm-visible'); }, 20);
  };

  UI.prototype._showRestored = function (t) {
    var b = this._banner;
    b.className = 'cm-banner cm-restored';
    b.querySelector('#cm-b-icon').innerHTML = ICONS.restored;
    b.querySelector('#cm-b-title').textContent = t.restored || 'Connessione Ripristinata';
    b.querySelector('#cm-b-sub').textContent   = t.sub_restored || '';
    b.classList.remove('cm-visible');
    setTimeout(function () { b.classList.add('cm-visible'); }, 20);
    var self = this;
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(function () { self._hideBanner(); }, CFG.RESTORED_SHOW_MS);
  };

  UI.prototype._hideBanner = function () {
    this._banner.classList.remove('cm-visible');
    clearTimeout(this._bannerTimer);
  };

  UI.prototype._showOverlay = function (t) {
    document.getElementById('cm-ov-title').textContent = t.offline || 'Nessuna Connessione';
    document.getElementById('cm-ov-text').textContent  = t.sub_offline || '';
    document.getElementById('cm-ov-btn').textContent   = '↻  ' + (t.retry || 'Ricarica');
    this._overlay.classList.add('cm-visible');
    this._startRetry();
  };

  UI.prototype._hideOverlay = function () {
    this._overlay.classList.remove('cm-visible');
    this._stopRetry();
  };

  UI.prototype._startRetry = function () {
    var fill  = document.getElementById('cm-retry-fill');
    if (!fill) return;
    var t0    = Date.now();
    var total = CFG.INTERVAL_OFFLINE;
    this._stopRetry();
    this._retryTimer = setInterval(function () {
      var pct = Math.min(100, ((Date.now() - t0) / total) * 100);
      fill.style.width = pct + '%';
      if (pct >= 100) { t0 = Date.now(); fill.style.transition = 'none'; fill.style.width = '0%'; void fill.offsetHeight; fill.style.transition = 'width 0.1s linear'; }
    }, 80);
  };

  UI.prototype._stopRetry = function () {
    clearInterval(this._retryTimer);
    var fill = document.getElementById('cm-retry-fill');
    if (fill) fill.style.width = '0%';
  };

  UI.prototype.updateTexts = function () {
    if (this._cur) this.update(this._cur, null, null);
  };

  /* ── Connection Monitor — orchestratore ─────────────────────────── */
  function ConnectionMonitor() {
    var self = this;
    this._ui = new UI();
    this._sm = new StateManager(function (q, prev, lat) { self._ui.update(q, prev, lat); });

    window.addEventListener('offline', function () {
      self._sm._onResult({ latency: -1, success: false, reason: 'browser' }, false);
    });

    window.addEventListener('online', function () {
      setTimeout(function () {
        self._sm._history = [];
        self._sm._doProbe();
      }, 300);
    });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) self._sm._doProbe();
    });

    document.addEventListener('languageChanged', function () { self._ui.updateTexts(); });

    window.addEventListener('pagehide', function () { self._sm.stop(); }, { capture: true });
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      self._sm._history = [];
      self._sm.start();
    }, { capture: true });

    this._sm.start();
  }

  /* API pubblica */
  ConnectionMonitor.prototype.debug    = function () { console.table(this._sm._history); console.log('State:', this._sm._state); };
  ConnectionMonitor.prototype.simulate = function (s) { this._sm.simulate(s); };
  ConnectionMonitor.prototype.dismiss  = function () { this._ui._dismissed = this._ui._cur; this._ui._hideBanner(); };

  /* ── Init ───────────────────────────────────────────────────────── */
  function _init() {
    var cm = new ConnectionMonitor();
    window.CM = cm;
    window.luxConnectionMonitor = cm;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
  else _init();

})();
