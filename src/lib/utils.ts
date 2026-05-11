import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = new Date(date);
  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    case 'iso':
      return d.toISOString().split('T')[0];
    default:
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

export function generateSKU(categoryCode: string, productId: string): string {
  const prefix = categoryCode.substring(0, 3).toUpperCase();
  const suffix = productId.substring(productId.length - 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export function generateInvoiceNumber(prefix: string, count: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seq = (count + 1).toString().padStart(5, '0');
  return `${prefix}-${year}${month}-${seq}`;
}

export function calculateTax(amount: number, taxRate: number): number {
  return Math.round((amount * taxRate) / 100 * 100) / 100;
}

export function calculateDiscount(amount: number, discount: number): number {
  return Math.round((amount * discount) / 100 * 100) / 100;
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function getStockStatus(quantity: number, threshold = 10): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

export function getDateRange(type: 'today' | 'week' | 'month' | 'year') {
  const now = new Date();
  const start = new Date();
  switch (type) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  return { start, end: now };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
