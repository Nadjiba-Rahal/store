import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { createChargilyCheckout } from '@/lib/chargily';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const orderId = body.orderId;

  if (!orderId) {
    return NextResponse.json({ error: 'Commande manquante.' }, { status: 400 });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
  }

  const origin = new URL(req.url).origin;
  const checkout = await createChargilyCheckout({
    amount: order.total,
    successUrl: `${origin}/order-confirmation/${order._id}?payment=success`,
    failureUrl: `${origin}/checkout?payment=failed`,
    webhookEndpoint: `${origin}/api/webhooks/chargily`,
    metadata: {
      orderId: String(order._id),
      customerPhone: order.customerPhone,
    },
  });

  order.paymentMethod = 'chargily';
  order.paymentStatus = 'pending';
  order.chargilyCheckoutId = checkout.id;
  await order.save();

  return NextResponse.json({ checkoutUrl: checkout.checkoutUrl, checkoutId: checkout.id });
}
