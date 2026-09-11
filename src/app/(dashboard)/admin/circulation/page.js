'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCirculationRecords, processBookReturn, collectFinePayment } from '@/redux/slices/circulationSlice';
import { calculateOverdueMetrics } from '@/utils/fineCalculator';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Clock, AlertTriangle, CircleDollarSign, RotateCcw, ArrowLeftRight, BookOpen } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function AdminCirculationLedger() {
  const dispatch = useDispatch();
  const { records, loading, actionLoading } = useSelector((state) => state.circulation);

  const [returnConfirmRecord, setReturnConfirmRecord] = useState(null);
  const [fineConfirmRecord, setFineConfirmRecord] = useState(null);

  useEffect(() => {
    dispatch(fetchCirculationRecords('admin'));
  }, [dispatch]);

  const confirmProcessReturn = () => {
    if (returnConfirmRecord) {
      dispatch(processBookReturn({ 
        recordId: returnConfirmRecord._id, 
        remarks: 'Returned via Admin Desk' 
      }));
      setReturnConfirmRecord(null);
    }
  };

  const confirmClearFine = () => {
    if (fineConfirmRecord) {
      dispatch(collectFinePayment(fineConfirmRecord._id));
      setFineConfirmRecord(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Circulation Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track active book loans, process returns, and settle patron liabilities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <strong>{records.length}</strong> Total Ledger Entries
          </span>
        </div>
      </div>

      {/* ── Main Ledger Table ───────────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold select-none">
                <th className="py-3.5 px-5">Asset Details</th>
                <th className="py-3.5 px-4">Borrower Info</th>
                <th className="py-3.5 px-4">Timeline</th>
                <th className="py-3.5 px-4">Status & Liability</th>
                <th className="py-3.5 px-5 text-right">Desk Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ArrowLeftRight className="w-8 h-8 text-blue-500 animate-pulse" />
                      <span className="text-sm font-medium">Syncing global circulation ledger…</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-200">No circulation records</p>
                      <p className="text-xs text-slate-400">No active book loans or returns have been recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const isReturned = rec.status === 'returned';
                  const liveOverdue = calculateOverdueMetrics(rec.returnDate, rec.actualReturnDate);
                  const title = rec.bookId?.title || 'Unknown Title';
                  const borrowerName = rec.userId?.name || 'Academic Scholar';
                  const borrowerEmail = rec.userId?.email || '—';
                  const fine = rec.fineAmount ?? rec.fine ?? 0;
                  
                  return (
                    <tr 
                      key={rec._id} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1 max-w-xs sm:max-w-md">
                          {title}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ID: {rec._id.slice(-8)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {borrowerName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {borrowerEmail}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <span className="font-medium">Borrowed:</span> 
                          <span>{rec.borrowDate ? format(parseISO(rec.borrowDate), 'dd MMM yyyy') : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <span>Target Due:</span> 
                          <span>{rec.returnDate ? format(parseISO(rec.returnDate), 'dd MMM yyyy') : '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isReturned ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Returned
                            </span>
                            {rec.finePaid === false && fine > 0 && (
                              <p className="text-xs text-red-500 font-semibold">Unpaid fine: Rs. {fine}</p>
                            )}
                          </div>
                        ) : liveOverdue.daysOverdue > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 px-2.5 py-0.5 rounded-full">
                              <AlertTriangle className="w-3.5 h-3.5" /> {liveOverdue.daysOverdue} Days Overdue
                            </span>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                              Fine: Rs. {liveOverdue.fineAmount}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5" /> Checked Out
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {!isReturned ? (
                          <button 
                            type="button"
                            onClick={() => setReturnConfirmRecord(rec)}
                            disabled={actionLoading}
                            className="h-8 px-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white font-semibold text-xs rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/40 ml-auto shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> 
                            <span>Process Return</span>
                          </button>
                        ) : fine > 0 && !rec.finePaid ? (
                          <button 
                            type="button"
                            onClick={() => setFineConfirmRecord(rec)}
                            disabled={actionLoading}
                            className="h-8 px-3 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white font-semibold text-xs rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800/40 ml-auto shadow-sm"
                          >
                            <CircleDollarSign className="w-3.5 h-3.5" /> 
                            <span>Clear Fine</span>
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Branded Confirmation Modals ──────────────────── */}
      <ConfirmationModal
        isOpen={!!returnConfirmRecord}
        onClose={() => setReturnConfirmRecord(null)}
        onConfirm={confirmProcessReturn}
        title="Confirm Book Return"
        message={`Process return for "${returnConfirmRecord?.bookId?.title || 'this book'}" checked out by ${returnConfirmRecord?.userId?.name || 'the borrower'}? Overdue liabilities (if any) will be recorded.`}
        confirmText="Confirm Return"
        isDanger={false}
      />

      <ConfirmationModal
        isOpen={!!fineConfirmRecord}
        onClose={() => setFineConfirmRecord(null)}
        onConfirm={confirmClearFine}
        title="Confirm Fine Settlement"
        message={`Confirm receipt and settlement of outstanding fine (Rs. ${fineConfirmRecord?.fine || 0}) for "${fineConfirmRecord?.bookId?.title || 'this book'}"?`}
        confirmText="Settle Fine"
        isDanger={false}
      />
    </div>
  );
}