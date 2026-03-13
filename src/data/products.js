const STORAGE_KEY = 'starfruit_products';

export const DEFAULT_PRODUCTS = [
  {
    id: '1',
    name: 'Maya',
    category: 'Heritage Series',
    price: '₹799',
    description: 'Premium 240 GSM organic cotton. Iconic design in Black or White. Limited batches.',
    tag: 'CRAFTED.',
    variants: [
      {
        name: 'Black',
        images: [
          '/products/maya-shirt-black.png',
          '/products/maya-shirt-black-splash.png',
        ],
      },
      {
        name: 'White',
        images: [
          '/products/maya-shirt-white.png',
          '/products/maya-shirt-white-splash.png',
        ],
      },
    ],
  },
];

function nextId(products) {
  const ids = products.map((p) => parseInt(p.id, 10)).filter((n) => !Number.isNaN(n));
  return String(ids.length ? Math.max(...ids) + 1 : 1);
}

export function loadProductsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function saveProductsToStorage(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products, null, 2));
}

export function loadProductsFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function loadProductsForSite() {
  try {
    const res = await fetch(`/products.json?v=${import.meta.env.VITE_APP_VERSION || '2'}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    }
  } catch {
    // no products.json or network error
  }
  return loadProductsFromStorage() || DEFAULT_PRODUCTS;
}

export function createEmptyProduct() {
  return {
    id: '',
    name: '',
    category: 'Heritage Series',
    price: '',
    description: '',
    tag: '',
    variants: [{ name: '', images: [''] }],
  };
}

export function normalizeProduct(product, existingProducts = []) {
  const id = product.id && String(product.id).trim() ? String(product.id) : nextId(existingProducts);
  const variants = (product.variants || [])
    .map((v) => ({
      name: (v.name || '').trim() || 'Variant',
      images: Array.isArray(v.images) ? v.images.map((u) => (u || '').trim()).filter(Boolean) : [],
    }))
    .filter((v) => v.images.length > 0);
  return {
    id,
    name: (product.name || '').trim() || 'Untitled',
    category: (product.category || '').trim() || 'Heritage Series',
    price: (product.price || '').trim() || '₹0',
    description: (product.description || '').trim() || '',
    tag: (product.tag || '').trim() || '',
    variants: variants.length ? variants : [{ name: 'Default', images: [''] }],
  };
}
