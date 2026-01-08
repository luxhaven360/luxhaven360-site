/**
 * LuxHaven360 - Connection Monitor v3 (OPTIMIZED)
 * ✨ Miglioramenti:
 * - Check intelligente: avvisa rapidamente solo se connessione davvero lenta
 * - Ridotti falsi positivi al primo caricamento
 * - Notifica verde solo per riconnessioni reali
 */

    /**
 * Helper: Ottiene istanza i18n corretta in base alla pagina
 */
function getI18nInstance() {
    // Prova prima i18nPDP (pdp-products.html), poi i18n (index.html)
    return window.i18nPDP?.() || window.i18n?.() || null;
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
            
            // Test ping a Google favicon (piccolo, veloce, no CORS)
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            
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
            // Gestione errori silenziosa (no console spam)
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

    const i18n = getI18nInstance(); // ✅ MODIFICATO
    const titleKey = quality === 'fair' ? 'connection_slow' : 'connection_unstable';
    const title = i18n ? i18n.t(titleKey) : (quality === 'fair' ? 'Connessione Lenta' : 'Connessione Instabile');
    const text = i18n ? i18n.t('connection_warning_text') : 'Potrebbero verificarsi rallentamenti durante la navigazione';

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

    const i18n = getI18nInstance(); // ✅ MODIFICATO
    const title = i18n ? i18n.t('connection_offline_title') : 'Connessione Assente';
    const text = i18n ? i18n.t('connection_offline_text') : 'Impossibile connettersi a Internet.<br>Verifica la tua connessione e ricarica la pagina.';
    const btnText = i18n ? i18n.t('connection_offline_btn') : 'Ricarica Pagina';

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
    
    const i18n = getI18nInstance(); // ✅ MODIFICATO
    const title = i18n ? i18n.t('connection_restored') : 'Connessione Ristabilita';
    
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
    const i18n = getI18nInstance(); // ✅ AGGIUNTO all'inizio
    
    // Aggiorna avviso connessione debole/lenta
    const warningBanner = document.getElementById('lh-connection-warning');
    if (warningBanner && warningBanner.classList.contains('show')) {
        const title = warningBanner.querySelector('.lh-banner-text strong');
        const text = warningBanner.querySelector('.lh-banner-text span');
        
        if (title && text) {
            const titleKey = this.connectionQuality === 'fair' ? 'connection_slow' : 'connection_unstable';
            title.textContent = i18n ? i18n.t(titleKey) : title.textContent;
            text.textContent = i18n ? i18n.t('connection_warning_text') : text.textContent;
        }
    }
    
    // Aggiorna overlay errore offline
const errorOverlay = document.getElementById('lh-connection-error');
if (errorOverlay && errorOverlay.classList.contains('show')) {
    const errorTitle = errorOverlay.querySelector('.lh-error-title');
    const errorText = errorOverlay.querySelector('.lh-error-text');
    const errorBtn = errorOverlay.querySelector('.lh-error-btn');
    
    if (errorTitle) {
        errorTitle.textContent = i18n ? i18n.t('connection_offline_title') : errorTitle.textContent;
    }
    if (errorText) {
        const text = i18n ? i18n.t('connection_offline_text') : errorText.innerHTML;
        errorText.innerHTML = text;
    }
    if (errorBtn) {
        const btnText = i18n ? i18n.t('connection_offline_btn') : 'Ricarica Pagina';
        // Mantieni l'emoji 🔄 e aggiorna solo il testo
        errorBtn.innerHTML = `🔄 ${btnText}`;
    }
}
    
    // Aggiorna notifica riconnessione (se visibile)
    const reconnectNotif = document.getElementById('lh-reconnect-notif');
    if (reconnectNotif && reconnectNotif.classList.contains('show')) {
        const title = reconnectNotif.querySelector('.lh-banner-text strong');
        if (title) {
            title.textContent = window.i18n ? window.i18n().t('connection_restored') : title.textContent;
        }
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
     * Cleanup risorse
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
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

// Cleanup su unload
window.addEventListener('beforeunload', () => {
    if (luxConnectionMonitor) {
        luxConnectionMonitor.destroy();
    }
});
