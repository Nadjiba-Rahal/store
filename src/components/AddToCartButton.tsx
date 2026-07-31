'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/components/CartProvider';
import { Button } from '@/components/ui/Button';

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  stock,
}: {
  productId: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const outOfStock = stock <= 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-tag border border-souk-ink/15">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-souk-ink/70 hover:text-souk-ink disabled:opacity-40"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
          aria-label="Diminuer la quantité"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-mono text-sm">{qty}</span>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-souk-ink/70 hover:text-souk-ink disabled:opacity-40"
          onClick={() => setQty((q) => Math.min(stock || 999, q + 1))}
          disabled={outOfStock}
          aria-label="Augmenter la quantité"
        >
          <Plus size={16} />
        </button>
      </div>
      <Button
        type="button"
        size="lg"
        className="flex-1"
        disabled={outOfStock}
        onClick={() => {
          addItem({ productId, name, price, image, stock }, qty);
          toast.success('Ajouté au panier');
        }}
      >
        <ShoppingBag size={18} />
        {outOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
      </Button>
    </div>
  );
}
