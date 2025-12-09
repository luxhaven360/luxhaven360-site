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

// ---------------------- Dynamic products loading (Google Sheets) ----------------------

// Mappatura Prefisso SKU -> ID Griglia HTML
const CATEGORY_MAP = {
    'PR': { gridId: 'propertiesGrid', title: 'Immobili' },
    'SC': { gridId: 'supercarsGrid', title: 'Supercar' },
    'EX': { gridId: 'staysGrid', title: 'Esperienze' },
    'ME': { gridId: 'shopGrid', title: 'Shop' }
};

// URL della tua Web App (Gia presente nel tuo file, riutilizziamo la costante se c'è o la definiamo)
// Assicurati che questa costante sia definita all'inizio del file o qui:
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRgxxOU8DdLLcuJkDpu2b07sCXPIANjZK5yy2CHs9ZXYRB-y_DtVsZpgclvDmFH9L5/exec';

async function initDynamicProducts() {
    // Mostra stato di caricamento su tutte le griglie
    Object.values(CATEGORY_MAP).forEach(cat => {
        const grid = document.getElementById(cat.gridId);
        if (grid) grid.innerHTML = '<div class="loading-pulse"></div>'; // Puoi usare uno stile CSS loader qui
    });

    try {
        // Chiamata JSONP per aggirare CORS o fetch diretta se configurato
        const callbackName = 'handleProductsResponse';
        const scriptUrl = `${GOOGLE_SCRIPT_URL}?action=get_products&callback=${callbackName}&t=${Date.now()}`;
        
        // Creiamo una promise per gestire JSONP
        await new Promise((resolve, reject) => {
            window[callbackName] = (data) => {
                if (data.error) reject(data.error);
                else resolve(data.products);
            };
            
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onerror = () => reject('Errore di connessione script Google');
            document.body.appendChild(script);
        }).then(products => {
            distributeProducts(products);
        });

    } catch (err) {
        console.error('Errore caricamento prodotti:', err);
        // Mostra errore nelle griglie
        Object.values(CATEGORY_MAP).forEach(cat => {
            const grid = document.getElementById(cat.gridId);
            if (grid) grid.innerHTML = `<div class="error-msg">Impossibile caricare i contenuti al momento.</div>`;
        });
    }
}

function distributeProducts(products) {
    // 1. Pulisci le griglie
    Object.values(CATEGORY_MAP).forEach(cat => {
        const grid = document.getElementById(cat.gridId);
        if (grid) grid.innerHTML = '';
    });

    // Contatori per gestire messaggi "vuoto"
    const counts = { 'PR': 0, 'SC': 0, 'EX': 0, 'ME': 0 };

    // 2. Itera e crea card
    products.forEach(prod => {
        // Identifica categoria dal prefisso SKU (PR, SC, EX, ME)
        const prefix = prod.original_sku_prefix; 
        const config = CATEGORY_MAP[prefix];

        if (config) {
            const grid = document.getElementById(config.gridId);
            if (grid) {
                const card = createSheetProductCard(prod);
                grid.appendChild(card);
                counts[prefix]++;
            }
        }
    });

    // 3. Gestione sezioni vuote
    Object.keys(CATEGORY_MAP).forEach(prefix => {
        if (counts[prefix] === 0) {
            const config = CATEGORY_MAP[prefix];
            const grid = document.getElementById(config.gridId);
            if (grid) {
                grid.innerHTML = `
                    <div class="empty-section" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #a1a1aa;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💎</div>
                        <h3>Collezione ${config.title} Sold Out</h3>
                        <p>Iscriviti alla newsletter per i prossimi arrivi.</p>
                    </div>`;
            }
        }
    });
}

function createSheetProductCard(prod) {
    const card = document.createElement('div');
    card.className = 'card';

    // Immagine (Usa Immagine 1 dal foglio)
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-image';
    
    if (prod.image) {
        const img = document.createElement('img');
        img.src = prod.image;
        img.alt = prod.title;
        img.loading = 'lazy'; // Performance boost
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        imgContainer.innerHTML = ''; // Rimuovi placeholder
        imgContainer.appendChild(img);
    } else {
        imgContainer.textContent = '📷'; // Fallback icona
    }
    card.appendChild(imgContainer);

    // Titolo
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = prod.title;
    card.appendChild(title);

    // Descrizione Breve
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = prod.desc || '';
    card.appendChild(desc);

    // Tipo (Villa, Test Drive...) - Opzionale, per estetica
    if (prod.type) {
        const typeBadge = document.createElement('div');
        typeBadge.style.fontSize = '0.75rem';
        typeBadge.style.color = '#D4AF37';
        typeBadge.style.textTransform = 'uppercase';
        typeBadge.style.letterSpacing = '1px';
        typeBadge.style.marginBottom = '0.5rem';
        typeBadge.textContent = prod.type;
        // Inseriamo prima del prezzo
        card.appendChild(typeBadge);
    }

    // Prezzo
    const priceDiv = document.createElement('div');
    priceDiv.className = 'card-price';
    // Formatta prezzo se è un numero
    if (prod.price && !isNaN(parseFloat(prod.price))) {
        priceDiv.textContent = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(prod.price);
    } else {
        priceDiv.textContent = prod.price || 'Trattativa Riservata';
    }
    card.appendChild(priceDiv);

    // Bottone CTA
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.marginTop = '1.5rem';
    btn.style.width = '100%';
    
    // Testo CTA basato sulla categoria
    let ctaText = 'Scopri';
    if (prod.original_sku_prefix === 'ME') ctaText = 'Acquista';
    else if (prod.original_sku_prefix === 'PR') ctaText = 'Richiedi Visita';
    else if (prod.original_sku_prefix === 'SC') ctaText = 'Prenota Test';
    
    btn.textContent = ctaText;

    // Logica click (porta al PDP)
    btn.onclick = (e) => {
        e.preventDefault();
        showLoader(); // Usa la tua funzione loader esistente
        
        // Salva dati minimi per il caricamento rapido
        localStorage.setItem('lh360_selected_sku', prod.sku);
        localStorage.setItem('lh360_last_product', JSON.stringify({
            sku: prod.sku,
            title: prod.title,
            ts: Date.now()
        }));

        // Delay estetico per transizione
        setTimeout(() => {
            // Determina la sezione per caricare eventuali JSON specifici se ancora usati nel PDP,
            // altrimenti il PDP dovrà essere aggiornato per leggere dal foglio (prossimo step).
            // Per ora mandiamo alla pagina dettaglio generica.
            window.location.href = `product-details/pdp-products.html?sku=${encodeURIComponent(prod.sku)}`;
        }, 500);
    };

    card.appendChild(btn);

    return card;
}

// Avvia al caricamento
window.addEventListener('DOMContentLoaded', initDynamicProducts);


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
