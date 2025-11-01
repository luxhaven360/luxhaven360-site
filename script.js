// --- NAV, toggle, scroll handlers (mantengo le tue funzioni originali) ---
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

// --- SHOP: gestione pulsanti "Acquista" ---
// Quando l'utente clicca "Acquista", lo reindirizziamo al Payment Link corrispondente.
// I Payment Links vanno creati sulla dashboard Stripe e incollati nel data-payment-link del card.
function buyProduct(button) {
    try {
        const card = button.closest('.product-card');
        if (!card) return alert('Prodotto non trovato.');

        const paymentLink = card.getAttribute('data-payment-link');
        const sku = card.getAttribute('data-sku') || '';
        const price = card.getAttribute('data-price') || '';

        if (!paymentLink || paymentLink.startsWith('REPLACE_WITH_PAYMENT_LINK')) {
            return alert('Link di pagamento non configurato per questo prodotto. Controlla il pannello di amministrazione.');
        }

        // Open Stripe hosted checkout in a new tab (safer UX) — Stripe Payment Links are hosted pages.
        // Apriamo in una nuova scheda per non perdere la sessione attuale.
        window.open(paymentLink, '_blank');

        // Facoltativo: puoi anche inviare segnali di tracking / analytics qui
        console.log(`Redirecting to Stripe Payment Link for SKU=${sku} price=${price}`);
    } catch (err) {
        console.error(err);
        alert('Si è verificato un errore. Riprova più tardi.');
    }
}
