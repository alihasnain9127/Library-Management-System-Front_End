'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Library, ArrowUpRight, ArrowDownRight, AlertTriangle,
  DollarSign, Activity, BookOpen, ChevronRight,
  RefreshCw, Package
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts';

// ── Metric Data (6 KPI Tiles) ───────────────────────────────
const metricData = [
  {
    title: 'Total Members',
    value: '1,248',
    icon: Users,
    change: '+12%',
    changeLabel: 'this month',
    trend: 'up',
    type: 'info',
  },
  {
    title: 'Book Catalog',
    value: '8,432',
    icon: Library,
    change: '+142',
    changeLabel: 'new entries',
    trend: 'up',
    type: 'info',
  },
  {
    title: 'Currently Issued',
    value: '312',
    icon: BookOpen,
    change: '64%',
    changeLabel: 'active utilization',
    trend: 'up',
    type: 'success',
  },
  {
    title: 'Overdue Rotations',
    value: '24',
    icon: AlertTriangle,
    change: 'Action',
    changeLabel: 'required now',
    trend: 'down',
    type: 'danger',
  },
  {
    title: 'Pending Fines',
    value: 'Rs. 4,820',
    icon: DollarSign,
    change: 'Rs. 1,200',
    changeLabel: 'collected today',
    trend: 'up',
    type: 'warning',
  },
  {
    title: 'System Health',
    value: '99.8%',
    icon: Activity,
    change: 'All APIs',
    changeLabel: 'operational',
    trend: 'up',
    type: 'success',
  },
];

const monthlyCirculation = [
  { day: '05 May', issued: 45, returned: 32 },
  { day: '10 May', issued: 62, returned: 48 },
  { day: '15 May', issued: 85, returned: 71 },
  { day: '20 May', issued: 54, returned: 65 },
  { day: '25 May', issued: 95, returned: 82 },
];

const topBooks = [
  { name: 'Clean Code', borrows: 145, color: '#3b82f6' },
  { name: 'Designing Data Apps', borrows: 122, color: '#6366f1' },
  { name: "You Don't Know JS", borrows: 98, color: '#10b981' },
  { name: 'The Pragmatic Programmer', borrows: 87, color: '#f59e0b' },
  { name: 'Intro to Algorithms', borrows: 64, color: '#ef4444' },
];

const overdueAlerts = [
  { book: 'Introduction to Algorithms', user: 'Arsalan Khan', days: 14, fine: 280 },
  { book: 'Cracking the Coding Interview', user: 'Zainab Malik', days: 9, fine: 180 },
  { book: 'Head First Design Patterns', user: 'Bilal Ahmed', days: 7, fine: 140 },
];

const depletedStock = [
  { book: 'Designing Data-Intensive Applications', category: 'Engineering', remaining: 0 },
  { book: 'Compilers: Principles, Techniques', category: 'Computer Science', remaining: 1 },
  { book: 'Discrete Mathematics', category: 'Mathematics', remaining: 2 },
];

// ── Glass Tooltip ───────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-semibold flex items-center justify-between gap-4">
          <span>{entry.name}:</span>
          <span className="text-slate-900 dark:text-white font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Metric Card ──────────────────────────────────────────────
function MetricCard({ card }) {
  const Icon = card.icon;
  const colorMap = {
    danger:  { icon: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-100 dark:border-red-900/30' },
    warning: { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' },
    success: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' },
    info:    { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' },
  };
  const colors = colorMap[card.type] || colorMap.info;
  const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendColor = card.type === 'danger' ? 'text-red-500 dark:text-red-400' : card.type === 'warning' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400';

  return (
    <div 
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-200 cursor-default hover:-translate-y-0.5"
      style={{ boxShadow: 'var(--shadow-e1)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-e2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-e1)'; }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate pr-2">
          {card.title}
        </span>
        <div className={`p-2.5 rounded-xl border shrink-0 ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Big Display Metric (36-40px, font-extrabold, tracking-tight) */}
      <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
        {card.value}
      </p>

      {/* Delta indicator */}
      <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
        <TrendIcon className="w-3.5 h-3.5" />
        <span>{card.change}</span>
        <span className="font-normal text-slate-400 dark:text-slate-500 ml-0.5">{card.changeLabel}</span>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function StatsDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-sm font-medium">Loading library analytics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── 1. KPI Metric Tiles ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {metricData.map((card, idx) => (
          <MetricCard key={idx} card={card} />
        ))}
      </div>

      {/* ── 2. Charts Row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area chart — Circulation */}
        <div 
          className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">Circulation Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5">Books issued vs returned over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-3 h-1 bg-blue-500 rounded-full" /> Issued
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-3 h-1 bg-emerald-500 rounded-full" /> Returned
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCirculation} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="issued" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorIssued)" 
                  name="Issued" 
                  dot={false} 
                  activeDot={{ r: 5, fill: '#3b82f6' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="returned" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorReturned)" 
                  name="Returned" 
                  dot={false} 
                  activeDot={{ r: 5, fill: '#10b981' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart — Top Titles */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">High Velocity Titles</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top 5 most borrowed books</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBooks} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="borrows" radius={[0, 6, 6, 0]} barSize={12}>
                  {topBooks.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 3. Alert Tables ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Overdue Risk Register */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Critical Overdue Accounts
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full border border-red-200/50 dark:border-red-900/40">
              Action Required
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {overdueAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{alert.book}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Borrower: <span className="font-medium text-slate-600 dark:text-slate-300">{alert.user}</span>
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{alert.days} Days Late</span>
                  <p className="text-xs text-slate-400 mt-0.5">Rs. {alert.fine} accrued</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Depleted Stock Watchlist */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-amber-500" />
              Depleted Stock Watchlist
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/40">
              Low Stock
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {depletedStock.map((stock, idx) => (
              <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{stock.book}</p>
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md mt-1">
                    {stock.category}
                  </span>
                </div>
                <span className={`shrink-0 ml-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  stock.remaining === 0
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50 dark:border-red-900/40'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40'
                }`}>
                  {stock.remaining === 0 ? 'Out of Stock' : `${stock.remaining} Left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}