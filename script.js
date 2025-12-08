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

// --- Dynamic Products Loading (Versione Google Sheets) ---

// Mappatura sezioni HTML e prefissi SKU
const SECTION_CONFIG = {
    'PR': { gridId: 'propertiesGrid', cta: 'Richiedi Visita' },  // Immobili
    'SC': { gridId: 'supercarsGrid', cta: 'Test Drive' },        // Supercar
    'EX': { gridId: 'staysGrid', cta: 'Prenota Ora' },           // Esperienze
    'ME': { gridId: 'shopGrid', cta: 'Acquista' }                // Shop
};

// Funzione principale di inizializzazione
function initDynamicProducts() {
    // Mostra loader nelle griglie
    Object.values(SECTION_CONFIG).forEach(config => {
        const grid = document.getElementById(config.gridId);
        if (grid) grid.innerHTML = '<div class="loading">Caricamento prodotti...</div>';
    });

    // Chiama Apps Script
    // Nota: WEB_APP_URL deve essere definito globalmente o qui.
    // Usiamo una variabile globale se esiste, altrimenti definiscila qui o prendila da index.html
    const scriptUrl = (typeof WEB_APP_URL !== 'undefined') ? WEB_APP_URL : 'https://script.google.com/macros/s/AKfycbzRgxxOU8DdLLcuJkDpu2b07sCXPIANjZK5yy2CHs9ZXYRB-y_DtVsZpgclvDmFH9L5/exec';
    
    // Callback name univoco
    const cbName = 'handleProducts_' + Date.now();
    const url = `${scriptUrl}?action=get_products&callback=${cbName}&t=${Date.now()}`;

    // JSONP Fetch
    const script = document.createElement('script');
    script.src = url;
    
    // Funzione callback globale
    window[cbName] = function(data) {
        processProductsData(data);
        delete window[cbName];
        script.remove();
    };

    script.onerror = function() {
        console.error("Errore caricamento prodotti da Google Sheets");
        showErrorInGrids();
    };

    document.body.appendChild(script);
}

// Processa i dati ricevuti dal foglio
function processProductsData(products) {
    if (!Array.isArray(products)) {
        showErrorInGrids();
        return;
    }

    // Reset delle griglie
    const gridsContent = {
        'PR': [], 'SC': [], 'EX': [], 'ME': []
    };

    // Distribuzione prodotti in base allo SKU
    products.forEach(prod => {
        if (!prod.sku) return;
        
        // Prendi i primi 2 caratteri dello SKU (es. "PR" da "PR-14-V")
        const prefix = prod.sku.substring(0, 2).toUpperCase();
        
        if (gridsContent[prefix]) {
            gridsContent[prefix].push(prod);
        }
    });

    // Renderizzazione
    Object.keys(SECTION_CONFIG).forEach(prefix => {
        const config = SECTION_CONFIG[prefix];
        const grid = document.getElementById(config.gridId);
        if (!grid) return;

        grid.innerHTML = ''; // Pulisci loader

        const items = gridsContent[prefix];

        if (items.length === 0) {
            // 4) Avviso dedicato se non ci sono prodotti
            grid.innerHTML = `
                <div class="empty-section" style="grid-column: 1/-1; text-align: center; padding: 4rem; border: 1px dashed #333; border-radius: 1rem;">
                    <span style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;">∅</span>
                    <p style="color: #a1a1aa;">Al momento non ci sono prodotti disponibili in questa categoria.</p>
                </div>`;
            return;
        }

        items.forEach(prod => {
            const card = createSheetProductCard(prod, config.cta, prefix);
            grid.appendChild(card);
        });
    });
}

