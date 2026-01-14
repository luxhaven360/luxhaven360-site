/**
 * 🌍 Sistema i18n per Product Details Pages
 * Sincronizzato con index.html tramite localStorage
 */

class I18nPDP {
  constructor() {
    this.translations = translationsPDP;
    this.currentLang = this.detectLanguage();
    
    // ✅ NUOVO: Tassi di cambio dinamici
    this.exchangeRates = { 'EUR': 1, 'USD': 1.17, 'GBP': 0.87 }; // Fallback iniziale
    
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
    
    // ✅ NUOVO: Carica tassi di cambio
    this.loadExchangeRates();
    
    this.translatePage();
    this.setupLanguageSelector();
    this.observeDynamicContent();
  }

  /**
   * 💱 Carica tassi di cambio aggiornati dal backend
   */
  async loadExchangeRates() {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec';
    
    try {
      const response = await fetch(`${WEB_APP_URL}?action=get_exchange_rates&t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success && data.rates) {
        this.exchangeRates = data.rates;
        console.log('✅ [i18n-pdp] Tassi aggiornati:', this.exchangeRates);
        
        // ✅ Aggiorna tutti i prezzi visibili dopo il caricamento
        if (typeof updateAllPricesForLanguage === 'function') {
          updateAllPricesForLanguage();
        }
      }
    } catch (error) {
      console.warn('⚠️ [i18n-pdp] Errore caricamento tassi, uso fallback:', error);
    }
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
        const value = replacements[placeholder];
        // ✅ FIX: Assicurati che il valore non sia undefined
        const safeValue = (value !== undefined && value !== null) ? value : '';
        text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), safeValue);
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

    // ✅ NON chiamare translatePage() qui per evitare di sovrascrivere valori dinamici
    // La traduzione verrà gestita dall'evento languageChanged

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
   * Formatta prezzo con conversione valuta DINAMICA
   */
  formatPrice(price, originalCurrency = 'EUR') {
    const amount = parseFloat(price) || 0;
    
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
    
    // 💱 CONVERSIONE VALUTA con tassi dinamici
    let convertedAmount = amount;
    if (originalCurrency !== config.currency) {
      const fromRate = this.exchangeRates[originalCurrency] || 1;
      const toRate = this.exchangeRates[config.currency] || 1;
      convertedAmount = (amount / fromRate) * toRate;
    }
    
    // 📢 FORMATTAZIONE NUMERO
    let formatted = convertedAmount.toFixed(config.decimals);
    formatted = formatted.replace('.', config.decimal);
    
    let parts = formatted.split(config.decimal);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands);
    formatted = parts.join(config.decimal);
    
    // 💲 POSIZIONAMENTO SIMBOLO
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

  /**
 * Formatta orario in base alla lingua (24h o 12h)
 * @param {string} time - Orario in formato "HH:MM" (es: "17:00")
 * @returns {string} - Orario formattato per la lingua corrente
 */
formatTime(time) {
  if (!time || time === '—' || time === 'Da definire') return time;
  
  // Parse orario (formato atteso: "HH:MM")
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return time;
  
  const hours = parseInt(match[1]);
  const minutes = match[2];
  
  // Configurazione formato per lingua
  const timeConfig = {
    it: { format: '24h', separator: ':' },  // 17:00
    en: { format: '12h', separator: ':' },  // 5:00 PM
    fr: { format: '24h', separator: ':' },  // 17:00
    de: { format: '24h', separator: ':' },  // 17:00
    es: { format: '24h', separator: ':' }   // 17:00
  };
  
  const config = timeConfig[this.currentLang] || timeConfig.it;
  
  if (config.format === '12h') {
    // Formato 12h con AM/PM (inglese)
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // 0 diventa 12
    return `${displayHours}${config.separator}${minutes} ${period}`;
  } else {
    // Formato 24h
    const displayHours = hours.toString().padStart(2, '0');
    return `${displayHours}${config.separator}${minutes}`;
  }
}
}

// Inizializza sistema i18n
let i18nPDPInstance;

document.addEventListener('DOMContentLoaded', () => {
  i18nPDPInstance = new I18nPDP();
});

// Esporta per uso globale
window.i18nPDP = () => i18nPDPInstance;
