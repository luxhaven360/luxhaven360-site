// -----------------------------
// script completo per site + PDP
// Posiziona questo script in product-details/pdp-products.html (o includilo come file .js)
// -----------------------------

// --- Nav & UI (tuo script esistente mantenuto e ampliato) ---

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section, .hero').forEach(s => s.classList.remove('active'));
    
    if (sectionId === 'home') {
        const hero = document.querySelector('.hero');
        if (hero) hero.style.display = 'flex';
    } else {
        const hero = document.querySelector('.hero');
        if (hero) hero.style.display = 'none';
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
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('active');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
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
// Carica i JSON dalla cartella 'products' e popola le rispettive griglie.
// Struttura attesa di ogni prodotto (esempio):
// {
//   "sku": "LH360-TSHIRT",
//   "title": "Premium T-Shirt",
//   "desc": "Maglietta premium in cotone pettinato con logo LuxHaven360.",
//   "price": 120,
//   "currency": "EUR",
//   "icon": "👕",               // o "assets/img/tshirt.jpg"
//   "stripe_link": "https://buy.stripe.com/abcd...",
//   "cta": "Acquista"           // testo del bottone (es. "Acquista", "Prenota Ora", "Richiedi Visita")
// }

const SECTIONS = [
    { id: 'properties', json: 'products/properties.json', gridId: 'propertiesGrid', defaultCta: 'Richiedi Visita' },
    { id: 'supercars', json: 'products/supercars.json', gridId: 'supercarsGrid', defaultCta: 'Test Drive' },
    { id: 'stays', json: 'products/stays.json', gridId: 'staysGrid', defaultCta: 'Prenota Ora' },
    { id: 'shop', json: 'products/shop.json', gridId: 'shopGrid', defaultCta: 'Acquista' }
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
    if (prod.icon) {
        // se è url img, crea <img>, altrimenti usa emoji/testo
        if (typeof prod.icon === 'string' && (prod.icon.startsWith('http') || prod.icon.endsWith('.jpg') || prod.icon.endsWith('.png') || prod.icon.endsWith('.webp') || prod.icon.endsWith('.jpeg'))) {
            const img = el('img', { src: prod.icon, alt: prod.title, style: 'width:100%; height:auto; object-fit:cover;' });
            imageContainer.appendChild(img);
        } else {
            imageContainer.textContent = prod.icon;
        }
    } else {
        imageContainer.textContent = '📦';
    }
    card.appendChild(imageContainer);

    // title
    const title = el('h3', { class: 'card-title' }, [document.createTextNode(prod.title || 'Untitled')]);
    card.appendChild(title);

    // desc
    const desc = el('p', { class: 'card-desc' }, [document.createTextNode(prod.desc || '')]);
    card.appendChild(desc);

    // price
    const priceText = el('div', { class: 'card-price' }, [document.createTextNode(prod.price != null ? formatPrice(prod.price, prod.currency || 'EUR') : (prod.price_text || 'Contattaci'))]);
    card.appendChild(priceText);

    // button area
    const btn = el('button', { class: 'btn', style: 'margin-top: 1.5rem; width: 100%;' }, [document.createTextNode(prod.cta || defaultCta || 'Scopri')]);

    // attach product data as data- attributes for analytics / fallback
    btn.dataset.sku = prod.sku || '';
    btn.dataset.title = prod.title || '';
    if (prod.stripe_link) btn.dataset.stripeLink = prod.stripe_link;
    if (prod.action) btn.dataset.action = prod.action;

    // on click behaviour:
    btn.addEventListener('click', () => {
        // salva analytics semplice
        try {
            localStorage.setItem('lh360_last_product', JSON.stringify({ sku: btn.dataset.sku, title: btn.dataset.title, ts: Date.now() }));
            // utile fallback per pdp quando si naviga via JS
            localStorage.setItem('lh360_selected_sku', btn.dataset.sku || '');
        } catch (e) {}

        // reindirizza alla pagina dettaglio prodotto (qui passa lo SKU in querystring)
        const base = 'product-details/pdp-products.html';
        const sku = encodeURIComponent(btn.dataset.sku || '');
        window.location.href = `${base}?sku=${sku}`;
    });

    card.appendChild(btn);

    return card;
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

// bootstrap: carica tutte le sezioni
function initDynamicProducts() {
    SECTIONS.forEach(s => loadSection(s));
}

// init al load
window.addEventListener('DOMContentLoaded', () => {
    initDynamicProducts();
    // se siamo su PDP, inizializza il caricamento specifico
    initPDPIfNeeded();
});

// --- end product listing / shop logic ---


// --------------------- PDP / product-details logic ---------------------
// Considerazioni:
// - pdp-products.html si trova in product-details/
// - i file di dettaglio sono in product-details/data/<SKU>.json (percorso relativo: data/<SKU>.json)
// - massimo 4 immagini verranno usate
// - tutte le sezioni (colori, taglie, recensioni, specifiche, size guide) vengono renderizzate SOLO se presenti

// Helper: prendi parametro querystring
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Helper: cerca SKU nei JSON di product sections (fallback se non si ha file detail standalone)
async function findProductInSections(sku) {
    if (!sku) return null;
    for (const s of SECTIONS) {
        try {
            const resp = await fetch(s.json, { cache: 'no-cache' });
            if (!resp.ok) continue;
            const items = await resp.json();
            if (!Array.isArray(items)) continue;
            const found = items.find(i => i.sku && i.sku.toString().toLowerCase() === sku.toString().toLowerCase());
            if (found) {
                found.sectionName = s.id;
                return found;
            }
        } catch (e) {
            console.warn('Impossibile leggere', s.json, e);
            continue;
        }
    }
    return null;
}

// Carica file JSON dalla cartella product-details/data/<SKU>.json e merge con product base
async function fetchAndApplyDetailData(product) {
    if (!product || !product.sku) return product;
    // Path relativo: dato che pdp-products.html è in product-details, il file è in data/<sku>.json
    const detailPath = `data/${encodeURIComponent(product.sku)}.json`;
    try {
        const resp = await fetch(detailPath, { cache: 'no-cache' });
        if (!resp.ok) {
            // file non esistente: ritorna product originale
            return product;
        }
        const detail = await resp.json();

        // Merge minimale: preferisci dati del file detail quando presenti
        const merged = Object.assign({}, product);

        // IMMAGINI: massimo 4
        if (Array.isArray(detail.images) && detail.images.length > 0) {
            merged.images = detail.images.slice(0, 4);
        }

        // RATING / RECENSIONI
        if (detail.rating) merged.rating = detail.rating;

        // COLORI / TAGLIE / QUANTITÀ
        if (Array.isArray(detail.colors) && detail.colors.length > 0) merged.colors = detail.colors;
        if (Array.isArray(detail.sizes) && detail.sizes.length > 0) merged.sizes = detail.sizes;
        if (detail.selectedQuantity != null) merged.selectedQuantity = detail.selectedQuantity;

        // DESCRIZIONE
        if (detail.description) merged.description = detail.description;

        // SPECIFICHE (solo i campi richiesti)
        if (detail.specs) merged.specs = Object.assign({}, detail.specs);

        // SIZE GUIDE
        if (detail.sizeGuide) merged.sizeGuide = detail.sizeGuide;

        // eventuali altri campi utili (price, currency, title, icon) se presenti nel detail sovrascrivili
        ['title', 'price', 'currency', 'icon', 'cta'].forEach(k => {
            if (detail[k] != null) merged[k] = detail[k];
        });

        return merged;
    } catch (err) {
        console.warn('Impossibile caricare detail JSON per', product.sku, err);
        return product;
    }
}

// MAIN: inizializza PDP se la pagina ha elementi PDP (o se c'è un SKU in query)
async function initPDPIfNeeded() {
    const isPDP = document.body.classList.contains('pdp-page') || document.getElementById('productContainer') || getQueryParam('sku');
    if (!isPDP) return;

    // trova lo SKU (priorità: querystring -> localStorage -> last_product)
    let sku = getQueryParam('sku') || localStorage.getItem('lh360_selected_sku') || (() => {
        try {
            const last = localStorage.getItem('lh360_last_product');
            if (last) {
                const parsed = JSON.parse(last);
                return parsed && parsed.sku ? parsed.sku : null;
            }
        } catch (e) {}
        return null;
    })();

    if (!sku) {
        // non troviamo SKU: mostra messaggio di errore lieve nella pagina se presente un container
        const container = document.getElementById('productContainer') || document.getElementById('pdpContainer');
        if (container) container.innerHTML = '<div class="error">Prodotto non specificato. Torna alla pagina shop per selezionare un prodotto.</div>';
        return;
    }

    // pulisci eventuale encoding
    sku = decodeURIComponent(sku);

    // Primo tentativo: prova a caricare direttamente il file detail (data/<sku>.json)
    let baseProduct = { sku };

    // se non esiste file detail, cerchiamo lo SKU nei file products list (fallback)
    try {
        // se il file data/<sku>.json esiste lo useremo per informazioni base: ma vogliamo comunque chiamare fetchAndApplyDetailData solo dopo aver trovato almeno qualche base
        // quindi proviamo a leggere data/<sku>.json temporaneamente per avere un "base"
        const detailResp = await fetch(`data/${encodeURIComponent(sku)}.json`, { cache: 'no-cache' });
        if (detailResp.ok) {
            const detailOnly = await detailResp.json();
            // se il file contiene almeno titolo o price lo consideriamo base
            baseProduct = Object.assign({ sku }, detailOnly);
            // ma comunque non facciamo doppio fetch: in fetchAndApplyDetailData il file verrà caricato nuovamente e sovrascriverà; questo è ok e garantisce consistenza
        } else {
            // fallback: cerchiamo nello shop/properties/etc
            const found = await findProductInSections(sku);
            if (found) baseProduct = found;
        }
    } catch (e) {
        console.warn('Errore fetching base product for', sku, e);
        const found = await findProductInSections(sku);
        if (found) baseProduct = found;
    }

    // ora prova a caricare il file detail e merge
    const product = await fetchAndApplyDetailData(baseProduct);

    // popola la pagina con il prodotto
    populateProduct(product);
}

// --------------------- Rendering PDP (funzioni modulari) ---------------------

// Variabili di stato per gallery/qty
let pdpState = {
    images: [],
    currentImageIndex: 0,
    quantity: 1
};

// populateProduct: riceve 'product' già mergeato e aggiorna DOM
function populateProduct(prod) {
    if (!prod) {
        const container = document.getElementById('productContainer') || document.getElementById('pdpContainer');
        if (container) container.innerHTML = '<div class="error">Dettagli prodotto non disponibili.</div>';
        return;
    }

    // Titolo
    const titleEl = document.getElementById('productTitle');
    if (titleEl) titleEl.textContent = prod.title || prod.sku || 'Prodotto';

    // Prezzo
    const priceEl = document.getElementById('productPrice');
    if (priceEl) {
        if (prod.price != null) priceEl.textContent = formatPrice(prod.price, prod.currency || 'EUR');
        else if (prod.price_text) priceEl.textContent = prod.price_text;
        else priceEl.textContent = 'Contattaci';
    }

    // Descrizione breve / lunga
    const shortDesc = document.getElementById('productDesc');
    const longDesc = document.getElementById('longDescription');
    if (prod.description) {
        if (shortDesc) shortDesc.textContent = prod.description;
        if (longDesc) longDesc.textContent = prod.description;
    } else {
        if (shortDesc) shortDesc.textContent = prod.desc || '';
        if (longDesc) longDesc.textContent = prod.desc || '';
    }

    // imposta stato immagini (limitato a 4)
    pdpState.images = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images.slice(0, 4) : [];
    pdpState.currentImageIndex = 0;

    // inizializza gallery
    renderGallery();

    // rating / recensioni
    renderRating(prod);

    // colori
    renderColors(prod);

    // taglie
    renderSizes(prod);

    // quantità
    pdpState.quantity = prod.selectedQuantity && prod.selectedQuantity > 0 ? prod.selectedQuantity : 1;
    renderQuantityControls();

    // specifiche
    renderSpecs(prod);

    // size guide (tabella)
    renderSizeGuide(prod);

    // CTA / Add to cart: collega bottone se presente
    const ctaBtn = document.getElementById('addToCartBtn') || document.querySelector('.pdp-cta');
    if (ctaBtn) {
        ctaBtn.dataset.sku = prod.sku || '';
        ctaBtn.addEventListener('click', () => {
            // semplice handler: salva in localStorage il carrello (semplice implementazione)
            try {
                const cartRaw = localStorage.getItem('lh360_cart') || '[]';
                const cart = JSON.parse(cartRaw);
                const existing = cart.find(i => i.sku === prod.sku);
                if (existing) {
                    existing.qty = (existing.qty || 0) + pdpState.quantity;
                } else {
                    cart.push({ sku: prod.sku, title: prod.title, price: prod.price, currency: prod.currency, qty: pdpState.quantity });
                }
                localStorage.setItem('lh360_cart', JSON.stringify(cart));
                // piccolo feedback utente
                ctaBtn.textContent = 'Aggiunto';
                setTimeout(() => { if (ctaBtn) ctaBtn.textContent = (prod.cta || 'Aggiungi al carrello'); }, 1200);
            } catch (e) {
                console.warn('Impossibile aggiungere al carrello', e);
            }
        });
    }

    // eventuale stripe link
    const buyLink = document.getElementById('buyLink');
    if (buyLink && prod.stripe_link) {
        buyLink.href = prod.stripe_link;
        buyLink.style.display = '';
    } else if (buyLink) {
        buyLink.style.display = 'none';
    }
}

/* ---------- GALLERY ---------- */
function renderGallery() {
    const mainImgEl = document.getElementById('productMainImage');
    const thumbsContainer = document.getElementById('productThumbs');
    const galleryContainer = document.getElementById('productGallery');

    if (!galleryContainer && !mainImgEl && !thumbsContainer) return;

    // se non ci sono immagini, mostra placeholder
    if (!Array.isArray(pdpState.images) || pdpState.images.length === 0) {
        if (mainImgEl) mainImgEl.src = ''; // o immagine di placeholder se vuoi
        if (thumbsContainer) thumbsContainer.innerHTML = '';
        // nascondi gallery se necessario
        if (galleryContainer) galleryContainer.style.display = 'none';
        return;
    }

    if (galleryContainer) galleryContainer.style.display = '';
    if (mainImgEl) {
        mainImgEl.src = pdpState.images[pdpState.currentImageIndex];
        mainImgEl.alt = document.getElementById('productTitle') ? (document.getElementById('productTitle').textContent || '') : '';
    }

    if (thumbsContainer) {
        thumbsContainer.innerHTML = '';
        pdpState.images.forEach((src, i) => {
            const t = document.createElement('img');
            t.src = src;
            t.alt = `Anteprima ${i+1}`;
            t.className = 'thumb' + (i === pdpState.currentImageIndex ? ' active' : '');
            t.addEventListener('click', () => {
                pdpState.currentImageIndex = i;
                if (mainImgEl) mainImgEl.src = pdpState.images[i];
                // aggiorna classi
                thumbsContainer.querySelectorAll('img').forEach(img => img.classList.remove('active'));
                t.classList.add('active');
            });
            thumbsContainer.appendChild(t);
        });
    }
}

/* ---------- RATING / REVIEWS ---------- */
function renderRating(prod) {
    const ratingNumberEl = document.getElementById('ratingNumber');
    const reviewsCountEl = document.getElementById('reviewsCount');
    const ratingTextEl = document.getElementById('ratingText');
    const starsContainer = document.getElementById('starsContainer');

    // Se non ci sono recensioni, mostra messaggio informativo
    if (!prod.rating || (prod.rating.count == null && prod.rating.value == null)) {
        if (ratingNumberEl && ratingNumberEl.parentElement) ratingNumberEl.parentElement.style.display = 'none';
        if (ratingTextEl) {
            ratingTextEl.textContent = 'Ancora nessuna recensione per questo prodotto.';
            ratingTextEl.style.display = '';
        }
        if (starsContainer) starsContainer.style.display = 'none';
        if (reviewsCountEl) reviewsCountEl.style.display = 'none';
        return;
    }

    // Altrimenti mostra rating e conteggio
    if (ratingNumberEl) {
        ratingNumberEl.textContent = (prod.rating.value != null) ? prod.rating.value.toFixed ? prod.rating.value.toFixed(1) : prod.rating.value : '';
        if (ratingNumberEl.parentElement) ratingNumberEl.parentElement.style.display = '';
    }
    if (reviewsCountEl) {
        reviewsCountEl.textContent = prod.rating.count ? `${prod.rating.count} recensioni` : '';
        reviewsCountEl.style.display = prod.rating.count ? '' : 'none';
    }
    if (ratingTextEl) {
        ratingTextEl.style.display = '';
        ratingTextEl.textContent = (prod.rating.value ? (`★ ${prod.rating.value}`) : '') + (prod.rating.count ? ` (${prod.rating.count} recensioni)` : '');
    }
    if (starsContainer) {
        starsContainer.style.display = '';
        // opzionale: renderizza stelle visive (semplice)
        const val = prod.rating.value ? Math.round((prod.rating.value || 0) * 2) / 2 : 0; // arrotonda a 0.5
        starsContainer.innerHTML = '';
        const fullStars = Math.floor(val);
        const halfStar = (val - fullStars) >= 0.5;
        for (let i=0;i<fullStars;i++) {
            const s = document.createElement('span'); s.className = 'star full'; s.textContent = '★'; starsContainer.appendChild(s);
        }
        if (halfStar) {
            const s = document.createElement('span'); s.className = 'star half'; s.textContent = '☆'; starsContainer.appendChild(s);
        }
        const remaining = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i=0;i<remaining;i++) {
            const s = document.createElement('span'); s.className = 'star empty'; s.textContent = '☆'; starsContainer.appendChild(s);
        }
    }
}

/* ---------- COLORI ---------- */
function renderColors(prod) {
    const colorSection = document.getElementById('colorOptions');
    if (!colorSection) return;
    // svuota
    colorSection.innerHTML = '';

    if (!Array.isArray(prod.colors) || prod.colors.length === 0) {
        const sec = colorSection.closest('.section');
        if (sec) sec.style.display = 'none';
        return;
    }

    const sec = colorSection.closest('.section');
    if (sec) sec.style.display = '';

    prod.colors.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.className = 'color-btn' + (i===0 ? ' active' : '');
        btn.type = 'button';
        // supporta sia hex/nome che url immagine
        if (typeof c === 'string' && c.startsWith('http')) {
            btn.style.backgroundImage = `url(${c})`;
            btn.style.backgroundSize = 'cover';
            btn.style.backgroundPosition = 'center';
            btn.setAttribute('aria-label', `Colore ${i+1}`);
        } else {
            btn.style.background = c;
            btn.setAttribute('aria-label', `Colore ${c}`);
        }
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // optional: filter images by color if naming convenzionale
        });
        colorSection.appendChild(btn);
    });
}

