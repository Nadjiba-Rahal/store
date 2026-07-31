import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ShippingCompany from '@/models/ShippingCompany';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const company = await ShippingCompany.findById(params.id);
  if (!company) return NextResponse.json({ error: 'Transporteur introuvable.' }, { status: 404 });

  const body = await req.json();
  const allowed = ['name', 'logo', 'isActive', 'rates'];
  for (const key of allowed) {
    if (key in body) (company as any)[key] = body[key];
  }
  await company.save();

  return NextResponse.json({ company });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const company = await ShippingCompany.findById(params.id);
  if (!company) return NextResponse.json({ error: 'Transporteur introuvable.' }, { status: 404 });

  await company.deleteOne();
  return NextResponse.json({ success: true });
}
