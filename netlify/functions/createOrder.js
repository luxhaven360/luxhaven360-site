// netlify/functions/createOrder.js

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);

    const response = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: {
          name: body.customer.name,
          address1: body.customer.address,
          city: body.customer.city,
          country_code: body.customer.country,
          zip: body.customer.zip,
          email: body.customer.email,
        },
        items: [
          {
            variant_id: body.product.variantId,
            quantity: body.quantity,
          },
        ],
      }),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore nel creare l’ordine Printful" }),
    };
  }
}
