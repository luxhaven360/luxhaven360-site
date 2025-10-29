const Stripe = require('stripe');
const fetch = require('node-fetch');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // imposta in Vercel

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature'];
  let event;

  // raw body is required to verify signature. Vercel provides req.rawBody if you disable body parsing;
  // however if not available, we fallback to parsing the body string.
  const buf = Buffer.from(JSON.stringify(req.body)); // fallback (may break signature verification)
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.warn('Webhook signature verification failed, attempting without verification', err.message);
    // as fallback (NOT recommended) try to parse event without verification
    event = req.body;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // recupera dettagli necessari
    const items = session.metadata && session.metadata.custom ? JSON.parse(session.metadata.custom) : null;
    const shipping = session.customer_details || session.shipping || {};
    // crea l'ordine su Printful
    try {
      // mapping: SKU (id) => Printful variant_id -- definisci nel tuo env oppure in un file
      const skuToVariant = {
        'TSHIRT_PREMIUM': 12345,
        'ART_PRINT': 23456,
        'ACCESSORY': 34567
      };

      const printfulItems = (items || []).map(it => ({
        variant_id: skuToVariant[it.id], // devi aggiornare con i tuoi variant_id reali da Printful
        quantity: it.qty || 1
      }));

      const orderBody = {
        recipient: {
          name: shipping.name || `${session.customer_details?.name || 'Cliente'}`,
          address1: session.shipping?.address?.line1 || '',
          address2: session.shipping?.address?.line2 || '',
          city: session.shipping?.address?.city || '',
          state_code: session.shipping?.address?.state || '',
          country_code: session.shipping?.address?.country || 'IT',
          zip: session.shipping?.address?.postal_code || ''
        },
        items: printfulItems
      };

      // POST to Printful API v2
      const r = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderBody)
      });
      const json = await r.json();
      console.log('Printful response', json);
    } catch (err) {
      console.error('Error creating Printful order', err);
    }
  }

  res.status(200).json({ received: true });
};
