export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'BillManager';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'PKR';
export const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE || '17');

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const INVOICE_PREFIX = {
  SALE: 'INV',
  PURCHASE: 'PUR',
} as const;

export const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'cheque', 'credit'] as const;
export const PAYMENT_STATUS = ['paid', 'partial', 'unpaid'] as const;
export const STOCK_STATUS = ['in_stock', 'low_stock', 'out_of_stock'] as const;
export const INVENTORY_ACTION = ['purchase', 'sale', 'adjustment', 'return'] as const;

export const LOW_STOCK_THRESHOLD = 10;
