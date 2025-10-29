const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { items } = JSON.parse(event.body);
    // validazione items ...
    const line_items = items.map(it => ({
      price_data: {
        currency: 'eur',
        product_data: { name: it.name, metadata: { sku: it.id } },
        unit_amount: it.price
      },
      quantity: it.qty
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/?checkout=success`,
      cancel_url: `${process.env.BASE_URL}/?checkout=cancel`,
      shipping_address_collection: { allowed_countries: ['IT','DE','FR','US','GB'] },
      metadata: { custom: JSON.stringify(items) }
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      })
    };
  } catch (err) {
    console.error('Error in create-checkout-session:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
