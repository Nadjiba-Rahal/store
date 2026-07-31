import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { ProductGrid } from '@/components/ProductGrid';
import { Filters } from '@/components/Filters';

export const dynamic = 'force-dynamic';

async function getProducts(searchParams: { [key: string]: string | undefined }) {
  await connectDB();
  const filter: Record<string, unknown> = { isAvailable: true };
  if (searchParams.category) filter.category = searchParams.category;
  if (searchParams.q) filter.$text = { $search: searchParams.q };

  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100).lean();

  return JSON.parse(JSON.stringify(products));
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const products = await getProducts(searchParams);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold text-souk-ink">Tous les produits</h1>
      <div className="mb-6">
        <Filters />
      </div>
      <p className="mb-4 font-mono text-xs text-souk-ink/50">
        {products.length} produit{products.length !== 1 ? 's' : ''}
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
