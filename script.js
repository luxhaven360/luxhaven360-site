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

// --- SHOP logic ---
/*
 PRODUCTS: id (server uses lo stesso id), name, description, price (in EUR cents), currency, image (opzionale)
 Modifica i prodotti a tuo piacimento.
*/
const PRODUCTS = [
    { id: "luxh-tee-001", name: "T-Shirt Premium LuxHaven", description: "Cotone pettinato, logo discreto", price_cents: 12000, currency: "eur", image: "" },
    { id: "luxh-print-001", name: "Art Print - Collezione Iconic", description: "Stampa numerata 50x70cm", price_cents: 25000, currency: "eur", image: "" },
    { id: "luxh-access-001", name: "Accessorio Design LuxHaven", description: "Accessori lifestyle premium", price_cents: 8000, currency: "eur", image: "" }
];

function formatPrice(cents, currency="eur"){
    // semplice formattazione
    const euros = (cents/100).toFixed(2);
    return `${euros} €`;
}

function renderProducts(){
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = "";
    PRODUCTS.forEach(p => {
        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
            <div class="card-image">👕</div>
            <h3 class="card-title">${p.name}</h3>
            <p class="card-desc">${p.description}</p>
            <div class="card-price">${formatPrice(p.price_cents)}</div>
            <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                <select id="size-${p.id}">
                    <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
                </select>
                <input id="qty-${p.id}" type="number" min="1" value="1" style="width:70px; padding:8px;" />
            </div>
            <button class="btn" style="margin-top:1rem; width:100%;" onclick="buyProduct('${p.id}')">Acquista</button>
        `;
        grid.appendChild(card);
    });
}

async function buyProduct(productId){
    const product = PRODUCTS.find(p => p.id === productId);
    if(!product) return alert("Prodotto non trovato");

    const size = document.getElementById(`size-${productId}`)?.value || "";
    const qty = parseInt(document.getElementById(`qty-${productId}`)?.value || "1", 10);
    if(qty < 1) return alert("Quantità non valida");

    // Chiamata al serverless per creare la sessione Stripe
    try {
        const resp = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: product.id,
                name: product.name,
                description: product.description,
                price_cents: product.price_cents,
                currency: product.currency,
                quantity: qty,
                meta: { size }
            })
        });
        const data = await resp.json();
        if (data.url) {
            // redirige a Stripe Checkout
            window.location = data.url;
        } else {
            console.error(data);
            alert("Errore nella creazione del pagamento. Controlla la console.");
        }
    } catch (e) {
        console.error(e);
        alert("Errore di rete. Riprova.");
    }
}

// On load
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});
