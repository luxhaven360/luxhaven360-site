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

// ---------------------- Dynamic products loading ----------------------
// 🆕 Carica i prodotti dal Google Sheet "Prodotti" tramite API
// Struttura del foglio (colonne dalla riga 7, dati dalla riga 8):
// A: SKU, B: Nome Prodotto, C: Numero Prodotto, D: Categoria, E: Prezzo,
// F: Consegna Prevista, G+H: Breve Descrizione, I: Colori, J: Taglie,
// K: Descrizione Lunga, L-O: Immagini 1-4

const SECTIONS = [
    { id: 'properties', gridId: 'propertiesGrid', defaultCta: 'Richiedi Visita' },
    { id: 'supercars', gridId: 'supercarsGrid', defaultCta: 'Test Drive' },
    { id: 'stays', gridId: 'staysGrid', defaultCta: 'Prenota Ora' },
    { id: 'shop', gridId: 'shopGrid', defaultCta: 'Acquista' }
];

// utility per creare elementi DOM
function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
    }
    children.forEach(c => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
}

// format prezzo semplice
function formatPrice(p, currency = 'EUR') {
    try {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(p);
    } catch (e) {
        return `${p} ${currency}`;
    }
}

// funzione per creare una card prodotto
function createProductCard(prod, defaultCta) {
    // container
    const card = el('div', { class: 'card' });

    // image/icon
    const imageContainer = el('div', { class: 'card-image' });
    
    // LOGICA CORRETTA PER IMMAGINI DRIVE
    // Se c'è un'icona e sembra un URL (inizia con http O contiene drive.google), crea il tag <img>
    if (prod.icon && (typeof prod.icon === 'string') && (prod.icon.startsWith('http') || prod.icon.includes('drive.google.com'))) {
        const img = el('img', { 
            src: prod.icon, 
            alt: prod.title, 
            style: 'width:100%; height:100%; object-fit:cover;',
            loading: 'lazy' // Performance boost
        });
        
        // Gestione errore caricamento immagine
        img.onerror = function() {
            this.style.display = 'none';
            imageContainer.textContent = '📦'; // Fallback se il link è rotto
        };
        
        imageContainer.appendChild(img);
    } else {
        // Se non è un link immagine, mostra il testo/emoji (es. "Copertina" se il link non è stato estratto)
        imageContainer.textContent = prod.icon || '📦';
    }
    
    card.appendChild(imageContainer);

    // title
    const title = el('h3', { class: 'card-title' }, [document.createTextNode(prod.title || 'Untitled')]);
    card.appendChild(title);

    // desc
    const desc = el('p', { class: 'card-desc' }, [document.createTextNode(prod.desc || '')]);
    card.appendChild(desc);

    // price
    const priceText = el('div', { class: 'card-price' }, [document.createTextNode(prod.price != null && prod.price > 0 ? formatPrice(prod.price, prod.currency || 'EUR') : (prod.price_text || 'Contattaci'))]);
    card.appendChild(priceText);

    // button area
    const btn = el('button', { class: 'btn', style: 'margin-top: 1.5rem; width: 100%;' }, [document.createTextNode(prod.cta || defaultCta || 'Scopri')]);

    // attach product data as data- attributes
    btn.dataset.sku = prod.sku || '';
    btn.dataset.title = prod.title || '';
    if (prod.stripe_link) btn.dataset.stripeLink = prod.stripe_link;
    if (prod.action) btn.dataset.action = prod.action;

    // on click behaviour
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoader();
        try {
            localStorage.setItem('lh360_last_product', JSON.stringify({ sku: btn.dataset.sku, title: btn.dataset.title, ts: Date.now() }));
            localStorage.setItem('lh360_selected_sku', btn.dataset.sku || '');
        } catch (e) {}

        setTimeout(() => {
            const base = 'product-details/pdp-products.html';
            const sku = encodeURIComponent(btn.dataset.sku || '');
            const section = encodeURIComponent(prod.sectionName || prod.category || 'shop');
            window.location.href = `${base}?sku=${sku}&section=${section}`;
        }, 500); 
    });

    card.appendChild(btn);
    return card;
}

// 🆕 Modificata per restituire una Promise
function loadSection(section) {
    return new Promise((resolve) => { // Wrapper Promise
        const grid = document.getElementById(section.gridId);
        if (!grid) { resolve(); return; }

        grid.innerHTML = '<div class="loading">Caricamento...</div>';

        const callbackName = 'loadProducts_' + section.id + '_' + Date.now();
        const category = section.id;
        
        // Aggiungi timestamp per evitare cache
        const scriptUrl = `${WEB_APP_URL}?action=get_products&category=${category}&callback=${callbackName}&t=${Date.now()}`;
        
        // Timeout di sicurezza (se l'API fallisce, risolvi comunque per non bloccare il sito)
        const safetyTimeout = setTimeout(() => {
            cleanup();
            if(grid.innerHTML.includes('Caricamento')) {
                 grid.innerHTML = '<div class="error">Timeout connessione.</div>';
            }
            resolve();
        }, 8000); // 8 secondi max per chiamata API

        window[callbackName] = function(response) {
            clearTimeout(safetyTimeout);
            cleanup();
            
            if (!response.success || response.error) {
                console.error(`Errore API ${section.id}:`, response.error);
                grid.innerHTML = '<div class="error">Errore caricamento.</div>';
                resolve();
                return;
            }

            const items = response.products || [];
            grid.innerHTML = '';
            
            if (items.length === 0) {
                grid.innerHTML = `<div class="empty" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.5;">Nessun prodotto disponibile.</div>`;
            } else {
                items.forEach(prod => {
                    prod.sectionName = section.id;
                    const card = createProductCard(prod, section.defaultCta);
                    grid.appendChild(card);
                });
            }
            resolve(); // Segnala che questa sezione è pronta
        };
        
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onerror = () => {
            clearTimeout(safetyTimeout);
            cleanup();
            grid.innerHTML = '<div class="error">Errore rete.</div>';
            resolve();
        };
        
        function cleanup() {
            try { if (script.parentNode) document.body.removeChild(script); } catch (e) {}
            try { delete window[callbackName]; } catch (e) {}
        }
        
        document.body.appendChild(script);
    });
}

// 🆕 Modificata per restituire Promise.all
function initDynamicProducts() {
    // Lancia il caricamento di tutte le sezioni in parallelo
    const promises = SECTIONS.map(s => loadSection(s));
    // Ritorna una promise che si risolve quando TUTTE le sezioni hanno finito
    return Promise.all(promises);
}
                                     
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



