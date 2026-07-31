'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProductForm, type ProductFormValue } from '@/components/seller/ProductForm';

const initialForm: ProductFormValue = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  stock: '0',
  isAvailable: true,
  featured: false,
  specs: { colors: [], sizes: [] },
  variants: [],
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<ProductFormValue>(initialForm);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          const product = data.product;
          setForm({
            name: product.name,
            description: product.description,
            price: String(product.price),
            originalPrice: product.originalPrice ? String(product.originalPrice) : '',
            category: product.category,
            stock: String(product.stock ?? 0),
            isAvailable: product.isAvailable,
            featured: !!product.featured,
            specs: product.specs ?? { colors: [], sizes: [] },
            variants: product.variants ?? [],
          });
          setImages(product.images ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          stock: Number(form.stock),
          images,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Produit mis a jour.');
      router.push('/dashboard/products');
    } catch {
      toast.error('Echec de la mise a jour.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-mono text-sm text-souk-ink/50">Chargement...</p>;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-souk-ink">Modifier le produit</h1>
      <ProductForm
        value={form}
        images={images}
        saving={saving}
        submitLabel="Enregistrer"
        savingLabel="Enregistrement..."
        showAvailability
        onChange={setForm}
        onImagesChange={setImages}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
