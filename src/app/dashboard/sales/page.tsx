'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Pagination, EmptyState } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/useFetch';
import Link from 'next/link';

interface Sale {
  _id: string; invoiceNumber: string; customerName: string;
  totalAmount: number; paymentMethod: string; paymentStatus: string;
  items: { productName: string; quantity: number; total: number }[];
  createdAt: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/v1/sales?${params}`);
    const json = await res.json();
    if (json.success) { setSales(json.data); setTotalPages(json.meta?.totalPages || 1); }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const paymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'partial': return <Badge variant="warning">Partial</Badge>;
      case 'unpaid': return <Badge variant="danger">Unpaid</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales</h1>
          <p className="text-sm text-slate-400">View all sales and invoices</p>
        </div>
        <Link href="/dashboard/sales/new">
          <Button>+ New Sale</Button>
        </Link>
      </div>

      <Card className="p-4">
        <Input placeholder="Search by invoice or customer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? <div className="p-6 text-slate-400">Loading...</div> : sales.length === 0 ? (
          <EmptyState title="No sales yet" description="Create your first sale" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Payment</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-indigo-400 text-xs">{sale.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-200">{sale.customerName}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{sale.items.length}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">{formatCurrency(sale.totalAmount)}</td>
                      <td className="px-4 py-3 text-center text-slate-400 capitalize">{sale.paymentMethod.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-center">{paymentBadge(sale.paymentStatus)}</td>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs">{formatDate(sale.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
