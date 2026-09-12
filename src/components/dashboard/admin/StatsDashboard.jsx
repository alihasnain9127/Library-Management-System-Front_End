'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Library, ArrowUpRight, ArrowDownRight, AlertTriangle,
  DollarSign, Activity, BookOpen, ChevronRight,
  RefreshCw, Package, CheckCircle2, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts';
import api from '@/services/api';
import toast from 'react-hot-toast';

const CACHE_KEY = 'libos_admin_dashboard_cache_v1';
const CACHE_TTL_MS = 30 * 1000; // 30 seconds client-side freshness window

const ICON_MAP = {
  members: Users,
  catalog: Library,
  issued: BookOpen,
  overdue: AlertTriangle,
  fines: DollarSign,
  health: Activity,
};

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
  const Icon = ICON_MAP[card.id] || card.icon || Activity;
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

      {/* Big Display Metric */}
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [timeAgoText, setTimeAgoText] = useState('syncing…');
  const [error, setError] = useState(null);

  // Read initial cache from sessionStorage for instant zero-latency paint
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data) {
          setData(parsed.data);
          setLastSynced(new Date(parsed.timestamp));
          setLoading(false);
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, []);

  // Fetch real-time dashboard data from backend
  const fetchDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);

    try {
      const url = isManual ? '/reports/dashboard-stats?refresh=true' : '/reports/dashboard-stats';
      const response = await api.get(url);
      const resData = response.data?.data;

      if (resData) {
        setData(resData);
        const syncTime = new Date();
        setLastSynced(syncTime);
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: resData, timestamp: syncTime.getTime() })
          );
        } catch {
          // Ignore quota errors
        }
      }
    } catch (err) {
      console.error('Failed to load real-time analytics:', err);
      setError(err?.response?.data?.message || 'Unable to sync live analytics');
      if (isManual) {
        toast.error('Failed to refresh dashboard data.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-polling every 30 seconds
  useEffect(() => {
    fetchDashboardData(false);

    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, CACHE_TTL_MS);

    // Refresh when tab regains visibility/focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboardData]);

  // Sync elapsed timer ticker (e.g. "Synced just now", "Synced 15s ago")
  useEffect(() => {
    if (!lastSynced) return;

    const updateTimer = () => {
      const elapsedSec = Math.floor((Date.now() - lastSynced.getTime()) / 1000);
      if (elapsedSec < 5) {
        setTimeAgoText('Synced just now');
      } else if (elapsedSec < 60) {
        setTimeAgoText(`Synced ${elapsedSec}s ago`);
      } else {
        const mins = Math.floor(elapsedSec / 60);
        setTimeAgoText(`Synced ${mins}m ago`);
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 5000);
    return () => clearInterval(timerId);
  }, [lastSynced]);

  if (loading && !data) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin text-blue-500" />
          <span className="text-sm font-medium">Aggregating real-time library analytics…</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || [];
  const monthlyCirculation = data?.monthlyCirculation || [];
  const topBooks = data?.topBooks || [];
  const overdueAlerts = data?.overdueAlerts || [];
  const depletedStock = data?.depletedStock || [];

  return (
    <div className="space-y-8">

      {/* ── Real-Time Sync & Status Header Bar ───────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Live Backend Stream</span>
          <span>•</span>
          <span>{timeAgoText}</span>
          {data?.cachedAt && (
            <span className="hidden md:inline text-[11px] text-slate-400">
              (Server cache TTL: 30s)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="h-8 px-3.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white font-semibold text-xs rounded-xl transition-all duration-150 flex items-center gap-2 border border-blue-200/60 dark:border-blue-800/40 shadow-sm active:scale-[0.98] self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing…' : 'Sync Now'}</span>
        </button>
      </div>

      {error && !data && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-center justify-between text-sm text-red-600 dark:text-red-400">
          <span>{error}</span>
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 1. KPI Metric Tiles ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {metrics.map((card, idx) => (
          <MetricCard key={card.id || idx} card={card} />
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
              <p className="text-xs text-slate-400 mt-0.5">Real-time loans issued vs returned over past 14 days</p>
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
                  allowDecimals={false}
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
            <p className="text-xs text-slate-400 mt-0.5">Top 5 most borrowed library books</p>
          </div>

          <div className="h-72 w-full">
            {topBooks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No circulation velocity yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Top titles will appear as books are checked out.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBooks} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
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
            )}
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
              <span className={`w-2.5 h-2.5 rounded-full ${overdueAlerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              Critical Overdue Accounts
            </h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              overdueAlerts.length > 0
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200/50 dark:border-red-900/40'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-900/40'
            }`}>
              {overdueAlerts.length > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {overdueAlerts.length === 0 ? (
              <div className="px-6 py-10 text-center flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Overdue Borrowers</p>
                <p className="text-xs text-slate-400">All active student and faculty book loans are within due date limits.</p>
              </div>
            ) : (
              overdueAlerts.map((alert, idx) => (
                <div key={alert._id || idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
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
              ))
            )}
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
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              depletedStock.length > 0
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/50 dark:border-amber-900/40'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-900/40'
            }`}>
              {depletedStock.length > 0 ? 'Low Stock' : 'Stock Optimal'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {depletedStock.length === 0 ? (
              <div className="px-6 py-10 text-center flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Catalog Inventory Healthy</p>
                <p className="text-xs text-slate-400">All registered library books currently have adequate stock on shelves.</p>
              </div>
            ) : (
              depletedStock.map((stock, idx) => (
                <div key={stock._id || idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}