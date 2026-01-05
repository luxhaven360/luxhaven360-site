function showSection(sectionId) {
    console.log(`🔀 Cambio sezione: ${sectionId}`);
    
    // ✅ STEP 1: PAUSA TUTTI I VIDEO ATTIVI (cleanup)
    document.querySelectorAll('video').forEach(video => {
        video.pause();
        video.currentTime = 0; // Reset al frame iniziale
    });
    
    // ✅ STEP 2: NASCONDI TUTTE LE SEZIONI E HERO
    document.querySelectorAll('.section, .hero').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    // ✅ STEP 3: MOSTRA SOLO LA SEZIONE RICHIESTA
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
            
            // ✅ NUOVO: Avvia video nella sezione appena aperta
            setTimeout(() => {
                playVideosInSection(el);
            }, 100); // Piccolo delay per garantire rendering
        }
        
        // ✅ MOSTRA FILTRO CATEGORIE SE SHOP
        if (sectionId === 'shop') {
            const filterContainer = document.getElementById('categoryFilterContainer');
            if (filterContainer && document.querySelector('.category-pill')) {
                filterContainer.style.display = 'block';
            }
        }
        
        // ✅ RIPRISTINA FILTRI IMMOBILI/SUPERCAR AL CAMBIO SEZIONE
        if (sectionId === 'properties' || sectionId === 'supercars') {
            console.log(`🔄 Cambio sezione: ${sectionId}, ripristino filtri`);
            setTimeout(() => {
                restoreBookableFilters();
            }, 300);
        }
    }
    
    // ✅ CHIUDI MENU MOBILE
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('active');
    
    // ✅ SCROLL TO TOP
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log(`✅ Sezione "${sectionId}" attiva`);
}

/**
 * 🎬 Avvia automaticamente tutti i video in una sezione
 * @param {HTMLElement} section - Elemento DOM della sezione
 */
function playVideosInSection(section) {
    if (!section) return;
    
    const videos = section.querySelectorAll('video');
    
    videos.forEach(video => {
        // Reset video
        video.currentTime = 0;
        
        // Imposta attributi per autoplay (sicurezza cross-browser)
        video.muted = true;
        video.playsInline = true;
        
        // Prova ad avviare il video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ Video avviato:', video.src);
                })
                .catch(error => {
                    console.warn('⚠️ Autoplay bloccato dal browser:', error);
                    
                    // Fallback: Tentativo di play al primo click/touch dell'utente
                    const playOnInteraction = () => {
                        video.play().catch(e => console.error('Play fallito:', e));
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('touchstart', playOnInteraction);
                    };
                    
                    document.addEventListener('click', playOnInteraction, { once: true });
                    document.addEventListener('touchstart', playOnInteraction, { once: true });
                });
        }
    });
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

  // ========================================
// ✅ GESTIONE STATI ESPERIENZE (SOLO EX)
// ========================================
const isExperience = prod.category === 'stays';
let experienceClass = '';
let disableBooking = false;
let badgeHtml = '';

