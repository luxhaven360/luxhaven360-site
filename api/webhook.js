// api/webhook.js
import Stripe from 'stripe';
import fetch from 'node-fetch';
import { PRODUCTS } from '../data/products.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const raw = await buffer(req);
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error('Errore verifica webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // recupera la session completa con line items
    const sessionFull = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items', 'customer_details'] });

    const skuToVariant = Object.fromEntries(PRODUCTS.map(p => [p.sku, p.variant_id]));

    // costruisci items Printful
    const items = sessionFull.line_items.data.map(li => {
      const sku = li.price.product.metadata?.sku || (li.description && li.description.split('|')[0]) || null;
      const variant_id = sku ? skuToVariant[sku] : null;
      return {
        variant_id: variant_id ? Number(variant_id) : null,
        quantity: li.quantity
      };
    }).filter(i => i.variant_id && i.quantity > 0);

    // recipient
    const addr = sessionFull.customer_details?.address || {};
    const recipient = {
      name: sessionFull.customer_details?.name || sessionFull.customer_details?.email,
      address1: addr.line1 || '',
      address2: addr.line2 || '',
      city: addr.city || '',
      state_code: addr.state || '',
      country_code: addr.country || '',
      zip: addr.postal_code || '',
      phone: sessionFull.customer_details?.phone || ''
    };

    // payload Printful
    const orderBody = {
      external_id: session.id,
      recipient,
      items: items.map(it => ({ variant_id: it.variant_id, quantity: it.quantity }))
    };

    try {
      const resp = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderBody)
      });
      const pf = await resp.json();
      if (!resp.ok) {
        console.error('Printful response error', pf);
      } else {
        console.log('Ordine creato su Printful', pf);
      }
    } catch (err) {
      console.error('Errore chiamata Printful:', err);
    }
  }

  res.json({ received: true });
}
