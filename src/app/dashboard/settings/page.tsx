'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUploader } from '@/components/ImageUploader';
import { WILAYAS } from '@/constants/wilayas';

export default function StoreSettingsPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    instagram: '',
    facebook: '',
    wilayaCode: '',
    address: '',
    deliveryFeeHome: '600',
    deliveryFeeDesk: '400',
    freeDeliveryThreshold: '0',
    heroTitle: '',
    heroSubtitle: '',
  });
  const [logo, setLogo] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.store) {
          const s = data.store;
          setForm({
            name: s.name ?? '',
            description: s.description ?? '',
            phone: s.phone ?? '',
            instagram: s.instagram ?? '',
            facebook: s.facebook ?? '',
            wilayaCode: s.wilayaCode ?? '',
            address: s.address ?? '',
            deliveryFeeHome: String(s.deliveryFeeHome ?? 600),
            deliveryFeeDesk: String(s.deliveryFeeDesk ?? 400),
            freeDeliveryThreshold: String(s.freeDeliveryThreshold ?? 0),
            heroTitle: s.heroTitle ?? '',
            heroSubtitle: s.heroSubtitle ?? '',
          });
          if (s.logo) setLogo([s.logo]);
          if (s.heroImage) setHeroImage([s.heroImage]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          logo: logo[0] ?? '',
          heroImage: heroImage[0] ?? '',
          deliveryFeeHome: Number(form.deliveryFeeHome),
          deliveryFeeDesk: Number(form.deliveryFeeDesk),
          freeDeliveryThreshold: Number(form.freeDeliveryThreshold),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Boutique mise à jour.');
    } catch {
      toast.error('Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-mono text-sm text-souk-ink/50">Chargement...</p>;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-souk-ink">Paramètres de la boutique</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <Label>Logo</Label>
          <ImageUploader images={logo} onChange={setLogo} max={1} />
        </div>
        <div>
          <Label htmlFor="name">Nom de la boutique</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Numéro WhatsApp</Label>
          <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="instagram">Instagram (optionnel)</Label>
            <Input id="instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="facebook">Facebook (optionnel)</Label>
            <Input id="facebook" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="wilaya">Wilaya (origine des envois)</Label>
          <Select
            id="wilaya"
            required
            value={form.wilayaCode}
            onChange={(e) => setForm({ ...form, wilayaCode: e.target.value })}
          >
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} — {w.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="address">Adresse (optionnel)</Label>
          <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <hr className="border-souk-ink/10" />
        <p className="font-mono text-[11px] uppercase tracking-wider text-souk-ink/50">Frais de livraison</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveryFeeHome">À domicile (DA)</Label>
            <Input
              id="deliveryFeeHome"
              type="number"
              min={0}
              value={form.deliveryFeeHome}
              onChange={(e) => setForm({ ...form, deliveryFeeHome: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="deliveryFeeDesk">Bureau / stop desk (DA)</Label>
            <Input
              id="deliveryFeeDesk"
              type="number"
              min={0}
              value={form.deliveryFeeDesk}
              onChange={(e) => setForm({ ...form, deliveryFeeDesk: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="freeDeliveryThreshold">Livraison gratuite dès (DA, 0 = désactivé)</Label>
          <Input
            id="freeDeliveryThreshold"
            type="number"
            min={0}
            value={form.freeDeliveryThreshold}
            onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })}
          />
        </div>

        <hr className="border-souk-ink/10" />
        <p className="font-mono text-[11px] uppercase tracking-wider text-souk-ink/50">Bannière d&apos;accueil</p>
        <div>
          <Label>Image de la bannière (pleine largeur)</Label>
          <ImageUploader images={heroImage} onChange={setHeroImage} max={1} />
        </div>
        <div>
          <Label htmlFor="heroTitle">Titre de la bannière (optionnel, remplace le nom de la boutique)</Label>
          <Input
            id="heroTitle"
            placeholder={form.name || 'Ma Boutique'}
            value={form.heroTitle}
            onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="heroSubtitle">Sous-titre de la bannière (optionnel)</Label>
          <Textarea
            id="heroSubtitle"
            rows={2}
            value={form.heroSubtitle}
            onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </form>
    </div>
  );
}
