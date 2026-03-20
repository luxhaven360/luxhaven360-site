/**
 * ============================================================
 *  error-handler.js v2 — LuxHaven360 Global Error Handler
 * ============================================================
 *
 *  NOVITÀ v2 rispetto a v1:
 *  - Aggiunto LuxError.toast() — notifiche toast leggere per
 *    errori non critici (usa LuxToast di lux-resilience.js se
 *    disponibile, altrimenti usa un sistema interno autonomo)
 *  - unhandledrejection: mostra toast per errori non critici
 *    invece di ignorarli silenziosamente
 *  - AbortError sempre ignorato (mai mostrato all'utente)
 *  - LuxError.show() invariato — mostra overlay per errori gravi
 *
 *  SETUP (invariato):
 *    <script src="error-handler.js" defer></script>    (root)
 *    <script src="../error-handler.js" defer></script>  (sub)
 *
 *  USO:
 *    LuxError.show()                    // Overlay errore generico
 *    LuxError.show('network')           // Problema di rete
 *    LuxError.show('loading', callback) // Con pulsante Riprova
 *    LuxError.toast('Messaggio', 'warning') // Toast non-bloccante
 *    LuxError.hide()                    // Chiudi overlay
 * ============================================================
 */

(function () {
  'use strict';

  /* ── Traduzioni overlay ─────────────────────────────────── */
  const TRANSLATIONS = {
    it: {
      title:   'Qualcosa è andato storto',
      network: 'Sembra che tu abbia perso la connessione. Controlla la tua rete e riprova.',
      loading: 'Non è stato possibile caricare i contenuti. Il server potrebbe essere temporaneamente occupato.',
      generic: 'Si è verificato un errore imprevisto. Il nostro team è già al lavoro per risolverlo.',
      retry:   'Riprova',
      home:    'Torna alla Home',
      support: 'Hai bisogno di aiuto? Contattaci a',
    },
    en: {
      title:   'Something went wrong',
      network: 'It looks like you lost your connection. Please check your network and try again.',
      loading: 'We couldn\'t load the content. The server may be temporarily busy.',
      generic: 'An unexpected error occurred. Our team is already working to fix it.',
      retry:   'Try Again',
      home:    'Back to Home',
      support: 'Need help? Contact us at',
    },
    fr: {
      title:   'Quelque chose s\'est mal passé',
      network: 'Il semble que vous ayez perdu votre connexion. Vérifiez votre réseau et réessayez.',
      loading: 'Nous n\'avons pas pu charger le contenu. Le serveur est peut-être temporairement occupé.',
      generic: 'Une erreur inattendue s\'est produite. Notre équipe travaille déjà à la résoudre.',
      retry:   'Réessayer',
      home:    'Retour à l\'accueil',
      support: 'Besoin d\'aide ? Contactez-nous à',
    },
    de: {
      title:   'Etwas ist schiefgelaufen',
      network: 'Es scheint, dass Sie Ihre Verbindung verloren haben. Bitte prüfen Sie Ihr Netzwerk und versuchen Sie es erneut.',
      loading: 'Die Inhalte konnten nicht geladen werden. Der Server ist möglicherweise vorübergehend ausgelastet.',
      generic: 'Ein unerwarteter Fehler ist aufgetreten. Unser Team arbeitet bereits daran, ihn zu beheben.',
      retry:   'Erneut versuchen',
      home:    'Zurück zur Startseite',
      support: 'Brauchen Sie Hilfe? Kontaktieren Sie uns unter',
    },
    es: {
      title:   'Algo salió mal',
      network: 'Parece que has perdido la conexión. Comprueba tu red e inténtalo de nuevo.',
      loading: 'No pudimos cargar el contenido. Es posible que el servidor esté temporalmente ocupado.',
      generic: 'Se produjo un error inesperado. Nuestro equipo ya está trabajando para resolverlo.',
      retry:   'Intentar de nuevo',
      home:    'Volver al inicio',
      support: 'Necesitas ayuda? Contáctanos en',
    },
  };

  const SUPPORT_EMAIL = 'support@luxhaven360.com';

  function getLang() {
    if (window.i18nPDP && window.i18nPDP()) return window.i18nPDP().currentLang || 'it';
    if (window.i18n   && window.i18n())    return window.i18n().currentLang   || 'it';
    try {
      const stored = localStorage.getItem('lh360_lang');
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch(e) {}
    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    return TRANSLATIONS[nav] ? nav : 'it';
  }

  function t(type) {
    const dict = TRANSLATIONS[getLang()] || TRANSLATIONS.it;
    return dict[type] || TRANSLATIONS.it[type] || '';
  }

  /* ── Stili overlay ──────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('lux-error-styles')) return;
    const style = document.createElement('style');
    style.id = 'lux-error-styles';
    style.textContent = `
      #lux-error-overlay {
        position:fixed;inset:0;z-index:99999;
        display:flex;align-items:center;justify-content:center;
        background:rgba(5,5,5,0.92);backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
        opacity:0;transition:opacity .4s ease;padding:1.5rem;
      }
      #lux-error-overlay.lux-visible { opacity:1; }
      #lux-error-overlay.lux-hidden  { opacity:0;pointer-events:none; }
      .lux-error-card {
        background:linear-gradient(145deg,#141414 0%,#0e0e0e 100%);
        border:1px solid rgba(212,175,55,.18);border-radius:2px;
        padding:3rem 3.5rem;max-width:520px;width:100%;
        text-align:center;position:relative;overflow:hidden;
        box-shadow:0 0 0 1px rgba(212,175,55,.06) inset,
                   0 40px 80px rgba(0,0,0,.7),
                   0 0 60px rgba(212,175,55,.04);
        transform:translateY(16px);transition:transform .4s ease;
      }
      #lux-error-overlay.lux-visible .lux-error-card { transform:translateY(0); }
      .lux-error-card::before {
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent 0%,rgba(212,175,55,.5) 50%,transparent 100%);
      }
      .lux-error-icon {
        width:56px;height:56px;margin:0 auto 1.75rem;
        border:1px solid rgba(212,175,55,.25);border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        background:rgba(212,175,55,.06);position:relative;
      }
      .lux-error-icon::after {
        content:'';position:absolute;inset:-4px;border-radius:50%;
        border:1px solid rgba(212,175,55,.08);
      }
      .lux-error-icon svg { width:22px;height:22px;stroke:#D4AF37;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round; }
      .lux-error-title { font-family:Georgia,serif;font-size:1.35rem;font-weight:400;color:#F5F5F5;letter-spacing:.04em;margin:0 0 1rem;line-height:1.3; }
      .lux-error-message { font-family:Georgia,serif;font-size:.9rem;color:rgba(245,245,245,.5);line-height:1.7;margin:0 0 2rem; }
      .lux-error-actions { display:flex;flex-direction:column;gap:.75rem;align-items:center; }
      .lux-error-btn-primary {
        display:inline-block;padding:.75rem 2.25rem;
        background:linear-gradient(135deg,#D4AF37 0%,#B8941F 100%);
        color:#0A0A0A;font-family:Georgia,serif;font-size:.82rem;
        letter-spacing:.12em;text-transform:uppercase;border:none;
        cursor:pointer;border-radius:1px;transition:opacity .2s,transform .2s;
        text-decoration:none;width:100%;max-width:260px;font-weight:600;
      }
      .lux-error-btn-primary:hover { opacity:.88;transform:translateY(-1px); }
      .lux-error-btn-secondary {
        display:inline-block;padding:.7rem 2.25rem;background:transparent;
        color:rgba(245,245,245,.45);font-family:Georgia,serif;font-size:.78rem;
        letter-spacing:.1em;text-transform:uppercase;
        border:1px solid rgba(245,245,245,.12);cursor:pointer;border-radius:1px;
        transition:all .2s;text-decoration:none;width:100%;max-width:260px;
      }
      .lux-error-btn-secondary:hover { border-color:rgba(212,175,55,.3);color:rgba(245,245,245,.7); }
      .lux-error-support { margin-top:1.5rem;font-family:Georgia,serif;font-size:.75rem;color:rgba(245,245,245,.25);letter-spacing:.02em; }
      .lux-error-support a { color:rgba(212,175,55,.5);text-decoration:none;transition:color .2s; }
      .lux-error-support a:hover { color:rgba(212,175,55,.8); }
      .lux-error-divider { width:32px;height:1px;background:rgba(212,175,55,.2);margin:1.75rem auto; }
      @media(max-width:480px) {
        .lux-error-card { padding:2.25rem 1.75rem; }
        .lux-error-title { font-size:1.15rem; }
      }
    `;
    document.head.appendChild(style);
  }

  function getHomePath() {
    let lang = 'it';
    try {
      const stored = localStorage.getItem('lh360_lang');
      if (stored && TRANSLATIONS[stored]) lang = stored;
    } catch(e) {}
    return 'https://luxhaven360.com/' + lang + '/';
  }

  /* ── Overlay principale (errori gravi) ──────────────────── */
  function show(type, retryCallback) {
    type = type || 'generic';
    injectStyles();

    const existing = document.getElementById('lux-error-overlay');
    if (existing) existing.remove();

    const homePath   = getHomePath();
    const hasRetry   = typeof retryCallback === 'function';
    const messageKey = ['network', 'loading', 'generic'].includes(type) ? type : 'generic';

    const overlay = document.createElement('div');
    overlay.id = 'lux-error-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', t('title'));
    overlay.innerHTML = `
      <div class="lux-error-card">
        <div class="lux-error-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 class="lux-error-title">${t('title')}</h2>
        <p class="lux-error-message">${t(messageKey)}</p>
        <div class="lux-error-divider"></div>
        <div class="lux-error-actions">
          ${hasRetry ? `<button class="lux-error-btn-primary" id="lux-retry-btn">${t('retry')}</button>` : ''}
          <a href="${homePath}" class="lux-error-btn-${hasRetry ? 'secondary' : 'primary'}">${t('home')}</a>
        </div>
        <p class="lux-error-support">
          ${t('support')} <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
        </p>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('lux-visible')));

    if (hasRetry) {
      overlay.querySelector('#lux-retry-btn').addEventListener('click', () => {
        hide();
        setTimeout(retryCallback, 300);
      });
    }
  }

  function hide() {
    const overlay = document.getElementById('lux-error-overlay');
    if (!overlay) return;
    overlay.classList.remove('lux-visible');
    overlay.classList.add('lux-hidden');
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 450);
  }

  /* ── Toast — notifiche leggere non-bloccanti ────────────── */
  /**
   * Mostra un toast non-bloccante.
   * Usa LuxToast (lux-resilience.js) se disponibile, altrimenti
   * delega all'overlay compatto interno.
   *
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} [type='warning']
   * @param {number} [durationMs=5000]
   */
  function toast(message, type, durationMs) {
    type       = type       || 'warning';
    durationMs = (durationMs !== undefined) ? durationMs : 5000;

    /* Preferisci LuxToast di lux-resilience.js se disponibile */
    if (window.LuxToast) {
      window.LuxToast.show(message, type, durationMs);
      return;
    }

    /* Fallback autonomo: banner compatto in fondo a destra */
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () {
        toast(message, type, durationMs);
      });
      return;
    }

    const COLORS = {
      info:    { bg: '#1a1a1e', border: 'rgba(212,175,55,.4)',  text: '#D4AF37', icon: 'ℹ' },
      success: { bg: '#1a1a1e', border: 'rgba(16,185,129,.45)', text: '#10b981', icon: '✓' },
      warning: { bg: '#1a1a1e', border: 'rgba(251,191,36,.45)', text: '#fbbf24', icon: '⚠' },
      error:   { bg: '#1a1a1e', border: 'rgba(239,68,68,.45)',  text: '#f87171', icon: '✕' },
    };
    const c = COLORS[type] || COLORS.warning;

    /* Inietta container se non esiste */
    let container = document.getElementById('lux-fallback-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'lux-fallback-toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:100001;display:flex;flex-direction:column;gap:8px;max-width:360px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.style.cssText = `
      display:flex;align-items:center;gap:10px;
      background:${c.bg};border:1px solid ${c.border};border-radius:10px;
      padding:12px 16px;box-shadow:0 8px 32px rgba(0,0,0,.65);
      opacity:0;transform:translateX(16px);
      transition:opacity .3s,transform .3s;
      pointer-events:all;cursor:pointer;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      font-size:.84rem;color:#e4e4e7;line-height:1.4;
      backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    `;
    el.innerHTML = `<span style="color:${c.text}">${c.icon}</span><span style="flex:1">${message}</span>`;
    el.addEventListener('click', () => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(16px)';
      setTimeout(() => el.remove(), 350);
    });

    container.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateX(0)';
    }));

    if (durationMs > 0) {
      setTimeout(() => {
        el.style.opacity   = '0';
        el.style.transform = 'translateX(16px)';
        setTimeout(() => el.remove(), 350);
      }, durationMs);
    }
  }

  /* ── languageChanged: aggiorna overlay se visibile ─────── */
  document.addEventListener('languageChanged', () => {
    const overlay = document.getElementById('lux-error-overlay');
    if (!overlay) return;
    const card   = overlay.querySelector('.lux-error-card');
    if (!card) return;
    const titleEl  = card.querySelector('.lux-error-title');
    const retryBtn = card.querySelector('#lux-retry-btn');
    const homeBtn  = card.querySelector('a.lux-error-btn-primary, a.lux-error-btn-secondary');
    const supEl    = card.querySelector('.lux-error-support');
    if (titleEl)  titleEl.textContent  = t('title');
    if (retryBtn) retryBtn.textContent = t('retry');
    if (homeBtn)  homeBtn.textContent  = t('home');
    if (supEl)    supEl.innerHTML      = `${t('support')} <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
  });

  /* ── unhandledrejection — v2: toast per errori non critici ── */
  window.addEventListener('unhandledrejection', function (event) {
    const reason = event.reason;
    if (!reason) return;

    /* AbortError = sempre ignorato (timeout GAS, navigazione) */
    if (reason.name === 'AbortError') return;

    const msg = (reason instanceof Error ? reason.message : String(reason)).toLowerCase();

    /* Errori di rete transitori → toast warning (non overlay) */
    if (msg.includes('failed to fetch') || msg.includes('network') ||
        msg.includes('http 5') || msg.includes('http 429')) {
      toast(TRANSLATIONS[getLang()].loading, 'warning', 5000);
      return;
    }

    /* Circuit breaker aperto (da LuxRetry) → toast info */
    if (msg.includes('circuit open')) {
      toast(TRANSLATIONS[getLang()].loading, 'info', 4000);
      return;
    }

    /* Errori applicativi non previsti: commentato di default per non
       essere invasivo. Decommenta per mostrare overlay sugli errori gravi:
       show('generic'); */
  });

  /* ── API pubblica ───────────────────────────────────────── */
  window.LuxError = { show, hide, toast };

})();
