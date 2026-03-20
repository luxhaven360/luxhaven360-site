/**
 * ============================================================
 *  error-handler.js — LuxHaven360 Global Error Handler  v1.1
 * ============================================================
 *
 *  Mostra un messaggio di errore elegante, multilingua e
 *  non tecnico in caso di errori interni o di caricamento.
 *
 *  CHANGELOG v1.1:
 *
 *  ✅ FIX 1 — unhandledrejection: filtra AbortError e TimeoutError
 *     Le rejection da AbortController (navigazione BFCache o timeout
 *     GAS) non sono errori applicativi. Vengono silenziosamente
 *     ignorati senza attivare nessuna logica di overlay.
 *
 *  ✅ FIX 2 — LuxError.isNavAbort(err)
 *     Funzione di utilità pubblica. script.js e altri script
 *     devono chiamarla all'inizio di ogni catch() prima di
 *     decidere se mostrare l'overlay o meno.
 *     USO:
 *       .catch(function(err) {
 *         if (LuxError.isNavAbort(err)) return;
 *         LuxError.show('loading', retryFn);
 *       });
 *
 *  ✅ FIX 3 — LuxError.safeShow(type, retryCallback)
 *     Variante "sicura" di LuxError.show() che:
 *     • controlla automaticamente se la pagina sta per essere
 *       congelata (window.__lhPageHiding) prima di mostrare l'overlay
 *     • verifica che l'overlay non sia già visibile
 *     Sostituisce le chiamate dirette a LuxError.show() nei
 *     catch() delle fetch in script.js per massima sicurezza.
 *
 *  SETUP (invariato):
 *   Aggiungi questo script PRIMA di tutti gli altri script:
 *   <script src="../error-handler.js"></script>    (da product-details/)
 *   <script src="error-handler.js"></script>       (da root)
 *
 *  USO NEL CODICE:
 *   LuxError.show('network');                 // overlay immediato
 *   LuxError.safeShow('loading', retryFn);   // ✅ preferito nei catch()
 *   LuxError.isNavAbort(err);                // → true/false
 *   LuxError.hide();                         // nasconde overlay
 * ============================================================
 */

