/**
 * ============================================================
 * I18N INIT — Punto di ingresso unico
 * community-hub.html | i18n System v1.0
 * ============================================================
 *
 * QUESTO È L'UNICO FILE DA INCLUDERE NELLA PAGINA HTML.
 * Carica automaticamente tutti i moduli nella sequenza corretta.
 *
 * INTEGRAZIONE IN community-hub.html:
 * Aggiungi questi tag prima della chiusura </body>:
 *
 *   <!-- Sistema i18n — aggiungi questi script prima di </body> -->
 *   <script src="i18n/translations/it.js"></script>
 *   <script src="i18n/translations/en.js"></script>
 *   <script src="i18n/translations/fr.js"></script>
 *   <script src="i18n/translations/de.js"></script>
 *   <script src="i18n/translations/es.js"></script>
 *   <script src="i18n/i18n-core.js"></script>
 *   <script src="i18n/content-translator.js"></script>
 *   <script src="i18n/language-selector.js"></script>
 *   <script src="i18n/i18n-init.js"></script>
 *
 * OPPURE (caricamento dinamico, solo questo file):
 *   <script src="i18n/i18n-init.js" data-i18n-base="i18n/"></script>
 *
 * ============================================================
 */

(function (global) {
  'use strict';

  // ─── CONFIGURAZIONE INIZIALIZZAZIONE ─────────────────────────────────────────

  const INIT_CONFIG = {
    // Percorso base dei file i18n
    // Viene letto da data-i18n-base sull'elemento script corrente, o usa il default
    basePath: (function () {
      const scripts = document.getElementsByTagName('script');
      const me = scripts[scripts.length - 1];
      return me.getAttribute('data-i18n-base') || 'i18n/';
    }()),

    // Configura qui il tuo servizio di traduzione
    // Esempi: 'mymemory' | 'libretranslate' | 'deepl' | null
    translationService: null,

    // URL del tuo servizio LibreTranslate (se self-hosted)
    libreTranslateUrl: null,

    // Chiave DeepL (se usi DeepL)
    deeplApiKey: null,

    // Configura se il widget lingua fluttuante deve comparire automaticamente
    // Impostare false se si preferisce montarlo manualmente
    autoFloatingSelector: true,

    // Se true, traduce automaticamente i contenuti utente senza clic
    // (richiede un servizio di traduzione configurato)
    autoTranslateContent: false,

    // Debug
    debug: false,
  };

  // ─── SERVIZI DI TRADUZIONE PREDEFINITI ───────────────────────────────────────

  /**
   * MyMemory — gratuito, nessuna chiave API, limite ~5000 parole/giorno.
   * Adatto per ambienti di sviluppo e piccole community.
   */
  function myMemoryService(text, fromLang, toLang) {
    // Tronca a 500 caratteri per MyMemory
    const truncated = text.slice(0, 500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncated)}&langpair=${fromLang}|${toLang}&de=community@example.com`;
    return fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.responseStatus !== 200) throw new Error(data.responseDetails);
        return data.responseData.translatedText;
      });
  }

  /**
   * LibreTranslate — open source, self-hostable.
   * @param {string} baseUrl - URL del server LibreTranslate
   */
  function libreTranslateService(baseUrl) {
    return function (text, fromLang, toLang) {
      return fetch(`${baseUrl}/translate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ q: text, source: fromLang, target: toLang, format: 'text' }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          return data.translatedText;
        });
    };
  }

  /**
   * DeepL Free API.
   * @param {string} apiKey
   */
  function deeplService(apiKey) {
    const DEEPL_LANG = { it:'IT', en:'EN-GB', fr:'FR', de:'DE', es:'ES' };
    return function (text, fromLang, toLang) {
      const params = new URLSearchParams({
        auth_key:    apiKey,
        text:        text,
        source_lang: DEEPL_LANG[fromLang] || fromLang.toUpperCase(),
        target_lang: DEEPL_LANG[toLang]   || toLang.toUpperCase(),
      });
      return fetch('https://api-free.deepl.com/v2/translate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params,
      })
        .then(res => res.json())
        .then(data => data.translations[0].text);
    };
  }

  // ─── INIZIALIZZAZIONE PRINCIPALE ─────────────────────────────────────────────

  function run() {
    const I18n  = global.I18n;
    const CT    = global.ContentTranslator;
    const LS    = global.LanguageSelector;

    if (!I18n) {
      console.error('[i18n-init] i18n-core.js non trovato. Assicurati di includerlo prima di i18n-init.js');
      return;
    }

    // ── 1. DEBUG ────────────────────────────────────────────────────────────────
    if (INIT_CONFIG.debug) {
      I18n.setDebug(true);
      if (CT) CT.setDebug(true);
    }

    // ── 2. SERVIZIO DI TRADUZIONE ───────────────────────────────────────────────
    if (CT) {
      let service = null;

      if (typeof INIT_CONFIG.translationService === 'function') {
        service = INIT_CONFIG.translationService;
      } else if (INIT_CONFIG.translationService === 'mymemory') {
        service = myMemoryService;
      } else if (INIT_CONFIG.translationService === 'libretranslate' && INIT_CONFIG.libreTranslateUrl) {
        service = libreTranslateService(INIT_CONFIG.libreTranslateUrl);
      } else if (INIT_CONFIG.translationService === 'deepl' && INIT_CONFIG.deeplApiKey) {
        service = deeplService(INIT_CONFIG.deeplApiKey);
      }

      if (service) {
        CT.setTranslationService(service);
      }

      CT.setAutoTranslate(INIT_CONFIG.autoTranslateContent);
    }

    // ── 3. WIDGET SELETTORE LINGUA ──────────────────────────────────────────────
    if (LS) {
      // Auto-monta su elementi dichiarativi [data-lang-selector]
      LS.autoMount();

      // Widget fluttuante automatico (solo se nessun selettore è già in pagina)
      if (INIT_CONFIG.autoFloatingSelector) {
        const hasInlineSelector = document.querySelector('[data-lang-selector]');
        if (!hasInlineSelector) {
          LS.mountFloating();
        }
      }
    }

    // ── 4. HOOK CAMBIO LINGUA → AGGIORNA CONTENUTI ──────────────────────────────
    if (CT) {
      I18n.onLanguageChange(async (newLang) => {
        await CT.onUserLanguageChange(newLang);
      });
    }

    // ── 5. PROCESSA CONTENUTI TRADUCIBILI GIÀ PRESENTI ─────────────────────────
    if (CT && document.readyState !== 'loading') {
      CT.translateAll({ auto: INIT_CONFIG.autoTranslateContent });
    } else if (CT) {
      document.addEventListener('DOMContentLoaded', () => {
        CT.translateAll({ auto: INIT_CONFIG.autoTranslateContent });
      });
    }

    // ── 6. ESPONE CONFIGURAZIONE GLOBALE ────────────────────────────────────────
    global.I18nInit = { config: INIT_CONFIG, myMemoryService, libreTranslateService, deeplService };

    console.info(
      `%c[i18n] Sistema attivo | Lingua: ${I18n.getCurrentLanguage()} | `
      + `Traduzioni: ${I18n.getSupportedLanguages().join(', ')}`,
      'color:#4a9eff; font-weight:bold;'
    );
  }

  // Avvia dopo che il DOM (e gli altri script) sono pronti
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

}(window));
