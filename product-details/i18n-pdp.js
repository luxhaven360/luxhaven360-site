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

    // LISTENER PER SINCRONIZZAZIONE LINGUA TRA PAGINE
    window.addEventListener('pageshow', (event) => {
      const savedLang = localStorage.getItem('lh360_lang');
      
      if (savedLang && savedLang !== this.currentLang && this.translations[savedLang]) {
        console.log(`ðŸ"„ [PDP] Sincronizzazione lingua: ${this.currentLang} â†' ${savedLang}`);
        this.currentLang = savedLang;
        
        // Aggiorna URL
        const url = new URL(window.location);
        url.searchParams.set('lang', savedLang);
        window.history.replaceState({}, '', url.toString());
        
        // Ri-traduci pagina
        this.translatePage();
        this.updateLanguageSelector();
        this.updateInternalLinks(savedLang);
        
        // Aggiorna elementi dinamici
        if (typeof updateAllPricesForLanguage === 'function') {
          setTimeout(() => updateAllPricesForLanguage(), 100);
        }
        if (typeof updateTableLabels === 'function') {
          setTimeout(() => updateTableLabels(), 100);
        }
        if (typeof updateCalendarLanguage === 'function') {
          updateCalendarLanguage();
        }
        
        console.log(`âœ… [PDP] Lingua aggiornata a: ${savedLang.toUpperCase()}`);
      }
    });
    
    this.setupLanguageSelector();
    this.updateInternalLinks(this.currentLang);
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
    // ✅ SALTA L'INPUT TELEFONO (gestito dal selector dinamico)
    if (el.type === 'tel') return;
    
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

   // Risolve path tipo 'booking_calendar_months.gennaio' in oggetti annidati
  _getByPath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
        return acc[part];
      }
      return undefined;
    }, obj);
  }

  t(key, replacements = {}) {
    // lingua corrente
    const langObj = this.translations && this.translations[this.currentLang] ? this.translations[this.currentLang] : {};

    // prova a risolvere la key con dot-notation (es: booking_calendar_months.gennaio)
    let val = this._getByPath(langObj, key);

    // fallback: prova anche senza dot (per chiavi piatte)
    if (val === undefined && Object.prototype.hasOwnProperty.call(langObj, key)) {
      val = langObj[key];
    }

    // se ancora undefined => ritorna la key (utile per debug)
    let text = (val !== undefined && val !== null) ? val : key;

    // se l'entry è un oggetto/array, prova a convertirlo in stringa (per sicurezza)
    if (typeof text === 'object') {
      try {
        text = JSON.stringify(text);
      } catch (e) {
        text = String(text);
      }
    }

    // Sostituisci placeholders {n} ecc.
    Object.keys(replacements).forEach(placeholder => {
      const value = replacements[placeholder];
      const safeValue = (value !== undefined && value !== null) ? value : '';
      text = String(text).replace(new RegExp(`\\{${placeholder}\\}`, 'g'), safeValue);
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

    // Aggiorna URL con query parameter
    const url = new URL(window.location);
    url.searchParams.set('lang', langCode);
    window.history.replaceState({}, '', url.toString());
    
    // Sincronizza link interni
    this.updateInternalLinks(langCode);

    this.translatePage();
    this.updateLanguageSelector();

    if (typeof updateAllPricesForLanguage === 'function') {
        updateAllPricesForLanguage();
    }
    
    // ✅ NUOVO: Aggiorna tabelle
    if (typeof updateTableLabels === 'function') {
        updateTableLabels();
    }

    if (typeof updateCalendarLanguage === 'function') {
        updateCalendarLanguage();
    }
    
    if (typeof updateTimeFormatLanguage === 'function') {
        updateTimeFormatLanguage();
    }

    if (typeof updatePhoneDropdownLanguage === 'function') {
        updatePhoneDropdownLanguage();
    }

    if (typeof updateDistanceLabels === 'function') {
        updateDistanceLabels();
    }

    if (typeof updateExtraServicesLanguage === 'function') {
        updateExtraServicesLanguage();
    }

    // ✅ NUOVO: Aggiorna contenuti dinamici dal foglio Google
    if (typeof updateDynamicContent === 'function') {
        updateDynamicContent();
    }

    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));

    console.log(`✅ Lingua PDP cambiata: ${langCode.toUpperCase()}`);
}

  /**
 * Aggiorna tutti i link interni con il query parameter lingua
 */
