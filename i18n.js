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
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    
    // Detect GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
        // GitHub Pages: /repo/lingua/...
        let repoIndex = -1;
        
        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === this.githubRepo) {
                repoIndex = i;
                break;
            }
        }
        
        if (repoIndex !== -1 && pathParts[repoIndex + 1]) {
            const possibleLang = pathParts[repoIndex + 1];
            if (this.translations[possibleLang]) {
                localStorage.setItem('lh360_lang', possibleLang);
                return possibleLang;
            }
        }
    } else {
        // Dominio personale: /lingua/...
        if (pathParts[0] && this.translations[pathParts[0]]) {
            const langFromPath = pathParts[0];
            localStorage.setItem('lh360_lang', langFromPath);
            return langFromPath;
        }
    }

    // 2. Check localStorage
    const savedLang = localStorage.getItem('lh360_lang');
    if (savedLang && this.translations[savedLang]) {
        this.redirectToLanguagePath(savedLang);
        return savedLang;
    }

    // 3. Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.translations[browserLang]) {
        this.redirectToLanguagePath(browserLang);
        return browserLang;
    }

    // 4. Default: italiano
    this.redirectToLanguagePath('it');
    return 'it';
}

  /**
 * Redirect per inserire lingua nel path se mancante
 */
 redirectToLanguagePath(langCode) {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    
    // Detect GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
        // Caso GitHub Pages: /repo/lingua/...
        let repoIndex = -1;
        
        // Trova l'indice del repository
        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === this.githubRepo) {
                repoIndex = i;
                break;
            }
        }
        
        if (repoIndex === -1) {
            // Repository non trovato, aggiungilo
            const newPath = `/${this.githubRepo}/${langCode}/`;
            window.history.replaceState({}, '', newPath + window.location.search + window.location.hash);
            return;
        }
        
        // Repository trovato, verifica se c'è già una lingua dopo di esso
        const afterRepoIndex = repoIndex + 1;
        
        // Rimuovi lingua esistente se presente
        if (pathParts[afterRepoIndex] && this.translations[pathParts[afterRepoIndex]]) {
            pathParts.splice(afterRepoIndex, 1);
        }
        
        // Inserisci nuova lingua dopo il repository
        pathParts.splice(afterRepoIndex, 0, langCode);
        
        // Ricostruisci path
        const newPath = '/' + pathParts.join('/') + '/';
        window.history.replaceState({}, '', newPath + window.location.search + window.location.hash);
    } else {
        // Dominio personale futuro: /lingua/...
        if (pathParts[0] && this.translations[pathParts[0]]) {
            pathParts.shift();
        }
        
        const restOfPath = pathParts.length ? '/' + pathParts.join('/') : '/';
        const newPath = `/${langCode}${restOfPath}`;
        
        window.history.replaceState({}, '', newPath + window.location.search + window.location.hash);
    }
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
    
    // ✅ Aggiorna UI selettore con lingua corrente
    this.updateLanguageSelector();
    
    // Listener per contenuti dinamici
    this.observeDynamicContent();
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

  /**
   * Cambia lingua e ricarica pagina
   */
   changeLanguage(langCode) {
    if (!this.translations[langCode]) {
        console.error(`Lingua "${langCode}" non supportata`);
        return;
    }

    localStorage.setItem('lh360_lang', langCode);
    this.currentLang = langCode;

    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    
    // Detect GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
        // GitHub Pages: /repo/lingua/...
        let repoIndex = -1;
        
        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === this.githubRepo) {
                repoIndex = i;
                break;
            }
        }
        
        if (repoIndex !== -1) {
            const afterRepoIndex = repoIndex + 1;
            
            // Rimuovi lingua esistente
            if (pathParts[afterRepoIndex] && this.translations[pathParts[afterRepoIndex]]) {
                pathParts.splice(afterRepoIndex, 1);
            }
            
            // Inserisci nuova lingua
            pathParts.splice(afterRepoIndex, 0, langCode);
            
            const newPath = '/' + pathParts.join('/') + '/';
            window.history.replaceState({}, '', newPath + window.location.search + window.location.hash);
        }
    } else {
        // Dominio personale
        if (pathParts[0] && this.translations[pathParts[0]]) {
            pathParts.shift();
        }
        
        const restOfPath = pathParts.length ? '/' + pathParts.join('/') : '/';
        const newPath = `/${langCode}${restOfPath}`;
        
        window.history.replaceState({}, '', newPath + window.location.search + window.location.hash);
    }

    this.translatePage();
    this.updateLanguageSelector();

    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));

    console.log(`✅ Lingua cambiata: ${langCode.toUpperCase()}`);
}

  /**
   * Setup selettore lingua nella navbar
   */
  setupLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    // Imposta lingua corrente nel selettore
    const currentFlag = selector.querySelector('.current-lang-flag');
    const currentCode = selector.querySelector('.current-lang-code');
    
    if (currentFlag && currentCode) {
      currentFlag.textContent = this.getFlagEmoji(this.currentLang);
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

    // Aggiorna bandiera e codice nel toggle
    const currentFlag = selector.querySelector('.current-lang-flag');
    const currentCode = selector.querySelector('.current-lang-code');
    
    if (currentFlag && currentCode) {
        currentFlag.textContent = this.getFlagEmoji(this.currentLang);
        currentCode.textContent = this.currentLang.toUpperCase();
    }

    // Aggiorna stato "active" nelle opzioni dropdown
    selector.querySelectorAll('.lang-option').forEach(option => {
        if (option.dataset.lang === this.currentLang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    console.log(`🔄 Selettore aggiornato: ${this.currentLang.toUpperCase()}`);
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
   * Ottieni emoji bandiera per codice lingua
   */
  getFlagEmoji(langCode) {
    const flags = {
      it: '🇮🇹',
      en: '🇬🇧',
      fr: '🇫🇷',
      de: '🇩🇪',
      es: '🇪🇸'
    };
    return flags[langCode] || '🌍';
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
