import { Schema, model, models, type Document } from 'mongoose';

export type UserRole = 'seller' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // 'admin' owns/configures the store (set on the single registration in
    // api/auth/register); 'seller' is reserved for future staff accounts.
    // Both roles may access /dashboard and /admin — see middleware.ts.
    role: { type: String, enum: ['seller', 'admin'], default: 'seller' },
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);