import React, { useState, useEffect } from 'react';
import { X, Package, User, Phone, Mail, MapPin, Hash } from 'lucide-react';

/** Expand jerseyItems into one entry per physical jersey unit */
const expandJerseys = (items = []) => {
  const result = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      result.push({
        key: `${item.key}-${i}`,
        label: item.quantity > 1 ? `${item.name} #${i + 1}` : item.name,
        jerseyName: '',
        jerseyNumber: '',
      });
    }
  }
  return result;
};

const INITIAL = {
  name: '', phone: '', email: '',
  address: '', pincode: '',
  customise: false,
};

export default function OrderForm({ isOpen, onClose, productName, jerseyItems = [], onSubmit, loading }) {
  const [form, setForm]               = useState(INITIAL);
  const [errors, setErrors]           = useState({});
  const [customisations, setCustomisations] = useState(() => expandJerseys(jerseyItems));

  const hasJerseys   = jerseyItems.length > 0;
  const totalJerseys = jerseyItems.reduce((s, i) => s + i.quantity, 0);

  // Re-initialise customisations each time the form opens
  useEffect(() => {
    if (isOpen) setCustomisations(expandJerseys(jerseyItems));
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateCustomisation = (key, field, value) => {
    setCustomisations(prev => prev.map(c => c.key === key ? { ...c, [field]: value } : c));
    const errKey = `${key}_${field}`;
    if (errors[errKey]) setErrors(prev => ({ ...prev, [errKey]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                   e.name    = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone))                   e.phone   = 'Enter a valid 10-digit Indian mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                                             e.email   = 'Enter a valid email address';
    if (!form.address.trim())                                e.address = 'Delivery address is required';
    if (!/^\d{6}$/.test(form.pincode))                       e.pincode = 'Enter a valid 6-digit pincode';
    if (hasJerseys && form.customise) {
      customisations.forEach(c => {
        if (!c.jerseyName.trim())   e[`${c.key}_jerseyName`]   = 'Name is required';
        if (!c.jerseyNumber.trim()) e[`${c.key}_jerseyNumber`] = 'Number is required';
      });
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ ...form, customisations: form.customise ? customisations : [] });
  };

  const handleClose = () => {
    setForm(INITIAL);
    setCustomisations(expandJerseys(jerseyItems));
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col font-sans">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-900">Order Details</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Fill in your details to proceed to payment</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Product — prefilled read-only */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Package size={10} /> Product
            </label>
            <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 leading-snug">
              {productName}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <User size={10} /> Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Your full name"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Phone size={10} /> Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="flex">
              <span className="px-3 py-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm font-bold text-slate-500 select-none">+91</span>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className={`flex-1 px-4 py-3 border rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Mail size={10} /> Email <span className="text-slate-300 font-normal normal-case text-[10px]">(optional — order confirmation sent)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="your@email.com"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <MapPin size={10} /> Delivery Address <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.address}
              onChange={e => update('address', e.target.value)}
              placeholder="House / Flat no., Street, Area, City, State"
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Hash size={10} /> Pincode <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.pincode}
              onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit pincode"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${errors.pincode ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-1 font-medium">{errors.pincode}</p>}
          </div>

          {/* Customisation — jerseys only */}
          {hasJerseys && (
            <div className={`rounded-xl border-2 p-4 transition-all ${form.customise ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-slate-50'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.customise}
                  onChange={e => update('customise', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-yellow-500 flex-shrink-0"
                />
                <div>
                  <span className="text-sm font-bold text-slate-800">✍️ Customise {totalJerseys > 1 ? 'Jerseys' : 'Jersey'}</span>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Add your name & number printed on the back{' '}
                    <span className="font-bold text-yellow-700">
                      (+₹70{totalJerseys > 1 ? ' per jersey' : ''})
                    </span>
                  </p>
                </div>
              </label>

              {form.customise && (
                <div className="mt-4 space-y-5 pt-3 border-t border-yellow-200">
                  {customisations.map((c, idx) => (
                    <div key={c.key}>
                      {/* Sub-header only when multiple jerseys */}
                      {customisations.length > 1 && (
                        <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest mb-3 truncate">
                          {c.label}
                        </p>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-yellow-800 uppercase tracking-widest mb-1.5">
                            Jersey Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={c.jerseyName}
                            onChange={e => updateCustomisation(c.key, 'jerseyName', e.target.value.toUpperCase())}
                            placeholder="e.g. VIRAT"
                            maxLength={15}
                            className={`w-full px-4 py-2.5 border rounded-lg text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors[`${c.key}_jerseyName`] ? 'border-red-400 bg-red-50' : 'border-yellow-300 bg-white'}`}
                          />
                          {errors[`${c.key}_jerseyName`] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[`${c.key}_jerseyName`]}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-yellow-800 uppercase tracking-widest mb-1.5">
                            Jersey Number <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={c.jerseyNumber}
                            onChange={e => updateCustomisation(c.key, 'jerseyNumber', e.target.value.replace(/\D/g, '').slice(0, 2))}
                            placeholder="e.g. 18"
                            maxLength={2}
                            className={`w-full px-4 py-2.5 border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors[`${c.key}_jerseyNumber`] ? 'border-red-400 bg-red-50' : 'border-yellow-300 bg-white'}`}
                          />
                          {errors[`${c.key}_jerseyNumber`] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[`${c.key}_jerseyNumber`]}</p>}
                        </div>
                      </div>
                      {/* Divider between jersey entries */}
                      {idx < customisations.length - 1 && (
                        <div className="mt-5 border-t border-yellow-200" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spacer so last field isn't hidden behind footer */}
          <div className="h-2" />
        </form>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Opening payment…
              </>
            ) : '🔒 Proceed to Payment'}
          </button>
          <p className="text-center text-[10px] text-slate-400 font-medium mt-2">
            Secured by Razorpay · UPI, Cards, Net Banking
          </p>
        </div>
      </div>
    </div>
  );
}
