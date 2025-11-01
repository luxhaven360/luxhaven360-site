// =======================
// CONFIGURAZIONE (modifica qui l'URL del tuo Apps Script deployato)
// =======================
const APPS_SCRIPT_BACKEND = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYED_URL/exec'; 
// Sostituisci con l'URL finale: es. https://script.google.com/macros/s/AKfycbx.../exec

// =======================
// Prodotti demo (aggiorna prezzi in centesimi)
// =======================
const PRODUCTS = [
    { id: 'tshirt-premium', name: 'Premium T-shirt LuxHaven360', price_cents: 12000, currency: 'eur', description: 'Maglietta in cotone pettinato, logo ricamato.' },
    { id: 'art-print', name: 'Art Print - Collezione Iconica', price_cents: 25000, currency: 'eur', description: 'Stampa fotografica in edizione limitata.' },
    { id: 'accessorio-design', name: 'Accessorio Design LuxHaven', price_cents: 8000, currency: 'eur', description: 'Accessorio lifestyle premium con packaging esclusivo.' }
];

// =======================
// UI: inietta prodotti nella pagina
// =======================
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    PRODUCTS.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-image">👕</div>
            <h3 class="card-title">${p.name}</h3>
            <p class="card-desc">${p.description}</p>
            <div class="card-price">€ ${(p.price_cents/100).toFixed(2)}</div>
            <button class="btn buy-btn" style="margin-top:1.5rem;width:100%;">Acquista</button>
        `;
        card.querySelector('.buy-btn').addEventListener('click', () => buyProduct(p));
        grid.appendChild(card);
    });
}

// =======================
// Funzione: crea sessione di checkout tramite Apps Script e reindirizza a Stripe Checkout
// =======================
async function buyProduct(product, quantity = 1) {
    try {
        const body = {
            action: 'createSession',
            product: product,
            quantity: quantity
        };
        const resp = await fetch(APPS_SCRIPT_BACKEND, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        const data = await resp.json();
        if (data && data.checkout_url) {
            // redireziona l'utente a Stripe Checkout
            window.location.href = data.checkout_url;
        } else {
            alert('Errore nella creazione della sessione di pagamento. Controlla console.');
            console.error('createSession response', data);
        }
    } catch (err) {
        console.error(err);
        alert('Errore di rete durante l\'acquisto. Riprova più tardi.');
    }
}

// =======================
// Dopo il ritorno da Stripe: se c'è ?session_id=.. in URL, chiamiamo il backend per "catturare" i dettagli dell'ordine
// =======================
async function captureOrderFromSession(session_id) {
    try {
        const body = {
            action: 'captureOrder',
            session_id: session_id
        };
        const resp = await fetch(APPS_SCRIPT_BACKEND, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        const data = await resp.json();
        // mostrare conferma all'utente
        if (data && data.success) {
            showSection('order-success');
            document.getElementById('orderDetails').textContent = `ID sessione: ${session_id}\nTotale: ${data.amount_total ? (data.amount_total/100).toFixed(2) + ' ' + (data.currency||'') : '---'}\nEmail cliente: ${data.customer_email || '---'}\nProdotti: ${data.items_summary || '---'}`;
            document.getElementById('successMessage').textContent = 'Pagamento registrato e dettagli salvati nel foglio ordini.';
        } else {
            showSection('order-success');
            document.getElementById('orderDetails').textContent = 'Pagamento rilevato, ma non siamo riusciti a salvare automaticamente i dettagli. Controlla il foglio ordini.';
        }
    } catch (err) {
        console.error(err);
        showSection('order-success');
        document.getElementById('orderDetails').textContent = 'Errore durante la registrazione dell\'ordine. Controlla la console per dettagli.';
    }
}

// =======================
// Utility: leggere session_id dalla query string
// =======================
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// =======================
// NAV (tue funzioni esistenti) - mantenute
// =======================
function showSection(sectionId) {
    document.querySelectorAll('.section, .hero').forEach(s => s.classList.remove('active'));
    if (sectionId === 'home') {
        document.querySelector('.hero').style.display = 'flex';
    } else {
        document.querySelector('.hero').style.display = 'none';
        const el = document.getElementById(sectionId);
        if (el) el.classList.add('active');
    }
    document.getElementById('navLinks').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

document.addEventListener('click', (e) => {
    const nav = document.getElementById('navLinks');
    const toggle = document.querySelector('.mobile-toggle');
    if (!nav.contains(e.target) && toggle && !toggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// =======================
// Init
// =======================
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    // Se torniamo dalla pagina di Stripe con ?session_id=..., proviamo a catturare l'ordine
    const session_id = getQueryParam('session_id');
    if (session_id) {
        // puliamo querystring per non ripetere la chiamata se l'utente ricarica
        if (window.history && window.history.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('session_id');
            window.history.replaceState({}, document.title, url.toString());
        }
        captureOrderFromSession(session_id);
    }
});
