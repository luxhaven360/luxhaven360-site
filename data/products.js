// data/products.js
// Unico punto di verità per i prodotti venduti.
// MODIFICA: inserisci qui i tuoi variant_id Printful reali e gli URL delle immagini.

export const PRODUCTS = [
  {
    sku: "TSHIRT_PREMIUM",
    name: "T-Shirt Premium",
    description: "Cotone pettinato, stampa logo LuxHaven360.",
    price_cents: 12000,
    image: "https://via.placeholder.com/400x400?text=T-Shirt+Premium", // <-- SOSTITUISCI con gli URL delle immagini reali
    variant_id: 123456789  // <-- SOSTITUISCI con il variant_id Printful reale
  },
  {
    sku: "ART_PRINT",
    name: "Art Print 30x40cm",
    description: "Stampa fotografica di alta qualità.",
    price_cents: 25000,
    image: "https://via.placeholder.com/400x400?text=Art+Print", // <-- SOSTITUISCI con gli URL delle immagini reali
    variant_id: 987654321  // <-- SOSTITUISCI
  }
  // aggiungi altri prodotti qui
];
