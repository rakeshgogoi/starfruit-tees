import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  loadProductsFromStorage,
  saveProductsToStorage,
  loadProductsFromJSON,
  createEmptyProduct,
  normalizeProduct,
  DEFAULT_PRODUCTS,
} from '../data/products';

const CATEGORIES = ['Heritage Series', 'Lyrical Anthems', 'Stadium Series'];

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyProduct());
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = loadProductsFromStorage();
    setProducts(stored || [...DEFAULT_PRODUCTS]);
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
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

  const updateVariantImage = (vIndex, imgIndex, value) => {
    setForm((prev) => {
      const next = [...(prev.variants || [])];
      const images = [...(next[vIndex]?.images || [])];
      images[imgIndex] = value;
      if (imgIndex === images.length - 1 && value) images.push('');
      next[vIndex] = { ...next[vIndex], images };
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

  const addImageToVariant = (vIndex) => {
    setForm((prev) => {
      const next = [...(prev.variants || [])];
      const images = [...(next[vIndex]?.images || []), ''];
      next[vIndex] = { ...next[vIndex], images };
      return { ...prev, variants: next };
    });
  };

  const removeImageFromVariant = (vIndex, imgIndex) => {
    setForm((prev) => {
      const next = [...(prev.variants || [])];
      const current = next[vIndex]?.images || [];
      const images = current.filter((_, i) => i !== imgIndex);
      if (images.length === 0) images.push('');
      next[vIndex] = { ...next[vIndex], images };
      return { ...prev, variants: next };
    });
  };

  const saveProduct = () => {
    const normalized = normalizeProduct(form, products);
    const exists = products.some((p) => String(p.id) === String(normalized.id));
    let next;
    if (exists) {
      next = products.map((p) => (String(p.id) === String(normalized.id) ? normalized : p));
    } else {
      next = [...products, normalized];
    }
    setProducts(next);
    saveProductsToStorage(next);
    setEditingId(null);
    setForm(createEmptyProduct());
    showMessage('Product saved. Export JSON and add to public/products.json to update the live site.');
  };

  const deleteProduct = (id) => {
    if (!confirm('Delete this product?')) return;
    const next = products.filter((p) => String(p.id) !== String(id));
    setProducts(next);
    saveProductsToStorage(next);
    if (editingId === id) {
      setEditingId(null);
      setForm(createEmptyProduct());
    }
    showMessage('Product deleted.');
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
    showMessage('Exported products.json. Save it as public/products.json and redeploy.');
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
        showMessage('Products imported.');
      } else {
        showMessage('Invalid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetToDefault = () => {
    if (!confirm('Replace all products with default? This cannot be undone.')) return;
    setProducts([...DEFAULT_PRODUCTS]);
    saveProductsToStorage(DEFAULT_PRODUCTS);
    setEditingId(null);
    setForm(createEmptyProduct());
    showMessage('Reset to default products.');
  };

  const isEditing = editingId !== null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: system-ui, sans-serif; }
      `}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-600 hover:text-black">← Back to site</Link>
            <h1 className="text-xl font-display font-black">Admin — Products</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportJSON}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
            >
              Export JSON
            </button>
            <label className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300 cursor-pointer">
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button
              type="button"
              onClick={resetToDefault}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-100"
            >
              Reset to default
            </button>
          </div>
        </div>
        {message && (
          <div className="max-w-4xl mx-auto px-6 pb-2 text-sm text-amber-700 bg-amber-50 border-b border-amber-200">
            {message}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <section className="md:w-56 flex-shrink-0">
            <button
              type="button"
              onClick={startNew}
              className="w-full py-2 rounded-lg bg-black text-white text-sm font-medium mb-4"
            >
              + Add product
            </button>
            <ul className="space-y-1">
              {products.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => loadForm(p)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${editingId === p.id ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'}`}
                  >
                    {p.name || 'Untitled'} — {p.price}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex-1 min-w-0">
            {!isEditing ? (
              <p className="text-slate-500 text-sm">Select a product to edit or add a new one.</p>
            ) : (
              <form
                className="space-y-6 bg-white rounded-xl border border-slate-200 p-6"
                onSubmit={(e) => { e.preventDefault(); saveProduct(); }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="e.g. Maya"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Price</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => updateForm('price', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="e.g. ₹799"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Tag (e.g. CRAFTED.)</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => updateForm('tag', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Product description"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Variants (name + image URLs)</label>
                    <button type="button" onClick={addVariant} className="text-sm text-slate-600 hover:text-black">+ Variant</button>
                  </div>
                  <div className="space-y-6">
                    {(form.variants || []).map((v, vIndex) => (
                      <div key={vIndex} className="border border-slate-200 rounded-lg p-4 space-y-3">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="Variant name (e.g. Black)"
                          />
                          <button type="button" onClick={() => removeVariant(vIndex)} className="text-red-600 text-sm">Remove</button>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500">Image URLs or paths (e.g. /products/photo.png)</span>
                          {(v.images || []).map((url, imgIndex) => (
                            <div key={imgIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => updateVariantImage(vIndex, imgIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="/products/image.png"
                              />
                              <button type="button" onClick={() => removeImageFromVariant(vIndex, imgIndex)} className="text-slate-400 hover:text-red-600">×</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addImageToVariant(vIndex)} className="text-sm text-slate-600 hover:text-black">+ Image</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="submit" className="px-6 py-2 rounded-lg bg-black text-white font-medium">
                    Save product
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setForm(createEmptyProduct()); }}
                    className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600"
                  >
                    Cancel
                  </button>
                  {products.some((p) => String(p.id) === String(form.id)) && (
                    <button
                      type="button"
                      onClick={() => deleteProduct(form.id)}
                      className="px-6 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>
        </div>

        <p className="mt-8 text-slate-500 text-sm">
          To update the live site: Export JSON, save the file as <code className="bg-slate-200 px-1 rounded">public/products.json</code> in your repo, then commit and deploy.
        </p>
      </main>
    </div>
  );
}
