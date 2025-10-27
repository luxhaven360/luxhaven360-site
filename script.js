// Navigation
nav.classList.remove('active');
}
});


/* -----------------------------
Shop & Stripe Checkout
----------------------------- */


// Replace with your publishable Stripe key (the server will provide the session id)
// The client will fetch /create-checkout-session on our server


async function buyNow(button) {
try {
const card = button.closest('.card');
const variantId = card.getAttribute('data-variant-id');
const title = card.querySelector('.card-title').innerText;
const priceText = card.querySelector('.card-price').innerText; // e.g. "€ 120"
// convert price to cents (basic parsing) - adjust if you use different currencies
const numeric = priceText.replace(/[^0-9.,]/g, '').replace(',', '.');
const amountCents = Math.round(parseFloat(numeric) * 100);


// create a Checkout Session on the server
const res = await fetch('/create-checkout-session', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
items: [{ variant_id: Number(variantId), quantity: 1 }],
metadata: { product_title: title },
// pass amount for reference or server-side calculation
amount: amountCents
})
});


const data = await res.json();
if (data.error) throw new Error(data.error);


const stripe = Stripe(data.publishableKey);
// Redirect to Checkout
const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
if (error) console.error(error);


} catch (err) {
console.error(err);
alert('Si è verificato un errore durante l'avvio del pagamento. Controlla la console.');
}
}


// Initialize shop: (optional) dynamically attach handlers if needed
function initShop() {
document.querySelectorAll('#shopGrid .card').forEach(card => {
const btn = card.querySelector('button');
btn.addEventListener('click', () => buyNow(btn));
});
}


// run
initShop();
