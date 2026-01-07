/**
 * ðŸŒ LuxHaven360 - Sistema i18n per pagine Product Details
 * Sincronizzato con index.html via localStorage
 */

class I18nPDP {
  constructor() {
    this.translations = translationsPDP; // Usa translationsPDP dal file translations-pdp.js
    this.currentLang = this.detectLanguage();
    this.init();
  }

  /**
   * Rileva lingua da localStorage (sincronizzato con index.html)
   */
  detectLanguage() {
    // 1. Check localStorage (priorità massima - sincronizzazione con index.html)
    const savedLang = localStorage.getItem('lh360_lang');
    if (savedLang && this.translations[savedLang]) {
      return savedLang;
    }

    // 2. Check URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    if (langFromUrl && this.translations[langFromUrl]) {
      localStorage.setItem('lh360_lang', langFromUrl);
      return langFromUrl;
    }

    // 3. Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.translations[browserLang]) {
      return browserLang;
    }

    // 4. Default: italiano
    return 'it';
  }

  /**
   * Inizializza sistema i18n
   */
  init() {
    console.log(`ðŸŒ [PDP] Lingua attiva: ${this.currentLang.toUpperCase()}`);
    
    // Traduci pagina
    this.translatePage();
    
    // Setup selettore lingua (se presente)
    this.setupLanguageSelector();
    
    // Listener per contenuti dinamici
    this.observeDynamicContent();
    
    // Listener per cambiamenti da altre schede
    this.setupStorageListener();
  }

  /**
   * Traduce tutti gli elementi con data-i18n
   */
  translatePage() {
    // Traduci testo normale
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (translation) {
        if (el.getAttribute('data-i18n-html') === 'true') {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Traduci placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation) el.placeholder = translation;
    });

    // Traduci title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation) el.title = translation;
    });
  }

  /**
   * Ottieni traduzione per chiave con sostituzione placeholder
   */
  t(key, replacements = {}) {
    const lang = this.translations[this.currentLang];
    let text = lang?.[key] || key;

    // Sostituisci placeholder (es: {n}, {code}, {percent})
    Object.keys(replacements).forEach(placeholder => {
      text = text.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
    });

    return text;
  }

  /**
   * Cambia lingua e salva in localStorage (sincronizza con index.html)
   */
  changeLanguage(langCode) {
    if (!this.translations[langCode]) {
      console.error(`Lingua "${langCode}" non supportata`);
      return;
    }

    localStorage.setItem('lh360_lang', langCode);
    this.currentLang = langCode;

    // Aggiorna URL con query parameter
    const url = new URL(window.location);
    url.searchParams.set('lang', langCode);
    window.history.replaceState({}, '', url.toString());

    // Traduci pagina
    this.translatePage();
    this.updateLanguageSelector();

    // Dispatch event per script esterni
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));

    console.log(`âœ… [PDP] Lingua cambiata: ${langCode.toUpperCase()}`);
  }

  /**
   * Setup selettore lingua
   */
  setupLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    // Imposta lingua corrente
    const currentFlag = selector.querySelector('.current-lang-flag');
    const currentCode = selector.querySelector('.current-lang-code');
    
    if (currentFlag && currentCode) {
      currentFlag.className = `current-lang-flag fi fi-${this.getFlagCode(this.currentLang)}`;
      currentCode.textContent = this.currentLang.toUpperCase();
    }

    // Click handlers per le opzioni
    selector.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = option.dataset.lang;
        this.changeLanguage(lang);
        selector.classList.remove('open');
      });
    });

    // Toggle dropdown
    const toggle = selector.querySelector('.lang-selector-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.toggle('open');
      });
    }

    // Chiudi dropdown se click esterno
    document.addEventListener('click', (e) => {
      if (!selector.contains(e.target)) {
        selector.classList.remove('open');
      }
    });
  }

  /**
   * Aggiorna UI selettore lingua
   */
  updateLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    const currentFlag = selector.querySelector('.current-lang-flag');
    const currentCode = selector.querySelector('.current-lang-code');
    
    if (currentFlag && currentCode) {
      currentFlag.className = `current-lang-flag fi fi-${this.getFlagCode(this.currentLang)}`;
      currentCode.textContent = this.currentLang.toUpperCase();
    }

    selector.querySelectorAll('.lang-option').forEach(option => {
      if (option.dataset.lang === this.currentLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  /**
   * Osserva DOM per contenuti dinamici
   */
  observeDynamicContent() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.hasAttribute('data-i18n')) {
              const key = node.getAttribute('data-i18n');
              const translation = this.t(key);
              if (translation) {
                if (node.getAttribute('data-i18n-html') === 'true') {
                  node.innerHTML = translation;
                } else {
                  node.textContent = translation;
                }
              }
            }
            
            node.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n');
              const translation = this.t(key);
              if (translation) {
                if (el.getAttribute('data-i18n-html') === 'true') {
                  el.innerHTML = translation;
                } else {
                  el.textContent = translation;
                }
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Ascolta cambiamenti lingua da altre schede
   */
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'lh360_lang' && e.newValue !== this.currentLang) {
        console.log(`ðŸ"„ [PDP] Lingua cambiata da altra scheda: ${e.newValue}`);
        this.currentLang = e.newValue;
        this.translatePage();
        this.updateLanguageSelector();
      }
    });
  }

  /**
   * Ottieni codice bandiera per flag-icons
   */
  getFlagCode(langCode) {
    const codes = {
      it: 'it',
      en: 'gb',
      fr: 'fr',
      de: 'de',
      es: 'es'
    };
    return codes[langCode] || 'it';
  }
}

// Inizializza sistema i18n PDP
let i18nPDPInstance;

document.addEventListener('DOMContentLoaded', () => {
  i18nPDPInstance = new I18nPDP();
});

// Esporta per uso globale
window.i18nPDP = () => i18nPDPInstance;
