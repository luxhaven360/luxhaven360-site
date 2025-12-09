// --- Nav & UI (Tuo codice esistente per navigazione menu) ---
// ... (Mantieni le funzioni showSection, toggleMenu, listener scroll e click outside) ...

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
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

document.addEventListener('click', (e) => {
    const nav = document.getElementById('navLinks');
    const toggle = document.querySelector('.mobile-toggle');
    if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// ---------------------- Dynamic products loading (DA SHEET) ----------------------

// Mappatura SKU Prefix -> ID Griglia HTML e CTA Default
const CATEGORY_MAP = {
    'PR': { gridId: 'propertiesGrid', cta: 'Richiedi Visita', sectionId: 'properties' }, // Immobili
    'SC': { gridId: 'supercarsGrid', cta: 'Test Drive', sectionId: 'supercars' },      // Supercar
    'EX': { gridId: 'staysGrid', cta: 'Prenota Ora', sectionId: 'stays' },             // Esperienze
    'ME': { gridId: 'shopGrid', cta: 'Acquista', sectionId: 'shop' }                   // Merchandising
};

// URL Web App (Assicurati che corrisponda a quello nel tuo HTML o definiscilo qui)
// Se è già in index.html, usa window.WEB_APP_URL, altrimenti scommenta sotto:
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx-wNhNQkZ7QJ7pd08hMXLJPsE8B-FU6O2qF4HOmwtse-FLHyfeUpaVKL24iOf7UNzF/exec';

// Utility per creare elementi DOM
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

// Format prezzo
function formatPrice(p) {
    // Se p è una stringa vuota o non numerica, gestisci gracefully
    if (!p && p !== 0) return 'Prezzo su richiesta';
    // Se è un numero puro
    if (typeof p === 'number') {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p);
    }
    // Se arriva già formattato o testo dal sheet, ritorna così com'è
    return p;
}

// Crea card prodotto aggiornata per leggere i dati dal Sheet
function createProductCard(prod, config) {
    const card = el('div', { class: 'card' });

    // 1. Immagine (Dalla colonna "Immagine 1" del sheet)
    const imageContainer = el('div', { class: 'card-image' });
    if (prod.image1) {
        const img = el('img', { 
            src: prod.image1, 
            alt: prod.title, 
            style: 'width:100%; height:auto; object-fit:cover;' 
        });
        // Fallback errore immagine
        img.onerror = function() { 
            this.style.display='none'; 
            imageContainer.textContent = '📷'; 
        };
        imageContainer.appendChild(img);
    } else {
        imageContainer.textContent = '📦'; // Placeholder se manca immagine
    }
    card.appendChild(imageContainer);

    // 2. Titolo (Colonna Nome Prodotto)
    const title = el('h3', { class: 'card-title' }, [document.createTextNode(prod.title || 'Untitled')]);
    card.appendChild(title);

    // 3. Descrizione (Colonna Breve Descrizione)
    const desc = el('p', { class: 'card-desc' }, [document.createTextNode(prod.desc || '')]);
    card.appendChild(desc);

    // 4. Prezzo (Colonna Prezzo)
    const priceText = el('div', { class: 'card-price' }, [document.createTextNode(formatPrice(prod.price))]);
    card.appendChild(priceText);

    // 5. Bottone CTA
    const btn = el('button', { class: 'btn', style: 'margin-top: 1.5rem; width: 100%;' }, [document.createTextNode(config.cta)]);

    // Dataset per analytics/navigazione
    btn.dataset.sku = prod.sku;
    btn.dataset.title = prod.title;

    // Click behavior
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoader();
        
        try {
            localStorage.setItem('lh360_last_product', JSON.stringify({ 
                sku: btn.dataset.sku, 
                title: btn.dataset.title, 
                ts: Date.now() 
            }));
            localStorage.setItem('lh360_selected_sku', btn.dataset.sku || '');
        } catch (e) {}

        setTimeout(() => {
            const base = 'product-details/pdp-products.html';
            const sku = encodeURIComponent(btn.dataset.sku || '');
            const section = encodeURIComponent(config.sectionId);
            window.location.href = `${base}?sku=${sku}&section=${section}`;
        }, 800);
    });

    card.appendChild(btn);
    return card;
}

