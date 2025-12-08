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

// ---------------------- Dynamic Products Loading (Google Sheets Source) ----------------------

// Mappatura sezioni basata sui prefissi SKU
// PR = Immobili (Properties)
// SC = Supercar
// EX = Esperienze (Stays)
// ME = Shop (Merch)
const SECTION_MAPPING = {
    'PR': { gridId: 'propertiesGrid', cta: 'Richiedi Visita', fallbackMsg: 'Nessun immobile disponibile al momento.' },
    'SC': { gridId: 'supercarsGrid', cta: 'Richiedi Info', fallbackMsg: 'Nessuna supercar disponibile.' },
    'EX': { gridId: 'staysGrid', cta: 'Prenota Ora', fallbackMsg: 'Nessuna esperienza disponibile.' },
    'ME': { gridId: 'shopGrid', cta: 'Acquista', fallbackMsg: 'Shop momentaneamente vuoto.' }
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUh0VScOtnTLHHIRrOeuDGugp0ynQLNjHue7PcP2JEoOQ5x2ZyuTVFdpaUHh6DGFE/exec'; // Verifica che sia il tuo URL corretto

// Funzione principale di inizializzazione
async function initDynamicProducts() {
    // Mostra loader/placeholder nelle griglie
    Object.values(SECTION_MAPPING).forEach(conf => {
        const el = document.getElementById(conf.gridId);
        if (el) el.innerHTML = '<div class="loading-grid">Caricamento eccellenze...</div>';
    });

    try {
        // Fetch unica per tutti i prodotti
        // Aggiungiamo timestamp per evitare cache
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_all_products&callback=handleProducts&t=${Date.now()}`, {
            method: 'GET'
        });
        
        // Gestione risposta JSONP manuale (poiché fetch non gestisce JSONP nativamente e il server risponde callback(...))
        // Alternativa: Se hai configurato doGet per tornare JSON puro senza callback wrapper se non richiesto, usa response.json().
        // Qui assumiamo il formato standard Apps Script JSONP text
        const text = await response.text();
        
        // Pulizia JSONP: Rimuove "handleProducts(" all'inizio e ")" alla fine
        let jsonString = text;
        if (text.startsWith('handleProducts(')) {
            jsonString = text.substring('handleProducts('.length, text.length - 1);
        } else if (text.startsWith('callback(')) {
             jsonString = text.substring('callback('.length, text.length - 1);
        }

        let allProducts = [];
        try {
            allProducts = JSON.parse(jsonString);
        } catch (e) {
            console.error("Errore parsing JSON prodotti", e);
            throw new Error("Formato dati non valido");
        }

        if (!Array.isArray(allProducts)) allProducts = [];

        populateGrids(allProducts);

    } catch (error) {
        console.error("Errore caricamento prodotti:", error);
        // Mostra errore nelle griglie
        Object.values(SECTION_MAPPING).forEach(conf => {
            const el = document.getElementById(conf.gridId);
            if (el) el.innerHTML = '<div class="error-msg">Impossibile caricare il catalogo. Riprova più tardi.</div>';
        });
    }
}

// Distribuisce i prodotti nelle griglie corrette
function populateGrids(products) {
    // Pulisci le griglie
    Object.values(SECTION_MAPPING).forEach(conf => {
        const el = document.getElementById(conf.gridId);
        if (el) el.innerHTML = '';
    });

    // Contatori per verificare se le sezioni sono vuote
    const counters = { 'PR': 0, 'SC': 0, 'EX': 0, 'ME': 0 };

    products.forEach(prod => {
        if (!prod.sku) return;

        // Estrai le prime 2 lettere dello SKU (Es. PR, SC, ME)
        const prefix = prod.sku.substring(0, 2).toUpperCase();
        const config = SECTION_MAPPING[prefix];

        if (config) {
            const grid = document.getElementById(config.gridId);
            if (grid) {
                const card = createSheetProductCard(prod, config.cta);
                grid.appendChild(card);
                counters[prefix]++;
            }
        }
    });

    // Gestione messaggi "Nessun prodotto"
    Object.keys(SECTION_MAPPING).forEach(prefix => {
        if (counters[prefix] === 0) {
            const config = SECTION_MAPPING[prefix];
            const grid = document.getElementById(config.gridId);
            if (grid) {
                grid.innerHTML = `<div class="empty-section"><p>${config.fallbackMsg}</p></div>`;
            }
        }
    });
}

// Crea la card prodotto basata sui dati dello Sheet
function createSheetProductCard(prod, defaultCta) {
    const card = document.createElement('div');
    card.className = 'card';

    // 1. Immagine (Sostituisce Icona)
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';
    
    // Fallback immagine se vuota
    const imgSrc = prod.image || 'https://via.placeholder.com/400x300?text=LuxHaven360';
    
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = prod.title;
    img.loading = "lazy"; // Performance
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);

    // 2. Titolo
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = prod.title;
    card.appendChild(title);

    // 3. Descrizione Breve
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = prod.desc;
    card.appendChild(desc);

    // 4. Prezzo
    const priceDiv = document.createElement('div');
    priceDiv.className = 'card-price';
    // Formatta prezzo in Euro
    const priceFormatted = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(prod.price);
    priceDiv.textContent = priceFormatted;
    card.appendChild(priceDiv);

    // 5. Bottone CTA
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.marginTop = '1.5rem';
    btn.style.width = '100%';
    btn.textContent = defaultCta;
    
    // Evento Click
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoader(); // Mostra il loader globale esistente

        // Salva selezione per la pagina di dettaglio
        try {
            localStorage.setItem('lh360_last_product', JSON.stringify({ 
                sku: prod.sku, 
                title: prod.title, 
                ts: Date.now() 
            }));
            localStorage.setItem('lh360_selected_sku', prod.sku);
        } catch (e) {}

        // Navigazione
        setTimeout(() => {
            const base = 'product-details/pdp-products.html';
            // Passa anche la sezione (dedotta dallo SKU)
            let sectionName = 'shop';
            if (prod.sku.startsWith('PR')) sectionName = 'properties';
            if (prod.sku.startsWith('SC')) sectionName = 'supercars';
            if (prod.sku.startsWith('EX')) sectionName = 'stays';
            
            const skuParam = encodeURIComponent(prod.sku);
            window.location.href = `${base}?sku=${skuParam}&section=${sectionName}`;
        }, 800);
    });

    card.appendChild(btn);

    return card;
}

// Avvia al caricamento della pagina
window.addEventListener('DOMContentLoaded', () => {
    initDynamicProducts();
});

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


