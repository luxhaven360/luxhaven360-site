/**
 * ============================================================
 * CONTENT TRANSLATOR — Traduzione contenuti utente
 * community-hub.html | i18n System v1.0
 * ============================================================
 *
 * Gestisce la traduzione dei contenuti generati dagli utenti:
 * - Post, commenti, messaggi, discussioni
 * - Rileva la lingua originale del contenuto
 * - Traduce solo se la lingua utente è diversa dall'originale
 * - Cache lato client per ridurre le richieste API
 * - Testo originale sempre preservato e ripristinabile
 *
 * UTILIZZO HTML:
 *   <div
 *     class="user-content"
 *     data-content-id="post-123"
 *     data-content-lang="it"
 *     data-translatable="true"
 *   >
 *     Il testo originale scritto dall'utente va qui.
 *   </div>
 *
 * UTILIZZO JS:
 *   // Tradurre un elemento
 *   ContentTranslator.translateElement(el)
 *
 *   // Tradurre tutta la pagina
 *   ContentTranslator.translateAll()
 *
 *   // Tradurre un testo direttamente
 *   const result = await ContentTranslator.translateText('Bonjour', 'fr', 'it')
 *
 *   // Configurare il servizio di traduzione
 *   ContentTranslator.setTranslationService(myServiceFn)
 *
 * ============================================================
 */

