import fetch from 'node-fetch';

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { productId, price } = JSON.parse(event.body);

    // Mappa productId ai variant_id Printful
    const productMap = {
        "premium-apparel": 12345,
        "art-prints": 23456,
        "design-accessories": 34567
    };
    const variant_id = productMap[productId];

    if (!variant_id) {
        return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Prodotto non trovato' }) };
    }

    try {
        const response = await fetch('https://api.printful.com/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient: {
                    name: 'Cliente Demo',
                    address1: 'Via Roma 1',
                    city: 'Roma',
                    country_code: 'IT',
                    email: 'cliente@example.com'
                },
                items: [
                    { variant_id, quantity: 1 }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Errore API Printful');

        return { statusCode: 200, body: JSON.stringify({ success: true, data }) };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
    }
}
