/**
 * 🌍 LuxHaven360 - Sistema di Internazionalizzazione
 * Gestisce traduzione dinamica e cambio lingua
 */

class I18n {
  constructor() {
    this.translations = translations;
    this.currentLang = this.detectLanguage();
    this.baseUrl = 'https://luxhaven360.com';
    this.init();
}

  /**
   * Rileva lingua da URL o localStorage
   */
   detectLanguage() {
    // 1. Check URL path (es. /it/, /en/, /fr/, /de/, /es/)
    const pathMatch = window.location.pathname.match(/^\/(it|en|fr|de|es)(\/|$)/);
    if (pathMatch && this.translations[pathMatch[1]]) {
        localStorage.setItem('lh360_lang', pathMatch[1]);
        return pathMatch[1];
    }

    // 2. Check localStorage (sincronizzato tra pagine)
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
    // Routing path-based: https://luxhaven360.com/{lang}/...
    // Rimuove il prefisso lingua esistente (se presente)
    const cleanPath = window.location.pathname.replace(/^\/(it|en|fr|de|es)(\/|$)/, '/') || '/';
    // Rimuove eventuali ?lang= residui dalla query string
    const cleanSearch = window.location.search.replace(/[?&]lang=[a-z]+/, '').replace(/^\?$/, '');
    const newPath = '/' + langCode + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
    window.history.replaceState({}, '', newPath + cleanSearch);
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

     // LISTENER PER SINCRONIZZAZIONE LINGUA TRA PAGINE
    window.addEventListener('pageshow', (event) => {
      // Ricarica lingua da localStorage (potrebbe essere cambiata in altra pagina)
      const savedLang = localStorage.getItem('lh360_lang');
      
      if (savedLang && savedLang !== this.currentLang && this.translations[savedLang]) {
        console.log(`🔄 Sincronizzazione lingua rilevata: ${this.currentLang} → ${savedLang}`);
        this.currentLang = savedLang;
        
        // Aggiorna URL path senza ricaricare (es. /it/ → /fr/)
        this.redirectToLanguagePath(savedLang);
        
        // Ri-traduci TUTTA la pagina
        this.translatePage();
        this.updateLanguageSelector();
        this.updateInternalLinks(savedLang);
        
        // Aggiorna prezzi e badge
        if (typeof updateAllPricesForLanguage === 'function') {
          setTimeout(() => updateAllPricesForLanguage(), 100);
        }
        if (typeof updateAllBadgesForLanguage === 'function') {
          setTimeout(() => updateAllBadgesForLanguage(), 100);
        
        // Aggiorna descrizioni brevi
        if (typeof updateAllBriefDescriptionsForLanguage === 'function') {
          setTimeout(() => updateAllBriefDescriptionsForLanguage(), 100);
        }
        }
        
        console.log(`✅ Lingua aggiornata automaticamente a: ${savedLang.toUpperCase()}`);
      }
    });
    
    // ✅ Aggiorna UI selettore con lingua corrente
    this.updateLanguageSelector();

    // Sincronizza il prefisso lingua nei link al caricamento pagina
    this.updateInternalLinks(this.currentLang);
    
    // Listener per contenuti dinamici
    this.observeDynamicContent();
    
    // ✅✅✅ AGGIUNGI QUESTO OBSERVER PER I PULSANTI ✅✅✅
    // Observer specifico per pulsanti con data-i18n
    const buttonObserver = new MutationObserver((mutations) => {
      let needsUpdate = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Se è un button con data-i18n
            if (node.tagName === 'BUTTON' && node.hasAttribute('data-i18n')) {
              needsUpdate = true;
            }
            // O contiene buttons con data-i18n
            if (node.querySelectorAll && node.querySelectorAll('button[data-i18n]').length > 0) {
              needsUpdate = true;
            }
          }
        });
      });
      
      if (needsUpdate) {
        console.log('🔄 Nuovi pulsanti rilevati, aggiornamento automatico...');
        setTimeout(() => {
          this.translatePage();
        }, 50);
      }
    });
    
    buttonObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
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

    // ✅✅✅ MODIFICA QUESTO BLOCCO CON DEBUG ✅✅✅
    console.log('🔘 Aggiornamento pulsanti dinamici...');
    const buttons = document.querySelectorAll('button[data-i18n]');
    console.log(`  Trovati ${buttons.length} pulsanti`);
    console.log(`  Lingua corrente: ${this.currentLang}`);
    
    buttons.forEach(btn => {
      const key = btn.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // ✅ DEBUG: Mostra cosa sta succedendo
      console.log(`  🔍 Key: "${key}" → Translation: "${translation}"`);
      
      if (translation && translation !== key) {
        // ✅ FORZA aggiornamento con innerHTML invece di textContent
        btn.innerHTML = '';
        btn.textContent = translation;
        
        // ✅ VERIFICA se il testo è cambiato
        console.log(`  ✅ Button aggiornato: "${btn.textContent}"`);
      } else {
        console.warn(`  ⚠️ Traduzione mancante per key: "${key}"`);
      }
    });
    console.log('  ✅ Pulsanti aggiornati');

    // Dispatch custom event for post-translation hooks (e.g. EA counter note)
    try {
      document.dispatchEvent(new CustomEvent('lh360:translated', { detail: { lang: this.currentLang } }));
    } catch(e) {}
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

  changeLanguage(langCode) {
    if (!this.translations[langCode]) {
        console.error(`Lingua "${langCode}" non supportata`);
        return;
    }

    localStorage.setItem('lh360_lang', langCode);
    this.currentLang = langCode;

    // Aggiorna URL con prefisso lingua path-based (es. /it/ → /fr/)
    this.redirectToLanguagePath(langCode);

    // Sincronizza prefisso lingua per tutti i link interni
    this.updateInternalLinks(langCode);

    // Traduci pagina
    this.translatePage();
    this.updateLanguageSelector();

    // ✅✅✅ PRIMO AGGIORNAMENTO PULSANTI ✅✅✅
    setTimeout(() => {
        console.log('🔄 Ri-traduzione pulsanti con delay...');
        const buttons = document.querySelectorAll('button[data-i18n]');
        console.log(`  Pulsanti trovati: ${buttons.length}`);
        
        buttons.forEach(btn => {
            const key = btn.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                btn.textContent = translation;
            }
        });
        console.log('  ✅ Pulsanti aggiornati con delay');
    }, 100);

    // ✅✅✅ AGGIUNGI QUESTO NUOVO BLOCCO ✅✅✅
    // Secondo aggiornamento per pulsanti creati dinamicamente
    setTimeout(() => {
        console.log('🔄 Secondo passaggio traduzione pulsanti...');
        const buttons = document.querySelectorAll('button[data-i18n]');
        console.log(`  Pulsanti rilevati: ${buttons.length}`);
        
        buttons.forEach(btn => {
            const key = btn.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                btn.textContent = translation;
            }
        });
        console.log('  ✅ Secondo passaggio completato');
    }, 500); // Delay maggiore per aspettare rendering DOM

    // Aggiorna prezzi
    if (typeof updateAllPricesForLanguage === 'function') {
        updateAllPricesForLanguage();
    }

    // Aggiorna badge
    if (typeof updateAllBadgesForLanguage === 'function') {
        updateAllBadgesForLanguage();
    }

    // ✅ Aggiorna descrizioni brevi
    if (typeof updateAllBriefDescriptionsForLanguage === 'function') {
        updateAllBriefDescriptionsForLanguage();
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));

    console.log(`✅ Lingua cambiata: ${langCode.toUpperCase()}`);
}

  /**
 * Aggiorna tutti i link interni con il query parameter lingua
 */
