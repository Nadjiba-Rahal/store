import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/models/Order';

const LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-souk-gold/20 text-souk-night',
  confirmed: 'bg-souk-sage/20 text-souk-sage',
  shipped: 'bg-souk-nightlight/15 text-souk-nightlight',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-souk-stamp/10 text-souk-stamp',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium',
        STYLES[status]
      )}
    >
      {LABELS[status]}
    </span>
  );
}
