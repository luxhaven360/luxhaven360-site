// Navigation
        function showSection(sectionId) {
            document.querySelectorAll('.section, .hero').forEach(s => s.classList.remove('active'));
            
            if (sectionId === 'home') {
                document.querySelector('.hero').style.display = 'flex';
            } else {
                document.querySelector('.hero').style.display = 'none';
                document.getElementById(sectionId).classList.add('active');
            }
            
            // Close mobile menu
            document.getElementById('navLinks').classList.remove('active');
            
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
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove('active');
            }
        });

// ---------------- Shop / cart logic ----------------
const APPS_SCRIPT_BASE = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOY_ID/exec'; // <-- SOSTITUISCI QUI
let cart = [];

// helper
function formatPrice(cents) {
    return '€ ' + (cents / 100).toFixed(2);
}

// add to cart UI
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product');
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price, 10);
            const variantSelect = card.querySelector('.variant');
            const variant = variantSelect ? variantSelect.value : null;
            addToCart({ id, name, price, variant, qty: 1 });
        });
    });

    document.getElementById('clearCart').addEventListener('click', () => { cart = []; renderCart(); });
    document.getElementById('checkoutBtn').addEventListener('click', startCheckout);
    renderCart();
});

function addToCart(item) {
    // combine if same id+variant
    const idx = cart.findIndex(ci => ci.id === item.id && ci.variant === item.variant);
    if (idx >= 0) { cart[idx].qty += 1; } else { cart.push(item); }
    renderCart();
    showMessage('Prodotto aggiunto al carrello');
}

function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    let total = 0;
    if (cart.length === 0) container.innerHTML = '<em>Carrello vuoto</em>';
    else {
        cart.forEach((it, i) => {
            const div = document.createElement('div');
            div.style.marginBottom = '0.5rem';
            div.innerHTML = `<strong>${it.name}</strong> ${it.variant ? '('+it.variant+')' : ''} — ${formatPrice(it.price)} x ${it.qty}
                <button data-i="${i}" class="btn small remove">×</button>`;
            container.appendChild(div);
        });
        total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    }
    const totalDiv = document.createElement('div');
    totalDiv.style.marginTop = '0.75rem';
    totalDiv.innerHTML = `<strong>Totale:</strong> ${formatPrice(total)}`;
    container.appendChild(totalDiv);

    document.getElementById('checkoutBtn').disabled = cart.length === 0;
    // attach remove listeners
    container.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', e => {
        const idx = parseInt(e.target.dataset.i, 10);
        cart.splice(idx, 1);
        renderCart();
    }));
}

function showMessage(msg) {
    const el = document.getElementById('cartMessage');
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 4000);
}

// start checkout: call Apps Script to create Stripe Checkout session
async function startCheckout() {
    if (cart.length === 0) { showMessage('Carrello vuoto'); return; }
    const name = document.getElementById('customerName').value || '';
    const email = document.getElementById('customerEmail').value || '';
    if (!name || !email) { alert('Inserisci nome ed email per procedere.'); return; }

    const payload = {
        cart,
        customer: { name, email },
        // optional: you can pass other metadata here
    };

    try {
        document.getElementById('checkoutBtn').disabled = true;
        showMessage('Connessione al server di pagamento...');
        const resp = await fetch(APPS_SCRIPT_BASE + '?action=createCheckout', {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (data && data.url) {
            // redirect to Stripe Checkout
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Errore creazione checkout');
        }
    } catch (err) {
        console.error(err);
        alert('Errore: ' + (err.message || JSON.stringify(err)));
        document.getElementById('checkoutBtn').disabled = false;
    }
}
