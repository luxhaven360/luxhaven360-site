// netlify/functions/sendToPrintful.js
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!payload.prodotto || !payload.cliente || !payload.cliente.email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const siteSecret = process.env.SITE_SECRET || '';
  const incomingSecret = (event.headers && (event.headers['x-site-secret'] || event.headers['X-Site-Secret'])) || '';
  if (!siteSecret || siteSecret !== incomingSecret) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  if (!PRINTFUL_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Printful API key not configured' }) };
  }

  const orderForPrintful = {
    recipient: {
      name: payload.cliente.nome || 'Cliente',
      address1: payload.cliente.address1 || 'Indirizzo non specificato',
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
    const res = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(PRINTFUL_API_KEY + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderForPrintful)
    });

    const data = await res.json();
    return { statusCode: res.status, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
