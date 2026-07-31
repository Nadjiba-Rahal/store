'use client';

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';
import { formatPrice } from '@/lib/utils';

export interface ProductVariantSizeOption {
  size: string;
  stock: number;
  priceOverride?: number;
}

export interface ProductVariantOption {
  colorName: string;
  colorCode?: string;
  image?: string;
  sizes: ProductVariantSizeOption[];
}

interface ProductVariantSelectorProps {
  productId: string;
  name: string;
  basePrice: number;
  baseImage?: string;
  baseStock: number;
  isAvailable: boolean;
  variants: ProductVariantOption[];
  /** Called whenever the selected color changes, so the parent gallery can
   *  swap the main displayed image to that color's photo. */
  onImageChange?: (image: string | undefined) => void;
}

export function ProductVariantSelector({
  productId,
  name,
  basePrice,
  baseImage,
  baseStock,
  isAvailable,
  variants,
  onImageChange,
}: ProductVariantSelectorProps) {
  const { addItem } = useCart();
  const hasVariants = variants.length > 0;
  const [selectedColor, setSelectedColor] = useState(hasVariants ? variants[0].colorName : '');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.colorName === selectedColor) || null,
    [variants, selectedColor]
  );

  const sizesForColor = selectedVariant?.sizes ?? [];

  useEffect(() => {
    onImageChange?.(selectedVariant?.image || baseImage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant]);

  // Reset size when color changes since sizes are color-specific.
  useEffect(() => {
    setSelectedSize('');
    setQty(1);
  }, [selectedColor]);

  const selectedSizeOption = sizesForColor.find((s) => s.size === selectedSize) || null;

  const requiresColor = hasVariants && !selectedColor;
  const requiresSize = hasVariants && sizesForColor.length > 0 && !selectedSize;
  const stock = hasVariants ? selectedSizeOption?.stock ?? 0 : baseStock;
  const price = selectedSizeOption?.priceOverride ?? basePrice;
  const outOfStock = !isAvailable || requiresColor || requiresSize || stock <= 0;

  function handleAdd() {
    const image = selectedVariant?.image || baseImage;
    addItem(
      {
        productId,
        cartKey: `${productId}:${selectedColor}:${selectedSize}`,
        name,
        price,
        image,
        stock,
        variant: {
          color: selectedColor,
          size: selectedSize,
        },
      },
      qty
    );
    toast.success('Ajoute au panier');
  }

  return (
    <div className="space-y-5">
      {hasVariants && (
        <div>
          <p className="mb-2 font-body text-sm font-semibold text-souk-ink">
            Couleur{selectedColor ? ` : ${selectedColor}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const variantStock = variant.sizes.reduce((s, sz) => s + (sz.stock || 0), 0);
              const disabled = variantStock <= 0;
              const active = selectedColor === variant.colorName;
              return (
                <button
                  key={variant.colorName}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedColor(variant.colorName)}
                  title={variant.colorName}
                  className={`relative h-12 w-12 overflow-hidden rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-35 ${
                    active ? 'border-souk-night' : 'border-souk-ink/15 hover:border-souk-ink/40'
                  }`}
                  style={!variant.image ? { backgroundColor: variant.colorCode || '#ccc' } : undefined}
                >
                  {variant.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={variant.image} alt={variant.colorName} className="h-full w-full object-cover" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasVariants && sizesForColor.length > 0 && (
        <div>
          <p className="mb-2 font-body text-sm font-semibold text-souk-ink">Taille</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((sz) => (
              <button
                key={sz.size}
                type="button"
                disabled={sz.stock <= 0}
                onClick={() => setSelectedSize(sz.size)}
                className={`h-10 min-w-12 rounded-tag border px-3 font-mono text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${
                  selectedSize === sz.size
                    ? 'border-souk-night bg-souk-night text-white'
                    : 'border-souk-ink/15 bg-white text-souk-ink hover:border-souk-night'
                }`}
              >
                {sz.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-tag border border-souk-ink/10 bg-white p-3 font-body text-sm text-souk-ink/75">
        <span className="font-semibold text-souk-ink">{formatPrice(price)}</span>
        <span className="mx-2 text-souk-ink/30">|</span>
        {requiresColor
          ? 'Choisissez une couleur'
          : requiresSize
            ? 'Choisissez une taille'
            : stock > 0
              ? `${stock} en stock`
              : 'Rupture de stock'}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-tag border border-souk-ink/15">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-souk-ink/70 hover:text-souk-ink disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock}
            aria-label="Diminuer la quantite"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-mono text-sm">{qty}</span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-souk-ink/70 hover:text-souk-ink disabled:opacity-40"
            onClick={() => setQty((q) => Math.min(stock || 999, q + 1))}
            disabled={outOfStock}
            aria-label="Augmenter la quantite"
          >
            <Plus size={16} />
          </button>
        </div>
        <Button type="button" size="lg" className="flex-1" disabled={outOfStock} onClick={handleAdd}>
          <ShoppingBag size={18} />
          {stock <= 0 && !requiresColor && !requiresSize ? 'Rupture de stock' : 'Ajouter au panier'}
        </Button>
      </div>
    </div>
  );
}
