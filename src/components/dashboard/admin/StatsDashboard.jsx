'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Library, ArrowUpRight, AlertTriangle, 
  DollarSign, Activity, BookOpen, ChevronRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';

// --- MOCK DATA STRUCTURES ---
const metricData = [
  { title: 'Total Members', value: '1,248', icon: Users, change: '+12% this month', type: 'info' },
  { title: 'Total Book Catalog', value: '8,432', icon: Library, change: '+142 new entries', type: 'info' },
  { title: 'Currently Issued', value: '312', icon: BookOpen, change: '64% active utilization', type: 'success' },
  { title: 'Overdue Rotations', value: '24', icon: AlertTriangle, change: 'Requires manual notice', type: 'danger' },
  { title: 'Pending Fines', value: 'Rs. 4,820', icon: DollarSign, change: 'Rs. 1,200 collected today', type: 'warning' },
  { title: 'System Health', value: '99.8%', icon: Activity, change: 'All APIs operational', type: 'success' },
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
  { name: 'Designing Data-Intensive Applications', borrows: 122, color: '#6366f1' },
  { name: 'You Don\'t Know JS Yet', borrows: 98, color: '#10b981' },
  { name: 'The Pragmatic Programmer', borrows: 87, color: '#f59e0b' },
  { name: 'Introduction to Algorithms', borrows: 64, color: '#ef4444' },
];

export default function StatsDashboard() {
  const [mounted, setMounted] = useState(false);

  // Suppress hydration warning loops by ensuring execution context is client-native
  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) {
    return <div className="h-96 w-full flex items-center justify-center text-slate-400">Loading analytic engines...</div>;
  }

  return (
    <div className="space-y-8">
      {/* 1. KEY METRICS MATRIX GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {metricData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
                <div className={`p-2.5 rounded-lg ${
                  card.type === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                  card.type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                  card.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{card.value}</h3>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. RECHARTS ANALYTICS VIEWPORTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Circulation Chart Overlap */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Circulation Distribution</h3>
              <p className="text-xs text-slate-400">Comparing books checked out versus inventory volume returned.</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCirculation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="day" className="text-xs font-medium fill-slate-400" tickLine={false} />
                <YAxis className="text-xs font-medium fill-slate-400" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', border: 'none' }} />
                <Area type="monotone" dataKey="issued" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" name="Issued" />
                <Area type="monotone" dataKey="returned" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReturned)" name="Returned" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Ranking Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">High Velocity Titles</h3>
            <p className="text-xs text-slate-400">The top 5 most frequently requested items.</p>
          </div>
          <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBooks} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" className="text-xs font-semibold fill-slate-500 dark:fill-slate-400" axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', border: 'none' }} />
                <Bar dataKey="borrows" radius={[0, 4, 4, 0]} barSize={14}>
                  {topBooks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. CRITICAL ALERTS & LOGS MATRIX SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table: Extreme Overdue Risk Registers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Critical Overdue Accounts
            </h3>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">Action Required</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { book: 'Introduction to Algorithms', user: 'Arsalan Khan', days: 14, fine: 280 },
              { book: 'Cracking the Coding Interview', user: 'Zainab Malik', days: 9, fine: 180 },
              { book: 'Head First Design Patterns', user: 'Bilal Ahmed', days: 7, fine: 140 },
            ].map((alert, index) => (
              <div key={index} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.book}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Borrower: <span className="font-medium text-slate-600 dark:text-slate-300">{alert.user}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{alert.days} Days Late</span>
                  <p className="text-xs text-slate-400 mt-0.5">Rs. {alert.fine} Accumulated</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table: Depleted Stock Warning Metrics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Depleted Stock Watchlist
            </h3>
            <button className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline">
              Restock All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { book: 'Designing Data-Intensive Applications', category: 'Engineering', remaining: 0 },
              { book: 'Compilers: Principles, Techniques, and Tools', category: 'Computer Science', remaining: 1 },
              { book: 'Discrete Mathematics and Its Applications', category: 'Mathematics', remaining: 2 },
            ].map((stock, index) => (
              <div key={index} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stock.book}</h4>
                  <span className="inline-block text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded mt-1">{stock.category}</span>
                </div>
                <div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    stock.remaining === 0 
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {stock.remaining === 0 ? 'Out of Stock' : `${stock.remaining} Copies Left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}