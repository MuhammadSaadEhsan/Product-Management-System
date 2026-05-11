import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryLog extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  action: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reference?: string;
  referenceType?: 'sale' | 'purchase' | 'manual';
  referenceId?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['purchase', 'sale', 'adjustment', 'return'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reference: { type: String },
    referenceType: {
      type: String,
      enum: ['sale', 'purchase', 'manual'],
    },
    referenceId: { type: Schema.Types.ObjectId },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

InventoryLogSchema.index({ createdAt: -1 });
InventoryLogSchema.index({ product: 1, createdAt: -1 });

const InventoryLog: Model<IInventoryLog> =
  mongoose.models.InventoryLog || mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);
export default InventoryLog;
