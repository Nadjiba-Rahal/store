'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUploader } from '@/components/ImageUploader';
import { AIDescriptionGenerator } from '@/components/AIDescriptionGenerator';
import { CATEGORIES } from '@/constants/categories';

export interface ProductVariantSizeFormValue {
  size: string;
  stock: number;
  priceOverride?: number;
}

export interface ProductVariantFormValue {
  colorName: string;
  colorCode?: string;
  image: string;
  sizes: ProductVariantSizeFormValue[];
}

export interface ProductFormValue {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  stock: string;
  isAvailable?: boolean;
  featured: boolean;
  specs: Record<string, string[]>;
  variants: ProductVariantFormValue[];
}

interface ProductFormProps {
  value: ProductFormValue;
  images: string[];
  saving: boolean;
  submitLabel: string;
  savingLabel: string;
  showAvailability?: boolean;
  onChange: (value: ProductFormValue) => void;
  onImagesChange: (images: string[]) => void;
  onSubmit: (event: React.FormEvent) => void;
}

function emptyVariant(): ProductVariantFormValue {
  return { colorName: '', colorCode: '#000000', image: '', sizes: [] };
}

function emptySize(): ProductVariantSizeFormValue {
  return { size: '', stock: 0, priceOverride: undefined };
}

export function ProductForm({
  value,
  images,
  saving,
  submitLabel,
  savingLabel,
  showAvailability = false,
  onChange,
  onImagesChange,
  onSubmit,
}: ProductFormProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(value.variants.length ? 0 : null);

  function update(patch: Partial<ProductFormValue>) {
    onChange({ ...value, ...patch });
  }

  function addColor() {
    const variants = [...value.variants, emptyVariant()];
    update({ variants });
    setOpenIndex(variants.length - 1);
  }

  function updateColor(index: number, patch: Partial<ProductVariantFormValue>) {
    const variants = value.variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant));
    update({ variants });
  }

  function removeColor(index: number) {
    update({ variants: value.variants.filter((_, i) => i !== index) });
    setOpenIndex(null);
  }

  function setColorImage(index: number, urls: string[]) {
    updateColor(index, { image: urls[0] || '' });
  }

  function addSize(colorIndex: number) {
    const variant = value.variants[colorIndex];
    updateColor(colorIndex, { sizes: [...variant.sizes, emptySize()] });
  }

  function updateSize(colorIndex: number, sizeIndex: number, patch: Partial<ProductVariantSizeFormValue>) {
    const variant = value.variants[colorIndex];
    const sizes = variant.sizes.map((sz, i) => (i === sizeIndex ? { ...sz, ...patch } : sz));
    updateColor(colorIndex, { sizes });
  }

  function removeSize(colorIndex: number, sizeIndex: number) {
    const variant = value.variants[colorIndex];
    updateColor(colorIndex, { sizes: variant.sizes.filter((_, i) => i !== sizeIndex) });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <div>
        <Label htmlFor="name">Nom du produit</Label>
        <Input id="name" required value={value.name} onChange={(e) => update({ name: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="category">Categorie</Label>
        <Select id="category" required value={value.category} onChange={(e) => update({ category: e.target.value })}>
          <option value="">Choisir une categorie</option>
          {CATEGORIES.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.emoji} {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="price">Prix (DA)</Label>
          <Input id="price" type="number" min={0} required value={value.price} onChange={(e) => update({ price: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="originalPrice">Prix barre</Label>
          <Input id="originalPrice" type="number" min={0} value={value.originalPrice} onChange={(e) => update({ originalPrice: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="stock">Stock global (si pas de variantes)</Label>
          <Input id="stock" type="number" min={0} required value={value.stock} onChange={(e) => update({ stock: e.target.value })} />
        </div>
      </div>

      <div className="rounded-lg border border-souk-ink/10 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-semibold text-souk-ink">Couleurs & tailles</p>
            <p className="font-mono text-[11px] text-souk-ink/50">
              Ajoutez chaque couleur avec sa propre photo, puis les tailles et le stock exact par taille.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={addColor}>
            <Plus size={16} />
            Ajouter une couleur
          </Button>
        </div>

        {value.variants.length === 0 && (
          <p className="rounded-tag border border-dashed border-souk-ink/20 py-8 text-center font-mono text-xs text-souk-ink/40">
            Aucune couleur ajoutee. Le produit utilisera le stock global ci-dessus.
          </p>
        )}

        <div className="space-y-3">
          {value.variants.map((variant, index) => {
            const isOpen = openIndex === index;
            const totalStock = variant.sizes.reduce((s, sz) => s + (Number(sz.stock) || 0), 0);
            return (
              <div key={index} className="rounded-tag border border-souk-ink/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-3 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-6 w-6 rounded-full border border-souk-ink/15"
                      style={{ backgroundColor: variant.colorCode || '#000000' }}
                    />
                    <span className="font-body text-sm font-medium text-souk-ink">
                      {variant.colorName || 'Nouvelle couleur'}
                    </span>
                    <span className="font-mono text-[11px] text-souk-ink/40">
                      {variant.sizes.length} taille(s) - {totalStock} en stock
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-souk-ink/10 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`color-name-${index}`}>Nom de la couleur</Label>
                        <Input
                          id={`color-name-${index}`}
                          placeholder="Noir, Blanc, Bleu..."
                          value={variant.colorName}
                          onChange={(e) => updateColor(index, { colorName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`color-code-${index}`}>Code couleur</Label>
                        <div className="flex items-center gap-2">
                          <input
                            id={`color-code-${index}`}
                            type="color"
                            value={variant.colorCode || '#000000'}
                            onChange={(e) => updateColor(index, { colorCode: e.target.value })}
                            className="h-10 w-12 rounded-tag border border-souk-ink/15"
                          />
                          <Input
                            value={variant.colorCode || ''}
                            onChange={(e) => updateColor(index, { colorCode: e.target.value })}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Photo de cette couleur</Label>
                      <ImageUploader images={variant.image ? [variant.image] : []} onChange={(urls) => setColorImage(index, urls)} max={1} />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label className="mb-0">Tailles & stock</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => addSize(index)}>
                          <Plus size={14} />
                          Ajouter une taille
                        </Button>
                      </div>

                      {variant.sizes.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[520px] text-left font-body text-sm">
                            <thead className="border-b border-souk-ink/10 text-xs uppercase text-souk-ink/50">
                              <tr>
                                <th className="py-2 pr-3">Taille</th>
                                <th className="py-2 pr-3">Stock</th>
                                <th className="py-2 pr-3">Prix optionnel (DA)</th>
                                <th className="py-2" />
                              </tr>
                            </thead>
                            <tbody>
                              {variant.sizes.map((sz, sizeIndex) => (
                                <tr key={sizeIndex} className="border-b border-souk-ink/10 last:border-0">
                                  <td className="py-2 pr-3">
                                    <Input
                                      placeholder="S, M, L, 42..."
                                      value={sz.size}
                                      onChange={(e) => updateSize(index, sizeIndex, { size: e.target.value })}
                                    />
                                  </td>
                                  <td className="py-2 pr-3">
                                    <Input
                                      type="number"
                                      min={0}
                                      value={sz.stock}
                                      onChange={(e) => updateSize(index, sizeIndex, { stock: Number(e.target.value) })}
                                    />
                                  </td>
                                  <td className="py-2 pr-3">
                                    <Input
                                      type="number"
                                      min={0}
                                      value={sz.priceOverride ?? ''}
                                      onChange={(e) =>
                                        updateSize(index, sizeIndex, {
                                          priceOverride: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                      }
                                    />
                                  </td>
                                  <td className="py-2">
                                    <button
                                      type="button"
                                      className="text-souk-stamp"
                                      onClick={() => removeSize(index, sizeIndex)}
                                      aria-label="Retirer la taille"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="inline-flex items-center gap-2 font-mono text-xs text-souk-stamp hover:underline"
                    >
                      <Trash2 size={14} />
                      Supprimer cette couleur
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="description" className="mb-0">
            Description
          </Label>
          <AIDescriptionGenerator
            name={value.name}
            category={value.category}
            onGenerated={(text) => update({ description: text })}
          />
        </div>
        <Textarea id="description" required rows={5} value={value.description} onChange={(e) => update({ description: e.target.value })} />
      </div>

      <div>
        <Label>Photos generales</Label>
        <ImageUploader images={images} onChange={onImagesChange} />
      </div>

      {showAvailability && (
        <label className="flex items-center gap-2 font-body text-sm text-souk-ink/80">
          <input
            type="checkbox"
            checked={!!value.isAvailable}
            onChange={(e) => update({ isAvailable: e.target.checked })}
          />
          Produit visible sur la boutique
        </label>
      )}

      <label className="flex items-center gap-2 font-body text-sm text-souk-ink/80">
        <input type="checkbox" checked={value.featured} onChange={(e) => update({ featured: e.target.checked })} />
        Mettre en avant sur la page d&apos;accueil
      </label>

      <Button type="submit" disabled={saving}>
        {saving ? savingLabel : submitLabel}
      </Button>
    </form>
  );
}
