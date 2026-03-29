import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Star, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { loadProductsForSite, DEFAULT_PRODUCTS } from './data/products';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import landingImage from './assets/landing-updated.jpg';

const TESTIMONIALS = [
  { quote: "I was honestly surprised by the quality. The fabric feels premium and the print hasn't faded even after multiple washes. You can tell this isn't mass-produced stuff.", name: "Ankit Sharma", city: "Bangalore" },
  { quote: "What I love most about Starfruit Tees is how unique the designs are. They feel personal and different from anything you find on typical online stores.", name: "Riya Das", city: "Guwahati" },
  { quote: "The fit, the comfort, and the overall vibe of the t-shirt—everything just feels right. It's now one of my go-to outfits for everyday wear.", name: "Karthik Reddy", city: "Hyderabad" },
  { quote: "You can really see the thought behind each design. It's not just a t-shirt, it feels like something meaningful.", name: "Sneha Bora", city: "Assam" },
  { quote: "Ordered one just to try, ended up ordering three more. The quality and design consistency are impressive.", name: "Rahul Mehta", city: "Mumbai" },
  { quote: "As someone from Assam living outside, these designs feel close to home. Subtle, classy, and rooted.", name: "Priyanka Saikia", city: "Delhi" },
];

const App = () => {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [sliderIndex, setSliderIndex] = useState({});
  const [selectedVariant, setSelectedVariant] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    loadProductsForSite().then((loaded) => {
      if (loaded && loaded.length > 0) setProducts(loaded);
    });
  }, []);

  const categorySectionList = [
    { label: 'LEGEND SERIES', slug: 'legend', category: 'Legend Series' },
    { label: 'STADIUM SERIES', slug: 'stadium', category: 'Stadium Series' },
  ];

  const getCategoryImage = (categoryName) => {
    const product = products.find(p => p.category === categoryName);
    if (!product) return null;
    const imgs = product.variants?.[0]?.images ?? product.images ?? (product.image ? [product.image] : []);
    return imgs[0] ?? null;
  };

  // Homepage shows only IPL jerseys (Stadium Series)
  const stadiumProducts = products.filter(p => p.category === 'Stadium Series');

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

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">

      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <header className="relative pt-32 sm:pt-36 md:pt-44 pb-16 md:pb-24 px-4 sm:px-6 overflow-hidden" style={{ background: 'radial-gradient(ellipse 80% 50% at 100% 100%, rgba(224,166,0,0.08), transparent), #ffffff' }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <h1 className="font-hero text-5xl sm:text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-4 md:mb-6">
              Wear Your <br />
              <span className="italic" style={{ color: '#E0A600' }}>Team.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#555] mb-6 md:mb-10 max-w-xl leading-relaxed font-normal">
              Official-style IPL 2026 jerseys for every die-hard fan. Premium 220 GSM quality, fully customisable. Delivered across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
              <a href="#shop" className="w-full sm:w-auto bg-black text-white px-6 sm:px-10 py-4 sm:py-5 rounded-full font-semibold text-sm sm:text-base uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Shop IPL Jerseys <ArrowRight size={16} strokeWidth={2.5} />
              </a>
              <div className="flex items-center justify-center sm:justify-start">
                <div className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#555]">
                  <span className="text-black font-semibold block">500+ jerseys</span> delivered across India
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
                alt="Starfruit Tees — RCB Jersey"
                className="relative rounded-2xl sm:rounded-[2rem] shadow-2xl z-10 w-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Trust Badges */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: '🔒', label: 'Secure Payment', sub: 'Razorpay Encrypted' },
            { icon: '👕', label: '220 GSM Fabric', sub: 'Premium Cotton' },
            { icon: '🚚', label: 'Pan-India Delivery', sub: '5–7 Business Days' },
            { icon: '✍️', label: 'Free Customisation', sub: 'Name & Number on Back' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex items-center gap-2.5 sm:gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-black leading-tight">{label}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg sm:text-xl font-display font-black uppercase tracking-tight text-black mb-6 sm:mb-8">Collections</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
            {categorySectionList.map(({ label, slug, category }) => {
              const img = getCategoryImage(category);
              return (
                <Link
                  key={slug}
                  to={`/series/${slug}`}
                  className="group relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-[10px] font-medium uppercase tracking-widest">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-widest drop-shadow-md">{label}</span>
                    <ArrowRight size={12} className="text-white opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* IPL Jersey Product Grid */}
      <section id="shop" className="py-10 sm:py-14 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3 md:gap-6">
            <div>
              <h2 className="font-hero text-3xl sm:text-4xl md:text-5xl mb-1 md:mb-2 text-black">IPL 2026 Jerseys</h2>
              <p className="text-xs md:text-sm text-[#555]">All 10 teams. Fully customisable. Limited stock.</p>
            </div>
            <Link to="/series/stadium" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors flex items-center gap-1 self-start md:self-auto">
              View All <ArrowRight size={11} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {stadiumProducts.map(product => {
              const images = getProductImages(product);
              const currentIndex = images.length ? ((sliderIndex[product.id] ?? 0) % images.length) : 0;
              const currentVariant = product.variants ? product.variants[selectedVariant[product.id] ?? 0] : null;

              return (
                <div key={product.id} className="relative group">
                  <div className="relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-[#F5F5F5] mb-1.5 sm:mb-2 shadow-sm">
                    {images.length > 0 && (
                      <>
                        <img
                          key={`${product.id}-${currentIndex}-${selectedVariant[product.id] ?? 0}`}
                          src={images[currentIndex]}
                          alt={`${product.name}${currentVariant ? ` - ${currentVariant.name}` : ''}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setProductSliderIndex(product.id, -1, images.length); }}
                              className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-20"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setProductSliderIndex(product.id, 1, images.length); }}
                              className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-20"
                            >
                              <ChevronRight size={14} />
                            </button>
                            <div className="absolute bottom-1.5 sm:bottom-2 left-0 right-0 flex justify-center gap-0.5 z-20">
                              {images.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSliderIndex(prev => ({ ...prev, [product.id]: i })); }}
                                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                    {product.tag && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full z-10">
                        {product.tag}
                      </span>
                    )}
                  </div>
                  {product.variants && product.variants.length > 1 && (
                    <div className="flex gap-1 mb-1.5 sm:mb-2 flex-wrap">
                      {product.variants.map((v, i) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(prev => ({ ...prev, [product.id]: i }));
                            setSliderIndex(prev => ({ ...prev, [product.id]: 0 }));
                          }}
                          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wide border transition-colors ${
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
                  <div className="px-0.5 sm:px-1">
                    <h3 className="text-sm sm:text-base font-display font-black leading-tight mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-sm font-black text-black">₹479</span>
                      <span className="text-xs text-slate-400 line-through">{product.price}</span>
                      <span className="text-[10px] font-black uppercase bg-yellow-400 text-black px-1.5 py-0.5 rounded-full leading-none">40% OFF</span>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2">{product.description}</p>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-full bg-black text-white py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-1.5 hover:bg-yellow-400 hover:text-black transition-all mb-2"
                    >
                      <ArrowRight size={13} /> View Product Details
                    </Link>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <MapPin size={8} className="text-yellow-500 flex-shrink-0" /> Bengaluru Hub
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600 block mb-2">What Fans Are Saying</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase tracking-tight">Real Reviews</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map(({ quote, name, city }) => (
              <div key={name} className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#E0A600" stroke="#E0A600" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">"{quote}"</p>
                <div>
                  <p className="text-xs font-black text-black">{name}</p>
                  <p className="text-xs text-slate-400 font-medium">{city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] bg-yellow-500/10 rounded-full blur-[100px] -mr-20 sm:-mr-32 -mt-20 sm:-mt-32" />
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1523381235212-d73f803801f7?auto=format&fit=crop&q=80&w=1000"
              className="rounded-xl sm:rounded-2xl shadow-xl grayscale hover:grayscale-0 transition-all duration-700 w-full object-cover max-h-[220px] sm:max-h-[280px]"
              alt="Starfruit Tees"
            />
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-yellow-400 p-4 sm:p-8 rounded-xl sm:rounded-2xl hidden md:block">
              <Star size={24} fill="#000" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-yellow-500 font-black uppercase tracking-[0.25em] text-xs block mb-3 sm:mb-4">Our Story</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display italic font-black mb-4 sm:mb-6 leading-none">
              HOUSE OF <br /> <span className="text-yellow-500">STARFRUIT.</span>
            </h2>
            <div className="space-y-3 sm:space-y-4 text-slate-400 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
              <p>Starfruit Tees is more than just an apparel brand — it's a creative expression born from passion, culture, and craftsmanship. A dream project of an Assamese couple based in Bangalore.</p>
              <p>Living away from their roots, the founders wanted to bring a piece of their culture and stories into everyday fashion — blending Assamese essence with modern minimal aesthetics and everyday comfort.</p>
              <p className="text-slate-300 font-semibold italic">"Starfruit Tees — Where every thread tells a story."</p>
              <div className="pt-3 sm:pt-4 grid grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <div className="text-lg sm:text-2xl font-display italic font-black text-white mb-0.5">220 GSM</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500">Premium Cotton</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-display italic font-black text-white mb-0.5">Eco-Inks</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500">Zero-fade print</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-display italic font-black text-white mb-0.5">PAN India</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500">Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Community</span>
          <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight mb-2">Follow the Drop</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">See real orders, fan photos & new arrivals. Follow us on Instagram and be part of the tribe.</p>
          <a
            href="https://www.instagram.com/starfruit_tees/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-yellow-400 hover:text-black transition-all"
          >
            <Instagram size={16} /> @starfruit_tees
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2.5 mb-3 sm:mb-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#E0A600' }}>
                  <Star size={16} fill="#fff" stroke="#fff" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xl sm:text-2xl font-display font-black leading-none tracking-tight text-black">Starfruit Tees</span>
                  <span className="text-[10px] sm:text-xs font-medium text-[#555] uppercase tracking-[0.2em] mt-0.5">House of Starfruit</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-sm">
                Where every thread tells a story. Premium apparel crafted in Bangalore, delivered across India.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <a href="https://www.instagram.com/starfruit_tees/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center hover:bg-black hover:text-white transition-all" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="https://wa.me/918720951721" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center hover:bg-black hover:text-white transition-all" aria-label="WhatsApp">
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <h4 className="font-black uppercase text-[10px] sm:text-xs tracking-[0.25em] text-slate-300 mb-3 sm:mb-6">Collections</h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-bold text-slate-600">
                  <li><Link to="/series/legend" className="hover:text-yellow-600">Legend Series</Link></li>
                  <li><Link to="/series/stadium" className="hover:text-yellow-600">Stadium Series</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase text-[10px] sm:text-xs tracking-[0.25em] text-slate-300 mb-3 sm:mb-6">The House</h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-bold text-slate-600">
                  <li><a href="#about" className="hover:text-yellow-600">About Us</a></li>
                  <li><a href="https://wa.me/918720951721" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600">Custom Orders</a></li>
                  <li><a href="https://wa.me/918720951721" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600">Bulk Inquiries</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase text-[10px] sm:text-xs tracking-[0.25em] text-slate-300 mb-3 sm:mb-6">Policies</h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-bold text-slate-600">
                  <li><Link to="/policies" className="hover:text-yellow-600">Shipping & Delivery</Link></li>
                  <li><Link to="/policies" className="hover:text-yellow-600">Exchange Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-center md:text-left">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-300">© 2026 HOUSE OF STARFRUIT — ALL RIGHTS RESERVED.</p>
            <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-300">
              <span className="flex items-center gap-2"><MapPin size={10} className="text-yellow-400 flex-shrink-0" /> HQ: Bengaluru, IN</span>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default App;
