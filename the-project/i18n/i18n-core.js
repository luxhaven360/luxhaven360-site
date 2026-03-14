/**
 * ============================================================
 * I18N CORE ENGINE — community-hub.html
 * v1.0 | Modular Translation System
 * ============================================================
 *
 * UTILIZZO RAPIDO:
 *   // Tradurre un elemento HTML
 *   <span data-i18n="post.like">Mi piace</span>
 *
 *   // Con interpolazione
 *   <span data-i18n="post.likes" data-i18n-vars='{"count":42}'>42 Mi piace</span>
 *
 *   // Placeholder di un input
 *   <input data-i18n-placeholder="search.placeholder">
 *
 *   // Attributo title/aria-label
 *   <button data-i18n-title="btn.close" data-i18n-aria-label="btn.close">×</button>
 *
 *   // Da JavaScript
 *   I18n.t('post.like')            → 'Like'
 *   I18n.t('post.likes', {count:5}) → '5 likes'
 *   I18n.setLanguage('en')
 *   I18n.getCurrentLanguage()      → 'en'
 *
 * ============================================================
 */

(function (global) {
  'use strict';

  // ─── CONFIGURAZIONE ──────────────────────────────────────────────────────────

  const CONFIG = {
    defaultLanguage:    'it',
    fallbackLanguage:   'it',
    supportedLanguages: ['it', 'en', 'fr', 'de', 'es'],
    storageKey:         'lh360_lang', // ✅ FIX: unificato con lh360_lang del sito,
    autoTranslateKey:   'community_hub_auto_translate',
    domAttr:            'data-i18n',
    domAttrPlaceholder: 'data-i18n-placeholder',
    domAttrTitle:       'data-i18n-title',
    domAttrAriaLabel:   'data-i18n-aria-label',
    domAttrVars:        'data-i18n-vars',
    domAttrHtml:        'data-i18n-html',        // permette HTML nel valore
    observeDOM:         true,                     // aggiorna elementi aggiunti dinamicamente
    debugMode:          false,
  };

  // ─── STATO INTERNO ───────────────────────────────────────────────────────────

  const state = {
    currentLanguage:   null,
    translations:      {},      // { lang: { key: value } }
    loadedLanguages:   new Set(),
    domObserver:       null,
    listeners:         [],      // callback on language change
    missingKeys:       new Set(),
  };

  // ─── UTILITY ─────────────────────────────────────────────────────────────────

  function log(...args) {
    if (CONFIG.debugMode) console.log('[I18n]', ...args);
  }

  function warn(...args) {
    console.warn('[I18n]', ...args);
  }

  /**
   * Interpola variabili nella stringa.
   * "{count} mi piace" + {count:5} → "5 mi piace"
   */
  function interpolate(str, vars) {
    if (!vars || typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return Object.prototype.hasOwnProperty.call(vars, key)
        ? vars[key]
        : match;
    });
  }

  /**
   * Rileva la lingua del browser, normalizzata al codice a 2 lettere.
   */
  function getBrowserLanguage() {
    const raw = (navigator.language || navigator.userLanguage || 'it').toLowerCase();
    const code = raw.split('-')[0];
    return CONFIG.supportedLanguages.includes(code) ? code : CONFIG.defaultLanguage;
  }

  /**
   * Legge la lingua preferita dell'utente (localStorage → browser → default).
   */
  function resolveInitialLanguage() {
    // 1. Prefisso lingua nell'URL (es. /it/the-project/community-hub)
    const pathMatch = window.location.pathname.match(/^\/(it|en|fr|de|es)(\/|$)/);
    if (pathMatch && CONFIG.supportedLanguages.includes(pathMatch[1])) {
      log('Lingua da URL path:', pathMatch[1]);
      try { localStorage.setItem(CONFIG.storageKey, pathMatch[1]); } catch (e) {}
      return pathMatch[1];
    }
    // 2. localStorage
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored && CONFIG.supportedLanguages.includes(stored)) {
        log('Lingua da localStorage:', stored);
        return stored;
      }
    } catch (e) {}
    const browser = getBrowserLanguage();
    log('Lingua dal browser:', browser);
    return browser;
  }

  // ─── CARICAMENTO TRADUZIONI ──────────────────────────────────────────────────

  /**
   * Registra un dizionario di traduzioni (usato dai file translations/*.js).
   * I file di traduzione si auto-registrano via window.I18N_TRANSLATIONS.
   */
  function registerTranslations(lang, dict) {
    if (!state.translations[lang]) state.translations[lang] = {};
    Object.assign(state.translations[lang], dict);
    state.loadedLanguages.add(lang);
    log(`Traduzioni registrate: ${lang} (${Object.keys(dict).length} chiavi)`);
  }

  /**
   * Sincronizza le traduzioni già caricate da window.I18N_TRANSLATIONS.
   */
  function syncFromGlobal() {
    const src = global.I18N_TRANSLATIONS || {};
    Object.keys(src).forEach(lang => {
      registerTranslations(lang, src[lang]);
    });
  }

  // ─── TRADUZIONE ───────────────────────────────────────────────────────────────

  /**
   * Traduce una chiave nella lingua corrente.
   * Fallback automatico alla lingua base (it).
   *
   * @param {string} key     - Chiave di traduzione (es: 'post.like')
   * @param {object} [vars]  - Variabili di interpolazione (es: {count:5})
   * @param {string} [lang]  - Lingua specifica (opzionale, default: corrente)
   * @returns {string}
   */
  function t(key, vars, lang) {
    const targetLang = lang || state.currentLanguage || CONFIG.defaultLanguage;

    // 1. Lingua richiesta
    let value = state.translations[targetLang]?.[key];

    // 2. Fallback alla lingua base
    if (value === undefined && targetLang !== CONFIG.fallbackLanguage) {
      value = state.translations[CONFIG.fallbackLanguage]?.[key];
      if (value !== undefined) {
        log(`Fallback su '${CONFIG.fallbackLanguage}' per chiave: ${key}`);
      }
    }

    // 3. Chiave non trovata
    if (value === undefined) {
      if (!state.missingKeys.has(key)) {
        warn(`Chiave mancante: '${key}' [${targetLang}]`);
        state.missingKeys.add(key);
      }
      return key; // Ritorna la chiave grezza come ultimo fallback visivo
    }

    return interpolate(value, vars);
  }

  // ─── APPLICAZIONE AL DOM ─────────────────────────────────────────────────────

  /**
   * Applica le traduzioni a un singolo elemento DOM.
   */
  function translateElement(el) {
    // Testo principale: data-i18n="chiave"
    const key = el.getAttribute(CONFIG.domAttr);
    if (key) {
      let vars = null;
      const rawVars = el.getAttribute(CONFIG.domAttrVars);
      if (rawVars) {
        try { vars = JSON.parse(rawVars); } catch (e) { warn('data-i18n-vars non valido:', rawVars); }
      }

      const translated = t(key, vars);
      const useHtml = el.hasAttribute(CONFIG.domAttrHtml);

      if (useHtml) {
        el.innerHTML = translated;
      } else {
        // Preserva i nodi figli (es. icone SVG) aggiornando solo i TextNode
        const firstText = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        if (firstText) {
          firstText.textContent = translated;
        } else if (el.childNodes.length === 0) {
          el.textContent = translated;
        } else {
          // Elemento misto testo+figli: aggiunge/aggiorna primo TextNode
          el.insertBefore(document.createTextNode(translated), el.firstChild);
        }
      }
    }

    // Placeholder: data-i18n-placeholder="chiave"
    const phKey = el.getAttribute(CONFIG.domAttrPlaceholder);
    if (phKey) el.setAttribute('placeholder', t(phKey));

    // Title: data-i18n-title="chiave"
    const titleKey = el.getAttribute(CONFIG.domAttrTitle);
    if (titleKey) el.setAttribute('title', t(titleKey));

    // Aria-label: data-i18n-aria-label="chiave"
    const ariaKey = el.getAttribute(CONFIG.domAttrAriaLabel);
    if (ariaKey) el.setAttribute('aria-label', t(ariaKey));
  }

  /**
   * Applica le traduzioni a tutti gli elementi nel sottoalbero DOM.
   * @param {Element} [root=document] - Radice da cui cercare
   */
  function translateDOM(root) {
    const container = root || document;
    const selector = [
      `[${CONFIG.domAttr}]`,
      `[${CONFIG.domAttrPlaceholder}]`,
      `[${CONFIG.domAttrTitle}]`,
      `[${CONFIG.domAttrAriaLabel}]`,
    ].join(',');

    const elements = container.querySelectorAll(selector);
    elements.forEach(translateElement);

    // Aggiorna anche la radice stessa se ha attributi i18n
    if (root && root.hasAttribute) {
      if (
        root.hasAttribute(CONFIG.domAttr) ||
        root.hasAttribute(CONFIG.domAttrPlaceholder) ||
        root.hasAttribute(CONFIG.domAttrTitle) ||
        root.hasAttribute(CONFIG.domAttrAriaLabel)
      ) {
        translateElement(root);
      }
    }

    log(`Tradotti ${elements.length} elementi`);
  }

  // ─── MUTATION OBSERVER (contenuti dinamici) ──────────────────────────────────

  /**
   * Avvia l'observer per tradurre automaticamente gli elementi aggiunti dinamicamente.
   */
  function startDOMObserver() {
    if (!CONFIG.observeDOM || state.domObserver) return;

    state.domObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          // Traduce il nuovo nodo e tutti i suoi discendenti
          translateDOM(node);
        });
      });
    });

    state.domObserver.observe(document.body, {
      childList: true,
      subtree:   true,
    });

    log('MutationObserver avviato');
  }

  function stopDOMObserver() {
    if (state.domObserver) {
      state.domObserver.disconnect();
      state.domObserver = null;
      log('MutationObserver fermato');
    }
  }

  // ─── GESTIONE LINGUA ─────────────────────────────────────────────────────────

  /**
   * Cambia la lingua attiva e aggiorna tutto il DOM.
   * @param {string} lang - Codice lingua (it|en|fr|de|es)
   * @param {boolean} [save=true] - Salva in localStorage
   */

  // ── URL prefix management (added for community-hub language selector) ──

  function redirectToLanguagePath(langCode) {
    const m = window.location.pathname.match(/^\/(it|en|fr|de|es)(\/|$)/);
    if (m && m[1] === langCode) return;
    const cleanPath = window.location.pathname
      .replace(/^\/(it|en|fr|de|es)(\/|$)/, '/') || '/';
    const cleanSearch = window.location.search
      .replace(/[?&]lang=[a-z]+/, '').replace(/^\?$/, '');
    const newPath = '/' + langCode + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
    try { window.history.replaceState({}, '', newPath + cleanSearch + window.location.hash); } catch(e) {}
  }

  function updateInternalLinksLang(langCode) {
    document.querySelectorAll('a[href]').forEach(link => {
      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('javascript:') ||
          rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') ||
          rawHref.startsWith('data:') || rawHref.startsWith('#')) return;
      try {
        const resolved = new URL(link.href);
        if (resolved.origin !== location.origin) return;
        let cleanPath = resolved.pathname.replace(/^\/(it|en|fr|de|es)(\/|$)/, '/');
        if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
        const cleanSearch = resolved.search.replace(/[?&]lang=[a-z]+/g, '').replace(/^\?$/, '');
        link.setAttribute('href', '/' + langCode + cleanPath + cleanSearch + resolved.hash);
      } catch (e) {}
    });
  }

  function setLanguage(lang, save = true) {
    if (!CONFIG.supportedLanguages.includes(lang)) {
      warn(`Lingua non supportata: ${lang}. Disponibili: ${CONFIG.supportedLanguages.join(', ')}`);
      return false;
    }

    const prev = state.currentLanguage;
    state.currentLanguage = lang;

    // Aggiorna attributo html lang
    document.documentElement.setAttribute('lang', lang);

    // Salva preferenza
    if (save) {
      try {
        localStorage.setItem(CONFIG.storageKey, lang);
        log('Lingua salvata in localStorage:', lang);
      } catch (e) { /* silenzio */ }
    }

    // Aggiorna URL con prefisso lingua
    redirectToLanguagePath(lang);

    // Aggiorna link interni con nuovo prefisso
    updateInternalLinksLang(lang);

    // Aggiorna DOM
    translateDOM();

    // Notifica i listener
    state.listeners.forEach(fn => {
      try { fn(lang, prev); } catch (e) { warn('Errore nel listener lingua:', e); }
    });

    log(`Lingua cambiata: ${prev} → ${lang}`);
    return true;
  }

  function getCurrentLanguage() {
    return state.currentLanguage || CONFIG.defaultLanguage;
  }

  /**
   * Registra un callback chiamato quando la lingua cambia.
   * @param {function} fn - callback(newLang, prevLang)
   * @returns {function} - funzione per rimuovere il listener
   */
  function onLanguageChange(fn) {
    state.listeners.push(fn);
    return () => {
      state.listeners = state.listeners.filter(l => l !== fn);
    };
  }

  // ─── HELPER TEMPO RELATIVO ───────────────────────────────────────────────────

  /**
   * Formatta una data come tempo relativo nella lingua corrente.
   * @param {Date|string|number} date
   * @returns {string}
   */
  function timeAgo(date) {
    const d     = date instanceof Date ? date : new Date(date);
    const now   = new Date();
    const diff  = Math.floor((now - d) / 1000); // secondi

    if (diff < 60)           return t('time.just_now');
    if (diff < 3600)  {
      const m = Math.floor(diff / 60);
      return m === 1 ? t('time.minute_ago') : t('time.minutes_ago', { count: m });
    }
    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return h === 1 ? t('time.hour_ago') : t('time.hours_ago', { count: h });
    }
    if (diff < 172800) return t('time.day_ago');        // < 2 giorni
    if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return t('time.days_ago', { count: days });
    }
    if (diff < 2592000) {
      const w = Math.floor(diff / 604800);
      return w === 1 ? t('time.week_ago') : t('time.weeks_ago', { count: w });
    }
    if (diff < 31536000) {
      const mo = Math.floor(diff / 2592000);
      return mo === 1 ? t('time.month_ago') : t('time.months_ago', { count: mo });
    }
    const y = Math.floor(diff / 31536000);
    return y === 1 ? t('time.year_ago') : t('time.years_ago', { count: y });
  }

  // ─── INIZIALIZZAZIONE ────────────────────────────────────────────────────────

  /**
   * Inizializza il sistema i18n.
   * Chiamato automaticamente al DOMContentLoaded oppure manualmente.
   */
  function init() {
    // Sincronizza traduzioni già caricate
    syncFromGlobal();

    // Determina lingua iniziale
    const lang = resolveInitialLanguage();
    state.currentLanguage = lang;
    document.documentElement.setAttribute('lang', lang);

    // Applica al DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        translateDOM();
        startDOMObserver();
      });
    } else {
      translateDOM();
      startDOMObserver();
    }

    // Applica prefisso lingua nell'URL senza flash
    redirectToLanguagePath(lang);

    log(`Inizializzato. Lingua: ${lang}`);
  }

  // ─── API PUBBLICA ─────────────────────────────────────────────────────────────

  const I18n = {
    // Traduzione
    t,
    translate: t,

    // Gestione lingua
    setLanguage,
    getCurrentLanguage,
    onLanguageChange,
    getSupportedLanguages: () => [...CONFIG.supportedLanguages],
    isSupported: (lang) => CONFIG.supportedLanguages.includes(lang),

    // DOM
    translateDOM,
    translateElement,

    // URL lingua
    redirectToLanguagePath,
    updateInternalLinks: updateInternalLinksLang,

    // Utility
    timeAgo,
    interpolate,
    getBrowserLanguage,

    // Traduzioni
    registerTranslations,
    syncFromGlobal,

    // Configurazione
    config: CONFIG,
    setDebug: (v) => { CONFIG.debugMode = v; },

    // Inizializzazione
    init,

    // Observer
    startDOMObserver,
    stopDOMObserver,
  };

  // Espone globalmente
  global.I18n = I18n;

  // Auto-init
  init();

}(window));
