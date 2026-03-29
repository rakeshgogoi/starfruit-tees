import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MessageCircle, ArrowLeft } from 'lucide-react';

const ThankYou = () => {
  const { state } = useLocation();
  const { paymentId, customerName, product, amount } = state || {};

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16 font-sans">
      <div className="w-full max-w-md text-center">

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
          Order Confirmed!
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          {customerName ? `Thank you, ${customerName}!` : 'Thank you!'} Your payment was successful and your order is now being processed.
        </p>

        {/* Order summary card */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3">
          {product && (
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Product</span>
              <span className="text-xs font-semibold text-right max-w-[60%]">{product}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Amount Paid</span>
              <span className="text-sm font-black text-black">₹{amount}</span>
            </div>
          )}
          {paymentId && (
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Payment ID</span>
              <span className="text-[10px] font-mono text-slate-500 break-all text-right max-w-[60%]">{paymentId}</span>
            </div>
          )}
        </div>

        {/* What happens next */}
        <div className="text-left mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">What happens next</p>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-sm font-bold text-black">Order Processing</p>
                <p className="text-xs text-slate-500">We'll review your order and begin production within 1–2 business days.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-sm font-bold text-black">WhatsApp Update</p>
                <p className="text-xs text-slate-500">You'll receive a WhatsApp message with shipping details once your order is dispatched.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="flex items-center gap-1">
                  <Package size={13} className="text-black" />
                  <p className="text-sm font-bold text-black">Delivery</p>
                </div>
                <p className="text-xs text-slate-500">Delivered to your doorstep across India within 5–7 business days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <a
            href={`https://wa.me/918720951721?text=${encodeURIComponent(`Hi! I just placed an order. Payment ID: ${paymentId || 'N/A'}. Please confirm.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide bg-black text-white hover:bg-yellow-400 hover:text-black transition-all"
          >
            <MessageCircle size={16} />
            Chat with Us on WhatsApp
          </a>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs uppercase tracking-wide border border-slate-200 text-slate-500 hover:border-black hover:text-black transition-all"
          >
            <ArrowLeft size={13} />
            Continue Shopping
          </Link>
        </div>

        {/* Brand footer */}
        <p className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          Starfruit Tees · Wear Your Team
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
