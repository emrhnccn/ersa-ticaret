'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  slug: string;
  title: string;
  code: string;
  image: string;
  brand: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Tarayıcı hafızasından (LocalStorage) sepeti geri yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('ersa_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Sepet her değiştiğinde LocalStorage'a kaydet
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('ersa_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: any) => {
    const existingIndex = cart.findIndex((item) => item.slug === product.slug);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      saveCart(newCart);
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (slug: string) => {
    saveCart(cart.filter((item) => item.slug !== slug));
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(slug);
      return;
    }
    saveCart(cart.map((item) => item.slug === slug ? { ...item, quantity } : item));
  };

  const clearCart = () => saveCart([]);
  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart bir CartProvider içinde kullanılmalıdır');
  return context;
}