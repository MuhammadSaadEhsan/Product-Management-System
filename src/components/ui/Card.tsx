'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6',
        hover && 'transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-indigo-500/5',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  gradient: string;
}

export function StatCard({ title, value, icon, trend, gradient }: StatCardProps) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20', gradient)} />
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium flex items-center gap-1', trend.positive ? 'text-emerald-400' : 'text-red-400')}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', gradient)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