// Funzione principale di caricamento
function loadProductsFromSheet() {
    // 1. Imposta stato "Loading" su tutte le griglie
    Object.values(CATEGORY_MAP).forEach(conf => {
        const grid = document.getElementById(conf.gridId);
        if (grid) grid.innerHTML = '<div class="loading">Caricamento eccellenze...</div>';
    });

    const callbackName = 'handleProducts_' + Date.now();
    const script = document.createElement('script');
    
    // Assumiamo che WEB_APP_URL sia definito in index.html, altrimenti fallback
    const url = `${WEB_APP_URL}?action=get_products&callback=${callbackName}&t=${Date.now()}`;
    
    script.src = url;

    window[callbackName] = function(data) {
        // Pulisci le griglie
        Object.values(CATEGORY_MAP).forEach(conf => {
            const grid = document.getElementById(conf.gridId);
            if (grid) grid.innerHTML = ''; 
        });

        if (!data || data.error) {
            console.error("Errore API prodotti:", data ? data.error : 'No data');
            showErrorInGrids();
            return;
        }

        if (Array.isArray(data) && data.length > 0) {
            let countMap = { 'PR': 0, 'SC': 0, 'EX': 0, 'ME': 0 };

            data.forEach(prod => {
                // Determina categoria dallo SKU (es. PR-14-V -> prefix PR)
                const prefix = prod.sku.split('-')[0];
                const config = CATEGORY_MAP[prefix];

                if (config) {
                    const grid = document.getElementById(config.gridId);
                    if (grid) {
                        const card = createProductCard(prod, config);
                        grid.appendChild(card);
                        countMap[prefix]++;
                    }
                }
            });

            // Gestione categorie vuote
            Object.keys(CATEGORY_MAP).forEach(prefix => {
                if (countMap[prefix] === 0) {
                    const conf = CATEGORY_MAP[prefix];
                    const grid = document.getElementById(conf.gridId);
                    if (grid) {
                        grid.innerHTML = `<div class="empty">Al momento non ci sono disponibilità in questa categoria.</div>`;
                    }
                }
            });

        } else {
            // Array vuoto globale
            Object.values(CATEGORY_MAP).forEach(conf => {
                const grid = document.getElementById(conf.gridId);
                if (grid) grid.innerHTML = `<div class="empty">Nessun prodotto disponibile al momento.</div>`;
            });
        }
        
        cleanupScript(script, callbackName);
    };

    script.onerror = () => {
        console.error("Errore di rete caricamento prodotti");
        showErrorInGrids();
        cleanupScript(script, callbackName);
    };

    document.body.appendChild(script);
}

function showErrorInGrids() {
    Object.values(CATEGORY_MAP).forEach(conf => {
        const grid = document.getElementById(conf.gridId);
        if (grid) grid.innerHTML = '<div class="error">Impossibile caricare i prodotti. Riprova più tardi.</div>';
    });
}

function cleanupScript(script, callbackName) {
    if (script.parentNode) script.parentNode.removeChild(script);
    delete window[callbackName];
}

// Init al load
window.addEventListener('DOMContentLoaded', () => {
    loadProductsFromSheet();
});

// --- Loader Utilities (Tuo codice esistente) ---
function injectLoader() {
    if (document.getElementById('luxhaven-loader')) return;
    const loaderHTML = `
    <div id="luxhaven-loader">
        <div class="lh-bg-gradient"></div>
        <div class="lh-loader-content">
            <img src="assets/logo-azienda.png" alt="LuxHaven360" class="lh-logo">
            <div class="lh-tagline">Curating Excellence</div>
            <div class="lh-loader-wrapper">
                <div class="lh-ring"></div><div class="lh-ring"></div><div class="lh-ring"></div>
            </div>
            <div class="lh-progress-container"><div class="lh-progress-fill"></div></div>
            <div class="lh-loading-text">Caricamento</div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
}

function hideLoaderImmediately() {
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
}

window.addEventListener('pageshow', (event) => {
    hideLoaderImmediately();
    if (event.persisted) {
        loadProductsFromSheet(); // Ricarica se torni indietro dalla cache
    }
});
window.addEventListener('load', hideLoaderImmediately);

function showLoader() {
    injectLoader();
    const loader = document.getElementById('luxhaven-loader');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
        loader.classList.remove('visible');
        void loader.offsetWidth;
        loader.classList.add('visible');
    }
}

function hideLoader() {
    const loader = document.getElementById('luxhaven-loader');
    if (loader) loader.classList.remove('visible');
}





