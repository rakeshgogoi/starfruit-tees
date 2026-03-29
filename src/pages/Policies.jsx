import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-lg sm:text-xl font-display font-black uppercase tracking-tight text-black mb-4 pb-3 border-b border-slate-100">
      {title}
    </h2>
    <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
      {children}
    </div>
  </div>
);

const Policies = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">

      <Navbar />

      <div className="pt-20 md:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <div className="mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 block mb-2">Starfruit Tees</span>
            <h1 className="text-3xl sm:text-4xl font-display font-black uppercase leading-tight mb-3">Policies</h1>
            <p className="text-sm text-slate-500">Shipping, delivery, exchange, and order information — all in one place.</p>
          </div>

          {/* Shipping & Delivery */}
          <Section title="🚚 Shipping & Delivery">
            <p>We ship across India from our base in Bangalore. All orders are processed within <strong className="text-black">1–3 business days</strong> after payment confirmation.</p>
            <p>Standard delivery typically takes <strong className="text-black">5–7 business days</strong> after dispatch. Delivery timelines may vary slightly by location and during peak seasons (IPL, festive periods).</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>You will receive a WhatsApp message once your order is dispatched with tracking details.</li>
              <li>Customised jerseys (with name & number) may take an additional 1–2 days for printing before dispatch.</li>
              <li>For bulk orders (5+ jerseys), please reach out via WhatsApp for timelines.</li>
            </ul>
          </Section>

          {/* Returns & Exchange */}
          <Section title="🔄 Returns & Exchange">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="font-bold text-yellow-900 text-sm mb-1">Important — Customised Jerseys</p>
              <p className="text-yellow-800 text-sm">Jerseys with custom name & number printed on the back are <strong>not eligible for return or exchange</strong>, as they are made-to-order specifically for you.</p>
            </div>
            <p>For <strong className="text-black">non-customised jerseys</strong> (standard team jerseys without personalisation), we offer exchange within <strong className="text-black">7 days</strong> of delivery in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Wrong size received (different from what was ordered)</li>
              <li>Manufacturing defect or print quality issue</li>
              <li>Wrong product delivered</li>
            </ul>
            <p className="mt-3">To initiate an exchange, WhatsApp us at <a href="https://wa.me/916362376160" target="_blank" rel="noopener noreferrer" className="text-yellow-600 font-bold hover:underline">+91 63623 76160</a> with your order details and a photo of the issue within 7 days of delivery.</p>
          </Section>

          {/* Customisation */}
          <Section title="✍️ Customisation">
            <p>All jerseys can be customised with your <strong className="text-black">name and number on the back</strong> at no extra charge during the launch offer period.</p>
            <p>After payment, WhatsApp us your preferred name and number. We'll confirm before sending to print.</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Name: up to 12 characters</li>
              <li>Number: any number from 0–99</li>
              <li>Font style matches the team's official jersey design</li>
            </ul>
          </Section>

          {/* Payment */}
          <Section title="💳 Payment & Security">
            <p>We accept all major payment methods via <strong className="text-black">Razorpay</strong> — UPI, credit/debit cards, net banking, and wallets. All payments are encrypted and secure.</p>
            <p>After successful payment, you'll receive a payment confirmation and an order summary via WhatsApp. GST invoices are available on request.</p>
          </Section>

          {/* Contact */}
          <div className="bg-black text-white rounded-2xl p-6 sm:p-8 mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Need Help?</p>
            <h3 className="text-xl font-display font-black mb-3">Talk to us on WhatsApp</h3>
            <p className="text-slate-400 text-sm mb-5">We're a small team and respond quickly. For any order queries, size help, or customisation questions — just message us.</p>
            <a
              href="https://wa.me/916362376160"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-yellow-300 transition-all"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>

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
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">© 2026 House of Starfruit</p>
        </div>
      </footer>
    </div>
  );
};

export default Policies;
