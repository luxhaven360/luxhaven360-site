/**
 * ============================================
 * LUXHAVEN360 - LOGICA CONDIVISA PDP
 * File: product-details/shared-logic.js
 * ============================================
 * Gestisce tutta la logica comune per:
 * - pdp-products.html
 * - cart.html
 * - booking.html
 * - success.html
 * - tracking-order.html
 * ============================================
 */

// ========================================
// 🌍 COSTANTI GLOBALI
// ========================================

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec';

// ========================================
// 💱 TASSI DI CAMBIO GLOBALI
// ========================================

let exchangeRates = { 
    'EUR': 1, 
    'USD': 1.17, 
    'GBP': 0.87 
}; // Fallback iniziale (aggiornati dinamicamente)

// ========================================
// 📊 FUNZIONI UTILITY BASE
// ========================================

/**
 * Formatta numeri con separatore migliaia
 */
function formatCount(n) {
    try { 
        return new Intl.NumberFormat('it-IT').format(n); 
    } catch (e) { 
        return n; 
    }
}

/**
 * Sanitizza testo per prevenire XSS
 */
function safeText(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m];
    });
}

/**
 * Estrae parametro da query string
 */
function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// ========================================
// 💰 GESTIONE PREZZI E CONVERSIONE VALUTA
// ========================================

/**
 * 💱 Formatta prezzo con conversione valuta e localizzazione
 * @param {number} price - Prezzo in EUR (base)
 * @param {string} originalCurrency - Valuta originale (default: EUR)
 * @returns {string} - Prezzo formattato con simbolo
 */
function formatPrice(price, originalCurrency = 'EUR') {
    const amount = parseFloat(price) || 0;
    
    // Ottieni sistema i18n (pdp-products usa i18nPDP, altri possono usare i18n)
    let i18n = null;
    if (typeof window.i18nPDP === 'function') {
        i18n = window.i18nPDP();
    } else if (typeof window.i18n === 'function') {
        i18n = window.i18n();
    }
    
    const currentLang = i18n ? i18n.currentLang : 'it';
    
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
    
    // 💱 CONVERSIONE VALUTA con tassi dinamici
    let convertedAmount = amount;
    if (originalCurrency !== config.currency) {
        const fromRate = exchangeRates[originalCurrency] || 1;
        const toRate = exchangeRates[config.currency] || 1;
        convertedAmount = (amount / fromRate) * toRate;
    }
    
    // 🔢 FORMATTAZIONE NUMERO
    let formatted = convertedAmount.toFixed(config.decimals);
    
    // Sostituisci decimale
    formatted = formatted.replace('.', config.decimal);
    
    // Aggiungi separatore migliaia
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
 * 💱 Carica tassi di cambio aggiornati dal backend (BCE)
 * Chiamata UNA VOLTA all'avvio di ogni pagina
 */
async function loadExchangeRates() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=get_exchange_rates&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.success && data.rates) {
            exchangeRates = data.rates;
            console.log('✅ [SHARED] Tassi di cambio aggiornati:', exchangeRates);
            console.log('📅 [SHARED] Ultimo aggiornamento:', data.updated || 'N/A');
            
            // ✅ Notifica alle pagine che i tassi sono pronti
            window.dispatchEvent(new CustomEvent('exchangeRatesLoaded', { 
                detail: { rates: exchangeRates } 
            }));
            
            return exchangeRates;
        }
    } catch (error) {
        console.warn('⚠️ [SHARED] Errore caricamento tassi, uso fallback:', error);
        return exchangeRates;
    }
}

/**
 * 💱 Calcola soglia spedizione convertita nella valuta corrente
 */
