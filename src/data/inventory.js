let inventoryCache = null;

/**
 * Load inventory from the server API.
 * Falls back to static inventory.json if API is unavailable (local dev).
 */
export async function loadInventory() {
  if (inventoryCache) return inventoryCache;

  // Try server API first (authoritative source)
  try {
    const res = await fetch('/api/inventory');
    if (res.ok) {
      inventoryCache = await res.json();
      return inventoryCache;
    }
  } catch {
    // API not available (local dev without Vercel)
  }

  // Fallback to static inventory.json for local development
  try {
    const res = await fetch(`/inventory.json?v=${Date.now()}`);
    if (res.ok) {
      inventoryCache = await res.json();
      return inventoryCache;
    }
  } catch {
    // no fallback available
  }

  inventoryCache = {};
  return inventoryCache;
}

/**
 * Force-refresh inventory from the server.
 * Call after a purchase to get updated stock levels.
 */
export async function refreshInventory() {
  inventoryCache = null;
  return loadInventory();
}

/**
 * Get available stock for a product + size.
 * Returns Infinity for products not tracked in inventory (unlimited).
 */
export function getStock(productId, size) {
  if (!inventoryCache) return Infinity;
  const product = inventoryCache[productId];
  if (!product) return Infinity;
  return product[size] ?? 0;
}

/**
 * Check if a product has any inventory tracking at all.
 */
export function isInventoryTracked(productId) {
  if (!inventoryCache) return false;
  return productId in inventoryCache;
}

/**
 * Get stock for all sizes of a product.
 * Returns null if product is not tracked.
 */
export function getProductStock(productId) {
  if (!inventoryCache) return null;
  return inventoryCache[productId] || null;
}

/**
 * Decrement stock via server API after a successful purchase.
 * Also updates local cache immediately for responsive UI.
 * items: [{ productId, size, quantity }]
 */
export async function decrementStock(items) {
  // Update local cache immediately for responsive UI
  if (inventoryCache) {
    for (const { productId, size, quantity } of items) {
      if (!inventoryCache[productId]) continue;
      const current = inventoryCache[productId][size] ?? 0;
      inventoryCache[productId][size] = Math.max(0, current - quantity);
    }
  }

  // Also call the server API (belt and suspenders — server is authoritative)
  try {
    await fetch('/api/inventory-decrement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {
    // Server decrement failed — notify-customer.js will also try
  }
}

/**
 * Get how many more of a product+size can be added to cart,
 * given what's already in the cart.
 */
export function getAvailableToAdd(productId, size, currentCartQty = 0) {
  const stock = getStock(productId, size);
  if (stock === Infinity) return Infinity;
  return Math.max(0, stock - currentCartQty);
}