updateInternalLinks(langCode) {
    // Seleziona tutti i link interni (non esterni)
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        
        // Salta link esterni, ancore, mailto, tel
        if (!href || 
            href.startsWith('http') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            href.startsWith('#')) {
            return;
        }
        
        // Aggiorna prefisso lingua nel path
        try {
            // Rimuove eventuali ?lang= residui e prefisso lingua esistente
            let cleanHref = href
                .replace(/[?&]lang=[a-z]+/g, '')
                .replace(/^\/(it|en|fr|de|es)(\/|$)/, '/');

            if (cleanHref.startsWith('/')) {
                // Path assoluto: /path → /{lang}/path
                link.setAttribute('href', '/' + langCode + cleanHref);
            } else {
                // Path relativo: file.html → /{lang}/file.html
                link.setAttribute('href', '/' + langCode + '/' + cleanHref);
            }
        } catch (e) {
            // Ignora errori di parsing
        }
    });
}

  /**
   * Setup selettore lingua nella navbar
   */
  setupLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    // Imposta lingua corrente nel selettore con flag-icons
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

  /**
   * Traduce descrizioni brevi delle supercar (index.html)
   * @param {string} briefDescIT - Descrizione breve in italiano
   * @returns {string} - Descrizione tradotta nella lingua corrente
   */
  translateBriefDescription(briefDescIT) {
    if (!briefDescIT || !window.translationsBriefDescriptions) return briefDescIT;
    
    const descriptions = window.translationsBriefDescriptions;
    const lang = this.currentLang;
    
    // Mappa le descrizioni in base a parole chiave univoche
    const descMap = {
      // Combo
      "Ferrari California e Ferrari 458 Italia": "california_458italia",
      "Ferrari California e Ferrari California T": "california_californiat",
      "Ferrari California e Ferrari 488 Spider": "california_488spider",
      "Ferrari California e Ferrari Portofino": "california_portofino",
      "Ferrari California e Lamborghini Huracán Spyder": "california_huracan",
      "Ferrari California T e Ferrari 458 Spider": "californiat_458spider",
      "Ferrari California T e Ferrari 488 Spider": "californiat_488spider",
      "Ferrari California T e Ferrari Portofino": "californiat_portofino",
      "Ferrari California T e Lamborghini Huracán Spyder": "californiat_huracan",
      "Ferrari Portofino e Ferrari 458 Italia": "portofino_458italia",
      "Ferrari Portofino e Ferrari 488 Spider": "portofino_488spider",
      "Ferrari Portofino e Lamborghini Huracán Spyder": "portofino_huracan",
      "Ferrari 458 Italia e Ferrari 488 Spider": "458italia_488spider",
      "Ferrari 458 Italia e Lamborghini Huracán Spyder": "458italia_huracan",
      "Ferrari 488 Spider e Lamborghini Huracán Spyder": "488spider_huracan",
      
      // Singole
      "con la Ferrari California.": "california",
      "la Ferrari Portofino per": "portofino",
      "della Ferrari 488 Spider a": "488spider",
      "della Ferrari 458 Italia a": "458italia",
      "la Ferrari California T sulle": "californiat",
      "della Lamborghini Huracán Spyder a": "huracan",
      "della Ferrari 458 Spider a": "458spider",
      "la Ferrari F8 sulle": "f8spider",
      "della Ferrari 296 a": "296",
      "la Ferrari Roma a": "roma",
      "della Maserati MC20 Cielo a": "mc20cielo",
      "la McLaren 720S Performance a": "720s"
    };
    
    // Trova la chiave corrispondente
    for (const [keyword, key] of Object.entries(descMap)) {
      if (briefDescIT.includes(keyword)) {
        const translation = descriptions[key]?.[lang];
        if (translation) {
          console.log(`✅ Tradotta descrizione breve: ${key} → ${lang}`);
          return translation;
        }
      }
    }
    
    // Se non trova una traduzione, restituisce l'originale
    console.warn(`⚠️ Descrizione breve non trovata per traduzione:`, briefDescIT.substring(0, 50));
    return briefDescIT;
  }

  /**
   * Traduce la breve descrizione di un prodotto shop tramite SKU (index.html)
   * Usa lookup diretto su window.translationsBriefDescriptions
   *
   * @param {string} sku - SKU del prodotto (es. 'ME-01-LE')
   * @returns {string|null} - Descrizione tradotta, o null se lo SKU non è presente
   */
  translateBriefDescBySku(sku) {
    if (!sku || !window.translationsBriefDescriptions) return null;

    const entry = window.translationsBriefDescriptions[sku];
    if (!entry) return null;

    const translation = entry[this.currentLang] || entry['it'] || null;
    if (translation) {
      console.log(`✅ Breve descrizione tradotta via SKU: ${sku} → ${this.currentLang}`);
    }
    return translation;
  }
}

// Inizializza sistema i18n
let i18nInstance;

document.addEventListener('DOMContentLoaded', () => {
  i18nInstance = new I18n();
});

// Esporta per uso globale
window.i18n = () => i18nInstance;

/**
 * Helper globale per costruire URL interni con prefisso lingua.
 * Utilizza la lingua attiva da i18nInstance, con fallback a localStorage o 'it'.
 *
 * Esempi:
 *   lhUrl('product-details/cart.html')
 *   → 'https://luxhaven360.com/it/product-details/cart.html'
 *
 *   lhUrl('product-details/booking.html?sku=X')
 *   → 'https://luxhaven360.com/fr/product-details/booking.html?sku=X'
 *
 * @param {string} path - Path relativo o assoluto (senza dominio)
 * @returns {string} URL completo con dominio e prefisso lingua
 */
window.lhUrl = function(path) {
  const BASE = 'https://luxhaven360.com';
  const lang = (i18nInstance && i18nInstance.currentLang)
    || localStorage.getItem('lh360_lang')
    || 'it';
  // Rimuove eventuali slash iniziali dal path per evitare doppi slash
  const cleanPath = (path || '').replace(/^\/+/, '');
  return `${BASE}/${lang}/${cleanPath}`;
};
