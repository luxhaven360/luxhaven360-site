// tools/generate-product-data.js
// Node script per generare file product-details/data/<SKU>.json a partire da products/shop.json

const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '..', 'products', 'shop.json');
const outDir = path.join(__dirname, '..', 'product-details', 'data');

if (!fs.existsSync(shopPath)) {
  console.error('Errore: non ho trovato', shopPath);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const shop = JSON.parse(fs.readFileSync(shopPath, 'utf8'));

shop.forEach(item => {
  const skuRaw = item.sku || item.title || ('sku-' + Math.random().toString(36).slice(2,8));
  // sanitizza lo SKU per nome file
  const sku = String(skuRaw).replace(/[^a-zA-Z0-9\-_.]/g, '-');
  const outPath = path.join(outDir, sku + '.json');

  const detail = {
    sku: sku,
    title: item.title || '',
    desc: item.desc || item.description || '',
    price: item.price != null ? item.price : null,
    currency: item.currency || 'EUR',
    stripe_link: item.stripe_link || '',
    // campi vuoti/opzionali da arricchire manualmente
    images: item.images || [],
    colors: item.colors || [],
    sizes: item.sizes || [],
    default_qty: item.default_qty || 1,
    specs: item.specs || {},
    reviews: item.reviews || [],
    rating: item.rating || null
  };

  fs.writeFileSync(outPath, JSON.stringify(detail, null, 2), 'utf8');
  console.log('Wrote', outPath);
});

console.log('Done. Generated', shop.length, 'files (or updated existing).');
