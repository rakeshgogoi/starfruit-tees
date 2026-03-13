import React, { useState } from 'react';
import { ShoppingCart, Instagram, MessageCircle, MapPin, Star, ChevronRight, Menu, X, ArrowRight } from 'lucide-react';

const App = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ['All', 'Heritage Series', 'Lyrical Anthems', 'Stadium Series'];

  const products = [
    {
      id: 1,
      name: "The Phulam Pocket",
      category: "Heritage Series",
      price: "₹799",
      description: "Intricate floral hand-embroidery on heavy-weight 240 GSM organic cotton.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
      tag: "Crafted"
    },
    {
      id: 2,
      name: "Mon Jai Oversized",
      category: "Lyrical Anthems",
      price: "₹699",
      description: "Minimalist typography on a soft-washed desert sand base. A tribute to timeless rhythm.",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
      tag: "Iconic"
    },
    {
      id: 3,
      name: "Xipun Geometric",
      category: "Heritage Series",
      price: "₹849",
      description: "Geometric vector art inspired by traditional silhouettes. A nod to the origin.",
      image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 4,
      name: "The Yellow Thala",
      category: "Stadium Series",
      price: "₹749",
      description: "Subtle Canary Yellow tee with a crown-and-seven minimalist icon.",
      image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
      tag: "Fan Gear"
    },
    {
      id: 5,
      name: "Anamika 90s Edition",
      category: "Lyrical Anthems",
      price: "₹899",
      description: "High-density puff print honoring the ultimate classic. Vintage fit.",
      image: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 6,
      name: "Chinnaswamy Roar",
      category: "Stadium Series",
      price: "₹749",
      description: "Deep red and black accents for the true Bangalore loyalist.",
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800",
    }
  ];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleWhatsAppOrder = (productName) => {
    const message = `Hi Starfruit Tees! I'd love to order the ${productName}. What's the process?`;
    window.open(`https://wa.me/910000000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#1A1A1A]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200">
              <Star size={18} fill="#000" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display italic font-black leading-none tracking-tight">Starfruit Tees</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">House of Starfruit</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10 font-bold text-xs uppercase tracking-widest text-slate-500">
            <a href="#shop" className="hover:text-yellow-600 transition-colors">Drops</a>
            <a href="#about" className="hover:text-yellow-600 transition-colors">The House</a>
            <button 
              onClick={() => window.open('https://wa.me/910000000000', '_blank')}
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
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[2px] w-8 bg-yellow-400"></div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Crafted in Bangalore — Inspired by Heritage
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display italic font-black leading-[0.9] mb-8">
              Culture <br />
              <span className="text-yellow-500">Reimagined.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-xl leading-relaxed">
              Premium apparel for the modern tribe. Bridging ancestral motifs with the electric energy of the contemporary world.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <a href="#shop" className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-yellow-200 transition-all flex items-center justify-center gap-3">
                Explore The Drop <ArrowRight size={20} />
              </a>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-12 h-12 rounded-full border-4 border-white" alt="User" />
                  ))}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="text-black block">Trusted by</span> 800+ of the Tribe
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-200/40 rounded-full blur-[100px]" />
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <img 
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000" 
                alt="Starfruit Collection"
                className="relative rounded-[2rem] shadow-2xl z-10 w-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <section id="shop" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-display italic font-black mb-4 uppercase">Latest Releases</h2>
              <p className="text-slate-500 font-medium">Limited batches. Iconic silhouettes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-black text-white' 
                      : 'bg-slate-100 text-slate-400 hover:bg-yellow-400 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map(product => (
              <div key={product.id} className="group relative">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 mb-6">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {product.tag && (
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black">{product.tag}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-8">
                    <button 
                      onClick={() => handleWhatsAppOrder(product.name)}
                      className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all"
                    >
                      <MessageCircle size={18} /> Inquire Now
                    </button>
                  </div>
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-display italic font-black">{product.name}</h3>
                    <span className="text-lg font-bold text-slate-400">{product.price}</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{product.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <MapPin size={10} className="text-yellow-500" /> Bengaluru Hub
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - House of Starfruit */}
      <section id="about" className="py-32 px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1523381235212-d73f803801f7?auto=format&fit=crop&q=80&w=1000" 
              className="rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000" 
              alt="The House" 
            />
            <div className="absolute -bottom-10 -right-10 bg-yellow-400 p-12 rounded-[2.5rem] hidden md:block">
              <Star size={40} fill="#000" />
            </div>
          </div>
          <div>
            <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs block mb-6">The Parent Entity</span>
            <h2 className="text-5xl md:text-7xl font-display italic font-black mb-10 leading-none">
              HOUSE OF <br /> <span className="text-yellow-500">STARFRUIT.</span>
            </h2>
            <div className="space-y-8 text-slate-400 text-lg font-medium leading-relaxed">
              <p>
                Based in the silicon valley of India but keeping the spirit of craftsmanship alive. We bridge the gap through high-quality apparel that speaks a global language.
              </p>
              <p>
                Starfruit Tees is a creative collective for those who value heritage but live in the now. Every print is curated to represent an identity that transcends geography.
              </p>
              <div className="pt-6 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-display italic font-black text-white mb-2">240 GSM</div>
                  <div className="text-xs uppercase tracking-widest font-black text-slate-500">Premium Fabric</div>
                </div>
                <div>
                  <div className="text-3xl font-display italic font-black text-white mb-2">Eco-Inks</div>
                  <div className="text-xs uppercase tracking-widest font-black text-slate-500">Zero-fade print</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-24 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-5">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Star size={20} fill="#000" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-display italic font-black leading-none tracking-tight">Starfruit Tees</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">House of Starfruit</span>
                  </div>
               </div>
               <p className="text-slate-500 text-lg mb-8 leading-relaxed max-w-sm">
                 Connecting people through stories, art, and the finest cotton. Made for the tribe.
               </p>
               <div className="flex gap-4">
                  <a href="#" className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <Instagram size={24} />
                  </a>
                  <a href="#" className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <MessageCircle size={24} />
                  </a>
               </div>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-300 mb-8">Drops</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-600">
                  <li><a href="#shop" className="hover:text-yellow-600">Heritage</a></li>
                  <li><a href="#shop" className="hover:text-yellow-600">Lyrical</a></li>
                  <li><a href="#shop" className="hover:text-yellow-600">Stadium</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-300 mb-8">The House</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-600">
                  <li><a href="#about" className="hover:text-yellow-600">About Us</a></li>
                  <li><a href="#contact" className="hover:text-yellow-600">Custom Orders</a></li>
                  <li><a href="#contact" className="hover:text-yellow-600">Bulk Inquiries</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-300 mb-8">Identity</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-600 text-right md:text-left">
                  <li>Global ✈️ Local</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">© 2024 HOUSE OF STARFRUIT — ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-300">
              <span className="flex items-center gap-2"><MapPin size={12} className="text-yellow-400" /> HQ: Bengaluru, IN</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;