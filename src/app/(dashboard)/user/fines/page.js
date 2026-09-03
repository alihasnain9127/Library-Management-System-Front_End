'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCirculationRecords } from '@/redux/slices/circulationSlice';
import { calculateOverdueMetrics } from '@/utils/fineCalculator';
import { format, parseISO } from 'date-fns';
import { Wallet, ShieldAlert, CheckCircle, Hourglass } from 'lucide-react';

export default function UserBorrowedAndFinesView() {
  const dispatch = useDispatch();
  const { records, loading } = useSelector((state) => state.circulation);

  useEffect(() => {
    dispatch(fetchCirculationRecords('user'));
  }, [dispatch]);

  // Aggregate outstanding liabilities
  const totalOutstandingFine = records.reduce((sum, rec) => {
    if (rec.status === 'returned' && !rec.finePaid) return sum + (rec.fine || 0);
    if (rec.status === 'borrowed') return sum + calculateOverdueMetrics(rec.returnDate).fineAmount;
    return sum;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Dynamic Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accumulated Balance</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">Rs. {totalOutstandingFine}</h3>
            <p className="text-xs text-slate-400 mt-1">Settle at main desk to resume full borrowing privileges.</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-xl">
            <Wallet className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Book Holdings</span>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-1">
              {records.filter(r => r.status === 'borrowed').length} Books
            </h3>
            <p className="text-xs text-slate-400 mt-1">Check return schedules below to avoid overdue fines.</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl">
            <Hourglass className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Circulation History List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-50">Borrowing Ledger & Accountability Trail</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading transaction history...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No previous book transactions logged on this profile.</div>
          ) : (
            records.map((rec) => {
              const isReturned = rec.status === 'returned';
              const metrics = calculateOverdueMetrics(rec.returnDate, rec.actualReturnDate);
              
              return (
                <div key={rec._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{rec.bookId?.title}</h4>
                    <p className="text-xs text-slate-500">Author: <span className="font-medium text-slate-700 dark:text-slate-300">{rec.bookId?.author}</span></p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <span>Borrowed: <strong>{rec.borrowDate ? format(parseISO(rec.borrowDate), 'dd MMM yyyy') : '—'}</strong></span>
                      <span>Expected Return: <strong className="text-slate-600 dark:text-slate-300">{rec.returnDate ? format(parseISO(rec.returnDate), 'dd MMM yyyy') : '—'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:text-right shrink-0">
                    <div>
                      {isReturned ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" /> Returned
                          </span>
                          {(rec.fine || 0) > 0 && (
                            <p className="text-xs font-semibold mt-1 text-slate-500">
                              Fine (Rs. {rec.fine}): {rec.finePaid ? 'Settled' : 'Unpaid'}
                            </p>
                          )}
                        </div>
                      ) : metrics.daysOverdue > 0 ? (
                        <div className="sm:text-right space-y-1">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                            <ShieldAlert className="w-3 h-3" /> Overdue by {metrics.daysOverdue} Days
                          </span>
                          <p className="text-xs font-bold text-red-500">Accruing Fine: Rs. {metrics.fineAmount}</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
                          Active Loan
                        </span>
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