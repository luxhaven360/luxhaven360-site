/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LUXHAVEN360 — COMMUNITY MODERATION ENGINE  v3.0  (multilingual)
 *  community-moderation.js
 *
 *  MODULI:
 *    1. TextNormalizer     — normalizzazione testo, anti-evasione
 *    2. LanguageDetector   — rilevamento lingua (IT/EN/FR/DE/ES)
 *    3. MultiLangBlacklist — blacklist per lingua + fuzzy cross-lingua
 *    4. TextAnalyzer       — analisi testuale + semantica
 *    5. SpamDetector       — flood, ripetizioni, link
 *    6. LinkAnalyzer       — URL inspection
 *    7. UserRiskTracker    — user risk score dinamico
 *    8. ContextEvaluator   — ruolo utente
 *    9. ScoringEngine      — punteggio finale 0–100
 *   10. ActionDispatcher   — azioni automatiche
 *   11. ReviewQueue        — coda revisione manuale
 *   12. LearningAdapter    — adattamento sensibilità
 *   13. ModBridge          — pipeline + API pubblica
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  const STORAGE_KEY_RISK      = 'lh360_mod_user_risk_v2';
  const STORAGE_KEY_QUEUE     = 'lh360_mod_queue_v2';
  const STORAGE_KEY_DECISIONS = 'lh360_mod_decisions_v2';
  const STORAGE_KEY_LEARNING  = 'lh360_mod_learning_v2';
  const MAX_QUEUE_SIZE        = 500;
  const MAX_DECISIONS_SIZE    = 1000;

  /* ── 1. TEXT NORMALIZER ─────────────────────────────────── */
  const TextNormalizer = {
    _leetMap: {
      '0':'o','1':'i','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g',
      '@':'a','$':'s','!':'i','|':'i','+':'t','(':'c',')':'o','ph':'f'
    },
    normalize(text) {
      if (!text) return '';
      let t = String(text).toLowerCase();
      t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      t = t.replace(/\b(\w)\s+(?=(\w\s){1,}\w\b)/g, '$1');
      t = t.replace(/[013456789@$!|+()]/g, ch => this._leetMap[ch] || ch);
      t = t.replace(/([^\w\s])\1+/g, '$1');
      t = t.replace(/([a-z])[_\-\.]+([a-z])/g, '$1$2');
      t = t.replace(/\s+/g, ' ');
      return t.trim();
    },
    strip(text) {
      return this.normalize(text).replace(/[^a-z0-9]/g, '');
    }
  };

  /* ── 2. LANGUAGE DETECTOR ───────────────────────────────── */
  const LanguageDetector = {
    _markers: {
      it: /\b(che\s|non\s|una\s|del\s|nella\s|della\s|sono\s|hai\s|questo\s|quello\s|perch[eé]|anche|tutto|molto|quando|come\s|fare\s|essere|siamo|vostro|nostro)\b/gi,
      en: /\b(the\s|and\s|you\s|that\s|have\s|for\s|not\s|with\s|this\s|are\s|your\s|will\s|from\s|they\s|just\s|there\s|their\s|about\s|would\s|could\s)\b/gi,
      fr: /\b(les\s|des\s|dans\s|est\s|pas\s|vous\s|pour\s|sur\s|avec\s|que\s|sont\s|mais\s|comme\s|bien\s|tout\s|aussi\s|chez\s|tr[eè]s\s|moi\s|toi\s)\b/gi,
      de: /\b(der\s|die\s|das\s|und\s|ist\s|nicht\s|ich\s|sie\s|mit\s|f[uü]r\s|auf\s|sich\s|aber\s|auch\s|wenn\s|dich\s|wir\s|mir\s|ihr\s|hast\s)\b/gi,
      es: /\b(los\s|las\s|que\s|con\s|por\s|para\s|como\s|pero\s|m[aá]s\s|esto\s|est[aá]\s|eres\s|hay\s|muy\s|todo\s|bien\s|cuando\s|tambi[eé]n\s)\b/gi,
    },
    detect(text) {
      if (!text || text.length < 8) return 'und';
      const scores = {};
      for (const [lang, re] of Object.entries(this._markers)) {
        // Rebuild regex each time to reset lastIndex (g-flag regexes maintain state)
        const freshRe = new RegExp(re.source, re.flags);
        scores[lang] = (text.match(freshRe) || []).length;
      }
      const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      return best[0][1] === 0 ? 'und' : best[0][0];
    }
  };

  /* ── 3. MULTILINGUAL BLACKLIST ──────────────────────────── */
  const MultiLangBlacklist = {

    universal: {
      critical: [
        /\b(nazi|fascis[mt]|white\s?power|heil\s?hitler|kkk|kill\s?all|death\s?to)\b/i,
        /\b(under\s?1[0-8]|minors?|child(ren)?).{0,30}(nude?|naked|sex|porn|xxx)\b/i,
        /\b(fuck\s?you|motherfucker|go\s?fuck\s?yourself)\b/i,
      ],
      high: [
        /\b(wtf|stfu|kys|kms|gtfo)\b/i,
      ],
      medium: [
        /\b(spam|scam|phishing|ponzi)\b/i,
        /\b(onlyfans\.com|pornhub\.com|xvideos\.com|redtube\.com)\b/i,
        /(.)\1{6,}/,
      ]
    },

    it: {
      critical: [
        /\b(ti (ammazzo|uccido|faccio del male|spacco la faccia|taglio|brucio)|so dove (abiti|vivi)|ti (trovo|vengo a cercare|rovino la vita))\b/i,
        /\b(razzis[mt]a|morte (ai|agli)|eliminare i|inferiori di razza)\b/i,
        /\b(cocaina|eroina|meth|crack|hashish).{0,20}(compra|vendi|spacci)\b/i,
        /\b(armi in vendita|pistol[ae] (compra|vend)|bomb[ae] artigianali)\b/i,
      ],
      high: [
        /\b(vaffanculo|fanculo|va[' ]?fanculo|cazzo|stronzo|bastardo|figlio di (puttana|troia)|coglione|imbecille|idiota|ritardato|scemo di merda)\b/i,
        /\b(puttana|troia|baldracca|mignotta|battona).{0,15}(sei|fai|vai|sembri)\b/i,
        /\b(dovrebbero (morire|sparire|essere eliminati)|andate a (morire|fanculo))\b/i,
        /\b(lurido|schifoso|verme|parassita|pezzo di (merda|spazzatura))\b/i,
      ],
      medium: [
        /\b(compra ora|acquista subito|offerta (limitata|esclusiva)|guadagna \d+[€$k]|clicca (qui|subito)|sconto \d+%|free money|guadagni facili)\b/i,
        /\b(bitcoin (pump|dump)|cripto (scam|pump)|nft gratis|airdrop gratu|manda[re] (soldi|btc|eth) per ricevere)\b/i,
        /\b(casino online|scommesse online|sito di incontri|video adulti)\b/i,
        /\b(sfigato|deficiente|patetico|fai schifo|sei uno schifo|cretin[oa]|dement[oa])\b/i,
      ],
      low: [
        /\b(visita|registrati|iscriviti|scarica|clicca).{0,20}https?:\/\//i,
      ]
    },

    en: {
      critical: [
        /\b(i(?: will| am going to) (?:kill|murder|hurt|find|destroy) you|i know where you (?:live|are)|i(?: will| am going to) ruin your (?:life|career))\b/i,
        /\b(hate (?:all )?(?:blacks?|jews?|muslims?|arabs?|gays?)|death to|exterminate|racial inferior)\b/i,
        /\b(buy (?:cocaine|heroin|meth|crack|fentanyl)|sell (?:drugs?|weapons?|guns?)|bomb.{0,10}(?:make|build|instructions?))\b/i,
      ],
      high: [
        /\b(asshole|piece of shit|dumb(?:ass|fuck)|son of (?:a )?bitch|fucking (?:idiot|moron|loser|retard)|go (?:die|kill yourself))\b/i,
        /\b(bitch|slut|whore|cunt).{0,15}(?:you (?:are|r)|you'?re)\b/i,
        /\b(should (?:die|disappear|be (?:killed|eliminated)))\b/i,
        /\b(scumbag|worthless|trash|garbage|filth|scum|vermin|freak)\b/i,
      ],
      medium: [
        /\b(buy now|limited offer|earn \$\d+|click here|free money|easy (?:cash|money)|get rich (?:fast|quick))\b/i,
        /\b(crypto (?:pump|dump)|nft (?:free|giveaway)|airdrop (?:free|giveaway)|send (?:money|btc|eth) (?:to receive|for))\b/i,
        /\b(online casino|sports betting|dating site|adult (?:video|content))\b/i,
        /\b(moron|loser|jerk|creep|disgusting|pathetic|disgrace|dork)\b/i,
      ],
      low: [
        /\b(visit|sign up|register|download|click here).{0,20}https?:\/\//i,
      ]
    },

    fr: {
      critical: [
        /\b(je (?:vais|veux) te (?:tuer|retrouver|faire du mal|d[eé]truire)|je sais o[uù] tu (?:habites?|vis)|je vais (?:ruiner|d[eé]truire) ta vie)\b/i,
        /\b(haine des? (?:noirs?|juifs?|musulmans?|arabes?|gays?)|mort aux?|[eé]liminer les?|inf[eé]rieurs? de race)\b/i,
        /\b(acheter? (?:coca[iï]ne|h[eé]ro[iï]ne|meth|crack)|vendre? (?:drogue|armes?)|bombe.{0,10}(?:fabriquer|instructions?))\b/i,
      ],
      high: [
        /\b(va te faire (?:foutre|enc[ue]uler)|fils? de (?:pute|salope|chienne)|connard|enfo[iî]r[eé]|abruti|cr[eé]tin|imb[eé]cile|b[aâ]tard)\b/i,
        /\b(pute|salope|putain|catin).{0,15}(?:tu es|t'es|vous [eê]tes)\b/i,
        /\b(devraient (?:mourir|dispara[iî]tre|[eê]tre [eé]limin[eé]s?)|allez (?:crever|vous faire))\b/i,
        /\b(ordure|vermine|parasite|d[eé]chet|salopard|raclure)\b/i,
      ],
      medium: [
        /\b(achetez maintenant|offre limit[eé]e|gagnez \d+[€$]|cliquez ici|argent gratuit|enrichissez-vous vite)\b/i,
        /\b(crypto (?:pump|dump)|nft gratuit|airdrop gratuit|envoyez (?:argent|btc|eth) pour recevoir)\b/i,
        /\b(casino en ligne|paris sportifs?|site de rencontre|vid[eé]o adulte)\b/i,
        /\b(nul|loser|rat[eé]|d[eé]bile|path[eé]tique|d[eé]go[uû]tant|minable)\b/i,
      ],
      low: [
        /\b(visitez|inscrivez-vous|t[eé]l[eé]chargez|cliquez).{0,20}https?:\/\//i,
      ]
    },

    de: {
      critical: [
        /\b(ich (?:werde|will) dich (?:umbringen|t[oö]ten|finden|verletzen|zerst[oö]ren)|ich wei[sß] wo du (?:wohnst|lebst)|ich (?:werde|will) dein Leben (?:ruinieren|zerst[oö]ren))\b/i,
        /\b(hass auf (?:Juden|Muslime|Schwarze|Ausl[aä]nder|Schwule)|Tod den?|vernichten|rassistische? Untermenschen)\b/i,
        /\b((?:Kokain|Hero[iì]n|Meth|Crystal|Crack) (?:kaufen|verkaufen)|Waffen (?:kaufen|verkaufen)|Bombe.{0,10}(?:bauen|Anleitung))\b/i,
      ],
      high: [
        /\b(fick dich|verpiss dich|halt die Fresse|Hurensohn|Arschloch|Wichser|Schei[sß]kerl|dumme?r? (?:Idiot|Vollidiot|Trottel)|Bastard)\b/i,
        /\b(Schlampe|Hure|Nutte).{0,15}(?:du bist|bist du|Sie sind)\b/i,
        /\b(sollten (?:sterben|verschwinden|vernichtet werden)|geht (?:sterben|zum Teufel))\b/i,
        /\b(Abschaum|Parasit|Dreckskerl|Widerling|Dreckst[uü]ck|Mistkerl)\b/i,
      ],
      medium: [
        /\b(jetzt kaufen|begrenztes? Angebot|verdiene \d+[€$]|klick hier|Geld gratis|schnell reich werden)\b/i,
        /\b(Krypto (?:pump|dump)|NFT gratis|Airdrop gratis|schicke? (?:Geld|BTC|ETH) um zu erhalten)\b/i,
        /\b(online Casino|Sportwetten|Datingseite|Erwachsenen(?:video|inhalt))\b/i,
        /\b(Versager|Loser|Depp|ekelhaft|widerlich|j[aä]mmerlich)\b/i,
      ],
      low: [
        /\b(besuche[nt]?|anmelden|registrieren|herunterladen|klicke[nt]?).{0,20}https?:\/\//i,
      ]
    },

    es: {
      critical: [
        /\b(te (?:voy a|voy a) (?:matar|encontrar|hacer da[nñ]o|destruir)|s[eé] donde (?:vives|habitas)|voy a (?:arruinar|destruir) tu vida)\b/i,
        /\b(odio a los? (?:negros?|jud[iíì]os?|musulmanes?|arabes?|gays?)|muerte a|eliminar a|inferiores? de raza)\b/i,
        /\b(comprar? (?:coca[iíì]na|hero[iíì]na|meth|crack)|vender? (?:drogas?|armas?|pistolas?)|bomba.{0,10}(?:fabricar|instrucciones?))\b/i,
      ],
      high: [
        /\b(vete a la mierda|hijo de (?:puta|la chingada)|cabr[oó]n|imb[eé]cil|idiota|gilipollas|pendejo|maric[oó]n|co[nñ]o|puto imb[eé]cil)\b/i,
        /\b(puta|zorra|perra|prostituta).{0,15}(?:eres|sois|est[aá]s)\b/i,
        /\b(deber[iíì]an (?:morir|desaparecer|ser eliminados?)|v[aá]yanse a (?:la mierda|morir))\b/i,
        /\b(escoria|par[aá]sito|basura|in[uú]til|maldito|asqueroso|repugnante)\b/i,
      ],
      medium: [
        /\b(compra ahora|oferta limitada|gana \d+[€$]|haz clic aqu[iíì]|dinero gratis|h[aá]zte rico r[aá]pido)\b/i,
        /\b(cripto (?:pump|dump)|nft gratis|airdrop gratis|env[iíì]a (?:dinero|btc|eth) para recibir)\b/i,
        /\b(casino online|apuestas deportivas?|sitio de citas|video adulto)\b/i,
        /\b(perdedor|in[uú]til|pat[eé]tico|fracasado|asco|das asco|eres un asco)\b/i,
      ],
      low: [
        /\b(visita|registrate|descarga|haz clic).{0,20}https?:\/\//i,
      ]
    },

    _semanticByLang: {
      it: [
        { re: /\b(ti (pentirai|odio|faccio (vedere|capire))|vedrai cosa ti succede)\b/i,          score: 45, label: 'Minaccia velata IT' },
        { re: /\b(nessuno ti (vuole|crede)|(sei|siete) (inutili?|incompetenti?))\b/i,              score: 35, label: 'Tossicità IT' },
      ],
      en: [
        { re: /\b(you(?:'ll| will) regret this|i hate you|you'll see what happens|watch your back)\b/i, score: 45, label: 'Veiled threat EN' },
        { re: /\b(nobody (?:likes|wants|cares about) you|you(?:'re| are) (?:useless|worthless|pathetic))\b/i, score: 35, label: 'Toxicity EN' },
      ],
      fr: [
        { re: /\b(tu (?:le regretteras|vas le regretter)|je te d[eé]teste|fais attention [aà] toi)\b/i, score: 45, label: 'Menace voilée FR' },
        { re: /\b(personne ne (?:t'aime|te croit)|(?:tu es|vous [eê]tes) (?:inutile|nul|incomp[eé]tent))\b/i, score: 35, label: 'Toxicité FR' },
      ],
      de: [
        { re: /\b(du wirst (?:es bereuen|Konsequenzen sp[uü]ren)|ich hasse dich|pass auf dich auf)\b/i, score: 45, label: 'Versteckte Drohung DE' },
        { re: /\b(niemand (?:mag|glaubt) dir|(?:du bist|Sie sind) (?:nutzlos|wertlos|inkompetent))\b/i, score: 35, label: 'Toxizität DE' },
      ],
      es: [
        { re: /\b(te vas a arrepentir|te odio|ya ver[aá]s lo que te pasa|cu[iíì]date mucho)\b/i,      score: 45, label: 'Amenaza velada ES' },
        { re: /\b(nadie te (?:quiere|cree)|(?:eres|sois) (?:in[uú]til|pat[eé]tico|incompetente))\b/i, score: 35, label: 'Toxicidad ES' },
      ],
    },

    _fuzzyAll: [
      { word: 'vaffanculo', t: 0.78 }, { word: 'stronzo',    t: 0.80 },
      { word: 'coglione',   t: 0.80 }, { word: 'imbecille',  t: 0.78 },
      { word: 'puttana',    t: 0.82 }, { word: 'idiota',     t: 0.80 },
      { word: 'asshole',    t: 0.80 }, { word: 'bullshit',   t: 0.78 },
      { word: 'motherfucker',t:0.75 }, { word: 'bastard',    t: 0.82 },
      { word: 'dickhead',   t: 0.78 }, { word: 'shithead',   t: 0.78 },
      { word: 'connard',    t: 0.82 }, { word: 'salope',     t: 0.82 },
      { word: 'enfoiré',    t: 0.78 }, { word: 'putain',     t: 0.82 },
      { word: 'arschloch',  t: 0.78 }, { word: 'schlampe',   t: 0.80 },
      { word: 'wichser',    t: 0.82 }, { word: 'hurensohn',  t: 0.75 },
      { word: 'cabron',     t: 0.82 }, { word: 'gilipollas', t: 0.75 },
      { word: 'imbecil',    t: 0.82 }, { word: 'pendejo',    t: 0.82 },
    ],

    getRulesFor(lang) {
      const bl   = this[lang] || {};
      const univ = this.universal;
      const sem  = this._semanticByLang[lang] || [];
      return {
        critical: [...(univ.critical || []), ...(bl.critical || [])],
        high:     [...(univ.high     || []), ...(bl.high     || [])],
        medium:   [...(univ.medium   || []), ...(bl.medium   || [])],
        low:      [...(univ.low      || []), ...(bl.low      || [])],
        semantic: sem,
        fuzzy:    this._fuzzyAll
      };
    }
  };

  /* ── 4. TEXT ANALYZER ───────────────────────────────────── */
  const TextAnalyzer = {
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
      const result = { flags: [], maxSeverity: 'none', rawScore: 0, detectedLang: 'und' };
      if (!originalText) return result;

      const normalized = TextNormalizer.normalize(originalText);
      const stripped   = TextNormalizer.strip(originalText);
      const lang       = LanguageDetector.detect(originalText);
      result.detectedLang = lang;
      const sevScores = { critical: 85, high: 65, medium: 40, low: 20 };
      const ALL_LANGS = ['it','en','fr','de','es'];
      const primaryLang = lang === 'und' ? 'it' : lang;

      // A. Blacklist — STRATEGIA MULTILINGUA:
      //   critical + high: scansione di TUTTE le lingue.
      //   Testi offensivi corti (es. "va te faire foutre") non contengono parole funzionali
      //   → language detector restituisce 'und' → senza multi-scan le FR/ES/DE verrebbero mancate.
      //   medium + low: solo lingua rilevata, per evitare falsi positivi su keyword spam.
      for (const level of ['critical', 'high']) {
        const seen = new Set();
        for (const scanLang of ALL_LANGS) {
          const lr = MultiLangBlacklist.getRulesFor(scanLang);
          for (const re of (lr[level] || [])) {
            if (seen.has(re.source)) continue;
            seen.add(re.source);
            if (re.test(normalized) || re.test(originalText)) {
              result.flags.push({ type: 'blacklist', level, lang: scanLang, label: '[' + scanLang.toUpperCase() + '] ' + level });
              result.rawScore = Math.max(result.rawScore, sevScores[level]);
              result.maxSeverity = this._maxSev(result.maxSeverity, level);
            }
          }
        }
      }
      for (const level of ['medium', 'low']) {
        const pr = MultiLangBlacklist.getRulesFor(primaryLang);
        for (const re of (pr[level] || [])) {
          if (re.test(normalized) || re.test(originalText)) {
            result.flags.push({ type: 'blacklist', level, lang: primaryLang, label: '[' + primaryLang.toUpperCase() + '] ' + level });
            result.rawScore = Math.max(result.rawScore, sevScores[level]);
            result.maxSeverity = this._maxSev(result.maxSeverity, level);
          }
        }
      }

      // B. Semantici — scansione tutte le lingue (pattern brevi, rischio cross-lingua basso)
      for (const scanLang of ALL_LANGS) {
        const sr = MultiLangBlacklist.getRulesFor(scanLang);
        for (const p of (sr.semantic || [])) {
          if (p.re.test(normalized) || p.re.test(originalText)) {
            result.flags.push({ type: 'semantic', level: 'medium', lang: scanLang, label: p.label });
            result.rawScore = Math.max(result.rawScore, p.score);
            result.maxSeverity = this._maxSev(result.maxSeverity, 'medium');
          }
        }
      }

      // C. Fuzzy cross-lingua
      const words = stripped.match(/\w{4,}/g) || [];
      for (const entry of MultiLangBlacklist._fuzzyAll) {
        for (const word of words) {
          const sim = this._similarity(word, entry.word);
          if (sim >= entry.t && sim < 1.0) {
            result.flags.push({ type: 'fuzzy', level: 'high', lang, label: 'Fuzzy "' + word + '"~"' + entry.word + '" (' + (sim*100).toFixed(0) + '%)' });
            result.rawScore = Math.max(result.rawScore, 60);
            result.maxSeverity = this._maxSev(result.maxSeverity, 'high');
          }
        }
      }

      // D. Caps-lock
      if (originalText.length > 10) {
        const upper  = (originalText.match(/[A-ZÀÁÂÄÆÃÅÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜ]/g) || []).length;
        const letters = (originalText.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
        if (letters > 10 && upper / letters > 0.6) {
          result.flags.push({ type: 'caps', level: 'low', lang, label: 'CAPSLOCK eccessivo' });
          result.rawScore = Math.max(result.rawScore, 18);
        }
      }

      // E. Mix-lingua bypass: controlla se il testo usa parole offensive di una lingua diversa
      // da quella rilevata (es. "sei un asshole" = IT+EN). Già coperto da step A (scan tutte le lingue),
      // qui aggiungiamo un bonus score se vengono rilevate flag da più lingue contemporaneamente.
      if (result.flags.length >= 2) {
        const flagLangs = new Set(result.flags.filter(f=>f.lang).map(f=>f.lang));
        if (flagLangs.size >= 2) {
          result.flags.push({ type: 'cross_lang', level: 'high', lang, label: 'Mix-lingua (' + [...flagLangs].join('+') + ')' });
          result.rawScore = Math.min(100, result.rawScore + 10);
          result.maxSeverity = this._maxSev(result.maxSeverity, 'medium');
        }
      }

      return result;
    },

    _maxSev(current, candidate) {
      const order = ['none','low','medium','high','critical'];
      return order.indexOf(candidate) > order.indexOf(current) ? candidate : current;
    }
  };

  /* ── 5. SPAM DETECTOR ───────────────────────────────────── */
  const SpamDetector = {
    _hist: new Map(),
    _WIN: 30000, _FLOOD: 6, _DUP: 3,

    record(email, text, ts) {
      const k = (email||'anon').toLowerCase();
      if (!this._hist.has(k)) this._hist.set(k, []);
      const h = this._hist.get(k);
      h.push({ text: (text||'').toLowerCase(), ts: ts||Date.now() });
      const cut = Date.now() - 600000;
      this._hist.set(k, h.filter(m => m.ts > cut));
    },

    analyze(email, text) {
      const result = { flags: [], rawScore: 0 };
      const k = (email||'anon').toLowerCase();
      const h = this._hist.get(k) || [];
      const now = Date.now();
      const recent = h.filter(m => now - m.ts < this._WIN);
      if (recent.length >= this._FLOOD) {
        result.flags.push({ type: 'flood', label: recent.length + ' msg in 30s' });
        result.rawScore = Math.max(result.rawScore, Math.min(85, 55 + recent.length * 3));
      }
      const norm = (text||'').toLowerCase().trim();
      const dups = recent.filter(m => m.text === norm).length;
      if (dups >= this._DUP) {
        result.flags.push({ type: 'duplicate', label: 'Ripetuto ' + dups + 'x' });
        result.rawScore = Math.max(result.rawScore, 50 + dups * 8);
      }
      const links = (text||'').match(/https?:\/\/[^\s]+/g) || [];
      if (links.length >= 3) {
        result.flags.push({ type: 'multi_link', label: links.length + ' URL' });
        result.rawScore = Math.max(result.rawScore, 40);
      }
      return result;
    }
  };

  /* ── 6. LINK ANALYZER ───────────────────────────────────── */
  const LinkAnalyzer = {
    _short: ['bit.ly','tinyurl.com','t.co','ow.ly','buff.ly','goo.gl','is.gd','short.io','rb.gy'],
    _susp:  ['onlyfans.com','adult.','xxx.','sex.','pump.fun','t.me/'],
    _white: ['luxhaven360.com','luxhaven360.it','google.com','wikipedia.org','youtube.com'],

    analyze(text) {
      const result = { flags: [], rawScore: 0 };
      const urls = (text||'').match(/https?:\/\/[^\s]+/g) || [];
      for (const url of urls) {
        try {
          const host = new URL(url).hostname.toLowerCase();
          if (this._white.some(w => host === w || host.endsWith('.'+w))) continue;
          if (this._short.some(s => host === s || host.endsWith('.'+s))) {
            result.flags.push({ type: 'short_url', label: 'URL abbreviato: ' + host });
            result.rawScore = Math.max(result.rawScore, 30);
          }
          if (this._susp.some(s => host.includes(s) || url.includes(s))) {
            result.flags.push({ type: 'susp_url', label: 'URL sospetto: ' + host });
            result.rawScore = Math.max(result.rawScore, 50);
          }
        } catch(_) {}
      }
      return result;
    }
  };

  /* ── 7. USER RISK TRACKER ───────────────────────────────── */
  const UserRiskTracker = {
    _s: {},
    _load() { try { const r = localStorage.getItem(STORAGE_KEY_RISK); if (r) this._s = JSON.parse(r); } catch(_){} },
    _save() { try { localStorage.setItem(STORAGE_KEY_RISK, JSON.stringify(this._s)); } catch(_){} },
    get(email) { return this._s[(email||'anon').toLowerCase()] || { score: 0, violations: 0, lastUpdate: 0 }; },
    record(email, score, src) {
      const k = (email||'anon').toLowerCase();
      const p = this.get(email);
      const delta = score > 50 ? 25 : score > 30 ? 12 : score > 0 ? 5 : 0;
      const decay = Math.min((Date.now() - (p.lastUpdate||0)) / 3600000, p.score);
      this._s[k] = { score: Math.min(100, Math.max(0, p.score - decay + delta)), violations: p.violations + (delta>0?1:0), lastUpdate: Date.now(), lastSource: src };
      this._save();
      return this._s[k];
    },
    reduce(email, amt) {
      const k = (email||'anon').toLowerCase();
      if (this._s[k]) { this._s[k].score = Math.max(0, this._s[k].score - (amt||20)); this._save(); }
    }
  };

  /* ── 8. CONTEXT EVALUATOR ───────────────────────────────── */
  const ContextEvaluator = {
    evaluate(role) {
      if (role === 'team')     return 0.2;
      if (role === 'founding') return 0.75;
      return 1.0;
    }
  };

  /* ── 9. SCORING ENGINE ──────────────────────────────────── */
  const ScoringEngine = {
    compute(textR, spamR, linkR, userRisk, ctxMult) {
      const flags = [...(textR.flags||[]), ...(spamR.flags||[]), ...(linkR.flags||[])];
      let base = Math.max(textR.rawScore||0, spamR.rawScore||0, linkR.rawScore||0);
      if (flags.length > 2) base = Math.min(100, base + flags.length * 3);
      base = Math.min(100, base + Math.round((userRisk.score||0) * 0.2));
      const score = Math.round(Math.min(100, Math.max(0, base * ctxMult)));
      const level = score <= 20 ? 'safe' : score <= 50 ? 'suspect' : score <= 80 ? 'high' : 'critical';
      return { score, level, flags, detectedLang: textR.detectedLang || 'und' };
    }
  };

  /* ── 10. REVIEW QUEUE ───────────────────────────────────── */
  const ReviewQueue = {
    _q: [], _d: [],
    _load() {
      try {
        const q = localStorage.getItem(STORAGE_KEY_QUEUE); if (q) this._q = JSON.parse(q);
        const d = localStorage.getItem(STORAGE_KEY_DECISIONS); if (d) this._d = JSON.parse(d);
      } catch(_){}
    },
    _save() {
      try {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(this._q.slice(-MAX_QUEUE_SIZE)));
        localStorage.setItem(STORAGE_KEY_DECISIONS, JSON.stringify(this._d.slice(-MAX_DECISIONS_SIZE)));
      } catch(_){}
    },
    enqueue(e) { this._q.unshift(e); this._save(); this._badge(); },
    decide(id, decision, actor) {
      const i = this._q.findIndex(e => e.id === id);
      let entry = null;
      if (i !== -1) entry = this._q.splice(i, 1)[0];
      this._d.unshift({ ...(entry || {id}), decision, actor, decidedAt: Date.now() });
      this._save(); this._badge();
      return entry;
    },
    getQueue()     { return this._q.slice(); },
    getDecisions() { return this._d.slice(); },
    _badge() {
      if (typeof document === 'undefined') return;
      try {
        const b = document.getElementById('modBadge');
        if (!b) return;
        const n = this._q.length;
        if (n > 0) { b.textContent = n; b.classList.remove('hidden'); } else b.classList.add('hidden');
      } catch(_) {}
    }
  };

  /* ── 11. ACTION DISPATCHER ──────────────────────────────── */
  const ActionDispatcher = {
    dispatch(scoring, meta, userRisk) {
      const { score, level, flags, detectedLang } = scoring;
      const { sourceType, sourceId, authorName, authorEmail, text } = meta;
      if (level === 'safe') return { action: 'allow', score };

      const entry = {
        id: 'mod_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
        ts: Date.now(), score, level, flags,
        detectedLang: detectedLang || 'und',
        sourceType, sourceId: String(sourceId),
        authorName, authorEmail: authorEmail || '',
        contentSnippet: (text||'').substring(0, 150),
        action: null, reviewedBy: null
      };

      const langTag = detectedLang && detectedLang !== 'und' ? ' [' + detectedLang.toUpperCase() + ']' : '';

      if (level === 'suspect') {
        entry.action = 'flag';
        ReviewQueue.enqueue(entry);
        LearningAdapter.record(authorEmail, score, 'flag');
        return { action: 'flag', score, entry };
      }
      if (level === 'high') {
        entry.action = 'warn';
        ReviewQueue.enqueue(entry);
        LearningAdapter.record(authorEmail, score, 'warn');
        this._notify(authorName, sourceType, langTag);
        this._bridge(entry, 'Auto-mod: rischio alto' + langTag);
        this._notifyAuthor(authorEmail, 'high', sourceType);
        return { action: 'warn', score, entry };
      }
      if (level === 'critical') {
        entry.action = 'remove';
        ReviewQueue.enqueue(entry);
        LearningAdapter.record(authorEmail, score, 'remove');
        this._notify(authorName, sourceType, langTag);
        this._bridge(entry, 'Auto-mod: violazione grave' + langTag);
        this._hide(sourceType, sourceId);
        this._notifyAuthor(authorEmail, 'critical', sourceType);
        return { action: 'remove', score, entry };
      }
      return { action: 'allow', score };
    },

    _notify(name, src, tag) {
      if ((global.currentUser && global.currentUser.role) !== 'team') return;
      if (typeof global.showToast === 'function')
        global.showToast('amber', '🤖', 'Auto-mod' + tag + ': <strong>' + name + '</strong> (' + src + ')');
    },

    _hide(type, id) {
      if (typeof global._REMOVED_IDS !== 'undefined') {
        global._REMOVED_IDS.add(type + ':' + id);
        global._REMOVED_IDS.add(type + ':' + Number(id));
      }
    },

    // Notifica silenziosa all'autore del contenuto rimosso/segnalato.
    // Appare nella campanella notifiche dell'utente, non come toast invasivo.
    _notifyAuthor(authorEmail, level, sourceType) {
      if (!authorEmail || authorEmail === 'system') return;
      if (!global._sbReady || !global._sb) return;
      const typeLabel = sourceType === 'dm_message'  ? 'messaggio privato'
                      : sourceType === 'fc_message'  ? 'messaggio nel canale Founding'
                      : sourceType === 'comment'     ? 'commento'
                      : sourceType === 'reply'       ? 'risposta'
                      : sourceType === 'thread'      ? 'thread'
                      : 'contenuto';
      const text = level === 'critical'
        ? `Il tuo ${typeLabel} è stato rimosso automaticamente per violazione delle linee guida della community.`
        : `Il tuo ${typeLabel} è stato segnalato per revisione da parte del team.`;
      try {
        global._sb.from('notifications').insert({
          user_email:   authorEmail.toLowerCase(),
          author_email: 'system@luxhaven360.com',
          icon:         level === 'critical' ? 'red' : 'amber',
          emoji:        level === 'critical' ? '🚫' : '⚠️',
          text:         text,
          created_at:   new Date().toISOString(),
          read:         false
        }).then(null, () => {});
      } catch(_e) {}
    },

    _bridge(entry, label) {
      if (!Array.isArray(global.REPORTS)) return;
      if (global.REPORTS.some(r => String(r.sourceId) === String(entry.sourceId) && r.sourceType === entry.sourceType)) return;
      const report = {
        id: entry.id, type: label,
        reporter: '🤖 Auto-mod', reporterEmail: 'system',
        target: entry.sourceType + ' di ' + entry.authorName,
        content: entry.contentSnippet,
        time: 'Ora', ts: entry.ts,
        sourceType: entry.sourceType, sourceId: entry.sourceId,
        authorName: entry.authorName, authorEmail: entry.authorEmail,
        isAuto: true,
        severity: entry.level === 'critical' ? 'critical' : entry.level === 'high' ? 'high' : 'medium',
        detectedLang: entry.detectedLang,
        modFlags: entry.flags.map(f => f.label)
      };
      global.REPORTS.push(report);
      if (typeof global.saveModData === 'function') global.saveModData();
      if (typeof global._writeReportToSupabase === 'function') global._writeReportToSupabase(report);
    }
  };

  /* ── 12. LEARNING ADAPTER ───────────────────────────────── */
  const LearningAdapter = {
    _d: {},
    _load() { try { const r = localStorage.getItem(STORAGE_KEY_LEARNING); if (r) this._d = JSON.parse(r); } catch(_){} },
    _save() { try { localStorage.setItem(STORAGE_KEY_LEARNING, JSON.stringify(this._d)); } catch(_){} },
    record(email, score, action) {
      const k = (email||'anon').toLowerCase();
      if (!this._d[k]) this._d[k] = { totalFlags: 0, removes: 0, warns: 0, flags: 0, lastSeen: 0 };
      this._d[k].totalFlags++;
      this._d[k][action] = (this._d[k][action] || 0) + 1;
      this._d[k].lastSeen = Date.now();
      this._save();
      UserRiskTracker.record(email, score, action);
    },
    getSensitivityMultiplier(email) {
      const d = this._d[(email||'anon').toLowerCase()];
      if (!d) return 1.0;
      return Math.min(2.0, 1.0 + (d.removes||0) * 0.15 + (d.warns||0) * 0.08 + (d.flags||0) * 0.04);
    }
  };

  /* ── 13. MOD BRIDGE ─────────────────────────────────────── */
  const ModBridge = {
    _init: false,

    init() {
      if (this._init) return;
      UserRiskTracker._load();
      ReviewQueue._load();
      LearningAdapter._load();
      this._init = true;
      console.info('[LH360Mod] v3.0 multilingual initialized — IT EN FR DE ES');
    },

    _runPipeline(text, sourceType, sourceId, authorName, authorEmail, authorRole) {
      const role = authorRole || 'candidate';
      if (role === 'team') return { action: 'allow', score: 0, level: 'safe', flags: [], detectedLang: 'und' };

      const safeId = String(sourceId || Date.now());
      SpamDetector.record(authorEmail, text, Date.now());

      const textR  = TextAnalyzer.analyze(text);
      const spamR  = SpamDetector.analyze(authorEmail, text);
      const linkR  = LinkAnalyzer.analyze(text);
      const risk   = UserRiskTracker.get(authorEmail);
      const ctx    = ContextEvaluator.evaluate(role);
      const learn  = LearningAdapter.getSensitivityMultiplier(authorEmail);

      const raw    = ScoringEngine.compute(textR, spamR, linkR, risk, ctx);
      const adj    = Math.min(100, Math.round(raw.score * learn));
      const level  = adj <= 20 ? 'safe' : adj <= 50 ? 'suspect' : adj <= 80 ? 'high' : 'critical';
      const final  = { ...raw, score: adj, level };

      const out = ActionDispatcher.dispatch(final, {
        sourceType, sourceId: safeId,
        authorName: authorName || 'Utente',
        authorEmail: authorEmail || '',
        text
      }, risk);

      return { action: out.action, score: final.score, level: final.level, flags: final.flags, detectedLang: final.detectedLang, entry: out.entry || null };
    },

    moderateText(text, type, id, name, email, role) {
      try { return this._runPipeline(text, type, id, name, email, role); }
      catch(e) { console.warn('[LH360Mod]', e); return { action: 'allow', score: 0, level: 'safe', flags: [] }; }
    },

    scanBatch(items) {
      return items.map(i => this._runPipeline(i.text, i.sourceType, i.sourceId, i.authorName, i.authorEmail, i.authorRole));
    },

    getReviewQueue()  { return ReviewQueue.getQueue(); },
    getDecisionLog()  { return ReviewQueue.getDecisions(); },
    resolveItem(id, decision, actor) {
      const e = ReviewQueue.decide(id, decision, actor || 'Team');
      if (e && decision === 'approve') UserRiskTracker.reduce(e.authorEmail, 15);
      return e;
    },
    getUserRisk(email)       { return UserRiskTracker.get(email); },
    reduceUserRisk(email, n) { UserRiskTracker.reduce(email, n || 20); },
    detectLang(text)         { return LanguageDetector.detect(text); }
  };

  /* ── INIT & EXPORT ──────────────────────────────────────── */
  ModBridge.init();

  global.LH360Mod = {
    moderate:       ModBridge.moderateText.bind(ModBridge),
    scanBatch:      ModBridge.scanBatch.bind(ModBridge),
    getReviewQueue: ModBridge.getReviewQueue.bind(ModBridge),
    getDecisionLog: ModBridge.getDecisionLog.bind(ModBridge),
    resolveItem:    ModBridge.resolveItem.bind(ModBridge),
    getUserRisk:    ModBridge.getUserRisk.bind(ModBridge),
    reduceUserRisk: ModBridge.reduceUserRisk.bind(ModBridge),
    detectLang:     ModBridge.detectLang.bind(ModBridge),
    _modules: { TextNormalizer, LanguageDetector, MultiLangBlacklist, TextAnalyzer,
                SpamDetector, LinkAnalyzer, UserRiskTracker, ContextEvaluator,
                ScoringEngine, ActionDispatcher, ReviewQueue, LearningAdapter }
  };

  /* Drop-in replacement per autoModerateText — firma identica alla v1 */
  global.autoModerateText = function(text, sourceType, sourceId, authorName, authorEmail) {
    const role = (global.currentUser && global.currentUser.role) || 'candidate';
    if (role === 'team') return; // team non moderato
    ModBridge.moderateText(text, sourceType, sourceId, authorName, authorEmail, role);
  };

})(window);

/*
 * Lingue supportate: IT · EN · FR · DE · ES
 * Mix-lingua bypass: rilevato e penalizzato automaticamente
 * Fuzzy matching: ~25 parole chiave cross-lingua (Levenshtein)
 * LanguageDetector: offline, basato su marker statistici
 * Team bypass: contenuti del team esclusi dalla moderazione
 */
