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
    
    // Controlla che il link sia presente e sia un URL Drive valido
    if (prod.icon && typeof prod.icon === 'string' && prod.icon.includes('drive.google.com')) {
        const img = el('img', { 
            src: prod.icon, 
            alt: prod.title, 
            style: 'width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;',
            loading: 'lazy',
            referrerpolicy: 'no-referrer' // <--- DEVE ESSERE QUI!
        });
        
        // Fallback se l'immagine non carica (dovrebbe essere solo il tuo "pacchetto" 📦)
        img.onerror = function() {
            this.style.display = 'none';
            imageContainer.textContent = '📦';
            imageContainer.style.display = 'flex';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.justifyContent = 'center';
            imageContainer.style.fontSize = '3rem';
        };
        
        imageContainer.appendChild(img);
    } else {
        // Se non c'è un URL drive valido (es. icona base "📦")
        imageContainer.textContent = prod.icon || '📦';
        imageContainer.style.display = 'flex';
        imageContainer.style.alignItems = 'center';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.fontSize = '3rem';
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

/**
 * NUOVA FUNZIONE UNIFICATA
 * Scarica TUTTI i prodotti in una sola volta e li distribuisce.
 * Risolve il problema "Errore di Rete" su mobile riducendo le richieste HTTP.
 */
function initDynamicProducts() {
    return new Promise((resolve, reject) => {
        
        // 1. Imposta lo stato di caricamento su tutte le griglie
        const grids = {};
        SECTIONS.forEach(section => {
            const gridEl = document.getElementById(section.gridId);
            if (gridEl) {
                gridEl.innerHTML = '<div class="loading">Caricamento in corso...</div>';
                grids[section.id] = gridEl;
            }
        });

        // 2. Prepara la chiamata API unica (category=all)
        const callbackName = 'loadAllProductsCallback_' + Date.now();
        // Aumentiamo il timeout a 15 secondi per reti mobile lente
        const timeoutDuration = 15000; 
        
        const scriptUrl = `${WEB_APP_URL}?action=get_products&category=all&callback=${callbackName}&t=${Date.now()}`;

        // Timeout di sicurezza
        const safetyTimeout = setTimeout(() => {
            cleanup();
            showErrorInAllGrids('Timeout connessione. Riprova.');
            resolve(); // Risolviamo comunque per nascondere il loader principale
        }, timeoutDuration);

        // 3. Callback JSONP
        window[callbackName] = function(response) {
            clearTimeout(safetyTimeout);
            cleanup();

            if (!response.success || !response.products) {
                console.error("Errore API:", response.error);
                showErrorInAllGrids('Errore nel caricamento dati.');
                resolve();
                return;
            }

            // Pulisci le griglie dal messaggio di caricamento
            Object.values(grids).forEach(g => g.innerHTML = '');

            const allProducts = response.products || [];
            const countBySection = {};

            // 4. Distribuisci i prodotti nelle sezioni corrette
            allProducts.forEach(prod => {
                // Trova la sezione corrispondente basandosi sulla categoria del prodotto
                const targetSection = SECTIONS.find(s => s.id === prod.category);
                
                if (targetSection && grids[targetSection.id]) {
                    // Aggiungi metadati
                    prod.sectionName = targetSection.id;
                    const card = createProductCard(prod, targetSection.defaultCta);
                    grids[targetSection.id].appendChild(card);
                    
                    // Conta i prodotti per gestire gli stati vuoti
                    countBySection[targetSection.id] = (countBySection[targetSection.id] || 0) + 1;
                }
            });

            // 5. Gestisci le sezioni rimaste vuote
            SECTIONS.forEach(section => {
                if (!countBySection[section.id] && grids[section.id]) {
                    grids[section.id].innerHTML = `<div class="empty" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.5;">Nessun prodotto disponibile al momento.</div>`;
                }
            });

            resolve();
        };

        // Gestione Errore Script (es. Blocco Rete)
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onerror = () => {
            clearTimeout(safetyTimeout);
            cleanup();
            showErrorInAllGrids('Errore di connessione. Verifica la rete.');
            resolve();
        };

        function cleanup() {
            try { if (script.parentNode) document.body.removeChild(script); } catch (e) {}
            try { delete window[callbackName]; } catch (e) {}
        }

        // Funzione helper per mostrare errori ovunque
        function showErrorInAllGrids(msg) {
            Object.values(grids).forEach(g => {
                g.innerHTML = `<div class="error" style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">${msg}</div>`;
            });
        }

        document.body.appendChild(script);
    });
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








