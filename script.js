// --- Nav & UI (tuo script esistente mantenuto e ampliato) ---

// Navigation
function showSection(sectionId) {
    console.log(`🔀 Cambio sezione: ${sectionId}`);
    
    // ✅ STEP 1: NASCONDI TUTTE LE SEZIONI E HERO
    document.querySelectorAll('.section, .hero').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; // ✅ FORZA NASCONDIMENTO
    });
    
    // ✅ STEP 2: MOSTRA SOLO LA SEZIONE RICHIESTA
    if (sectionId === 'home') {
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.display = 'flex';
            hero.classList.add('active');
        }
    } else {
        // Nascondi hero se si va su altra sezione
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.display = 'none';
            hero.classList.remove('active');
        }
        
        // Mostra la sezione target
        const el = document.getElementById(sectionId);
        if (el) {
            el.classList.add('active');
            el.style.display = 'block';
            el.style.opacity = '1';
        }
        
        // ✅ MOSTRA FILTRO CATEGORIE SE SHOP
        if (sectionId === 'shop') {
            const filterContainer = document.getElementById('categoryFilterContainer');
            if (filterContainer && document.querySelector('.category-pill')) {
                filterContainer.style.display = 'block';
            }
        }
    }
    
    // ✅ CHIUDI MENU MOBILE
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('active');
    
    // ✅ SCROLL TO TOP
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log(`✅ Sezione "${sectionId}" attiva`);
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

/**
 * Formatta il prezzo con separatore migliaia MANUALE (più robusto)
 * Output: "1.265 €" per index.html
 */
function formatPrice(price, currency = 'EUR') {
    const amount = parseFloat(price) || 0;
    
    // Determina decimali
    let decimals = 0;
    if (amount < 100) decimals = 2;
    else if (amount < 500) decimals = 2;
    else if (amount < 1000) decimals = amount % 1 !== 0 ? 2 : 0; // Decimali solo se necessari
    else decimals = 0; // Da 1000 in su: mai decimali
    
    // Formatta manualmente
    let formatted = amount.toFixed(decimals);
    
    // Sostituisci punto decimale con virgola
    formatted = formatted.replace('.', ',');
    
    // Aggiungi separatore migliaia (punto)
    let parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Simbolo valuta
    const symbol = currency === 'EUR' ? '€' : currency;
    
    return `${parts.join(',')} ${symbol}`;
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

    // ✅ AGGIUNGI CATEGORIA COME DATA ATTRIBUTE PER FILTRO IMMEDIATO
    if (prod.shopCategory) {
  card.dataset.shopCategory = prod.shopCategory;
  console.log(`🏷️ Card creata: ${prod.title} → Categoria: ${prod.shopCategory}`);
}

    // title
    const title = el('h3', { class: 'card-title' }, [document.createTextNode(prod.title || 'Untitled')]);
    card.appendChild(title);

    // desc: usa briefDesc per card index
const descText = prod.briefDesc || prod.desc || '';
const desc = el('p', { class: 'card-desc' }, [document.createTextNode(descText)]);
card.appendChild(desc);

    // GESTIONE PREZZO SPECIALE PER IMMOBILI
    const isProperty = prod.category === 'properties';
    const isSupercarOrExperience = prod.category === 'supercars' || prod.category === 'stays';

if (isProperty) {
    // Design premium per IMMOBILI: prezzo su richiesta
    const priceContainer = el('div', { 
        class: 'property-price-container',
        style: `
            margin: 1.5rem 0;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(255, 215, 0, 0.05));
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 12px;
            text-align: center;
        `
    });
    
    const priceSymbol = el('div', { 
        style: `
            font-size: 2.5rem;
            font-weight: 300;
            background: linear-gradient(135deg, #D4AF37, #FFD700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 2px;
            margin-bottom: 0.5rem;
        `
    }, [document.createTextNode('€ —')]);
    
    const priceLabel = el('div', { 
        style: `
            font-size: 0.9rem;
            color: #c9a891;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 500;
        `
    }, [document.createTextNode('Su Richiesta')]);
    
    priceContainer.appendChild(priceSymbol);
    priceContainer.appendChild(priceLabel);
    card.appendChild(priceContainer);
    
    // Badge esclusivo per IMMOBILI
    card.classList.add('property-premium-card');
} else {
    // Logica normale per SUPERCAR/ESPERIENZE/SHOP
    const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;

    if (hasDiscount) {
        // ... codice esistente prezzo scontato ...
        const priceContainer = el('div', { 
            style: 'display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;' 
        });
        
        const originalPrice = el('div', { 
            style: 'font-size: 1rem; color: #71717a; text-decoration: line-through; font-weight: 300;' 
        }, [document.createTextNode(formatPrice(prod.price, prod.currency || 'EUR'))]);
        priceContainer.appendChild(originalPrice);
        
        const discountRow = el('div', { 
            style: 'display: flex; align-items: center; gap: 0.75rem;' 
        });
        
        const discountedPrice = el('div', { 
            style: `font-size: 1.75rem; font-weight: 700; letter-spacing: 0.02em; 
                    background: linear-gradient(135deg, #D4AF37, #FFD700);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    background-clip: text;` 
        }, [document.createTextNode(formatPrice(prod.discountPrice, prod.currency || 'EUR'))]);
        discountRow.appendChild(discountedPrice);
        
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
    // Prezzo normale con formattazione italiana
    let priceDisplay;
    if (prod.price != null && prod.price > 0) {
        priceDisplay = formatPrice(prod.price, prod.currency || 'EUR');
    } else {
        priceDisplay = prod.price_text || 'Contattaci';
    }
    
    const priceText = el('div', { class: 'card-price' }, [
        document.createTextNode(priceDisplay)
    ]);
    card.appendChild(priceText);
}
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
    
    const sku = btn.dataset.sku || '';
    const skuPrefix = sku.split('-')[0].toUpperCase();
    
    // ✅ Prodotti prenotabili → booking.html
    if (['SC', 'PR', 'EX'].includes(skuPrefix)) {
        window.location.href = `product-details/booking.html?sku=${encodeURIComponent(sku)}`;
    } 
    // ✅ Prodotti shop → pdp-products.html
    else {
        try {
            localStorage.setItem('lh360_last_product', JSON.stringify({ sku: sku, title: btn.dataset.title, ts: Date.now() }));
            localStorage.setItem('lh360_selected_sku', sku);
        } catch (e) {}
        
        setTimeout(() => {
            const base = 'product-details/pdp-products.html';
            const section = encodeURIComponent(prod.sectionName || prod.category || 'shop');
            window.location.href = `${base}?sku=${encodeURIComponent(sku)}&section=${section}`;
        }, 500);
    }
});

    card.appendChild(btn);
    return card;
}

