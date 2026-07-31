import { ProductCard, type ProductCardData } from '@/components/ProductCard';

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-souk-ink/20 bg-white/50 py-16 text-center">
        <p className="font-display text-lg text-souk-ink/60">Aucun produit trouvé</p>
        <p className="mt-1 font-body text-sm text-souk-ink/40">Essayez une autre catégorie ou recherche.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
