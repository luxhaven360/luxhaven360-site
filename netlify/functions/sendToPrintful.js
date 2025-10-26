const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Basic validation (espandi secondo necessità)
  if (!payload.prodotto || !payload.cliente || !payload.cliente.email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // Leggi la chiave API Printful dalle env vars di Netlify
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  if (!PRINTFUL_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Printful API key not configured' }) };
  }

  // Costruisci l'ordine per Printful — PERSONALIZZA sync_variant_id e indirizzo cliente
  const orderForPrintful = {
    recipient: {
      name: payload.cliente.nome || 'Cliente',
      // Sostituisci con indirizzo reale o campi passati dal frontend
      address1: payload.cliente.address1 || 'Indirizzo Non Specificato',
      city: payload.cliente.city || 'Città',
      country_code: payload.cliente.country_code || 'IT',
      email: payload.cliente.email
    },
    items: [
      {
        sync_variant_id: payload.sync_variant_id || Number(process.env.DEFAULT_SYNC_VARIANT_ID || 0),
        quantity: payload.quantita || 1,
        retail_price: payload.prezzo ? String(payload.prezzo) : undefined,
        name: payload.prodotto
      }
    ]
  };

  try {
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(PRINTFUL_API_KEY + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderForPrintful)
    });

    const data = await response.json();

    // Passa al frontend la risposta di Printful (o un messaggio custom)
    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
