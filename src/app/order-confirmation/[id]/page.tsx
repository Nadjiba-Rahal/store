import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getStore } from '@/lib/store';
import { formatPrice, orderNumber, buildWhatsAppLink } from '@/lib/utils';
import { wilayaLabel } from '@/constants/wilayas';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getOrder(id: string) {
  await connectDB();
  try {
    const order = await Order.findById(id).lean();
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, store] = await Promise.all([getOrder(params.id), getStore()]);
  if (!order) notFound();

  const waMessage = `Salam 👋, je viens de passer la commande ${orderNumber(order._id)} sur ${
    store?.name ?? 'votre boutique'
  }. Pouvez-vous confirmer ma commande ?`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center">
        <CheckCircle2 size={48} className="mx-auto text-souk-sage" />
        <h1 className="mt-4 font-display text-2xl font-bold text-souk-ink">Commande confirmée !</h1>
        <p className="mt-1 font-body text-sm text-souk-ink/60">
          Commande {orderNumber(order._id)} — nous vous contacterons bientôt pour organiser la livraison.
        </p>
        <div className="mt-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="rounded-lg border border-souk-ink/10 bg-white p-5">
        <ul className="space-y-3">
          {order.items.map((item: any, i: number) => (
            <li key={i} className="flex gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-tag bg-souk-papershade">
                {item.image && (
                  <Image src={item.image} alt="" width={48} height={48} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="line-clamp-1 font-body text-sm font-medium text-souk-ink">{item.name}</p>
                <p className="font-mono text-xs text-souk-ink/50">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="font-mono text-sm text-souk-ink">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-souk-ink/10 pt-4 font-body text-sm">
          <div className="flex justify-between text-souk-ink/70">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-souk-ink/70">
            <span>Livraison ({order.deliveryType === 'home' ? 'domicile' : 'bureau'})</span>
            <span>{order.deliveryFee === 0 ? 'Gratuite' : formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-souk-ink/10 pt-2 font-display text-base font-bold text-souk-ink">
            <span>Total à payer à la livraison</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-souk-ink/10 bg-white p-5 font-body text-sm text-souk-ink/80">
        <p className="font-semibold text-souk-ink">Livraison à</p>
        <p className="mt-1">
          {order.customerName} · {order.customerPhone}
        </p>
        <p>
          {order.commune}, {wilayaLabel(order.wilayaCode)}
        </p>
        {order.address && <p>{order.address}</p>}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/products" className="flex-1">
          <Button variant="ghost" className="w-full">
            Continuer mes achats
          </Button>
        </Link>
        {store?.phone && (
          <a
            href={buildWhatsAppLink(store.phone, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="stamp" className="w-full">
              <MessageCircle size={16} /> Confirmer sur WhatsApp
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
