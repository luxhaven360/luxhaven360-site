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

const STRIPE_PUBLISHABLE_KEY = "pk_test_replace_with_your_key"; // <--- SOSTITUISCI con la tua publishable key
const APPS_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYED_URL/exec"; // <--- SOSTITUISCI con l'URL del Web App Apps Script

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

/**
 * startCheckout(product)
 * product = { id: 'tshirt001', name: 'Maglietta Premium', unit_price_eur: 35 }
 */
async function startCheckout(product) {
    try {
        // Mostra prompt per quantità e email cliente (minimo, essenziale)
        const quantity = parseInt(prompt(`Quante unità di "${product.name}" vuoi acquistare?`, "1")) || 1;
        const customer_email = prompt("Inserisci la tua email per la ricevuta:", "");

        const order = {
            items: [
                {
                    id: product.id,
                    name: product.name,
                    unit_price_eur: product.unit_price_eur,
                    quantity: quantity
                }
            ],
            customer_email: customer_email
        };

        // Chiamata al backend Apps Script per creare la Checkout Session
        const resp = await fetch(APPS_SCRIPT_WEBAPP_URL + "?action=createSession", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error("Errore dal server: " + txt);
        }

        const data = await resp.json();
        if (data && data.sessionId) {
            // Redirect a Stripe Checkout
            const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
            if (error) {
                alert("Errore redirect Stripe: " + error.message);
            }
        } else {
            throw new Error("Risposta non valida dal server.");
        }
    } catch (err) {
        console.error(err);
        alert("Errore: " + err.message);
    }
}

/**
 * Gestione del success page: Stripe redirecta con session_id nella query string.
 * Quando l'utente torna sul sito, mostriamo una conferma semplice.
 */
function handlePostCheckout() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
        // Nascondi le sezioni e mostra la sezione di conferma ordine
        document.querySelectorAll('.section, .hero').forEach(s => s.style.display = 'none');
        const successSection = document.getElementById('order-success');
        successSection.style.display = 'block';
        document.getElementById('session-id').innerText = sessionId;

        // Messaggio: il record reale dell'ordine viene salvato dal webhook Stripe -> Apps Script -> Google Sheets.
        document.getElementById('success-message').innerText =
            "Pagamento ricevuto. I dettagli dell'ordine saranno memorizzati e ti invieremo una conferma via email.";
    }
}

// Esegui all'avvio
document.addEventListener('DOMContentLoaded', () => {
    // Esegui la gestione post-checkout se presente session_id
    handlePostCheckout();
});
