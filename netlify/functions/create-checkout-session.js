// netlify/functions/create-checkout-session.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    // body dovrebbe contenere { productName, unit_amount_cents, quantity, metadata }
    const { productName = 'LuxHaven T-shirt', unit_amount_cents = 12000, quantity = 1, metadata = {} } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: productName },
          unit_amount: unit_amount_cents
        },
        quantity
      }],
      success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/shop`,
      metadata // qui puoi passare variant_id Printful ecc.
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