if (isExperience) {
  // ✅ NORMALIZZA STATO PER CONFRONTO ROBUSTO
  const statoNormalized = (prod.statoNormalized || prod.stato || '').toLowerCase().replace(/\s+/g, ' ');
  
  console.log(`🎯 Esperienza: ${prod.title} - Stato originale: "${prod.stato}" - Normalizzato: "${statoNormalized}"`);
  
  // CASO 1: Esperienza SCADUTA
  if (prod.isScaduta) {
    experienceClass = 'experience-expired';
    disableBooking = true;
    badgeHtml = `
      <div class="experience-badge badge-expired">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Esperienza Conclusa</span>
      </div>`;
    console.log(`  → Applicato: SCADUTA`);
  } 
  // CASO 2: Esperienza PRESTO DISPONIBILE / IN ARRIVO (CONFRONTO NORMALIZZATO)
  else if (statoNormalized === 'presto disponibile' || statoNormalized === 'in arrivo') {
    experienceClass = 'experience-coming-soon';
    badgeHtml = `
      <div class="experience-badge badge-coming-soon">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Presto Disponibile</span>
      </div>`;
    console.log(`  → Applicato: PRESTO DISPONIBILE`);
  }
  // CASO 3: Esperienza NUOVA (ex-presto disponibili)
  else if (prod.isNuova) {
    badgeHtml = `
      <div class="experience-badge badge-new">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
        </svg>
        <span>Nuovo</span>
      </div>`;
    console.log(`  → Applicato: NUOVO`);
  } else {
    console.log(`  → Nessun badge applicato (stato: "${statoNormalized}")`);
  }
  
  // Aggiungi classe CSS alla card
  if (experienceClass) {
    card.classList.add(experienceClass);
  }
}

    // 🆕 APPLICA FILTRI IMMEDIATAMENTE DURANTE LA CREAZIONE
    const savedShopFilter = localStorage.getItem('lh360_active_shop_filter');
    const savedPropertyFilter = localStorage.getItem('lh360_active_property_filter');
    const savedSupercarFilter = localStorage.getItem('lh360_active_supercar_filter');
    
    let shouldHide = false;
    
    // Filtro SHOP
    if (savedShopFilter && prod.category === 'shop') {
        if (prod.shopCategory !== savedShopFilter) {
            shouldHide = true;
        }
    }
    
    // Filtro PROPERTIES
    if (savedPropertyFilter && prod.category === 'properties') {
        const propType = extractPropertyTypeFromSKU(prod.sku);
        if (propType !== savedPropertyFilter) {
            shouldHide = true;
        }
    }
    
    // Filtro SUPERCARS
    if (savedSupercarFilter && prod.category === 'supercars') {
        const supercarType = getSupercarType(prod.sku);
        if (supercarType !== savedSupercarFilter) {
            shouldHide = true;
        }
    }
    
    // Applica nascondimento IMMEDIATO
    if (shouldHide) {
        card.style.display = 'none';
    }

    // image/icon
    const imageContainer = el('div', { class: 'card-image' });
    
    if (prod.icon && typeof prod.icon === 'string' && prod.icon.includes('drive.google.com')) {
        const img = el('img', { 
            src: prod.icon, 
            alt: prod.title, 
            style: 'width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;',
            loading: 'lazy',
            referrerpolicy: 'no-referrer'
        });
        
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
        imageContainer.textContent = prod.icon || '📦';
        imageContainer.style.display = 'flex';
        imageContainer.style.alignItems = 'center';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.fontSize = '3rem';
    }

    // ✅ Aggiungi badge se esperienza
     if (badgeHtml) {
         imageContainer.innerHTML += badgeHtml;
     }
    
    card.appendChild(imageContainer);

    // Aggiungi categoria come data attribute
    if (prod.shopCategory) {
        card.dataset.shopCategory = prod.shopCategory;
    }
    
    // Aggiungi SKU come data attribute
    card.dataset.sku = prod.sku;

    // 🏆 IDENTIFICAZIONE LIMITED EDITIONS
if (prod.shopCategory === 'Limited Editions') {
    card.classList.add('limited-edition-card');
    
    // Aggiungi contatore limitato (se disponibile nel foglio)
    if (prod.limitedCount) {
        card.dataset.limitedCount = prod.limitedCount; // es: "15/50"
    }
}

    // title
    const title = el('h3', { class: 'card-title' }, [document.createTextNode(prod.title || 'Untitled')]);
    card.appendChild(title);

    // desc
    const descText = prod.briefDesc || prod.desc || '';
    const desc = el('p', { class: 'card-desc' }, [document.createTextNode(descText)]);
    card.appendChild(desc);

// ✅ NUOVO: Badge disponibilità per prodotti SHOP
if (prod.category === 'shop' && typeof prod.availability === 'number') {
  const availabilityBadge = el('div', { 
    class: 'availability-badge' + (prod.availability === 0 ? ' out-of-stock' : prod.availability <= 5 ? ' low-stock' : '')
  });
  
  if (prod.availability === 0) {
    availabilityBadge.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span>Esaurito</span>
    `;
  } else if (prod.availability <= 5) {
    availabilityBadge.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <span>Ultimi ${prod.availability} pezzi</span>
    `;
  }
  
  card.appendChild(availabilityBadge);
}

