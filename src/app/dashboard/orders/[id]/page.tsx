'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatPrice, orderNumber } from '@/lib/utils';
import { wilayaLabel } from '@/constants/wilayas';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ArrowLeft } from 'lucide-react';
import type { OrderStatus } from '@/models/Order';

interface OrderDetail {
  _id: string;
  items: { name: string; price: number; quantity: number; image?: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: 'home' | 'desk';
  customerName: string;
  customerPhone: string;
  wilayaCode: string;
  commune: string;
  address?: string;
  note?: string;
  status: OrderStatus;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<OrderStatus>('pending');

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setStatus(data.order.status);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('Statut mis à jour.');
      router.refresh();
    } catch {
      toast.error('Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-mono text-sm text-souk-ink/50">Chargement...</p>;
  if (!order) return <p className="font-mono text-sm text-souk-ink/50">Commande introuvable.</p>;

  return (
    <div>
      <button
        onClick={() => router.push('/dashboard/orders')}
        className="mb-4 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-souk-ink/60 hover:text-souk-ink"
      >
        <ArrowLeft size={14} /> Retour aux commandes
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-souk-ink">{orderNumber(order._id)}</h1>
          <p className="font-mono text-xs text-souk-ink/50">
            {new Date(order.createdAt).toLocaleString('fr-DZ')}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-souk-ink/10 bg-white p-5">
            <h2 className="mb-4 font-display text-base font-bold text-souk-ink">Articles</h2>
            <ul className="space-y-3">
              {order.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-tag bg-souk-papershade">
                    {item.image && (
                      <Image src={item.image} alt="" width={48} height={48} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm font-medium text-souk-ink">{item.name}</p>
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
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-souk-ink/10 pt-2 font-display text-base font-bold text-souk-ink">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-souk-ink/10 bg-white p-5">
            <h2 className="mb-3 font-display text-base font-bold text-souk-ink">Client</h2>
            <p className="font-body text-sm text-souk-ink/80">
              {order.customerName} · {order.customerPhone}
            </p>
            <p className="font-body text-sm text-souk-ink/80">
              {order.commune}, {wilayaLabel(order.wilayaCode)}
            </p>
            {order.address && <p className="font-body text-sm text-souk-ink/80">{order.address}</p>}
            {order.note && (
              <p className="mt-2 rounded-tag bg-souk-gold/10 p-3 font-body text-sm text-souk-ink/80">
                {order.note}
              </p>
            )}
          </div>
        </div>

        <div className="h-fit rounded-lg border border-souk-ink/10 bg-white p-5">
          <h2 className="mb-3 font-display text-base font-bold text-souk-ink">Statut de la commande</h2>
          <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </Select>
          <Button className="mt-3 w-full" onClick={handleSave} disabled={saving || status === order.status}>
            {saving ? 'Enregistrement...' : 'Mettre à jour'}
          </Button>
        </div>
      </div>
    </div>
  );
}
