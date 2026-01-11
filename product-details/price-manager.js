/**
 * =====================================================
 * PRICE MANAGER - Sistema centralizzato gestione prezzi
 * Condiviso tra tutte le pagine product-details
 * =====================================================
 */

// 💱 Tassi di cambio globali (cache)
let exchangeRates = { 'EUR': 1, 'USD': 1.17, 'GBP': 0.87 };

// 🔗 URL backend (sincronizzato con index.html)
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec';

/**
 * 💱 Carica tassi di cambio dal backend
 */
async function loadExchangeRates() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=get_exchange_rates&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.success && data.rates) {
            exchangeRates = data.rates;
            console.log('✅ Tassi caricati (PDP):', exchangeRates);
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Errore caricamento tassi (PDP), uso fallback:', error);
    }
    return false;
}

/**
 * 💰 Formatta prezzo con conversione valuta
 * @param {number} price - Prezzo in valuta originale
 * @param {string} originalCurrency - Valuta originale (default: EUR)
 * @returns {string} - Prezzo formattato
 */
function formatPrice(price, originalCurrency = 'EUR') {
    const amount = parseFloat(price) || 0;
    const i18n = window.i18nPDP && window.i18nPDP();
    
    if (!i18n) {
        // Fallback se i18n non è pronto
        return `€ ${amount.toFixed(2).replace('.', ',')}`;
    }
    
    // 🌍 Configurazione per lingua
    const localeConfig = {
        it: { currency: 'EUR', decimals: amount < 500 ? 2 : 0 },
        en: { currency: 'USD', decimals: amount < 500 ? 2 : 0 },
        fr: { currency: 'EUR', decimals: amount < 500 ? 2 : 0 },
        de: { currency: 'EUR', decimals: amount < 500 ? 2 : 0 },
        es: { currency: 'EUR', decimals: amount < 500 ? 2 : 0 }
    };
    
    const config = localeConfig[i18n.currentLang] || localeConfig.it;
    
    // 💱 Conversione valuta
    let convertedAmount = amount;
    if (originalCurrency !== config.currency) {
        const fromRate = exchangeRates[originalCurrency] || 1;
        const toRate = exchangeRates[config.currency] || 1;
        convertedAmount = (amount / fromRate) * toRate;
    }
    
    // Usa i18n.formatPrice se disponibile
    return i18n.formatPrice(convertedAmount, config.currency);
}

/**
 * 🔄 Aggiorna tutti i prezzi visibili con la nuova valuta
 * Funziona in pdp-products.html, cart.html, booking.html
 */
function updateAllPricesForLanguage() {
    console.log('🔄 updateAllPricesForLanguage (PDP): Inizio aggiornamento');
    const i18n = window.i18nPDP && window.i18nPDP();
    
    if (!i18n) {
        console.warn('⚠️ i18n non disponibile, skip update');
        return;
    }
    
    let updatedCount = 0;
    
    // ✅ 1. Aggiorna elementi con data-original-price
    document.querySelectorAll('[data-original-price]').forEach(element => {
        const originalPrice = parseFloat(element.dataset.originalPrice);
        const originalCurrency = element.dataset.originalCurrency || 'EUR';
        const discountPrice = parseFloat(element.dataset.discountPrice);
        
        if (!originalPrice) return;
        
        const hasDiscount = discountPrice && discountPrice < originalPrice;
        
        // Se ha sconto, aggiorna entrambi i prezzi
        if (hasDiscount) {
            // Prezzo originale barrato
            const originalPriceEl = element.querySelector('[data-price-type="original"]');
            if (originalPriceEl) {
                originalPriceEl.textContent = formatPrice(originalPrice, originalCurrency);
                updatedCount++;
            }
            
            // Prezzo scontato
            const discountPriceEl = element.querySelector('[data-price-type="discount"]');
            if (discountPriceEl) {
                discountPriceEl.textContent = formatPrice(discountPrice, originalCurrency);
                updatedCount++;
            }
        } else {
            // Prezzo singolo
            const priceEl = element.querySelector('[data-price-type="final"]');
            if (priceEl) {
                priceEl.textContent = formatPrice(originalPrice, originalCurrency);
                updatedCount++;
            }
        }
    });
    
    // ✅ 2. Aggiorna prezzi nel carrello (summary sidebar)
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl && subtotalEl.dataset.amount) {
        subtotalEl.textContent = formatPrice(parseFloat(subtotalEl.dataset.amount));
        updatedCount++;
    }
    
    if (shippingEl && shippingEl.dataset.amount) {
        const shippingAmount = parseFloat(shippingEl.dataset.amount);
        shippingEl.textContent = shippingAmount === 0 
            ? i18n.t('cart_summary_shipping_free') 
            : formatPrice(shippingAmount);
        updatedCount++;
    }
    
    if (discountEl && discountEl.dataset.amount) {
        discountEl.textContent = `- ${formatPrice(parseFloat(discountEl.dataset.amount))}`;
        updatedCount++;
    }
    
    if (totalEl && totalEl.dataset.amount) {
        totalEl.textContent = formatPrice(parseFloat(totalEl.dataset.amount));
        updatedCount++;
    }
    
    // ✅ 3. Aggiorna soglia spedizione
    const shippingThresholdEl = document.getElementById('shippingThreshold');
    if (shippingThresholdEl) {
        shippingThresholdEl.textContent = formatPrice(150); // Soglia base in EUR
        updatedCount++;
    }
    
    console.log(`✅ Aggiornati ${updatedCount} prezzi`);
}

/**
 * 🎯 Inizializza price manager
 * Da chiamare all'inizio di ogni pagina
 */
async function initPriceManager() {
    console.log('🎯 Inizializzo Price Manager...');
    
    // 1. Carica tassi di cambio
    await loadExchangeRates();
    
    // 2. Aspetta che i18n sia pronto
    const waitForI18n = () => {
        return new Promise((resolve) => {
            const checkI18n = setInterval(() => {
                if (window.i18nPDP && window.i18nPDP()) {
                    clearInterval(checkI18n);
                    resolve();
                }
            }, 50);
            
            setTimeout(() => {
                clearInterval(checkI18n);
                resolve(); // Timeout dopo 5s
            }, 5000);
        });
    };
    
    await waitForI18n();
    
    // 3. Ascolta cambio lingua
    document.addEventListener('languageChanged', () => {
        console.log('📢 languageChanged ricevuto, aggiorno prezzi...');
        setTimeout(() => updateAllPricesForLanguage(), 100);
    });
    
    // 4. Ascolta storage events (cambio lingua da altre pagine)
    window.addEventListener('storage', (event) => {
        if (event.key === 'lh360_lang' && event.newValue) {
            const i18n = window.i18nPDP && window.i18nPDP();
            if (i18n && i18n.currentLang !== event.newValue) {
                i18n.changeLanguage(event.newValue);
            }
        }
    });
    
    console.log('✅ Price Manager inizializzato');
}

// ✅ Auto-init quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPriceManager);
} else {
    initPriceManager();
}
