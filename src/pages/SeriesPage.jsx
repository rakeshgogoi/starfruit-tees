import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { loadProductsForSite, DEFAULT_PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';

const SERIES_CONFIG = {
  legend: {
    category: 'Legend Series',
    title: 'Legend Series',
    tagline: 'Icons. Culture. Legacy.',
    description:
      'Celebrating the legends who shaped our cultural identity. Each design is a wearable tribute — crafted on premium 240 GSM cotton with zero-fade eco-inks.',
    accentColor: '#E0A600',
    heroBg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1200 100%)',
    badge: 'Heritage & Art',
  },
  stadium: {
    category: 'Stadium Series',
    title: 'Stadium Series',
    tagline: 'Wear Your Team. Own the Game.',
    description:
      'Official-style IPL 2026 jerseys for every die-hard fan. All 10 teams available with fully customizable name & number on the back. Quick delivery across India.',
    accentColor: '#ef4444',
    heroBg: 'linear-gradient(135deg, #0f172a 0%, #1e1040 100%)',
    badge: 'IPL 2026 Collection',
  },
};

const SeriesPage = () => {
  const { slug } = useParams();
  const config = SERIES_CONFIG[slug];

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [sliderIndex, setSliderIndex] = useState({});
  const [selectedVariant, setSelectedVariant] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadProductsForSite().then(loaded => {
      if (loaded && loaded.length > 0) setProducts(loaded);
    });
  }, []);

  if (!config) return <Navigate to="/" replace />;

  const seriesProducts = products.filter(p => p.category === config.category);

  const getProductImages = (product) => {
    if (product.variants) {
      const vIndex = selectedVariant[product.id] ?? 0;
      return product.variants[vIndex]?.images ?? [];
    }
    return product.images ?? (product.image ? [product.image] : []);
  };

  const setProductSliderIndex = (productId, delta, maxIndex) => {
    setSliderIndex(prev => {
      const current = prev[productId] ?? 0;
      return { ...prev, [productId]: (current + delta + maxIndex) % maxIndex };
    });
  };

  // Pick a few hero images from the first products
  const heroImages = seriesProducts
    .slice(0, 4)
    .map(p => (p.variants?.[0]?.images?.[0] ?? p.images?.[0] ?? null))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero */}
      <header
        className="relative pt-14 md:pt-16 overflow-hidden"
        style={{ background: config.heroBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 md:py-28 grid lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="z-10">
            <span
              className="inline-block text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: config.accentColor + '22', color: config.accentColor }}
            >
              {config.badge}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[0.9] mb-5 text-white">
              {config.title.split(' ')[0]} <br />
              <span className="italic" style={{ color: config.accentColor }}>
                {config.title.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl font-semibold text-white/60 mb-3 italic">
              "{config.tagline}"
            </p>
            <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-md mb-8">
              {config.description}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full transition-all"
                style={{ backgroundColor: config.accentColor }}
              >
                Shop Now <ArrowRight size={16} />
              </a>
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                {seriesProducts.length} Products
              </span>
            </div>
          </div>

          {/* Hero image mosaic */}
          {heroImages.length > 0 && (
            <div className="hidden lg:grid grid-cols-2 gap-3 relative">
              <div className="absolute -inset-8 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: config.accentColor }} />
              {heroImages.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className={`rounded-2xl overflow-hidden bg-white/10 ${i === 0 ? 'row-span-2' : ''}`}
                  style={{ aspectRatio: i === 0 ? '3/4' : '1/1' }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover opacity-90" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </header>

      {/* Stats bar */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6 sm:gap-10 items-center">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <Star size={12} className="text-yellow-500" fill="#E0A600" />
            Premium Quality
          </div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <MapPin size={12} className="text-yellow-500" />
            Bengaluru & PAN India Delivery
          </div>
          {slug === 'stadium' && (
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              ✍️ Custom Name & Number
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            🔥 40% OFF · First 100 Orders
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section id="products" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 md:mb-10">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase text-black tracking-tight mb-1">
                {config.category}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">{seriesProducts.length} products</p>
            </div>
            <Link
              to="/"
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors flex items-center gap-1"
            >
              ← All Collections
            </Link>
          </div>

          {seriesProducts.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <p className="text-lg font-semibold">No products yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {seriesProducts.map(product => {
                const images = getProductImages(product);
                const currentIndex = images.length ? ((sliderIndex[product.id] ?? 0) % images.length) : 0;
                const currentVariant = product.variants?.[selectedVariant[product.id] ?? 0] ?? null;

                return (
                  <div key={product.id} className="group relative">
                    {/* Image */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F5F5F5] mb-2 shadow-sm">
                      {images.length > 0 && (
                        <>
                          <img
                            src={images[currentIndex]}
                            alt={`${product.name}${currentVariant ? ` - ${currentVariant.name}` : ''}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {images.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setProductSliderIndex(product.id, -1, images.length); }}
                                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-20"
                              >
                                <ChevronLeft size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setProductSliderIndex(product.id, 1, images.length); }}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-20"
                              >
                                <ChevronRight size={14} />
                              </button>
                              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
                                {images.map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSliderIndex(prev => ({ ...prev, [product.id]: i })); }}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      )}
                      {product.tag && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full z-10">
                          {product.tag}
                        </span>
                      )}
                    </div>

                    {/* Variant selector */}
                    {product.variants && product.variants.length > 1 && (
                      <div className="flex gap-1 mb-1.5 flex-wrap">
                        {product.variants.map((v, i) => (
                          <button
                            key={v.name}
                            type="button"
                            onClick={() => {
                              setSelectedVariant(prev => ({ ...prev, [product.id]: i }));
                              setSliderIndex(prev => ({ ...prev, [product.id]: 0 }));
                            }}
                            className={`px-2 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wide border transition-colors ${
                              (selectedVariant[product.id] ?? 0) === i
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                            }`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Info */}
                    <div className="px-0.5">
                      <h3 className="text-[11px] sm:text-xs font-display font-black leading-tight mb-0.5 line-clamp-2">{product.name}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">{product.price}</p>
                      <p className="text-slate-500 text-[9px] sm:text-[10px] leading-relaxed mb-2 line-clamp-2">{product.description}</p>
                      <Link
                        to={`/product/${product.id}`}
                        className="w-full bg-black text-white py-1.5 sm:py-2 rounded-full font-semibold text-[9px] sm:text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 hover:bg-yellow-400 hover:text-black transition-all"
                      >
                        <ArrowRight size={11} /> View Product Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer strip */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: '#E0A600' }}>
              <Star size={13} fill="#fff" stroke="#fff" />
            </div>
            <span className="font-display font-black text-base tracking-tight">Starfruit Tees</span>
          </div>
          <div className="flex gap-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <Link to="/series/legend" className="hover:text-black transition-colors">Legend</Link>
            <Link to="/series/stadium" className="hover:text-black transition-colors">Stadium</Link>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
            © 2024 House of Starfruit
          </p>
        </div>
      </footer>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default SeriesPage;
