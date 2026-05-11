import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  code: z.string().min(1, 'Code is required').max(5, 'Code max 5 chars'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  quantity: z.number().min(0).default(0),
  unit: z.string().default('pcs'),
  lowStockThreshold: z.number().min(0).default(10),
  barcode: z.string().optional(),
  image: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export const saleItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  productName: z.string().min(1),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
});

export const saleSchema = z.object({
  customerName: z.string().default('Walk-in Customer'),
  customer: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'cheque', 'credit']).default('cash'),
  paymentStatus: z.enum(['paid', 'partial', 'unpaid']).default('paid'),
  notes: z.string().optional(),
  subtotal: z.number().min(0),
  totalDiscount: z.number().min(0).default(0),
  totalTax: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
});

export const purchaseItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  productName: z.string().min(1),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0),
  total: z.number().min(0),
});

export const purchaseSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplier: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'cheque', 'credit']).default('cash'),
  paymentStatus: z.enum(['paid', 'partial', 'unpaid']).default('paid'),
  notes: z.string().optional(),
  subtotal: z.number().min(0),
  totalAmount: z.number().min(0),
});

export const inventoryAdjustmentSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  quantityChange: z.number().refine((v) => v !== 0, 'Quantity change cannot be zero'),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;
