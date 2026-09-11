"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCirculationRecords } from "@/redux/slices/circulationSlice";
import { calculateOverdueMetrics } from "@/utils/fineCalculator";
import { format, parseISO } from "date-fns";
import { Loader2, Clock3, BookOpen, Wallet, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UserDashboardClient() {
  const dispatch = useDispatch();
  const [hasMounted, setHasMounted] = useState(false);

  const userFromStore = useSelector((state) => state.auth.user);
  const recordsFromStore = useSelector((state) => state.circulation.records);
  const loading = useSelector((state) => state.circulation.loading);

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
    dispatch(fetchCirculationRecords("user"));
  }, [dispatch]);

  const user = hasMounted ? userFromStore : null;
  const records = hasMounted ? recordsFromStore : [];

  // Normalize status checks across backend schemas (status: 'borrowed' or 'Issued')
  const isRecordActive = (rec) => {
    const s = String(rec.status || '').toLowerCase();
    return s === 'borrowed' || s === 'issued';
  };

  const activeLoans = records.filter(isRecordActive);
  const overdueLoans = activeLoans.filter(
    (rec) => calculateOverdueMetrics(rec.returnDate || rec.dueDate).daysOverdue > 0,
  );
  const totalOutstandingFine = records.reduce((sum, rec) => {
    const s = String(rec.status || '').toLowerCase();
    const date = rec.returnDate || rec.dueDate;
    if (s === "returned" && !rec.finePaid) return sum + (rec.fineAmount || rec.fine || 0);
    if (isRecordActive(rec)) return sum + calculateOverdueMetrics(date).fineAmount;
    return sum;
  }, 0);

  const nextDueItems = activeLoans
    .map((rec) => {
      const targetDateStr = rec.returnDate || rec.dueDate;
      const targetDate = targetDateStr ? parseISO(targetDateStr) : new Date();
      return {
        ...rec,
        dueDateObj: targetDate,
        targetDateStr,
        daysUntilDue: Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24)),
      };
    })
    .sort((a, b) => a.dueDateObj - b.dueDateObj)
    .slice(0, 4);

  const returnProgressPercent = records.length === 0
    ? 100
    : Math.round(((records.length - activeLoans.length) / records.length) * 100);

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {hasMounted && user?.name ? (
              <>Welcome back, {user.name.split(" ")[0]}</>
            ) : (
              <>Welcome back, Scholar</>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track active academic book loans, upcoming due dates, and circulation history.
          </p>
        </div>
        <Link
          href="/user/books"
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-sm active:scale-[0.98] self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>

      {/* ── 4 KPI Metric Tiles ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Active Loans */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Loans
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {activeLoans.length}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            {activeLoans.length === 1 ? '1 book currently borrowed' : `${activeLoans.length} books in possession`}
          </p>
        </div>

        {/* Overdue Items */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Overdue Items
            </span>
            <div className={`p-2.5 rounded-xl border ${
              overdueLoans.length > 0 
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-100 dark:border-red-900/30' 
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
            }`}>
              <Clock3 className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            overdueLoans.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-50'
          }`}>
            {overdueLoans.length}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            {overdueLoans.length > 0 ? 'Immediate return required' : 'No overdue liabilities'}
          </p>
        </div>

        {/* Outstanding Fine */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Outstanding Fine
            </span>
            <div className={`p-2.5 rounded-xl border ${
              totalOutstandingFine > 0 
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' 
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            totalOutstandingFine > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-50'
          }`}>
            Rs. {totalOutstandingFine}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            {totalOutstandingFine > 0 ? 'Settle at front desk' : 'Account in good standing'}
          </p>
        </div>

        {/* Return Progress */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Return Rate
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {records.length === 0 ? "—" : `${returnProgressPercent}%`}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            Lifetime return completion
          </p>
        </div>
      </div>

      {/* ── Upcoming Returns Section ──────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Upcoming Returns
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Books due in rotation — return on time to avoid Rs. 20/day penalty.
            </p>
          </div>
          <Link
            href="/user/borrowed"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All ({activeLoans.length}) →
          </Link>
        </div>

        {loading || !hasMounted ? (
          <div 
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-400"
            style={{ boxShadow: 'var(--shadow-e1)' }}
          >
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Checking active borrowing records…</span>
          </div>
        ) : nextDueItems.length === 0 ? (
          <div 
            className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center"
            style={{ boxShadow: 'var(--shadow-e1)' }}
          >
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">No books currently due</p>
            <p className="text-xs text-slate-400 mt-1">Browse the library catalog to borrow your next academic title.</p>
            <Link
              href="/user/books"
              className="inline-block mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse catalog →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {nextDueItems.map((record) => {
              const metrics = calculateOverdueMetrics(record.targetDateStr);
              const isOverdue = metrics.daysOverdue > 0;
              const title = record.bookId?.title || "Academic Title";
              const author = record.bookId?.author || "Author";

              return (
                <div
                  key={record._id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: 'var(--shadow-e1)' }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isOverdue
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/50 dark:border-red-900/40'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50 dark:border-blue-900/40'
                      }`}>
                        {isOverdue ? `${metrics.daysOverdue}d Overdue` : record.daysUntilDue === 0 ? 'Due Today' : `${record.daysUntilDue}d Left`}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 line-clamp-1">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {author}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due Date:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {record.targetDateStr ? format(parseISO(record.targetDateStr), "dd MMM yyyy") : "—"}
                      </strong>
                    </div>
                    {isOverdue && (
                      <p className="mt-1.5 font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Fine Accruing: Rs. {metrics.fineAmount}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
