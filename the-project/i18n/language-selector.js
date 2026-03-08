/**
 * ============================================================
 * LANGUAGE SELECTOR — Componente UI selezione lingua
 * community-hub.html | i18n System v1.0
 * ============================================================
 *
 * Inietta automaticamente un selettore lingua nella pagina.
 *
 * UTILIZZO:
 *   // Opzione A — Inietta il selettore in un contenitore esistente
 *   LanguageSelector.mount('#language-selector-container');
 *
 *   // Opzione B — Crea un widget fluttuante (default)
 *   LanguageSelector.mountFloating();
 *
 *   // Opzione C — HTML dichiarativo
 *   <div id="lang-selector" data-lang-selector="true"></div>
 *   // Il componente si auto-monta su tutti gli elementi con data-lang-selector
 *
 * ============================================================
 */

(function (global) {
  'use strict';

  const LANGUAGES = [
    { code: 'it', label: 'Italiano',  flag: '🇮🇹' },
    { code: 'en', label: 'English',   flag: '🇬🇧' },
    { code: 'fr', label: 'Français',  flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
    { code: 'es', label: 'Español',   flag: '🇪🇸' },
  ];

  // ─── STILI ────────────────────────────────────────────────────────────────────

  const CSS = `
    .ls-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      font-family: inherit;
      z-index: 1000;
    }
    .ls-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      border: 1px solid rgba(128,128,128,0.3);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      color: inherit;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .ls-btn:hover {
      background: rgba(128,128,128,0.1);
      border-color: rgba(128,128,128,0.5);
    }
    .ls-btn:focus-visible {
      outline: 2px solid #4a9eff;
      outline-offset: 2px;
    }
    .ls-flag { font-size: 1.1em; line-height: 1; }
    .ls-label { font-weight: 500; }
    .ls-chevron {
      margin-left: 2px;
      transition: transform 0.2s;
      font-size: 0.75em;
      opacity: 0.6;
    }
    .ls-wrapper.open .ls-chevron { transform: rotate(180deg); }
    .ls-dropdown {
      display: none;
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 170px;
      background: var(--ls-bg, #ffffff);
      border: 1px solid rgba(128,128,128,0.2);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      overflow: hidden;
      z-index: 1001;
      animation: ls-fade-in 0.15s ease;
    }
    @media (prefers-color-scheme: dark) {
      .ls-dropdown { --ls-bg: #1e1e1e; }
    }
    @keyframes ls-fade-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ls-wrapper.open .ls-dropdown { display: block; }
    .ls-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      cursor: pointer;
      font-size: 0.875rem;
      color: inherit;
      transition: background 0.1s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    .ls-option:hover { background: rgba(128,128,128,0.08); }
    .ls-option.active {
      background: rgba(74,158,255,0.1);
      font-weight: 600;
    }
    .ls-option .ls-check {
      margin-left: auto;
      color: #4a9eff;
      opacity: 0;
      font-size: 0.8em;
    }
    .ls-option.active .ls-check { opacity: 1; }
    .ls-divider {
      border: none;
      border-top: 1px solid rgba(128,128,128,0.15);
      margin: 4px 0;
    }
    .ls-auto-translate {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      font-size: 0.8rem;
      opacity: 0.85;
    }
    .ls-toggle {
      position: relative;
      width: 32px;
      height: 18px;
      flex-shrink: 0;
    }
    .ls-toggle input { opacity: 0; width: 0; height: 0; }
    .ls-toggle-slider {
      position: absolute;
      inset: 0;
      background: rgba(128,128,128,0.3);
      border-radius: 18px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .ls-toggle-slider::before {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      left: 2px;
      top: 2px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    .ls-toggle input:checked + .ls-toggle-slider { background: #4a9eff; }
    .ls-toggle input:checked + .ls-toggle-slider::before { transform: translateX(14px); }

    /* Floating widget */
    .ls-floating {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
    }
    .ls-floating .ls-dropdown {
      bottom: calc(100% + 6px);
      top: auto;
      right: 0;
    }
  `;

  // ─── INJECT CSS ──────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('ls-styles')) return;
    const style = document.createElement('style');
    style.id = 'ls-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ─── BUILD COMPONENTE ────────────────────────────────────────────────────────

  function createSelector(options = {}) {
    const I18n = global.I18n;
    const CT   = global.ContentTranslator;

    const currentLang  = I18n?.getCurrentLanguage() || 'it';
    const currentEntry = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'ls-wrapper';
    wrapper.setAttribute('role', 'navigation');
    wrapper.setAttribute('aria-label', I18n?.t('lang.select') || 'Seleziona lingua');

    // Bottone trigger
    const btn = document.createElement('button');
    btn.className = 'ls-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.type = 'button';

    const flagSpan  = document.createElement('span');
    flagSpan.className = 'ls-flag';
    flagSpan.textContent = currentEntry.flag;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'ls-label';
    labelSpan.textContent = currentEntry.code.toUpperCase();

    const chevron = document.createElement('span');
    chevron.className = 'ls-chevron';
    chevron.textContent = '▼';

    btn.appendChild(flagSpan);
    btn.appendChild(labelSpan);
    btn.appendChild(chevron);

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'ls-dropdown';
    dropdown.setAttribute('role', 'listbox');

    // Opzioni lingua
    LANGUAGES.forEach(lang => {
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'ls-option' + (lang.code === currentLang ? ' active' : '');
      opt.setAttribute('role', 'option');
      opt.setAttribute('data-lang', lang.code);

      const flagEl  = document.createElement('span');
      flagEl.textContent = lang.flag;

      const labelEl = document.createElement('span');
      labelEl.textContent = lang.label;

      const checkEl = document.createElement('span');
      checkEl.className = 'ls-check';
      checkEl.textContent = '✓';

      opt.appendChild(flagEl);
      opt.appendChild(labelEl);
      opt.appendChild(checkEl);

      opt.addEventListener('click', async () => {
        // Aggiorna lingua UI
        I18n?.setLanguage(lang.code);

        // Aggiorna UI selettore
        flagSpan.textContent  = lang.flag;
        labelSpan.textContent = lang.code.toUpperCase();
        dropdown.querySelectorAll('.ls-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        // Chiude dropdown
        closeDropdown();

        // Aggiorna contenuti utente
        if (CT) await CT.onUserLanguageChange(lang.code);
      });

      dropdown.appendChild(opt);
    });

    // Separatore e toggle auto-translate
    if (options.showAutoTranslate !== false && CT) {
      const divider = document.createElement('hr');
      divider.className = 'ls-divider';
      dropdown.appendChild(divider);

      const autoRow = document.createElement('label');
      autoRow.className = 'ls-auto-translate';

      const autoText = document.createElement('span');
      autoText.setAttribute('data-i18n', 'lang.translate_content');
      autoText.textContent = I18n?.t('lang.translate_content') || 'Traduci automaticamente';

      const toggle = document.createElement('label');
      toggle.className = 'ls-toggle';

      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.checked = CT.getAutoTranslateSetting?.() || false;

      const slider = document.createElement('span');
      slider.className = 'ls-toggle-slider';

      toggle.appendChild(toggleInput);
      toggle.appendChild(slider);

      toggleInput.addEventListener('change', () => {
        CT.setAutoTranslate?.(toggleInput.checked);
      });

      autoRow.appendChild(autoText);
      autoRow.appendChild(toggle);
      autoRow.addEventListener('click', e => e.stopPropagation());
      dropdown.appendChild(autoRow);
    }

    wrapper.appendChild(btn);
    wrapper.appendChild(dropdown);

    // ─── LOGICA APERTURA/CHIUSURA ─────────────────────────────────────────────

    function openDropdown() {
      wrapper.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      wrapper.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.contains('open') ? closeDropdown() : openDropdown();
    });

    // Chiude cliccando fuori
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) closeDropdown();
    });

    // Chiude con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });

    // Aggiorna quando la lingua cambia (da altra fonte)
    I18n?.onLanguageChange?.((lang) => {
      const entry = LANGUAGES.find(l => l.code === lang);
      if (entry) {
        flagSpan.textContent  = entry.flag;
        labelSpan.textContent = entry.code.toUpperCase();
        dropdown.querySelectorAll('.ls-option').forEach(o => {
          o.classList.toggle('active', o.getAttribute('data-lang') === lang);
        });
      }
    });

    return wrapper;
  }

  // ─── MOUNT ───────────────────────────────────────────────────────────────────

  /**
   * Monta il selettore in un elemento esistente della pagina.
   * @param {string|Element} target - Selettore CSS o elemento DOM
   * @param {object} [options]
   */
  function mount(target, options = {}) {
    injectStyles();
    const container = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!container) {
      console.warn('[LanguageSelector] Container non trovato:', target);
      return null;
    }

    container.innerHTML = '';
    const selector = createSelector(options);
    container.appendChild(selector);
    return selector;
  }

  /**
   * Monta un widget fluttuante nell'angolo in basso a destra.
   * @param {object} [options]
   */
  function mountFloating(options = {}) {
    injectStyles();

    // Evita duplicati
    if (document.getElementById('ls-floating')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'ls-floating';
    wrapper.className = 'ls-floating';

    const selector = createSelector(options);
    wrapper.appendChild(selector);
    document.body.appendChild(wrapper);
    return wrapper;
  }

  /**
   * Auto-monta su tutti gli elementi con [data-lang-selector].
   */
  function autoMount() {
    document.querySelectorAll('[data-lang-selector]').forEach(el => {
      mount(el);
    });
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────────

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoMount);
    } else {
      autoMount();
    }
  }

  init();

  // ─── API PUBBLICA ─────────────────────────────────────────────────────────────

  global.LanguageSelector = {
    mount,
    mountFloating,
    autoMount,
    createSelector,
    languages: LANGUAGES,
  };

}(window));
