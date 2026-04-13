import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadInventory, getStock, isInventoryTracked } from '../data/inventory';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [inventoryReady, setInventoryReady] = useState(false);

  useEffect(() => {
    loadInventory().then(() => setInventoryReady(true));
  }, []);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('starfruit_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('starfruit_cart', JSON.stringify(cart));
  }, [cart]);

  /**
   * Get total quantity of a product+size already in the cart.
   */
  const getCartQty = (productId, size) => {
    return cart
      .filter(item => item.id === productId && item.size === size)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const addToCart = (product, variantIndex = 0, quantity = 1, size = '') => {
    const variant = product.variants?.[variantIndex];
    const key = `${product.id}-${variantIndex}-${size}`;

    // Enforce inventory limits
    if (isInventoryTracked(product.id)) {
      const stock = getStock(product.id, size);
      const inCart = getCartQty(product.id, size);
      const canAdd = Math.max(0, stock - inCart);
      if (canAdd <= 0) return false; // out of stock
      quantity = Math.min(quantity, canAdd);
    }

    setCart(prev => {
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, {
        key,
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category || '',
        variant: variant?.name || 'Default',
        image: variant?.images?.[0] || '',
        quantity,
        size,
      }];
    });
    return true;
  };

  const removeFromCart = (key) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) {
      removeFromCart(key);
      return;
    }

    // Enforce inventory limits on quantity increase
    const item = cart.find(i => i.key === key);
    if (item && isInventoryTracked(item.id)) {
      const stock = getStock(item.id, item.size);
      // Other cart items with same product+size (different variant shouldn't share, but same product+size does)
      const otherQty = cart
        .filter(i => i.id === item.id && i.size === item.size && i.key !== key)
        .reduce((sum, i) => sum + i.quantity, 0);
      quantity = Math.min(quantity, stock - otherQty);
      if (quantity < 1) {
        removeFromCart(key);
        return;
      }
    }

    setCart(prev => prev.map(item => item.key === key ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, getCartQty, inventoryReady }}>
      {children}
    </CartContext.Provider>
  );
};