/* ---------- TAGLIE ---------- */
function renderSizes(prod) {
    const sizeGrid = document.getElementById('sizeGrid');
    if (!sizeGrid) return;
    sizeGrid.innerHTML = '';

    if (!Array.isArray(prod.sizes) || prod.sizes.length === 0) {
        const sec = sizeGrid.closest('.section');
        if (sec) sec.style.display = 'none';
        return;
    }

    const sec = sizeGrid.closest('.section');
    if (sec) sec.style.display = '';

    prod.sizes.forEach((s, i) => {
        const btn = document.createElement('button');
        btn.className = 'size-btn' + (i===0 ? ' active' : '');
        btn.type = 'button';
        btn.textContent = s;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        sizeGrid.appendChild(btn);
    });
}

/* ---------- QUANTITY CONTROLS ---------- */
function renderQuantityControls() {
    const qtyValue = document.getElementById('qtyValue');
    const minus = document.getElementById('qtyMinus');
    const plus = document.getElementById('qtyPlus');

    if (qtyValue) qtyValue.textContent = pdpState.quantity;

    if (minus) {
        minus.onclick = () => {
            if (pdpState.quantity > 1) {
                pdpState.quantity--;
                if (qtyValue) qtyValue.textContent = pdpState.quantity;
            }
        };
    }
    if (plus) {
        plus.onclick = () => {
            pdpState.quantity++;
            if (qtyValue) qtyValue.textContent = pdpState.quantity;
        };
    }
}

