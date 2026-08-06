'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find(
        (ci) => ci.menu_item.id === item.menu_item.id
      );

      if (existing) {
        return current.map((ci) =>
          ci.menu_item.id === item.menu_item.id
            ? { ...ci, quantity: ci.quantity + item.quantity }
            : ci
        );
      }

      return [...current, item];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((current) =>
      current.filter((ci) => ci.menu_item.id !== itemId)
    );
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((current) =>
      current.map((ci) =>
        ci.menu_item.id === itemId ? { ...ci, quantity } : ci
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce(
      (sum, item) => sum + item.menu_item.price_xaf * item.quantity,
      0
    );
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
