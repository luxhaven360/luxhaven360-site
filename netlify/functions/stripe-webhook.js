const Stripe = require('stripe');
const fetch = require('node-fetch');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const sig = event.headers['stripe-signature'];
  let eventBody;
  try {
    const buf = Buffer.from(event.body, 'utf8');
    eventBody = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.warn('Webhook signature failed:', err.message);
    // opzione fallback (meno sicura)
    eventBody = JSON.parse(event.body);
  }
  if (eventBody.type === 'checkout.session.completed') {
    const session = eventBody.data.object;
    const items = JSON.parse(session.metadata.custom || '[]');
    const shipping = session.shipping || {};
    const skuToVariant = {
      'TSHIRT_PREMIUM': 12345,
      'ART_PRINT': 23456,
      'ACCESSORY': 34567
    };
    const printfulItems = items.map(it => ({
      variant_id: skuToVariant[it.id],
      quantity: it.qty
    }));
    const orderBody = {
      recipient: {
        name: shipping.name || session.customer_details?.name || 'Cliente',
        address1: shipping.address?.line1 || '',
        address2: shipping.address?.line2 || '',
        city: shipping.address?.city || '',
        state_code: shipping.address?.state || '',
        country_code: shipping.address?.country || 'IT',
        zip: shipping.address?.postal_code || ''
      },
      items: printfulItems
    };
    try {
      const resp = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderBody)
      });
      const json = await resp.json();
      console.log('Printful order response:', json);
    } catch (err) {
      console.error('Error creating Printful order:', err);
    }
  }
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