/* ---------- SPECIFICHE ---------- */
function renderSpecs(prod) {
    const specsGrid = document.getElementById('specsGrid');
    if (!specsGrid) return;

    const compEl = document.getElementById('specComposition');
    const weightEl = document.getElementById('specWeight');
    const originEl = document.getElementById('specOrigin');
    const fitEl = document.getElementById('specFit');

    const s = prod.specs || {};

    // Se nessuno dei campi è presente, nascondi l'intera sezione "Specifiche"
    if (!s.composition && !s.weight && !s.origin && !s.fit) {
        specsGrid.style.display = 'none';
        return;
    } else {
        specsGrid.style.display = '';
    }

    if (compEl) compEl.textContent = s.composition || '';
    if (weightEl) weightEl.textContent = s.weight || '';
    if (originEl) originEl.textContent = s.origin || '';
    if (fitEl) fitEl.textContent = s.fit || '';
}

/* ---------- SIZE GUIDE (tabella) ---------- */
function renderSizeGuide(prod) {
    const sg = prod.sizeGuide;
    const sizeTable = document.querySelector('.size-table');
    if (!sizeTable) return;

    if (!sg || !Array.isArray(sg.rows) || sg.rows.length === 0) {
        sizeTable.style.display = 'none';
        return;
    } else {
        sizeTable.style.display = '';
    }

    // pulisci e ricostruisci
    sizeTable.innerHTML = '';
    const thead = document.createElement('thead');
    const thr = document.createElement('tr');
    (sg.headers || []).forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thr.appendChild(th);
    });
    thead.appendChild(thr);
    sizeTable.appendChild(thead);

    const tbody = document.createElement('tbody');
    sg.rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    sizeTable.appendChild(tbody);
}

// --------------------- Fine PDP logic ---------------------

// Nota: molte funzioni cercano elementi per id/class; assicurati che nella pagina HTML
// esistano gli id seguenti (o adatta gli id qui sotto alle tue classi):
// #productContainer / #pdpContainer
// #productTitle, #productPrice, #productDesc, #longDescription
// #productMainImage, #productThumbs, #productGallery
// #ratingNumber, #reviewsCount, #ratingText, #starsContainer
// #colorOptions
// #sizeGrid
// #qtyMinus, #qtyPlus, #qtyValue
// #specsGrid, #specComposition, #specWeight, #specOrigin, #specFit
// .size-table
// #addToCartBtn (o .pdp-cta)
// #buyLink (opzionale)

// Se preferisci, posso anche adattare gli id del renderer agli id effettivi del tuo HTML: incollami la parte HTML del PDP e lo faccio io.
