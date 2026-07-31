import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getStore } from '@/lib/store';
import { ProductGrid } from '@/components/ProductGrid';
import { HeroSection } from '@/components/landing/HeroSection';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  try {
    await connectDB();
    const featured = await Product.find({ isAvailable: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    if (featured.length >= 4) return JSON.parse(JSON.stringify(featured));

    const recent = await Product.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return JSON.parse(JSON.stringify(recent));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, store] = await Promise.all([getFeaturedProducts(), getStore()]);
  const storeName = store?.name || 'Ma Boutique';

  return (
    <div>
      <HeroSection
        storeName={storeName}
        description={store?.description}
        heroImage={store?.heroImage}
        heroTitle={store?.heroTitle}
        heroSubtitle={store?.heroSubtitle}
      />

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-souk-ink">Nos produits</h2>
          <Link href="/products" className="font-mono text-xs uppercase tracking-wider text-souk-stamp hover:underline">
            Tout voir →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}