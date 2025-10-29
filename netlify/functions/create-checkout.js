const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Mappa prodotti lato server -> prezzo (in centesimi) e mapping Printful variant id
const PRODUCTS = {
  "lux-tee": {
    name: "Premium Lux Tee",
    price_cents: 12000, // €120.00
    // Questo variant_id è ESEMPIO: sostituisci con il tuo variant id Printful (o sync_variant_id)
    printful_variant_id: 4012
  },
  "art-print": {
    name: "Art Print",
    price_cents: 25000,
    printful_variant_id: 12345
  },
  "lux-accessory": {
    name: "Accessory",
    price_cents: 12000,
    printful_variant_id: 54321
  }
};

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { productId, quantity = 1 } = JSON.parse(event.body || '{}');
    const product = PRODUCTS[productId];
    if (!product) return { statusCode: 400, body: JSON.stringify({ message: 'Prodotto non valido' }) };

    // Crea sessione Checkout (configura shipping collection se necessario)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            metadata: { productId },
          },
          unit_amount: product.price_cents
        },
        quantity: quantity
      }],
      // Raccogli indirizzo di spedizione durante checkout
      shipping_address_collection: { allowed_countries: ['IT', 'US', 'GB', 'FR', 'DE'] },
      // Metadati utili lato webhook per creare l'ordine Printful
      metadata: {
        productId,
        printful_variant_id: String(product.printful_variant_id)
      },
      success_url: `${process.env.SITE_URL}/?checkout=success`,
      cancel_url: `${process.env.SITE_URL}/?checkout=cancel`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
