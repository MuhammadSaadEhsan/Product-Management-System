'use client';

import { useEffect, useState } from 'react';
import { StatCard, Card } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';

interface DashboardData {
  totalRevenue: number;
  totalPurchases: number;
  totalSales: number;
  totalProfit: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: { _id: string; name: string; quantity: number; lowStockThreshold: number }[];
  recentSales: { _id: string; invoiceNumber: string; customerName: string; totalAmount: number; createdAt: string }[];
  monthlySales: { month: string; total: number; count: number }[];
  monthlyPurchases: { month: string; total: number; count: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/dashboard')
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-slate-400">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of your business</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={<span className="text-xl text-white">💰</span>} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard title="Total Purchases" value={formatCurrency(data.totalPurchases)} icon={<span className="text-xl text-white">🛒</span>} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
        <StatCard title="Total Sales" value={String(data.totalSales)} icon={<span className="text-xl text-white">📊</span>} gradient="bg-gradient-to-br from-indigo-500 to-purple-600" />
        <StatCard title="Net Profit" value={formatCurrency(data.totalProfit)} icon={<span className="text-xl text-white">📈</span>} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Sales</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlySales}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="total" stroke="#818cf8" fill="url(#salesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Purchases Chart */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Purchases</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthlyPurchases}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-slate-500">No sales yet</p>
            ) : (
              data.recentSales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{sale.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{sale.customerName}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">{formatCurrency(sale.totalAmount)}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Low Stock Alerts</h3>
            <Badge variant={data.lowStockCount > 0 ? 'danger' : 'success'}>
              {data.lowStockCount} items
            </Badge>
          </div>
          <div className="space-y-3">
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500">All products are well stocked</p>
            ) : (
              data.lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{product.name}</p>
                    <p className="text-xs text-slate-400">Threshold: {product.lowStockThreshold}</p>
                  </div>
                  <Badge variant={product.quantity === 0 ? 'danger' : 'warning'}>
                    {product.quantity} left
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
