import React, { useState } from 'react';
import { ShoppingBag, X, Minus, Plus, CreditCard, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';

const parsePrice = (priceStr) => {
  const num = parseInt(String(priceStr).replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const { pay, scriptLoaded } = useRazorpay();
  const [payStatus, setPayStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [payMessage, setPayMessage] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

  const handleWhatsApp = () => {
    if (cart.length === 0) return;
    const items = cart.map(item =>
      `• ${item.name}${item.variant && item.variant !== 'Variant' && item.variant !== 'Default' ? ` (${item.variant})` : ''} x${item.quantity}`
    ).join('\n');
    const message = `Hi Starfruit Tees! I'd like to order the following:\n\n${items}\n\nTotal: ₹${cartTotal}\n\nPlease let me know the process!`;
    window.open(`https://wa.me/918720951721?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePay = async () => {
    if (cart.length === 0 || !scriptLoaded) return;
    setPayStatus('loading');
    setPayMessage('');

    const productLabel = cart.length === 1
      ? cart[0].name
      : `${cart.length} items from Starfruit Tees`;

    await pay({
      amount: cartTotal,
      productName: productLabel,
      receipt: `cart_${Date.now()}`,
      onSuccess: (response) => {
        setPayStatus('success');
        setPayMessage(`Payment successful! ID: ${response.razorpay_payment_id}`);
        // Notify store via WhatsApp after payment
        const items = cart.map(item =>
          `• ${item.name}${item.variant && item.variant !== 'Variant' && item.variant !== 'Default' ? ` (${item.variant})` : ''} x${item.quantity}`
        ).join('\n');
        const msg = `Hi! I've completed payment for my order.\n\nOrder:\n${items}\n\nTotal: ₹${cartTotal}\nPayment ID: ${response.razorpay_payment_id}\n\nPlease confirm and process my order!`;
        setTimeout(() => {
          window.open(`https://wa.me/918720951721?text=${encodeURIComponent(msg)}`, '_blank');
          clearCart();
        }, 1500);
      },
      onError: (msg) => {
        if (msg !== 'Payment cancelled.') {
          setPayStatus('error');
          setPayMessage(msg);
        } else {
          setPayStatus(null);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl font-sans">
        <style>{`
          .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
          .font-display { font-family: 'Playfair Display', serif; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <span className="font-black text-base uppercase tracking-wide">Your Cart</span>
            {cartCount > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 pt-16">
              <ShoppingBag size={40} strokeWidth={1} />
              <p className="text-sm font-medium">Your cart is empty</p>
              <button onClick={onClose} className="text-xs text-yellow-600 font-bold underline">Continue Shopping</button>
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
                  <p className="text-xs font-black text-slate-700 mt-1">{item.price}</p>
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

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-5 border-t border-slate-100 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
              <span className="text-lg font-black">₹{cartTotal}</span>
            </div>

            {/* Status message */}
            {payStatus === 'success' && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 font-semibold">{payMessage}</p>
              </div>
            )}
            {payStatus === 'error' && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-semibold">{payMessage}</p>
              </div>
            )}

            {/* Pay Now — primary */}
            <button
              onClick={handlePay}
              disabled={payStatus === 'loading' || !scriptLoaded}
              className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard size={16} />
              {payStatus === 'loading' ? 'Opening Payment...' : 'Pay Now'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* WhatsApp — secondary */}
            <button
              onClick={handleWhatsApp}
              className="w-full border-2 border-slate-200 text-slate-600 py-3 rounded-full font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:border-black hover:text-black transition-all"
            >
              <MessageCircle size={14} />
              Discuss & Order via WhatsApp
            </button>

            <button
              onClick={clearCart}
              className="w-full text-center text-[10px] font-bold text-slate-300 hover:text-black uppercase tracking-widest transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
