import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    barcode: { type: String, sparse: true, index: true },
    description: { type: String, trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, default: 'pcs', trim: true },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', sku: 'text', barcode: 'text' });
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ category: 1, isActive: 1 });

ProductSchema.virtual('stockStatus').get(function () {
  if (this.quantity <= 0) return 'out_of_stock';
  if (this.quantity <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