(function (global) {
  'use strict';

  // ─── CONFIGURAZIONE ──────────────────────────────────────────────────────────

  const CONFIG = {
    // Attributo HTML per marcare contenuti traducibili
    attr:          'data-translatable',
    attrLang:      'data-content-lang',
    attrId:        'data-content-id',

    // Lingue supportate
    supportedLangs: ['it', 'en', 'fr', 'de', 'es'],
    defaultLang:    'it',

    // Cache
    cacheEnabled:   true,
    cachePrefix:    'ct_cache_',
    cacheMaxAge:    24 * 60 * 60 * 1000,  // 24 ore in ms
    cacheMaxSize:   500,                   // max voci in cache

    // UI
    showTranslateBtn:    true,
    showOriginalBtn:     true,
    translateBtnClass:   'ct-translate-btn',
    originalBtnClass:    'ct-original-btn',
    translatingClass:    'ct-translating',
    translatedClass:     'ct-translated',
    labelAttr:           'data-i18n',

    // Rate limiting (evita troppe richieste consecutive)
    requestDelay:   200,  // ms tra richieste
    maxConcurrent:  3,    // richieste parallele max

    debugMode: false,
  };

  // ─── STATO ───────────────────────────────────────────────────────────────────

  const state = {
    cache:            {},   // { cacheKey: { text, timestamp } }
    pendingRequests:  new Map(),  // deduplicazione richieste attive
    activeRequests:   0,
    queue:            [],
    processingQueue:  false,
    translationService: null,  // funzione di traduzione personalizzabile
  };

  // ─── UTILITY ─────────────────────────────────────────────────────────────────

  function log(...args)  { if (CONFIG.debugMode) console.log('[ContentTranslator]', ...args); }
  function warn(...args) { console.warn('[ContentTranslator]', ...args); }

  function getCacheKey(text, fromLang, toLang) {
    // Chiave compatta: hash semplice del testo + lingue
    const hash = simpleHash(text);
    return `${CONFIG.cachePrefix}${fromLang}_${toLang}_${hash}`;
  }

  function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < Math.min(str.length, 200); i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  }

  // ─── CACHE ───────────────────────────────────────────────────────────────────

  function cacheGet(key) {
    // Memoria
    if (state.cache[key]) {
      const { text, timestamp } = state.cache[key];
      if (Date.now() - timestamp < CONFIG.cacheMaxAge) {
        return text;
      }
      delete state.cache[key];
    }
    // localStorage
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CONFIG.cacheMaxAge) {
          state.cache[key] = parsed; // warm in-memory
          return parsed.text;
        }
        localStorage.removeItem(key);
      }
    } catch (e) { /* silenzio */ }
    return null;
  }

  function cacheSet(key, text) {
    if (!CONFIG.cacheEnabled) return;
    const entry = { text, timestamp: Date.now() };
    state.cache[key] = entry;
    try {
      // Pulizia cache se troppo grande
      const keys = Object.keys(localStorage).filter(k => k.startsWith(CONFIG.cachePrefix));
      if (keys.length >= CONFIG.cacheMaxSize) {
        // Rimuove le voci più vecchie (10%)
        const toRemove = Math.ceil(CONFIG.cacheMaxSize * 0.1);
        keys.slice(0, toRemove).forEach(k => localStorage.removeItem(k));
      }
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) { /* localStorage pieno o non disponibile */ }
  }

  // ─── RILEVAMENTO LINGUA ──────────────────────────────────────────────────────

  /**
   * Rileva la lingua di un testo usando euristiche semplici.
   * Per produzione si consiglia un servizio dedicato (es: langdetect API).
   *
   * @param {string} text
   * @returns {string} codice lingua (it|en|fr|de|es) o 'unknown'
   */
  function detectLanguage(text) {
    if (!text || text.trim().length < 3) return CONFIG.defaultLang;

    const sample = text.toLowerCase().slice(0, 500);

    // Pattern lessicali caratteristici per ogni lingua
    const patterns = {
      it: /\b(il|la|lo|gli|le|un|una|del|della|degli|delle|che|non|per|con|sono|è|siamo|questo|questa|questi|queste|anche|come|quando|dove|perché|però|quindi|però|avere|essere|fare|dire|andare|venire)\b/g,
      en: /\b(the|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|shall|can|need|dare|this|that|these|those|and|but|or|nor|for|yet|so|with|from|into|during|including|until|against|among|throughout|despite|towards|upon|concerning)\b/g,
      fr: /\b(le|la|les|un|une|des|du|de|au|aux|est|sont|être|avoir|que|qui|dans|sur|avec|pour|par|mais|ou|et|donc|or|ni|car|ce|cette|ces|ils|elles|nous|vous|je|tu|il|elle|très|aussi|plus|bien|même)\b/g,
      de: /\b(der|die|das|ein|eine|und|ist|sind|war|waren|haben|hat|mit|von|zu|bei|nach|aus|an|auf|für|durch|über|unter|vor|hinter|neben|zwischen|ich|du|er|sie|es|wir|ihr|sie|nicht|auch|noch|schon|sehr|immer|wenn|weil|aber|oder|jedoch)\b/g,
      es: /\b(el|la|los|las|un|una|unos|unas|del|de|al|es|son|ser|estar|tener|con|por|para|en|sobre|entre|sin|hasta|desde|durante|mediante|según|contra|hacia|ante|bajo|cabe|tras|que|quien|cuyo|donde|cuando|como|aunque|pero|sino|porque|pues|ya|también)\b/g,
    };

    const scores = {};
    let maxScore = 0;
    let detected = CONFIG.defaultLang;

    Object.entries(patterns).forEach(([lang, pattern]) => {
      const matches = sample.match(pattern) || [];
      const score = matches.length / (sample.split(/\s+/).length || 1);
      scores[lang] = score;
      if (score > maxScore) {
        maxScore = score;
        detected = lang;
      }
    });

    log('Lingua rilevata:', detected, '| Scores:', scores);
    return maxScore > 0.05 ? detected : CONFIG.defaultLang;
  }

  // ─── SERVIZIO DI TRADUZIONE ──────────────────────────────────────────────────

  /**
   * Imposta una funzione personalizzata per la traduzione.
   * La funzione deve accettare (text, fromLang, toLang) e restituire una Promise<string>.
   *
   * @param {function} serviceFn
   *
   * ESEMPIO con MyMemory (gratuito, nessuna API key):
   *   ContentTranslator.setTranslationService(async (text, from, to) => {
   *     const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
   *     const res = await fetch(url);
   *     const data = await res.json();
   *     return data.responseData.translatedText;
   *   });
   *
   * ESEMPIO con LibreTranslate (self-hosted):
   *   ContentTranslator.setTranslationService(async (text, from, to) => {
   *     const res = await fetch('https://tuo-server/translate', {
   *       method: 'POST',
   *       headers: { 'Content-Type': 'application/json' },
   *       body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
   *     });
   *     const data = await res.json();
   *     return data.translatedText;
   *   });
   *
   * ESEMPIO con DeepL:
   *   ContentTranslator.setTranslationService(async (text, from, to) => {
   *     const res = await fetch('https://api-free.deepl.com/v2/translate', {
   *       method: 'POST',
   *       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
   *       body: new URLSearchParams({ auth_key: 'TUA_CHIAVE', text, source_lang: from.toUpperCase(), target_lang: to.toUpperCase() })
   *     });
   *     const data = await res.json();
   *     return data.translations[0].text;
   *   });
   */
  function setTranslationService(serviceFn) {
    if (typeof serviceFn !== 'function') {
      warn('setTranslationService richiede una funzione');
      return;
    }
    state.translationService = serviceFn;
    log('Servizio di traduzione configurato');
  }

  /**
   * Traduzione di fallback (simulata) — sostituire con un servizio reale.
   * Restituisce il testo originale con un avviso.
   */
  async function defaultTranslationService(text, fromLang, toLang) {
    warn(`Nessun servizio di traduzione configurato. Configura uno con ContentTranslator.setTranslationService().`);
    // In sviluppo: restituisce il testo originale con prefisso
    if (CONFIG.debugMode) {
      return `[${toLang.toUpperCase()}] ${text}`;
    }
    throw new Error('translation_service_not_configured');
  }

  /**
   * Traduce un testo dalla lingua sorgente alla lingua destinazione.
   * Usa la cache quando possibile.
   *
   * @param {string} text     - Testo da tradurre
   * @param {string} fromLang - Lingua originale (es: 'it')
   * @param {string} toLang   - Lingua destinazione (es: 'en')
   * @returns {Promise<string>}
   */
  async function translateText(text, fromLang, toLang) {
    if (!text || !text.trim()) return text;
    if (fromLang === toLang) return text;

    const cacheKey = getCacheKey(text, fromLang, toLang);

    // Cache hit
    const cached = cacheGet(cacheKey);
    if (cached !== null) {
      log('Cache HIT:', cacheKey);
      return cached;
    }

    // Deduplicazione: stessa richiesta già in volo
    if (state.pendingRequests.has(cacheKey)) {
      log('Richiesta già in volo, in attesa:', cacheKey);
      return state.pendingRequests.get(cacheKey);
    }

    const serviceFn = state.translationService || defaultTranslationService;
    const promise = serviceFn(text, fromLang, toLang)
      .then(translated => {
        cacheSet(cacheKey, translated);
        state.pendingRequests.delete(cacheKey);
        return translated;
      })
      .catch(err => {
        state.pendingRequests.delete(cacheKey);
        warn('Errore traduzione:', err);
        throw err;
      });

    state.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  // ─── TRADUZIONE ELEMENTI DOM ─────────────────────────────────────────────────

  /**
   * Salva il testo originale in un attributo data per poterlo ripristinare.
   */
  function saveOriginal(el) {
    if (!el.hasAttribute('data-original-text')) {
      el.setAttribute('data-original-text', el.textContent || el.innerHTML);
    }
    if (!el.hasAttribute('data-original-lang')) {
      const lang = el.getAttribute(CONFIG.attrLang) || detectLanguage(el.textContent || '');
      el.setAttribute('data-original-lang', lang);
    }
  }

  /**
   * Aggiunge i pulsanti Traduci / Originale sotto il contenuto.
   */
  function addTranslationButtons(el, userLang, contentLang) {
    if (!CONFIG.showTranslateBtn) return;

    // Evita duplicati
    const existing = el.parentElement?.querySelector(`.${CONFIG.translateBtnClass}`);
    if (existing) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'ct-actions';
    wrapper.style.cssText = 'font-size:0.8em; margin-top:4px; opacity:0.7;';

    const translateBtn = document.createElement('button');
    translateBtn.className = CONFIG.translateBtnClass;
    translateBtn.setAttribute(CONFIG.labelAttr, 'post.translate');
    translateBtn.textContent = global.I18n?.t('post.translate') || 'Traduci';
    translateBtn.style.cssText = 'background:none; border:none; cursor:pointer; color:inherit; padding:2px 6px; text-decoration:underline;';

    const originalBtn = document.createElement('button');
    originalBtn.className = CONFIG.originalBtnClass;
    originalBtn.setAttribute(CONFIG.labelAttr, 'post.show_original');
    originalBtn.textContent = global.I18n?.t('post.show_original') || 'Originale';
    originalBtn.style.cssText = 'background:none; border:none; cursor:pointer; color:inherit; padding:2px 6px; text-decoration:underline; display:none;';

    translateBtn.addEventListener('click', async () => {
      await translateElementContent(el, userLang);
      translateBtn.style.display = 'none';
      originalBtn.style.display = '';
    });

    originalBtn.addEventListener('click', () => {
      restoreOriginal(el);
      originalBtn.style.display = 'none';
      translateBtn.style.display = '';
    });

    wrapper.appendChild(translateBtn);
    if (CONFIG.showOriginalBtn) wrapper.appendChild(originalBtn);

    el.insertAdjacentElement('afterend', wrapper);
  }

  /**
   * Traduce il contenuto testuale di un elemento.
   */
  async function translateElementContent(el, toLang) {
    saveOriginal(el);

    const fromLang    = el.getAttribute('data-original-lang') || CONFIG.defaultLang;
    const originalText = el.getAttribute('data-original-text') || el.textContent;

    if (!originalText?.trim() || fromLang === toLang) return;

    // Stato: traduzione in corso
    el.classList.add(CONFIG.translatingClass);
    const statusText = global.I18n?.t('status.translating') || 'Traduzione in corso...';
    el.setAttribute('data-translating', statusText);

    try {
      const translated = await translateText(originalText, fromLang, toLang);

      el.textContent = translated;
      el.classList.remove(CONFIG.translatingClass);
      el.classList.add(CONFIG.translatedClass);
      el.setAttribute('data-translated-to', toLang);

      // Aggiunge indicatore lingua
      const fromLabel = getLangLabel(fromLang);
      el.setAttribute('title', global.I18n?.t('post.translated_from', { lang: fromLabel }) || `Tradotto da ${fromLabel}`);

      log(`Tradotto [${fromLang}→${toLang}]:`, originalText.slice(0, 50));
    } catch (err) {
      el.classList.remove(CONFIG.translatingClass);
      warn('Traduzione fallita per elemento:', el, err);
    }
  }

  /**
   * Ripristina il testo originale di un elemento.
   */
  function restoreOriginal(el) {
    const original = el.getAttribute('data-original-text');
    if (original !== null) {
      el.textContent = original;
      el.classList.remove(CONFIG.translatedClass);
      el.removeAttribute('data-translated-to');
      el.removeAttribute('title');
      log('Originale ripristinato');
    }
  }

  /**
   * Processa un singolo elemento traducibile della pagina.
   * Aggiunge il pulsante Traduci o traduce automaticamente.
   *
   * @param {Element} el
   * @param {object}  [opts]
   * @param {boolean} [opts.auto=false]   - Traduce automaticamente senza clic
   * @param {string}  [opts.userLang]     - Lingua utente (default: lingua corrente)
   */
  async function processElement(el, opts = {}) {
    const userLang    = opts.userLang || global.I18n?.getCurrentLanguage() || CONFIG.defaultLang;
    const contentLang = el.getAttribute(CONFIG.attrLang) || detectLanguage(el.textContent || '');
    const auto        = opts.auto ?? getAutoTranslateSetting();

    // Nessuna traduzione necessaria
    if (contentLang === userLang) return;

    // Salva il testo originale
    saveOriginal(el);
    if (!el.getAttribute(CONFIG.attrLang)) {
      el.setAttribute(CONFIG.attrLang, contentLang);
    }

    if (auto) {
      await translateElementContent(el, userLang);
    } else {
      addTranslationButtons(el, userLang, contentLang);
    }
  }

  /**
   * Traduce tutti gli elementi traducibili nella pagina.
   * @param {object} [opts] - opzioni passate a processElement
   */
  async function translateAll(opts = {}) {
    const elements = document.querySelectorAll(`[${CONFIG.attr}="true"]`);
    log(`Trovati ${elements.length} elementi traducibili`);

    const userLang = opts.userLang || global.I18n?.getCurrentLanguage() || CONFIG.defaultLang;

    // Processa in batch per non bloccare il thread
    const batch = Array.from(elements);
    for (let i = 0; i < batch.length; i++) {
      await processElement(batch[i], { ...opts, userLang });
      // Piccola pausa ogni 10 elementi per non bloccare il rendering
      if (i % 10 === 9) await sleep(CONFIG.requestDelay);
    }
  }

  /**
   * Aggiorna la lingua utente e ritraduce tutti i contenuti già tradotti.
   * Da chiamare quando l'utente cambia lingua.
   *
   * @param {string} newLang
   */
  async function onUserLanguageChange(newLang) {
    // Ripristina tutti i contenuti tradotti
    document.querySelectorAll(`[${CONFIG.attr}="true"]`).forEach(el => {
      restoreOriginal(el);
      // Rimuovi vecchi pulsanti
      const btn = el.parentElement?.querySelector(`.${CONFIG.translateBtnClass}`);
      if (btn?.parentElement) btn.parentElement.remove();
    });

    // Riprocessa
    await translateAll({ userLang: newLang, auto: getAutoTranslateSetting() });
  }

  // ─── IMPOSTAZIONE AUTO-TRADUZIONE ─────────────────────────────────────────────

  function getAutoTranslateSetting() {
    try {
      // Per gli utenti normali restituisce sempre false — solo il team mode può abilitarla.
      // Il flag _teamModeActive è gestito da language-selector.js (in-memory, si azzera al reload).
      if (!window._lsTeamModeActive) return false;
      return localStorage.getItem(global.I18n?.config?.autoTranslateKey || 'community_hub_auto_translate') === 'true';
    } catch (e) { return false; }
  }

  function setAutoTranslate(enabled) {
    // Modifica consentita solo se il team mode è attivo (sequenza TESTTRAD)
    try {
      if (!window._lsTeamModeActive) {
        warn('setAutoTranslate: operazione non consentita — team mode non attivo.');
        return;
      }
      localStorage.setItem(global.I18n?.config?.autoTranslateKey || 'community_hub_auto_translate', String(enabled));
    } catch (e) { /* silenzio */ }
  }

  // ─── HELPER ──────────────────────────────────────────────────────────────────

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getLangLabel(code) {
    const labels = { it:'Italiano', en:'English', fr:'Français', de:'Deutsch', es:'Español' };
    return labels[code] || code.toUpperCase();
  }

  /**
   * Crea un elemento HTML pre-configurato per contenuto traducibile.
   * Utile per contenuti generati dinamicamente da JS.
   *
   * @param {string} text       - Testo del contenuto
   * @param {string} lang       - Lingua del contenuto
   * @param {string} [id]       - ID univoco (opzionale)
   * @param {string} [tag='p']  - Tag HTML
   * @returns {HTMLElement}
   */
  function createTranslatableElement(text, lang, id, tag = 'p') {
    const el = document.createElement(tag);
    el.textContent = text;
    el.setAttribute(CONFIG.attr, 'true');
    el.setAttribute(CONFIG.attrLang, lang);
    if (id) el.setAttribute(CONFIG.attrId, id);
    return el;
  }

  /**
   * Processa un elemento appena inserito nel DOM (da chiamare in MutationObserver
   * o dopo aver iniettato HTML dinamico).
   *
   * @param {Element} container - Elemento radice del nuovo contenuto
   */
  async function processNewContent(container) {
    const elements = container.querySelectorAll(`[${CONFIG.attr}="true"]`);
    if (container.hasAttribute?.(CONFIG.attr)) {
      await processElement(container);
    }
    for (const el of Array.from(elements)) {
      await processElement(el);
    }
  }

  // ─── API PUBBLICA ─────────────────────────────────────────────────────────────

  const ContentTranslator = {
    // Traduzione
    translateText,
    translateElement:         translateElementContent,
    translateAll,
    processElement,
    processNewContent,
    restoreOriginal,

    // Configurazione
    setTranslationService,
    setAutoTranslate,
    getAutoTranslateSetting,
    config: CONFIG,
    setDebug: (v) => { CONFIG.debugMode = v; },

    // Rilevamento
    detectLanguage,

    // Utilità
    createTranslatableElement,
    saveOriginal,

    // Hook lingua
    onUserLanguageChange,

    // Cache
    clearCache: () => {
      state.cache = {};
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(CONFIG.cachePrefix))
          .forEach(k => localStorage.removeItem(k));
      } catch (e) { /* silenzio */ }
      log('Cache svuotata');
    },
  };

  global.ContentTranslator = ContentTranslator;

}(window));
