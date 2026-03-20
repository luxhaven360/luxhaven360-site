/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  error-handler.js  —  LuxHaven360                                    ║
 * ║  v2.0 — Global Error UI: 5 tipi, 5 lingue, auto-retry               ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  TIPI DI ERRORE:                                                     ║
 * ║   • generic  — Errore applicativo imprevisto                        ║
 * ║   • network  — Connessione assente o persa                          ║
 * ║   • loading  — Contenuto non caricato (server GAS occupato)         ║
 * ║   • timeout  — Richiesta scaduta (GAS cold start)                   ║
 * ║   • server   — Errore HTTP 5xx dal backend                          ║
 * ║                                                                      ║
 * ║  LINGUE SUPPORTATE: it · en · fr · de · es                         ║
 * ║                                                                      ║
 * ║  API:                                                                ║
 * ║   LuxError.show('loading', retryFn)  // mostra overlay              ║
 * ║   LuxError.hide()                    // nasconde overlay            ║
 * ║   LuxError.isVisible()               // true se overlay visibile    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     DIZIONARIO TRADUZIONI (5 lingue × 5 tipi + UI labels)
  ════════════════════════════════════════════════════════════════════ */
  var T = {
    it: {
      title:   'Qualcosa è andato storto',
      generic: 'Si è verificato un errore imprevisto. Il nostro team è già al lavoro.',
      network: 'Sembra che tu abbia perso la connessione. Controlla la rete e riprova.',
      loading: 'Non è stato possibile caricare i contenuti. Il server potrebbe essere temporaneamente occupato.',
      timeout: 'La richiesta ha impiegato troppo tempo. Il server è al momento lento — riprova tra qualche secondo.',
      server:  'Si è verificato un errore sul server. Stiamo lavorando per risolverlo al più presto.',
      retry:   'Riprova',
      home:    'Torna alla Home',
      support: 'Hai bisogno di aiuto? Contattaci a',
      auto:    'Nuovo tentativo in'
    },
    en: {
      title:   'Something went wrong',
      generic: 'An unexpected error occurred. Our team is already working to fix it.',
      network: 'It looks like you lost your connection. Check your network and try again.',
      loading: 'We couldn\'t load the content. The server may be temporarily busy.',
      timeout: 'The request took too long. The server is currently slow — please try again in a few seconds.',
      server:  'A server error occurred. We are working to fix it as soon as possible.',
      retry:   'Try Again',
      home:    'Back to Home',
      support: 'Need help? Contact us at',
      auto:    'Retrying in'
    },
    fr: {
      title:   'Quelque chose s\'est mal passé',
      generic: 'Une erreur inattendue s\'est produite. Notre équipe travaille déjà à la résoudre.',
      network: 'Il semble que vous ayez perdu votre connexion. Vérifiez votre réseau et réessayez.',
      loading: 'Nous n\'avons pas pu charger le contenu. Le serveur est peut-être temporairement occupé.',
      timeout: 'La requête a pris trop de temps. Le serveur est actuellement lent — réessayez dans quelques secondes.',
      server:  'Une erreur serveur s\'est produite. Nous travaillons à la résoudre dès que possible.',
      retry:   'Réessayer',
      home:    'Retour à l\'accueil',
      support: 'Besoin d\'aide ? Contactez-nous à',
      auto:    'Nouvelle tentative dans'
    },
    de: {
      title:   'Etwas ist schiefgelaufen',
      generic: 'Ein unerwarteter Fehler ist aufgetreten. Unser Team arbeitet bereits daran.',
      network: 'Es scheint, Sie haben Ihre Verbindung verloren. Prüfen Sie Ihr Netzwerk und versuchen Sie es erneut.',
      loading: 'Die Inhalte konnten nicht geladen werden. Der Server ist möglicherweise vorübergehend ausgelastet.',
      timeout: 'Die Anfrage hat zu lange gedauert. Der Server ist derzeit langsam — bitte versuchen Sie es in einigen Sekunden erneut.',
      server:  'Ein Serverfehler ist aufgetreten. Wir arbeiten daran, ihn so schnell wie möglich zu beheben.',
      retry:   'Erneut versuchen',
      home:    'Zurück zur Startseite',
      support: 'Brauchen Sie Hilfe? Kontaktieren Sie uns unter',
      auto:    'Neuer Versuch in'
    },
    es: {
      title:   'Algo salió mal',
      generic: 'Se produjo un error inesperado. Nuestro equipo ya está trabajando para resolverlo.',
      network: 'Parece que has perdido la conexión. Comprueba tu red e inténtalo de nuevo.',
      loading: 'No pudimos cargar el contenido. Es posible que el servidor esté temporalmente ocupado.',
      timeout: 'La solicitud tardó demasiado. El servidor está actualmente lento — inténtalo de nuevo en unos segundos.',
      server:  'Se produjo un error en el servidor. Estamos trabajando para resolverlo lo antes posible.',
      retry:   'Intentar de nuevo',
      home:    'Volver al inicio',
      support: 'Necesitas ayuda? Contáctanos en',
      auto:    'Reintentando en'
    }
  };

  var SUPPORT_EMAIL = 'support@luxhaven360.com';
  var VALID_TYPES   = ['generic', 'network', 'loading', 'timeout', 'server'];
  var _autoTimer    = null;

  /* ── Determina lingua corrente ─────────────────────────────────── */
  function _lang() {
    try {
      if (window.i18nPDP && window.i18nPDP()) return window.i18nPDP().currentLang || 'it';
      if (window.i18n   && window.i18n())    return window.i18n().currentLang    || 'it';
      var s = localStorage.getItem('lh360_lang');
      if (s && T[s]) return s;
    } catch (_) {}
    var nav = (navigator.language || '').slice(0, 2).toLowerCase();
    return T[nav] ? nav : 'it';
  }

  function _t(key) {
    var d = T[_lang()] || T.it;
    return d[key] || (T.it[key] || '');
  }

  /* ── Home path con prefisso lingua ─────────────────────────────── */
  function _homePath() {
    var lang = 'it';
    try { var s = localStorage.getItem('lh360_lang'); if (s && T[s]) lang = s; } catch (_) {}
    return 'https://luxhaven360.com/' + lang + '/';
  }

  /* ── Inietta stili ─────────────────────────────────────────────── */
  function _injectStyles() {
    if (document.getElementById('lux-error-styles')) return;
    var style = document.createElement('style');
    style.id = 'lux-error-styles';
    style.textContent = [
      '#lux-error-overlay{',
        'position:fixed;inset:0;z-index:99999;',
        'display:flex;align-items:center;justify-content:center;',
        'background:rgba(5,5,5,0.92);backdrop-filter:blur(12px);',
        '-webkit-backdrop-filter:blur(12px);',
        'opacity:0;transition:opacity 0.4s ease;padding:1.5rem;',
      '}',
      '#lux-error-overlay.lux-visible{opacity:1;pointer-events:auto;}',
      '#lux-error-overlay.lux-hidden{opacity:0;pointer-events:none;}',
      '.lux-error-card{',
        'background:linear-gradient(145deg,#141414 0%,#0e0e0e 100%);',
        'border:1px solid rgba(212,175,55,0.18);border-radius:2px;',
        'padding:3rem 3.5rem;max-width:520px;width:100%;text-align:center;',
        'position:relative;overflow:hidden;',
        'box-shadow:0 0 0 1px rgba(212,175,55,0.06) inset,0 40px 80px rgba(0,0,0,0.7),0 0 60px rgba(212,175,55,0.04);',
        'transform:translateY(16px);transition:transform 0.4s ease;',
      '}',
      '#lux-error-overlay.lux-visible .lux-error-card{transform:translateY(0);}',
      '.lux-error-card::before{',
        'content:\'\';position:absolute;top:0;left:0;right:0;height:1px;',
        'background:linear-gradient(90deg,transparent 0%,rgba(212,175,55,0.5) 50%,transparent 100%);',
      '}',
      '.lux-error-icon{',
        'width:56px;height:56px;margin:0 auto 1.75rem;',
        'border:1px solid rgba(212,175,55,0.25);border-radius:50%;',
        'display:flex;align-items:center;justify-content:center;',
        'background:rgba(212,175,55,0.06);position:relative;',
      '}',
      '.lux-error-icon::after{',
        'content:\'\';position:absolute;inset:-4px;border-radius:50%;',
        'border:1px solid rgba(212,175,55,0.08);',
      '}',
      '.lux-error-icon svg{width:22px;height:22px;stroke:#D4AF37;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}',
      '.lux-error-title{font-family:Georgia,serif;font-size:1.35rem;font-weight:400;color:#F5F5F5;letter-spacing:0.04em;margin:0 0 1rem;line-height:1.3;}',
      '.lux-error-message{font-family:Georgia,serif;font-size:0.9rem;color:rgba(245,245,245,0.5);line-height:1.7;margin:0 0 2rem;}',
      '.lux-error-actions{display:flex;flex-direction:column;gap:0.75rem;align-items:center;}',
      '.lux-error-btn-primary{',
        'display:inline-block;padding:0.75rem 2.25rem;',
        'background:linear-gradient(135deg,#D4AF37 0%,#B8941F 100%);',
        'color:#0A0A0A;font-family:Georgia,serif;font-size:0.82rem;',
        'letter-spacing:0.12em;text-transform:uppercase;border:none;cursor:pointer;',
        'border-radius:1px;transition:opacity 0.2s ease,transform 0.2s ease;',
        'text-decoration:none;width:100%;max-width:260px;font-weight:600;',
      '}',
      '.lux-error-btn-primary:hover{opacity:0.88;transform:translateY(-1px);}',
      '.lux-error-btn-secondary{',
        'display:inline-block;padding:0.7rem 2.25rem;',
        'background:transparent;color:rgba(245,245,245,0.45);',
        'font-family:Georgia,serif;font-size:0.78rem;letter-spacing:0.1em;',
        'text-transform:uppercase;border:1px solid rgba(245,245,245,0.12);',
        'cursor:pointer;border-radius:1px;transition:all 0.2s ease;',
        'text-decoration:none;width:100%;max-width:260px;',
      '}',
      '.lux-error-btn-secondary:hover{border-color:rgba(212,175,55,0.3);color:rgba(245,245,245,0.7);}',
      '.lux-error-support{margin-top:1.5rem;font-family:Georgia,serif;font-size:0.75rem;color:rgba(245,245,245,0.25);letter-spacing:0.02em;}',
      '.lux-error-support a{color:rgba(212,175,55,0.5);text-decoration:none;transition:color 0.2s;}',
      '.lux-error-support a:hover{color:rgba(212,175,55,0.8);}',
      '.lux-error-divider{width:32px;height:1px;background:rgba(212,175,55,0.2);margin:1.75rem auto;}',
      '.lux-error-auto{font-family:Georgia,serif;font-size:0.78rem;color:rgba(245,245,245,0.3);margin-top:0.75rem;letter-spacing:0.05em;}',
      '@media(max-width:480px){.lux-error-card{padding:2.25rem 1.75rem;}.lux-error-title{font-size:1.15rem;}}'
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Build SVG icona ───────────────────────────────────────────── */
  function _icon(type) {
    var svgs = {
      generic: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
      network: '<path d="M1 6s4-4 11-4 11 4 11 4"/><path d="M5 10s2.5-2.5 7-2.5 7 2.5 7 2.5"/><path d="M9 14s1-1 3-1 3 1 3 1"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
      loading: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      timeout: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      server:  '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'
    };
    return '<svg viewBox="0 0 24 24">' + (svgs[type] || svgs.generic) + '</svg>';
  }

  /* ════════════════════════════════════════════════════════════════════
     SHOW — mostra overlay errore
     @param {string}   type          - generic|network|loading|timeout|server
     @param {Function} retryCallback - se fornita, aggiunge pulsante Riprova
     @param {number}   autoRetryMs   - se >0, countdown auto-retry
  ════════════════════════════════════════════════════════════════════ */
  function show(type, retryCallback, autoRetryMs) {
    type = VALID_TYPES.indexOf(type) !== -1 ? type : 'generic';
    _injectStyles();
    _clearAutoTimer();

    /* Rimuovi overlay precedente */
    var existing = document.getElementById('lux-error-overlay');
    if (existing) existing.remove();

    var homePath = _homePath();
    var hasRetry = typeof retryCallback === 'function';

    var overlay = document.createElement('div');
    overlay.id = 'lux-error-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', _t('title'));

    overlay.innerHTML =
      '<div class="lux-error-card">' +
        '<div class="lux-error-icon">' + _icon(type) + '</div>' +
        '<h2 class="lux-error-title" id="lux-err-title">' + _t('title') + '</h2>' +
        '<p class="lux-error-message" id="lux-err-msg">' + _t(type) + '</p>' +
        '<div class="lux-error-divider"></div>' +
        '<div class="lux-error-actions">' +
          (hasRetry ? '<button class="lux-error-btn-primary" id="lux-retry-btn">' + _t('retry') + '</button>' : '') +
          '<a href="' + homePath + '" class="lux-error-btn-' + (hasRetry ? 'secondary' : 'primary') + '" id="lux-home-btn">' + _t('home') + '</a>' +
        '</div>' +
        (hasRetry && autoRetryMs > 0 ? '<p class="lux-error-auto" id="lux-auto-txt"></p>' : '') +
        '<p class="lux-error-support">' + _t('support') + ' <a href="mailto:' + SUPPORT_EMAIL + '">' + SUPPORT_EMAIL + '</a></p>' +
      '</div>';

    document.body.appendChild(overlay);

    /* Animazione entrata */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { overlay.classList.add('lux-visible'); });
    });

    /* Pulsante Riprova */
    if (hasRetry) {
      var retryBtn = overlay.querySelector('#lux-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', function () {
          hide();
          setTimeout(retryCallback, 300);
        });
      }
    }

    /* Auto-retry con countdown */
    if (hasRetry && autoRetryMs > 0) {
      var remaining = Math.ceil(autoRetryMs / 1000);
      var autoTxt   = overlay.querySelector('#lux-auto-txt');
      var _tick = function () {
        if (!autoTxt || !document.getElementById('lux-error-overlay')) return;
        autoTxt.textContent = _t('auto') + ' ' + remaining + 's…';
        if (remaining <= 0) {
          hide();
          setTimeout(retryCallback, 100);
          return;
        }
        remaining--;
        _autoTimer = setTimeout(_tick, 1000);
      };
      _autoTimer = setTimeout(_tick, 0);
    }
  }

  /* ── Nascondi ──────────────────────────────────────────────────── */
  function hide() {
    _clearAutoTimer();
    var overlay = document.getElementById('lux-error-overlay');
    if (!overlay) return;
    overlay.classList.remove('lux-visible');
    overlay.classList.add('lux-hidden');
    setTimeout(function () { if (overlay.parentNode) overlay.remove(); }, 450);
  }

  function isVisible() {
    var el = document.getElementById('lux-error-overlay');
    return !!(el && el.classList.contains('lux-visible'));
  }

  function _clearAutoTimer() {
    if (_autoTimer) { clearTimeout(_autoTimer); _autoTimer = null; }
  }

  /* ── Aggiorna testi se cambia lingua ───────────────────────────── */
  document.addEventListener('languageChanged', function () {
    var overlay = document.getElementById('lux-error-overlay');
    if (!overlay) return;
    var titleEl = overlay.querySelector('#lux-err-title');
    var retryBtn = overlay.querySelector('#lux-retry-btn');
    var homeBtn  = overlay.querySelector('#lux-home-btn');
    if (titleEl)  titleEl.textContent  = _t('title');
    if (retryBtn) retryBtn.textContent = _t('retry');
    if (homeBtn)  homeBtn.textContent  = _t('home');
    /* Il testo del messaggio non viene aggiornato:
       il tipo è noto solo all'istanza corrente. */
  });

  /* ════════════════════════════════════════════════════════════════════
     API PUBBLICA
  ════════════════════════════════════════════════════════════════════ */
  window.LuxError = { show: show, hide: hide, isVisible: isVisible };

})();
