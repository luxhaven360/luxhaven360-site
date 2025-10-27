import fetch from 'node-fetch';

export async function handler(event, context) {
    // CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { productId, price } = JSON.parse(event.body);

        // Mappa productId -> variant_id Printful
        const productMap = {
            "premium-apparel": 12345,
            "art-prints": 23456,
            "design-accessories": 34567
        };

        const variantId = productMap[productId];
        if (!variantId) throw new Error('Prodotto non trovato');

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
                    { variant_id: variantId, quantity: 1 }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Errore API Printful');

        return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };
    } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message }) };
    }
}
