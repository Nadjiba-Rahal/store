import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { Card } from '@/components/ui/Card';
import { formatPrice, orderNumber } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Package, Clock, TrendingUp, ClipboardList } from 'lucide-react';

async function getStats() {
  await connectDB();
  const [productCount, pendingOrders, recentOrders, deliveredOrders] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(),
    Order.find({ status: 'delivered' }).lean(),
  ]);
  const revenue = deliveredOrders.reduce((sum, o: any) => sum + o.total, 0);
  return {
    productCount,
    pendingOrders,
    revenue,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
  };
}

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  const cards = [
    { label: 'Commandes en attente', value: stats.pendingOrders, icon: Clock },
    { label: 'Produits publiés', value: stats.productCount, icon: Package },
    { label: 'Revenu livré', value: formatPrice(stats.revenue), icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-souk-ink">
        Salam, {session?.user.name?.split(' ')[0]} 👋
      </h1>
      <p className="mb-6 font-body text-sm text-souk-ink/60">Voici comment se porte votre boutique.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <Icon size={20} className="text-souk-stamp" />
            <p className="mt-3 font-display text-2xl font-bold text-souk-ink">{value}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-souk-ink/50">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-souk-ink">Dernières commandes</h2>
          <Link href="/dashboard/orders" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-souk-stamp hover:underline">
            <ClipboardList size={13} /> Tout voir
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="font-mono text-sm text-souk-ink/50">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-souk-ink/10 bg-white">
            {stats.recentOrders.map((o: any) => (
              <Link
                key={o._id}
                href={`/dashboard/orders/${o._id}`}
                className="flex items-center justify-between gap-4 border-b border-souk-ink/10 p-4 last:border-0 hover:bg-souk-papershade/50"
              >
                <div>
                  <p className="font-body text-sm font-semibold text-souk-ink">
                    {orderNumber(o._id)} — {o.customerName}
                  </p>
                  <p className="font-mono text-xs text-souk-ink/50">{formatPrice(o.total)}</p>
                </div>
                <OrderStatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
