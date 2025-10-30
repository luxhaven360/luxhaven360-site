const fetch = require('node-fetch');

exports.handler = async () => {
  try {
    const resp = await fetch('https://api.printful.com/v2/catalog/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });
    const json = await resp.json();
    if (!resp.ok) {
      console.error('Errore Printful catalogo:', json);
      return { statusCode: 500, body: JSON.stringify({ message: 'Errore nel catalogo' }) };
    }
    // restituisci solo i dati utili al frontend
    return {
      statusCode: 200,
      body: JSON.stringify(json.result)
    };
  } catch (err) {
    console.error('Errore fetch catalogo:', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
