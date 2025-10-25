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

// --- Stripe Checkout Integration ---
document.addEventListener('DOMContentLoaded', () => {
  const stripe = Stripe('pk_test_TUA_PUBLISHABLE_KEY'); // <-- METTI QUI la tua publishable key Stripe

  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const productName = button.dataset.name;
      const unit_amount_cents = parseInt(button.dataset.price, 10);
      const printful_variant_id = button.dataset.variant;

      try {
        // crea sessione checkout via Netlify Function
        const response = await fetch('/.netlify/functions/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName,
            unit_amount_cents,
            quantity: 1,
            metadata: { printful_variant_id }
          })
        });

        const data = await response.json();

        if (data.id) {
          await stripe.redirectToCheckout({ sessionId: data.id });
        } else {
          alert('Errore: impossibile creare la sessione di pagamento.');
          console.error(data);
        }

      } catch (err) {
        console.error('Errore Stripe checkout:', err);
        alert('Si è verificato un errore nel pagamento.');
      }
    });
  });
});

