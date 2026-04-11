import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, ShoppingBag, CreditCard, MessageCircle, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { loadProductsForSite, DEFAULT_PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { getDeliveryCharge, COD_CHARGE } from '../utils/delivery';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import OrderForm from '../components/OrderForm';
import logoSrc from '../assets/SC_Logo_Colored.png';

const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const SIZE_SURCHARGE_SIZES = new Set(['2XL', '3XL']);
const SIZE_SURCHARGE = 100;
const getSizeSurcharge = (size) => SIZE_SURCHARGE_SIZES.has(size) ? SIZE_SURCHARGE : 0;

const RCB_CAPS = [
  { id: 'rcb-cap-red',      name: 'RCB Red Cap',         image: '/products/RCB-Cap4.png', category: 'Accessories' },
  { id: 'rcb-cap-black',    name: 'RCB Black Cap',       image: '/products/RCB-Cap3.png', category: 'Accessories' },
  { id: 'rcb-cap-redblack', name: 'RCB Red & Black Cap', image: '/products/RCB-Cap5.png', category: 'Accessories' },
];

const SIZE_CHART = {
  headers: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  rows: [
    { label: 'Chest', values: [38, 40, 42, 44, 46, 48] },
  ],
};

const DISCOUNT_RATE = { 'Stadium Series': 0.10, 'Legend Series': 0.10 };
const DISCOUNT_LABEL = { 'Stadium Series': '10% OFF', 'Legend Series': '10% OFF' };
const parseBasePrice = (priceStr) => parseInt(String(priceStr).replace(/[^\d]/g, ''), 10) || 0;
const getOfferPrice = (category, originalPrice, customRate) =>
  Math.round(parseBasePrice(originalPrice) * (1 - (customRate ?? DISCOUNT_RATE[category] ?? 0)));
const getDiscountLabel = (category, customLabel) => customLabel ?? DISCOUNT_LABEL[category] ?? '';

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
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [capAdded, setCapAdded] = useState(null);

  useEffect(() => {
    loadProductsForSite().then(loaded => {
      if (loaded && loaded.length > 0) setProducts(loaded);
    });
  }, []);

  const product = products.find(p => String(p.id) === String(id));
  const images = product?.variants?.[selectedVariant]?.images || product?.images || [];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, 1, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || !scriptLoaded) return;
    setShowOrderForm(true);
  };

  const handleOrderFormSubmit = async (customer) => {
    if (!product) return;
    const basePrice = getOfferPrice(product.category, product.price, product.discountRate) + getSizeSurcharge(selectedSize);
    const customisationCost = customer.customise ? 150 : 0;
    const jerseyTotal = basePrice + customisationCost;
    const variantName = product.variants?.[selectedVariant]?.name;
    const label = variantName && variantName !== 'Variant' && variantName !== 'Default'
      ? `${product.name} (${variantName}) — Size ${selectedSize}`
      : `${product.name} — Size ${selectedSize}`;

    setFormLoading(true);

    const isCOD = customer.paymentMethod === 'cod';
    const deliveryCharge = isCOD ? 0 : (getDeliveryCharge(customer.pincode) ?? 60);
    const totalAmount = isCOD ? jerseyTotal : jerseyTotal + deliveryCharge;

    // ── COD flow — ₹120 booking fee paid online, rest on delivery ────────
    if (isCOD) {
      await pay({
        amount: COD_CHARGE,
        productName: `COD Booking — ${label}`,
        receipt: `cod_${product.id}_${Date.now()}`,
        customer,
        onSuccess: async (response) => {
          setShowOrderForm(false);
          setFormLoading(false);
          try {
            await fetch('/api/notify-customer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer,
                order: {
                  product: label,
                  amount: jerseyTotal,
                  paymentId: response.razorpay_payment_id,
                  isCOD: true,
                  codChargePaid: COD_CHARGE,
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
              amount: jerseyTotal,
              isCOD: true,
              codChargePaid: COD_CHARGE,
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
      return;
    }

    // ── Online payment flow ───────────────────────────────────────────────
    await pay({
      amount: totalAmount,
      productName: label,
      receipt: `prod_${product.id}_${Date.now()}`,
      customer,
      onSuccess: async (response) => {
        setShowOrderForm(false);
        setFormLoading(false);

        try {
          await fetch('/api/notify-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer,
              order: {
                product: label,
                amount: totalAmount,
                paymentId: response.razorpay_payment_id,
                deliveryCharge,
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
            amount: totalAmount,
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
    window.open(`https://wa.me/916362376160?text=${encodeURIComponent(message)}`, '_blank');
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
                <span className="text-2xl font-black text-black">₹{getOfferPrice(product.category, product.price, product.discountRate) + getSizeSurcharge(selectedSize)}</span>
                <span className="text-lg text-slate-400 line-through font-medium">₹{parseBasePrice(product.price) + getSizeSurcharge(selectedSize)}</span>
                {getDiscountLabel(product.category, product.discountLabel) && (
                  <span className="text-xs font-black uppercase tracking-wider bg-yellow-400 text-black px-2 py-0.5 rounded-full">{getDiscountLabel(product.category, product.discountLabel)}</span>
                )}
              </div>
              {product.category === 'Legend Series' && (
                <p className="text-xs text-green-600 font-semibold mb-4">
                  🎉 Special offer: 10% OFF — only ₹{getOfferPrice(product.category, product.price, product.discountRate) + getSizeSurcharge(selectedSize)}!
                </p>
              )}

              <p className="text-sm text-slate-600 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>

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
                {SIZE_SURCHARGE_SIZES.has(selectedSize) && (
                  <p className="text-xs text-amber-600 font-semibold mt-2">+₹{SIZE_SURCHARGE} for {selectedSize} size</p>
                )}
              </div>

              {/* Size chart */}
              {product.category === 'Stadium Series' && (
                <div className="mb-6">
                  <button
                    onClick={() => setSizeChartOpen(o => !o)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-400 hover:text-black transition-colors"
                  >
                    Size Chart (inches)
                    <span className="text-slate-300">{sizeChartOpen ? '▲' : '▼'}</span>
                  </button>
                  {sizeChartOpen && (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 font-bold text-slate-500 border-b border-gray-100 whitespace-nowrap">Measurement</th>
                            {SIZE_CHART.headers.map(h => (
                              <th key={h} className="px-3 py-2 font-bold text-slate-700 border-b border-gray-100 text-center">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {SIZE_CHART.rows.map((row, i) => (
                            <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2 font-semibold text-slate-600 whitespace-nowrap border-b border-gray-50">{row.label}</td>
                              {row.values.map((v, j) => (
                                <td key={j} className="px-3 py-2 text-center text-slate-700 border-b border-gray-50">{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Customization note */}
              {product.id === '6' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="font-bold text-yellow-800 text-sm mb-1">✍️ Want your name & number on the back?</p>
                  <p className="text-yellow-700 text-xs leading-relaxed">Full back customization available. Mention your preferred name & number when you place the order.</p>
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

          {/* Complete the Look — RCB Caps */}
          {product.id === '6' && (
            <div className="mt-12 pt-10 border-t border-gray-100">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600 mb-1">Complete the Look</p>
                <h2 className="text-xl sm:text-2xl font-display font-black">Add an RCB Cap</h2>
                <p className="text-sm text-slate-400 mt-1">One size fits all</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory">
                {RCB_CAPS.map(cap => (
                  <div
                    key={cap.id}
                    className="flex-shrink-0 snap-start w-44 sm:w-48 bg-[#F8F8F8] rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="aspect-square overflow-hidden bg-white">
                      <img src={cap.image} alt={cap.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <p className="text-xs font-bold text-slate-700 leading-tight">{cap.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-black">₹269</span>
                        <span className="text-xs text-slate-400 line-through font-medium">₹299</span>
                        <span className="text-[10px] font-black uppercase tracking-wide bg-yellow-400 text-black px-1.5 py-0.5 rounded-full">10% OFF</span>
                      </div>
                      <button
                        onClick={() => {
                          addToCart({
                            id: cap.id,
                            name: cap.name,
                            price: '₹269',
                            category: 'Accessories',
                            variants: [{ name: 'Default', images: [cap.image] }],
                          }, 0);
                          setCapAdded(cap.id);
                          setTimeout(() => setCapAdded(null), 2000);
                        }}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold border-2 transition-all duration-200 ${
                          capAdded === cap.id
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-black bg-white text-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {capAdded === cap.id ? <><Check size={12} /> Added!</> : <><ShoppingBag size={12} /> Add to Cart</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer strip */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt="Starfruit Tees" className="h-10 w-auto object-contain flex-shrink-0" />
            <span className="font-display font-black text-base tracking-tight">Starfruit Tees</span>
          </div>
          <div className="flex gap-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <Link to="/series/legend" className="hover:text-black transition-colors">Legend</Link>
            <Link to="/series/stadium" className="hover:text-black transition-colors">Stadium</Link>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
            © 2026 House of Starfruit
          </p>
        </div>
      </footer>

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
        jerseyItems={product?.id === '6' ? [{ key: String(product.id), name: product.name, quantity: 1 }] : []}
        onSubmit={handleOrderFormSubmit}
        loading={formLoading}
        cartTotal={getOfferPrice(product?.category, product?.price, product?.discountRate) + getSizeSurcharge(selectedSize)}
      />
    </div>
  );
};

export default ProductDetail;
