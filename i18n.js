/**
 * 🌍 LuxHaven360 - Sistema di Internazionalizzazione
 * Gestisce traduzione dinamica e cambio lingua
 */

class I18n {
  constructor() {
    this.translations = translations;
    this.currentLang = this.detectLanguage();
    // Aggiungi questa riga:
    this.githubRepo = 'luxhaven360-site'; // Nome del repository GitHub
    this.init();
}

  /**
   * Rileva lingua da URL o localStorage
   */
   detectLanguage() {
    // 1. Check URL query parameter (?lang=xx)
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    
    if (langFromUrl && this.translations[langFromUrl]) {
        localStorage.setItem('lh360_lang', langFromUrl);
        return langFromUrl;
    }

    // 2. Check localStorage
    const savedLang = localStorage.getItem('lh360_lang');
    if (savedLang && this.translations[savedLang]) {
        return savedLang;
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
 * Redirect per inserire lingua nel path se mancante
 */
 redirectToLanguagePath(langCode) {
    // Usa query parameters per GitHub Pages
    const url = new URL(window.location);
    url.searchParams.set('lang', langCode);
    window.history.replaceState({}, '', url.toString());
}

  /**
   * Inizializza sistema i18n
   */
  init() {
    console.log(`🌍 Lingua attiva: ${this.currentLang.toUpperCase()}`);
    
    // Traduci pagina
    this.translatePage();
    
    // Setup selettore lingua
    this.setupLanguageSelector();
    
    // ✅ Aggiorna UI selettore con lingua corrente
    this.updateLanguageSelector();
    
    // Listener per contenuti dinamici
    this.observeDynamicContent();
}

  /**
   * Traduce tutti gli elementi con data-i18n
   */
  translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (translation) {
        // Gestisci HTML se presente nel data-attribute
        if (el.getAttribute('data-i18n-html') === 'true') {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Traduci placeholder e attributi
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation) el.placeholder = translation;
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation) el.title = translation;
    });
  }

  /**
   * Ottieni traduzione per chiave
   */
  t(key, replacements = {}) {
    const lang = this.translations[this.currentLang];
    let text = lang[key] || key;

    // Sostituisci placeholder (es: {n})
    Object.keys(replacements).forEach(placeholder => {
      text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return text;
  }

  /**
   * Cambia lingua e ricarica pagina
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

    // Dispatch event
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));

    console.log(`✅ Lingua cambiata: ${langCode.toUpperCase()}`);
}

  /**
   * Setup selettore lingua nella navbar
   */
  setupLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    // Imposta lingua corrente nel selettore
    const currentFlag = selector.querySelector('.current-lang-flag');
    const currentCode = selector.querySelector('.current-lang-code');
    
    if (currentFlag && currentCode) {
      currentFlag.textContent = this.getFlagEmoji(this.currentLang);
      currentCode.textContent = this.currentLang.toUpperCase();
    }

    // Click handlers per le opzioni
    selector.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = option.dataset.lang;
        this.changeLanguage(lang);
        
        // Chiudi dropdown
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

    // ✅ FORCE EMOJI su tutte le opzioni del dropdown
selector.querySelectorAll('.lang-flag').forEach(flag => {
    flag.style.fontFamily = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
});
  }

  /**
 * Aggiorna visivamente il selettore lingua (bandiera e codice)
 */
 updateLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    const currentFlag = selector.querySelector('.current-lang-flag');
    const currentCode = selector.querySelector('.current-lang-code');
    
    if (currentFlag && currentCode) {
        // ✅ SOLUZIONE: Usa Unicode invece di emoji composte
        const flags = {
            it: '\u{1F1EE}\u{1F1F9}', // 🇮🇹
            en: '\u{1F1EC}\u{1F1E7}', // 🇬🇧
            fr: '\u{1F1EB}\u{1F1F7}', // 🇫🇷
            de: '\u{1F1E9}\u{1F1EA}', // 🇩🇪
            es: '\u{1F1EA}\u{1F1F8}'  // 🇪🇸
        };
        
        currentFlag.textContent = flags[this.currentLang] || '🌐';
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
          if (node.nodeType === 1) { // Element node
            // Traduci nuovi elementi con data-i18n
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
            
            // Cerca elementi figli
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
   * Ottieni emoji bandiera per codice lingua
   */
  getFlagEmoji(langCode) {
    const flags = {
      it: '🇮🇹',
      en: '🇬🇧',
      fr: '🇫🇷',
      de: '🇩🇪',
      es: '🇪🇸'
    };
    return flags[langCode] || '🌍';
  }

  /**
   * Ottieni nome completo lingua
   */
  getLanguageName(langCode) {
    const names = {
      it: 'Italiano',
      en: 'English',
      fr: 'Français',
      de: 'Deutsch',
      es: 'Español'
    };
    return names[langCode] || langCode;
  }
}

// Inizializza sistema i18n
let i18nInstance;

document.addEventListener('DOMContentLoaded', () => {
  i18nInstance = new I18n();
});

// Esporta per uso globale
window.i18n = () => i18nInstance;
