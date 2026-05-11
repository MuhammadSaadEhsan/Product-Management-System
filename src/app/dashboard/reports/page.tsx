'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, StatCard } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#f472b6', '#fb923c', '#34d399', '#38bdf8', '#facc15'];

interface ReportData {
  salesReport: { _id: Record<string, number>; totalRevenue: number; totalSales: number; avgOrderValue: number }[];
  purchaseReport: { _id: Record<string, number>; totalCost: number; totalPurchases: number }[];
  topProducts: { _id: string; productName: string; totalQty: number; totalRevenue: number }[];
  summary: { totalRevenue: number; totalCost: number; grossProfit: number; profitMargin: string };
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: reportType });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const res = await fetch(`/api/v1/reports?${params}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Reports</h1><p className="text-sm text-slate-400">Business analytics & insights</p></div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={handlePrint}>🖨️ Print</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)}
            options={[{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }]} />
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <div className="flex items-end">
            <Button onClick={fetchReport} loading={loading} className="w-full">Generate Report</Button>
          </div>
        </div>
      </Card>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={formatCurrency(data.summary.totalRevenue)} icon={<span className="text-xl text-white">💰</span>} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
            <StatCard title="Total Cost" value={formatCurrency(data.summary.totalCost)} icon={<span className="text-xl text-white">📉</span>} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
            <StatCard title="Gross Profit" value={formatCurrency(data.summary.grossProfit)} icon={<span className="text-xl text-white">📈</span>} gradient="bg-gradient-to-br from-indigo-500 to-purple-600" />
            <StatCard title="Profit Margin" value={`${data.summary.profitMargin}%`} icon={<span className="text-xl text-white">🎯</span>} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Sales by Period</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.salesReport.map((r, i) => ({ period: `P${i + 1}`, revenue: r.totalRevenue, sales: r.totalSales }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Bar dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Products Pie */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Products by Revenue</h3>
              {data.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.topProducts.map(p => ({ name: p.productName, value: p.totalRevenue }))}
                      cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name }) => name?.substring(0, 15)}>
                      {data.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-500 text-sm text-center py-12">No product data</p>}
            </Card>
          </div>

          {/* Top Products Table */}
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300">Product-wise Sales Report</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Qty Sold</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Revenue</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {data.topProducts.map((p, i) => (
                    <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 text-slate-200 font-medium">{p.productName}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{p.totalQty}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">{formatCurrency(p.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card className="py-16 text-center">
          <p className="text-slate-400 text-lg">Select filters and click &quot;Generate Report&quot; to view analytics</p>
        </Card>
      )}
    </div>
  );
}
