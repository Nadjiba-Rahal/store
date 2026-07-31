'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Plus, EyeOff, Star } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  isAvailable: boolean;
  stock: number;
  featured: boolean;
  views: number;
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?all=1')
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((p) => p.filter((x) => x._id !== id));
      toast.success('Produit supprimé.');
    } else {
      toast.error('Échec de la suppression.');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-souk-ink">Mes produits</h1>
        <Link href="/dashboard/products/new">
          <Button size="sm">
            <Plus size={16} /> Ajouter
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-souk-ink/50">Chargement...</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-souk-ink/20 bg-white/50 py-16 text-center">
          <p className="font-display text-lg text-souk-ink/60">Aucun produit pour l&apos;instant</p>
          <Link href="/dashboard/products/new" className="mt-3 inline-block">
            <Button size="sm">
              <Plus size={16} /> Ajouter votre premier produit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-souk-ink/10 bg-white">
          {products.map((p) => (
            <div key={p._id} className="flex items-center gap-4 border-b border-souk-ink/10 p-4 last:border-0">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-tag bg-souk-papershade">
                {p.images?.[0] && (
                  <Image src={p.images[0]} alt="" width={56} height={56} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="flex items-center gap-1.5 font-body text-sm font-semibold text-souk-ink">
                  {p.name}
                  {p.featured && <Star size={12} className="fill-souk-gold text-souk-gold" />}
                </p>
                <p className="font-mono text-xs text-souk-ink/50">
                  {formatPrice(p.price)} · stock {p.stock} · {p.views} vue{p.views !== 1 ? 's' : ''}
                  {!p.isAvailable && (
                    <span className="ml-2 inline-flex items-center gap-1 text-souk-stamp">
                      <EyeOff size={11} /> masqué
                    </span>
                  )}
                </p>
              </div>
              <Link href={`/dashboard/products/${p._id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Pencil size={14} />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id)}>
                <Trash2 size={14} className="text-souk-stamp" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
