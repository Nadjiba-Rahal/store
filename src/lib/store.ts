import { connectDB } from '@/lib/mongodb';
import Shop from '@/models/Shop';

export interface StoreSettings {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  phone: string;
  instagram?: string;
  facebook?: string;
  wilayaCode: string;
  address?: string;
  deliveryFeeHome: number;
  deliveryFeeDesk: number;
  freeDeliveryThreshold?: number;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

// There is exactly one store in this app. Returns null if the owner
// hasn't completed setup yet (fresh deployment, before /register runs).
export async function getStore(): Promise<StoreSettings | null> {
  try {
    await connectDB();
    const store = await Shop.findOne().lean();
    return store ? JSON.parse(JSON.stringify(store)) : null;
  } catch {
    return null;
  }
}
