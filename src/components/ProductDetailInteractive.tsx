'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductVariantSelector, type ProductVariantOption } from '@/components/ProductVariantSelector';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

interface ProductDetailInteractiveProps {
  productId: string;
  name: string;
  description: string;
  images: string[];
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  basePrice: number;
  baseStock: number;
  isAvailable: boolean;
  outOfStock: boolean;
  variants: ProductVariantOption[];
  storePhone?: string;
  storeName?: string;
}

export function ProductDetailInteractive({
  productId,
  name,
  description,
  images,
  categoryLabel,
  price,
  originalPrice,
  basePrice,
  baseStock,
  isAvailable,
  outOfStock,
  variants,
  storePhone,
  storeName,
}: ProductDetailInteractiveProps) {
  const [activeImage, setActiveImage] = useState(images?.[0]);
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-lg bg-souk-papershade">
          {activeImage ? (
            <Image src={activeImage} alt={name} width={800} height={800} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">📦</div>
          )}
        </div>
        {images?.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`aspect-square overflow-hidden rounded-tag border bg-souk-papershade ${
                  activeImage === img ? 'border-souk-night' : 'border-transparent'
                }`}
              >
                <Image src={img} alt="" width={200} height={200} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{categoryLabel}</Badge>
          {outOfStock && <Badge className="bg-souk-stamp/10 text-souk-stamp">Rupture de stock</Badge>}
        </div>
        <h1 className="font-display text-3xl font-bold text-souk-ink">{name}</h1>
        <div className="mt-3 flex items-center gap-3">
          <p className="font-display text-2xl font-bold text-souk-stamp">{formatPrice(price)}</p>
          {hasDiscount && (
            <p className="font-mono text-sm text-souk-ink/40 line-through">{formatPrice(originalPrice)}</p>
          )}
        </div>

        <p className="mt-6 whitespace-pre-line font-body text-sm leading-relaxed text-souk-ink/80">{description}</p>

        <div className="mt-8">
          <ProductVariantSelector
            productId={productId}
            name={name}
            basePrice={basePrice}
            baseImage={images?.[0]}
            baseStock={baseStock}
            isAvailable={isAvailable}
            variants={variants}
            onImageChange={(image) => setActiveImage(image || images?.[0])}
          />
        </div>

        {storePhone && (
          <div className="mt-4">
            <WhatsAppButton
              phone={storePhone}
              label="Une question ? Écrivez-nous sur WhatsApp"
              message={`Salam 👋, j'ai une question sur "${name}" (vu sur ${storeName}).`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
