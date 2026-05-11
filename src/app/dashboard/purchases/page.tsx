'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Pagination, EmptyState } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { Select } from '@/components/ui/Input';

interface Product { _id: string; name: string; sku: string; purchasePrice: number; }
interface PurchaseItem { product: string; productName: string; quantity: number; unitCost: number; total: number; }
interface Purchase { _id: string; invoiceNumber: string; supplierName: string; totalAmount: number; paymentStatus: string; items: PurchaseItem[]; createdAt: string; }

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/v1/purchases?${params}`);
    const json = await res.json();
    if (json.success) { setPurchases(json.data); setTotalPages(json.meta?.totalPages || 1); }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);
  useEffect(() => {
    fetch('/api/v1/products?limit=100').then(r => r.json()).then(res => { if (res.success) setProducts(res.data); });
  }, []);

  const addItem = () => setItems([...items, { product: '', productName: '', quantity: 1, unitCost: 0, total: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (index: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'product') {
        const p = products.find(pr => pr._id === value);
        if (p) { updated.productName = p.name; updated.unitCost = p.purchasePrice; }
      }
      updated.total = updated.quantity * updated.unitCost;
      return updated;
    }));
  };

  const subtotal = items.reduce((s, i) => s + i.total, 0);

  const handleSubmit = async () => {
    if (!supplierName || items.length === 0) { toast.error('Fill all fields'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/v1/purchases', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierName, items, paymentMethod, paymentStatus: 'paid', subtotal, totalAmount: subtotal }),
      });
      const json = await res.json();
      if (json.success) { toast.success('Purchase created'); setModalOpen(false); setItems([]); setSupplierName(''); fetchPurchases(); }
      else toast.error(json.error);
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Purchases</h1><p className="text-sm text-slate-400">Manage purchase orders</p></div>
        <Button onClick={() => setModalOpen(true)}>+ New Purchase</Button>
      </div>

      <Card className="p-4">
        <Input placeholder="Search purchases..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? <div className="p-6 text-slate-400">Loading...</div> : purchases.length === 0 ? (
          <EmptyState title="No purchases" description="Record your first purchase" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {purchases.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-indigo-400 text-xs">{p.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-200">{p.supplierName}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{p.items.length}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-400">{formatCurrency(p.totalAmount)}</td>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Supplier Name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required />
            <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              options={[{ label: 'Cash', value: 'cash' }, { label: 'Bank Transfer', value: 'bank_transfer' }, { label: 'Cheque', value: 'cheque' }]} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-300">Items</h4>
              <Button size="sm" variant="outline" onClick={addItem}>+ Add Item</Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-4">
                  <Select options={products.map(p => ({ label: `${p.name} (${p.sku})`, value: p._id }))} value={item.product} onChange={(e) => updateItem(i, 'product', e.target.value)} />
                </div>
                <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} /></div>
                <div className="col-span-3"><Input type="number" placeholder="Unit Cost" value={item.unitCost} onChange={(e) => updateItem(i, 'unitCost', Number(e.target.value))} /></div>
                <div className="col-span-2 text-right text-sm font-semibold text-slate-200 py-2">{formatCurrency(item.total)}</div>
                <div className="col-span-1"><button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 p-2">✕</button></div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700/50 pt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-200">Total: {formatCurrency(subtotal)}</span>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={saving}>Create Purchase</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
