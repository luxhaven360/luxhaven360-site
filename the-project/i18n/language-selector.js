/**
 * ============================================================
 * LANGUAGE SELECTOR — Componente UI selezione lingua
 * community-hub.html | i18n System v1.1
 * ============================================================
 *
 * Inietta automaticamente un selettore lingua nella pagina.
 * Usa flag-icons (CDN) per bandiere vere e proprie su tutti i browser.
 *
 * ============================================================
 */

(function (global) {
  'use strict';

  // ─── TEAM MODE (combinazione segreta TESTTRAD) ───────────────────────────────
  // L'auto-traduzione è disabilitata per tutti gli utenti per default.
  // Il team interno può sbloccarla temporaneamente digitando la sequenza
  // "TESTTRAD" in qualsiasi momento sulla pagina.
  //
  // Il flag è volutamente in-memory (non sessionStorage/localStorage):
  // si azzera ad ogni ricaricamento della pagina, richiedendo di digitare
  // TESTTRAD nuovamente. Questo evita che il pulsante resti abilitato
  // per errore in sessioni successive.

  const TEAM_SECRET = 'TESTTRAD';
  let   _teamModeActive = false;  // in-memory: si azzera ad ogni reload

  function isTeamModeActive() {
    return _teamModeActive;
  }

  function enableTeamMode() {
    _teamModeActive = true;
    window._lsTeamModeActive = true; // esposto per content-translator.js
  }

  // Ascoltatore globale per la sequenza segreta TESTTRAD
  // (ignora eventi su <input>, <textarea>, <select> per non interferire con la digitazione)
  ;(function initTeamModeListener() {
    let buffer = '';
    document.addEventListener('keydown', function (e) {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      const isEditable = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) ||
                         (e.target && e.target.isContentEditable);
      if (isEditable) { buffer = ''; return; }

      buffer += e.key.toUpperCase();
      // Mantieni solo gli ultimi N caratteri pari alla lunghezza del segreto
      if (buffer.length > TEAM_SECRET.length) {
        buffer = buffer.slice(buffer.length - TEAM_SECRET.length);
      }
      if (buffer === TEAM_SECRET) {
        buffer = '';
        if (!isTeamModeActive()) {
          enableTeamMode();
          // Aggiorna tutti i toggle presenti nella pagina
          document.querySelectorAll('.ls-toggle-auto input[type="checkbox"]').forEach(function (inp) {
            inp.disabled = false;
            const row    = inp.closest('.ls-auto-translate');
            if (row) row.classList.remove('ls-auto-disabled');
            const lbl    = inp.closest('.ls-toggle');
            if (lbl) { lbl.style.pointerEvents = ''; lbl.style.cursor = ''; }
            const labelWrap = row && row.querySelector('.ls-auto-translate-label');
            if (labelWrap) { labelWrap.style.pointerEvents = ''; labelWrap.style.cursor = ''; }
          });
          console.info('[LanguageSelector] Team mode attivato — auto-traduzione sbloccata.');
        }
      }
    });
  }());

  const LANGUAGES = [
    { code: 'it', label: 'Italiano',  flagCode: 'it' },
    { code: 'en', label: 'English',   flagCode: 'gb' },
    { code: 'fr', label: 'Français',  flagCode: 'fr' },
    { code: 'de', label: 'Deutsch',   flagCode: 'de' },
    { code: 'es', label: 'Español',   flagCode: 'es' },
  ];

  // ─── CARICA FLAG-ICONS CSS ───────────────────────────────────────────────────

  function loadFlagIcons() {
    if (document.getElementById('ls-flag-icons')) return;
    const link = document.createElement('link');
    link.id   = 'ls-flag-icons';
    link.rel  = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/css/flag-icons.min.css';
    document.head.appendChild(link);
  }

  // ─── STILI PREMIUM LUXURY ────────────────────────────────────────────────────

  const CSS = `
    /* ── Language Selector — Premium Luxury Design ── */
    .ls-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      font-family: var(--ff-ui, 'Raleway', sans-serif);
      z-index: 1000;
    }
    .ls-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 11px 6px 9px;
      background: rgba(212,175,55,0.05);
      border: 1px solid rgba(212,175,55,0.22);
      border-radius: 8px;
      cursor: pointer;
      font-family: var(--ff-ui, 'Raleway', sans-serif);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(212,175,55,0.78);
      transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
      white-space: nowrap;
    }
    .ls-btn:hover {
      background: rgba(212,175,55,0.10);
      border-color: rgba(212,175,55,0.48);
      color: #D4AF37;
      box-shadow: 0 2px 10px rgba(212,175,55,0.14);
    }
    .ls-btn:focus-visible {
      outline: none;
      border-color: rgba(212,175,55,0.65);
      box-shadow: 0 0 0 3px rgba(212,175,55,0.12);
    }

    /* ── Bandiera (flag-icons) ── */
    .ls-flag {
      display: inline-block;
      width: 18px !important;
      height: 13px !important;
      border-radius: 2px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      background-size: cover !important;
      background-position: center !important;
    }

    .ls-label { font-weight: 600; }

    .ls-chevron {
      margin-left: 1px;
      transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
      opacity: 0.5;
      flex-shrink: 0;
    }
    .ls-wrapper.open .ls-chevron { transform: rotate(180deg); }

    /* ── Dropdown ── */
    .ls-dropdown {
      display: none;
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 190px;
      background: var(--dark3, #141414);
      border: 1px solid rgba(212,175,55,0.18);
      border-radius: 10px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.72), 0 0 0 1px rgba(212,175,55,0.05);
      overflow: hidden;
      z-index: 1001;
      animation: ls-fade-in 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes ls-fade-in {
      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ls-wrapper.open .ls-dropdown { display: block; }

    .ls-dropdown-header {
      padding: 9px 14px 7px;
      font-family: var(--ff-ui, 'Raleway', sans-serif);
      font-size: 0.58rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(212,175,55,0.45);
      border-bottom: 1px solid rgba(212,175,55,0.08);
      margin-bottom: 2px;
    }

    /* ── Opzioni lingua ── */
    .ls-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 14px;
      cursor: pointer;
      font-family: var(--ff-ui, 'Raleway', sans-serif);
      font-size: 0.78rem;
      font-weight: 400;
      color: rgba(245,245,245,0.62);
      transition: background 0.12s, color 0.12s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    .ls-option:hover {
      background: rgba(212,175,55,0.07);
      color: rgba(245,245,245,0.92);
    }
    .ls-option.active {
      background: rgba(212,175,55,0.10);
      color: #D4AF37;
      font-weight: 600;
    }
    .ls-option .ls-check {
      margin-left: auto;
      color: #D4AF37;
      opacity: 0;
      font-size: 0.72rem;
      transition: opacity 0.15s;
    }
    .ls-option.active .ls-check { opacity: 1; }

    /* ── Divider ── */
    .ls-divider {
      border: none;
      border-top: 1px solid rgba(212,175,55,0.09);
      margin: 3px 0;
    }

    /* ── Toggle auto-translate ── */
    .ls-auto-translate {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 14px 11px;
      gap: 12px;
    }
    .ls-auto-translate-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--ff-ui, 'Raleway', sans-serif);
      font-size: 0.72rem;
      font-weight: 400;
      color: rgba(245,245,245,0.48);
      cursor: pointer;
      flex: 1;
    }
    .ls-auto-translate-icon {
      width: 11px; height: 11px;
      opacity: 0.5;
      flex-shrink: 0;
    }

    /* Toggle switch */
    .ls-toggle {
      position: relative;
      width: 34px;
      height: 19px;
      flex-shrink: 0;
    }
    .ls-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .ls-toggle-slider {
      position: absolute;
      inset: 0;
      background: rgba(245,245,245,0.1);
      border: 1px solid rgba(245,245,245,0.1);
      border-radius: 19px;
      cursor: pointer;
      transition: background 0.22s, border-color 0.22s;
    }
    .ls-toggle-slider::before {
      content: '';
      position: absolute;
      width: 13px; height: 13px;
      left: 2px; top: 2px;
      background: rgba(245,245,245,0.45);
      border-radius: 50%;
      transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), background 0.22s;
    }
    .ls-toggle input:checked + .ls-toggle-slider {
      background: rgba(212,175,55,0.22);
      border-color: rgba(212,175,55,0.5);
    }
    .ls-toggle input:checked + .ls-toggle-slider::before {
      transform: translateX(15px);
      background: #D4AF37;
    }

    /* ── Auto-translate disabilitata (utenti normali) ── */
    .ls-auto-disabled {
      opacity: 0.38;
      pointer-events: none;
      user-select: none;
    }
    .ls-auto-disabled .ls-toggle-slider {
      cursor: not-allowed !important;
    }
    .ls-auto-disabled .ls-auto-translate-label {
      cursor: not-allowed !important;
    }

    /* ── Floating widget ── */
    .ls-floating {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
    }
    .ls-floating .ls-dropdown {
      bottom: calc(100% + 8px);
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

  // ─── CREA ELEMENTO BANDIERA ──────────────────────────────────────────────────

  function createFlagEl(lang) {
    const span = document.createElement('span');
    span.className = `fi fi-${lang.flagCode} ls-flag`;
    span.setAttribute('aria-hidden', 'true');
    return span;
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

    const flagEl    = createFlagEl(currentEntry);
    const labelSpan = document.createElement('span');
    labelSpan.className = 'ls-label';
    labelSpan.textContent = currentEntry.code.toUpperCase();

    // Chevron SVG
    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'ls-chevron');
    chevron.setAttribute('width', '9');
    chevron.setAttribute('height', '9');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '2.5');
    chevron.setAttribute('stroke-linecap', 'round');
    chevron.setAttribute('stroke-linejoin', 'round');
    chevron.innerHTML = '<polyline points="6 9 12 15 18 9"/>';

    btn.appendChild(flagEl);
    btn.appendChild(labelSpan);
    btn.appendChild(chevron);

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'ls-dropdown';
    dropdown.setAttribute('role', 'listbox');

    // Header dropdown
    const dropHeader = document.createElement('div');
    dropHeader.className = 'ls-dropdown-header';
    dropHeader.textContent = I18n?.t('lang.select') || 'Seleziona lingua';
    dropdown.appendChild(dropHeader);

    // Opzioni lingua
    LANGUAGES.forEach(lang => {
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'ls-option' + (lang.code === currentLang ? ' active' : '');
      opt.setAttribute('role', 'option');
      opt.setAttribute('data-lang', lang.code);

      const optFlag  = createFlagEl(lang);
      const optLabel = document.createElement('span');
      optLabel.textContent = lang.label;

      const checkEl = document.createElement('span');
      checkEl.className = 'ls-check';
      checkEl.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

      opt.appendChild(optFlag);
      opt.appendChild(optLabel);
      opt.appendChild(checkEl);

      opt.addEventListener('click', async () => {
        I18n?.setLanguage(lang.code);

        // Aggiorna bandiera nel bottone trigger
        const existingFlag = btn.querySelector('.ls-flag');
        const newFlag = createFlagEl(lang);
        if (existingFlag) btn.replaceChild(newFlag, existingFlag);
        else btn.insertBefore(newFlag, btn.firstChild);

        labelSpan.textContent = lang.code.toUpperCase();
        dropdown.querySelectorAll('.ls-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        closeDropdown();

        if (CT) await CT.onUserLanguageChange(lang.code);
      });

      dropdown.appendChild(opt);
    });

    // Toggle auto-translate
    if (options.showAutoTranslate !== false && CT) {
      const divider = document.createElement('hr');
      divider.className = 'ls-divider';
      dropdown.appendChild(divider);

      const autoRow = document.createElement('div');
      autoRow.className = 'ls-auto-translate';
      autoRow.addEventListener('click', e => e.stopPropagation());

      const autoLabelWrap = document.createElement('label');
      autoLabelWrap.className = 'ls-auto-translate-label';

      const autoIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      autoIcon.setAttribute('class', 'ls-auto-translate-icon');
      autoIcon.setAttribute('viewBox', '0 0 24 24');
      autoIcon.setAttribute('fill', 'none');
      autoIcon.setAttribute('stroke', 'currentColor');
      autoIcon.setAttribute('stroke-width', '2');
      autoIcon.setAttribute('stroke-linecap', 'round');
      autoIcon.setAttribute('stroke-linejoin', 'round');
      autoIcon.innerHTML = '<path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>';

      const autoText = document.createElement('span');
      autoText.setAttribute('data-i18n', 'lang.translate_content');
      autoText.textContent = I18n?.t('lang.translate_content') || 'Traduci automaticamente';

      autoLabelWrap.appendChild(autoIcon);
      autoLabelWrap.appendChild(autoText);

      const toggle = document.createElement('label');
      toggle.className = 'ls-toggle';
      const toggleId = 'ls-toggle-' + Math.random().toString(36).slice(2);

      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.id = toggleId;
      toggleInput.checked = CT.getAutoTranslateSetting?.() || false;

      // ── Disabilita per tutti gli utenti; si sblocca solo con TESTTRAD ──
      const teamActive = isTeamModeActive();
      if (!teamActive) {
        toggleInput.disabled = true;
        // Blocca sia il wrapper row che il label e lo slider direttamente:
        // pointer-events sul solo padre non basta, il <label> nativo del browser
        // può comunque attivare il checkbox associato via attributo "for".
        autoRow.classList.add('ls-auto-disabled');
        toggle.style.pointerEvents   = 'none';
        toggle.style.cursor          = 'not-allowed';
        autoLabelWrap.style.pointerEvents = 'none';
        autoLabelWrap.style.cursor        = 'not-allowed';
      }
      // Aggiunge classe di riferimento per il listener TESTTRAD
      toggleInput.classList.add('ls-toggle-auto');

      const slider = document.createElement('span');
      slider.className = 'ls-toggle-slider';

      toggle.appendChild(toggleInput);
      toggle.appendChild(slider);
      autoLabelWrap.setAttribute('for', toggleId);

      toggleInput.addEventListener('change', () => {
        CT.setAutoTranslate?.(toggleInput.checked);
      });

      autoRow.appendChild(autoLabelWrap);
      autoRow.appendChild(toggle);
      dropdown.appendChild(autoRow);
    }

    wrapper.appendChild(btn);
    wrapper.appendChild(dropdown);

    // ─── APERTURA/CHIUSURA ────────────────────────────────────────────────────

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

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) closeDropdown();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });

    I18n?.onLanguageChange?.((lang) => {
      const entry = LANGUAGES.find(l => l.code === lang);
      if (entry) {
        const existingFlag = btn.querySelector('.ls-flag');
        const newFlag = createFlagEl(entry);
        if (existingFlag) btn.replaceChild(newFlag, existingFlag);
        labelSpan.textContent = entry.code.toUpperCase();
        dropdown.querySelectorAll('.ls-option').forEach(o => {
          o.classList.toggle('active', o.getAttribute('data-lang') === lang);
        });
      }
    });

    return wrapper;
  }

  // ─── MOUNT ───────────────────────────────────────────────────────────────────

  function mount(target, options = {}) {
    loadFlagIcons();
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

  function mountFloating(options = {}) {
    loadFlagIcons();
    injectStyles();
    if (document.getElementById('ls-floating')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'ls-floating';
    wrapper.className = 'ls-floating';
    const selector = createSelector(options);
    wrapper.appendChild(selector);
    document.body.appendChild(wrapper);
    return wrapper;
  }

  function autoMount() {
    document.querySelectorAll('[data-lang-selector]').forEach(el => mount(el));
  }

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