// GESTIONE PREZZO
const isProperty = prod.category === 'properties';

    // GESTIONE PREZZO
    const isProperty = prod.category === 'properties';

    if (isProperty) {
        // Design premium per IMMOBILI
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
        
        card.classList.add('property-premium-card');
    } else {
        const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;

        if (hasDiscount) {
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

    // button
    const btn = el('button', { class: 'btn', style: 'margin-top: 1.5rem; width: 100%;' }, [document.createTextNode(prod.cta || defaultCta || 'Scopri')]);

    btn.dataset.sku = prod.sku || '';
    btn.dataset.title = prod.title || '';
    if (prod.stripe_link) btn.dataset.stripeLink = prod.stripe_link;
    if (prod.action) btn.dataset.action = prod.action;

    btn.addEventListener('click', (e) => {
  e.preventDefault();
  
  // ✅ BLOCCA PRENOTAZIONE SE ESPERIENZA SCADUTA
  if (disableBooking) {
    showValidationError('Questa esperienza è conclusa e non è più prenotabile.', 'expired');
    return;
  }
  
  // ✅ NUOVO: Blocca acquisto se prodotto esaurito
  if (prod.category === 'shop' && prod.availability === 0) {
    showValidationError('Questo prodotto è attualmente esaurito.', 'out-of-stock');
    return;
  }
  
  showLoader();
  
  const sku = btn.dataset.sku || '';
  const skuPrefix = sku.split('-')[0].toUpperCase();
  
  if (['SC', 'PR', 'EX'].includes(skuPrefix)) {
    window.location.href = `product-details/booking.html?sku=${encodeURIComponent(sku)}`;
  } else {
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
    activePropertyFilter = type;
    localStorage.setItem('lh360_active_property_filter', type);
    
    // UI pills
    document.querySelectorAll('.filter-pill[data-property-type]').forEach(p => p.classList.remove('active'));
    if (pillElement) pillElement.classList.add('active');
    
    // Mostra reset
    const resetBtn = document.getElementById('propertyResetBtn');
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    
    // Filtra cards
    const grid = document.getElementById('propertiesGrid');
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
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    activeSupercarFilter = type;
    localStorage.setItem('lh360_active_supercar_filter', type);
    
    // UI pills
    document.querySelectorAll('.filter-pill[data-supercar-type]').forEach(p => p.classList.remove('active'));
    if (pillElement) pillElement.classList.add('active');
    
    // Mostra reset
    const resetBtn = document.getElementById('supercarResetBtn');
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    
    // Filtra cards
    const grid = document.getElementById('supercarsGrid');
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
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
 * Ripristina filtri salvati (ora le card sono già filtrate alla creazione)
 */
function restoreBookableFilters() {
    console.log('🔄 restoreBookableFilters: ripristino UI');
    
    // ✅ RIPRISTINA UI FILTRO IMMOBILI
    const savedPropertyFilter = localStorage.getItem('lh360_active_property_filter');
    if (savedPropertyFilter) {
        const targetPill = document.querySelector(`.filter-pill[data-property-type="${savedPropertyFilter}"]`);
        if (targetPill) {
            document.querySelectorAll('.filter-pill[data-property-type]').forEach(p => p.classList.remove('active'));
            targetPill.classList.add('active');
            
            const resetBtn = document.getElementById('propertyResetBtn');
            if (resetBtn) resetBtn.style.display = 'inline-flex';
            
            console.log('✅ UI filtro Immobili ripristinata:', savedPropertyFilter);
        }
    }
    
    // ✅ RIPRISTINA UI FILTRO SUPERCAR
    const savedSupercarFilter = localStorage.getItem('lh360_active_supercar_filter');
    if (savedSupercarFilter) {
        const targetPill = document.querySelector(`.filter-pill[data-supercar-type="${savedSupercarFilter}"]`);
        if (targetPill) {
            document.querySelectorAll('.filter-pill[data-supercar-type]').forEach(p => p.classList.remove('active'));
            targetPill.classList.add('active');
            
            const resetBtn = document.getElementById('supercarResetBtn');
            if (resetBtn) resetBtn.style.display = 'inline-flex';
            
            console.log('✅ UI filtro Supercar ripristinata:', savedSupercarFilter);
        }
    }
}

/**
 * 🏰 Empty State Premium - IMMOBILI
 */
function generatePropertiesEmptyState() {
    return `
        <div class="premium-empty-state">
            <div class="empty-hero-video">
                <video autoplay loop muted playsinline webkit-playsinline>
                    <source src="assets/videos/immobili.mp4" type="video/mp4">
                </video>
            </div>
            
            <!-- Content Editoriale -->
            <div class="empty-content-wrapper">
                <h2 class="empty-main-title">Immobili Selezionati.<br>Non Cataloghi.</h2>
                
                <div class="empty-divider"></div>
                
                <p class="empty-subtitle">Curatela, non quantità.</p>
                
                <p class="empty-body-text">
                    LuxHaven360 presenta una collezione in continua curatela di <strong>ville</strong>, 
                    <strong>residenze storiche</strong> e <strong>proprietà iconiche</strong>. 
                    Ogni immobile viene scelto per valore architettonico, contesto territoriale 
                    e potenziale esperienziale.
                    <br><br>
                    Le prime proprietà saranno presentate a breve.
                </p>
                
                <p class="empty-cta-text">Vuoi ricevere un alert alla pubblicazione?</p>
                
                <button class="empty-contact-btn" onclick="showSection('contact')">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Contattaci
                </button>
            </div>
        </div>
    `;
}

/**
 * 🎭 Empty State Premium - ESPERIENZE
 */
function generateExperiencesEmptyState() {
    return `
        <div class="premium-empty-state">
            <div class="empty-hero-video">
                <video autoplay loop muted playsinline webkit-playsinline>
                    <source src="assets/videos/immobili.mp4" type="video/mp4">
                </video>
            </div>
            
            <!-- Content Editoriale -->
            <div class="empty-content-wrapper">
                <h2 class="empty-main-title">Esperienze Esclusive<br>su Misura</h2>
                
                <div class="empty-divider"></div>
                
                <p class="empty-subtitle">Ogni esperienza è un racconto sensoriale.</p>
                
                <p class="empty-body-text">
                    Dal <strong>tramonto in supercar</strong> sulle colline toscane, 
                    ai <strong>fine settimana in dimore storiche</strong> con concierge dedicato. 
                    Ogni esperienza LuxHaven360 è pensata per chi cerca l'eccezionale, 
                    non il convenzionale.
                    <br><br>
                    Siamo in fase di curatela delle prime esperienze esclusive.
                </p>
                
                <p class="empty-cta-text">Vuoi essere tra i primi a scoprirle?</p>
                
                <button class="empty-contact-btn" onclick="showSection('contact')">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    Ricevi Aggiornamenti
                </button>
            </div>
        </div>
    `;
}

/**
 * NUOVA FUNZIONE UNIFICATA (Fetch API)
 * Scarica prodotti SHOP + BOOKABLE e li distribuisce nelle sezioni
 */
async function initDynamicProducts(retryCount = 0) {
    // 1. Imposta loader su tutte le griglie
    const grids = {};
    SECTIONS.forEach(section => {
        const gridEl = document.getElementById(section.gridId);
        if (gridEl) {
            if (retryCount === 0) {
                gridEl.innerHTML = '<div class="loading"><div class="lh-ring"></div><br>Caricamento prodotti...</div>';
            }
            grids[section.id] = gridEl;
        }
    });

    try {
        // === 2. CHIAMATE PARALLELE (shop + bookable) ===
        const shopPromise = fetch(`${WEB_APP_URL}?action=get_products&category=shop&t=${Date.now()}&r=${retryCount}`)
            .then(res => res.json());
        
        const bookablePromise = fetch(`${WEB_APP_URL}?action=get_bookable_products&category=all&t=${Date.now()}&r=${retryCount}`)
            .then(res => res.json());

        const [shopData, bookableData] = await Promise.all([shopPromise, bookablePromise]);

        // 3. Pulizia griglie
        Object.values(grids).forEach(g => g.innerHTML = '');

        const countBySection = {};

        // === 4a. RENDERING PRODOTTI SHOP ===
        if (shopData.success && shopData.products) {
            shopData.products.forEach(prod => {
                if (prod.category === 'shop' && grids.shop) {
                    prod.sectionName = 'shop';
                    const card = createProductCard(prod, 'Acquista');
                    grids.shop.appendChild(card);
                    countBySection.shop = (countBySection.shop || 0) + 1;
                }
            });
        }

        // === 4b. RENDERING PRODOTTI BOOKABLE (properties, supercars, stays) ===
if (bookableData.success && bookableData.products) {
    const propertyProducts = [];
    const supercarProducts = [];
    
    bookableData.products.forEach(prod => {
        const targetSection = SECTIONS.find(s => s.id === prod.category);
        
        if (targetSection && grids[targetSection.id]) {
            prod.sectionName = targetSection.id;
            prod.icon = prod.mainImage || '📦';
            
            const card = createProductCard(prod, targetSection.defaultCta);
            
            // ✅ AGGIUNGI SKU COME DATA ATTRIBUTE
            card.dataset.sku = prod.sku;
            
            grids[targetSection.id].appendChild(card);
            countBySection[targetSection.id] = (countBySection[targetSection.id] || 0) + 1;
            
            // ✅ RACCOGLI PRODOTTI PER FILTRI
            if (prod.category === 'properties') propertyProducts.push(prod);
            if (prod.category === 'supercars') supercarProducts.push(prod);
        }
    });
    
    // ✅ INIZIALIZZA FILTRI
    if (propertyProducts.length > 0) {
        initPropertyFilters(propertyProducts);
    }
    
    if (supercarProducts.length > 0) {
        initSupercarFilters(supercarProducts);
    }
}

        // 5. Gestione sezioni vuote CON EMPTY STATE PREMIUM
SECTIONS.forEach(section => {
    if (!countBySection[section.id] && grids[section.id]) {
        // Genera empty state premium per Immobili e Esperienze
        if (section.id === 'properties') {
            grids[section.id].innerHTML = generatePropertiesEmptyState();
        } else if (section.id === 'stays') {
            grids[section.id].innerHTML = generateExperiencesEmptyState();
        } else {
            // Per altre sezioni (shop, supercars) mantieni messaggio semplice
            grids[section.id].innerHTML = `<div class="empty" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.5;">Nessun prodotto disponibile al momento.</div>`;
        }
    }
});

    } catch (error) {
        console.warn(`Tentativo ${retryCount + 1} fallito:`, error);

        // Logica di retry
        if (retryCount < 2) {
            const delay = 1500 * (retryCount + 1);
            console.log(`Riprovo tra ${delay}ms...`);
            setTimeout(() => {
                initDynamicProducts(retryCount + 1);
            }, delay);
        } else {
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
  
  // ✅ FILTRO IMMEDIATO USANDO DATA ATTRIBUTE (no chiamate async)
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
  
  // Scroll smooth al grid
  shopGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// =========================================
// GESTIONE FORM CONTATTI
// =========================================

/**
 * Provider email validi (aziendali e personali conosciuti)
 */
const VALID_EMAIL_PROVIDERS = [
    // Provider professionali
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
    'protonmail.com', 'zoho.com', 'aol.com', 'mail.com', 'gmx.com',
    // Domini aziendali italiani comuni
    'libero.it', 'virgilio.it', 'tiscali.it', 'alice.it', 'tin.it',
    'fastwebnet.it', 'email.it', 'live.it', 'msn.com', 'me.com',
    // Domini internazionali
    'yandex.com', 'mail.ru', 'qq.com', '163.com', 'web.de'
];

/**
 * Domini email temporanei da bloccare
 */
const TEMP_EMAIL_DOMAINS = [
    'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
    'mailinator.com', 'maildrop.cc', 'temp-mail.org', 'getnada.com',
    'trashmail.com', 'fakeinbox.com', 'dispostable.com', 'yopmail.com',
    'mailnesia.com', 'mintemail.com', 'mytemp.email', 'tempinbox.com',
    'gavrom.com', 'emaxasp.com', 'cameltok.com', '24faw.com'
];

/**
 * Valida formato email base
 */
function isValidEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Verifica se il dominio è un provider conosciuto o aziendale
 */
function isValidEmailDomain(email) {
    const domain = email.split('@')[1].toLowerCase();
    
    // Blocca email temporanee
    if (TEMP_EMAIL_DOMAINS.includes(domain)) {
        return { valid: false, reason: 'Email temporanea non consentita' };
    }
    
    // Accetta provider conosciuti
    if (VALID_EMAIL_PROVIDERS.includes(domain)) {
        return { valid: true };
    }
    
    // Accetta domini aziendali custom (hanno almeno un punto dopo @)
    const parts = domain.split('.');
    if (parts.length >= 2 && parts[parts.length - 1].length >= 2) {
        // Verifica che non sia un dominio sospetto
        const topLevelDomain = parts[parts.length - 1];
        const validTLDs = ['com', 'it', 'net', 'org', 'eu', 'co', 'uk', 'de', 'fr', 'es', 'io', 'tech', 'biz', 'info'];
        
        if (validTLDs.includes(topLevelDomain)) {
            return { valid: true };
        }
    }
    
    return { valid: false, reason: 'Provider email non riconosciuto. Utilizza un indirizzo aziendale o un provider conosciuto.' };
}

/**
 * Gestisce l'invio del form contatti
 */
async function handleContactSubmit(event) {
    event.preventDefault();
    
    // Recupera valori
    const form = document.getElementById('contactForm');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const interest = document.getElementById('interest').value;
    const message = document.getElementById('message').value.trim();
    
    // Validazione base
    if (!name || !email || !message) {
        showContactError('Compila tutti i campi obbligatori');
        return;
    }
    
    // Validazione formato email
    if (!isValidEmailFormat(email)) {
        showContactError('Formato email non valido');
        return;
    }
    
    // Validazione dominio email
    const domainCheck = isValidEmailDomain(email);
    if (!domainCheck.valid) {
        showContactError(domainCheck.reason);
        return;
    }
    
    // Mostra loader
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Invio in corso...';
    submitBtn.disabled = true;
    
    try {
        // Prepara dati
        const contactData = {
            name: name,
            email: email,
            interest: interest,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        // Invia a Google Apps Script
        const params = new URLSearchParams({
    action: 'send_contact_request',
    ...contactData
});

const response = await fetch(`${WEB_APP_URL}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
});
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            form.reset();
            
            // Mostra messaggio di successo
            showContactSuccess();
        } else {
            throw new Error(result.error || 'Errore invio richiesta');
        }
        
    } catch (error) {
        console.error('Errore invio form contatti:', error);
        showContactError('Errore durante l\'invio. Riprova tra qualche istante.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Mostra messaggio di successo premium
 */
function showContactSuccess() {
    const successDiv = document.getElementById('contactSuccessMessage');
    successDiv.style.display = 'block';
    successDiv.style.animation = 'fadeIn 0.5s ease';
}

/**
 * Mostra messaggio di errore premium
 */
function showContactError(errorText) {
    const errorDiv = document.getElementById('contactErrorMessage');
    const errorTextEl = document.getElementById('errorText');
    
    errorTextEl.textContent = errorText;
    errorDiv.style.display = 'block';
    errorDiv.style.animation = 'fadeIn 0.5s ease';
}

/**
 * Chiude messaggio di successo
 */
function closeSuccessMessage() {
    const successDiv = document.getElementById('contactSuccessMessage');
    successDiv.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 500);
}

/**
 * Chiude messaggio di errore
 */
function closeErrorMessage() {
    const errorDiv = document.getElementById('contactErrorMessage');
    errorDiv.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 500);
}

/**
 * Mostra messaggio di errore per validazione (esaurito, esperienza scaduta, ecc.)
 */
function showValidationError(message, type) {
  const overlay = document.createElement('div');
  overlay.className = 'validation-error-overlay';
  overlay.innerHTML = `
    <div class="validation-error-card ${type}">
      <div class="validation-error-icon">⚠️</div>
      <h3 class="validation-error-title">Operazione Non Disponibile</h3>
      <p class="validation-error-text">${message}</p>
      <button class="btn btn-primary" onclick="this.closest('.validation-error-overlay').remove()">
        Ho Capito
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Auto-remove dopo 5 secondi
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove();
  }, 5000);
}
