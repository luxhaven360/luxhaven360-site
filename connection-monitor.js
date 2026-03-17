/**
 * LuxHaven360 - Connection Monitor v3 (OPTIMIZED)
 * ✨ Miglioramenti:
 * - Check intelligente: avvisa rapidamente solo se connessione davvero lenta
 * - Ridotti falsi positivi al primo caricamento
 * - Notifica verde solo per riconnessioni reali
 * - Traduzioni self-contained: funziona su ogni pagina indipendentemente dal sistema i18n
 */

/* ──────────────────────────────────────────────────────────────
   TRADUZIONI SELF-CONTAINED
   Non dipende da nessun sistema i18n esterno.
   Legge la lingua attiva da localStorage ('lh360_lang').
────────────────────────────────────────────────────────────── */
const _CM_TRANSLATIONS = {
    it: {
        slow:          'Connessione Lenta',
        unstable:      'Connessione Instabile',
        warning_text:  'Potrebbero verificarsi rallentamenti durante la navigazione',
        offline_title: 'Connessione Assente',
        offline_text:  'Impossibile connettersi a Internet.<br>Verifica la tua connessione e ricarica la pagina.',
        offline_btn:   'Ricarica Pagina',
        restored:      'Connessione Ristabilita',
    },
    en: {
        slow:          'Slow Connection',
        unstable:      'Unstable Connection',
        warning_text:  'You may experience slowdowns while browsing',
        offline_title: 'No Connection',
        offline_text:  'Unable to connect to the Internet.<br>Check your connection and reload the page.',
        offline_btn:   'Reload Page',
        restored:      'Connection Restored',
    },
    fr: {
        slow:          'Connexion Lente',
        unstable:      'Connexion Instable',
        warning_text:  'Des ralentissements pourraient se produire lors de la navigation',
        offline_title: 'Connexion Absente',
        offline_text:  'Impossible de se connecter à Internet.<br>Vérifiez votre connexion et rechargez la page.',
        offline_btn:   'Recharger la Page',
        restored:      'Connexion Rétablie',
    },
    de: {
        slow:          'Langsame Verbindung',
        unstable:      'Instabile Verbindung',
        warning_text:  'Beim Surfen können Verlangsamungen auftreten',
        offline_title: 'Keine Verbindung',
        offline_text:  'Keine Internetverbindung möglich.<br>Prüfen Sie Ihre Verbindung und laden Sie die Seite neu.',
        offline_btn:   'Seite Neu Laden',
        restored:      'Verbindung Wiederhergestellt',
    },
    es: {
        slow:          'Conexión Lenta',
        unstable:      'Conexión Inestable',
        warning_text:  'Pueden producirse ralentizaciones durante la navegación',
        offline_title: 'Sin Conexión',
        offline_text:  'No es posible conectarse a Internet.<br>Comprueba tu conexión y recarga la página.',
        offline_btn:   'Recargar Página',
        restored:      'Conexión Restablecida',
    },
};

/**
 * Restituisce il dizionario di stringhe per la lingua attiva.
 * Legge da localStorage (chiave 'lh360_lang') — funziona su tutte le pagine.
 */
function _cmT() {
    let lang = 'it';
    try { lang = localStorage.getItem('lh360_lang') || 'it'; } catch(e) {}
    return _CM_TRANSLATIONS[lang] || _CM_TRANSLATIONS.it;
}

class LuxHavenConnectionMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionQuality = 'unknown';
        this.previousQuality = 'unknown';
        this.hasShownWarning = false;
        this.checkInterval = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.wasOffline = false;
        this.initialCheckDone = false; // 🆕 Flag per primo check
        this._pendingAbortControllers = new Set(); // 🆕 BFCache: traccia fetch attivi
        
        this.init();
    }

    init() {
        // Event listeners per cambio stato online/offline
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Listener per cambio lingua
        document.addEventListener('languageChanged', () => {
           console.log('🌐 Lingua cambiata, aggiorno avvisi connessione');
           this.updateWarningsLanguage();
        });

        // Hook per sistemi i18n che non sparano 'languageChanged' DOM event
        // (es. community-hub usa window.I18n con listeners interni)
        if (typeof window.I18n !== 'undefined' && typeof window.I18n.onLanguageChange === 'function') {
            window.I18n.onLanguageChange(() => this.updateWarningsLanguage());
        } else {
            // Se I18n non è ancora disponibile al momento dell'init, aspetta DOMContentLoaded
            document.addEventListener('DOMContentLoaded', () => {
                if (typeof window.I18n !== 'undefined' && typeof window.I18n.onLanguageChange === 'function') {
                    window.I18n.onLanguageChange(() => this.updateWarningsLanguage());
                }
            });
        }
        
        // ✅ BFCACHE FIX:
        // "beforeunload" disabilita la BFCache di Chrome → causa RESULT_CODE_HUNG.
        // Usiamo "pagehide" che è compatibile con BFCache e cancelliamo le fetch attive.
        window.addEventListener('pagehide', () => {
            this.destroy();
        });

        // Quando la pagina viene ripristinata dalla BFCache, reinizializziamo
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // La pagina è stata ripristinata dalla BFCache: reinizializziamo il monitor
                this.isOnline = navigator.onLine;
                this.hasShownWarning = false;
                this.initialCheckDone = false;
                this._pendingAbortControllers = new Set();
                if (this.isOnline) {
                    setTimeout(() => this.checkConnection(true), 500);
                }
            }
        });
        
        // ✅ STRATEGIA OTTIMIZZATA:
        // 1. Check iniziale silenzioso (evita flash avvisi)
        this.checkConnection(true);
        
        // 2. Check di conferma dopo 3s (mostra avviso se problema persiste)
        setTimeout(() => {
            if (this.isOnline && !this.initialCheckDone) {
                this.checkConnection(false);
                this.initialCheckDone = true;
            }
        }, 3000);
        
        // 3. Check periodico ogni 30 secondi
        this.checkInterval = setInterval(() => {
            if (this.isOnline) {
                this.checkConnection();
            }
        }, 30000);
        
        // Monitor prima di chiamate fetch
        this.monitorFetchCalls();
        
        // Check su visibility change (utente torna sulla tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.checkConnection();
            }
        });
    }

    /**
     * ✅ Verifica connessione con endpoint affidabile (no CORS)
     * @param {boolean} silent - Se true, non mostra avvisi (usato al primo caricamento)
     */
    async checkConnection(silent = false) {
        if (!navigator.onLine) {
            this.updateConnectionStatus('offline', silent);
            return;
        }

        try {
            const startTime = performance.now();
            
            // 🆕 BFCache: usa AbortController per poter cancellare la fetch su pagehide
            const ac = new AbortController();
            this._pendingAbortControllers.add(ac);

            // Test ping a Google favicon (piccolo, veloce, no CORS)
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                signal: ac.signal
            });
            
            this._pendingAbortControllers.delete(ac);
            const endTime = performance.now();
            const latency = endTime - startTime;

            // Determina qualità in base a latenza
            let quality;
            if (latency < 500) {
                quality = 'good';
            } else if (latency < 1500) {
                quality = 'fair';
            } else {
                quality = 'poor';
            }

            this.updateConnectionStatus(quality, silent);
            
            // 🆕 CHECK INTELLIGENTE: Se primo check silenzioso rileva problema,
            // rifai check dopo 2s per confermare e mostrare avviso
            if (silent && !this.initialCheckDone && (quality === 'fair' || quality === 'poor')) {
                console.log(`⚠️ Primo check: connessione ${quality} (latenza: ${latency.toFixed(0)}ms). Verifico tra 2s...`);
                setTimeout(() => {
                    if (this.isOnline && !this.initialCheckDone) {
                        this.checkConnection(false); // Check NON silenzioso
                        this.initialCheckDone = true;
                    }
                }, 2000);
            }
            
            this.retryAttempts = 0;
            
        } catch (error) {
            // Ignora AbortError (fetch cancellata su pagehide, normale per BFCache)
            if (error.name === 'AbortError') return;
            
            // Log silenzioso per errori di rete
            if (!silent) {
                console.debug('Connection check:', error.message);
            }
            
            // Se fallisce, considera connessione poor/offline
            if (navigator.onLine) {
                this.updateConnectionStatus('poor', silent);
            } else {
                this.updateConnectionStatus('offline', silent);
            }
        }
    }

    /**
     * ✅ Aggiorna stato e gestisce notifica riconnessione
     */
    updateConnectionStatus(quality, silent = false) {
        this.previousQuality = this.connectionQuality;
        this.connectionQuality = quality;

        // Traccia se eravamo offline
        if (quality === 'offline') {
            this.wasOffline = true;
        }

        // Non mostrare avvisi se è il primo check silenzioso
        if (silent && quality !== 'offline') {
            return;
        }

        // Mostra avviso se connessione degrada
        if (quality === 'offline') {
            this.showOfflineError();
        } else if (quality === 'poor' || quality === 'fair') {
            if (!this.hasShownWarning) {
                this.showWeakConnectionWarning(quality);
            }
        } else if (quality === 'good') {
            // Rimuovi avvisi se connessione migliora
            this.hideAllWarnings();
            
            // ✅ Mostra notifica SOLO se eravamo davvero offline
            if (this.wasOffline && this.previousQuality === 'offline') {
                this.showReconnectedNotification();
                this.wasOffline = false;
            }
        }
    }

    /**
     * ✅ Gestisce evento ritorno online
     */
    handleOnline() {
        this.isOnline = true;
        console.log('✅ Evento browser: online');
        
        // Check immediato quando torniamo online
        setTimeout(() => {
            this.checkConnection();
        }, 500);
    }

    /**
     * Gestisce evento offline
     */
    handleOffline() {
        this.isOnline = false;
        this.wasOffline = true;
        console.log('❌ Evento browser: offline');
        this.updateConnectionStatus('offline');
    }

    /**
     * Mostra avviso connessione debole/lenta
     */
    showWeakConnectionWarning(quality) {
    this.hideAllWarnings();

    const t = _cmT();
    const title = quality === 'fair' ? t.slow : t.unstable;
    const text = t.warning_text;

    const warningHTML = `
        <div id="lh-connection-warning" class="lh-connection-banner weak">
            <div class="lh-banner-content">
                <div class="lh-banner-icon">⚠️</div>
                <div class="lh-banner-text">
                    <strong>${title}</strong>
                    <span>${text}</span>
                </div>
                <button class="lh-banner-close" onclick="luxConnectionMonitor.dismissWarning()">×</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', warningHTML);
    
    setTimeout(() => {
        const banner = document.getElementById('lh-connection-warning');
        if (banner) banner.classList.add('show');
    }, 100);

    this.hasShownWarning = true;
}

    /**
     * Mostra errore connessione assente
     */
    showOfflineError() {
    this.hideAllWarnings();

    const t = _cmT();
    const title = t.offline_title;
    const text = t.offline_text;
    const btnText = t.offline_btn;

    const errorHTML = `
        <div id="lh-connection-error" class="lh-connection-overlay">
            <div class="lh-error-card">
                <div class="lh-error-icon">📡</div>
                <h2 class="lh-error-title">${title}</h2>
                <p class="lh-error-text">${text}</p>
                <button class="lh-error-btn" onclick="window.location.reload()">
                    🔄 ${btnText}
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', errorHTML);
    
    setTimeout(() => {
        const overlay = document.getElementById('lh-connection-error');
        if (overlay) overlay.classList.add('show');
    }, 100);
}

    /**
     * ✅ Mostra notifica breve di riconnessione (verde)
     */
    showReconnectedNotification() {
    console.log('✅ Mostro notifica riconnessione');
    
    const title = _cmT().restored;
    
    const notifHTML = `
        <div id="lh-reconnect-notif" class="lh-connection-banner success">
            <div class="lh-banner-content">
                <div class="lh-banner-icon">✓</div>
                <div class="lh-banner-text">
                    <strong>${title}</strong>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', notifHTML);
    
    setTimeout(() => {
        const notif = document.getElementById('lh-reconnect-notif');
        if (notif) notif.classList.add('show');
    }, 100);

    setTimeout(() => {
        const notif = document.getElementById('lh-reconnect-notif');
        if (notif) {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 500);
        }
    }, 4000);
}

    /**
 * ✅ NUOVA FUNZIONE: Aggiorna lingua avvisi visibili
 */
updateWarningsLanguage() {
    const t = _cmT();

    // Aggiorna avviso connessione debole/lenta
    const warningBanner = document.getElementById('lh-connection-warning');
    if (warningBanner && warningBanner.classList.contains('show')) {
        const titleEl = warningBanner.querySelector('.lh-banner-text strong');
        const textEl  = warningBanner.querySelector('.lh-banner-text span');
        if (titleEl) titleEl.textContent = this.connectionQuality === 'fair' ? t.slow : t.unstable;
        if (textEl)  textEl.textContent  = t.warning_text;
    }

    // Aggiorna overlay errore offline
    const errorOverlay = document.getElementById('lh-connection-error');
    if (errorOverlay && errorOverlay.classList.contains('show')) {
        const errorTitle = errorOverlay.querySelector('.lh-error-title');
        const errorText  = errorOverlay.querySelector('.lh-error-text');
        const errorBtn   = errorOverlay.querySelector('.lh-error-btn');
        if (errorTitle) errorTitle.textContent = t.offline_title;
        if (errorText)  errorText.innerHTML    = t.offline_text;
        if (errorBtn)   errorBtn.innerHTML     = `🔄 ${t.offline_btn}`;
    }

    // Aggiorna notifica riconnessione (se visibile)
    const reconnectNotif = document.getElementById('lh-reconnect-notif');
    if (reconnectNotif && reconnectNotif.classList.contains('show')) {
        const titleEl = reconnectNotif.querySelector('.lh-banner-text strong');
        if (titleEl) titleEl.textContent = t.restored;
    }
}

    /**
     * Nascondi tutti gli avvisi
     */
    hideAllWarnings() {
        ['lh-connection-warning', 'lh-connection-error', 'lh-reconnect-notif'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('show');
                setTimeout(() => el.remove(), 500);
            }
        });
        this.hasShownWarning = false;
    }

    /**
     * Dismiss manuale avviso
     */
    dismissWarning() {
        this.hideAllWarnings();
    }

    /**
     * ✅ Intercetta fetch con gestione errori migliorata
     */
    monitorFetchCalls() {
        const originalFetch = window.fetch;
        window._originalFetch = originalFetch;
        const self = this;
        
        window.fetch = async function(...args) {
            try {
                const response = await originalFetch.apply(this, args);
                
                // Se risposta OK, reset retry counter
                if (response.ok) {
                    self.retryAttempts = 0;
                }
                
                return response;
            } catch (error) {
                // Log silenzioso per errori di rete
                console.debug('Fetch intercepted error:', error.message);
                
                // Incrementa tentativi
                self.retryAttempts++;
                
                // Se troppi fallimenti, verifica connessione
                if (self.retryAttempts >= 2) {
                    self.checkConnection(false); // NON silenzioso
                }
                
                // Se offline, mostra errore
                if (!navigator.onLine) {
                    self.showOfflineError();
                }
                
                throw error;
            }
        };
    }

    /**
     * Cleanup risorse — compatibile con BFCache (chiamato su pagehide)
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        // 🆕 Cancella tutte le fetch pendenti per sbloccare BFCache
        if (this._pendingAbortControllers) {
            this._pendingAbortControllers.forEach(ac => {
                try { ac.abort(); } catch(e) {}
            });
            this._pendingAbortControllers.clear();
        }
        this.hideAllWarnings();
    }
}

// ✅ Inizializza monitor globale
let luxConnectionMonitor;

// Init quando DOM pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        luxConnectionMonitor = new LuxHavenConnectionMonitor();
    });
} else {
    luxConnectionMonitor = new LuxHavenConnectionMonitor();
}

// ✅ Il cleanup è gestito via 'pagehide' all'interno della classe (compatibile BFCache).
// NON registriamo 'beforeunload' qui: farlo disabiliterebbe la BFCache di Chrome
// e causerebbe RESULT_CODE_HUNG al ritorno dalla navigazione.
