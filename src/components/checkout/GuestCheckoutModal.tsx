'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, HandCoins } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/components/CartProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ShippingSelector } from '@/components/checkout/ShippingSelector';
import type { DeliveryType } from '@/data/wilayas';
import { formatPrice } from '@/lib/utils';
import type { StoreSettings } from '@/lib/store';

type PaymentMethod = 'cod' | 'chargily';

const PHONE_REGEX = /^(05|06|07)[0-9]{8}$/;
const GUEST_STORAGE_KEY = 'sela_guest_checkout_v1';

export function GuestCheckoutModal() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    deliveryType: 'domicile' as DeliveryType,
    courier: '',
    address: '',
    note: '',
    paymentMethod: 'cod' as PaymentMethod,
  });

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => setStore(data.store))
      .catch(() => setStore(null));

    try {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      if (raw) setForm((current) => ({ ...current, ...JSON.parse(raw) }));
    } catch {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({ ...form, cartItems: items }));
  }, [form, items]);

  const freeThreshold = store?.freeDeliveryThreshold || 0;
  const effectiveFee = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : shippingFee;
  const total = subtotal + effectiveFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phone = form.phone.replace(/\s/g, '');

    if (!PHONE_REGEX.test(phone)) {
      toast.error('Telephone invalide. Exemple: 0555555555');
      return;
    }
    if (items.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
            variant: item.variant,
          })),
          customerName: form.fullName,
          customerPhone: phone,
          wilayaCode: form.wilaya,
          commune: form.commune,
          address: form.address,
          note: form.note,
          deliveryType: form.deliveryType === 'domicile' ? 'home' : 'desk',
          courierName: form.courier,
          paymentMethod: form.paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Echec de la commande.');

      if (form.paymentMethod === 'chargily') {
        const paymentRes = await fetch('/api/payments/chargily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.order._id }),
        });
        const paymentData = await paymentRes.json();
        if (!paymentRes.ok) throw new Error(paymentData.error || 'Echec du paiement Chargily.');
        clearCart();
        window.location.href = paymentData.checkoutUrl;
        return;
      }

      clearCart();
      localStorage.removeItem(GUEST_STORAGE_KEY);
      router.push(`/order-confirmation/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-souk-ink">Votre panier est vide</h1>
        <p className="mt-2 font-body text-sm text-souk-ink/60">Ajoutez des produits avant de commander.</p>
        <Link href="/products" className="mt-6 inline-block">
          <Button>Parcourir les produits</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold text-souk-ink">Checkout invite</h1>
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Telephone</Label>
              <Input id="phone" required placeholder="0555555555" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <ShippingSelector
            value={{ wilaya: form.wilaya, commune: form.commune, courier: form.courier, deliveryType: form.deliveryType }}
            onChange={(shipping) => setForm({ ...form, ...shipping })}
            fallbackHomeFee={store?.deliveryFeeHome || 0}
            fallbackDeskFee={store?.deliveryFeeDesk || 0}
            onFeeChange={setShippingFee}
          />

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="note">Remarque</Label>
            <Textarea id="note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>

          <div>
            <Label>Paiement</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setForm({ ...form, paymentMethod: 'cod' })} className={`flex items-center gap-3 rounded-tag border p-4 text-left ${form.paymentMethod === 'cod' ? 'border-souk-night bg-souk-night/5' : 'border-souk-ink/15'}`}>
                <HandCoins size={20} className="text-souk-stamp" />
                <span className="font-body text-sm font-semibold text-souk-ink">Cash on Delivery</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, paymentMethod: 'chargily' })} className={`flex items-center gap-3 rounded-tag border p-4 text-left ${form.paymentMethod === 'chargily' ? 'border-souk-night bg-souk-night/5' : 'border-souk-ink/15'}`}>
                <CreditCard size={20} className="text-souk-stamp" />
                <span className="font-body text-sm font-semibold text-souk-ink">Chargily Pay</span>
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Envoi...' : `Confirmer - ${formatPrice(total)}`}
          </Button>
        </form>

        <div className="h-fit rounded-lg border border-souk-ink/10 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-souk-ink">Recapitulatif</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.cartKey || item.productId} className="flex gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-tag bg-souk-papershade">
                  {item.image && <Image src={item.image} alt="" width={48} height={48} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 font-body text-sm font-medium text-souk-ink">{item.name}</p>
                  <p className="font-mono text-xs text-souk-ink/50">
                    {item.quantity} x {formatPrice(item.price)}
                    {(item.variant?.color || item.variant?.size) && ` - ${[item.variant?.color, item.variant?.size].filter(Boolean).join(' / ')}`}
                  </p>
                </div>
                <p className="font-mono text-sm text-souk-ink">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-souk-ink/10 pt-4 font-body text-sm">
            <div className="flex justify-between text-souk-ink/70">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-souk-ink/70">
              <span>Livraison</span>
              <span>{effectiveFee === 0 ? 'Gratuite' : formatPrice(effectiveFee)}</span>
            </div>
            <div className="flex justify-between border-t border-souk-ink/10 pt-2 font-display text-base font-bold text-souk-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}