const Stripe = require('stripe');
const fetch = require('node-fetch');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    try {
      // Estrai informazioni
      const shipping = session.shipping || {};
      const metadata = session.metadata || {};
      const variantId = parseInt(metadata.printful_variant_id, 10);
      const retailPrice = session.amount_total / 100.0; // es. 12000 → 120.00

      // Costruisci body ordine per Printful v2
      const orderBody = {
        recipient: {
          name: shipping.name || session.customer_details?.name || '',
          address1: shipping.address?.line1,
          address2: shipping.address?.line2,
          city: shipping.address?.city,
          state_code: shipping.address?.state,
          country_code: shipping.address?.country,
          zip: shipping.address?.postal_code,
          email: session.customer_details?.email,
          phone: shipping.phone || ''
        },
        items: [
          {
            variant_id: variantId,
            quantity: 1,
            retail_price: retailPrice.toFixed(2),
            files: [
              {
                url: metadata.printful_file_url || '',   // se passi URL immagine
                placement: metadata.placement || 'front_large'
              }
            ]
          }
        ],
        customization: {
          packing_slip: {
            store_name: "LuxHaven360",
            message: "Grazie per il tuo acquisto!"
          }
        }
      };

      const resp = await fetch('https://api.printful.com/v2/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
        },
        body: JSON.stringify(orderBody)
      });

      const json = await resp.json();
      if (!resp.ok) {
        console.error('Printful v2 error:', json);
        // eventuale retry o segnalazione
      } else {
        console.log('Printful v2 order created:', json);
      }
    } catch (err) {
      console.error('Errore durante creazione ordine Printful v2:', err);
    }
  }

  return { statusCode: 200, body: 'OK' };
};
