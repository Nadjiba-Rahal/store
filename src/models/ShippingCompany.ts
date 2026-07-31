import { Schema, model, models, type Document } from 'mongoose';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

export interface IShippingRateRow {
  wilayaCode: number;
  wilayaName: string;
  homeFee: number;
  deskFee: number;
  isServiced: boolean;
}

export interface IShippingCompany extends Document {
  name: string;
  logo?: string;
  isActive: boolean;
  rates: IShippingRateRow[];
  createdAt: Date;
  updatedAt: Date;
}

const ShippingRateRowSchema = new Schema<IShippingRateRow>(
  {
    wilayaCode: { type: Number, required: true, min: 1, max: 69 },
    wilayaName: { type: String, required: true, trim: true },
    homeFee: { type: Number, required: true, min: 0, default: 0 },
    deskFee: { type: Number, required: true, min: 0, default: 0 },
    isServiced: { type: Boolean, default: true },
  },
  { _id: false }
);

const ShippingCompanySchema = new Schema<IShippingCompany>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    logo: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    rates: { type: [ShippingRateRowSchema], default: [] },
  },
  { timestamps: true }
);

/** Builds a full 69-row rate table (all unserviced/zero by default), used
 *  when creating a new courier so the seller can edit every wilaya at once. */
export function buildEmptyRateTable(): IShippingRateRow[] {
  return ALGERIA_WILAYAS.map((w) => ({
    wilayaCode: Number(w.code),
    wilayaName: w.name,
    homeFee: 0,
    deskFee: 0,
    isServiced: false,
  }));
}

export default models.ShippingCompany || model<IShippingCompany>('ShippingCompany', ShippingCompanySchema);
