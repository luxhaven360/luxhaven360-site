// script.js - LuxHaven360
// Versione aggiornata: loader dinamico dei prodotti per 4 sezioni + integrazione payment link
// Mantiene la logica UI esistente e la funzione buyProduct con compatibilità retroattiva.

/* ----------------------------------------------------------------------
   CONFIG
   - Se ospiti i JSON su GitHub raw, imposta PRODUCT_JSON_BASE al raw URL del repo
     es: "https://raw.githubusercontent.com/tuoUser/tuoRepo/main/"
   - Se i JSON sono nella stessa root del sito, lascia PRODUCT_JSON_BASE = ''
   ---------------------------------------------------------------------- */
const PRODUCT_JSON_BASE = ''; // es: "https://raw.githubusercontent.com/tuoUser/tuoRepo/main/"

// PRODUCT_PAYMENT_LINKS: fallback se non usi payment_link dentro il JSON
const PRODUCT_PAYMENT_LINKS = {
    "LH360-TSHIRT": "https://buy.stripe.com/test_4gMaEP6ecaHB7dI6WQ3VC00",
    "LH360-PRINT": "REPLACE_WITH_YOUR_STRIPE_PAYMENT_LINK_FOR_PRINT",
    "LH360-ACC": "REPLACE_WITH_YOUR_STRIPE_PAYMENT_LINK_FOR_ACCESSORY"
};

/* ----------------------------------------------------------------------
   NAV & UI (codice originale mantenuto)
   ---------------------------------------------------------------------- */

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

/* ----------------------------------------------------------------------
   Dynamic products loader
   - Carica i file JSON per ciascuna sezione e genera le card dinamicamente
   - File attesi (nella root o sotto PRODUCT_JSON_BASE):
       products_merch.json
       products_realestate.json
       products_supercars.json
       products_experiences.json
   - Ogni file JSON deve avere la proprietà "catalog": [ { sku, name, price, desc, img, payment_link, stripe_product_id }, ... ]
   ---------------------------------------------------------------------- */

/**
 * Carica ed effettua il render dei prodotti per una sezione.
 * @param {string} sectionId id della sezione nel DOM ('shop', 'properties', 'supercars', 'stays')
 * @param {string} filename nome file JSON (es. 'products_merch.json')
 */
async function loadSectionProducts(sectionId, filename) {
    const jsonPath = PRODUCT_JSON_BASE ? PRODUCT_JSON_BASE + filename : ('./' + filename);
    try {
        const res = await fetch(jsonPath, {cache: "no-store"});
        if (!res.ok) {
            console.warn(`loadSectionProducts: impossibile caricare ${jsonPath} - HTTP ${res.status}`);
            return;
        }
        const data = await res.json();
        const catalog = data.catalog || [];
        const container = document.querySelector(`#${sectionId} .grid`);
        if (!container) {
            console.warn(`loadSectionProducts: contenitore non trovato per sezione ${sectionId}`);
            return;
        }

        // svuota contenuto esistente (rimuove card statiche se presenti)
        container.innerHTML = '';

        catalog.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';

            const imgDiv = document.createElement('div');
            imgDiv.className = 'card-image';
            if (p.img) {
                // If it's a string path, render image; otherwise fallback emoji
                const imgEl = document.createElement('img');
                imgEl.src = p.img;
                imgEl.alt = p.name || 'product';
                imgEl.style.width = '100%';
                imgEl.style.height = '160px';
                imgEl.style.objectFit = 'cover';
                imgEl.style.borderRadius = '8px';
                imgDiv.appendChild(imgEl);
            } else {
                imgDiv.textContent = '📦';
            }
            card.appendChild(imgDiv);

            const h3 = document.createElement('h3');
            h3.className = 'card-title';
            h3.textContent = p.name || '';
            card.appendChild(h3);

            const desc = document.createElement('p');
            desc.className = 'card-desc';
            desc.textContent = p.desc || '';
            card.appendChild(desc);

            const priceDiv = document.createElement('div');
            priceDiv.className = 'card-price';
            priceDiv.textContent = (typeof p.price === 'number') ? ('€ ' + p.price.toLocaleString('it-IT')) : (p.price || '');
            card.appendChild(priceDiv);

            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.style = 'margin-top: 1.5rem; width: 100%;';
            // testo bottone basato sulla sezione
            if (sectionId === 'shop') btn.textContent = 'Acquista';
            else if (sectionId === 'supercars') btn.textContent = 'Test Drive';
            else if (sectionId === 'stays') btn.textContent = 'Prenota Ora';
            else btn.textContent = 'Richiedi';

            // dataset utili per fallback
            if (p.payment_link) btn.setAttribute('data-payment-link', p.payment_link);
            if (p.sku) btn.setAttribute('data-product-sku', p.sku);
            if (p.name) btn.setAttribute('data-product-name', p.name);
            if (p.price !== undefined) btn.setAttribute('data-price', String(p.price));
            if (p.stripe_product_id) btn.setAttribute('data-stripe-product-id', p.stripe_product_id);

            btn.addEventListener('click', (ev) => {
                buyProduct(btn);
            });

            card.appendChild(btn);
            container.appendChild(card);
        });

    } catch (err) {
        console.error('loadSectionProducts errore:', err);
    }
}

