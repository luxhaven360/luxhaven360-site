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

// --- SHOP: integrazione checkout (Stripe via Netlify Functions) ---

// Bottone "Acquista" -> crea sessione di checkout lato server (Netlify Function)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const card = e.target.closest('.card');
            const productId = card.getAttribute('data-product-id');

            try {
                // Chiamata alla Netlify Function che crea la Stripe Checkout session
                const res = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity: 1 })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Errore durante la creazione del checkout');

                // Redirect al Checkout (Stripe Checkout URL)
                window.location.href = data.url;
            } catch (err) {
                console.error(err);
                alert('Si è verificato un errore nel processo di acquisto. Controlla la console.');
            }
        });
    });
});
