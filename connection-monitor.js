/**
 * LuxHaven360 - Connection Monitor
 * Sistema professionale di monitoraggio connessione e gestione errori di rete
 */

class LuxHavenConnectionMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionQuality = 'good'; // good, fair, poor, offline
        this.hasShownWarning = false;
        this.checkInterval = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    init() {
        // Event listeners per cambio stato online/offline
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Check iniziale
        this.checkConnection();
        
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
     * Verifica qualità connessione con ping test
     */
    async checkConnection() {
        if (!navigator.onLine) {
            this.updateConnectionStatus('offline');
            return;
        }

        try {
            const startTime = performance.now();
            
            // Ping a un endpoint veloce (Google Fonts CSS - leggero e affidabile)
            const response = await fetch('https://fonts.googleapis.com/css', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000) // Timeout 5s
            });
            
            const endTime = performance.now();
            const latency = endTime - startTime;

            if (!response.ok) {
                throw new Error('Network response not ok');
            }

            // Determina qualità in base a latenza
            if (latency < 500) {
                this.updateConnectionStatus('good');
            } else if (latency < 1500) {
                this.updateConnectionStatus('fair');
            } else {
                this.updateConnectionStatus('poor');
            }

            this.retryAttempts = 0; // Reset retry counter
            
        } catch (error) {
            console.warn('Connection check failed:', error);
            
            // Se fallisce, considera connessione poor/offline
            if (navigator.onLine) {
                this.updateConnectionStatus('poor');
            } else {
                this.updateConnectionStatus('offline');
            }
        }
    }

    /**
     * Aggiorna stato connessione e mostra/nascondi avvisi
     */
    updateConnectionStatus(quality) {
        const previousQuality = this.connectionQuality;
        this.connectionQuality = quality;

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
            
            // Mostra notifica di riconnessione se era offline
            if (previousQuality === 'offline') {
                this.showReconnectedNotification();
            }
        }
    }

    /**
     * Gestisce evento ritorno online
     */
    handleOnline() {
        this.isOnline = true;
        console.log('✅ Connessione ristabilita');
        this.checkConnection();
    }

    /**
     * Gestisce evento offline
     */
    handleOffline() {
        this.isOnline = false;
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
     * Mostra notifica breve di riconnessione
     */
    showReconnectedNotification() {
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

        // Auto-dismiss dopo 3 secondi
        setTimeout(() => {
            const notif = document.getElementById('lh-reconnect-notif');
            if (notif) {
                notif.classList.remove('show');
                setTimeout(() => notif.remove(), 500);
            }
        }, 3000);
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
     * Intercetta chiamate fetch per gestire errori di rete
     */
    monitorFetchCalls() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                // Se risposta OK, reset retry counter
                if (response.ok) {
                    this.retryAttempts = 0;
                }
                
                return response;
            } catch (error) {
                console.error('Fetch failed:', error);
                
                // Incrementa tentativi
                this.retryAttempts++;
                
                // Se troppi fallimenti, verifica connessione
                if (this.retryAttempts >= 2) {
                    await this.checkConnection();
                }
                
                // Se offline, mostra errore
                if (!navigator.onLine) {
                    this.showOfflineError();
                }
                
                throw error; // Rilancia errore per gestione upstream
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

// Inizializza monitor globale
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