// =========================================
// FILTRI IMMOBILI E SUPERCAR
// =========================================

let activePropertyFilter = null;
let activeSupercarFilter = null;

/**
 * Estrae il tipo di proprietà dallo SKU
 * @param {string} sku - Es: "PR-001-V", "PR-145-C"
 * @returns {string} - 'V', 'C', 'A', o null
 */
function extractPropertyTypeFromSKU(sku) {
    if (!sku || typeof sku !== 'string') return null;
    
    // Format: PR-XXX-T dove T = tipo (V, C, A)
    const match = sku.match(/^PR-\d+-([VCA])$/i);
    return match ? match[1].toUpperCase() : null;
}

/**
 * Determina se una supercar è combo (doppia)
 * @param {string} sku - Es: "SC-001 + SC-006" o "SC-003"
 * @returns {string} - 'combo' o 'single'
 */
function getSupercarType(sku) {
    if (!sku || typeof sku !== 'string') return 'single';
    
    // Combo se contiene " + "
    return sku.includes(' + ') || sku.includes('+') ? 'combo' : 'single';
}

/**
 * Inizializza filtri immobili
 */
function initPropertyFilters(products) {
    const container = document.getElementById('propertyFilterContainer');
    if (!container) return;
    
    // Conta prodotti per tipo
    const counts = { V: 0, C: 0, A: 0 };
    
    products.forEach(p => {
        const type = extractPropertyTypeFromSKU(p.sku);
        if (type && counts.hasOwnProperty(type)) {
            counts[type]++;
        }
    });
    
    // Aggiorna contatori UI
    document.querySelectorAll('.filter-pill[data-property-type]').forEach(pill => {
        const type = pill.dataset.propertyType;
        const countSpan = pill.querySelector('.pill-count');
        if (countSpan) countSpan.textContent = counts[type] || 0;
        
        // Click handler
        pill.addEventListener('click', () => filterProperties(type, pill));
    });
    
    // Reset button
    const resetBtn = document.getElementById('propertyResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPropertyFilter);
    }
    
    container.style.display = 'block';
}

