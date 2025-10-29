// api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  try {
    const { line_items } = req.body;
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ error: 'line_items richiesti' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${process.env.PUBLIC_URL || req.headers.origin}/?checkout=success`,
      cancel_url: `${process.env.PUBLIC_URL || req.headers.origin}/?checkout=cancel`,
      shipping_address_collection: { allowed_countries: ['IT', 'ES', 'FR', 'DE', 'GB', 'US'] }, // personalizza
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
