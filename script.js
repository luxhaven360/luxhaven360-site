// --- Nav & UI (tuo script esistente mantenuto e ampliato) ---

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

// ---------------------- Dynamic products loading (FROM SHEET) ----------------------

// Mappatura Prefix SKU -> ID Sezione HTML
const CATEGORY_MAP = {
    'PR': { id: 'properties', gridId: 'propertiesGrid', cta: 'Richiedi Visita' }, // Immobili
    'SC': { id: 'supercars', gridId: 'supercarsGrid', cta: 'Prenota Test Drive' }, // Supercar
    'EX': { id: 'stays', gridId: 'staysGrid', cta: 'Scopri Esperienza' },         // Esperienze
    'ME': { id: 'shop', gridId: 'shopGrid', cta: 'Acquista Ora' }                 // Merchandising
};

// Funzione principale di inizializzazione
async function initDynamicProducts() {
    // Mostra loader nelle griglie
    Object.values(CATEGORY_MAP).forEach(conf => {
        const el = document.getElementById(conf.gridId);
        if (el) el.innerHTML = '<div class="loading">Caricamento prodotti esclusivi...</div>';
    });

    try {
        // Recupera URL Web App (definito in index.html)
        const apiUrl = (typeof WEB_APP_URL !== 'undefined') ? WEB_APP_URL : 'https://script.google.com/macros/s/AKfycbzRgxxOU8DdLLcuJkDpu2b07sCXPIANjZK5yy2CHs9ZXYRB-y_DtVsZpgclvDmFH9L5/exec';
        
        // Chiama endpoint Apps Script
        const response = await fetch(`${apiUrl}?action=get_products&callback=handleProducts`);
        const text = await response.text();
        
        // Gestione JSONP manuale pulita
        const jsonStr = text.replace(/^handleProducts\(/, '').replace(/\)$/, '');
        const products = JSON.parse(jsonStr);

        renderProducts(products);

    } catch (err) {
        console.error('Errore fetch prodotti:', err);
        Object.values(CATEGORY_MAP).forEach(conf => {
            const el = document.getElementById(conf.gridId);
            if (el) el.innerHTML = '<div class="error">Impossibile caricare il catalogo al momento.</div>';
        });
    }
}

// Renderizza i prodotti nelle giuste griglie
function renderProducts(products) {
    // 1. Pulisci griglie
    Object.values(CATEGORY_MAP).forEach(conf => {
        const el = document.getElementById(conf.gridId);
        if (el) el.innerHTML = '';
    });

    // Contatore per verificare categorie vuote
    const countMap = { 'PR': 0, 'SC': 0, 'EX': 0, 'ME': 0 };

    products.forEach(prod => {
        // Determina categoria dallo SKU (primi 2 caratteri)
        const prefix = prod.sectionPrefix; 
        const config = CATEGORY_MAP[prefix];

        if (config) {
            const grid = document.getElementById(config.gridId);
            if (grid) {
                const card = createSheetProductCard(prod, config.cta, config.id);
                grid.appendChild(card);
                countMap[prefix]++;
            }
        }
    });

    // Gestione Categorie Vuote
    Object.keys(CATEGORY_MAP).forEach(prefix => {
        if (countMap[prefix] === 0) {
            const config = CATEGORY_MAP[prefix];
            const grid = document.getElementById(config.gridId);
            if (grid) {
                grid.innerHTML = `<div class="empty-section" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #a1a1aa; border: 1px dashed #333;">
                    Nessun prodotto disponibile in questa categoria al momento.
                </div>`;
            }
        }
    });
}

// Crea la card prodotto (adattata per i dati del Foglio)
function createSheetProductCard(prod, defaultCta, sectionId) {
    const card = document.createElement('div');
    card.className = 'card';

    // Immagine (Sostituisce l'icona)
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';
    
    if (prod.image1) {
        const img = document.createElement('img');
        img.src = prod.image1;
        img.alt = prod.title;
        img.loading = 'lazy'; // Performance
        img.style.width = '100%';
        img.style.height = '250px'; // Altezza fissa per uniformità
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        imageContainer.appendChild(img);
    } else {
        // Fallback se manca immagine
        imageContainer.innerHTML = '<div style="font-size:3rem; padding:2rem;">✨</div>';
    }
    card.appendChild(imageContainer);

    // Titolo
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = prod.title || 'Prodotto Esclusivo';
    card.appendChild(title);

    // Descrizione Breve
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = prod.desc || 'Dettagli su richiesta.';
    card.appendChild(desc);

    // Prezzo
    const priceDiv = document.createElement('div');
    priceDiv.className = 'card-price';
    let priceText = 'Prezzo su richiesta';
    if (prod.price) {
        // Formatta prezzo se è un numero
        if (!isNaN(prod.price)) {
            priceText = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(prod.price);
        } else {
            priceText = prod.price; // Usa il testo se c'è scritto altro
        }
    }
    priceDiv.textContent = priceText;
    card.appendChild(priceDiv);

    // Bottone
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.marginTop = '1.5rem';
    btn.style.width = '100%';
    btn.textContent = defaultCta;

    // Gestione Click
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoader();

        // Salva dati per la pagina dettagli
        try {
            localStorage.setItem('lh360_last_product', JSON.stringify({ 
                sku: prod.sku, 
                title: prod.title, 
                ts: Date.now() 
            }));
            localStorage.setItem('lh360_selected_sku', prod.sku);
        } catch (e) {}

        setTimeout(() => {
            const sku = encodeURIComponent(prod.sku);
            const section = encodeURIComponent(sectionId); // shop, properties, etc.
            window.location.href = `product-details/pdp-products.html?sku=${sku}&section=${section}`;
        }, 800);
    });

    card.appendChild(btn);

    return card;
}

// init al load
window.addEventListener('DOMContentLoaded', () => {
    initDynamicProducts();
});

// --- end ---

// --- LOADER UTILITIES ---

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

// Nuova funzione per nascondere immediatamente il loader (fix per back-forward cache)
function hideLoaderImmediately() {
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // Tempo per transizione
    }
}

// Aggiungi listener per nascondere loader su pageshow (quando si torna indietro) e load
window.addEventListener('pageshow', (event) => {
    hideLoaderImmediately();
    if (event.persisted) {
        // Reinit opzionali se la pagina è ripristinata dalla cache
        initDynamicProducts(); // Esempio: ricarica prodotti se necessario
    }
});

window.addEventListener('load', hideLoaderImmediately);

// Mostra il loader
function showLoader() {
    injectLoader();
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        // Reset stili inline per override completo
        loader.style.display = 'flex'; // Forza visibilità
        loader.style.opacity = '1';    // Forza opacità immediata
        loader.classList.remove('visible'); // Reset classe per ri-trigger transizione
        // Forza reflow per applicare cambiamenti (trick per browser con cache issues)
        void loader.offsetWidth;
        loader.classList.add('visible'); // Ri-applica classe
    }
}

// Nasconde il loader
function hideLoader() {
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        loader.classList.remove('visible');
        // Rimuovi dal DOM dopo la transizione per pulizia (opzionale)
        setTimeout(() => {
            // loader.remove(); // Decommenta se vuoi rimuoverlo completamente
        }, 500);
    }
}