(function () {
  'use strict';

  // ─── Traduzioni ───────────────────────────────────────────
  const TRANSLATIONS = {
    it: {
      title:      'Qualcosa è andato storto',
      network:    'Sembra che tu abbia perso la connessione. Controlla la tua rete e riprova.',
      loading:    'Non è stato possibile caricare i contenuti. Il server potrebbe essere temporaneamente occupato.',
      generic:    'Si è verificato un errore imprevisto. Il nostro team è già al lavoro per risolverlo.',
      retry:      'Riprova',
      home:       'Torna alla Home',
      support:    'Hai bisogno di aiuto? Contattaci a',
    },
    en: {
      title:      'Something went wrong',
      network:    'It looks like you lost your connection. Please check your network and try again.',
      loading:    'We couldn\'t load the content. The server may be temporarily busy.',
      generic:    'An unexpected error occurred. Our team is already working to fix it.',
      retry:      'Try Again',
      home:       'Back to Home',
      support:    'Need help? Contact us at',
    },
    fr: {
      title:      'Quelque chose s\'est mal passé',
      network:    'Il semble que vous ayez perdu votre connexion. Vérifiez votre réseau et réessayez.',
      loading:    'Nous n\'avons pas pu charger le contenu. Le serveur est peut-être temporairement occupé.',
      generic:    'Une erreur inattendue s\'est produite. Notre équipe travaille déjà à la résoudre.',
      retry:      'Réessayer',
      home:       'Retour à l\'accueil',
      support:    'Besoin d\'aide ? Contactez-nous à',
    },
    de: {
      title:      'Etwas ist schiefgelaufen',
      network:    'Es scheint, dass Sie Ihre Verbindung verloren haben. Bitte prüfen Sie Ihr Netzwerk und versuchen Sie es erneut.',
      loading:    'Die Inhalte konnten nicht geladen werden. Der Server ist möglicherweise vorübergehend ausgelastet.',
      generic:    'Ein unerwarteter Fehler ist aufgetreten. Unser Team arbeitet bereits daran, ihn zu beheben.',
      retry:      'Erneut versuchen',
      home:       'Zurück zur Startseite',
      support:    'Brauchen Sie Hilfe? Kontaktieren Sie uns unter',
    },
    es: {
      title:      'Algo salió mal',
      network:    'Parece que has perdido la conexión. Comprueba tu red e inténtalo de nuevo.',
      loading:    'No pudimos cargar el contenido. Es posible que el servidor esté temporalmente ocupado.',
      generic:    'Se produjo un error inesperado. Nuestro equipo ya está trabajando para resolverlo.',
      retry:      'Intentar de nuevo',
      home:       'Volver al inicio',
      support:    'Necesitas ayuda? Contáctanos en',
    },
  };

  const SUPPORT_EMAIL = 'support@luxhaven360.com';

  // ─── Determina la lingua corrente ─────────────────────────
  function getLang() {
    if (window.i18nPDP && window.i18nPDP()) return window.i18nPDP().currentLang || 'it';
    if (window.i18n && window.i18n()) return window.i18n().currentLang || 'it';
    const stored = localStorage.getItem('lh360_lang');
    if (stored && TRANSLATIONS[stored]) return stored;
    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (TRANSLATIONS[nav]) return nav;
    return 'it';
  }

  function t(type) {
    const lang = getLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.it;
    return dict[type] || TRANSLATIONS.it[type] || '';
  }

  // ─── Inietta stili (una volta sola) ───────────────────────
  function injectStyles() {
    if (document.getElementById('lux-error-styles')) return;
    const style = document.createElement('style');
    style.id = 'lux-error-styles';
    style.textContent = `
      #lux-error-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(5, 5, 5, 0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        opacity: 0;
        transition: opacity 0.4s ease;
        padding: 1.5rem;
      }
      #lux-error-overlay.lux-visible {
        opacity: 1;
      }
      #lux-error-overlay.lux-hidden {
        opacity: 0;
        pointer-events: none;
      }
      .lux-error-card {
        background: linear-gradient(145deg, #141414 0%, #0e0e0e 100%);
        border: 1px solid rgba(212, 175, 55, 0.18);
        border-radius: 2px;
        padding: 3rem 3.5rem;
        max-width: 520px;
        width: 100%;
        text-align: center;
        position: relative;
        overflow: hidden;
        box-shadow:
          0 0 0 1px rgba(212, 175, 55, 0.06) inset,
          0 40px 80px rgba(0, 0, 0, 0.7),
          0 0 60px rgba(212, 175, 55, 0.04);
        transform: translateY(16px);
        transition: transform 0.4s ease;
      }
      #lux-error-overlay.lux-visible .lux-error-card {
        transform: translateY(0);
      }
      .lux-error-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(212, 175, 55, 0.5) 50%,
          transparent 100%
        );
      }
      .lux-error-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 1.75rem;
        border: 1px solid rgba(212, 175, 55, 0.25);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(212, 175, 55, 0.06);
        position: relative;
      }
      .lux-error-icon::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 1px solid rgba(212, 175, 55, 0.08);
      }
      .lux-error-icon svg {
        width: 22px;
        height: 22px;
        stroke: #D4AF37;
        fill: none;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .lux-error-title {
        font-family: Georgia, serif;
        font-size: 1.35rem;
        font-weight: 400;
        color: #F5F5F5;
        letter-spacing: 0.04em;
        margin: 0 0 1rem;
        line-height: 1.3;
      }
      .lux-error-message {
        font-family: Georgia, serif;
        font-size: 0.9rem;
        color: rgba(245, 245, 245, 0.5);
        line-height: 1.7;
        margin: 0 0 2rem;
      }
      .lux-error-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        align-items: center;
      }
      .lux-error-btn-primary {
        display: inline-block;
        padding: 0.75rem 2.25rem;
        background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
        color: #0A0A0A;
        font-family: Georgia, serif;
        font-size: 0.82rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        border: none;
        cursor: pointer;
        border-radius: 1px;
        transition: opacity 0.2s ease, transform 0.2s ease;
        text-decoration: none;
        width: 100%;
        max-width: 260px;
        font-weight: 600;
      }
      .lux-error-btn-primary:hover {
        opacity: 0.88;
        transform: translateY(-1px);
      }
      .lux-error-btn-secondary {
        display: inline-block;
        padding: 0.7rem 2.25rem;
        background: transparent;
        color: rgba(245, 245, 245, 0.45);
        font-family: Georgia, serif;
        font-size: 0.78rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        border: 1px solid rgba(245, 245, 245, 0.12);
        cursor: pointer;
        border-radius: 1px;
        transition: all 0.2s ease;
        text-decoration: none;
        width: 100%;
        max-width: 260px;
      }
      .lux-error-btn-secondary:hover {
        border-color: rgba(212, 175, 55, 0.3);
        color: rgba(245, 245, 245, 0.7);
      }
      .lux-error-support {
        margin-top: 1.5rem;
        font-family: Georgia, serif;
        font-size: 0.75rem;
        color: rgba(245, 245, 245, 0.25);
        letter-spacing: 0.02em;
      }
      .lux-error-support a {
        color: rgba(212, 175, 55, 0.5);
        text-decoration: none;
        transition: color 0.2s;
      }
      .lux-error-support a:hover {
        color: rgba(212, 175, 55, 0.8);
      }
      .lux-error-divider {
        width: 32px;
        height: 1px;
        background: rgba(212, 175, 55, 0.2);
        margin: 1.75rem auto;
      }
      @media (max-width: 480px) {
        .lux-error-card {
          padding: 2.25rem 1.75rem;
        }
        .lux-error-title { font-size: 1.15rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Determina la root path per il link Home ──────────────
  function getHomePath() {
    var lang = 'it';
    try {
      var stored = localStorage.getItem('lh360_lang');
      if (stored && TRANSLATIONS[stored]) lang = stored;
    } catch(e) {}
    return 'https://luxhaven360.com/' + lang + '/';
  }

  // ─── Costruisce e mostra l'overlay ────────────────────────
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
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('lux-visible'));
    });

    if (hasRetry) {
      const retryBtn = overlay.querySelector('#lux-retry-btn');
      retryBtn.addEventListener('click', () => {
        hide();
        setTimeout(retryCallback, 300);
      });
    }
  }

  // ─── Nasconde l'overlay ───────────────────────────────────
  function hide() {
    const overlay = document.getElementById('lux-error-overlay');
    if (!overlay) return;
    overlay.classList.remove('lux-visible');
    overlay.classList.add('lux-hidden');
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 450);
  }

  // ─── Aggiorna testi se cambia lingua ─────────────────────
  document.addEventListener('languageChanged', () => {
    const overlay = document.getElementById('lux-error-overlay');
    if (!overlay) return;
    const card = overlay.querySelector('.lux-error-card');
    if (!card) return;
    const titleEl   = card.querySelector('.lux-error-title');
    const retryBtn  = card.querySelector('#lux-retry-btn');
    const homeBtn   = card.querySelector('a.lux-error-btn-primary, a.lux-error-btn-secondary');
    const supportEl = card.querySelector('.lux-error-support');
    if (titleEl)   titleEl.textContent  = t('title');
    if (retryBtn)  retryBtn.textContent  = t('retry');
    if (homeBtn)   homeBtn.textContent   = t('home');
    if (supportEl) supportEl.innerHTML = `${t('support')} <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
  });

  // ─── Intercetta errori JS globali non gestiti ─────────────
  window.addEventListener('unhandledrejection', function (event) {
    const reason = event.reason;
    if (!reason) return;

    /*
     * ✅ FIX 1: filtra AbortError e TimeoutError.
     * Provengono da navigazione BFCache (bfcache-guard pagehide)
     * o da timeout GAS (siteguard wrap A). Non sono errori
     * applicativi e non devono attivare nessuna logica di errore.
     */
    const name = reason.name || '';
    if (name === 'AbortError' || name === 'TimeoutError') return;

    const msg = (reason.message || '').toLowerCase();
    const isNetworkErr = msg.includes('failed to fetch') ||
                         msg.includes('networkerror')    ||
                         msg.includes('connection');
    if (isNetworkErr) return;

    /* Errori applicativi non gestiti: opzionale — decommenta se necessario */
    // show('generic');
  });

  // ─── isNavAbort — utilità pubblica ────────────────────────
  /*
   * ✅ FIX 2: LuxError.isNavAbort(err)
   * Ritorna true se err è un AbortError o TimeoutError da sistema
   * (navigazione, pagehide, timeout GAS). Usare nei catch():
   *
   *   .catch(function(err) {
   *     if (LuxError.isNavAbort(err)) return;   // silenzioso
   *     LuxError.show('loading', retryFn);
   *   });
   */
  function isNavAbort(err) {
    if (!err) return false;
    var name = err.name || '';
    /* Delega a __lhIsNavAbort se disponibile (bfcache-guard) */
    if (typeof window.__lhIsNavAbort === 'function') {
      return window.__lhIsNavAbort(err);
    }
    /* Fallback: qualsiasi AbortError o TimeoutError è da navigazione */
    return name === 'AbortError' || name === 'TimeoutError';
  }

  // ─── safeShow — show() con guard automatico ───────────────
  /*
   * ✅ FIX 3: LuxError.safeShow(type, retryCallback)
   * Prima di mostrare l'overlay verifica:
   *  1. La pagina NON sta per essere congelata (BFCache pagehide)
   *  2. L'overlay non è già visibile
   * Sostituisce le chiamate dirette a LuxError.show() in script.js
   * per evitare overlay spurî durante la navigazione back/forward.
   */
  function safeShow(type, retryCallback) {
    /* Non mostrare se la pagina sta per andare in BFCache */
    if (window.__lhPageHiding) return;
    /* Non mostrare se l'overlay è già visibile */
    if (document.getElementById('lux-error-overlay')) return;
    show(type, retryCallback);
  }

  // ─── API pubblica ─────────────────────────────────────────
  window.LuxError = { show, hide, isNavAbort, safeShow };

})();
