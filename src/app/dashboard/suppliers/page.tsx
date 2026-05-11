'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Pagination, EmptyState } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

interface Supplier { _id: string; name: string; email?: string; phone?: string; company?: string; address?: string; city?: string; }

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', city: '' });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/v1/suppliers?${params}`);
    const json = await res.json();
    if (json.success) { setItems(json.data); setTotalPages(json.meta?.totalPages || 1); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { toast.success('Supplier created'); setModalOpen(false); fetchItems(); setForm({ name: '', email: '', phone: '', company: '', address: '', city: '' }); }
      else toast.error(json.error);
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Suppliers</h1><p className="text-sm text-slate-400">Manage your suppliers</p></div>
        <Button onClick={() => setModalOpen(true)}>+ Add Supplier</Button>
      </div>
      <Card className="p-4">
        <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)}
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
      </Card>
      <Card className="p-0 overflow-hidden">
        {loading ? <div className="p-6 text-slate-400">Loading...</div> : items.length === 0 ? (
          <EmptyState title="No suppliers" description="Add your first supplier" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">City</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {items.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-200 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-slate-400">{s.company || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{s.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{s.email || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{s.city || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Supplier">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
