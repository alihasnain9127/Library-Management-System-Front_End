'use client';

import React from 'react';
import { BarChart3, Download, FileSpreadsheet, Calendar, TrendingUp, Users, ArrowUpRight, BookOpen } from 'lucide-react';

export default function AdminReportsPage() {
  const reportCards = [
    {
      title: "Monthly Circulation Summary",
      desc: "Full breakdown of borrowings, returns, and on-time return percentages.",
      period: "May 2026",
      format: "PDF & CSV",
      icon: TrendingUp,
      badge: "Monthly"
    },
    {
      title: "Patron Liability & Fine Audit",
      desc: "Itemized record of assessed fines, collected payments, and waivers.",
      period: "Year to Date",
      format: "CSV",
      icon: Users,
      badge: "Financial"
    },
    {
      title: "Catalog Utilization & Stock Velocity",
      desc: "High-demand titles, depleted categories, and low-rotation inventory.",
      period: "Q2 2026",
      format: "XLSX",
      icon: BookOpen,
      badge: "Inventory"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review circulation performance, fine collection ledgers, and academic inventory trends.
          </p>
        </div>
        <button 
          type="button"
          onClick={() => alert("Generating full institutional library report package...")}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-sm active:scale-[0.98] self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export All Ledgers</span>
        </button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCards.map((r, i) => {
          const Icon = r.icon;
          return (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-0.5"
              style={{ boxShadow: 'var(--shadow-e1)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {r.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-1.5">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {r.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {r.period}
                </span>
                <button 
                  type="button"
                  onClick={() => alert(`Downloading ${r.title}...`)}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Banner */}
      <div 
        className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">Automated Weekly Delivery</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled library digests are delivered to configured staff email recipients every Monday.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40">
          Scheduler Active
        </span>
      </div>
    </div>
  );
}
