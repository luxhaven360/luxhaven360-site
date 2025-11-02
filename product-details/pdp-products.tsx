import React, { useEffect, useState } from 'react';
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Check, Truck, RotateCcw, Shield, ChevronDown } from 'lucide-react';

// Tipi semplici (adatta al tuo progetto)
type ShopItem = {
  sku: string;
  title: string;
  desc?: string;
  price?: number;
  currency?: string;
  icon?: string;
  images?: string[]; // opzionale: array di immagini
  stripe_link?: string; // product-level fallback
  cta?: string;
  printful_product_id?: string;
  printful_variant_ids?: string[]; // nuovo campo array
  category?: string;
  // optional map: variantId -> stripe link OR size -> stripe link
  variant_stripe_links?: { [variantId: string]: string };
  variant_price_links?: { [sizeOrVariantKey: string]: string };
  // optional: explicit sizes/colors arrays to show in PDP
  sizes?: string[];
  colors?: { name: string; hex?: string; label?: string }[];
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop&flip=h',
];

const parseQuery = (search: string) => {
  const params = new URLSearchParams(search);
  const obj: { [k: string]: string } = {};
  params.forEach((v, k) => obj[k] = v);
  return obj;
};

const LuxuryPDP: React.FC = () => {
  const q = typeof window !== 'undefined' ? parseQuery(window.location.search) : {};
  const skuParam = q['sku'] || '';

  const [item, setItem] = useState<ShopItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description'|'specs'|'reviews'>('description');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // recensioni / faq di default (puoi lasciare quelle esistenti)
  const reviews = [
    { name: 'Marco R.', rating: 5, date: '15 Ottobre 2024', text: 'Qualità eccezionale. La vestibilità è perfetta e i materiali sono di altissimo livello.' },
    { name: 'Giulia T.', rating: 5, date: '8 Ottobre 2024', text: 'Un capo che trasforma completamente il look. Dettagli curati in ogni aspetto.' },
    { name: 'Alessandro M.', rating: 4, date: '2 Ottobre 2024', text: 'Molto soddisfatto dell\'acquisto. Consiglio di ordinare la taglia abituale.' }
  ];

  const faqs = [
    { q: 'Quali sono i tempi di consegna?', a: 'Consegna express in 24-48h per ordini effettuati entro le 14:00. Spedizione gratuita per ordini superiori a €150.' },
    { q: 'Posso restituire il prodotto?', a: 'Resi gratuiti entro 30 giorni dall\'acquisto. Il prodotto deve essere nelle condizioni originali con etichette intatte.' },
    { q: 'Come devo lavare questo capo?', a: 'Lavaggio a mano o in lavatrice a 30°C con programma delicato. Asciugare in posizione orizzontale lontano da fonti di calore.' }
  ];

  // Carica shop.json e seleziona l'item corrispondente allo SKU
  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        // fetch relativo alla root del sito - adattalo se il path è diverso
        const resp = await fetch('/products/shop.json', { cache: 'no-cache' });
        if (!resp.ok) {
          // fallback: prova altrove o segnala errore
          console.error('Impossibile caricare /products/shop.json', resp.status);
          setItem(null);
          setLoading(false);
          return;
        }
        const data: ShopItem[] = await resp.json();
        // cerca per sku esatto (case-sensitive preferibile) o per title
        const found = data.find(d => d.sku === skuParam) || data.find(d => (d.title || '').toLowerCase() === (skuParam || '').toLowerCase());
        if (found) {
          setItem(found);
          // imposta valori iniziali da prodotto
          if (found.images && found.images.length > 0) setSelectedImage(0);
          if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
          else setSelectedSize(null);
          if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0].name);
        } else {
          console.warn('Prodotto non trovato per SKU:', skuParam);
          setItem(null);
        }
      } catch (e) {
        console.error('Errore fetch shop.json', e);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [skuParam]);

  // Impostazioni UI fallback quando item è null
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento prodotto...</div>;
  }
  if (!item) {
    return <div className="min-h-screen flex items-center justify-center">Prodotto non trovato.</div>;
  }

  // immagini: preferisci item.images, altrimenti icona + default images
  const images = (item.images && item.images.length > 0)
    ? item.images
    : [ item.icon || DEFAULT_IMAGES[0], ...DEFAULT_IMAGES ];

  // gestione "Acquista Ora" -> trova stripe link coerente con la variante selezionata:
  const handleBuyNow = () => {
    // Strategy 1: se esiste variant_stripe_links e abbiamo una variante selezionata (es. printful variant id), usa quella
    if (item.variant_stripe_links && selectedSize) {
      // If variant_stripe_links keys are size labels, or variant IDs, we try multiple lookups
      // Try size key:
      const bySize = item.variant_stripe_links[selectedSize];
      if (bySize) return window.location.href = bySize;
      // Try color key
      if (selectedColor && item.variant_stripe_links[selectedColor]) return window.location.href = item.variant_stripe_links[selectedColor];
    }

    // Strategy 2: if variant_price_links keyed by size or variant id
    if (item.variant_price_links) {
      if (selectedSize && item.variant_price_links[selectedSize]) return window.location.href = item.variant_price_links[selectedSize];
      if (selectedColor && item.variant_price_links[selectedColor]) return window.location.href = item.variant_price_links[selectedColor];
    }

    // Strategy 3: if printful_variant_ids is present and variant_stripe_links maps variantId -> link
    if (item.printful_variant_ids && item.variant_stripe_links) {
      // try to map selectedSize to a variant index if sizes exist
      if (item.sizes && selectedSize) {
        const idx = item.sizes.indexOf(selectedSize);
        if (idx !== -1 && item.printful_variant_ids[idx]) {
          const variantId = item.printful_variant_ids[idx];
          const link = item.variant_stripe_links[variantId];
          if (link) return window.location.href = link;
        }
      }
      // fallback: first available variant id
      const firstVariant = item.printful_variant_ids[0];
      if (firstVariant && item.variant_stripe_links[firstVariant]) return window.location.href = item.variant_stripe_links[firstVariant];
    }

    // Strategy 4: product-level stripe_link fallback
    if (item.stripe_link) {
      return window.location.href = item.stripe_link;
    }

    // If reached here, non abbiamo link: mostra messaggio
    alert('Link di pagamento non configurato per questa variante. Contatta l\'assistenza.');
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden group">
              <img src={images[selectedImage]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <button onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full opacity-0 group-hover:opacity-100">
                <ChevronLeft className="w-6 h-6"/>
              </button>
              <button onClick={() => setSelectedImage((selectedImage + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full opacity-0 group-hover:opacity-100">
                <ChevronRight className="w-6 h-6"/>
              </button>
              <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5"/>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-xl overflow-hidden transition-all ${selectedImage === idx ? 'ring-2 ring-white scale-105' : 'opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt={`Vista ${idx+1}`} className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8 lg:sticky lg:top-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-light tracking-tight">{item.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-zinc-400">4.8 (127 recensioni)</span>
              </div>
              <p className="text-2xl font-light tracking-wide">{item.price ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: item.currency || 'EUR' }).format(item.price) : 'Contattaci'}</p>
              <p className="text-zinc-400 text-lg leading-relaxed">{item.desc}</p>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Disponibile - Consegna in 24-48h</span>
              </div>
            </div>

            {/* Colors */}
            {item.colors && item.colors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium tracking-widest uppercase text-zinc-400">Colore</h3>
                <div className="flex gap-3">
                  {item.colors.map(c => (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)} style={{ backgroundColor: c.hex }} className={`relative w-14 h-14 rounded-full ${selectedColor === c.name ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}>
                      {selectedColor === c.name && <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium tracking-widest uppercase text-zinc-400">Taglia</h3>
                <div className="grid grid-cols-6 gap-3">
                  {item.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 rounded-xl ${selectedSize === size ? 'bg-white text-zinc-950 font-medium' : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-widest uppercase text-zinc-400">Quantità</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 bg-zinc-800/50 rounded-xl">-</button>
                <span className="text-xl w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 bg-zinc-800/50 rounded-xl">+</button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <button onClick={() => {
                // Aggiungi al carrello: puoi implementare storage o API add-to-cart
                alert('Aggiunto al carrello (demo).');
              }} className="w-full py-5 bg-white text-zinc-950 rounded-2xl font-medium text-lg flex items-center justify-center gap-3">
                <ShoppingBag className="w-5 h-5" /> Aggiungi al Carrello
              </button>

              <button onClick={handleBuyNow} className="w-full py-5 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl font-medium text-lg transition-all">
                {item.cta || 'Acquista Ora'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-zinc-400" />
                <p className="text-xs text-zinc-400">Spedizione Gratuita sopra €150</p>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-zinc-400" />
                <p className="text-xs text-zinc-400">Reso Gratuito entro 30 giorni</p>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-zinc-400" />
                <p className="text-xs text-zinc-400">Pagamenti Sicuri al 100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab content (descrizione/specs/reviews) */}
        <div className="mt-24 space-y-8">
          <div className="flex gap-8 border-b border-zinc-800">
            {['description','specs','reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-lg ${activeTab === tab ? 'text-white' : 'text-zinc-500'}`}>
                {tab==='description' ? 'Descrizione' : tab==='specs' ? 'Specifiche' : 'Recensioni'}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && <div className="max-w-3xl text-zinc-300 leading-relaxed">{item.desc}</div>}
            {activeTab === 'specs' && (
              <div className="max-w-3xl">
                <div>Specifiche tecniche (puoi popolare dinamicamente dal prod)</div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-6">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="border-b border-zinc-800 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{rev.name}</p>
                        <p className="text-sm text-zinc-400">{rev.date}</p>
                      </div>
                      <div className="flex gap-1">{[...Array(rev.rating)].map((_,i)=> <Star key={i} className="w-4 h-4 fill-amber-400" />)}</div>
                    </div>
                    <p className="text-zinc-300">{rev.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-3xl">
            <h3 className="text-2xl font-light mb-8">Domande Frequenti</h3>
            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <div key={idx} className="border border-zinc-800 rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between">
                    <span className="font-medium">{f.q}</span>
                    <ChevronDown className={`w-5 h-5 ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === idx && <div className="px-6 pb-5 text-zinc-400">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LuxuryPDP;
