import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyChargilyWebhook } from '@/lib/chargily';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('signature') || req.headers.get('x-chargily-signature');

    // Débogage dans votre terminal Vercel / Node
    console.log('[Webhook Chargily Received]:', rawBody);

    const verified = await verifyChargilyWebhook(rawBody, signature);
    if (!verified) {
      console.warn('[Webhook Chargily]: Signature invalide.');
      return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    
    // Chargily V2 payload structure check
    const checkout = event.data || event;
    const eventType = event.type || checkout.status;
    const paymentStatus = checkout.payment_status || checkout.status;
    const orderId = checkout.metadata?.orderId || checkout.metadata?.order_id;

    if (!orderId) {
      console.warn('[Webhook Chargily]: orderId introuvable dans les métadonnées.');
      return NextResponse.json({ received: true });
    }

    await connectDB();
    const order = await Order.findById(orderId);

    if (!order) {
      console.warn(`[Webhook Chargily]: Commande ${orderId} introuvable.`);
      return NextResponse.json({ received: true });
    }

    // Conditions de succès Chargily V1 et V2
    const isPaid = 
      eventType === 'checkout.paid' || 
      eventType === 'invoice.paid' ||
      paymentStatus === 'paid' || 
      paymentStatus === 'completed';

    const isFailed = 
      eventType === 'checkout.failed' || 
      eventType === 'checkout.expired' || 
      paymentStatus === 'failed' || 
      paymentStatus === 'canceled';

    if (isPaid) {
      // ✅ Mise à jour DUS PAIEMENT ET DE LA COMMANDE
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paidAt = new Date();
      console.log(`[Chargily OK]: Commande ${orderId} marquée comme PAYÉE et CONFIRMÉE.`);
    } else if (isFailed) {
      order.paymentStatus = 'failed';
      if (order.status === 'pending') {
        order.status = 'cancelled';
      }
      console.log(`[Chargily Failed]: Commande ${orderId} échec de paiement.`);
    }

    if (checkout.id) {
      order.chargilyCheckoutId = checkout.id;
    }

    await order.save();
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Erreur Webhook Chargily]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour.' },
      { status: 500 }
    );
  }
}