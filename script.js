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
        
        // Mostra filtro categorie se già caricate
if (sectionId === 'shop') {
    const filterContainer = document.getElementById('categoryFilterContainer');
    if (filterContainer && document.querySelector('.category-pill')) {
        filterContainer.style.display = 'block';
    }
}
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

    // ✅ PREZZO CON SCONTO (SE PRESENTE)
const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;

if (hasDiscount) {
    // Container prezzi
    const priceContainer = el('div', { 
        style: 'display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;' 
    });
    
    // Prezzo originale barrato
    const originalPrice = el('div', { 
        style: 'font-size: 1rem; color: #71717a; text-decoration: line-through; font-weight: 300;' 
    }, [document.createTextNode(formatPrice(prod.price, prod.currency || 'EUR'))]);
    priceContainer.appendChild(originalPrice);
    
    // Row: Prezzo scontato + Badge
    const discountRow = el('div', { 
        style: 'display: flex; align-items: center; gap: 0.75rem;' 
    });
    
    // Prezzo scontato dorato
    const discountedPrice = el('div', { 
        style: `font-size: 1.75rem; font-weight: 700; letter-spacing: 0.02em; 
                background: linear-gradient(135deg, #D4AF37, #FFD700);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;` 
    }, [document.createTextNode(formatPrice(prod.discountPrice, prod.currency || 'EUR'))]);
    discountRow.appendChild(discountedPrice);
    
    // Badge sconto percentuale
    const discountPercent = Math.round(((prod.price - prod.discountPrice) / prod.price) * 100);
    const badge = el('span', { 
        style: `display: inline-block; background: linear-gradient(135deg, #D4AF37, #FFD700);
                color: #09090b; padding: 0.375rem 0.875rem; border-radius: 2rem;
                font-size: 0.875rem; font-weight: 600; letter-spacing: 0.05em;
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);` 
    }, [document.createTextNode(`-${discountPercent}%`)]);
    discountRow.appendChild(badge);
    
    priceContainer.appendChild(discountRow);
    card.appendChild(priceContainer);
} else {
    // Prezzo normale (senza sconto)
    const priceText = el('div', { class: 'card-price' }, [
        document.createTextNode(prod.price != null && prod.price > 0 
            ? formatPrice(prod.price, prod.currency || 'EUR') 
            : (prod.price_text || 'Contattaci'))
    ]);
    card.appendChild(priceText);
}

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
 * NUOVA FUNZIONE UNIFICATA (Fetch API)
 * Scarica i prodotti usando fetch() invece di <script>.
 * Risolve i blocchi "ERR_BLOCKED_BY_CLIENT" e i problemi di rete mobile.
 */
