import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Star, MapPin,
  ShoppingBag, Zap, ArrowLeft, Check, Minus, Plus, X,
} from 'lucide-react';
import { loadProductsForSite, DEFAULT_PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, cart, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadProductsForSite().then(loaded => {
      if (loaded && loaded.length > 0) setProducts(loaded);
    });
  }, []);

  const product = products.find(p => String(p.id) === String(id));
  const images = product?.variants?.[selectedVariant]?.images || product?.images || [];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const variantName = product.variants?.[selectedVariant]?.name;
    const orderText = variantName && variantName !== 'Variant' && variantName !== 'Default'
      ? `${product.name} (${variantName})`
      : product.name;
    const message = `Hi Starfruit Tees! I'd like to buy the ${orderText} in size ${selectedSize}. What's the process?`;
    window.open(`https://wa.me/918720951721?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCheckoutCart = () => {
    if (cart.length === 0) return;
    const items = cart.map(item =>
      `• ${item.name}${item.variant && item.variant !== 'Variant' && item.variant !== 'Default' ? ` (${item.variant})` : ''} x${item.quantity}`
    ).join('\n');
    const message = `Hi Starfruit Tees! I'd like to order the following:\n\n${items}\n\nPlease let me know the process!`;
    window.open(`https://wa.me/918720951721?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!product && products.length > 1) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Product not found</p>
          <Link to="/" className="text-yellow-600 underline font-semibold">Back to shop</Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Nav */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#E0A600' }}>
              <Star size={14} fill="#fff" stroke="#fff" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-display font-black leading-none tracking-tight text-black">Starfruit Tees</span>
              <span className="text-[7px] font-medium text-[#555] uppercase tracking-[0.2em] mt-0.5">House of Starfruit</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#333] hover:text-black transition-colors">
              <ArrowLeft size={14} /> Back to Shop
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide hover:bg-yellow-400 hover:text-black transition-all"
            >
              <ShoppingBag size={14} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-black rounded-full text-[9px] font-black flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="pt-14 md:pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-6 uppercase tracking-widest">
            <Link to="/" className="hover:text-black transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-slate-500">{product.category}</span>
            <span>/</span>
            <span className="text-black truncate max-w-[160px]">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5F5F5] mb-3 shadow-sm">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[imageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() => setImageIndex(i => (i + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setImageIndex(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">No image</div>
                )}
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === imageIndex ? 'border-black shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 mb-2">{product.category}</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black leading-tight mb-3">{product.name}</h1>

              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-2xl font-black">{product.price}</span>
                {product.price === '₹799' && (
                  <span className="text-xs line-through text-slate-400">₹1,332</span>
                )}
              </div>
              {(product.price === '₹799' || product.tag === 'New') && (
                <p className="text-xs text-green-600 font-semibold mb-4 flex items-center gap-1">
                  🔥 Limited Launch: First 100 orders get 40% OFF — only ₹479!
                </p>
              )}

              <p className="text-sm text-slate-600 leading-relaxed mb-6">{product.description}</p>

              {/* Variant selector */}
              {product.variants && product.variants.length > 1 && (
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Style</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((v, i) => (
                      <button
                        key={v.name}
                        onClick={() => { setSelectedVariant(i); setImageIndex(0); }}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${selectedVariant === i ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-lg text-xs font-bold border transition-all ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization note for Stadium Series */}
              {product.category === 'Stadium Series' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="font-bold text-yellow-800 text-sm mb-1">✍️ Want your name & number on the back?</p>
                  <p className="text-yellow-700 text-xs leading-relaxed">Full back customization available. Mention your preferred name & number when you place the order via WhatsApp.</p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm uppercase tracking-wide border-2 transition-all duration-200 ${
                    added
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-black bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {added ? <><Check size={16} /> Added to Cart!</> : <><ShoppingBag size={16} /> Add to Cart</>}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm uppercase tracking-wide bg-black text-white hover:bg-yellow-400 hover:text-black transition-all duration-200"
                >
                  <Zap size={16} /> Buy Now
                </button>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                <MapPin size={10} className="text-yellow-500 flex-shrink-0" />
                Quick Delivery · Bengaluru & PAN India
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            {/* Cart header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <span className="font-black text-base uppercase tracking-wide">Your Cart</span>
                {cartCount > 0 && (
                  <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                  <ShoppingBag size={40} strokeWidth={1} />
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <button onClick={() => setCartOpen(false)} className="text-xs text-yellow-600 font-bold underline">Continue Shopping</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.key} className="flex gap-3 items-start">
                    {item.image && (
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight mb-0.5 line-clamp-2">{item.name}</p>
                      {item.variant && item.variant !== 'Variant' && item.variant !== 'Default' && (
                        <p className="text-[10px] text-slate-400">{item.variant}</p>
                      )}
                      <p className="text-xs font-black text-slate-600 mt-1">{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:border-black transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:border-black transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.key)} className="text-slate-300 hover:text-black transition-colors mt-0.5">
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                <button
                  onClick={handleCheckoutCart}
                  className="w-full bg-black text-white py-4 rounded-full font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-black transition-all"
                >
                  <Zap size={16} /> Order via WhatsApp
                </button>
                <button
                  onClick={clearCart}
                  className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-black uppercase tracking-widest transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
