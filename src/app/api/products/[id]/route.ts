import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  let product;
  try {
    product = await Product.findByIdAndUpdate(params.id, { $inc: { views: 1 } }, { new: true });
  } catch {
    return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
  }
  if (!product) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const product = await Product.findById(params.id);
  if (!product) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });

  const body = await req.json();
  const allowed = [
    'name',
    'description',
    'price',
    'originalPrice',
    'category',
    'images',
    'stock',
    'variants',
    'specs',
    'isAvailable',
    'featured',
  ];
  for (const key of allowed) {
    if (key in body) (product as any)[key] = body[key];
  }
  await product.save();

  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const product = await Product.findById(params.id);
  if (!product) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });

  await product.deleteOne();
  return NextResponse.json({ success: true });
}
