// Navigation (invariato)
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

// Aggiunto: Handler per forms shop con Stripe
document.addEventListener('DOMContentLoaded', () => {
    const stripe = Stripe('pk_test_51SNyL313nkSVo9XZyhMGIN7IgYjtKtaVZJACjcZvcFpaGXxFziU1QskI95o6pLD1X7IghAAzr2q3qQpNNpvtLMUw00b6GnSa1W');  // Sostituisci con la tua Publishable Key
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbx2HLGGl9XaNJolozuxCeEsf7leydkfAP931HvUWCq0udfdkjcka1nzxNqv4E5DwgmjDQ/exec';  // Il tuo URL; aggiorna se cambiato

    const handleCheckout = (formId, productName, price, getExtraData) => {
        const form = document.getElementById(formId);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            const extra = getExtraData ? getExtraData(form) : {};
            const data = { productName, price, email, ...extra };

            try {
    const params = new URLSearchParams(data);
    const response = await fetch(appsScriptUrl, {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Leggi come testo prima
    const text = await response.text();
    console.log('Raw response:', text);  // ← APRI CONSOLE E VEDI COSA ARRIVA

    let session;
    try {
        session = JSON.parse(text);  // Prova a parsare
    } catch (parseError) {
        throw new Error('Risposta non valida dal server: ' + text);
    }

    if (!session.id) {
        throw new Error('ID sessione mancante: ' + JSON.stringify(session));
    }

    stripe.redirectToCheckout({ sessionId: session.id });

} catch (error) {
    alert('Errore durante il checkout: ' + error.message);
    console.error(error);
}
        });
    };

    handleCheckout('apparel-form', 'Premium Apparel', 200, (form) => ({
        size: form.querySelector('select').value,
    }));
    handleCheckout('prints-form', 'Art Prints', 500);
    handleCheckout('accessori-form', 'Accessori Design', 200);
});
