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
    const section = encodeURIComponent(prod.sectionName || 'shop');
    window.location.href = `${base}?sku=${sku}&section=${section}`;
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
});

// --- end ---
