import { Schema, model, models, type Document, type Types } from 'mongoose';

// Single-store settings document. There is only ever one Shop document in
// the database — this app is a single-owner storefront, not a multi-vendor
// marketplace. The owner configures branding, contact info, and delivery
// pricing here; everything else (products, orders) references this store
// implicitly.
export interface IShop extends Document {
  owner: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  phone: string; // WhatsApp number, e.g. 213555123456
  instagram?: string;
  facebook?: string;
  wilayaCode: string; // where the store ships from
  address?: string;
  deliveryFeeHome: number; // DA — livraison à domicile
  deliveryFeeDesk: number; // DA — retrait au bureau (stop desk)
  freeDeliveryThreshold?: number; // DA — 0/undefined = disabled
  heroImage?: string; // large hero banner image URL for the landing page
  heroTitle?: string; // overrides the store name in the hero banner, if set
  heroSubtitle?: string; // overrides the default hero tagline, if set
  createdAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, trim: true, default: '' },
    logo: { type: String, default: '' },
    phone: { type: String, required: true },
    instagram: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    wilayaCode: { type: String, required: true },
    address: { type: String, trim: true, default: '' },
    deliveryFeeHome: { type: Number, default: 600, min: 0 },
    deliveryFeeDesk: { type: Number, default: 400, min: 0 },
    freeDeliveryThreshold: { type: Number, default: 0, min: 0 },
    heroImage: { type: String, trim: true, default: '' },
    heroTitle: { type: String, trim: true, default: '' },
    heroSubtitle: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default models.Shop || model<IShop>('Shop', ShopSchema);
