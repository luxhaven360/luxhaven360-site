// script.js (module)
// NOTE: questo file importa il file di configurazione prodotti che deve esistere in /data/products.js
// Esempio di struttura minimal di data/products.js:
// export const PRODUCTS = [
//   { sku: "TSHIRT_PREMIUM", name: "T-Shirt Premium", description: "...", price_cents: 12000, image: "https://...", variant_id: 123456 },
//   ...
// ];

import { PRODUCTS } from './data/products.js'; // assicurati di creare questo file

/* ---------------------------
   NAVIGATION (mantiene il tuo comportamento originale)
   --------------------------- */
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
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('active');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    if (window.scrollY > 50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.getElementById('navLinks');
    const toggle = document.querySelector('.mobile-toggle');
    if (!nav || !toggle) return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// Esportiamo le funzioni per poterle usare dagli onClick inline nell'HTML
window.showSection = showSection;
window.toggleMenu = toggleMenu;

/* ---------------------------
   SHOP / CART / CHECKOUT
   --------------------------- */

const cart = []; // { sku, name, price, qty, variant_id }

function formatPrice(cents) {
    return '€ ' + (Number(cents) / 100).toFixed(2);
}

/* Render prodotti dinamicamente leggendo PRODUCTS */
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    PRODUCTS.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card product';
        card.dataset.sku = prod.sku;
        card.dataset.variant = prod.variant_id || '';
        card.dataset.price = prod.price_cents || 0;

        card.innerHTML = `
            <div class="card-image">${prod.image ? `<img src="${prod.image}" alt="${escapeHtml(prod.name)}" />` : '👕'}</div>
            <h3 class="card-title">${escapeHtml(prod.name)}</h3>
            <p class="card-desc">${escapeHtml(prod.description || '')}</p>
            <div class="card-price">${formatPrice(prod.price_cents || 0)}</div>
            <div style="margin-top: 1rem;">
              <button class="btn add-to-cart" style="width:100%;">Aggiungi al carrello</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* Semplice funzione di escape per testo inserito in HTML */
function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, function (m) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
    });
}

/* Carrello: render e logica */
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!cartItems || !cartTotalEl || !checkoutBtn) return;

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price * item.qty;
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '0.4rem 0';

        const left = document.createElement('div');
        left.textContent = `${item.name} x ${item.qty}`;

        const right = document.createElement('div');
        right.style.display = 'flex';
        right.style.gap = '0.5rem';
        right.style.alignItems = 'center';

        const price = document.createElement('div');
        price.textContent = formatPrice(item.price * item.qty);

        const minus = document.createElement('button');
        minus.className = 'btn';
        minus.style.padding = '0.2rem 0.5rem';
        minus.textContent = '-';
        minus.onclick = () => {
            if (item.qty > 1) item.qty -= 1; else cart.splice(idx,1);
            renderCart();
        };

        const plus = document.createElement('button');
        plus.className = 'btn';
        plus.style.padding = '0.2rem 0.5rem';
        plus.textContent = '+';
        plus.onclick = () => { item.qty += 1; renderCart(); };

        right.appendChild(minus);
        right.appendChild(price);
        right.appendChild(plus);

        row.appendChild(left);
        row.appendChild(right);
        cartItems.appendChild(row);
    });

    cartTotalEl.textContent = formatPrice(total);
    checkoutBtn.disabled = cart.length === 0;
}

/* Aggiungi al carrello quando l'utente preme il bottone */
document.addEventListener('click', (e) => {
    if (e.target.matches('.add-to-cart')) {
        const card = e.target.closest('.product');
        if (!card) return;
        const sku = card.dataset.sku;
        const name = card.querySelector('.card-title')?.textContent || sku;
        const price = parseInt(card.dataset.price || '0', 10);
        const variant = card.dataset.variant || null;

        const existing = cart.find(i => i.sku === sku && String(i.variant) === String(variant));
        if (existing) existing.qty += 1;
        else cart.push({ sku, name, price, qty: 1, variant_id: variant });

        renderCart();
        // piccolo feedback
        setTimeout(() => { alert('Prodotto aggiunto al carrello'); }, 50);
    }
});

/* Checkout: chiama /api/create-checkout-session per creare la Stripe Checkout Session */
document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
    if (cart.length === 0) return alert('Il carrello è vuoto');

    // costruisci line_items da inviare al server
    // Importante: nel product_data metadata inseriamo sku così il backend può mappare a variant_id
    const line_items = cart.map(item => ({
        price_data: {
            currency: 'eur',
            product_data: {
                name: item.name,
                metadata: { sku: item.sku } // backend userà questo SKU per trovare variant_id
            },
            unit_amount: item.price
        },
        quantity: item.qty
    }));

    try {
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line_items })
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || 'Errore creazione sessione');
        }

        const payload = await res.json();
        if (payload.url) {
            // redirect a Stripe Checkout
            window.location.href = payload.url;
        } else {
            throw new Error('Risposta non valida dal server (manca url)');
        }
    } catch (err) {
        console.error('Errore durante checkout:', err);
        alert('Errore durante l\'avvio del checkout: ' + (err.message || err));
    }
});

/* Inizializzazione al DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();

    // mostra la sezione home iniziale (compatibilità con il tuo JS originale)
    document.querySelectorAll('.section, .hero').forEach(s => s.classList.remove('active'));
    const hero = document.querySelector('.hero');
    if (hero) hero.style.display = 'flex';
});