/* ----------------------------------------------------------------------
   buyProduct: integra i nuovi payment_link nel JSON + fallback al mapping esistente
   - preferisce data-payment-link inserito nel pulsante (JSON)
   - poi controlla PRODUCT_PAYMENT_LINKS per sku
   - registra last product in localStorage per analytics
   ---------------------------------------------------------------------- */
function buyProduct(btn) {
    // prefer payment link diretto
    const directLink = btn.getAttribute('data-payment-link') || btn.dataset.paymentLink;
    const sku = btn.getAttribute('data-product-sku') || btn.dataset.productSku;
    const name = btn.getAttribute('data-product-name') || btn.dataset.productName;
    const price = btn.getAttribute('data-price') || btn.dataset.price;

    if (directLink) {
        try {
            localStorage.setItem('lh360_last_product', JSON.stringify({sku, name, price, ts: Date.now()}));
        } catch(e) {}
        window.location.href = directLink;
        return;
    }

    // fallback to PRODUCT_PAYMENT_LINKS by SKU
    if (sku) {
        const paymentLink = PRODUCT_PAYMENT_LINKS[sku];
        if (paymentLink && !paymentLink.startsWith('REPLACE_WITH')) {
            try {
                localStorage.setItem('lh360_last_product', JSON.stringify({sku, name, price, ts: Date.now()}));
            } catch(e) {}
            window.location.href = paymentLink;
            return;
        }
    }

    alert("Pagamento non configurato per questo prodotto. Controlla i Payment Links in Stripe e aggiorna il sito.");
}

/* ----------------------------------------------------------------------
   Small utility functions
   ---------------------------------------------------------------------- */
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function (m) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]; });
}

/* ----------------------------------------------------------------------
   DOMContentLoaded: inizializza tutto
   ---------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    // Carica dinamicamente le sezioni (attendi i file nella root o sotto PRODUCT_JSON_BASE)
    loadSectionProducts('shop', 'products_merch.json');
    loadSectionProducts('properties', 'products_realestate.json');
    loadSectionProducts('supercars', 'products_supercars.json');
    loadSectionProducts('stays', 'products_experiences.json');

    // Attacca listener a eventuali buy-btn statici già presenti nell'HTML (compatibilità)
    document.querySelectorAll('.buy-btn').forEach(btn => {
        // se il bottone ha già onclick inline, non sovrascrivere; altrimenti aggiungi comportamento moderno
        if (!btn.dataset.listenerAttached) {
            btn.addEventListener('click', (e) => {
                // se ha data-payment-link impostato inline, usalo; altrimenti delega a buyProduct
                const direct = btn.getAttribute('data-payment-link') || btn.dataset.paymentLink;
                if (direct) {
                    try { localStorage.setItem('lh360_last_product', JSON.stringify({
                        sku: btn.getAttribute('data-product-sku') || '',
                        name: btn.getAttribute('data-product-name') || '',
                        price: btn.getAttribute('data-price') || '',
                        ts: Date.now()
                    })); } catch(e) {}
                    window.location.href = direct;
                } else {
                    buyProduct(btn);
                }
            });
            btn.dataset.listenerAttached = "1";
        }
    });
});

/* ----------------------------------------------------------------------
   End of script.js
   ---------------------------------------------------------------------- */
