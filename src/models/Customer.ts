import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  totalPurchases: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    totalPurchases: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CustomerSchema.index({ name: 'text', phone: 'text' });

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
export default Customer;
