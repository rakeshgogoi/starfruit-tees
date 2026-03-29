import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, ShoppingBag, CreditCard, MessageCircle, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { loadProductsForSite, DEFAULT_PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import OrderForm from '../components/OrderForm';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const DISCOUNT_RATE = { 'Stadium Series': 0.40, 'Legend Series': 0.10 };
const DISCOUNT_LABEL = { 'Stadium Series': '40% OFF', 'Legend Series': '10% OFF' };
const parseBasePrice = (priceStr) => parseInt(String(priceStr).replace(/[^\d]/g, ''), 10) || 0;
const getOfferPrice = (category, originalPrice) =>
  Math.round(parseBasePrice(originalPrice) * (1 - (DISCOUNT_RATE[category] ?? 0)));
const getDiscountLabel = (category) => DISCOUNT_LABEL[category] ?? '';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { pay, scriptLoaded } = useRazorpay();

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [payStatus, setPayStatus]     = useState(null); // null | 'loading' | 'success' | 'error'
  const [payMessage, setPayMessage]   = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

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
    if (!product || !scriptLoaded) return;
    setShowOrderForm(true);
  };

  const handleOrderFormSubmit = async (customer) => {
    if (!product) return;
    const priceNum = getOfferPrice(product.category, product.price);
    const variantName = product.variants?.[selectedVariant]?.name;
    const label = variantName && variantName !== 'Variant' && variantName !== 'Default'
      ? `${product.name} (${variantName}) — Size ${selectedSize}`
      : `${product.name} — Size ${selectedSize}`;

    setFormLoading(true);

    await pay({
      amount: priceNum,
      productName: label,
      receipt: `prod_${product.id}_${Date.now()}`,
      customer,
      onSuccess: async (response) => {
        setShowOrderForm(false);
        setFormLoading(false);

        // Send notifications
        try {
          await fetch('/api/notify-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer,
              order: {
                product: label,
                amount: priceNum,
                paymentId: response.razorpay_payment_id,
              },
            }),
          });
        } catch (e) {
          console.error('Notify failed:', e);
        }

        navigate('/thank-you', {
          state: {
            paymentId: response.razorpay_payment_id,
            customerName: customer.name,
            product: label,
            amount: priceNum,
          },
        });
      },
      onError: (msg) => {
        setFormLoading(false);
        if (msg !== 'Payment cancelled.') {
          setShowOrderForm(false);
          setPayStatus('error');
          setPayMessage(msg);
        }
      },
    });
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const variantName = product.variants?.[selectedVariant]?.name;
    const orderText = variantName && variantName !== 'Variant' && variantName !== 'Default'
      ? `${product.name} (${variantName})`
      : product.name;
    const message = `Hi Starfruit Tees! I'd like to discuss and order the ${orderText} in size ${selectedSize}. Can you help?`;
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

  const seriesSlug = product.category === 'Stadium Series' ? 'stadium'
    : product.category === 'Legend Series' ? 'legend'
    : null;

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">

      <Navbar onCartOpen={() => setCartOpen(true)} />

      <div className="pt-14 md:pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6 uppercase tracking-widest flex-wrap">
            <Link to="/" className="hover:text-black transition-colors">Shop</Link>
            <span>/</span>
            {seriesSlug ? (
              <Link to={`/series/${seriesSlug}`} className="hover:text-black transition-colors">{product.category}</Link>
            ) : (
              <span className="text-slate-500">{product.category}</span>
            )}
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
              <span className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600 mb-2">{product.category}</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black leading-tight mb-3">{product.name}</h1>

              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-2xl font-black text-black">₹{getOfferPrice(product.category, product.price)}</span>
                <span className="text-lg text-slate-400 line-through font-medium">{product.price}</span>
                {getDiscountLabel(product.category) && (
                  <span className="text-xs font-black uppercase tracking-wider bg-yellow-400 text-black px-2 py-0.5 rounded-full">{getDiscountLabel(product.category)}</span>
                )}
              </div>
              {product.category === 'Stadium Series' && (
                <p className="text-xs text-green-600 font-semibold mb-4">
                  🔥 Limited Launch: First 100 orders get 40% OFF — only ₹{getOfferPrice(product.category, product.price)}!
                </p>
              )}
              {product.category === 'Legend Series' && (
                <p className="text-xs text-green-600 font-semibold mb-4">
                  🎉 Special offer: 10% OFF — only ₹{getOfferPrice(product.category, product.price)}!
                </p>
              )}

              <p className="text-sm text-slate-600 leading-relaxed mb-6">{product.description}</p>

              {/* Variant selector */}
              {product.variants && product.variants.length > 1 && (
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Style</p>
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
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Size</p>
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

              {/* Customization note */}
              {product.category === 'Stadium Series' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="font-bold text-yellow-800 text-sm mb-1">✍️ Want your name & number on the back?</p>
                  <p className="text-yellow-700 text-xs leading-relaxed">Full back customization available. Mention your preferred name & number when you place the order via WhatsApp.</p>
                </div>
              )}

              {/* Payment status */}
              {payStatus === 'success' && (
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-2">
                  <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700 font-semibold">{payMessage}</p>
                </div>
              )}
              {payStatus === 'error' && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-2">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-semibold">{payMessage}</p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm uppercase tracking-wide border-2 transition-all duration-200 ${added
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-black bg-white text-black hover:bg-black hover:text-white'
                    }`}
                >
                  {added ? <><Check size={16} /> Added!</> : <><ShoppingBag size={16} /> Add to Cart</>}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={payStatus === 'loading' || !scriptLoaded}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm uppercase tracking-wide bg-black text-white hover:bg-yellow-400 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard size={16} /> {payStatus === 'loading' ? 'Opening...' : 'Buy Now'}
                </button>
              </div>

              {/* WhatsApp fallback */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200 text-slate-500 hover:border-black hover:text-black transition-all mt-2"
              >
                <MessageCircle size={13} /> Prefer to discuss first? Chat on WhatsApp
              </button>

              <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
                <MapPin size={10} className="text-yellow-500 flex-shrink-0" />
                Quick Delivery · Bengaluru & PAN India
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <OrderForm
        isOpen={showOrderForm}
        onClose={() => { setShowOrderForm(false); setFormLoading(false); }}
        productName={(() => {
          const v = product?.variants?.[selectedVariant]?.name;
          return v && v !== 'Variant' && v !== 'Default'
            ? `${product?.name} (${v}) — Size ${selectedSize}`
            : `${product?.name} — Size ${selectedSize}`;
        })()}
        category={product?.category}
        onSubmit={handleOrderFormSubmit}
        loading={formLoading}
      />
    </div>
  );
};

export default ProductDetail;
