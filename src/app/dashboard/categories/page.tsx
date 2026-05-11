'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Badge';
import { toast } from 'sonner';

interface Category { _id: string; name: string; code: string; description?: string; slug: string; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/categories');
    const json = await res.json();
    if (json.success) setCategories(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, code: c.code, description: c.description || '' }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/v1/categories/${editing._id}` : '/api/v1/categories';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { toast.success(editing ? 'Updated' : 'Created'); setModalOpen(false); fetchCategories(); }
      else toast.error(json.error);
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/v1/categories/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) { toast.success('Deleted'); fetchCategories(); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-slate-400">Organize your products</p>
        </div>
        <Button onClick={openCreate}>+ Add Category</Button>
      </div>

      {loading ? <p className="text-slate-400">Loading...</p> : categories.length === 0 ? (
        <Card><EmptyState title="No categories" description="Create your first category" /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Card key={c._id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200">{c.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Code: {c.code}</p>
                  {c.description && <p className="text-sm text-slate-400 mt-2">{c.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors">✏️</button>
                  <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">🗑️</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Code (max 5 chars)" value={form.code} maxLength={5} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