updateInternalLinks(langCode) {
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        
        if (!href || 
            href.startsWith('http') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            href.startsWith('#')) {
            return;
        }
        
        try {
            if (href.includes('?')) {
                const url = new URL(href, window.location.origin);
                url.searchParams.set('lang', langCode);
                link.setAttribute('href', url.pathname + url.search);
            } else {
                link.setAttribute('href', `${href}?lang=${langCode}`);
            }
        } catch (e) {
            // Ignora errori
        }
    });
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
        decimals: amount < 500 ? 2 : 0,
        // NUOVO: Aggiungi separatore non-breaking per francese
        space: '\u00A0' // spazio non-breaking
      },
      de: { 
        currency: 'EUR', 
        symbol: '€', 
        symbolPosition: 'after',
        thousands: '.', 
        decimal: ',',
        decimals: amount < 500 ? 2 : 0,
        space: '\u00A0'
      },
      es: { 
        currency: 'EUR', 
        symbol: '€', 
        symbolPosition: 'after',
        thousands: '.', 
        decimal: ',',
        decimals: amount < 500 ? 2 : 0,
        space: '\u00A0'
      }
    };
    
    const config = localeConfig[this.currentLang] || localeConfig.it;
    
    // Conversione valuta
    let convertedAmount = amount;
    if (originalCurrency !== config.currency) {
      const fromRate = this.exchangeRates[originalCurrency] || 1;
      const toRate = this.exchangeRates[config.currency] || 1;
      convertedAmount = (amount / fromRate) * toRate;
    }
    
    // Formattazione numero
    let formatted = convertedAmount.toFixed(config.decimals);
    formatted = formatted.replace('.', config.decimal);
    
    let parts = formatted.split(config.decimal);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands);
    formatted = parts.join(config.decimal);
    
    // MODIFICATO: Usa spazio non-breaking se presente
    const separator = config.space || ' ';
    
    if (config.symbolPosition === 'before') {
      return `${config.symbol}${formatted}`;
    } else {
      return `${formatted}${separator}${config.symbol}`;
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
   * 🌍 TRADUZIONE CONTENUTI FOGLIO GOOGLE
   * Traduce i contenuti dinamici dal foglio "Prodotti Prenotabili"
   */

  /**
   * Traduce il Benefit in base alla variante
   * @param {string} benefitIT - Testo benefit in italiano
   * @returns {string} - Benefit tradotto nella lingua corrente
   */
  translateBenefit(benefitIT) {
    if (!benefitIT || !window.translationsBookingData) return benefitIT;
    
    const benefits = window.translationsBookingData.benefits;
    const lang = this.currentLang;
    
    // Identifica quale variante è il benefit in base al contenuto
    if (benefitIT.includes('2 supercar') && benefitIT.includes('posti posteriori disponibili')) {
      return benefits.combo_with_seats[lang] || benefitIT;
    } else if (benefitIT.includes('2 supercar') && !benefitIT.includes('posti posteriori')) {
      return benefits.combo_without_seats[lang] || benefitIT;
    } else if (benefitIT.includes('posti posteriori disponibili')) {
      return benefits.single_with_seats[lang] || benefitIT;
    } else {
      return benefits.single_without_seats[lang] || benefitIT;
    }
  }

  /**
   * Traduce la Descrizione prodotto
   * @param {string} descIT - Descrizione in italiano
   * @returns {string} - Descrizione tradotta
   */
  translateDescription(descIT) {
    if (!descIT || !window.translationsBookingData) return descIT;
    
    const descriptions = window.translationsBookingData.descriptions;
    const lang = this.currentLang;
    
    // Mappa le descrizioni in base a parole chiave univoche
    const descMap = {
      "California, elegante Gran Turismo a 4 posti, unisce comfort e potenza": "california_458",
      "Un'esperienza che unisce due anime della stessa leggenda": "california_californiat",
      "Il fascino della Gran Turismo incontra l'anima più estrema": "california_488spider",
      "Due interpretazioni diverse dello stile Gran Turismo Ferrari": "california_portofino",
      "Eleganza italiana contro aggressività pura": "california_huracan",
      "La modernità del turbo incontra la purezza del motore aspirato": "californiat_458spider",
      "Due spider, due caratteri forti": "californiat_488spider",
      "Il meglio delle Gran Turismo Ferrari in versione moderna": "californiat_portofino",
      "Una sfida tra due mondi": "californiat_huracan",
      "La Gran Turismo moderna incontra una delle Ferrari più iconiche": "portofino_458italia",
      "Due generazioni di potenza Ferrari a confronto": "portofino_488spider",
      "Classe ed eleganza contro istinto e aggressività": "portofino_huracan",
      "Due leggende Ferrari, due filosofie di potenza": "458italia_488spider",
      "Il duello tra Maranello e Sant'Agata": "458italia_huracan",
      "Il massimo delle supersportive scoperte": "488spider_huracan",
      "Vivi l'emozione di guidare la Ferrari California, elegante Gran Turismo": "california",
      "Scopri la Ferrari Portofino, icona Gran Turismo": "portofino",
      "Vivi la Ferrari 488 Spider, capolavoro sportivo": "488spider",
      "Guidare la Ferrari 458 Italia significa entrare in contatto": "458italia",
      "La Ferrari California T unisce potenza e versatilità": "californiat",
      "Senti l'adrenalina della Lamborghini Huracán Spyder": "huracan",
      "La Ferrari 458 Spider incarna tecnologia": "458spider",
      "La Ferrari F8 Spider celebra l'eccellenza": "f8spider",
      "Scopri la Ferrari 296, berlinetta 2 posti PHEV": "296",
      "La Ferrari Roma unisce eleganza senza tempo": "roma",
      "Vivi l'esperienza Maserati MC20 Cielo": "mc20cielo",
      "Scopri la McLaren 720S Performance": "720s"
    };
    
    // Trova la chiave corrispondente
    for (const [keyword, key] of Object.entries(descMap)) {
      if (descIT.includes(keyword)) {
        return descriptions[key]?.[lang] || descIT;
      }
    }
    
    return descIT;
  }

  /**
   * Traduce le Prestazioni
   * @param {string} prestazioniIT - Prestazioni in italiano
   * @returns {string} - Prestazioni tradotte
   */
  translatePrestazioni(prestazioniIT) {
    if (!prestazioniIT || !window.translationsBookingData) return prestazioniIT;
    
    const prestazioni = window.translationsBookingData.prestazioni;
    const lang = this.currentLang;
    
    let translated = prestazioniIT;
    
    // Traduce "Posteriore", "Integrale", etc.
    if (prestazioni.traction) {
      for (const [itText, translations] of Object.entries(prestazioni.traction)) {
        if (translated.includes(itText)) {
          translated = translated.replace(new RegExp(itText, 'g'), translations[lang] || itText);
        }
      }
    }
    
    return translated;
  }

  /**
   * Traduce le Caratteristiche
   * @param {string} caratteristicheIT - Caratteristiche in italiano
   * @returns {string} - Caratteristiche tradotte
   */
  translateCaratteristiche(caratteristicheIT) {
    if (!caratteristicheIT || !window.translationsBookingData) return caratteristicheIT;
    
    const caratteristiche = window.translationsBookingData.caratteristiche;
    const lang = this.currentLang;
    
    let translated = caratteristicheIT;
    
    // Traduce tipi di motore
    if (caratteristiche.motor_type) {
      for (const [itText, translations] of Object.entries(caratteristiche.motor_type)) {
        if (translated.includes(itText)) {
          translated = translated.replace(new RegExp(itText, 'g'), translations[lang] || itText);
        }
      }
    }
    
    // Traduce trasmissione
    if (caratteristiche.transmission) {
      for (const [itText, translations] of Object.entries(caratteristiche.transmission)) {
        if (translated.includes(itText)) {
          translated = translated.replace(new RegExp(itText, 'g'), translations[lang] || itText);
        }
      }
    }
    
    // Traduce posti
    if (caratteristiche.seats) {
      for (const [itText, translations] of Object.entries(caratteristiche.seats)) {
        // Cerca pattern esatto per i posti (es: ", 4" o ", 2 / 4")
        const patterns = [`, ${itText}$`, `, ${itText},`, `, ${itText} `];
        patterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'g');
          if (regex.test(translated)) {
            translated = translated.replace(regex, (match) => {
              return match.replace(itText, translations[lang] || itText);
            });
          }
        });
      }
    }
    
    return translated;
  }

  /**
   * Traduce le Politiche
   * @param {string} politicheIT - Politiche in italiano (opzionale)
   * @returns {string} - Politiche tradotte
   */
  translatePolitiche(politicheIT = null) {
    if (!window.translationsBookingData) return politicheIT || '';
    
    const politiche = window.translationsBookingData.politiche;
    const lang = this.currentLang;
    
    return politiche[lang] || politiche.it || politicheIT || '';
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

/**
 * Formatta data in formato short localizzato per ogni lingua
 * IT: 15 gen, 16:10
 * EN: Jan 15, 4:10 PM
 * FR: 15 janv., 16:10
 * DE: 15. Jan., 16:10
 * ES: 15 ene, 16:10
 */
formatShortDate(date) {
  if (!date || !(date instanceof Date)) return '';
  
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // Configurazione mesi abbreviati per lingua
  const monthsConfig = {
    it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
    es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
  };
  
  const months = monthsConfig[this.currentLang] || monthsConfig.it;
  const month = months[monthIndex];
  
  // Formato orario in base alla lingua
  if (this.currentLang === 'en') {
    // Inglese: 12h con AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${month} ${day}, ${displayHours}:${minutes} ${period}`;
  } else if (this.currentLang === 'de') {
    // Tedesco: giorno con punto
    return `${day}. ${month}, ${hours}:${minutes}`;
  } else {
    // IT, FR, ES: formato standard
    return `${day} ${month}, ${hours}:${minutes}`;
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
