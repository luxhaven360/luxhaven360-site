// ==================================================================
// 1. NAVIGAZIONE & UI (Logica originale mantenuta)
// ==================================================================

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section, .hero').forEach(s => s.classList.remove('active'));
    
    if (sectionId === 'home') {
        document.querySelector('.hero').style.display = 'flex';
    } else {
        document.querySelector('.hero').style.display = 'none';
        const el = document.getElementById(sectionId);
        if (el) el.classList.add('active');
    }
    
    // Close mobile menu
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.getElementById('navLinks');
    const toggle = document.querySelector('.mobile-toggle');
    if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});


// ==================================================================
// 2. GESTIONE PRODOTTI DA GOOGLE SHEET (Nuova Logica)
// ==================================================================

// URL del Google Apps Script (Backend)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKoAiuDQ1uG4WS8Jp1TvvWu30kANX1T2erTJuy7q8N2ND9_mq4qVNqDVLpv1I-_jUp/exec';

// Configurazione mappatura SKU -> Sezioni HTML
const SECTIONS_CONFIG = {
    'properties': { 
        prefix: 'PR', 
        gridId: 'propertiesGrid', 
        cta: 'Richiedi Visita', 
        fallback: 'Nessuna proprietà immobiliare disponibile al momento.' 
    },
    'supercars': { 
        prefix: 'SC', 
        gridId: 'supercarsGrid', 
        cta: 'Prenota Test Drive', 
        fallback: 'Nessuna supercar disponibile al momento.' 
    },
    'stays': { 
        prefix: 'EX', 
        gridId: 'staysGrid', 
        cta: 'Scopri Esperienza', 
        fallback: 'Nessuna esperienza esclusiva disponibile al momento.' 
    },
    'shop': { 
        prefix: 'ME', 
        gridId: 'shopGrid', 
        cta: 'Acquista Ora', 
        fallback: 'Shop momentaneamente vuoto.' 
    }
};

/**
 * Funzione principale di avvio: recupera i dati dal server Google
 */
async function initDynamicProducts() {
    // 1. Mostra stato di caricamento ("loading...") su tutte le griglie
    Object.values(SECTIONS_CONFIG).forEach(cfg => {
        const grid = document.getElementById(cfg.gridId);
        if (grid) grid.innerHTML = '<div class="loading">Aggiornamento catalogo...</div>';
    });

    try {
        // 2. Creiamo una richiesta JSONP per aggirare eventuali blocchi CORS semplici su script custom
        const callbackName = 'productsCallback_' + Date.now();
        const script = document.createElement('script');
        // Parametro 'action=get_products' istruisce il backend a leggere il foglio
        script.src = `${APPS_SCRIPT_URL}?action=get_products&callback=${callbackName}&t=${Date.now()}`;
        
        // Callback globale che riceverà i dati
        window[callbackName] = function(response) {
            if (response && response.products) {
                distributeProducts(response.products);
            } else {
                handleError('Nessun dato ricevuto dal server.');
            }
            // Pulizia
            try { delete window[callbackName]; } catch(e){}
            script.remove();
        };
        
        script.onerror = () => handleError('Errore di connessione al database prodotti.');
        document.body.appendChild(script);

    } catch (err) {
        handleError(err.message);
    }
}

/**
 * Smista i prodotti scaricati nelle rispettive griglie in base al prefisso SKU
 */
function distributeProducts(products) {
    // Bucket temporanei per ogni categoria
    const buckets = { 'PR': [], 'SC': [], 'EX': [], 'ME': [] };

    // Filtra ogni prodotto
    products.forEach(prod => {
        if (!prod.sku) return;
        // Prende le prime 2 lettere (es. "PR" da "PR-01-V")
        const prefix = prod.sku.substring(0, 2).toUpperCase();
        
        if (buckets[prefix]) {
            buckets[prefix].push(prod);
        }
    });

    // Renderizza le griglie
    Object.keys(SECTIONS_CONFIG).forEach(key => {
        const config = SECTIONS_CONFIG[key];
        const items = buckets[config.prefix] || [];
        renderGrid(config.gridId, items, config.cta, config.fallback);
    });
}

/**
 * Disegna le card HTML dentro la griglia specificata
 */
