'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProductForm, type ProductFormValue } from '@/components/seller/ProductForm';

const initialForm: ProductFormValue = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  stock: '999',
  featured: false,
  specs: { colors: [], sizes: [] },
  variants: [],
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValue>(initialForm);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Ajoutez au moins une photo.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          stock: Number(form.stock),
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Produit publie !');
      router.push('/dashboard/products');
    } catch (err: any) {
      toast.error(err.message || 'Echec de la publication.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-souk-ink">Ajouter un produit</h1>
      <ProductForm
        value={form}
        images={images}
        saving={saving}
        submitLabel="Publier le produit"
        savingLabel="Publication..."
        onChange={setForm}
        onImagesChange={setImages}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
