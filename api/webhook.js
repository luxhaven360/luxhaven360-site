// api/webhook.js
import Stripe from 'stripe';
import fetch from 'node-fetch';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

export const config = {
  api: {
    bodyParser: false // Stripe requires raw body for signature verification
  }
};

// helper to read stream
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
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
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Retrieve the full session with line items
    const sessionFull = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer_details']
    });

    try {
      // Build Printful order payload
      // Map Stripe line items (metadata.variant) to Printful items
      const items = sessionFull.line_items.data.map(li => {
        const variant = li.price.product.metadata ? li.price.product.metadata.variant : (li.price.product && li.price.product.id) || null;
        // fallback: metadata present in unit_price product_data creates product with metadata in our flow?
        // We passed metadata in product_data above. For robustness, attempt to read from li.description/description...
        // IMPORTANT: ensure you use real Printful variant IDs (integer) in product metadata or maintain mapping table.
        return {
          variant_id: parseInt(li.price.product.metadata?.variant || li.price.product?.metadata?.variant || li.price.product?.id || 0),
          quantity: li.quantity,
          // If you need custom file/images, include "files": [...]
        };
      }).filter(i => i.variant_id && i.quantity > 0);

      // Shipping info from Stripe
      const shipping = sessionFull.customer_details?.address;
      const recipient = {
        name: sessionFull.customer_details?.name || sessionFull.customer_details?.email,
        address1: shipping?.line1 || '',
        address2: shipping?.line2 || '',
        city: shipping?.city || '',
        state_code: shipping?.state || '',
        country_code: shipping?.country || '',
        zip: shipping?.postal_code || '',
        phone: sessionFull.customer_details?.phone || ''
      };

      // Build Printful order body (v1 API example)
      const orderBody = {
        external_id: session.id,
        recipient,
        items: items.map(it => ({ variant_id: it.variant_id, quantity: it.quantity }))
      };

      // POST to Printful
      const resp = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderBody)
      });

      const printfulResult = await resp.json();
      if (!resp.ok) {
        console.error('Printful error', printfulResult);
        // You may want to notify admin / retry
      } else {
        console.log('Order created on Printful', printfulResult);
      }

    } catch (err) {
      console.error('Error creating Printful order', err);
    }
  }

  res.json({ received: true });
}