function renderGrid(gridId, items, defaultCta, fallbackMsg) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = ''; // Rimuove il loader

    // Caso vuoto
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #888; border: 1px dashed #333; border-radius: 8px;">
                <div style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;">📦</div>
                <p>${fallbackMsg}</p>
            </div>`;
        return;
    }

    // Creazione card per ogni prodotto
    items.forEach(prod => {
        const card = createProductCardFromSheet(prod, defaultCta);
        grid.appendChild(card);
    });
}

/**
 * Crea l'elemento DOM della Card Prodotto
 */
function createProductCardFromSheet(prod, ctaLabel) {
    const card = document.createElement('div');
    card.className = 'card';

    // 1. Gestione Immagine
    let imageUrl = prod.image1 || '';
    
    // Se è un link Google Drive, estraiamo l'ID per usarlo direttamente
    if (imageUrl.includes('drive.google.com')) {
        const idMatch = imageUrl.match(/[-\w]{25,}/);
        if (idMatch) {
            // URL per visualizzazione diretta immagine
            imageUrl = `https://lh3.googleusercontent.com/d/${idMatch[0]}=w800`; 
        }
    }
    // Fallback se vuoto
    if (!imageUrl) imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';

    // 2. Gestione Prezzo
    let priceDisplay = '';
    // Se il foglio invia un numero, lo formattiamo, altrimenti usiamo il testo grezzo
    if (prod.price && !isNaN(parseFloat(prod.price))) {
        priceDisplay = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(prod.price);
    } else {
        priceDisplay = prod.price || 'Prezzo su richiesta';
    }

    // 3. Costruzione HTML
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${safe(prod.title)}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <h3 class="card-title">${safe(prod.title)}</h3>
        <p class="card-desc">${safe(prod.desc)}</p>
        <div class="card-price">${priceDisplay}</div>
        <button class="btn btn-primary" style="margin-top: 1.5rem; width: 100%;">
            ${ctaLabel}
        </button>
    `;

    // 4. Gestione Click Bottone
    const btn = card.querySelector('button');
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        goToProductDetail(prod, imageUrl); // Passiamo i dati alla funzione di navigazione
    });

    return card;
}

/**
 * Gestisce la navigazione alla pagina dettaglio salvando i dati necessari
 */
function goToProductDetail(prod, finalImageUrl) {
    showLoader(); 

    // Determina la sezione in base allo SKU per l'URL (estetico)
    let sectionParam = 'shop';
    if (prod.sku.startsWith('PR')) sectionParam = 'properties';
    if (prod.sku.startsWith('SC')) sectionParam = 'supercars';
    if (prod.sku.startsWith('EX')) sectionParam = 'stays';

    // Salviamo i dati nel LocalStorage per renderli disponibili subito alla PDP
    // (utile per ridurre i tempi di attesa visuali o come cache)
    try {
        localStorage.setItem('lh360_last_product', JSON.stringify({ 
            sku: prod.sku, 
            title: prod.title, 
            image: finalImageUrl,
            ts: Date.now() 
        }));
        localStorage.setItem('lh360_selected_sku', prod.sku || '');
    } catch (e) {
        console.error('Errore salvataggio localStorage', e);
    }

    // Navigazione con delay minimo per animazione loader
    setTimeout(() => {
        window.location.href = `product-details/pdp-products.html?sku=${encodeURIComponent(prod.sku)}&section=${sectionParam}`;
    }, 500);
}

// Helper sicurezza XSS (sanitizza stringhe)
function safe(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}

function handleError(msg) {
    console.error(msg);
    // Rimuove i loader e mostra errore nelle griglie
    Object.values(SECTIONS_CONFIG).forEach(cfg => {
        const grid = document.getElementById(cfg.gridId);
        if(grid && grid.querySelector('.loading')) {
            grid.innerHTML = `<div class="error" style="color: #ef4444; text-align:center; padding: 2rem;">
                ⚠️ Impossibile caricare i contenuti.<br><span style="font-size:0.8em; opacity:0.7;">${msg}</span>
            </div>`;
        }
    });
}


// ==================================================================
// 3. LOADER UTILITIES (Necessarie per l'effetto transizione)
// ==================================================================

// Inietta l'HTML del loader se non esiste
function injectLoader() {
    if (document.getElementById('luxhaven-loader')) return;

    const loaderHTML = `
    <div id="luxhaven-loader">
        <div class="lh-bg-gradient"></div>
        <div class="lh-loader-content">
            <img src="assets/logo-azienda.png" alt="LuxHaven360" class="lh-logo">
            <div class="lh-tagline">Curating Excellence</div>
            
            <div class="lh-loader-wrapper">
                <div class="lh-ring"></div>
                <div class="lh-ring"></div>
                <div class="lh-ring"></div>
            </div>

            <div class="lh-progress-container">
                <div class="lh-progress-fill"></div>
            </div>
            <div class="lh-loading-text">Caricamento</div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
}

// Nasconde immediatamente (fix per back-forward cache)
function hideLoaderImmediately() {
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// Mostra il loader
function showLoader() {
    injectLoader();
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        loader.style.display = 'flex'; 
        loader.style.opacity = '1';    
        loader.classList.remove('visible'); 
        void loader.offsetWidth; // Forza reflow
        loader.classList.add('visible'); 
    }
}

// Nasconde il loader con transizione
function hideLoader() {
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        loader.classList.remove('visible');
    }
}

// ==================================================================
// 4. INIZIALIZZAZIONE GLOBALE
// ==================================================================

window.addEventListener('DOMContentLoaded', () => {
    // Avvia caricamento prodotti da Sheet
    initDynamicProducts();
});

window.addEventListener('load', hideLoaderImmediately);

// Gestione tasto "Indietro" browser
window.addEventListener('pageshow', (event) => {
    hideLoaderImmediately();
    if (event.persisted) {
        // Se la pagina è stata caricata dalla cache bfcache, ricarichiamo i prodotti per sicurezza
        initDynamicProducts(); 
    }
});

