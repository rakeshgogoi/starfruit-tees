import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  loadProductsFromStorage,
  saveProductsToStorage,
  loadProductsFromJSON,
  loadProductsForSite,
  createEmptyProduct,
  normalizeProduct,
  DEFAULT_PRODUCTS,
} from '../data/products';
import { isAdminAuthenticated, setAdminAuthenticated, clearAdminSession, getAdminPassword, getSessionPassword } from '../auth';

const CATEGORIES = ['Heritage Series', 'Lyrical Anthems', 'Stadium Series'];

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const configured = getAdminPassword();
  const devDefault = import.meta.env.DEV && !configured;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const expected = configured || (devDefault ? 'admin' : '');
    if (!expected) {
      setError('Admin password not configured. Set VITE_ADMIN_PASSWORD in your environment.');
      return;
    }
    if (password === expected) {
      setAdminAuthenticated(password);
      onSuccess();
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-xl font-display font-black text-slate-900 mb-2">Admin sign in</h1>
        <p className="text-slate-500 text-sm mb-6">Enter your password to manage products.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full py-2.5 rounded-lg bg-black text-white font-medium hover:bg-slate-800">
            Sign in
          </button>
        </form>
        {devDefault && (
          <p className="mt-4 text-xs text-slate-400">Dev: no VITE_ADMIN_PASSWORD set, use “admin” to sign in.</p>
        )}
        <Link to="/" className="block mt-6 text-center text-sm text-slate-500 hover:text-slate-700">← Back to store</Link>
      </div>
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────────────

const STATUS_META = {
  captured:   { label: 'Paid',      bg: 'bg-green-100',  text: 'text-green-800'  },
  authorized: { label: 'Authorized',bg: 'bg-blue-100',   text: 'text-blue-800'   },
  created:    { label: 'Pending',   bg: 'bg-yellow-100', text: 'text-yellow-800' },
  failed:     { label: 'Failed',    bg: 'bg-red-100',    text: 'text-red-700'    },
  refunded:   { label: 'Refunded',  bg: 'bg-slate-100',  text: 'text-slate-600'  },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

function formatDate(unix) {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatAmount(paise) {
  if (!paise) return '₹0';
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function OrdersTab() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all'); // all | captured | failed

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    const pw = getSessionPassword();
    try {
      const res = await fetch('/api/admin-orders', {
        headers: { 'x-admin-password': pw },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setPayments(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = payments.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.id?.toLowerCase().includes(q)
      || p.email?.toLowerCase().includes(q)
      || p.contact?.includes(q)
      || p.description?.toLowerCase().includes(q)
      || p.order?.receipt?.toLowerCase().includes(q)
      || (p.notes?.product || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const captured   = payments.filter((p) => p.status === 'captured');
  const totalRev   = captured.reduce((s, p) => s + (p.amount || 0), 0);
  const failed     = payments.filter((p) => p.status === 'failed').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <span className="text-sm font-medium">Loading orders from Razorpay…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-700 font-semibold mb-1">Could not load orders</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        {error.includes('ADMIN_SECRET') && (
          <p className="text-sm text-slate-500 mb-4">
            Add <code className="bg-slate-100 px-1 rounded">ADMIN_SECRET</code> to your Vercel environment variables
            with the same value as your admin password.
          </p>
        )}
        <button onClick={fetchOrders} className="px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-slate-800">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatAmount(totalRev), sub: 'from paid orders', accent: true },
          { label: 'Total Orders',  value: payments.length,        sub: 'all attempts'   },
          { label: 'Paid',          value: captured.length,        sub: 'captured'       },
          { label: 'Failed',        value: failed,                  sub: 'failed payments'},
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.accent ? 'bg-black border-black text-white' : 'bg-white border-slate-200'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.accent ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
            <p className={`text-2xl font-black ${s.accent ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
            <p className={`text-xs font-medium mt-0.5 ${s.accent ? 'text-slate-400' : 'text-slate-400'}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by payment ID, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'captured', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-black text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'captured' ? '✅ Paid' : '❌ Failed'}
            </button>
          ))}
        </div>
        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
          </svg>
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-2xl mb-2">📦</p>
          <p className="font-medium text-sm">{search || filter !== 'all' ? 'No orders match your filter.' : 'No orders yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const productLabel = p.notes?.product || p.description || '—';
            const receipt = p.order?.receipt || '';
            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <StatusBadge status={p.status} />
                      <span className="text-xs font-mono text-slate-400">{p.id}</span>
                      {receipt && (
                        <span className="text-xs text-slate-300 font-mono hidden sm:inline">· {receipt}</span>
                      )}
                    </div>

                    {/* Product */}
                    <p className="text-sm font-bold text-slate-900 truncate mb-0.5">{productLabel}</p>

                    {/* Customer contact */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 font-medium">
                      {p.contact && <span>📱 {p.contact}</span>}
                      {p.email   && <span>✉️ {p.email}</span>}
                      <span>🕐 {formatDate(p.created_at)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-black ${p.status === 'captured' ? 'text-green-700' : 'text-slate-400'}`}>
                      {formatAmount(p.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{p.method || ''}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400 text-center">
        Showing last 100 payments · For complete history visit{' '}
        <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">
          Razorpay Dashboard ↗
        </a>
      </p>
    </div>
  );
}

// ─── Main Admin ────────────────────────────────────────────────────────────────

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab]         = useState('products'); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyProduct());
  const [message, setMessage] = useState({ text: '', type: 'info' });

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
  }, []);

  useEffect(() => {
    loadProductsForSite().then((loaded) => {
      setProducts(loaded && loaded.length > 0 ? loaded : loadProductsFromStorage() || [...DEFAULT_PRODUCTS]);
    });
  }, []);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'info' }), 4000);
  };

  const loadForm = (product) => {
    setForm({
      id: product.id,
      name: product.name || '',
      category: product.category || 'Heritage Series',
      price: product.price || '',
      description: product.description || '',
      tag: product.tag || '',
      variants: (product.variants || []).length
        ? product.variants.map((v) => ({
            name: v.name || '',
            images: [...(v.images || []).filter(Boolean), ''],
          }))
        : [{ name: '', images: [''] }],
    });
    setEditingId(product.id);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateVariant = (vIndex, field, value) => {
    setForm((prev) => {
      const next = [...(prev.variants || [])];
      next[vIndex] = { ...next[vIndex], [field]: value };
      return { ...prev, variants: next };
    });
  };

  const setVariantImagesFromText = (vIndex, text) => {
    const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
    setForm((prev) => {
      const next = [...(prev.variants || [])];
      next[vIndex] = { ...next[vIndex], images: lines.length ? lines : [''] };
      return { ...prev, variants: next };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { name: '', images: [''] }],
    }));
  };

  const removeVariant = (vIndex) => {
    if (form.variants.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== vIndex),
    }));
  };

  const saveProduct = () => {
    const normalized = normalizeProduct(form, products);
    const exists = products.some((p) => String(p.id) === String(normalized.id));
    const next = exists
      ? products.map((p) => (String(p.id) === String(normalized.id) ? normalized : p))
      : [...products, normalized];
    setProducts(next);
    saveProductsToStorage(next);
    setEditingId(null);
    setForm(createEmptyProduct());
    showMessage(`"${normalized.name}" saved. Use "Publish to site" below to update the live store.`, 'success');
  };

  const deleteProduct = (id, e) => {
    e?.stopPropagation();
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const next = products.filter((p) => String(p.id) !== String(id));
    setProducts(next);
    saveProductsToStorage(next);
    if (editingId === id) {
      setEditingId(null);
      setForm(createEmptyProduct());
    }
    showMessage('Product deleted.', 'success');
  };

  const startNew = () => {
    setEditingId('new');
    setForm(createEmptyProduct());
  };

  const exportJSON = () => {
    const json = JSON.stringify(products, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Downloaded products.json. Save it as public/products.json in your repo and redeploy.', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = loadProductsFromJSON(reader.result);
      if (data) {
        setProducts(data);
        saveProductsToStorage(data);
        setEditingId(null);
        setForm(createEmptyProduct());
        showMessage(`${data.length} product(s) imported.`, 'success');
      } else {
        showMessage('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetToDefault = () => {
    if (!confirm('Replace all products with the default list? This cannot be undone.')) return;
    setProducts([...DEFAULT_PRODUCTS]);
    saveProductsToStorage(DEFAULT_PRODUCTS);
    setEditingId(null);
    setForm(createEmptyProduct());
    showMessage('Reset to default products.', 'success');
  };

  const firstImage = (product) => {
    const v = product.variants?.[0];
    return (v?.images && v.images[0]) || '';
  };

  const isEditing = editingId !== null;

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-500 hover:text-black text-sm font-medium">← Store</Link>
              <h1 className="text-lg font-display font-black">Admin</h1>
              {/* Tab switcher */}
              <div className="flex bg-slate-100 rounded-lg p-1 gap-0.5">
                {[{ id: 'products', label: '📦 Products' }, { id: 'orders', label: '💳 Orders' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      tab === t.id ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { clearAdminSession(); setAuthenticated(false); }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-100"
              >
                Sign out
              </button>
              {tab === 'products' && (
                <>
                  <button
                    type="button"
                    onClick={exportJSON}
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800"
                  >
                    Publish to site
                  </button>
                  <label className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300 cursor-pointer">
                    Import
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                  <button
                    type="button"
                    onClick={resetToDefault}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-100"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {message.text && (
          <div className={`max-w-5xl mx-auto px-4 sm:px-6 py-2 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
          }`}>
            {message.text}
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Orders Tab */}
        {tab === 'orders' && <OrdersTab />}

        {/* Products Tab — list */}
        {tab === 'products' && !isEditing && (
          /* Product list view */
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 text-sm">Add or edit products. Use “Publish to site” to update the live store.</p>
              <button
                type="button"
                onClick={startNew}
                className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-slate-800 shadow-md"
              >
                + Add product
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => loadForm(p)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer transition-all"
                >
                  <div className="aspect-[3/4] bg-slate-100 relative">
                    {firstImage(p) ? (
                      <img src={firstImage(p)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate">{p.name || 'Untitled'}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{p.price}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadForm(p)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => deleteProduct(p.id, e)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Products Tab — edit form */}
        {tab === 'products' && isEditing && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm(createEmptyProduct()); }}
                className="text-slate-500 hover:text-black text-sm font-medium"
              >
                ← Back to list
              </button>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-medium">{form.name || 'New product'}</span>
            </div>

            <form
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              onSubmit={(e) => { e.preventDefault(); saveProduct(); }}
            >
              {/* Basic info */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Basic info</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                      placeholder="e.g. Maya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => updateForm('price', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                      placeholder="e.g. ₹799"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full max-w-xs px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tag (optional)</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => updateForm('tag', e.target.value)}
                    className="w-full max-w-xs px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400"
                    placeholder="e.g. CRAFTED."
                  />
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                    placeholder="Short product description for the store."
                  />
                </div>
              </div>

              {/* Variants & images */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Variants & images</h2>
                  <button type="button" onClick={addVariant} className="text-sm font-medium text-slate-600 hover:text-black">
                    + Add variant
                  </button>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  Each variant (e.g. Black, White) can have multiple images. Use paths like <code className="bg-slate-100 px-1 rounded">/products/photo.png</code>. Add image files to <code className="bg-slate-100 px-1 rounded">public/products/</code> in your project.
                </p>
                <div className="space-y-6">
                  {(form.variants || []).map((v, vIndex) => (
                    <div key={vIndex} className="rounded-xl border border-slate-200 p-5 bg-slate-50/50">
                      <div className="flex gap-3 items-center mb-3">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                          placeholder="Variant name (e.g. Black)"
                        />
                        <button type="button" onClick={() => removeVariant(vIndex)} className="text-slate-400 hover:text-red-600 text-sm font-medium">
                          Remove variant
                        </button>
                      </div>
                      <label className="block text-sm text-slate-600 mb-1">Image paths (one per line)</label>
                      <textarea
                        value={(v.images || []).filter(Boolean).join('\n')}
                        onChange={(e) => setVariantImagesFromText(vIndex, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-mono focus:ring-2 focus:ring-slate-400"
                        placeholder="/products/image1.png (one path per line)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 sm:p-8 bg-slate-50 flex flex-wrap gap-3">
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-slate-800">
                  Save product
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setForm(createEmptyProduct()); }}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                {products.some((p) => String(p.id) === String(form.id)) && (
                  <button
                    type="button"
                    onClick={() => deleteProduct(form.id)}
                    className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50"
                  >
                    Delete product
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {tab === 'products' && !isEditing && (
          <p className="mt-8 text-slate-500 text-sm">
            After editing, click <strong>Publish to site</strong> to download <code className="bg-slate-200 px-1 rounded">products.json</code>. Save it as <code className="bg-slate-200 px-1 rounded">public/products.json</code> in your repo, then commit and deploy.
          </p>
        )}
      </main>
    </div>
  );
}
