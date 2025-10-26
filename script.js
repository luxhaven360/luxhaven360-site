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

async function placeOrder(productName, variantId) {
  const customer = {
    name: prompt("Inserisci il tuo nome completo:"),
    email: prompt("Inserisci la tua email:"),
    address: prompt("Indirizzo di spedizione:"),
    city: prompt("Città:"),
    country: prompt("Codice paese (es. IT):"),
    zip: prompt("CAP:"),
  };

  const response = await fetch("/.netlify/functions/createOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product: { name: productName, variantId },
      quantity: 1,
      customer,
    }),
  });

  if (response.ok) {
    alert("Ordine inviato con successo a Printful!");
  } else {
    alert("Errore durante la creazione dell’ordine.");
  }
}
