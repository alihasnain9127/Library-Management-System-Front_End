'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCirculationRecords } from '@/redux/slices/circulationSlice';
import { calculateOverdueMetrics } from '@/utils/fineCalculator';
import { format, parseISO } from 'date-fns';
import { Wallet, ShieldAlert, CheckCircle, Hourglass, DollarSign, BookOpen, AlertCircle } from 'lucide-react';

export default function UserFinesView() {
  const dispatch = useDispatch();
  const { records, loading } = useSelector((state) => state.circulation);

  useEffect(() => {
    dispatch(fetchCirculationRecords('user'));
  }, [dispatch]);

  const isRecordActive = (rec) => {
    const s = String(rec.status || '').toLowerCase();
    return s === 'borrowed' || s === 'issued';
  };

  // Aggregate outstanding liabilities
  const totalOutstandingFine = records.reduce((sum, rec) => {
    const s = String(rec.status || '').toLowerCase();
    const date = rec.returnDate || rec.dueDate;
    if (s === 'returned' && !rec.finePaid) return sum + (rec.fine || rec.fineAmount || 0);
    if (isRecordActive(rec)) return sum + calculateOverdueMetrics(date).fineAmount;
    return sum;
  }, 0);

  const fineRecords = records.filter((rec) => {
    const s = String(rec.status || '').toLowerCase();
    const date = rec.returnDate || rec.dueDate;
    const hasPastFine = (rec.fine || rec.fineAmount || 0) > 0;
    const hasActiveFine = isRecordActive(rec) && calculateOverdueMetrics(date).daysOverdue > 0;
    return hasPastFine || hasActiveFine;
  });

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Fines & Liabilities
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review overdue fine assessments, outstanding balances, and receipt history.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            Fine Rate: <strong>Rs. 20 / day</strong>
          </span>
        </div>
      </div>

      {/* ── Dynamic Summary Panel ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between transition-all"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Outstanding Balance
            </span>
            <h3 className={`text-3xl font-extrabold tracking-tight mt-1 ${
              totalOutstandingFine > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-50'
            }`}>
              Rs. {totalOutstandingFine}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {totalOutstandingFine > 0 ? 'Settle at front circulation desk' : 'Zero outstanding balance'}
            </p>
          </div>
          <div className={`p-3.5 rounded-xl border ${
            totalOutstandingFine > 0 
              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-100 dark:border-red-900/30' 
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
          }`}>
            <Wallet className="w-7 h-7" />
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between transition-all"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Liabilities Count
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
              {fineRecords.length} {fineRecords.length === 1 ? 'Notice' : 'Notices'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Recorded across your academic borrowing history.
            </p>
          </div>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* ── Circulation Fines History ─────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">
            Fine Ledgers & Accountability Record
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading fine records…</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-1" />
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">No transaction records</p>
              <p className="text-xs">No library rentals are registered on your account.</p>
            </div>
          ) : (
            records.map((rec) => {
              const s = String(rec.status || '').toLowerCase();
              const isReturned = s === 'returned';
              const returnDate = rec.returnDate || rec.dueDate;
              const metrics = calculateOverdueMetrics(returnDate, rec.actualReturnDate);
              const assessedFine = rec.fine || rec.fineAmount || 0;
              const currentFine = isReturned ? assessedFine : metrics.fineAmount;
              
              return (
                <div 
                  key={rec._id} 
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-50 text-base">
                      {rec.bookId?.title || 'Academic Title'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Author: <span className="font-medium text-slate-700 dark:text-slate-300">{rec.bookId?.author || 'Unknown'}</span>
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <span>Borrowed: <strong>{rec.borrowDate ? format(parseISO(rec.borrowDate), 'dd MMM yyyy') : '—'}</strong></span>
                      <span>Target Due: <strong>{returnDate ? format(parseISO(returnDate), 'dd MMM yyyy') : '—'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:text-right shrink-0">
                    <div>
                      {isReturned ? (
                        <div className="sm:text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" /> Returned
                          </span>
                          {assessedFine > 0 ? (
                            <p className={`text-xs font-semibold mt-1 ${rec.finePaid ? 'text-slate-500' : 'text-red-500 font-bold'}`}>
                              Fine: Rs. {assessedFine} ({rec.finePaid ? 'Settled' : 'Unpaid'})
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 mt-1">Returned on time (Rs. 0)</p>
                          )}
                        </div>
                      ) : metrics.daysOverdue > 0 ? (
                        <div className="sm:text-right space-y-1">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 px-2.5 py-0.5 rounded-full">
                            <ShieldAlert className="w-3.5 h-3.5" /> {metrics.daysOverdue} Days Overdue
                          </span>
                          <p className="text-xs font-bold text-red-600 dark:text-red-400">
                            Accruing: Rs. {metrics.fineAmount}
                          </p>
                        </div>
                      ) : (
                        <div className="sm:text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 px-2.5 py-0.5 rounded-full">
                            Active Loan
                          </span>
                          <p className="text-xs text-slate-400 mt-1">No overdue liability</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}