// api/create-checkout-session.js (Vercel serverless)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { items } = req.body; // array di {sku, name, price, quantity}
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Carrello vuoto' });
    }

    // costruisce line_items per Stripe
    const line_items = items.map(it => ({
      price_data: {
        currency: 'eur',
        product_data: { name: it.name },
        unit_amount: Math.round(it.price * 100)
      },
      quantity: it.quantity || 1
    }));

    // memorizziamo gli items nella metadata della sessione per poi leggerli nel webhook
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['IT', 'FR', 'DE', 'ES', 'GB', 'US'] // personalizza
      },
      success_url: `${process.env.FRONTEND_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/?canceled=true`,
      metadata: {
        items: JSON.stringify(items)
      }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session error', err);
    res.status(500).json({ error: 'Impossibile creare sessione di checkout' });
  }
}
