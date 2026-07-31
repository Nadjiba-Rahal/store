import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product, { totalVariantStock } from '@/models/Product';
import { getStore } from '@/lib/store';
import { categoryLabel } from '@/constants/categories';
import { ProductDetailInteractive } from '@/components/ProductDetailInteractive';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
  await connectDB();
  let product;
  try {
    product = await Product.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean();
  } catch {
    return null;
  }
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, store] = await Promise.all([getProduct(params.id), getStore()]);
  if (!product) notFound();

  const variants = product.variants ?? [];
  const effectiveStock = variants.length ? totalVariantStock(variants) : product.stock;
  const outOfStock = !product.isAvailable || effectiveStock === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <ProductDetailInteractive
        productId={product._id}
        name={product.name}
        description={product.description}
        images={product.images ?? []}
        categoryLabel={categoryLabel(product.category)}
        price={product.price}
        originalPrice={product.originalPrice}
        basePrice={product.price}
        baseStock={outOfStock ? 0 : product.stock}
        isAvailable={product.isAvailable}
        outOfStock={outOfStock}
        variants={variants}
        storePhone={store?.phone}
        storeName={store?.name}
      />
    </div>
  );
}
