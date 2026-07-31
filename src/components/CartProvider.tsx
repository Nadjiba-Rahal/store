'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CartDrawer } from '@/components/CartDrawer';

export interface CartItem {
  productId: string;
  cartKey?: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  quantity: number;
  variant?: {
    color?: string;
    size?: string;
  };
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'sela_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after initial hydration to avoid wiping storage).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    setItems((prev) => {
      const cartKey = item.cartKey || `${item.productId}:${item.variant?.color || ''}:${item.variant?.size || ''}`;
      const normalizedItem = { ...item, cartKey };
      const existing = prev.find((i) => (i.cartKey || i.productId) === cartKey);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, existing.stock || 999);
        return prev.map((i) =>
          (i.cartKey || i.productId) === cartKey ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, { ...normalizedItem, quantity: Math.max(1, quantity) }];
    });
    setIsOpen(true);
  }

  function updateQuantity(cartKey: string, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => (i.cartKey || i.productId) !== cartKey)
        : prev.map((i) => ((i.cartKey || i.productId) === cartKey ? { ...i, quantity } : i))
    );
  }

  function removeItem(cartKey: string) {
    setItems((prev) => prev.filter((i) => (i.cartKey || i.productId) !== cartKey));
  }

  function clearCart() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, count, subtotal, isOpen]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