function getShippingThreshold() {
    const baseThreshold = 150; // Sempre in EUR
    
    let i18n = null;
    if (typeof window.i18nPDP === 'function') {
        i18n = window.i18nPDP();
    } else if (typeof window.i18n === 'function') {
        i18n = window.i18n();
    }
    
    if (!i18n) return baseThreshold;
    
    // Configurazione valute per lingua
    const currencyConfig = {
        it: { currency: 'EUR', rate: 1 },
        fr: { currency: 'EUR', rate: 1 },
        de: { currency: 'EUR', rate: 1 },
        es: { currency: 'EUR', rate: 1 },
        en: { currency: 'USD', rate: exchangeRates['USD'] || 1.17 }
    };
    
    const config = currencyConfig[i18n.currentLang] || { currency: 'EUR', rate: 1 };
    return baseThreshold * config.rate;
}

// ========================================
// 🔄 AGGIORNAMENTO PREZZI PER LINGUA
// ========================================

/**
 * 🔄 Aggiorna tutti i prezzi visibili quando cambia la lingua
 * Questa è una versione BASE che può essere estesa da ogni pagina
 */
function updateAllPricesForLanguage() {
    console.log('🔄 [SHARED] Aggiornamento prezzi per cambio lingua');
    
    // 1. AGGIORNA CARD PRODOTTO (se presenti)
    document.querySelectorAll('.card').forEach(card => {
        const originalPrice = parseFloat(card.dataset.originalPrice);
        const originalCurrency = card.dataset.originalCurrency || 'EUR';
        
        if (!originalPrice) return;
        
        const discountPrice = parseFloat(card.dataset.discountPrice);
        const hasDiscount = discountPrice && discountPrice < originalPrice;
        
        if (hasDiscount) {
            // Prezzo originale barrato
            const originalPriceEl = card.querySelector('div[style*="text-decoration: line-through"]');
            if (originalPriceEl) {
                originalPriceEl.textContent = formatPrice(originalPrice, originalCurrency);
            }
            
            // Prezzo scontato
            const discountedPriceEl = card.querySelector('div[style*="background-clip: text"]');
            if (discountedPriceEl) {
                discountedPriceEl.textContent = formatPrice(discountPrice, originalCurrency);
            }
        } else {
            // Prezzo normale
            const priceElement = card.querySelector('.card-price');
            if (priceElement) {
                priceElement.textContent = formatPrice(originalPrice, originalCurrency);
            }
        }
    });
    
    // 2. NOTIFICA ALLE PAGINE SPECIFICHE (tramite evento custom)
    window.dispatchEvent(new CustomEvent('pricesUpdated'));
    
    console.log('✅ [SHARED] Prezzi base aggiornati');
}

// ========================================
// 🎧 LISTENER GLOBALI
// ========================================

/**
 * Inizializza listener per cambio lingua
 */
function initSharedListeners() {
    // Listener per cambio lingua
    document.addEventListener('languageChanged', () => {
        console.log('🌍 [SHARED] Lingua cambiata, aggiorno prezzi');
        updateAllPricesForLanguage();
    });
    
    // Listener per tassi caricati
    window.addEventListener('exchangeRatesLoaded', (event) => {
        console.log('💱 [SHARED] Tassi caricati, forzo refresh prezzi');
        setTimeout(() => {
            updateAllPricesForLanguage();
        }, 100);
    });
    
    // Listener per storage (cambio lingua da altra tab)
    window.addEventListener('storage', (event) => {
        if (event.key === 'lh360_lang' && event.newValue) {
            let i18n = null;
            if (typeof window.i18nPDP === 'function') {
                i18n = window.i18nPDP();
            } else if (typeof window.i18n === 'function') {
                i18n = window.i18n();
            }
            
            if (i18n && i18n.currentLang !== event.newValue) {
                i18n.changeLanguage(event.newValue);
            }
        }
    });
}

// ========================================
// 🚀 AUTO-INIZIALIZZAZIONE
// ========================================

// Carica tassi appena il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 [SHARED] Inizializzazione logica condivisa');
        initSharedListeners();
        loadExchangeRates();
    });
} else {
    console.log('🚀 [SHARED] Inizializzazione logica condivisa (DOM già pronto)');
    initSharedListeners();
    loadExchangeRates();
}

console.log('📦 [SHARED] Modulo logica condivisa caricato');
