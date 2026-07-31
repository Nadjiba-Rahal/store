import { Schema, model, models, type Document, type Types } from 'mongoose';

export interface IProduct extends Document {
  shop: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  variants: IProductVariant[];
  specs: Record<string, string[]>;
  isAvailable: boolean;
  featured: boolean;
  views: number;
  createdAt: Date;
}

export interface IProductVariantSize {
  size: string; // e.g. "S", "M", "L", "42", "43"
  stock: number;
  priceOverride?: number;
}

export interface IProductVariant {
  colorName: string; // e.g. "Noir", "Blanc", "Bleu"
  colorCode?: string; // hex code e.g. "#000000"
  image: string; // photo specific to this color
  sizes: IProductVariantSize[];
}

const ProductVariantSizeSchema = new Schema<IProductVariantSize>(
  {
    size: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    priceOverride: { type: Number, min: 0 },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    colorName: { type: String, required: true, trim: true },
    colorCode: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    sizes: { type: [ProductVariantSizeSchema], default: [] },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 999, min: 0 },
    variants: { type: [ProductVariantSchema], default: [] },
    specs: { type: Map, of: [String], default: {} },
    isAvailable: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

/** Total stock across all color/size combinations, used when variants exist. */
export function totalVariantStock(variants: IProductVariant[] = []): number {
  return variants.reduce(
    (sum, variant) => sum + variant.sizes.reduce((s, sz) => s + (sz.stock || 0), 0),
    0
  );
}

export default models.Product || model<IProduct>('Product', ProductSchema);
