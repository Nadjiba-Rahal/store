import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

// GET /api/orders/:id — used by the customer-facing confirmation page.
// The Mongo ObjectId itself acts as the access token (it's only ever
// shared with the customer who just placed the order).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  let order;
  try {
    order = await Order.findById(params.id).lean();
  } catch {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
  }
  if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
  return NextResponse.json({ order });
}

// PATCH /api/orders/:id — owner-only status update
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });

  const body = await req.json();
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (body.status && validStatuses.includes(body.status)) {
    order.status = body.status;
    await order.save();
  }

  return NextResponse.json({ order });
}