// Crea la card prodotto (adattata per i dati dello Sheet)
function createSheetProductCard(prod, defaultCta, sectionCode) {
    const card = document.createElement('div');
    card.className = 'card';

    // 2) & 3) Gestione Immagine (Immagine 1)
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';
    
    if (prod.image) {
        const img = document.createElement('img');
        img.src = prod.image;
        img.alt = prod.title;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.loading = 'lazy';
        imageContainer.appendChild(img);
    } else {
        // Fallback icona se manca immagine
        imageContainer.textContent = sectionCode === 'ME' ? '👕' : (sectionCode === 'SC' ? '🏎️' : '🏠');
        imageContainer.style.display = 'flex';
        imageContainer.style.alignItems = 'center';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.fontSize = '3rem';
    }
    card.appendChild(imageContainer);

    // 3) Nome Prodotto
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = prod.title || 'Prodotto senza nome';
    card.appendChild(title);

    // 3) Breve Descrizione
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = prod.desc || '';
    card.appendChild(desc);

    // 3) Prezzo (Formattazione valuta)
    const priceDiv = document.createElement('div');
    priceDiv.className = 'card-price';
    // Gestisce sia numeri che stringhe dal foglio
    let priceDisplay = '';
    if (typeof prod.price === 'number') {
        priceDisplay = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(prod.price);
    } else {
        priceDisplay = prod.price ? String(prod.price) : 'Prezzo su richiesta';
        if (!priceDisplay.includes('€') && !isNaN(parseFloat(priceDisplay))) {
             priceDisplay += ' €';
        }
    }
    priceDiv.textContent = priceDisplay;
    card.appendChild(priceDiv);

    // Bottone CTA
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.marginTop = '1.5rem';
    btn.style.width = '100%';
    btn.textContent = defaultCta;

    // Gestione Click -> Dettaglio Prodotto
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoader(); // Usa la tua funzione loader esistente

        // Salva dati minimi per transizione fluida
        localStorage.setItem('lh360_selected_sku', prod.sku);
        localStorage.setItem('lh360_last_product', JSON.stringify({
            sku: prod.sku,
            title: prod.title,
            ts: Date.now()
        }));

        setTimeout(() => {
            // Reindirizza alla pagina di dettaglio
            // Assicurati che il percorso sia corretto rispetto alla tua struttura cartelle
            const sectionName = getSectionNameFromCode(sectionCode);
            window.location.href = `product-details/pdp-products.html?sku=${encodeURIComponent(prod.sku)}&section=${sectionName}`;
        }, 800);
    });

    card.appendChild(btn);

    return card;
}

function getSectionNameFromCode(code) {
    switch(code) {
        case 'PR': return 'properties';
        case 'SC': return 'supercars';
        case 'EX': return 'stays';
        case 'ME': return 'shop';
        default: return 'shop';
    }
}

function showErrorInGrids() {
    Object.values(SECTION_CONFIG).forEach(config => {
        const grid = document.getElementById(config.gridId);
        if (grid) grid.innerHTML = '<div class="error">Impossibile caricare i prodotti. Riprova più tardi.</div>';
    });
}

// carica e popola una sezione
async function loadSection(section) {
    const grid = document.getElementById(section.gridId);
    if (!grid) return;

    // stato caricamento
    grid.innerHTML = '<div class="loading">Caricamento...</div>';

    try {
        const resp = await fetch(section.json, { cache: 'no-cache' });
        if (!resp.ok) throw new Error('Network response was not ok: ' + resp.status);
        const items = await resp.json();

        // svuota e popola
        grid.innerHTML = '';
        if (!Array.isArray(items) || items.length === 0) {
            grid.innerHTML = `<div class="empty">Nessun prodotto disponibile in questa categoria.</div>`;
            return;
        }

        items.forEach(prod => {
            // aggiungi meta utile
            prod.sectionName = section.id;
            const card = createProductCard(prod, section.defaultCta);
            grid.appendChild(card);
        });
    } catch (err) {
        console.error('Errore caricamento', section.json, err);
        grid.innerHTML = `<div class="error">Errore caricamento prodotti. Assicurati che ${section.json} sia raggiungibile. (${err.message})</div>`;
    }
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



