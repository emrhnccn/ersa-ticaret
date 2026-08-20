'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PriceQuote } from '@/shared/types/pricing';

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  sku: string;
  image: string;
  brand: string;
  category: string;
  quantity: number;
  unit: string;
  priceQuote?: PriceQuote;
  rawPriceTRY?: number;
  rawPriceEUR?: number;
}

interface CartTotals {
  subtotalExVat: number;
  vatTotal: number;
  grandTotal: number;
  currency: string;
  itemCount: number;
}

interface CartContextType {
  cart: CartItem[];
  currency: string;
  setCurrency: (c: string) => void;
  addToCart: (product: any, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getTotals: () => CartTotals;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<string>('TRY');

  useEffect(() => {
    const savedCart = localStorage.getItem('ersa_cart_v2');
    const savedCur = localStorage.getItem('ersa_currency');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {}
    }
    if (savedCur) setCurrency(savedCur);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('ersa_cart_v2', JSON.stringify(newCart));
  };

  const handleSetCurrency = (cur: string) => {
    setCurrency(cur);
    localStorage.setItem('ersa_currency', cur);
  };

  const addToCart = (product: any, qty: number = 1) => {
    const productId = product.id;
    const existingIndex = cart.findIndex((item) => item.id === productId || item.slug === product.slug);

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += qty;
      if (product.priceQuote) newCart[existingIndex].priceQuote = product.priceQuote;
      saveCart(newCart);
    } else {
      const newItem: CartItem = {
        id: product.id,
        slug: product.slug,
        name: product.name || product.title,
        sku: product.sku || product.code,
        image: product.imageUrl || product.image || (product.images && product.images[0]?.url) || 'https://placehold.co/400x400',
        brand: product.brandName || product.brand || 'Genel',
        category: product.categoryName || product.category || 'Yedek Parça',
        quantity: qty,
        unit: product.unit || 'ADET',
        priceQuote: product.priceQuote,
      };
      saveCart([...cart, newItem]);
    }
  };

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter((item) => item.id !== productId && item.slug !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart(cart.map((item) => (item.id === productId || item.slug === productId) ? { ...item, quantity } : item));
  };

  const clearCart = () => saveCart([]);
  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  const getTotals = (): CartTotals => {
    let subtotalExVat = 0;
    let vatTotal = 0;

    for (const item of cart) {
      const quote = item.priceQuote;
      const unitNet = quote ? quote.unitNetExVat : 1000;
      const vatRate = quote ? quote.vatRate : 20;

      const lineNet = unitNet * item.quantity;
      const lineVat = lineNet * (vatRate / 100);

      subtotalExVat += lineNet;
      vatTotal += lineVat;
    }

    return {
      subtotalExVat: Number(subtotalExVat.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      grandTotal: Number((subtotalExVat + vatTotal).toFixed(2)),
      currency,
      itemCount: getCartCount(),
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        currency,
        setCurrency: handleSetCurrency,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart bir CartProvider içinde kullanılmalıdır');
  return context;
}