/**
 * =====================================================
 * LUXHAVEN360 - GESTIONE CENTRALIZZATA PREZZI
 * Conversione valuta e formattazione per product-details
 * =====================================================
 */

// 💱 Tassi di cambio globali (aggiornati dal backend)
let exchangeRates = { 'EUR': 1, 'USD': 1.17, 'GBP': 0.87 }; // Fallback

/**
 * 💱 Carica tassi di cambio dal backend
 */
async function loadExchangeRates() {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec';
    
    try {
        const response = await fetch(`${WEB_APP_URL}?action=get_exchange_rates&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.success && data.rates) {
            exchangeRates = data.rates;
            console.log('✅ Tassi di cambio aggiornati:', exchangeRates);
            console.log('📅 Ultimo aggiornamento:', data.updated || 'N/A');
            return true;
        }
        return false;
    } catch (error) {
        console.warn('⚠️ Errore caricamento tassi, uso fallback:', error);
        return false;
    }
}

/**
 * 💰 Formatta prezzo con conversione valuta
 * @param {number} price - Prezzo in valuta originale
 * @param {string} originalCurrency - Valuta originale (default: EUR)
 * @returns {string} - Prezzo formattato con simbolo
 */
function formatPrice(price, originalCurrency = 'EUR') {
    const amount = parseFloat(price) || 0;
    const i18n = window.i18nPDP && window.i18nPDP();
    const currentLang = i18n ? i18n.currentLang : 'it';
    
    // 🌍 Configurazione per lingua
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
    
    // 💱 Conversione valuta
    let convertedAmount = amount;
    if (originalCurrency !== config.currency) {
        const fromRate = exchangeRates[originalCurrency] || 1;
        const toRate = exchangeRates[config.currency] || 1;
        convertedAmount = (amount / fromRate) * toRate;
    }
    
    // 🔢 Formattazione numero
    let formatted = convertedAmount.toFixed(config.decimals);
    formatted = formatted.replace('.', config.decimal);
    
    let parts = formatted.split(config.decimal);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands);
    formatted = parts.join(config.decimal);
    
    // 💲 Posizionamento simbolo
    if (config.symbolPosition === 'before') {
        return `${config.symbol}${formatted}`;
    } else {
        return `${formatted} ${config.symbol}`;
    }
}

/**
 * 🔄 Aggiorna TUTTI i prezzi visibili nella pagina corrente
 * Gestisce: PDP, Carrello, Card prodotti, Prodotti consigliati
 */
function updateAllPricesForLanguage() {
    console.log('🔄 updateAllPricesForLanguage: Inizio aggiornamento prezzi');
    
    const i18n = window.i18nPDP && window.i18nPDP();
    if (!i18n) {
        console.warn('⚠️ i18nPDP non disponibile, skip aggiornamento');
        return;
    }
    
    let updatedCount = 0;
    
    // ========================================
    // 1. AGGIORNA PREZZI NELLE CARD PRODOTTO
    // ========================================
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
                updatedCount++;
            }
            
            // Prezzo scontato
            const discountedPriceEl = card.querySelector('div[style*="background-clip: text"]');
            if (discountedPriceEl && discountedPriceEl.parentElement.style.display === 'flex') {
                discountedPriceEl.textContent = formatPrice(discountPrice, originalCurrency);
                updatedCount++;
            }
        } else {
            // Prezzo normale
            const priceElement = card.querySelector('.card-price');
            if (priceElement) {
                priceElement.textContent = formatPrice(originalPrice, originalCurrency);
                updatedCount++;
            }
        }
    });
    
    // ========================================
    // 2. AGGIORNA PREZZO PDP (pdp-products.html)
    // ========================================
    if (typeof currentProduct !== 'undefined' && currentProduct && currentProduct.price) {
        const priceContainer = document.getElementById('productPrice');
        if (priceContainer) {
            if (currentProduct.discountPrice && currentProduct.discountPrice < currentProduct.price) {
                const discountPercent = Math.round(((currentProduct.price - currentProduct.discountPrice) / currentProduct.price) * 100);
                
                priceContainer.innerHTML = `
                    <div class="price-container">
                        <div class="price-original">${formatPrice(currentProduct.price, currentProduct.currency || 'EUR')}</div>
                        <div class="price-row">
                            <div class="price-discounted">${formatPrice(currentProduct.discountPrice, currentProduct.currency || 'EUR')}</div>
                            <span class="discount-badge">-${discountPercent}%</span>
                        </div>
                    </div>
                `;
            } else {
                priceContainer.innerHTML = `<div class="price">${formatPrice(currentProduct.price, currentProduct.currency || 'EUR')}</div>`;
            }
            updatedCount++;
        }
    }
    
    // ========================================
    // 3. AGGIORNA RIEPILOGO CARRELLO (cart.html)
    // ========================================
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        // Ricalcola subtotale
        let subtotal = 0;
        cart.forEach(item => {
            const finalPrice = (item.discountPrice && item.discountPrice < item.price) 
                ? item.discountPrice 
                : item.price;
            subtotal += finalPrice * (item.qty || 1);
        });
        
        const savedDiscounts = JSON.parse(localStorage.getItem('lh360_applied_discounts') || '{}');
        const discount = savedDiscounts.totalDiscount || 0;
        
        const shippingThreshold = getShippingThreshold ? getShippingThreshold() : 150;
        const totalAfterDiscounts = subtotal - discount;
        const shipping = totalAfterDiscounts >= shippingThreshold ? 0 : 15;
        const total = subtotal + shipping - discount;
        
        // Aggiorna UI
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
        const discountEl = document.getElementById('discount');
        
        if (subtotalEl) {
            subtotalEl.textContent = formatPrice(subtotal);
            updatedCount++;
        }
        
        if (shippingEl) {
            shippingEl.textContent = shipping === 0 
                ? i18n.t('cart_summary_shipping_free') 
                : formatPrice(shipping);
            updatedCount++;
        }
        
        if (totalEl) {
            totalEl.textContent = formatPrice(total);
            updatedCount++;
        }
        
        if (discountEl && discount > 0) {
            discountEl.innerHTML = `- ${formatPrice(discount)}`;
            updatedCount++;
        }
        
        // Aggiorna soglia spedizione
        const shippingThresholdEl = document.getElementById('shippingThreshold');
        if (shippingThresholdEl) {
            shippingThresholdEl.textContent = formatPrice(shippingThreshold);
            updatedCount++;
        }
    }
    
    // ========================================
    // 4. AGGIORNA PRODOTTI CONSIGLIATI
    // ========================================
    document.querySelectorAll('.recommended-item').forEach(card => {
        const originalPrice = parseFloat(card.dataset.originalPrice);
        const discountPrice = parseFloat(card.dataset.discountPrice);
        const originalCurrency = card.dataset.originalCurrency || 'EUR';
        
        if (!originalPrice) return;
        
        const hasDiscount = discountPrice && discountPrice < originalPrice;
        
        if (hasDiscount) {
            const originalPriceEl = card.querySelector('div[style*="text-decoration: line-through"]');
            if (originalPriceEl) {
                originalPriceEl.textContent = formatPrice(originalPrice, originalCurrency);
                updatedCount++;
            }
            
            const discountedPriceEl = card.querySelector('span[style*="background-clip: text"]');
            if (discountedPriceEl) {
                discountedPriceEl.textContent = formatPrice(discountPrice, originalCurrency);
                updatedCount++;
            }
        } else {
            const priceElements = card.querySelectorAll('.recommended-price');
            priceElements.forEach(el => {
                el.textContent = formatPrice(originalPrice, originalCurrency);
                updatedCount++;
            });
        }
    });
    
    console.log(`✅ Aggiornati ${updatedCount} prezzi`);
}

/**
 * 🔄 Soglia spedizione convertita (per cart.html)
 */
function getShippingThreshold() {
    const baseThreshold = 150; // Sempre in EUR
    const i18n = window.i18nPDP && window.i18nPDP();
    
    if (!i18n) return baseThreshold;
    
    const currencyConfig = {
        it: { currency: 'EUR', rate: 1 },
        fr: { currency: 'EUR', rate: 1 },
        de: { currency: 'EUR', rate: 1 },
        es: { currency: 'EUR', rate: 1 },
        en: { currency: 'USD', rate: 1.17 }
    };
    
    const config = currencyConfig[i18n.currentLang] || { currency: 'EUR', rate: 1 };
    return baseThreshold * config.rate;
}

// ========================================
// 🎧 LISTENER CAMBIO LINGUA
// ========================================
document.addEventListener('languageChanged', () => {
    console.log('🌍 Lingua cambiata, aggiorno prezzi...');
    updateAllPricesForLanguage();
});

// Listener per cambio lingua da altre pagine (storage sync)
window.addEventListener('storage', (event) => {
    if (event.key === 'lh360_lang' && event.newValue) {
        const i18n = window.i18nPDP && window.i18nPDP();
        if (i18n && i18n.currentLang !== event.newValue) {
            i18n.changeLanguage(event.newValue);
        }
    }
});

console.log('✅ Price Manager caricato');
