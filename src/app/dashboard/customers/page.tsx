'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Pagination, EmptyState } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

interface Entity { _id: string; name: string; email?: string; phone?: string; address?: string; city?: string; }

function CrudPage({ title, subtitle, apiPath, fields }: {
  title: string; subtitle: string; apiPath: string;
  fields: { key: string; label: string; type?: string }[];
}) {
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) params.set('search', search);
    const res = await fetch(`${apiPath}?${params}`);
    const json = await res.json();
    if (json.success) { setItems(json.data); setTotalPages(json.meta?.totalPages || 1); }
    setLoading(false);
  }, [page, search, apiPath]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    const empty: Record<string, string> = {};
    fields.forEach(f => empty[f.key] = '');
    setForm(empty);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiPath, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { toast.success('Created'); setModalOpen(false); fetchItems(); }
      else toast.error(json.error);
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">{title}</h1><p className="text-sm text-slate-400">{subtitle}</p></div>
        <Button onClick={openCreate}>+ Add {title.slice(0, -1)}</Button>
      </div>
      <Card className="p-4">
        <Input placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)}
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
      </Card>
      <Card className="p-0 overflow-hidden">
        {loading ? <div className="p-6 text-slate-400">Loading...</div> : items.length === 0 ? (
          <EmptyState title={`No ${title.toLowerCase()}`} description={`Add your first ${title.toLowerCase().slice(0, -1)}`} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700/50 bg-slate-800/30">
                  {fields.map(f => <th key={f.key} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{f.label}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                      {fields.map(f => <td key={f.key} className="px-4 py-3 text-slate-200">{(item as unknown as Record<string, unknown>)[f.key] as string || '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${title.slice(0, -1)}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <Input key={f.key} label={f.label} type={f.type || 'text'} value={form[f.key] || ''}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              required={f.key === 'name'}
            />
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function CustomersPage() {
  return <CrudPage title="Customers" subtitle="Manage your customers" apiPath="/api/v1/customers"
    fields={[
      { key: 'name', label: 'Name' }, { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' }, { key: 'city', label: 'City' },
    ]} />;
}
