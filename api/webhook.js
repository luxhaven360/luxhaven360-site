// api/webhook.js (Vercel serverless)
// Usa micro per leggere raw body e verificare firma Stripe
import Stripe from 'stripe';
import { buffer } from 'micro';
import fetch from 'node-fetch'; // per chiamare Printful API

export const config = {
  api: {
    bodyParser: false
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PRINTFUL_KEY = process.env.PRINTFUL_KEY;

// Esempio di mappatura SKU -> variant_id (DEVI SOSTITUIRE con i tuoi ID reali)
function mapVariantId(sku) {
  const map = {
    'LH-T001': 4012,
    'LH-HOOD-001': 5023
    // aggiungi qui tutte le mappature reali
  };
  return map[sku];
}

// event handler
export default async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gestiamo solo checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Recupera session piena per avere shipping/customer details
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);

      // items li abbiamo messi in metadata al momento della create
      const items = JSON.parse(fullSession.metadata.items || '[]');

      // costruisci payload per Printful
      const printfulItems = items.map(it => ({
        variant_id: mapVariantId(it.sku),
        quantity: it.quantity || 1
        // files: [{ url: 'https://cdn.tuosito.it/designs/...' }] // se necessario
      })).filter(it => it.variant_id); // filtra quelli senza mapping

      // destinazione (attenzione ai campi, adattali se bisogno)
      const recipient = {
        name: `${fullSession.shipping?.name || fullSession.customer_details?.name || ''}`,
        address1: fullSession.shipping?.address?.line1 || '',
        address2: fullSession.shipping?.address?.line2 || '',
        city: fullSession.shipping?.address?.city || '',
        zip: fullSession.shipping?.address?.postal_code || '',
        country_code: (fullSession.shipping?.address?.country || '').toUpperCase(),
        email: fullSession.customer_details?.email || ''
      };

      const pfBody = {
        external_id: fullSession.id,
        recipient,
        items: printfulItems
      };

      // Chiamata a Printful
      const pfResp = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTFUL_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pfBody)
      });

      const pfJson = await pfResp.json();
      if (!pfResp.ok) {
        console.error('Printful error', pfJson);
        // qui puoi salvare lo stato/errore su DB o inviare notifica email
      } else {
        console.log('Ordine creato su Printful:', pfJson);
        // salva in DB se vuoi pfJson.result.id, pfJson.result.status, ecc.
      }
    } catch (err) {
      console.error('Errore processing checkout.session.completed', err);
    }
  }

  res.status(200).send('ok');
}
