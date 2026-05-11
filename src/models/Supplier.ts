import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplier extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ name: 'text', company: 'text' });

const Supplier: Model<ISupplier> =
  mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default Supplier;
