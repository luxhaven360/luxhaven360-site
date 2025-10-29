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

// === SHOP / CART ===
const cart = [];

function initShop() {
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const id = card.getAttribute('data-product-id');
            const price = parseInt(card.getAttribute('data-price'), 10); // cents
            addToCart({ id, price, name: card.querySelector('.card-title').innerText });
        });
    });

    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    document.getElementById('closeCart').addEventListener('click', () => document.getElementById('cartModal').style.display = 'none');
}

function addToCart(item) {
    const found = cart.find(i => i.id === item.id);
    if (found) found.qty += 1; else cart.push({ ...item, qty: 1 });
    renderCart();
    document.getElementById('cartModal').style.display = 'block';
}

function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    if (cart.length === 0) { container.innerHTML = '<p>Carrello vuoto</p>'; return; }
    cart.forEach(i => {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.justifyContent = 'space-between'; row.style.marginBottom = '0.5rem';
        row.innerHTML = `<div>${i.name} x${i.qty}</div><div>€ ${(i.price*i.qty/100).toFixed(2)}</div>`;
        container.appendChild(row);
    });
    const totalCents = cart.reduce((s,i)=>s + i.price * i.qty, 0);
    const totalRow = document.createElement('div');
    totalRow.style.marginTop = '0.75rem';
    totalRow.innerHTML = `<strong>Totale: € ${(totalCents/100).toFixed(2)}</strong>`;
    container.appendChild(totalRow);
}

async function checkout() {
    if (cart.length === 0) return alert('Carrello vuoto');
    // Chiamata al backend per creare la sessione Stripe
    try {
        const resp = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
        const stripe = Stripe(data.publishableKey); // server ritorna la publishable key
        const { sessionId } = data;
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) alert(error.message);
    } catch (err) {
        console.error(err);
        alert('Errore durante la creazione del pagamento: ' + err.message);
    }
}

// inizializza shop dopo il DOM ready
document.addEventListener('DOMContentLoaded', () => { initShop(); });
