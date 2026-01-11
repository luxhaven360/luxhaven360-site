/**
 * =====================================================
 * LUXHAVEN360 - GESTIONE TASSI DI CAMBIO GLOBALE
 * Sincronizzato con backend ExchangeRates.gs (BCE)
 * =====================================================
 */

const WEB_APP_URL_RATES = 'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec';

// 💱 Tassi di cambio globali (sincronizzati con localStorage)
let globalExchangeRates = {
  'EUR': 1,
  'USD': 1.17,
  'GBP': 0.87
};

/**
 * 🔄 Carica tassi di cambio aggiornati dal backend
 * @returns {Promise<Object>} - { EUR: 1, USD: 1.17, GBP: 0.87 }
 */
async function loadGlobalExchangeRates() {
  try {
    // 1. Prova localStorage (cache 1 ora)
    const cachedData = localStorage.getItem('lh360_exchange_rates');
    const cacheTime = localStorage.getItem('lh360_rates_timestamp');
    const now = Date.now();
    
    if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 3600000) {
      globalExchangeRates = JSON.parse(cachedData);
      console.log('✅ Tassi caricati da cache:', globalExchangeRates);
      return globalExchangeRates;
    }
    
    // 2. Fetch dal backend
    const response = await fetch(`${WEB_APP_URL_RATES}?action=get_exchange_rates&t=${now}`);
    const data = await response.json();
    
    if (data.success && data.rates) {
      globalExchangeRates = data.rates;
      
      // 3. Salva in localStorage
      localStorage.setItem('lh360_exchange_rates', JSON.stringify(globalExchangeRates));
      localStorage.setItem('lh360_rates_timestamp', now.toString());
      
      console.log('✅ Tassi aggiornati dal server:', globalExchangeRates);
      console.log('📅 Ultimo aggiornamento BCE:', data.updated || 'N/A');
      
      return globalExchangeRates;
    }
  } catch (error) {
    console.warn('⚠️ Errore caricamento tassi, uso fallback:', error);
  }
  
  return globalExchangeRates;
}

/**
 * 💶 Formatta prezzo con conversione valuta e localizzazione
 * @param {number} price - Prezzo in EUR
 * @param {string} originalCurrency - Valuta originale (default: EUR)
 * @returns {string} - Prezzo formattato con simbolo
 */
function formatPriceGlobal(price, originalCurrency = 'EUR') {
  const amount = parseFloat(price) || 0;
  const currentLang = (window.i18nPDP && window.i18nPDP()) 
    ? window.i18nPDP().currentLang 
    : ((window.i18n && window.i18n()) ? window.i18n().currentLang : 'it');
  
  // 🌍 CONFIGURAZIONE PER LINGUA
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
  
  const config = localeConfig[currentLang] || localeConfig.it;
  
  // 💱 CONVERSIONE VALUTA
  let convertedAmount = amount;
  if (originalCurrency !== config.currency) {
    const fromRate = globalExchangeRates[originalCurrency] || 1;
    const toRate = globalExchangeRates[config.currency] || 1;
    convertedAmount = (amount / fromRate) * toRate;
  }
  
  // 🔢 FORMATTAZIONE NUMERO
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

// 🚀 Auto-inizializzazione (carica tassi all'import del file)
(async function() {
  await loadGlobalExchangeRates();
})();
