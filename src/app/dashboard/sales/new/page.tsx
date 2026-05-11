'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Product { _id: string; name: string; sku: string; sellingPrice: number; quantity: number; }
interface SaleItem { product: string; productName: string; quantity: number; unitPrice: number; discount: number; tax: number; total: number; }

export default function NewSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/v1/products?limit=100').then(r => r.json()).then(res => {
      if (res.success) setProducts(res.data);
    });
  }, []);

  useEffect(() => {
    if (!search) { setFilteredProducts([]); return; }
    const f = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    setFilteredProducts(f.slice(0, 8));
  }, [search, products]);

  const addItem = (product: Product) => {
    const existing = items.find(i => i.product === product._id);
    if (existing) {
      setItems(items.map(i => i.product === product._id
        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
        : i
      ));
    } else {
      setItems([...items, {
        product: product._id, productName: product.name,
        quantity: 1, unitPrice: product.sellingPrice,
        discount: 0, tax: 0, total: product.sellingPrice,
      }]);
    }
    setSearch('');
    setFilteredProducts([]);
  };

  const updateItem = (index: number, field: string, value: number) => {
    setItems(items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      updated.total = (updated.quantity * updated.unitPrice) - updated.discount + updated.tax;
      return updated;
    }));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const totalDiscount = items.reduce((s, i) => s + i.discount, 0);
  const totalTax = items.reduce((s, i) => s + i.tax, 0);
  const totalAmount = subtotal - totalDiscount + totalTax;

  const handleSubmit = async () => {
    if (items.length === 0) { toast.error('Add at least one item'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/v1/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, items, paymentMethod, paymentStatus: 'paid', subtotal, totalDiscount, totalTax, totalAmount }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Sale created: ${json.data.invoiceNumber}`);
        router.push('/dashboard/sales');
      } else { toast.error(json.error); }
    } catch { toast.error('Failed to create sale'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">New Sale (POS)</h1>
        <p className="text-sm text-slate-400">Create a new sales invoice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product search & items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Input placeholder="Search products by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-slate-600 bg-slate-800 shadow-xl max-h-60 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <button key={p._id} onClick={() => addItem(p)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200">{p.name}</p>
                        <p className="text-xs text-slate-400">SKU: {p.sku} | Stock: {p.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-indigo-400">{formatCurrency(p.sellingPrice)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Items Table */}
          <Card className="p-0 overflow-hidden">
            {items.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Search and add products above</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase w-24">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-200 font-medium">{item.productName}</td>
                      <td className="px-4 py-3"><input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} className="w-20 mx-auto block rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-center text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">{formatCurrency(item.total)}</td>
                      <td className="px-4 py-3"><button onClick={() => removeItem(index)} className="text-slate-400 hover:text-red-400">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Customer Details</h3>
            <Input label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Payment</h3>
            <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { label: 'Cash', value: 'cash' }, { label: 'Card', value: 'card' },
                { label: 'Bank Transfer', value: 'bank_transfer' }, { label: 'Cheque', value: 'cheque' },
              ]}
            />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="text-slate-200">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Discount</span><span className="text-red-400">-{formatCurrency(totalDiscount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Tax</span><span className="text-slate-200">{formatCurrency(totalTax)}</span></div>
              <div className="border-t border-slate-700/50 pt-3 flex justify-between">
                <span className="font-semibold text-slate-200">Total</span>
                <span className="text-xl font-bold text-emerald-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleSubmit} loading={saving} disabled={items.length === 0}>
              Complete Sale
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
