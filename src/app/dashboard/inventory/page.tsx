'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Pagination, EmptyState } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface InventoryLog {
  _id: string;
  product: { _id: string; name: string; sku: string; quantity: number } | null;
  action: string; quantityChange: number;
  previousQuantity: number; newQuantity: number;
  reference?: string; referenceType?: string;
  notes?: string; createdAt: string;
  createdBy?: { name: string } | null;
}

interface Product { _id: string; name: string; sku: string; quantity: number; }

export default function InventoryPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterProduct, setFilterProduct] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product: '', quantityChange: 0, notes: '' });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (filterProduct) params.set('product', filterProduct);
    const res = await fetch(`/api/v1/inventory?${params}`);
    const json = await res.json();
    if (json.success) { setLogs(json.data); setTotalPages(json.meta?.totalPages || 1); }
    setLoading(false);
  }, [page, filterProduct]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => {
    fetch('/api/v1/products?limit=100').then(r => r.json()).then(res => {
      if (res.success) setProducts(res.data);
    });
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product || form.quantityChange === 0) { toast.error('Fill all fields'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/v1/inventory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { toast.success('Stock adjusted'); setModalOpen(false); setForm({ product: '', quantityChange: 0, notes: '' }); fetchLogs(); }
      else toast.error(json.error);
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const actionBadge = (action: string) => {
    switch (action) {
      case 'purchase': return <Badge variant="success">Purchase</Badge>;
      case 'sale': return <Badge variant="info">Sale</Badge>;
      case 'adjustment': return <Badge variant="warning">Adjustment</Badge>;
      case 'return': return <Badge variant="default">Return</Badge>;
      default: return <Badge>{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Inventory</h1><p className="text-sm text-slate-400">Track stock movements</p></div>
        <Button onClick={() => setModalOpen(true)}>Adjust Stock</Button>
      </div>

      <Card className="p-4">
        <Select label="Filter by Product" options={products.map(p => ({ label: `${p.name} (${p.sku}) — Stock: ${p.quantity}`, value: p._id }))}
          value={filterProduct} onChange={(e) => { setFilterProduct(e.target.value); setPage(1); }} />
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? <div className="p-6 text-slate-400">Loading...</div> : logs.length === 0 ? (
          <EmptyState title="No inventory logs" description="Stock movements will appear here" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Action</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Change</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Before → After</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">By</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-200 font-medium">{log.product?.name || '—'}</td>
                      <td className="px-4 py-3 text-center">{actionBadge(log.action)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={log.quantityChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">{log.previousQuantity} → {log.newQuantity}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{log.reference || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{log.createdBy?.name || '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Adjust Stock">
        <form onSubmit={handleAdjust} className="space-y-4">
          <Select label="Product" options={products.map(p => ({ label: `${p.name} (Stock: ${p.quantity})`, value: p._id }))}
            value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required />
          <Input label="Quantity Change (+ to add, - to remove)" type="number" value={form.quantityChange}
            onChange={(e) => setForm({ ...form, quantityChange: Number(e.target.value) })} required />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Adjust Stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
