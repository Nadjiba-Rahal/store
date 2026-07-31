import { Schema, model, models, type Document, type Types } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryType = 'home' | 'desk';
export type PaymentMethod = 'cod' | 'chargily';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    color?: string;
    size?: string;
  };
}

export interface IOrder extends Document {
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: DeliveryType;
  courierName?: string;
  customerName: string;
  customerPhone: string;
  wilayaCode: string;
  wilayaName?: string;
  commune: string;
  address?: string;
  note?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  chargilyCheckoutId?: string;
  status: OrderStatus;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
    variant: {
      color: { type: String, trim: true, default: '' },
      size: { type: String, trim: true, default: '' },
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    items: { type: [OrderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryType: { type: String, enum: ['home', 'desk'], required: true },
    courierName: { type: String, trim: true, default: '' },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    wilayaCode: { type: String, required: true },
    wilayaName: { type: String, trim: true, default: '' },
    commune: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '' },
    paymentMethod: { type: String, enum: ['cod', 'chargily'], default: 'cod', index: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
    chargilyCheckoutId: { type: String, trim: true, default: '', index: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>('Order', OrderSchema);
