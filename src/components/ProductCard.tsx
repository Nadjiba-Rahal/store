import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export interface ProductCardData {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  isAvailable?: boolean;
  stock?: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images?.[0];
  const outOfStock = product.isAvailable === false || product.stock === 0;
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / (product.originalPrice as number)) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group block overflow-hidden rounded-lg border border-souk-ink/10 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-souk-papershade">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-souk-ink/20">
            📦
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-souk-stamp px-2 py-0.5 font-mono text-[10px] font-bold text-white">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-souk-ink/50">
            <span className="rounded-full bg-white px-3 py-1 font-mono text-[11px] font-semibold text-souk-ink">
              Rupture de stock
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate font-body text-sm font-semibold text-souk-ink">{product.name}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="font-display text-base font-bold text-souk-stamp">{formatPrice(product.price)}</p>
          {hasDiscount && (
            <p className="font-mono text-xs text-souk-ink/40 line-through">
              {formatPrice(product.originalPrice as number)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
