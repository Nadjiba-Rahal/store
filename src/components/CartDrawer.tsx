'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        aria-label="Fermer le panier"
        className="absolute inset-0 bg-souk-ink/40 backdrop-blur-sm"
        onClick={closeCart}
      />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-souk-paper shadow-xl">
        <div className="flex items-center justify-between border-b border-souk-ink/10 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-souk-ink">
            <ShoppingBag size={18} /> Mon panier
          </h2>
          <button onClick={closeCart} aria-label="Fermer" className="text-souk-ink/60 hover:text-souk-ink">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-lg text-souk-ink/60">Votre panier est vide</p>
              <p className="mt-1 font-body text-sm text-souk-ink/40">
                Ajoutez des produits pour commencer.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.cartKey || item.productId} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-tag bg-souk-papershade">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 font-body text-sm font-semibold text-souk-ink">{item.name}</p>
                    {(item.variant?.color || item.variant?.size) && (
                      <p className="font-mono text-[11px] text-souk-ink/50">
                        {[item.variant?.color, item.variant?.size].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <p className="font-mono text-xs text-souk-ink/50">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-souk-ink/20 text-souk-ink/70 hover:border-souk-night"
                        onClick={() => updateQuantity(item.cartKey || item.productId, item.quantity - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-mono text-xs">{item.quantity}</span>
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-souk-ink/20 text-souk-ink/70 hover:border-souk-night disabled:opacity-40"
                        onClick={() => updateQuantity(item.cartKey || item.productId, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 999)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        className="ml-auto text-souk-stamp/70 hover:text-souk-stamp"
                        onClick={() => removeItem(item.cartKey || item.productId)}
                        aria-label="Retirer du panier"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-souk-ink/10 px-5 py-4">
            <div className="mb-4 flex items-center justify-between font-body text-sm text-souk-ink/70">
              <span>Sous-total</span>
              <span className="font-display text-lg font-bold text-souk-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="mb-3 font-mono text-[11px] text-souk-ink/40">
              Frais de livraison calculés à l&apos;étape suivante.
            </p>
            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full" size="lg">
                Passer la commande
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
