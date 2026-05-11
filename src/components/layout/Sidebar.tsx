'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/products', label: 'Products', icon: '📦' },
  { href: '/dashboard/categories', label: 'Categories', icon: '🏷️' },
  { href: '/dashboard/sales', label: 'Sales', icon: '💰' },
  { href: '/dashboard/sales/new', label: 'New Sale (POS)', icon: '🧾' },
  { href: '/dashboard/purchases', label: 'Purchases', icon: '🛒' },
  { href: '/dashboard/customers', label: 'Customers', icon: '👥' },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: '🏭' },
  { href: '/dashboard/inventory', label: 'Inventory', icon: '📋' },
  { href: '/dashboard/reports', label: 'Reports', icon: '📈' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={close} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
            BM
          </div>
          <div>
            <h1 className="text-base font-bold text-white">BillManager</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Inventory & Billing</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-3 overflow-y-auto h-[calc(100vh-5rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => window.innerWidth < 1024 && close()}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
