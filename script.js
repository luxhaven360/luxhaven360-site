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

// funzione frontend per chiamare la Netlify Function
async function acquistaProdottoFrontend(nomeProdotto, prezzo, cliente, syncVariantId) {
  const ordine = {
    prodotto: nomeProdotto,
    prezzo: prezzo,
    quantita: 1,
    cliente: cliente,
    sync_variant_id: syncVariantId
  };

  try {
    const res = await fetch('/.netlify/functions/sendToPrintful', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // PER TEST: sostituisci temporaneamente 'INSERISCI_QUI_IL_TUO_SITE_SECRET' con il Site Secret che imposterai su Netlify.
        // ATTENZIONE: NON lasciare questo valore in chiaro su repo pubblico in produzione.
        'x-site-secret': 'INSERISCI_QUI_IL_TUO_SITE_SECRET'
      },
      body: JSON.stringify(ordine)
    });

    const data = await res.json();
    if (res.ok) {
      console.log('Printful response:', data);
      alert('Ordine inviato con successo a Printful.');
    } else {
      console.error('Errore Printful:', data);
      alert('Errore durante l\'invio dell\'ordine: ' + (data.error || JSON.stringify(data)));
    }
  } catch (err) {
    console.error('Errore di rete:', err);
    alert('Errore di rete: ' + err.message);
  }
}

