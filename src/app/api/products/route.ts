import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Shop from '@/models/Shop';

export const dynamic = 'force-dynamic';

// GET /api/products?category=fashion&q=robe&all=1
// `all=1` (owner-only) also returns hidden/unavailable products for the dashboard.
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const featured = searchParams.get('featured');
  const wantsAll = searchParams.get('all') === '1';

  const filter: Record<string, unknown> = {};

  if (wantsAll) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopId) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }
  } else {
    filter.isAvailable = true;
  }

  if (category) filter.category = category;
  if (featured) filter.featured = true;
  if (q) filter.$text = { $search: q };

  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100).lean();

  return NextResponse.json({ products });
}

// POST /api/products — create a product (owner-only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const { name, description, price, originalPrice, category, images, stock, featured, variants, specs } = body;

  if (!name || !description || !price || !category) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  }

  const shop = await Shop.findById(session.user.shopId);
  if (!shop) return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 });

  const product = await Product.create({
    shop: shop._id,
    name,
    description,
    price,
    originalPrice: originalPrice || undefined,
    category,
    images: images ?? [],
    stock: stock ?? 999,
    variants: Array.isArray(variants) ? variants : [],
    specs: specs ?? {},
    featured: !!featured,
  });

  return NextResponse.json({ product }, { status: 201 });
}
