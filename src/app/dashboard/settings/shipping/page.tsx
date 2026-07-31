'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface RateRow {
  wilayaCode: number;
  wilayaName: string;
  homeFee: number;
  deskFee: number;
  isServiced: boolean;
}

interface Company {
  _id: string;
  name: string;
  logo?: string;
  isActive: boolean;
  rates: RateRow[];
}

export default function ShippingSettingsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    fetch('/api/shipping/companies?all=1')
      .then((r) => r.json())
      .then((data) => {
        const list: Company[] = data.companies ?? [];
        setCompanies(list);
        setActiveId((prev) => prev ?? list[0]?._id ?? null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const active = companies.find((c) => c._id === activeId) || null;

  async function addCompany() {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/shipping/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewName('');
      toast.success('Transporteur ajouté.');
      load();
      setActiveId(data.company._id);
    } catch (err: any) {
      toast.error(err.message || "Échec de l'ajout.");
    }
  }

  async function deleteCompany(id: string) {
    if (!confirm('Supprimer ce transporteur ?')) return;
    const res = await fetch(`/api/shipping/companies/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Transporteur supprimé.');
      setActiveId(null);
      load();
    }
  }

  async function toggleActive(company: Company) {
    const res = await fetch(`/api/shipping/companies/${company._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !company.isActive }),
    });
    if (res.ok) load();
  }

  function updateRate(index: number, patch: Partial<RateRow>) {
    if (!active) return;
    const rates = active.rates.map((r, i) => (i === index ? { ...r, ...patch } : r));
    setCompanies((prev) => prev.map((c) => (c._id === active._id ? { ...c, rates } : c)));
  }

  async function saveRates() {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/shipping/companies/${active._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: active.rates }),
      });
      if (!res.ok) throw new Error();
      toast.success('Tarifs enregistrés.');
    } catch {
      toast.error('Échec de l\u2019enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  async function handleOcrUpload(file: File) {
    if (!active) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('companyId', active._id);
      formData.append('courierName', active.name);
      formData.append('file', file);
      const res = await fetch('/api/shipping/parse-ocr', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.matched} wilaya(s) détectée(s) et mise(s) à jour.`);
      load();
    } catch (err: any) {
      toast.error(err.message || "Échec de l'analyse de l'image.");
    } finally {
      setScanning(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  if (loading) return <p className="font-mono text-sm text-souk-ink/50">Chargement...</p>;

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-souk-ink">Transporteurs & livraison</h1>
      <p className="mb-6 font-body text-sm text-souk-ink/60">
        Ajoutez autant de transporteurs que vous le souhaitez (Yalidine, ZR Express, EcoTrack, Maystro...) et
        configurez leurs tarifs pour les 69 wilayas.
      </p>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-souk-ink/10 bg-white p-4">
        <div className="min-w-56 flex-1">
          <Label htmlFor="new-courier">Nouveau transporteur</Label>
          <Input
            id="new-courier"
            placeholder="Ex : Yalidine"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <Button type="button" onClick={addCompany}>
          <Plus size={16} />
          Ajouter
        </Button>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-souk-ink/20 bg-white/50 py-16 text-center">
          <p className="font-display text-lg text-souk-ink/60">Aucun transporteur configuré</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            {companies.map((c) => (
              <div
                key={c._id}
                className={`flex items-center justify-between gap-2 rounded-tag border p-2 ${
                  c._id === activeId ? 'border-souk-night bg-souk-night/5' : 'border-souk-ink/10 bg-white'
                }`}
              >
                <button type="button" className="flex-1 text-left" onClick={() => setActiveId(c._id)}>
                  <p className="font-body text-sm font-medium text-souk-ink">{c.name}</p>
                  <p className="font-mono text-[10px] text-souk-ink/40">
                    {c.rates.filter((r) => r.isServiced).length} wilaya(s) actives
                  </p>
                </button>
                <label className="flex items-center gap-1 font-mono text-[10px] text-souk-ink/60">
                  <input type="checkbox" checked={c.isActive} onChange={() => toggleActive(c)} />
                  Actif
                </label>
                <button type="button" onClick={() => deleteCompany(c._id)} className="text-souk-stamp" aria-label="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {active && (
            <div className="rounded-lg border border-souk-ink/10 bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-souk-ink">{active.name}</h2>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleOcrUpload(e.target.files[0])}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()} disabled={scanning}>
                    {scanning ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                    {scanning ? 'Analyse...' : 'Scanner une grille tarifaire (IA)'}
                  </Button>
                  <Button type="button" size="sm" onClick={saveRates} disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer les tarifs'}
                  </Button>
                </div>
              </div>

              <p className="mb-3 font-mono text-[11px] text-souk-ink/40">
                Uploadez une capture d&apos;écran de la grille de prix du transporteur pour remplir automatiquement les
                69 wilayas, puis ajustez manuellement si besoin.
              </p>

              <div className="max-h-[560px] overflow-y-auto overflow-x-auto rounded-tag border border-souk-ink/10">
                <table className="w-full min-w-[560px] text-left font-body text-sm">
                  <thead className="sticky top-0 border-b border-souk-ink/10 bg-white text-xs uppercase text-souk-ink/50">
                    <tr>
                      <th className="px-3 py-2">Wilaya</th>
                      <th className="px-3 py-2">Domicile (DA)</th>
                      <th className="px-3 py-2">Bureau (DA)</th>
                      <th className="px-3 py-2">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.rates.map((row, index) => (
                      <tr key={row.wilayaCode} className="border-b border-souk-ink/5 last:border-0">
                        <td className="px-3 py-1.5 font-mono text-xs text-souk-ink/70">
                          {String(row.wilayaCode).padStart(2, '0')} - {row.wilayaName}
                        </td>
                        <td className="px-3 py-1.5">
                          <Input
                            type="number"
                            min={0}
                            value={row.homeFee}
                            onChange={(e) => updateRate(index, { homeFee: Number(e.target.value) })}
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <Input
                            type="number"
                            min={0}
                            value={row.deskFee}
                            onChange={(e) => updateRate(index, { deskFee: Number(e.target.value) })}
                          />
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.isServiced}
                            onChange={(e) => updateRate(index, { isServiced: e.target.checked })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
