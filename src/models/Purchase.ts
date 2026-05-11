import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchaseItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string;
  supplier?: mongoose.Types.ObjectId;
  supplierName: string;
  items: IPurchaseItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchase>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String, required: true, trim: true },
    items: { type: [PurchaseItemSchema], required: true, validate: [(v: IPurchaseItem[]) => v.length > 0, 'At least one item is required'] },
    subtotal: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'cheque', 'credit'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'paid',
    },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PurchaseSchema.index({ createdAt: -1 });
PurchaseSchema.index({ supplier: 1 });

const Purchase: Model<IPurchase> =
  mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);
export default Purchase;
