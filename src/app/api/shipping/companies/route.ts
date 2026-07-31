import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ShippingCompany, { buildEmptyRateTable } from '@/models/ShippingCompany';

export const dynamic = 'force-dynamic';

// GET /api/shipping/companies            -> active couriers only (buyer checkout)
// GET /api/shipping/companies?all=1      -> all couriers, owner-only (settings page)
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const wantsAll = searchParams.get('all') === '1';

  const filter: Record<string, unknown> = {};
  if (wantsAll) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopId) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }
  } else {
    filter.isActive = true;
  }

  const companies = await ShippingCompany.find(filter).sort({ name: 1 }).lean();
  return NextResponse.json({ companies });
}

// POST /api/shipping/companies — add a new courier (owner-only), unlimited allowed
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const { name, logo } = body;
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: 'Nom du transporteur requis.' }, { status: 400 });
  }

  const existing = await ShippingCompany.findOne({ name: String(name).trim() });
  if (existing) {
    return NextResponse.json({ error: 'Ce transporteur existe déjà.' }, { status: 409 });
  }

  const company = await ShippingCompany.create({
    name: String(name).trim(),
    logo: logo || '',
    isActive: true,
    rates: buildEmptyRateTable(),
  });

  return NextResponse.json({ company }, { status: 201 });
}
