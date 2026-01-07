/**
 * 🌍 Sistema i18n per Product Details Pages
 * Sincronizzato con index.html tramite localStorage
 */

class I18nPDP {
  constructor() {
    this.translations = translationsPDP; // Dal file translations-pdp.js
    this.currentLang = this.detectLanguage();
    this.init();
  }

  detectLanguage() {
    // 1. Check localStorage (sincronizzato con index.html)
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

  init() {
    console.log(`🌍 Lingua PDP attiva: ${this.currentLang.toUpperCase()}`);
    this.translatePage();
    this.setupLanguageSelector();
    this.observeDynamicContent();
  }

  translatePage() {
    // Traduci elementi con data-i18n
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

  t(key, replacements = {}) {
    const lang = this.translations[this.currentLang];
    let text = lang[key] || key;

    // Sostituisci placeholder (es: {n}, {code}, {percent})
    Object.keys(replacements).forEach(placeholder => {
      text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder]);
    });

    return text;
  }

  changeLanguage(langCode) {
    if (!this.translations[langCode]) {
      console.error(`Lingua "${langCode}" non supportata`);
      return;
    }

    localStorage.setItem('lh360_lang', langCode);
    this.currentLang = langCode;

    // Traduci pagina
    this.translatePage();
    this.updateLanguageSelector();

    // Aggiorna prezzi con nuova valuta
    if (typeof updateAllPricesForLanguage === 'function') {
      updateAllPricesForLanguage();
    }

    // Aggiorna badge disponibilità
    if (typeof updateAllBadgesForLanguage === 'function') {
      updateAllBadgesForLanguage();
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));

    console.log(`✅ Lingua PDP cambiata: ${langCode.toUpperCase()}`);
  }

  setupLanguageSelector() {
    const selector = document.getElementById('pdpLanguageSelector');
    if (!selector) return;

    // Setup click handlers per ogni lingua
    selector.querySelectorAll('.pdp-lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = option.dataset.lang;
        this.changeLanguage(lang);
      });
    });

    this.updateLanguageSelector();
  }

  updateLanguageSelector() {
    const selector = document.getElementById('pdpLanguageSelector');
    if (!selector) return;

    // Aggiorna stato attivo
    selector.querySelectorAll('.pdp-lang-option').forEach(option => {
      if (option.dataset.lang === this.currentLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  observeDynamicContent() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.hasAttribute('data-i18n')) {
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
          if (node.querySelectorAll) {
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
   * Formatta prezzo con conversione valuta
   */
  formatPrice(price, originalCurrency = 'EUR') {
    const amount = parseFloat(price) || 0;
    
    // Tassi di cambio (aggiorna periodicamente)
    const exchangeRates = {
      'EUR': 1,
      'USD': 1.17,
      'GBP': 0.87
    };
    
    // Configurazione per lingua
    const localeConfig = {
      it: { 
        currency: 'EUR', 
        symbol: '€', 
        symbolPosition: 'before',
        thousands: '.', 
        decimal: ',',
        decimals: amount < 500 ? 2 : 0
      },
      en: { 
        currency: 'USD', 
        symbol: '$', 
        symbolPosition: 'before',
        thousands: ',', 
        decimal: '.',
        decimals: amount < 500 ? 2 : 0
      },
      fr: { 
        currency: 'EUR', 
        symbol: '€', 
        symbolPosition: 'after',
        thousands: ' ', 
        decimal: ',',
        decimals: amount < 500 ? 2 : 0
      },
      de: { 
        currency: 'EUR', 
        symbol: '€', 
        symbolPosition: 'after',
        thousands: '.', 
        decimal: ',',
        decimals: amount < 500 ? 2 : 0
      },
      es: { 
        currency: 'EUR', 
        symbol: '€', 
        symbolPosition: 'after',
        thousands: '.', 
        decimal: ',',
        decimals: amount < 500 ? 2 : 0
      }
    };
    
    const config = localeConfig[this.currentLang] || localeConfig.it;
    
    // Conversione valuta
    let convertedAmount = amount;
    if (originalCurrency !== config.currency) {
      const fromRate = exchangeRates[originalCurrency] || 1;
      const toRate = exchangeRates[config.currency] || 1;
      convertedAmount = (amount / fromRate) * toRate;
    }
    
    // Formattazione numero
    let formatted = convertedAmount.toFixed(config.decimals);
    formatted = formatted.replace('.', config.decimal);
    
    let parts = formatted.split(config.decimal);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands);
    formatted = parts.join(config.decimal);
    
    // Posizionamento simbolo
    if (config.symbolPosition === 'before') {
      return `${config.symbol}${formatted}`;
    } else {
      return `${formatted} ${config.symbol}`;
    }
  }

  /**
   * Formatta numero con separatore decimale corretto per la lingua
   */
  formatNumber(number, decimals = 1) {
    const amount = parseFloat(number) || 0;
    
    // Configurazione separatori per lingua
    const decimalConfig = {
      it: ',',  // Italiano: virgola
      en: '.',  // Inglese: punto
      fr: ',',  // Francese: virgola
      de: ',',  // Tedesco: virgola
      es: ','   // Spagnolo: virgola
    };
    
    const decimal = decimalConfig[this.currentLang] || ',';
    
    return amount.toFixed(decimals).replace('.', decimal);
  }
}

// Inizializza sistema i18n
let i18nPDPInstance;

document.addEventListener('DOMContentLoaded', () => {
  i18nPDPInstance = new I18nPDP();
});

// Esporta per uso globale
window.i18nPDP = () => i18nPDPInstance;
