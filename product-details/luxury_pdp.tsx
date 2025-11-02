import React, { useState } from 'react';
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Check, Truck, RotateCcw, Shield, ChevronDown } from 'lucide-react';

const LuxuryPDP = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const images = [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop&flip=h',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop&sat=-100',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop&brightness=110'
  ];

  const colors = [
    { name: 'black', hex: '#000000', label: 'Nero' },
    { name: 'navy', hex: '#1a2332', label: 'Blu Notte' },
    { name: 'charcoal', hex: '#36454F', label: 'Antracite' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Gallery Section */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden group">
              <img 
                src={images[selectedImage]} 
                alt="Prodotto" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button 
                onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden transition-all ${
                    selectedImage === idx 
                      ? 'ring-2 ring-white scale-105' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-8 lg:sticky lg:top-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-light tracking-tight">Cashmere Essentials</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-zinc-400">4.8 (127 recensioni)</span>
              </div>
              <p className="text-2xl font-light tracking-wide">€ 485,00</p>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Un capo senza tempo che ridefinisce l'eleganza contemporanea. Realizzato con fibre naturali selezionate e lavorazione artigianale, questo pezzo unisce comfort assoluto e stile raffinato.
              </p>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Disponibile - Consegna in 24-48h</span>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-widest uppercase text-zinc-400">Colore</h3>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative w-14 h-14 rounded-full transition-all ${
                      selectedColor === color.name ? 'ring-2 ring-white ring-offset-4 ring-offset-zinc-950 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === color.name && (
                      <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-widest uppercase text-zinc-400">Taglia</h3>
              <div className="grid grid-cols-6 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl transition-all ${
                      selectedSize === size
                        ? 'bg-white text-zinc-950 font-medium'
                        : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-widest uppercase text-zinc-400">Quantità</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  -
                </button>
                <span className="text-xl w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <button className="w-full py-5 bg-white text-zinc-950 rounded-2xl font-medium text-lg hover:bg-zinc-100 transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                Aggiungi al Carrello
              </button>
              <button className="w-full py-5 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl font-medium text-lg transition-all">
                Acquista Ora
              </button>
            </div>

            {/* Trust Badges */}
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

        {/* Detailed Section */}
        <div className="mt-24 space-y-8">
          {/* Tabs */}
          <div className="flex gap-8 border-b border-zinc-800">
            {['description', 'specs', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-lg transition-colors relative ${
                  activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'description' && 'Descrizione'}
                {tab === 'specs' && 'Specifiche'}
                {tab === 'reviews' && 'Recensioni'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-6 text-zinc-300 leading-relaxed">
                <p className="text-xl text-zinc-100">
                  Ogni dettaglio racconta una storia di eccellenza artigianale e attenzione maniacale alla qualità.
                </p>
                <p>
                  Questo capo rappresenta l'equilibrio perfetto tra tradizione e innovazione. Le fibre naturali vengono selezionate con cura per garantire una texture morbida al tatto e una durata eccezionale nel tempo. La lavorazione combina tecniche tramandate da generazioni con le più moderne tecnologie tessili.
                </p>
                <p>
                  Il design minimalista nasconde una complessità strutturale studiata nei minimi dettagli. Ogni cucitura, ogni rifinitura è pensata per esaltare la silhouette naturale e garantire libertà di movimento. Un capo che si adatta perfettamente al tuo stile di vita, dalla mattina alla sera.
                </p>
                <div className="pt-4">
                  <h4 className="text-lg font-medium mb-3 text-zinc-100">Cura del Capo</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Lavaggio delicato a 30°C</li>
                    <li>• Non utilizzare candeggina</li>
                    <li>• Asciugare in posizione orizzontale</li>
                    <li>• Stirare a bassa temperatura se necessario</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-3xl space-y-8">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between border-b border-zinc-800 pb-3">
                    <span className="text-zinc-400">Composizione</span>
                    <span>100% Cashmere</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-3">
                    <span className="text-zinc-400">Peso</span>
                    <span>280g</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-3">
                    <span className="text-zinc-400">Origine</span>
                    <span>Made in Italy</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-3">
                    <span className="text-zinc-400">Vestibilità</span>
                    <span>Regular Fit</span>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-lg font-medium mb-4 text-zinc-100">Guida alle Taglie</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-zinc-800">
                        <tr>
                          <th className="text-left pb-3 text-zinc-400 font-medium">Taglia</th>
                          <th className="text-center pb-3 text-zinc-400 font-medium">Petto (cm)</th>
                          <th className="text-center pb-3 text-zinc-400 font-medium">Vita (cm)</th>
                          <th className="text-center pb-3 text-zinc-400 font-medium">Lunghezza (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-zinc-800/50">
                          <td className="py-3">XS</td>
                          <td className="text-center py-3">88-92</td>
                          <td className="text-center py-3">70-74</td>
                          <td className="text-center py-3">68</td>
                        </tr>
                        <tr className="border-b border-zinc-800/50">
                          <td className="py-3">S</td>
                          <td className="text-center py-3">92-96</td>
                          <td className="text-center py-3">74-78</td>
                          <td className="text-center py-3">70</td>
                        </tr>
                        <tr className="border-b border-zinc-800/50">
                          <td className="py-3">M</td>
                          <td className="text-center py-3">96-100</td>
                          <td className="text-center py-3">78-82</td>
                          <td className="text-center py-3">72</td>
                        </tr>
                        <tr className="border-b border-zinc-800/50">
                          <td className="py-3">L</td>
                          <td className="text-center py-3">100-104</td>
                          <td className="text-center py-3">82-86</td>
                          <td className="text-center py-3">74</td>
                        </tr>
                        <tr className="border-b border-zinc-800/50">
                          <td className="py-3">XL</td>
                          <td className="text-center py-3">104-108</td>
                          <td className="text-center py-3">86-90</td>
                          <td className="text-center py-3">76</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-8">
                <div className="flex items-center gap-12 pb-8 border-b border-zinc-800">
                  <div className="text-center">
                    <div className="text-5xl font-light mb-2">4.8</div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-400">127 recensioni</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm text-zinc-400 w-12">{stars} stelle</span>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${stars === 5 ? 85 : stars === 4 ? 12 : 3}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-zinc-800 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <p className="text-sm text-zinc-400">{review.date}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FAQs */}
          <div className="mt-16 max-w-3xl">
            <h3 className="text-2xl font-light mb-8">Domande Frequenti</h3>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-zinc-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors"
                  >
                    <span className="font-medium">{faq.q}</span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-5 text-zinc-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
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