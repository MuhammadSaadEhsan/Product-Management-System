'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Pagination, EmptyState } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/hooks/useFetch';
import { toast } from 'sonner';

interface Product {
  _id: string; name: string; sku: string; barcode?: string;
  category: { _id: string; name: string } | null;
  purchasePrice: number; sellingPrice: number; quantity: number;
  unit: string; lowStockThreshold: number; image?: string;
  stockStatus: string; isActive: boolean;
}

interface Category { _id: string; name: string; code: string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '', description: '', category: '', purchasePrice: 0,
    sellingPrice: 0, quantity: 0, unit: 'pcs', lowStockThreshold: 10, barcode: '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterCategory) params.set('category', filterCategory);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/v1/products?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        setTotalPages(json.meta?.totalPages || 1);
      }
    } catch { toast.error('Failed to fetch products'); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, filterCategory, filterStatus]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    fetch('/api/v1/categories').then(r => r.json()).then(res => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', category: '', purchasePrice: 0, sellingPrice: 0, quantity: 0, unit: 'pcs', lowStockThreshold: 10, barcode: '' });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, description: '', category: product.category?._id || '',
      purchasePrice: product.purchasePrice, sellingPrice: product.sellingPrice,
      quantity: product.quantity, unit: product.unit,
      lowStockThreshold: product.lowStockThreshold, barcode: product.barcode || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingProduct ? `/api/v1/products/${editingProduct._id}` : '/api/v1/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setModalOpen(false);
        fetchProducts();
      } else { toast.error(json.error); }
    } catch { toast.error('Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) { toast.success('Product deleted'); fetchProducts(); }
    else toast.error(json.error);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'in_stock': return <Badge variant="success">In Stock</Badge>;
      case 'low_stock': return <Badge variant="warning">Low Stock</Badge>;
      case 'out_of_stock': return <Badge variant="danger">Out of Stock</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-slate-400">Manage your product inventory</p>
        </div>
        <Button onClick={openCreate}>+ Add Product</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          />
          <Select options={categories.map(c => ({ label: c.name, value: c._id }))} value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} />
          <Select options={[{ label: 'Low Stock', value: 'low_stock' }, { label: 'Out of Stock', value: 'out_of_stock' }]} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? <div className="p-6"><TableSkeleton /></div> : products.length === 0 ? (
          <EmptyState title="No products found" description="Add your first product to get started" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Buy Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Sell Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Stock</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center text-lg">
                            {product.image ? <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : '📦'}
                          </div>
                          <span className="font-medium text-slate-200">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{product.sku}</td>
                      <td className="px-4 py-3 text-slate-400">{product.category?.name || '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{formatCurrency(product.purchasePrice)}</td>
                      <td className="px-4 py-3 text-right text-slate-200 font-medium">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-4 py-3 text-center text-slate-200">{product.quantity} {product.unit}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(product.stockStatus)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(product)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-indigo-400 transition-colors" title="Edit">✏️</button>
                          <button onClick={() => handleDelete(product._id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Select label="Category" options={categories.map(c => ({ label: c.name, value: c._id }))} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <Input label="Purchase Price" type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} required />
            <Input label="Selling Price" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} required />
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <Input label="Low Stock Threshold" type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
            <Input label="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingProduct ? 'Update' : 'Create'} Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
