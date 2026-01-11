/**
 * 💰 LUXHAVEN360 - Price Manager Unificato
 * Gestisce aggiornamento prezzi dinamici per tutte le pagine product-details
 */

class PriceManager {
  constructor() {
    this.exchangeRates = { 'EUR': 1, 'USD': 1.17, 'GBP': 0.87 }; // Fallback
    this.WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwr79RkXIEocpuOKaM6uMJqE6VFs9wjlUPvrr__FvDbDDrD2ELB1NbfrWP3BCYpHj2u/exec';
  }

  /**
   * Carica tassi di cambio aggiornati dal backend
   */
  async loadExchangeRates() {
    try {
      const response = await fetch(`${this.WEB_APP_URL}?action=get_exchange_rates&t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success && data.rates) {
        this.exchangeRates = data.rates;
        console.log('✅ Tassi di cambio aggiornati:', this.exchangeRates);
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
   * Formatta prezzo con conversione valuta
   */
  formatPrice(price, originalCurrency = 'EUR') {
    const amount = parseFloat(price) || 0;
    const i18n = window.i18nPDP && window.i18nPDP();
    const currentLang = i18n ? i18n.currentLang : 'it';
    
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
    
    // Conversione valuta
    let convertedAmount = amount;
    if (originalCurrency !== config.currency) {
      const fromRate = this.exchangeRates[originalCurrency] || 1;
      const toRate = this.exchangeRates[config.currency] || 1;
      convertedAmount = (amount / fromRate) * toRate;
    }
    
    // Formattazione
    let formatted = convertedAmount.toFixed(config.decimals);
    formatted = formatted.replace('.', config.decimal);
    
    let parts = formatted.split(config.decimal);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands);
    formatted = parts.join(config.decimal);
    
    return config.symbolPosition === 'before' 
      ? `${config.symbol}${formatted}` 
      : `${formatted} ${config.symbol}`;
  }

  /**
   * Aggiorna tutti i prezzi nella pagina corrente
   */
  updateAllPrices() {
    console.log('🔄 Aggiornamento prezzi...');
    
    // 1. Aggiorna card prodotti (con data attributes)
    document.querySelectorAll('.card[data-original-price]').forEach(card => {
      this.updateCardPrice(card);
    });

    // 2. Aggiorna prodotto singolo (PDP)
    this.updateProductPrice();

    // 3. Aggiorna riepilogo carrello
    this.updateCartSummary();

    // 4. Aggiorna prodotti consigliati
    this.updateRecommendedProducts();

    console.log('✅ Prezzi aggiornati');
  }

  /**
   * Aggiorna prezzo card prodotto
   */
  updateCardPrice(card) {
    const originalPrice = parseFloat(card.dataset.originalPrice);
    const discountPrice = parseFloat(card.dataset.discountPrice);
    const currency = card.dataset.originalCurrency || 'EUR';
    
    if (!originalPrice) return;

    const hasDiscount = discountPrice && discountPrice < originalPrice;

    if (hasDiscount) {
      // Prezzo originale barrato
      const originalPriceEl = card.querySelector('div[style*="text-decoration: line-through"]');
      if (originalPriceEl) {
        originalPriceEl.textContent = this.formatPrice(originalPrice, currency);
      }

      // Prezzo scontato
      const discountedPriceEl = card.querySelector('div[style*="background-clip: text"]');
      if (discountedPriceEl) {
        discountedPriceEl.textContent = this.formatPrice(discountPrice, currency);
      }
    } else {
      // Prezzo normale
      const priceEl = card.querySelector('.card-price, .recommended-price');
      if (priceEl) {
        priceEl.textContent = this.formatPrice(originalPrice, currency);
      }
    }
  }

  /**
   * Aggiorna prezzo prodotto singolo (PDP)
   */
  updateProductPrice() {
    if (typeof currentProduct === 'undefined' || !currentProduct) return;

    const priceContainer = document.getElementById('productPrice');
    if (!priceContainer) return;

    const hasDiscount = currentProduct.discountPrice && currentProduct.discountPrice < currentProduct.price;

    if (hasDiscount) {
      const discountPercent = Math.round(((currentProduct.price - currentProduct.discountPrice) / currentProduct.price) * 100);
      
      priceContainer.innerHTML = `
        <div class="price-container">
          <div class="price-original">${this.formatPrice(currentProduct.price, currentProduct.currency || 'EUR')}</div>
          <div class="price-row">
            <div class="price-discounted">${this.formatPrice(currentProduct.discountPrice, currentProduct.currency || 'EUR')}</div>
            <span class="discount-badge">-${discountPercent}%</span>
          </div>
        </div>
      `;
    } else {
      priceContainer.innerHTML = `<div class="price">${this.formatPrice(currentProduct.price, currentProduct.currency || 'EUR')}</div>`;
    }
  }

  /**
   * Aggiorna riepilogo carrello
   */
  updateCartSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');

    if (!subtotalEl) return; // Non siamo in cart.html

    // Recupera dati salvati
    const savedDiscounts = JSON.parse(localStorage.getItem('lh360_applied_discounts') || '{}');
    const cart = JSON.parse(localStorage.getItem('lh360_cart')) || [];

    // Calcola subtotale
    let subtotal = 0;
    cart.forEach(item => {
      const finalPrice = (item.discountPrice && item.discountPrice < item.price) 
        ? item.discountPrice 
        : item.price;
      subtotal += finalPrice * (item.qty || 1);
    });

    const discount = savedDiscounts.totalDiscount || 0;
    const shippingThreshold = this.getShippingThreshold();
    const totalAfterDiscounts = subtotal - discount;
    const shipping = totalAfterDiscounts >= shippingThreshold ? 0 : 15;
    const total = subtotal + shipping - discount;

    // Aggiorna UI
    subtotalEl.textContent = this.formatPrice(subtotal);
    
    const i18n = window.i18nPDP && window.i18nPDP();
    shippingEl.textContent = shipping === 0 
      ? (i18n ? i18n.t('cart_summary_shipping_free') : 'Gratuita')
      : this.formatPrice(shipping);
    
    if (discountEl && discount > 0) {
      discountEl.textContent = `- ${this.formatPrice(discount)}`;
    }
    
    totalEl.textContent = this.formatPrice(total);

    // Aggiorna soglia spedizione
    const thresholdEl = document.getElementById('shippingThreshold');
    if (thresholdEl) {
      thresholdEl.textContent = this.formatPrice(shippingThreshold);
    }
  }

  /**
   * Aggiorna prodotti consigliati
   */
  updateRecommendedProducts() {
    document.querySelectorAll('.recommended-item[data-original-price]').forEach(item => {
      this.updateCardPrice(item);
    });
  }

  /**
   * Calcola soglia spedizione in base alla lingua
   */
  getShippingThreshold() {
    const baseThreshold = 150; // Sempre in EUR
    const i18n = window.i18nPDP && window.i18nPDP();
    
    if (!i18n) return baseThreshold;
    
    const currencyConfig = {
      it: { rate: 1 },
      fr: { rate: 1 },
      de: { rate: 1 },
      es: { rate: 1 },
      en: { rate: 1.17 }
    };
    
    const config = currencyConfig[i18n.currentLang] || { rate: 1 };
    return baseThreshold * config.rate;
  }
}

// Inizializza istanza globale
window.priceManager = new PriceManager();

// Listener per cambio lingua
document.addEventListener('languageChanged', () => {
  if (window.priceManager) {
    window.priceManager.updateAllPrices();
  }
});

// Listener storage (sincronizzazione tra tab)
window.addEventListener('storage', (event) => {
  if (event.key === 'lh360_lang' && window.priceManager) {
    setTimeout(() => window.priceManager.updateAllPrices(), 100);
  }
});
