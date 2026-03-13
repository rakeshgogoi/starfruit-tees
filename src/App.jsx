import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Star, ChevronRight, ChevronLeft, Menu, X, ArrowRight } from 'lucide-react';
import { loadProductsForSite, DEFAULT_PRODUCTS } from './data/products';
import landingImage from './assets/landing.png';

const App = () => {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState({});
  const [selectedVariant, setSelectedVariant] = useState({});

  useEffect(() => {
    loadProductsForSite().then((loaded) => {
      if (loaded && loaded.length > 0) setProducts(loaded);
    });
  }, []);

  const categories = ['All', 'Heritage Series', 'Lyrical Anthems', 'Stadium Series'];
  const categoryLabels = { 'All': 'ALL', 'Heritage Series': 'HERITAGE SERIES', 'Lyrical Anthems': 'LYRICAL ANTHEMS', 'Stadium Series': 'STADIUM SERIES' };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const getProductImages = (product) => {
    if (product.variants) {
      const vIndex = selectedVariant[product.id] ?? 0;
      return product.variants[vIndex].images;
    }
    return product.images ?? (product.image ? [product.image] : []);
  };

  const setProductSliderIndex = (productId, delta, maxIndex) => {
    setSliderIndex(prev => {
      const current = prev[productId] ?? 0;
      return { ...prev, [productId]: (current + delta + maxIndex) % maxIndex };
    });
  };

  const handleWhatsAppOrder = (productName, variantName) => {
    const orderText = variantName ? `${productName} (${variantName})` : productName;
    const message = `Hi Starfruit Tees! I'd love to order the ${orderText}. What's the process?`;
    window.open(`https://wa.me/918720951721?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#E0A600' }}>
              <Star size={16} className="md:w-[18px] md:h-[18px]" fill="#fff" stroke="#fff" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl md:text-2xl font-display font-black leading-none tracking-tight text-black truncate">Starfruit Tees</span>
              <span className="text-[8px] md:text-[9px] font-medium text-[#555] uppercase tracking-[0.2em] mt-0.5">House of Starfruit</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10 font-medium text-xs uppercase tracking-widest text-[#333]">
            <a href="#shop" className="hover:text-black transition-colors">DROPS</a>
            <a href="#about" className="hover:text-black transition-colors">THE HOUSE</a>
            <Link to="/admin" className="hover:text-black transition-colors">ADMIN</Link>
            <button 
              onClick={() => window.open('https://wa.me/918720951721', '_blank')}
              className="bg-black text-white px-7 py-3 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 flex items-center gap-2"
            >
              Contact
            </button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 flex flex-col gap-4">
            <a href="#shop" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-xs">Drops</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-xs">The House</a>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-xs">Admin</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-28 sm:pt-32 md:pt-40 pb-16 md:pb-24 px-4 sm:px-6 overflow-hidden" style={{ background: 'radial-gradient(ellipse 80% 50% at 100% 100%, rgba(224,166,0,0.08), transparent), #ffffff' }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.9] mb-4 md:mb-6">
              Culture <br />
              <span className="italic" style={{ color: '#E0A600' }}>Reimagined.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#555] mb-6 md:mb-10 max-w-xl leading-relaxed font-normal">
              Premium apparel for the modern tribe. Bridging ancestral motifs with the electric energy of the contemporary world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
              <a href="#shop" className="w-full sm:w-auto bg-black text-white px-6 sm:px-10 py-4 sm:py-5 rounded-full font-semibold text-sm sm:text-base uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Explore The Drop <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              </a>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-white object-cover" alt="Tribe member" />
                  ))}
                </div>
                <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-[#555]">
                  <span className="text-black font-semibold block">Trusted by</span> 800+ of the Tribe
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="absolute -top-20 -right-20 w-48 sm:w-80 h-48 sm:h-80 bg-yellow-200/40 rounded-full blur-[100px]" />
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-2xl sm:rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              <img 
                src={landingImage} 
                alt="Starfruit Collection"
                className="relative rounded-2xl sm:rounded-[2rem] shadow-2xl z-10 w-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <section id="shop" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black mb-2 md:mb-4 uppercase text-black tracking-tight">Latest Releases</h2>
              <p className="text-sm md:text-base text-[#555]">Limited batches. Iconic silhouettes.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-black text-white' 
                      : 'bg-[#E0E0E0] text-[#333] hover:bg-[#d0d0d0]'
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {filteredProducts.map(product => {
              const images = getProductImages(product);
              const currentIndex = images.length ? ((sliderIndex[product.id] ?? 0) % images.length) : 0;
              const currentVariant = product.variants ? product.variants[selectedVariant[product.id] ?? 0] : null;

              return (
                <div key={product.id} className="relative">
                  <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F5F5F5] mb-2 sm:mb-4 shadow-sm">
                    {images.length > 0 && (
                      <>
                        <img
                          key={`${product.id}-${currentIndex}-${selectedVariant[product.id] ?? 0}`}
                          src={images[currentIndex]}
                          alt={`${product.name}${currentVariant ? ` - ${currentVariant.name}` : ''}`}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setProductSliderIndex(product.id, -1, images.length); }}
                              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-20"
                              aria-label="Previous image"
                            >
                              <ChevronLeft size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setProductSliderIndex(product.id, 1, images.length); }}
                              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-20"
                              aria-label="Next image"
                            >
                              <ChevronRight size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            </button>
                            <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center gap-1 z-20">
                              {images.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSliderIndex(prev => ({ ...prev, [product.id]: i })); }}
                                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                  aria-label={`Go to image ${i + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {product.variants && product.variants.length > 1 && (
                    <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                      {product.variants.map((v, i) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(prev => ({ ...prev, [product.id]: i }));
                            setSliderIndex(prev => ({ ...prev, [product.id]: 0 }));
                          }}
                          className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wide border-2 transition-colors ${
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
                  <div className="px-0.5 sm:px-2">
                    <h3 className="text-xs sm:text-sm md:text-base font-display font-black leading-tight mb-0.5 sm:mb-1 line-clamp-3">{product.name}</h3>
                    <p className="text-xs sm:text-sm font-bold text-slate-400 mb-1 sm:mb-2">{product.price}</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm leading-relaxed mb-2 sm:mb-3 line-clamp-2 md:line-clamp-none">{product.description}</p>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppOrder(product.name, currentVariant?.name)}
                      className="w-full bg-black text-white py-2 sm:py-3 md:py-3.5 rounded-full font-semibold text-[10px] sm:text-xs md:text-sm uppercase tracking-wide flex items-center justify-center gap-1 sm:gap-2 hover:opacity-90 transition-opacity mb-2 sm:mb-3"
                    >
                      <MessageCircle size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" /> Inquire Now
                    </button>
                    <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <MapPin size={8} className="sm:w-2.5 sm:h-2.5 md:w-[10px] md:h-[10px] text-yellow-500 flex-shrink-0" /> Bengaluru Hub
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section - House of Starfruit */}
      <section id="about" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-yellow-500/10 rounded-full blur-[120px] -mr-24 sm:-mr-48 -mt-24 sm:-mt-48" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1523381235212-d73f803801f7?auto=format&fit=crop&q=80&w=1000" 
              className="rounded-2xl sm:rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 w-full object-cover max-h-[280px] sm:max-h-none" 
              alt="The House" 
            />
            <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 bg-yellow-400 p-6 sm:p-12 rounded-2xl sm:rounded-[2.5rem] hidden md:block">
              <Star size={32} className="sm:w-10 sm:h-10" fill="#000" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-yellow-500 font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs block mb-4 sm:mb-6">The Parent Entity</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display italic font-black mb-6 sm:mb-10 leading-none">
              HOUSE OF <br /> <span className="text-yellow-500">STARFRUIT.</span>
            </h2>
            <div className="space-y-4 sm:space-y-6 md:space-y-8 text-slate-400 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
              <p>
                Based in the silicon valley of India but keeping the spirit of craftsmanship alive. We bridge the gap through high-quality apparel that speaks a global language.
              </p>
              <p>
                Starfruit Tees is a creative collective for those who value heritage but live in the now. Every print is curated to represent an identity that transcends geography.
              </p>
              <div className="pt-4 sm:pt-6 grid grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl font-display italic font-black text-white mb-1 sm:mb-2">240 GSM</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500">Premium Fabric</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display italic font-black text-white mb-1 sm:mb-2">Eco-Inks</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500">Zero-fade print</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 mb-12 sm:mb-20">
            <div className="lg:col-span-5">
               <div className="flex items-center gap-3 mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#E0A600' }}>
                    <Star size={18} className="sm:w-5 sm:h-5" fill="#fff" stroke="#fff" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-2xl sm:text-3xl font-display font-black leading-none tracking-tight text-black">Starfruit Tees</span>
                    <span className="text-[9px] sm:text-[10px] font-medium text-[#555] uppercase tracking-[0.2em] mt-1">House of Starfruit</span>
                  </div>
               </div>
               <p className="text-slate-500 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-sm">
                 Connecting people through stories, art, and the finest cotton. Made for the tribe.
               </p>
               <div className="flex gap-3 sm:gap-4">
                  <a href="#" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-black hover:text-white transition-all" aria-label="Instagram">
                    <Instagram size={20} className="sm:w-6 sm:h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-black hover:text-white transition-all" aria-label="Message">
                    <MessageCircle size={20} className="sm:w-6 sm:h-6" />
                  </a>
               </div>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
              <div>
                <h4 className="font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] text-slate-300 mb-4 sm:mb-8">Drops</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-600">
                  <li><a href="#shop" className="hover:text-yellow-600">Heritage</a></li>
                  <li><a href="#shop" className="hover:text-yellow-600">Lyrical</a></li>
                  <li><a href="#shop" className="hover:text-yellow-600">Stadium</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] text-slate-300 mb-4 sm:mb-8">The House</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-600">
                  <li><a href="#about" className="hover:text-yellow-600">About Us</a></li>
                  <li><a href="#contact" className="hover:text-yellow-600">Custom Orders</a></li>
                  <li><a href="#contact" className="hover:text-yellow-600">Bulk Inquiries</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] text-slate-300 mb-4 sm:mb-8">Identity</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-600 text-right md:text-left">
                  <li>Global ✈️ Local</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 sm:pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-300">© 2024 HOUSE OF STARFRUIT — ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 sm:gap-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">
              <span className="flex items-center gap-2"><MapPin size={10} className="sm:w-3 sm:h-3 text-yellow-400 flex-shrink-0" /> HQ: Bengaluru, IN</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;