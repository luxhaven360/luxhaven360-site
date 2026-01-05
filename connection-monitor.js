/**
 * LuxHaven360 - Connection Monitor v2 (FIXED)
 * Fix: CORS, notifica verde, gestione errori migliorata
 */

class LuxHavenConnectionMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionQuality = 'unknown';
        this.previousQuality = 'unknown'; // ⭐ NUOVO: traccia stato precedente
        this.hasShownWarning = false;
        this.checkInterval = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.wasOffline = false; // ⭐ NUOVO: flag per tracciare se eravamo offline
        
        this.init();
    }

    init() {
        // Event listeners per cambio stato online/offline
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Check iniziale (silenzioso al primo caricamento)
        this.checkConnection(true);
        
        // Check periodico ogni 30 secondi
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
     * ⭐ FIXED: Verifica connessione con endpoint affidabile (no CORS)
     */
    async checkConnection(silent = false) {
        if (!navigator.onLine) {
            this.updateConnectionStatus('offline', silent);
            return;
        }

        try {
            const startTime = performance.now();
            
            // ✅ FIX: Uso favicon.ico di Google (piccolo, veloce, no CORS)
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors', // ⭐ Evita errori CORS
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            
            const endTime = performance.now();
            const latency = endTime - startTime;

            // ⭐ Con mode: 'no-cors', response.ok è sempre false ma type sarà 'opaque' se successo
            // Quindi basiamoci solo sulla latenza se non abbiamo errori
            
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
            this.retryAttempts = 0;
            
        } catch (error) {
            // ⭐ Gestione errori silenziosa (no console spam)
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
     * ⭐ FIXED: Aggiorna stato e gestisce notifica riconnessione
     */
    updateConnectionStatus(quality, silent = false) {
        this.previousQuality = this.connectionQuality;
        this.connectionQuality = quality;

        // ⭐ FIX: Traccia se eravamo offline
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
            
            // ⭐ FIX: Mostra notifica SOLO se eravamo davvero offline
            if (this.wasOffline && (this.previousQuality === 'offline' || this.previousQuality === 'unknown')) {
                this.showReconnectedNotification();
                this.wasOffline = false; // Reset flag
            }
        }
    }

    /**
     * ⭐ FIXED: Gestisce evento ritorno online
     */
    handleOnline() {
        this.isOnline = true;
        console.log('✅ Evento browser: online');
        
        // Check immediato quando torniamo online
        setTimeout(() => {
            this.checkConnection();
        }, 500); // Piccolo delay per stabilizzazione
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
        // Rimuovi avvisi esistenti
        this.hideAllWarnings();

        const warningHTML = `
            <div id="lh-connection-warning" class="lh-connection-banner weak">
                <div class="lh-banner-content">
                    <div class="lh-banner-icon">⚠️</div>
                    <div class="lh-banner-text">
                        <strong>Connessione ${quality === 'fair' ? 'Lenta' : 'Instabile'}</strong>
                        <span>Potrebbero verificarsi rallentamenti durante la navigazione</span>
                    </div>
                    <button class="lh-banner-close" onclick="luxConnectionMonitor.dismissWarning()">×</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', warningHTML);
        
        // Animazione entrata
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
        // Rimuovi avvisi esistenti
        this.hideAllWarnings();

        const errorHTML = `
            <div id="lh-connection-error" class="lh-connection-overlay">
                <div class="lh-error-card">
                    <div class="lh-error-icon">📡</div>
                    <h2 class="lh-error-title">Connessione Assente</h2>
                    <p class="lh-error-text">
                        Impossibile connettersi a Internet.<br>
                        Verifica la tua connessione e ricarica la pagina.
                    </p>
                    <button class="lh-error-btn" onclick="window.location.reload()">
                        🔄 Ricarica Pagina
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', errorHTML);
        
        // Animazione entrata
        setTimeout(() => {
            const overlay = document.getElementById('lh-connection-error');
            if (overlay) overlay.classList.add('show');
        }, 100);
    }

    /**
     * ⭐ FIXED: Mostra notifica breve di riconnessione
     */
    showReconnectedNotification() {
        console.log('✅ Mostro notifica riconnessione');
        
        const notifHTML = `
            <div id="lh-reconnect-notif" class="lh-connection-banner success">
                <div class="lh-banner-content">
                    <div class="lh-banner-icon">✓</div>
                    <div class="lh-banner-text">
                        <strong>Connessione Ristabilita</strong>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', notifHTML);
        
        setTimeout(() => {
            const notif = document.getElementById('lh-reconnect-notif');
            if (notif) notif.classList.add('show');
        }, 100);

        // Auto-dismiss dopo 4 secondi
        setTimeout(() => {
            const notif = document.getElementById('lh-reconnect-notif');
            if (notif) {
                notif.classList.remove('show');
                setTimeout(() => notif.remove(), 500);
            }
        }, 4000);
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
     * ⭐ FIXED: Intercetta fetch con gestione errori migliorata
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
                // ⭐ Log silenzioso per errori di rete
                console.debug('Fetch intercepted error:', error.message);
                
                // Incrementa tentativi
                self.retryAttempts++;
                
                // Se troppi fallimenti, verifica connessione (silenzioso)
                if (self.retryAttempts >= 2) {
                    self.checkConnection(true);
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

// ⭐ Inizializza monitor globale
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
