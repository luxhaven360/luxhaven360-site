const Stripe = require('stripe');
const fetch = require('node-fetch');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  // Stripe invia webhook come POST; dobbiamo verificare la firma
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Errore firma webhook', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Gestiamo solo evento di checkout completato
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    try {
      // Recupera informazioni cliente/spedizione
      const shipping = session.shipping || session.customer_details || {};
      const metadata = session.metadata || {};
      const productId = metadata.productId || (session.display_items && session.display_items[0] && session.display_items[0].custom && session.display_items[0].custom.name) || 'unknown';
      const variantId = metadata.printful_variant_id;

      // Costruisci payload per Printful (semplice: 1 item, variant_id)
      const orderBody = {
        recipient: {
          name: (shipping.name || `${session.customer_details?.name || ''}`).trim(),
          address1: shipping.address?.line1 || shipping.address_line1 || '',
          address2: shipping.address?.line2 || shipping.address_line2 || '',
          city: shipping.address?.city || '',
          state_code: shipping.address?.state || '',
          country_code: shipping.address?.country || '',
          zip: shipping.address?.postal_code || '',
          email: session.customer_details?.email || '',
          phone: shipping.phone || ''
        },
        items: [
          {
            variant_id: parseInt(variantId, 10),
            quantity: 1
          }
        ],
        // opzionale: note per l'ordine su Printful
        retail_costs: {
          currency: "EUR"
        }
      };

      // Chiamata a Printful API (usa token privato / Bearer)
      const PRINTFUL_API = process.env.PRINTFUL_API_URL || 'https://api.printful.com/orders';
      const PRINTFUL_TOKEN = process.env.PRINTFUL_API_KEY;

      const resp = await fetch(PRINTFUL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PRINTFUL_TOKEN}`
        },
        body: JSON.stringify(orderBody)
      });
      const json = await resp.json();

      if (!resp.ok) {
        console.error('Errore Printful:', json);
        // qui puoi implementare retry o emailing admin
      } else {
        console.log('Ordine Printful creato:', json);
      }

    } catch (err) {
      console.error('Errore durante creazione ordine Printful:', err);
    }
  }

  return { statusCode: 200, body: 'OK' };
};