async function initDynamicProducts(retryCount = 0) {
    // 1. Imposta lo stato di caricamento su tutte le griglie (solo al primo tentativo)
    const grids = {};
    SECTIONS.forEach(section => {
        const gridEl = document.getElementById(section.gridId);
        if (gridEl) {
            if (retryCount === 0) {
                // Loader visivo
                gridEl.innerHTML = '<div class="loading"><div class="lh-ring"></div><br>Caricamento prodotti...</div>';
            }
            grids[section.id] = gridEl;
        }
    });

    // 2. Prepara l'URL
    // NOTA: Rimuoviamo 'callback' per ricevere JSON puro, non JSONP.
    // Aggiungiamo 'r' per evitare la cache del browser tra i tentativi.
    const apiUrl = `${WEB_APP_URL}?action=get_products&category=all&t=${Date.now()}&r=${retryCount}`;

    try {
        // --- CHIAMATA FETCH (Più robusta di script tag) ---
        const response = await fetch(apiUrl, {
            method: 'GET',
            redirect: 'follow' // Segue automaticamente il redirect 302 di Google
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json(); // Converte la risposta in JSON

        // 3. Verifica successo logico
        if (!data.success || !data.products) {
            throw new Error(data.error || 'Dati non validi dal server');
        }

        // 4. Pulizia e Rendering
        Object.values(grids).forEach(g => g.innerHTML = ''); // Rimuove loader

        const allProducts = data.products || [];
        const countBySection = {};

        // Distribuzione prodotti nelle sezioni
        allProducts.forEach(prod => {
            const targetSection = SECTIONS.find(s => s.id === prod.category);
            
            if (targetSection && grids[targetSection.id]) {
                prod.sectionName = targetSection.id;
                const card = createProductCard(prod, targetSection.defaultCta);
                grids[targetSection.id].appendChild(card);
                countBySection[targetSection.id] = (countBySection[targetSection.id] || 0) + 1;
            }
        });

        // Gestione sezioni vuote
        SECTIONS.forEach(section => {
            if (!countBySection[section.id] && grids[section.id]) {
                grids[section.id].innerHTML = `<div class="empty" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.5;">Nessun prodotto disponibile al momento.</div>`;
            }
        });

    } catch (error) {
        console.warn(`Tentativo ${retryCount + 1} fallito:`, error);

        // --- LOGICA DI RETRY ---
        if (retryCount < 2) {
            const delay = 1500 * (retryCount + 1); // Attesa incrementale
            console.log(`Riprovo tra ${delay}ms...`);
            setTimeout(() => {
                initDynamicProducts(retryCount + 1);
            }, delay);
        } else {
            // Fallimento definitivo
            showErrorInAllGrids();
        }
    }
}

// Funzione helper per mostrare l'errore grafico
function showErrorInAllGrids() {
    SECTIONS.forEach(section => {
        const gridEl = document.getElementById(section.gridId);
        if (gridEl) {
            gridEl.innerHTML = `
                <div class="error-container" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
                    <div style="color: #ff6b6b; font-size: 1.5rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="color: #fafafa; margin-bottom: 1.5rem;">Impossibile caricare i prodotti.</div>
                    <button onclick="window.location.reload()" class="btn" style="background: #D4AF37; color: #000; border:none; padding: 0.8rem 1.5rem; cursor: pointer;">
                        Ricarica Pagina
                    </button>
                </div>`;
        }
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
    // Se la pagina viene ripristinata dalla cache (tasto indietro)
    if (event.persisted) {
        // Nascondi eventuali loader dinamici
        hideLoaderImmediately();
        
        // Mostra il loader intro originale
        const introLoader = document.getElementById('intro-loader');
        if (introLoader) {
            introLoader.style.display = 'flex';
            introLoader.style.opacity = '1';
            document.body.style.overflow = 'hidden';
            
            // Ricarica i prodotti e poi nascondi il loader
            initDynamicProducts().then(() => {
                setTimeout(() => {
                    introLoader.style.opacity = '0';
                    document.body.style.overflow = '';
                    setTimeout(() => {
                        introLoader.style.display = 'none';
                    }, 400);
                }, 800);
            });
        }
    } else {
        hideLoaderImmediately();
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

// =============================
// FILTRO CATEGORIE SHOP
// =============================

let currentShopCategory = null; // Categoria attualmente selezionata

/**
 * Carica le categorie dal backend e popola il filtro
 */
async function loadShopCategories() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=get_shop_categories&t=${Date.now()}`);
        const data = await response.json();
        
        if (!data.success || !data.categories || data.categories.length === 0) {
            console.log('Nessuna categoria trovata o errore:', data);
            return;
        }
        
        renderCategoryFilter(data.categories);
        
    } catch (error) {
        console.error('Errore caricamento categorie:', error);
    }
}

/**
 * Renderizza i pulsanti del filtro categorie
 */
function renderCategoryFilter(categories) {
    const container = document.getElementById('categoryFilterContainer');
    const pillsContainer = document.getElementById('categoryPills');
    const resetBtn = document.getElementById('filterResetBtn');
    
    if (!container || !pillsContainer) return;
    
    // Pulisci container
    pillsContainer.innerHTML = '';
    
    // Crea pulsante per ogni categoria
    categories.forEach(cat => {
        const pill = document.createElement('button');
        pill.className = 'category-pill';
        pill.dataset.category = cat.name;
        pill.innerHTML = `
            ${cat.name}
            <span class="count">${cat.count}</span>
        `;
        
        pill.addEventListener('click', () => {
            filterShopByCategory(cat.name, pill);
        });
        
        pillsContainer.appendChild(pill);
    });
    
    // Mostra il container con animazione
    container.style.display = 'block';
    
    // Event listener per reset
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCategoryFilter);
    }
}

/**
 * Filtra i prodotti dello shop per categoria
 */
function filterShopByCategory(categoryName, pillElement) {
    const shopGrid = document.getElementById('shopGrid');
    if (!shopGrid) return;
    
    // Aggiorna stato categoria
    currentShopCategory = categoryName;
    
    // Aggiorna UI pills
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    if (pillElement) pillElement.classList.add('active');
    
    // Mostra pulsante reset
    const resetBtn = document.getElementById('filterResetBtn');
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    
    // Filtra cards
    const cards = shopGrid.querySelectorAll('.card');
    cards.forEach(card => {
        const btn = card.querySelector('button[data-sku]');
        if (!btn) return;
        
        const sku = btn.dataset.sku || '';
        const skuPrefix = sku.split('-')[0];
        
        // Verifica se il prodotto appartiene alla categoria (usa cache o richiedi)
        checkProductCategory(sku).then(prodCategory => {
            if (prodCategory === categoryName) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Scroll smooth al grid
    shopGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Reset filtro - mostra tutti i prodotti
 */
function resetCategoryFilter() {
    currentShopCategory = null;
    
    // Rimuovi active da pills
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    
    // Nascondi pulsante reset
    const resetBtn = document.getElementById('filterResetBtn');
    if (resetBtn) resetBtn.style.display = 'none';
    
    // Mostra tutte le cards
    const shopGrid = document.getElementById('shopGrid');
    if (shopGrid) {
        const cards = shopGrid.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        });
    }
}

/**
 * Verifica la categoria di un prodotto tramite SKU
 * (usa cache localStorage per evitare troppe chiamate)
 */
async function checkProductCategory(sku) {
    // Cache semplice
    const cacheKey = `cat_${sku}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;
    
    try {
        const response = await fetch(`${WEB_APP_URL}?action=get_product_details&sku=${encodeURIComponent(sku)}&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.success && data.product && data.product.category) {
            const category = data.product.category;
            sessionStorage.setItem(cacheKey, category);
            return category;
        }
    } catch (error) {
        console.error('Errore recupero categoria per SKU:', sku, error);
    }
    
    return null;
}

