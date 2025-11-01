// script.js - Nav/UI + Dynamic Products Loader for LuxHaven360

// ------------------ Nav & UI (stesso comportamento di prima) ------------------
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


// ------------------ Products loader ------------------
/*
Expected JSON files in /products/ (served by the site):
  - products/properties.json
  - products/supercars.json
  - products/stays.json
  - products/shop.json

Each file: array of product objects. Example product fields supported:
{
  "id": "prop-001",
  "sku": "LH360-TSHIRT",            // optional, used for shop
  "title": "Castello Storico",
  "description": "...",
  "price": "12500000",
  "currency": "€",
  "imageUrl": "/assets/immagine.jpg", // optional; if absent imageEmoji used
  "imageEmoji": "🏰",                  // fallback
  "ctaLabel": "Richiedi Visita",     // optional
  "paymentLink": "https://buy.stripe.com/.." // optional for shop items
}
*/

// Fallback payment links map (legacy). Prefer embedding paymentLink in shop.json items.
const PRODUCT_PAYMENT_LINKS = {
    "LH360-TSHIRT": "https://buy.stripe.com/test_4gMaEP6ecaHB7dI6WQ3VC00",
    "LH360-PRINT": "REPLACE_WITH_YOUR_STRIPE_PAYMENT_LINK_FOR_PRINT",
    "LH360-ACC": "REPLACE_WITH_YOUR_STRIPE_PAYMENT_LINK_FOR_ACCESSORY"
};

function createCardHTML(product, category) {
    // image
    const imgHtml = product.imageUrl ?
        `<div class="card-image"><img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.title)}" loading="lazy"></div>` :
        `<div class="card-image">${product.imageEmoji || '🏷️'}</div>`;

    const priceHtml = product.price ? `<div class="card-price">${product.currency || '€'} ${escapeHtml(product.price)}</div>` : '';

    const ctaLabel = product.ctaLabel || (category === 'shop' ? 'Acquista' : (category === 'supercars' ? 'Test Drive' : (category === 'properties' ? 'Richiedi Visita' : 'Prenota')));

    let cta = '';
    if (category === 'shop') {
        const sku = product.sku || '';
        // include paymentLink in data attribute if present
        const paymentAttr = product.paymentLink ? `data-payment-link="${escapeHtml(product.paymentLink)}"` : '';
        cta = `<button class="btn buy-btn" data-product-name="${escapeHtml(product.title)}" data-product-sku="${escapeHtml(sku)}" data-price="${escapeHtml(product.price || '')}" ${paymentAttr} onclick="buyProduct(this)">${escapeHtml(ctaLabel)}</button>`;
    } else {
        const idOrTitle = product.id ? escapeJs(product.id) : escapeJs(product.title || '');
        cta = `<button class="btn" onclick="handleRequestAction('${idOrTitle}','${escapeHtml(category)}')">${escapeHtml(ctaLabel)}</button>`;
    }

    return `
        <div class="card">
            ${imgHtml}
            <h3 class="card-title">${escapeHtml(product.title)}</h3>
            <p class="card-desc">${escapeHtml(product.description || '')}</p>
            ${priceHtml}
            <div style="margin-top:1rem">${cta}</div>
        </div>
    `;
}

function renderProductsInto(containerId, products, category) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = '<p>Nessun prodotto disponibile al momento.</p>';
        return;
    }
    container.innerHTML = products.map(p => createCardHTML(p, category)).join('\n');
}

function loadJSON(path) {
    return fetch(path, {cache: 'no-store'})
        .then(resp => {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        });
}

function loadAllProducts() {
    const tasks = [
        loadJSON('products/properties.json').then(data => renderProductsInto('properties-grid', data, 'properties')).catch(err => {
            console.warn('Failed to load properties.json', err);
            const el = document.getElementById('properties-grid'); if (el) el.innerHTML = '<p>Impossibile caricare le proprietà al momento.</p>';
        }),
        loadJSON('products/supercars.json').then(data => renderProductsInto('supercars-grid', data, 'supercars')).catch(err => {
            console.warn('Failed to load supercars.json', err);
            const el = document.getElementById('supercars-grid'); if (el) el.innerHTML = '<p>Impossibile caricare le supercar al momento.</p>';
        }),
        loadJSON('products/stays.json').then(data => renderProductsInto('stays-grid', data, 'stays')).catch(err => {
            console.warn('Failed to load stays.json', err);
            const el = document.getElementById('stays-grid'); if (el) el.innerHTML = '<p>Impossibile caricare le esperienze al momento.</p>';
        }),
        loadJSON('products/shop.json').then(data => renderProductsInto('shop-grid', data, 'shop')).catch(err => {
            console.warn('Failed to load shop.json', err);
            const el = document.getElementById('shop-grid'); if (el) el.innerHTML = '<p>Impossibile caricare i prodotti del shop al momento.</p>';
        })
    ];
    return Promise.allSettled(tasks);
}

// Purchase handler for shop buttons
function buyProduct(btn) {
    const sku = btn.getAttribute('data-product-sku');
    const name = btn.getAttribute('data-product-name');
    const price = btn.getAttribute('data-price');
    const paymentLinkFromData = btn.getAttribute('data-payment-link');

    const paymentLink = paymentLinkFromData || PRODUCT_PAYMENT_LINKS[sku];
    if (!paymentLink || paymentLink.startsWith('REPLACE_WITH')) {
        alert('Pagamento non configurato per questo prodotto. Controlla i Payment Links in Stripe e aggiorna il sito.');
        return;
    }

    try { localStorage.setItem('lh360_last_product', JSON.stringify({sku, name, price, ts: Date.now()})); } catch(e){}
    window.location.href = paymentLink;
}

// Handler for non-shop CTAs: prefill contact form and open contact section
function handleRequestAction(productIdOrTitle, category) {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.value = `Richiesta per: ${productIdOrTitle} (categoria: ${category}). Desidero maggiori informazioni.`;
    }
    showSection('contact');
    const email = document.getElementById('email'); if (email) email.focus();
}

// Small escaping helpers
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return ('' + str).replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escapeJs(str) {
    if (str === null || str === undefined) return '';
    return ('' + str).replace(/\\/g,'\\\\').replace(/'/g, "\\'").replace(/\"/g,'\\\"');
}

// Boot: load products when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
});
