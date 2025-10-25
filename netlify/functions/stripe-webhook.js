// netlify/functions/stripe-webhook.js
const Stripe = require('stripe');
const fetch = require('node-fetch');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const sig = (event.headers && (event.headers['stripe-signature'] || event.headers['Stripe-Signature'])) || '';
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    try {
      // recupera line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      const customer = session.customer_details || {};
      const shipping = session.shipping || session.customer_details?.address || {};

      // costruisci payload per Printful
      // MAPPA i tuoi variant_id dal metadata o dal lineItems
      const itemsForPrintful = lineItems.data.map(li => ({
        variant_id: li.price?.product ? /* mappa qui */ 0 : 0,
        quantity: li.quantity
      }));
      // ESEMPIO statico se usi un variant_id noto:
      const printfulItems = [{
        variant_id: parseInt(session.metadata?.printful_variant_id || process.env.DEFAULT_PRINTFUL_VARIANT_ID, 10),
        quantity: 1
      }];

      const recipient = {
        name: `${customer.name || session.metadata?.name || 'Cliente'}`,
        address1: shipping.address?.line1 || shipping.line1 || session.metadata?.address1 || '---',
        city: shipping.address?.city || session.metadata?.city || '---',
        country_code: (shipping.address?.country || session.metadata?.country || 'IT'),
        zip: shipping.address?.postal_code || session.metadata?.zip || '00000'
      };

      // Auth Basic: token + ':' base64
      const auth = Buffer.from(`${process.env.PRINTFUL_API_KEY}:`).toString('base64');

      const resp = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient,
          items: printfulItems,
          // opzionali: external_id, packing_slip, etc
          external_id: session.id
        })
      });

      const pfRes = await resp.json();
      console.log('Printful response', pfRes);

    } catch (err) {
      console.error('Error creating Printful order', err);
      // logga e valuta retry / notifica
    }
  }

  return { statusCode: 200, body: 'OK' };
};
