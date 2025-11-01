// --- Nav & UI (tuo script esistente mantenuto) ---

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

// --- Shop / Stripe Payment Links integration ---

/*
  Replace these placeholders with the actual Payment Link URLs you create in Stripe.
  Example:
    "LH360-TSHIRT": "https://buy.stripe.com/abcd1234..."
*/
const PRODUCT_PAYMENT_LINKS = {
    "LH360-TSHIRT": "https://buy.stripe.com/test_4gMaEP6ecaHB7dI6WQ3VC00",
    "LH360-PRINT": "REPLACE_WITH_YOUR_STRIPE_PAYMENT_LINK_FOR_PRINT",
    "LH360-ACC": "REPLACE_WITH_YOUR_STRIPE_PAYMENT_LINK_FOR_ACCESSORY"
};

/**
 * buyProduct(buttonElement)
 * Called when user clicks "Acquista". Reads data attributes and redirects to the Payment Link.
 */
function buyProduct(btn) {
    const sku = btn.getAttribute('data-product-sku');
    const name = btn.getAttribute('data-product-name');
    const price = btn.getAttribute('data-price');

    const paymentLink = PRODUCT_PAYMENT_LINKS[sku];
    if (!paymentLink || paymentLink.startsWith("REPLACE_WITH")) {
        alert("Pagamento non configurato per questo prodotto. Controlla i Payment Links in Stripe e aggiorna il sito.");
        return;
    }

    // Optional: we can store some analytics in localStorage before redirect
    try {
        localStorage.setItem('lh360_last_product', JSON.stringify({sku, name, price, ts: Date.now()}));
    } catch(e) {}

    // Redirect to the payment link (opens in same tab)
    window.location.href = paymentLink;
}

// --- end ---
