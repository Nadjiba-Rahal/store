'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Printer, X } from 'lucide-react';
import { formatPrice, orderNumber } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import type { OrderStatus } from '@/models/Order';

interface OrderRow {
  _id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  deliveryFee: number;
  deliveryType: 'home' | 'desk';
  courierName?: string;
  paymentMethod: 'cod' | 'chargily';
  paymentStatus: 'pending' | 'paid' | 'failed';
  wilayaCode: string;
  wilayaName?: string;
  commune: string;
  address?: string;
  status: OrderStatus;
  createdAt: string;
  items: { name: string; quantity: number; price: number; variant?: { color?: string; size?: string } }[];
}

const PAYMENT_METHOD_LABELS: Record<OrderRow['paymentMethod'], string> = {
  cod: 'COD',
  chargily: 'Chargily Pay',
};

const PAYMENT_STATUS_STYLES: Record<OrderRow['paymentStatus'], string> = {
  pending: 'bg-souk-gold/20 text-souk-night',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-souk-stamp/10 text-souk-stamp',
};

const PAYMENT_STATUS_LABELS: Record<OrderRow['paymentStatus'], string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
};

function variantLabel(item: OrderRow['items'][number]) {
  return [item.variant?.color, item.variant?.size].filter(Boolean).join(' / ');
}

const STATUSES: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirme' },
  { value: 'shipped', label: 'Expedie' },
  { value: 'delivered', label: 'Livre' },
  { value: 'cancelled', label: 'Annule' },
];

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [status, setStatus] = useState<'' | OrderStatus>('');
  const [loading, setLoading] = useState(true);
  const [printOrder, setPrintOrder] = useState<OrderRow | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = status ? `/api/orders?status=${status}` : '/api/orders';
    fetch(url)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  function exportCsv() {
    const headers = [
      'reference',
      'nom',
      'telephone',
      'wilaya',
      'commune',
      'adresse',
      'type_livraison',
      'transporteur',
      'mode_paiement',
      'statut_paiement',
      'produits',
      'variantes',
      'montant',
      'frais_livraison',
    ];
    const rows = orders.map((order) => [
      orderNumber(order._id),
      order.customerName,
      order.customerPhone,
      order.wilayaName || order.wilayaCode,
      order.commune,
      order.address || '',
      order.deliveryType === 'home' ? 'domicile' : 'stopdesk',
      order.courierName || '',
      PAYMENT_METHOD_LABELS[order.paymentMethod],
      PAYMENT_STATUS_LABELS[order.paymentStatus],
      order.items?.map((item) => `${item.quantity}x ${item.name}`).join(' | ') || '',
      order.items?.map(variantLabel).filter(Boolean).join(' | ') || '',
      order.total,
      order.deliveryFee,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandes-${status || 'toutes'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const paidChargilyRevenue = orders
    .filter((o) => o.paymentMethod === 'chargily' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  const codRevenue = orders
    .filter((o) => o.paymentMethod === 'cod' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const totalNetRevenue = paidChargilyRevenue + codRevenue;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-souk-ink">Commandes</h1>
        <Button type="button" variant="ghost" onClick={exportCsv} disabled={orders.length === 0}>
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-souk-ink/10 bg-white p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-souk-ink/50">Revenu net total</p>
          <p className="mt-1 font-display text-xl font-bold text-souk-ink">{formatPrice(totalNetRevenue)}</p>
        </div>
        <div className="rounded-lg border border-souk-ink/10 bg-white p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-souk-ink/50">Chargily Pay (payé)</p>
          <p className="mt-1 font-display text-xl font-bold text-green-700">{formatPrice(paidChargilyRevenue)}</p>
        </div>
        <div className="rounded-lg border border-souk-ink/10 bg-white p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-souk-ink/50">COD (non annulé)</p>
          <p className="mt-1 font-display text-xl font-bold text-souk-ink">{formatPrice(codRevenue)}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUSES.map((item) => (
          <button
            key={item.value || 'all'}
            type="button"
            onClick={() => setStatus(item.value)}
            className={`rounded-tag border px-3 py-2 font-body text-sm transition ${
              status === item.value
                ? 'border-souk-night bg-souk-night text-white'
                : 'border-souk-ink/15 bg-white text-souk-ink hover:border-souk-night'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-mono text-sm text-souk-ink/50">Chargement...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-souk-ink/20 bg-white/50 py-16 text-center">
          <p className="font-display text-lg text-souk-ink/60">Aucune commande</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-souk-ink/10 bg-white">
          <table className="w-full min-w-[920px] text-left font-body text-sm">
            <thead className="border-b border-souk-ink/10 text-xs uppercase text-souk-ink/50">
              <tr>
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Transporteur</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3">Statut paiement</th>
                <th className="px-4 py-3">Variantes</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const variants = order.items?.map(variantLabel).filter(Boolean).join(', ');
                return (
                  <tr key={order._id} className="border-b border-souk-ink/10 last:border-0 hover:bg-souk-papershade/50">
                    <td className="px-4 py-3 align-top">
                      <Link href={`/dashboard/orders/${order._id}`}>
                        <p className="font-body text-sm font-semibold text-souk-ink">
                          {orderNumber(order._id)} - {order.customerName}
                        </p>
                        <p className="font-mono text-xs text-souk-ink/50">
                          {order.customerPhone} | {order.commune} | {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-xs text-souk-ink/70">
                      {order.courierName || '-'}
                      <div className="text-souk-ink/40">{order.deliveryType === 'home' ? 'Domicile' : 'Stopdesk'}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center rounded-full bg-souk-ink/5 px-2.5 py-0.5 font-mono text-[11px] font-medium text-souk-ink/80">
                        {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
                      >
                        {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-xs text-souk-ink/60">{variants || '-'}</td>
                    <td className="px-4 py-3 align-top font-mono text-sm font-semibold text-souk-ink">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => setPrintOrder(order)}
                        className="rounded-tag border border-souk-ink/15 p-2 text-souk-ink/70 hover:border-souk-night hover:text-souk-ink"
                        aria-label="Imprimer le bordereau"
                      >
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {printOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-souk-ink/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-souk-ink">Bordereau de livraison</h2>
              <button type="button" onClick={() => setPrintOrder(null)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <div id="delivery-slip" className="space-y-3 border border-souk-ink/15 p-4 font-body text-sm text-souk-ink">
              <div className="flex justify-between border-b border-souk-ink/10 pb-2">
                <strong>{orderNumber(printOrder._id)}</strong>
                <span>{printOrder.courierName || 'Transporteur'}</span>
              </div>
              <p><strong>Client:</strong> {printOrder.customerName}</p>
              <p><strong>Telephone:</strong> {printOrder.customerPhone}</p>
              <p><strong>Destination:</strong> {printOrder.commune}, {printOrder.wilayaName || printOrder.wilayaCode}</p>
              <p><strong>Adresse:</strong> {printOrder.address || '-'}</p>
              <p><strong>Livraison:</strong> {printOrder.deliveryType === 'home' ? 'Domicile' : 'Stopdesk'}</p>
              <p><strong>Montant a encaisser:</strong> {formatPrice(printOrder.total)}</p>
              <div>
                <strong>Articles:</strong>
                <ul className="mt-1 list-inside list-disc">
                  {printOrder.items?.map((item, index) => (
                    <li key={index}>{item.quantity}x {item.name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button type="button" className="mt-4 w-full" onClick={() => window.print()}>
              <Printer size={16} />
              Imprimer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}