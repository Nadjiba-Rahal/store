'use client';

import { useEffect, useMemo, useState } from 'react';
import { Home, Building2 } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { ALGERIA_WILAYAS, type DeliveryType } from '@/data/wilayas';
import { formatPrice } from '@/lib/utils';

export interface ShippingValue {
  wilaya: string;
  commune: string;
  courier: string;
  deliveryType: DeliveryType;
}

interface CourierOption {
  _id: string;
  name: string;
  logo?: string;
  isActive: boolean;
  rates: { wilayaCode: number; homeFee: number; deskFee: number; isServiced: boolean }[];
}

interface ShippingSelectorProps {
  value: ShippingValue;
  onChange: (value: ShippingValue) => void;
  /** Fallback fees (e.g. the seller's store-wide defaults) used when no
   *  courier has been configured for the selected wilaya. */
  fallbackHomeFee?: number;
  fallbackDeskFee?: number;
  /** Reports the resolved shipping fee back to the parent (checkout) so it
   *  can be added to the order total. */
  onFeeChange?: (fee: number) => void;
}

/**
 * Buyer-facing shipping selector used at checkout: Wilaya -> Commune ->
 * Courier (only active couriers configured by the seller) -> Delivery type
 * (Domicile / Stopdesk), with the cost looked up live for the chosen wilaya.
 */
export function ShippingSelector({
  value,
  onChange,
  fallbackHomeFee = 0,
  fallbackDeskFee = 0,
  onFeeChange,
}: ShippingSelectorProps) {
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(true);

  const selectedWilaya = useMemo(
    () => ALGERIA_WILAYAS.find((wilaya) => wilaya.code === value.wilaya),
    [value.wilaya]
  );

  useEffect(() => {
    fetch('/api/shipping/companies')
      .then((r) => r.json())
      .then((data) => {
        const list: CourierOption[] = data.companies ?? [];
        setCouriers(list);
        if (!value.courier && list.length > 0) {
          onChange({ ...value, courier: list[0].name });
        }
      })
      .finally(() => setLoadingCouriers(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Couriers actually serving the selected wilaya (or all, if wilaya not yet chosen).
  const availableCouriers = useMemo(() => {
    if (!value.wilaya) return couriers;
    return couriers.filter((c) => c.rates.some((r) => r.wilayaCode === Number(value.wilaya) && r.isServiced));
  }, [couriers, value.wilaya]);

  const selectedCourier = useMemo(
    () => couriers.find((c) => c.name === value.courier) || null,
    [couriers, value.courier]
  );
  const rateRow = useMemo(
    () => selectedCourier?.rates.find((r) => r.wilayaCode === Number(value.wilaya)) || null,
    [selectedCourier, value.wilaya]
  );

  const fallback = value.deliveryType === 'domicile' ? fallbackHomeFee : fallbackDeskFee;
  const fee = rateRow && rateRow.isServiced ? (value.deliveryType === 'domicile' ? rateRow.homeFee : rateRow.deskFee) : fallback;

  useEffect(() => {
    onFeeChange?.(fee);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="shipping-wilaya">Wilaya</Label>
          <Select
            id="shipping-wilaya"
            required
            value={value.wilaya}
            onChange={(e) => onChange({ ...value, wilaya: e.target.value, commune: '' })}
          >
            <option value="">Choisir une wilaya</option>
            {ALGERIA_WILAYAS.map((wilaya) => (
              <option key={wilaya.code} value={wilaya.code}>
                {wilaya.code} - {wilaya.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="shipping-commune">Commune</Label>
          <Select
            id="shipping-commune"
            required
            disabled={!selectedWilaya}
            value={value.commune}
            onChange={(e) => onChange({ ...value, commune: e.target.value })}
          >
            <option value="">Choisir une commune</option>
            {selectedWilaya?.communes.map((commune) => (
              <option key={commune} value={commune}>
                {commune}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="shipping-courier">Transporteur</Label>
          <Select
            id="shipping-courier"
            value={value.courier}
            onChange={(e) => onChange({ ...value, courier: e.target.value })}
            disabled={loadingCouriers || availableCouriers.length === 0}
          >
            {availableCouriers.length === 0 && <option value="">Aucun transporteur disponible</option>}
            {availableCouriers.map((courier) => (
              <option key={courier._id} value={courier.name}>
                {courier.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Livraison</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...value, deliveryType: 'domicile' })}
              className={`flex items-center justify-center gap-2 rounded-tag border p-2 text-sm ${
                value.deliveryType === 'domicile' ? 'border-souk-night bg-souk-night/5' : 'border-souk-ink/15'
              }`}
            >
              <Home size={16} /> Domicile
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...value, deliveryType: 'stopdesk' })}
              className={`flex items-center justify-center gap-2 rounded-tag border p-2 text-sm ${
                value.deliveryType === 'stopdesk' ? 'border-souk-night bg-souk-night/5' : 'border-souk-ink/15'
              }`}
            >
              <Building2 size={16} /> Stopdesk
            </button>
          </div>
        </div>
      </div>

      {value.wilaya && value.courier && (
        <p className="font-mono text-xs text-souk-ink/50">
          Frais de livraison : {loadingCouriers ? '...' : formatPrice(fee)}
        </p>
      )}
    </div>
  );
}
