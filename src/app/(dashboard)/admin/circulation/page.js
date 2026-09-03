'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCirculationRecords, processBookReturn, collectFinePayment } from '@/redux/slices/circulationSlice';
import { calculateOverdueMetrics } from '@/utils/fineCalculator';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Clock, AlertTriangle, CircleDollarSign, RotateCcw } from 'lucide-react';

export default function AdminCirculationLedger() {
  const dispatch = useDispatch();
  const { records, loading } = useSelector((state) => state.circulation);

  useEffect(() => {
    dispatch(fetchCirculationRecords('admin'));
  }, [dispatch]);

  const handleTriggerReturn = (id, dueDate) => {
    const { fineAmount } = calculateOverdueMetrics(dueDate);
    if (window.confirm(`Process verification for book entry return? System evaluated fine payload: Rs. ${fineAmount}`)) {
      dispatch(processBookReturn({ recordId: id, remarks: 'Returned via Admin Desk' }));
    }
  };

  const handleSettleFine = (id) => {
    if (window.confirm('Confirm raw cash collection or digital fine clearing receipt?')) {
      dispatch(collectFinePayment(id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Global Circulation Desk</h1>
        <p className="text-sm text-slate-500">Track active rentals, monitor deadlines, and clear outstanding balances.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="p-4">Asset Details</th>
                <th className="p-4">Borrower Info</th>
                <th className="p-4">Temporal Range</th>
                <th className="p-4">Status & Liability</th>
                <th className="p-4 text-right">Desk Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading master ledger components...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No active library rental actions currently logged.</td></tr>
              ) : (
                records.map((rec) => {
                  const isReturned = rec.status === 'returned';
                  const liveOverdue = calculateOverdueMetrics(rec.returnDate, rec.actualReturnDate);
                  
                  return (
                    <tr key={rec._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1">{rec.bookId?.title || 'System Deletion Book'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {rec._id}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{rec.userId?.name}</p>
                        <p className="text-xs text-slate-400">{rec.userId?.email}</p>
                      </td>
                      <td className="p-4 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="font-medium">Borrowed:</span> {rec.borrowDate ? format(parseISO(rec.borrowDate), 'dd MMM yyyy') : '—'}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <span>Target Due:</span> {rec.returnDate ? format(parseISO(rec.returnDate), 'dd MMM yyyy') : '—'}
                        </div>
                      </td>
                      <td className="p-4">
                        {isReturned ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Returned Safely
                            </span>
                            {rec.finePaid === false && (rec.fine || 0) > 0 && (
                              <p className="text-xs text-red-500 font-bold">Unpaid Fine: Rs. {rec.fine}</p>
                            )}
                          </div>
                        ) : liveOverdue.daysOverdue > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3.5 h-3.5" /> {liveOverdue.daysOverdue} Days Overdue
                            </span>
                            <p className="text-xs text-amber-600 font-semibold">Fine Pool: Rs. {liveOverdue.fineAmount}</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md">
                            <Clock className="w-3.5 h-3.5" /> Checked Out
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!isReturned ? (
                          <button 
                            onClick={() => handleTriggerReturn(rec._id, rec.returnDate)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Process Return
                          </button>
                        ) : (rec.fine || 0) > 0 && !rec.finePaid ? (
                          <button 
                            onClick={() => handleSettleFine(rec._id)}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 ml-auto"
                          >
                            <CircleDollarSign className="w-3.5 h-3.5" /> Clear Fine
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">No Action Required</span>
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
    </div>
  );
}