/**
 * Filtra immobili per tipo
 */
function filterProperties(type, pillElement) {
    const grid = document.getElementById('propertiesGrid');
    if (grid) grid.style.opacity = '0';
    
    activePropertyFilter = type;
    localStorage.setItem('lh360_active_property_filter', type);
    
    // UI pills
    document.querySelectorAll('.filter-pill[data-property-type]').forEach(p => p.classList.remove('active'));
    if (pillElement) pillElement.classList.add('active');
    
    // Mostra reset
    const resetBtn = document.getElementById('propertyResetBtn');
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    
    if (!grid) return;
    
    const cards = grid.querySelectorAll('.card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardSku = card.dataset.sku || card.querySelector('button')?.dataset?.sku;
        const cardType = extractPropertyTypeFromSKU(cardSku);
        
        if (cardType === type) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`🏰 Filtro Immobili: ${type} → ${visibleCount} risultati`);

    // ✅ MOSTRA GRID DOPO FILTRO
    grid.style.transition = 'opacity 0.4s ease';
    grid.style.opacity = '1';

    setTimeout(() => {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Reset filtro immobili
 */
function resetPropertyFilter() {
    activePropertyFilter = null;
    localStorage.removeItem('lh360_active_property_filter');
    
    document.querySelectorAll('.filter-pill[data-property-type]').forEach(p => p.classList.remove('active'));
    
    const resetBtn = document.getElementById('propertyResetBtn');
    if (resetBtn) resetBtn.style.display = 'none';
    
    const grid = document.getElementById('propertiesGrid');
    if (grid) {
        grid.querySelectorAll('.card').forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        });
    }
}

/**
 * Inizializza filtri supercar
 */
function initSupercarFilters(products) {
    const container = document.getElementById('supercarFilterContainer');
    if (!container) return;
    
    // Conta prodotti per tipo
    const counts = { single: 0, combo: 0 };
    
    products.forEach(p => {
        const type = getSupercarType(p.sku);
        counts[type]++;
    });
    
    // Aggiorna contatori UI
    document.querySelectorAll('.filter-pill[data-supercar-type]').forEach(pill => {
        const type = pill.dataset.supercarType;
        const countSpan = pill.querySelector('.pill-count');
        if (countSpan) countSpan.textContent = counts[type] || 0;
        
        // Click handler
        pill.addEventListener('click', () => filterSupercars(type, pill));
    });
    
    // Reset button
    const resetBtn = document.getElementById('supercarResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSupercarFilter);
    }
    
    container.style.display = 'block';
}

/**
 * Filtra supercar per tipo
 */
function filterSupercars(type, pillElement) {
    const grid = document.getElementById('supercarsGrid');
    if (grid) grid.style.opacity = '0';
    
    activeSupercarFilter = type;
    localStorage.setItem('lh360_active_supercar_filter', type);
    
    // UI pills
    document.querySelectorAll('.filter-pill[data-supercar-type]').forEach(p => p.classList.remove('active'));
    if (pillElement) pillElement.classList.add('active');
    
    // Mostra reset
    const resetBtn = document.getElementById('supercarResetBtn');
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    
    if (!grid) return;
    
    const cards = grid.querySelectorAll('.card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardSku = card.dataset.sku || card.querySelector('button')?.dataset?.sku;
        const cardType = getSupercarType(cardSku);
        
        if (cardType === type) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`🏎️ Filtro Supercar: ${type} → ${visibleCount} risultati`);

    // ✅ MOSTRA GRID DOPO FILTRO
    grid.style.transition = 'opacity 0.4s ease';
    grid.style.opacity = '1';

    setTimeout(() => {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Reset filtro supercar
 */
function resetSupercarFilter() {
    activeSupercarFilter = null;
    localStorage.removeItem('lh360_active_supercar_filter');
    
    document.querySelectorAll('.filter-pill[data-supercar-type]').forEach(p => p.classList.remove('active'));
    
    const resetBtn = document.getElementById('supercarResetBtn');
    if (resetBtn) resetBtn.style.display = 'none';
    
    const grid = document.getElementById('supercarsGrid');
    if (grid) {
        grid.querySelectorAll('.card').forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        });
    }
}

/**
 * NUOVA FUNZIONE UNIFICATA (Fetch API)
 * Scarica prodotti SHOP + BOOKABLE e li distribuisce nelle sezioni
 */
 async function initDynamicProducts(retryCount = 0) {
    // ✅ 1. PULIZIA FORZATA DI TUTTE LE GRIGLIE (SEMPRE, anche su retry)
    const grids = {};
    SECTIONS.forEach(section => {
        const gridEl = document.getElementById(section.gridId);
        if (gridEl) {
            // ✅ Pulisci SEMPRE per evitare duplicazioni (anche su bfcache restore)
            gridEl.innerHTML = '';
            gridEl.style.opacity = '0';
            grids[section.id] = gridEl;
        }
    });
    
    // 2. Mostra loader solo al primo tentativo
    if (retryCount === 0) {
        Object.values(grids).forEach(g => {
            g.innerHTML = '<div class="loading"><div class="lh-ring"></div><br>Caricamento prodotti...</div>';
        });
    }

    try {
        // === 3. CHIAMATE PARALLELE (shop + bookable) ===
        const shopPromise = fetch(`${WEB_APP_URL}?action=get_products&category=shop&t=${Date.now()}&r=${retryCount}`)
            .then(res => res.json());
        
        const bookablePromise = fetch(`${WEB_APP_URL}?action=get_bookable_products&category=all&t=${Date.now()}&r=${retryCount}`)
            .then(res => res.json());

        const [shopData, bookableData] = await Promise.all([shopPromise, bookablePromise]);

        const countBySection = {};
        
        // ✅ LEGGI FILTRI ATTIVI PRIMA DI RENDERIZZARE
        const activeShopFilter = localStorage.getItem('lh360_active_shop_filter');
        const activePropertyFilter = localStorage.getItem('lh360_active_property_filter');
        const activeSupercarFilter = localStorage.getItem('lh360_active_supercar_filter');

        // === 4a. RENDERING PRODOTTI SHOP CON FILTRO PRE-APPLICATO ===
        if (shopData.success && shopData.products) {
            shopData.products.forEach(prod => {
                if (prod.category === 'shop' && grids.shop) {
                    prod.sectionName = 'shop';
                    const card = createProductCard(prod, 'Acquista');
                    
                    // ✅ APPLICA FILTRO IMMEDIATAMENTE
                    if (activeShopFilter && prod.shopCategory !== activeShopFilter) {
                        card.style.display = 'none';
                    }
                    
                    grids.shop.appendChild(card);
                    countBySection.shop = (countBySection.shop || 0) + 1;
                }
            });
            
            // ✅ RIPRISTINA UI DEL FILTRO SE ATTIVO
            if (activeShopFilter) {
                const targetPill = document.querySelector(`.category-pill[data-category="${activeShopFilter}"]`);
                if (targetPill) {
                    targetPill.classList.add('active');
                    const resetBtn = document.getElementById('filterResetBtn');
                    if (resetBtn) resetBtn.style.display = 'inline-flex';
                }
            }
        }

        // === 4b. RENDERING PRODOTTI BOOKABLE CON FILTRI PRE-APPLICATI ===
if (bookableData.success && bookableData.products) {
    const propertyProducts = [];
    const supercarProducts = [];
    
    bookableData.products.forEach(prod => {
        const targetSection = SECTIONS.find(s => s.id === prod.category);
        
        if (targetSection && grids[targetSection.id]) {
            prod.sectionName = targetSection.id;
            prod.icon = prod.mainImage || '📦';
            
            const card = createProductCard(prod, targetSection.defaultCta);
            card.dataset.sku = prod.sku;
            
            // ✅ RACCOGLI PRODOTTI PER CONTEGGIO FILTRI (UNA SOLA VOLTA!)
            if (prod.category === 'properties') {
                propertyProducts.push(prod);
                
                // Applica filtro se attivo
                if (activePropertyFilter) {
                    const cardType = extractPropertyTypeFromSKU(prod.sku);
                    if (cardType !== activePropertyFilter) {
                        card.style.display = 'none';
                    }
                }
            }
            
            if (prod.category === 'supercars') {
                supercarProducts.push(prod);
                
                // Applica filtro se attivo
                if (activeSupercarFilter) {
                    const cardType = getSupercarType(prod.sku);
                    if (cardType !== activeSupercarFilter) {
                        card.style.display = 'none';
                    }
                }
            }
            
            // ✅ ESPERIENZE: SEMPRE VISIBILI (nessun filtro)
            if (prod.category === 'stays') {
                card.style.display = 'block';
            }
            
            grids[targetSection.id].appendChild(card);
            countBySection[targetSection.id] = (countBySection[targetSection.id] || 0) + 1;
        }
    });
    
    // ✅ INIZIALIZZA FILTRI E RIPRISTINA UI
    if (propertyProducts.length > 0) {
        initPropertyFilters(propertyProducts);
        
        if (activePropertyFilter) {
            const targetPill = document.querySelector(`.filter-pill[data-property-type="${activePropertyFilter}"]`);
            if (targetPill) {
                targetPill.classList.add('active');
                const resetBtn = document.getElementById('propertyResetBtn');
                if (resetBtn) resetBtn.style.display = 'inline-flex';
            }
        }
    }
    
    if (supercarProducts.length > 0) {
        initSupercarFilters(supercarProducts);
        
        if (activeSupercarFilter) {
            const targetPill = document.querySelector(`.filter-pill[data-supercar-type="${activeSupercarFilter}"]`);
            if (targetPill) {
                targetPill.classList.add('active');
                const resetBtn = document.getElementById('supercarResetBtn');
                if (resetBtn) resetBtn.style.display = 'inline-flex';
            }
        }
    }
}

        // 5. Gestione sezioni vuote
        SECTIONS.forEach(section => {
            if (!countBySection[section.id] && grids[section.id]) {
                grids[section.id].innerHTML = `<div class="empty" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.5;">Nessun prodotto disponibile al momento.</div>`;
            }
        });

        // 6. ✅ MOSTRA TUTTE LE GRIGLIE IMMEDIATAMENTE
        Object.values(grids).forEach(g => {
            g.style.transition = 'opacity 0.3s ease';
            g.style.opacity = '1';
        });

    } catch (error) {
        console.warn(`Tentativo ${retryCount + 1} fallito:`, error);

        if (retryCount < 2) {
            const delay = 1500 * (retryCount + 1);
            console.log(`Riprovo tra ${delay}ms...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    initDynamicProducts(retryCount + 1).then(resolve).catch(resolve);
                }, delay);
            });
        } else {
            showErrorInAllGrids();
            return Promise.reject(error);
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
    
    // ✅ AGGIUNGI QUESTO BLOCCO ALLA FINE DELLA FUNZIONE
    // Ripristina filtro salvato (se presente)
    const savedFilter = localStorage.getItem('lh360_active_shop_filter');
    if (savedFilter) {
        // Trova la pill corrispondente
        const targetPill = Array.from(pillsContainer.querySelectorAll('.category-pill'))
            .find(p => p.dataset.category === savedFilter);
        
        if (targetPill) {
            // Aspetta che i prodotti siano caricati prima di filtrare
            setTimeout(() => {
                filterShopByCategory(savedFilter, targetPill);
            }, 100);
        }
    }
}

/**
 * Filtra i prodotti dello shop per categoria
 */
function filterShopByCategory(categoryName, pillElement) {
  const shopGrid = document.getElementById('shopGrid');
  if (!shopGrid) return;
  
  currentShopCategory = categoryName;
  localStorage.setItem('lh360_active_shop_filter', categoryName);
  
  // Aggiorna UI pills
  document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
  if (pillElement) pillElement.classList.add('active');
  
  // Mostra pulsante reset
  const resetBtn = document.getElementById('filterResetBtn');
  if (resetBtn) resetBtn.style.display = 'inline-flex';
  
  // ✅ FILTRO IMMEDIATO USANDO DATA ATTRIBUTE
  const cards = shopGrid.querySelectorAll('.card');
  cards.forEach(card => {
    const cardCategory = card.dataset.shopCategory || '';
    
    if (cardCategory === categoryName) {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.5s ease';
    } else {
      card.style.display = 'none';
    }
  });
  
  // ✅ MOSTRA LA GRIGLIA DOPO AVER FILTRATO
  shopGrid.style.transition = 'opacity 0.4s ease';
  shopGrid.style.opacity = '1';
  
  // Scroll smooth al grid
  setTimeout(() => {
    shopGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * Reset filtro - mostra tutti i prodotti
 */
function resetCategoryFilter() {
    currentShopCategory = null;
    localStorage.removeItem('lh360_active_shop_filter');
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




















