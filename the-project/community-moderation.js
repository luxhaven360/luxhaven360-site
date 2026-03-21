/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LUXHAVEN360 — COMMUNITY MODERATION ENGINE  v2.0
 *  community-moderation.js
 *
 *  Architettura modulare, completamente separata da community-hub.html.
 *  Si integra con il sistema esistente tramite window.LH360Mod.
 *
 *  MODULI:
 *    1. ContentListener   — intercetta contenuti in ingresso (hook)
 *    2. TextNormalizer    — normalizzazione testo, anti-evasione
 *    3. TextAnalyzer      — analisi testuale + semantica + fuzzy
 *    4. SpamDetector      — flood, ripetizioni, link sospetti
 *    5. LinkAnalyzer      — URL inspection
 *    6. UserRiskTracker   — user risk score dinamico
 *    7. ContextEvaluator  — ruolo, contesto conversazione
 *    8. ScoringEngine     — punteggio finale 0–100
 *    9. ActionDispatcher  — azioni automatiche in base al punteggio
 *   10. ReviewQueue       — coda revisione manuale + logging
 *   11. LearningAdapter   — adattamento sensibilità nel tempo
 *   12. ModBridge         — ponte con community-hub.html
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     CONSTANTS & STORAGE KEYS
  ───────────────────────────────────────────────────────── */
  const STORAGE_KEY_RISK      = 'lh360_mod_user_risk_v2';
  const STORAGE_KEY_QUEUE     = 'lh360_mod_queue_v2';
  const STORAGE_KEY_DECISIONS = 'lh360_mod_decisions_v2';
  const STORAGE_KEY_LEARNING  = 'lh360_mod_learning_v2';
  const MAX_QUEUE_SIZE        = 500;
  const MAX_DECISIONS_SIZE    = 1000;

  /* ─────────────────────────────────────────────────────────
     1. TEXT NORMALIZER — anti-evasione, normalizzazione
  ───────────────────────────────────────────────────────── */
  const TextNormalizer = {
    // Mappatura leet-speak e simboli sostitutivi
    _leetMap: {
      '0':'o','1':'i','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g',
      '@':'a','$':'s','!':'i','|':'i','+':'t','(':'c',')':'o',
      'ph':'f','ck':'k','qu':'k','x':'cs'
    },

    normalize(text) {
      if (!text) return '';
      let t = String(text).toLowerCase();
      // Rimuove diacritici → normalizza caratteri accentati
      t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // Rimuove spazi tra lettere singole (es. "v i o l e n z a")
      t = t.replace(/\b(\w)\s+(?=(\w\s){1,}\w\b)/g, '$1');
      // Normalizza leet-speak
      t = t.replace(/[013456789@$!|+()]/g, ch => this._leetMap[ch] || ch);
      // Rimuove caratteri speciali ripetuti usati come spaziatura
      t = t.replace(/([^\w\s])\1+/g, '$1');
      // Rimuove underscore, trattini, punti frapposti a lettere (v.i.o.l.e.n.z.a)
      t = t.replace(/([a-z])[_\-\.]+([a-z])/g, '$1$2');
      return t.trim();
    },

    // Versione "stripped" per matching fuzzy: solo alfanumerici
    strip(text) {
      return this.normalize(text).replace(/[^a-z0-9]/g, '');
    }
  };

  /* ─────────────────────────────────────────────────────────
     2. TEXT ANALYZER — blacklist, pattern semantici
  ───────────────────────────────────────────────────────── */
  const TextAnalyzer = {
    // ── A. BLACKLIST parole ──────────────────────────────
    _blacklist: {
      critical: [
        // Minacce fisiche
        /\b(ti (ammazzo|uccido|faccio del male|spacco la faccia|taglio|brucio)|so dove (abiti|vivi)|ti (trovo|vengo a cercare|rovino la vita))\b/i,
        // Hate speech
        /\b(nazi|fascis[mt]|razzis[mt]a|odia[re]? i (neri|ebrei|musulmani|gay)|morte (ai|agli)|eliminare i|inferiori di razza|white power|heil)\b/i,
        // Contenuto illegale
        /\b(compra(re)? (droga|cocaina|eroina|meth|crack|canna|hashish)|spacci(are|atore)|armi in vendita|pistol[ae] (compra|vend)|bom[be] (artigianali|fai da te))\b/i,
        // CSAM hint
        /\b(minori|bambini|under ?1[0-8]).{0,30}(nude?|sex|porn|foto|video)\b/i,
      ],
      high: [
        // Insulti forti
        /\b(vaffanculo|fanculo|va[' ]?fanculo|cazzo|stronzo|bastardo|figlio di (puttana|troia)|coglione|imbecille|idiota|ritardato|scemo di merda)\b/i,
        // Volgare sessuale
        /\b(puttana|troia|baldracca|mignotta|battona|prostituta).{0,10}(sei|fai|vai|sembri)\b/i,
        // Incitamento
        /\b(dovrebbero (morire|sparire|essere eliminati)|andate a (morire|fanculo))\b/i,
      ],
      medium: [
        // Spam promozionale
        /\b(compra ora|acquista subito|offerta (limitata|esclusiva)|guadagna \d+[€$k]|clicca (qui|subito)|promo esclusiva|sconto \d+%|free money|guadagni facili)\b/i,
        // Crypto/scam
        /\b(bitcoin (investimento|pump|dump)|cripto (pump|dump|scam)|nft gratis|airdrop (gratis|gratuito)|manda[re] (soldi|btc|eth) per ricevere)\b/i,
        // Siti adulti/azzardo
        /\b(casino online|scommesse (sportive|online)|sito di incontri|video adulti|xxx|pornhub|onlyfans)\b/i,
        // Insulti moderati
        /\b(sfigato|minus(culolo)?|deficiente|patetico|schifo|fai schifo|sei uno schifo)\b/i,
      ],
      low: [
        // Link non approvati con call-to-action
        /https?:\/\/(?!(?:luxhaven360|localhost))[^\s]{15,}.{0,30}\b(visita|registrati|iscriviti|guarda|scarica|clicca)\b/i,
        // Flood caratteri
        /(.)\1{6,}/,
        // Caps lock eccessivo (>60% maiuscole su testi >10 char)
      ]
    },

    // ── B. PATTERN SEMANTICI — tono/aggressività ────────
    _semanticPatterns: [
      { re: /\b(ti (pentirai|odio|faccio (vedere|capire))|vedrai (cosa ti succede|cosa faccio))\b/i, score: 45, label: 'Minaccia velata' },
      { re: /\b(nessuno ti (vuole|crede|capisce)|(sei|siete) (inutili?|incompetenti?|da eliminare))\b/i, score: 35, label: 'Tossicità' },
      { re: /\b(riferimento|riferisco|denuncio|vi (porto|porto in) tribunale)\b/i, score: 10, label: 'Contenzioso' },
    ],

    // ── C. ANTI-EVASION — fuzzy matching su stringa normalizzata ──
    _fuzzyBlacklist: [
      { word: 'vaffanculo', threshold: 0.78 },
      { word: 'stronzo',    threshold: 0.80 },
      { word: 'coglione',   threshold: 0.80 },
      { word: 'imbecille',  threshold: 0.78 },
      { word: 'puttana',    threshold: 0.82 },
      { word: 'idiota',     threshold: 0.80 },
    ],

    // Distanza di Levenshtein normalizzata
    _similarity(a, b) {
      if (!a || !b) return 0;
      const m = a.length, n = b.length;
      if (m === 0 || n === 0) return 0;
      const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
      );
      for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
          dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      return 1 - dp[m][n] / Math.max(m, n);
    },

    analyze(originalText) {
      const result = { flags: [], maxSeverity: 'none', rawScore: 0 };
      if (!originalText) return result;

      const normalized = TextNormalizer.normalize(originalText);
      const stripped   = TextNormalizer.strip(originalText);

      // A. Blacklist diretta
      const severityScores = { critical: 85, high: 65, medium: 40, low: 20 };
      for (const [level, patterns] of Object.entries(this._blacklist)) {
        for (const re of patterns) {
          if (re.test(normalized) || re.test(originalText)) {
            result.flags.push({ type: 'blacklist', level, label: `Pattern ${level}: ${re.source.substring(0,40)}…` });
            result.rawScore = Math.max(result.rawScore, severityScores[level]);
            result.maxSeverity = this._maxSev(result.maxSeverity, level);
          }
        }
      }

      // B. Semantici
      for (const p of this._semanticPatterns) {
        if (p.re.test(normalized) || p.re.test(originalText)) {
          result.flags.push({ type: 'semantic', level: 'medium', label: p.label });
          result.rawScore = Math.max(result.rawScore, p.score);
          result.maxSeverity = this._maxSev(result.maxSeverity, 'medium');
        }
      }

      // C. Fuzzy anti-evasion — analizza singole parole dello stripped
      const words = stripped.match(/\w{4,}/g) || [];
      for (const entry of this._fuzzyBlacklist) {
        for (const word of words) {
          const sim = this._similarity(word, entry.word);
          if (sim >= entry.threshold && sim < 1.0) { // < 1 evita le corrispondenze esatte già catturate sopra
            result.flags.push({ type: 'fuzzy', level: 'high', label: `Fuzzy match "${word}" ~ "${entry.word}" (${(sim*100).toFixed(0)}%)` });
            result.rawScore = Math.max(result.rawScore, 60);
            result.maxSeverity = this._maxSev(result.maxSeverity, 'high');
          }
        }
      }

      // D. Caps-lock check (solo testi > 10 char)
      if (originalText.length > 10) {
        const upper  = (originalText.match(/[A-ZÀÁÂÄÆÃÅÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜ]/g) || []).length;
        const letters = (originalText.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
        if (letters > 10 && upper / letters > 0.6) {
          result.flags.push({ type: 'caps', level: 'low', label: 'Testo in MAIUSCOLO eccessivo' });
          result.rawScore = Math.max(result.rawScore, 18);
        }
      }

      return result;
    },

    _maxSev(current, candidate) {
      const order = ['none','low','medium','high','critical'];
      return order.indexOf(candidate) > order.indexOf(current) ? candidate : current;
    }
  };

  /* ─────────────────────────────────────────────────────────
     3. SPAM DETECTOR — flood, duplicati, link
  ───────────────────────────────────────────────────────── */
  const SpamDetector = {
    _userMsgHistory: new Map(), // email → [{text, ts}]
    _WINDOW_MS:       30 * 1000,  // 30 secondi
    _FLOOD_THRESHOLD: 6,          // messaggi in 30s
    _DUP_THRESHOLD:   3,          // stesso testo ripetuto

    record(userEmail, text, ts) {
      const key = (userEmail || 'anon').toLowerCase();
      if (!this._userMsgHistory.has(key)) this._userMsgHistory.set(key, []);
      const hist = this._userMsgHistory.get(key);
      hist.push({ text: (text || '').toLowerCase(), ts: ts || Date.now() });
      // Pulizia history > 10 min
      const cutoff = Date.now() - 10 * 60 * 1000;
      this._userMsgHistory.set(key, hist.filter(m => m.ts > cutoff));
    },

    analyze(userEmail, text) {
      const result = { flags: [], rawScore: 0 };
      const key  = (userEmail || 'anon').toLowerCase();
      const hist = this._userMsgHistory.get(key) || [];
      const now  = Date.now();
      const recent = hist.filter(m => now - m.ts < this._WINDOW_MS);

      // Flood check
      if (recent.length >= this._FLOOD_THRESHOLD) {
        result.flags.push({ type: 'flood', label: `${recent.length} messaggi in 30s` });
        result.rawScore = Math.max(result.rawScore, 55 + Math.min(recent.length * 3, 30));
      }

      // Duplicati
      const normText = (text || '').toLowerCase().trim();
      const dups = recent.filter(m => m.text === normText).length;
      if (dups >= this._DUP_THRESHOLD) {
        result.flags.push({ type: 'duplicate', label: `Testo ripetuto ${dups} volte` });
        result.rawScore = Math.max(result.rawScore, 50 + dups * 8);
      }

      // Numero link eccessivo
      const links = (text || '').match(/https?:\/\/[^\s]+/g) || [];
      if (links.length >= 3) {
        result.flags.push({ type: 'multi_link', label: `${links.length} URL nel messaggio` });
        result.rawScore = Math.max(result.rawScore, 40);
      }

      return result;
    }
  };

  /* ─────────────────────────────────────────────────────────
     4. LINK ANALYZER — domini sospetti
  ───────────────────────────────────────────────────────── */
  const LinkAnalyzer = {
    _shorteners: ['bit.ly','tinyurl.com','t.co','ow.ly','buff.ly','goo.gl','is.gd','v.gd','short.io','rb.gy'],
    _suspicious: ['onlyfans.com','adult.','xxx.','sex.','pump.fun','rugpull.','telegram.me/','t.me/'],
    _whitelisted: ['luxhaven360.com','luxhaven360.it','google.com','wikipedia.org','youtube.com'],

    analyze(text) {
      const result = { flags: [], rawScore: 0 };
      const urls = (text || '').match(/https?:\/\/[^\s]+/g) || [];
      for (const url of urls) {
        try {
          const host = new URL(url).hostname.toLowerCase();
          if (this._whitelisted.some(w => host === w || host.endsWith('.' + w))) continue;
          if (this._shorteners.some(s => host === s || host.endsWith('.' + s))) {
            result.flags.push({ type: 'short_url', label: `URL abbreviato: ${host}` });
            result.rawScore = Math.max(result.rawScore, 30);
          }
          if (this._suspicious.some(s => host.includes(s) || url.includes(s))) {
            result.flags.push({ type: 'suspicious_url', label: `URL sospetto: ${host}` });
            result.rawScore = Math.max(result.rawScore, 50);
          }
        } catch (_) { /* URL malformato */ }
      }
      return result;
    }
  };

  /* ─────────────────────────────────────────────────────────
     5. USER RISK TRACKER — score utente dinamico
  ───────────────────────────────────────────────────────── */
  const UserRiskTracker = {
    _scores: {},   // email → { score, violations, lastUpdate }

    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RISK);
        if (raw) this._scores = JSON.parse(raw);
      } catch (_) {}
    },

    _save() {
      try { localStorage.setItem(STORAGE_KEY_RISK, JSON.stringify(this._scores)); } catch (_) {}
    },

    get(email) {
      const key = (email || 'anon').toLowerCase();
      return this._scores[key] || { score: 0, violations: 0, lastUpdate: 0 };
    },

    record(email, contentScore, sourceType) {
      const key = (email || 'anon').toLowerCase();
      const prev = this.get(email);
      // Incremento ponderato: > 50 → +25, > 30 → +12, > 0 → +5
      const delta = contentScore > 50 ? 25 : contentScore > 30 ? 12 : contentScore > 0 ? 5 : 0;
      // Decadimento temporale: -1 ogni 24h di buona condotta
      const hoursClean = (Date.now() - (prev.lastUpdate || 0)) / 3_600_000;
      const decay = Math.min(hoursClean * 1, prev.score);
      const newScore = Math.min(100, Math.max(0, prev.score - decay + delta));
      this._scores[key] = {
        score:      newScore,
        violations: prev.violations + (delta > 0 ? 1 : 0),
        lastUpdate: Date.now(),
        lastSource: sourceType
      };
      this._save();
      return this._scores[key];
    },

    // Riduzione manuale del risk (es. dopo revisione del team)
    reduce(email, amount) {
      const key = (email || 'anon').toLowerCase();
      if (!this._scores[key]) return;
      this._scores[key].score = Math.max(0, this._scores[key].score - amount);
      this._save();
    }
  };

  /* ─────────────────────────────────────────────────────────
     6. CONTEXT EVALUATOR — ruolo + conversazione
  ───────────────────────────────────────────────────────── */
  const ContextEvaluator = {
    evaluate(authorRole, sourceType, flags) {
      let multiplier = 1.0;
      // Team members: contesti meno rischiosi (brand voice, moderatori stessi)
      if (authorRole === 'team') multiplier *= 0.2;
      // Founding members: leggero bonus affidabilità
      else if (authorRole === 'founding') multiplier *= 0.75;
      // Candidate: nessuna variazione
      return multiplier;
    }
  };

  /* ─────────────────────────────────────────────────────────
     7. SCORING ENGINE — punteggio finale 0–100
  ───────────────────────────────────────────────────────── */
  const ScoringEngine = {
    /**
     * @param {object} textResult    — da TextAnalyzer
     * @param {object} spamResult    — da SpamDetector
     * @param {object} linkResult    — da LinkAnalyzer
     * @param {object} userRisk      — da UserRiskTracker
     * @param {number} ctxMultiplier — da ContextEvaluator
     * @returns {{ score, level, flags, details }}
     */
    compute(textResult, spamResult, linkResult, userRisk, ctxMultiplier) {
      const allFlags = [
        ...(textResult.flags || []),
        ...(spamResult.flags || []),
        ...(linkResult.flags || [])
      ];

      // Punteggio base: max dei singoli moduli
      let base = Math.max(
        textResult.rawScore  || 0,
        spamResult.rawScore  || 0,
        linkResult.rawScore  || 0
      );

      // Bonus additivo per flag multipli (es. spam + insulto)
      if (allFlags.length > 2) base = Math.min(100, base + allFlags.length * 3);

      // Risk utente: aggiunge fino a +20 se l'utente ha storico violazioni
      const userBonus = Math.round((userRisk.score || 0) * 0.2);
      base = Math.min(100, base + userBonus);

      // Applicazione moltiplicatore contesto (team → abbassa, candidate → neutro)
      const score = Math.round(Math.min(100, Math.max(0, base * ctxMultiplier)));

      // Classificazione livello
      const level = score <= 20 ? 'safe'
                  : score <= 50 ? 'suspect'
                  : score <= 80 ? 'high'
                  : 'critical';

      return { score, level, flags: allFlags, details: { base, userBonus, ctxMultiplier } };
    }
  };

  /* ─────────────────────────────────────────────────────────
     8. REVIEW QUEUE — coda revisione manuale + log
  ───────────────────────────────────────────────────────── */
  const ReviewQueue = {
    _queue:     [],
    _decisions: [],

    _load() {
      try {
        const qRaw = localStorage.getItem(STORAGE_KEY_QUEUE);
        if (qRaw) this._queue = JSON.parse(qRaw);
        const dRaw = localStorage.getItem(STORAGE_KEY_DECISIONS);
        if (dRaw) this._decisions = JSON.parse(dRaw);
      } catch (_) {}
    },

    _save() {
      try {
        this._queue     = this._queue.slice(-MAX_QUEUE_SIZE);
        this._decisions = this._decisions.slice(-MAX_DECISIONS_SIZE);
        localStorage.setItem(STORAGE_KEY_QUEUE,     JSON.stringify(this._queue));
        localStorage.setItem(STORAGE_KEY_DECISIONS, JSON.stringify(this._decisions));
      } catch (_) {}
    },

    enqueue(entry) {
      this._queue.unshift(entry);
      this._save();
      // Aggiorna badge moderazione in community-hub se presente
      this._refreshBadge();
    },

    decide(id, decision, actor) {
      const idx = this._queue.findIndex(e => e.id === id);
      let entry = null;
      if (idx !== -1) { entry = this._queue.splice(idx, 1)[0]; }
      this._decisions.unshift({
        ...(entry || { id }),
        decision, actor,
        decidedAt: Date.now()
      });
      this._save();
      this._refreshBadge();
      return entry;
    },

    getQueue()     { return this._queue.slice(); },
    getDecisions() { return this._decisions.slice(); },

    _refreshBadge() {
      const badge = document.getElementById('modBadge');
      const total = (this._queue.length);
      if (!badge) return;
      if (total > 0) { badge.textContent = total; badge.classList.remove('hidden'); }
      else            badge.classList.add('hidden');
    }
  };

  /* ─────────────────────────────────────────────────────────
     9. ACTION DISPATCHER — azioni automatiche per livello
  ───────────────────────────────────────────────────────── */
  const ActionDispatcher = {
    /**
     * @param {{ score, level, flags }} scoring
     * @param {object} contentMeta  — { sourceType, sourceId, authorName, authorEmail, text }
     * @param {object} userRiskData — da UserRiskTracker
     */
    dispatch(scoring, contentMeta, userRiskData) {
      const { score, level, flags } = scoring;
      const { sourceType, sourceId, authorName, authorEmail, text } = contentMeta;
      const label = flags.map(f => f.label).join('; ') || 'Nessun dettaglio';

      // 🟢 SAFE (0–20): pubblica normalmente
      if (level === 'safe') return { action: 'allow', score };

      const entry = {
        id:          `mod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ts:          Date.now(),
        score,
        level,
        flags,
        sourceType,
        sourceId:    String(sourceId),
        authorName,
        authorEmail: authorEmail || '',
        contentSnippet: (text || '').substring(0, 150),
        action:      null,
        reviewedBy:  null
      };

      // 🟡 SUSPECT (21–50): pubblica ma accoda per revisione
      if (level === 'suspect') {
        entry.action = 'flag';
        ReviewQueue.enqueue(entry);
        LearningAdapter.record(authorEmail, score, 'flag');
        return { action: 'flag', score, entry };
      }

      // 🟠 HIGH (51–80): accoda + warning automatico utente
      if (level === 'high') {
        entry.action = 'warn';
        ReviewQueue.enqueue(entry);
        LearningAdapter.record(authorEmail, score, 'warn');
        this._warnUser(authorName, sourceType);
        // Segnala automaticamente alla moderazione di community-hub
        this._bridgeReport(entry, 'Rilevamento automatico (rischio alto)');
        return { action: 'warn', score, entry };
      }

      // 🔴 CRITICAL (81–100): rimuovi immediatamente + segnala
      if (level === 'critical') {
        entry.action = 'remove';
        ReviewQueue.enqueue(entry);
        LearningAdapter.record(authorEmail, score, 'remove');
        this._warnUser(authorName, sourceType);
        this._bridgeReport(entry, 'Rimozione automatica (violazione grave)');
        this._hideContent(sourceType, sourceId);
        return { action: 'remove', score, entry };
      }

      return { action: 'allow', score };
    },

    _warnUser(authorName, sourceType) {
      // Se il team è loggato, mostra toast avviso nel pannello moderazione
      const curRole = (global.currentUser && global.currentUser.role) || '';
      if (curRole !== 'team') return;
      if (typeof global.showToast === 'function') {
        global.showToast('amber', '🤖', `Auto-mod: contenuto di <strong>${authorName}</strong> segnalato (${sourceType})`);
      }
    },

    _hideContent(sourceType, sourceId) {
      // Aggiunge l'ID a _REMOVED_IDS di community-hub per nascondere il contenuto dal DOM
      if (typeof global._REMOVED_IDS !== 'undefined') {
        global._REMOVED_IDS.add(`${sourceType}:${sourceId}`);
        if (typeof global._REMOVED_IDS.add === 'function') {
          global._REMOVED_IDS.add(`${sourceType}:${Number(sourceId)}`);
        }
      }
    },

    _bridgeReport(entry, label) {
      // Inietta il report nel sistema REPORTS di community-hub
      if (typeof global.REPORTS === 'undefined' || !Array.isArray(global.REPORTS)) return;
      const alreadyIn = global.REPORTS.some(r =>
        String(r.sourceId) === String(entry.sourceId) && r.sourceType === entry.sourceType
      );
      if (alreadyIn) return;

      const report = {
        id:           entry.id,
        type:         label,
        reporter:     '🤖 Auto-mod',
        reporterEmail:'system',
        target:       `${entry.sourceType} di ${entry.authorName}`,
        content:      entry.contentSnippet,
        time:         'Ora',
        ts:           entry.ts,
        sourceType:   entry.sourceType,
        sourceId:     entry.sourceId,
        authorName:   entry.authorName,
        authorEmail:  entry.authorEmail,
        isAuto:       true,
        severity:     entry.level === 'critical' ? 'critical' : entry.level === 'high' ? 'high' : 'medium',
        modFlags:     entry.flags.map(f => f.label)
      };
      global.REPORTS.push(report);
      if (typeof global.saveModData === 'function') global.saveModData();
      // Notifica Supabase
      if (typeof global._writeReportToSupabase === 'function') global._writeReportToSupabase(report);
    }
  };

  /* ─────────────────────────────────────────────────────────
     10. LEARNING ADAPTER — sensibilità adattiva
  ───────────────────────────────────────────────────────── */
  const LearningAdapter = {
    _data: {},  // email → { totalFlags, removes, warns, flags, lastSeen }

    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_LEARNING);
        if (raw) this._data = JSON.parse(raw);
      } catch (_) {}
    },

    _save() {
      try { localStorage.setItem(STORAGE_KEY_LEARNING, JSON.stringify(this._data)); } catch (_) {}
    },

    record(email, score, actionTaken) {
      const key = (email || 'anon').toLowerCase();
      if (!this._data[key]) this._data[key] = { totalFlags: 0, removes: 0, warns: 0, flags: 0, lastSeen: 0 };
      const d = this._data[key];
      d.totalFlags++;
      if (actionTaken === 'remove') d.removes++;
      else if (actionTaken === 'warn') d.warns++;
      else if (actionTaken === 'flag') d.flags++;
      d.lastSeen = Date.now();
      this._save();
      // Aumenta il risk score dell'utente
      UserRiskTracker.record(email, score, actionTaken);
    },

    // Restituisce un moltiplicatore di sensibilità per un autore noto-problematico
    getSensitivityMultiplier(email) {
      const key = (email || 'anon').toLowerCase();
      const d = this._data[key];
      if (!d) return 1.0;
      // Ogni rimozione +0.15, ogni warn +0.08, ogni flag +0.04
      return Math.min(2.0, 1.0 + d.removes * 0.15 + d.warns * 0.08 + d.flags * 0.04);
    }
  };

  /* ─────────────────────────────────────────────────────────
     11. CONTENT LISTENER — hook centralizzato
  ───────────────────────────────────────────────────────── */
  const ContentListener = {
    /**
     * Intercetta un contenuto in ingresso e lo passa al pipeline.
     * Deve essere chiamato da community-hub.html in tutti i punti di
     * creazione contenuto (invio messaggio, commento, post, thread reply).
     *
     * @param {string} text
     * @param {string} sourceType  — 'comment'|'reply'|'dm_message'|'fc_message'|'thread'
     * @param {string} sourceId
     * @param {string} authorName
     * @param {string} authorEmail
     * @param {string} [authorRole] — 'team'|'founding'|'candidate'
     * @returns {{ action, score, level, flags }}
     */
    process(text, sourceType, sourceId, authorName, authorEmail, authorRole) {
      if (!text || !text.trim()) return { action: 'allow', score: 0, level: 'safe', flags: [] };

      // Asynch-safe: non blocca l'UI — eseguito in microtask
      return new Promise(resolve => {
        setTimeout(() => {
          try {
            const result = ModBridge._runPipeline(text, sourceType, sourceId, authorName, authorEmail, authorRole);
            resolve(result);
          } catch (err) {
            console.warn('[LH360Mod] Pipeline error:', err);
            resolve({ action: 'allow', score: 0, level: 'safe', flags: [] });
          }
        }, 0);
      });
    },

    // Scan sincrono (per contenuti già renderizzati — scan iniziale)
    processSync(text, sourceType, sourceId, authorName, authorEmail, authorRole) {
      try {
        return ModBridge._runPipeline(text, sourceType, sourceId, authorName, authorEmail, authorRole);
      } catch (err) {
        console.warn('[LH360Mod] Sync pipeline error:', err);
        return { action: 'allow', score: 0, level: 'safe', flags: [] };
      }
    }
  };

  /* ─────────────────────────────────────────────────────────
     12. MOD BRIDGE — pipeline principale + API pubblica
  ───────────────────────────────────────────────────────── */
  const ModBridge = {
    _initialized: false,

    init() {
      if (this._initialized) return;
      UserRiskTracker._load();
      ReviewQueue._load();
      LearningAdapter._load();
      this._initialized = true;
      console.info('[LH360Mod] Moderation engine v2.0 initialized');
    },

    _runPipeline(text, sourceType, sourceId, authorName, authorEmail, authorRole) {
      const role = authorRole || 'candidate';
      const safeId = String(sourceId || Date.now());

      // 1. Registra il messaggio nello spam detector
      SpamDetector.record(authorEmail, text, Date.now());

      // 2. Analisi
      const textResult  = TextAnalyzer.analyze(text);
      const spamResult  = SpamDetector.analyze(authorEmail, text);
      const linkResult  = LinkAnalyzer.analyze(text);
      const userRisk    = UserRiskTracker.get(authorEmail);
      const ctxMult     = ContextEvaluator.evaluate(role, sourceType, textResult.flags);
      const learnMult   = LearningAdapter.getSensitivityMultiplier(authorEmail);

      // 3. Scoring (applica il learn multiplier sullo score base)
      const rawScoring  = ScoringEngine.compute(textResult, spamResult, linkResult, userRisk, ctxMult);
      // Il moltiplicatore learning agisce solo sullo score utente (non sul base text score)
      const adjustedScore = Math.min(100, Math.round(rawScoring.score * learnMult));
      const level = adjustedScore <= 20 ? 'safe' : adjustedScore <= 50 ? 'suspect' : adjustedScore <= 80 ? 'high' : 'critical';
      const finalScoring = { ...rawScoring, score: adjustedScore, level };

      // 4. Azione
      const outcome = ActionDispatcher.dispatch(finalScoring, {
        sourceType, sourceId: safeId,
        authorName: authorName || 'Utente',
        authorEmail: authorEmail || '',
        text
      }, userRisk);

      return {
        action: outcome.action,
        score:  finalScoring.score,
        level:  finalScoring.level,
        flags:  finalScoring.flags,
        entry:  outcome.entry || null
      };
    },

    // ── API pubblica ────────────────────────────────────
    /** Sostituisce la vecchia autoModerateText di community-hub */
    moderateText(text, sourceType, sourceId, authorName, authorEmail, authorRole) {
      return ContentListener.processSync(text, sourceType, sourceId, authorName, authorEmail, authorRole);
    },

    /** Scan su batch di contenuti (es. alla prima apertura del pannello) */
    scanBatch(items) {
      return items.map(item =>
        this._runPipeline(item.text, item.sourceType, item.sourceId, item.authorName, item.authorEmail, item.authorRole)
      );
    },

    /** Restituisce la coda di revisione per il pannello moderazione */
    getReviewQueue()     { return ReviewQueue.getQueue(); },
    getDecisionLog()     { return ReviewQueue.getDecisions(); },

    /** Decisione manuale del team su un item in coda */
    resolveItem(id, decision, actorName) {
      const entry = ReviewQueue.decide(id, decision, actorName || 'Team');
      if (entry && decision === 'approve') {
        // Riduce il risk score dell'utente se il contenuto era falso positivo
        UserRiskTracker.reduce(entry.authorEmail, 15);
      }
      return entry;
    },

    /** Ottieni user risk score */
    getUserRisk(email)   { return UserRiskTracker.get(email); },

    /** Riduzione manuale risk (dopo revisione) */
    reduceUserRisk(email, amount) { UserRiskTracker.reduce(email, amount || 20); }
  };

  /* ─────────────────────────────────────────────────────────
     INIT & EXPORT
  ───────────────────────────────────────────────────────── */
  ModBridge.init();

  // Espone l'API pubblica su window.LH360Mod
  global.LH360Mod = {
    // Metodo principale — drop-in replacement per autoModerateText
    moderate:       ModBridge.moderateText.bind(ModBridge),
    scanBatch:      ModBridge.scanBatch.bind(ModBridge),
    getReviewQueue: ModBridge.getReviewQueue.bind(ModBridge),
    getDecisionLog: ModBridge.getDecisionLog.bind(ModBridge),
    resolveItem:    ModBridge.resolveItem.bind(ModBridge),
    getUserRisk:    ModBridge.getUserRisk.bind(ModBridge),
    reduceUserRisk: ModBridge.reduceUserRisk.bind(ModBridge),
    // Accesso diretto ai moduli per estensioni future
    _modules: { TextNormalizer, TextAnalyzer, SpamDetector, LinkAnalyzer,
                UserRiskTracker, ContextEvaluator, ScoringEngine,
                ActionDispatcher, ReviewQueue, LearningAdapter }
  };

  /* ── Override autoModerateText in community-hub (se presente) ──
     Mantiene la firma identica per compatibilità con le chiamate esistenti.
     Il nuovo engine fa tutto quello che il vecchio faceva + molto di più.  */
  global.autoModerateText = function(text, sourceType, sourceId, authorName, authorEmail) {
    const authorRole = (global.currentUser && global.currentUser.role) || 'candidate';
    ModBridge.moderateText(text, sourceType, sourceId, authorName, authorEmail, authorRole);
    // Non restituisce nulla per compatibilità (le chiamate esistenti ignorano il return)
  };

})(window);

/*
 * ═══════════════════════════════════════════════════════════
 *  INTEGRAZIONE — community-hub.html
 *
 *  Aggiungi nel <head> di community-hub.html, PRIMA dello script principale:
 *
 *    <script src="community-moderation.js"></script>
 *
 *  Dopo l'inizializzazione il motore è attivo automaticamente:
 *  - window.autoModerateText viene sovrascritto con la versione avanzata
 *  - window.LH360Mod espone l'API per il pannello Moderazione
 *
 *  Per il pannello Team → Moderazione, usa:
 *    LH360Mod.getReviewQueue()    → lista item da revisionare
 *    LH360Mod.resolveItem(id, 'approve' | 'reject' | 'remove', actorName)
 *    LH360Mod.getUserRisk(email)  → { score, violations }
 *
 *  Per scan dei contenuti già presenti al caricamento pagina:
 *    LH360Mod.scanBatch(FEED_POSTS.map(p => ({
 *      text: p.text, sourceType: 'post', sourceId: p.id,
 *      authorName: p.author, authorEmail: p.email, authorRole: p.role
 *    })));
 * ═══════════════════════════════════════════════════════════
 */
