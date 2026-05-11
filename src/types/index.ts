import { PAYMENT_METHODS, PAYMENT_STATUS, STOCK_STATUS, INVENTORY_ACTION } from '@/config/constants';

// ============================================
// Base Types
// ============================================
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
export type StockStatus = (typeof STOCK_STATUS)[number];
export type InventoryActionType = (typeof INVENTORY_ACTION)[number];

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  totalRevenue: number;
  totalPurchases: number;
  totalSales: number;
  totalProfit: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentSales: SaleSummary[];
  monthlySales: MonthlyStat[];
  monthlyPurchases: MonthlyStat[];
}

export interface SaleSummary {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  createdAt: string;
}

export interface MonthlyStat {
  month: string;
  total: number;
  count: number;
}

// ============================================
// Report Types
// ============================================
export interface ReportFilters {
  startDate: string;
  endDate: string;
  type?: 'daily' | 'weekly' | 'monthly';
  productId?: string;
  categoryId?: string;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  topProducts: ProductSalesData[];
}

export interface ProductSalesData {
  productId: string;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface ProfitLossReport {
  period: string;
  revenue: number;
  costOfGoods: number;
  grossProfit: number;
  profitMargin: number;
}

// ============================================
// Form Types
// ============================================
export interface SelectOption {
  label: string;
  value: string;
}

export interface SaleItemInput {
  product: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface PurchaseItemInput {
  product: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}
