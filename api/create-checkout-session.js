// CommonJS for Vercel serverless
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { items } = req.body; // array {id, price, qty, name}
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });

    const line_items = items.map(it => ({
      price_data: {
        currency: 'eur',
        product_data: { name: it.name, metadata: { sku: it.id } },
        unit_amount: it.price
      },
      quantity: it.qty || 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/?checkout=success`,
      cancel_url: `${process.env.BASE_URL}/?checkout=cancel`,
      shipping_address_collection: { allowed_countries: ['IT','GB','US','DE','FR'] },
      metadata: { custom: JSON.stringify(items) }
    });

    return res.json({ sessionId: session.id, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
