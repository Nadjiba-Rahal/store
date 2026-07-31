import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/models/Shop';

export const dynamic = 'force-dynamic';

// GET /api/store — public store settings (branding, contact, delivery fees)
export async function GET() {
  await connectDB();
  const store = await Shop.findOne().lean();
  return NextResponse.json({ store: store ?? null });
}

// PATCH /api/store — update store settings (owner-only)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const store = await Shop.findById(session.user.shopId);
  if (!store) return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 });

  const body = await req.json();
  const allowed = [
    'name',
    'description',
    'logo',
    'phone',
    'instagram',
    'facebook',
    'wilayaCode',
    'address',
    'deliveryFeeHome',
    'deliveryFeeDesk',
    'freeDeliveryThreshold',
    'heroImage',
    'heroTitle',
    'heroSubtitle',
  ];
  for (const key of allowed) {
    if (key in body) (store as any)[key] = body[key];
  }
  await store.save();

  return NextResponse.json({ store });
}
