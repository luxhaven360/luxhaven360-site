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

// Funzione per acquistare prodotto tramite backend serverless
const endpoint = 'https://luxhaven360.netlify.app/.netlify/functions/printful-order';

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const productId = btn.dataset.productId;
        const price = btn.dataset.price;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, price })
            });

            const data = await res.json();
            if (data.success) {
                alert('Ordine ricevuto! Riceverai conferma via email.');
            } else {
                alert('Errore nella creazione dell’ordine. Riprova.');
                console.error(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Errore nella connessione al server.');
        }
    });
});


