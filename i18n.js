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
    // 1. Check localStorage (PRIORITÀ MASSIMA - sincronizzato tra pagine)
    const savedLang = localStorage.getItem('lh360_lang');
    if (savedLang && this.translations[savedLang]) {
        return savedLang;
    }

    // 2. Check URL query parameter (?lang=xx)
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

     // LISTENER PER SINCRONIZZAZIONE LINGUA TRA PAGINE
    window.addEventListener('pageshow', (event) => {
      // Ricarica lingua da localStorage (potrebbe essere cambiata in altra pagina)
      const savedLang = localStorage.getItem('lh360_lang');
      
      if (savedLang && savedLang !== this.currentLang && this.translations[savedLang]) {
        console.log(`ðŸ"„ Sincronizzazione lingua rilevata: ${this.currentLang} â†' ${savedLang}`);
        this.currentLang = savedLang;
        
        // Aggiorna URL senza ricaricare
        const url = new URL(window.location);
        url.searchParams.set('lang', savedLang);
        window.history.replaceState({}, '', url.toString());
        
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
        }
        
        console.log(`âœ… Lingua aggiornata automaticamente a: ${savedLang.toUpperCase()}`);
      }
    });
    
    // ✅ Aggiorna UI selettore con lingua corrente
    this.updateLanguageSelector();

    // ✅ Sincronizza query parameter nei link al caricamento pagina
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

    // Aggiorna URL con query parameter
    const url = new URL(window.location);
    url.searchParams.set('lang', langCode);
    window.history.replaceState({}, '', url.toString());

    // Sincronizza query parameter per tutti i link interni
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
        
        // Aggiorna query parameter
        try {
            // Se è un path relativo
            if (href.includes('?')) {
                // URL con query esistente
                const url = new URL(href, window.location.origin);
                url.searchParams.set('lang', langCode);
                link.setAttribute('href', url.pathname + url.search);
            } else {
                // URL senza query
                link.setAttribute('href', `${href}?lang=${langCode}`);
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
}

// Inizializza sistema i18n
let i18nInstance;

document.addEventListener('DOMContentLoaded', () => {
  i18nInstance = new I18n();
});

// Esporta per uso globale
window.i18n = () => i18nInstance;
