'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCirculationRecords,
  processBookReturn,
  collectFinePayment,
} from '@/redux/slices/circulationSlice';
import { calculateOverdueMetrics } from '@/utils/fineCalculator';
import { format, parseISO } from 'date-fns';
import {
  Wallet,
  ShieldAlert,
  CheckCircle,
  Hourglass,
  BookOpen,
  Loader2,
  User as UserIcon,
  Globe2,
  RotateCcw,
  CircleDollarSign,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const STATUS_LABELS = {
  borrowed: 'Borrowed',
  returned: 'Returned',
  lost: 'Lost',
  damaged: 'Damaged',
};

const normalizeStatus = (status) => {
  if (!status) return 'Borrowed';
  const lower = String(status).toLowerCase();
  return STATUS_LABELS[lower] || status;
};

const normalizeBookId = (bookId) => {
  if (!bookId) return { title: 'Untitled record', author: 'Unknown author' };
  if (typeof bookId === 'string') return { title: 'Loading…', author: '' };
  return {
    title: bookId.title || 'Untitled record',
    author: bookId.author || 'Unknown author',
  };
};

const normalizeUserId = (userId) => {
  if (!userId) return { name: 'Unknown member', email: '' };
  if (typeof userId === 'string') return { name: 'Loading…', email: '' };
  return {
    name: userId.name || 'Unknown member',
    email: userId.email || '',
  };
};

const normalizeDateField = (record) => ({
  borrowDate: record.borrowDate || record.issueDate,
  returnDate: record.returnDate || record.dueDate,
  actualReturnDate: record.actualReturnDate || null,
});

export default function UserBorrowedAndFinesView() {
  const dispatch = useDispatch();
  const { records, loading, actionLoading } = useSelector((state) => state.circulation);
  const { user } = useSelector((state) => state.auth);
  const [hasMounted, setHasMounted] = useState(false);

  // Only admins see the toggle; users are pinned to their own records
  const isAdmin = hasMounted && user?.role === 'admin';
  const [adminScope, setAdminScope] = useState('all'); // 'all' | 'mine'

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  // Decide the effective role/scope we are fetching
  const fetchRole = useMemo(() => {
    if (isAdmin && adminScope === 'mine') return 'user';
    if (isAdmin) return 'admin';
    return 'user';
  }, [isAdmin, adminScope]);

  useEffect(() => {
    dispatch(fetchCirculationRecords(fetchRole));
  }, [dispatch, fetchRole]);

  const recordsView = useMemo(
    () => records.map((r) => ({ ...r, ...normalizeDateField(r) })),
    [records],
  );

  // Aggregate outstanding liabilities
  const totalOutstandingFine = recordsView.reduce((sum, rec) => {
    const status = normalizeStatus(rec.status);
    if (status === 'Returned' && !rec.finePaid) {
      return sum + (rec.fineAmount || rec.fine || 0);
    }
    if (status === 'Borrowed') {
      return sum + calculateOverdueMetrics(rec.returnDate).fineAmount;
    }
    return sum;
  }, 0);

  const activeLoans = recordsView.filter((r) => normalizeStatus(r.status) === 'Borrowed');

  const handleTriggerReturn = (id) => {
    if (window.confirm('Process verification for this book entry return?')) {
      dispatch(processBookReturn({ recordId: id, remarks: 'Returned via Admin Desk' }));
    }
  };

  const handleSettleFine = (id) => {
    if (window.confirm('Confirm raw cash collection or digital fine clearing receipt?')) {
      dispatch(collectFinePayment(id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Admin Scope Toggle */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {isAdmin && adminScope === 'all' ? 'All Circulation Records' : 'My Borrowed Items'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin && adminScope === 'all'
              ? 'Monitor the global library ledger, process returns, and clear outstanding balances.'
              : 'Track your active rentals, monitor deadlines, and review your borrowing history.'}
          </p>
        </div>

        {isAdmin && (
          <AdminScopeToggle scope={adminScope} onChange={setAdminScope} disabled={loading || actionLoading} />
        )}
      </div>

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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAdmin && adminScope === 'all' ? 'Currently Checked Out' : 'Active Book Holdings'}
            </span>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-1">
              {activeLoans.length} {activeLoans.length === 1 ? 'Book' : 'Books'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Check return schedules below to avoid overdue fines.</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl">
            <Hourglass className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Records list or table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-50">
            {isAdmin && adminScope === 'all' ? 'Borrowing Ledger' : 'Borrowing Ledger & Accountability Trail'}
          </h3>
          {(loading || actionLoading) && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
        </div>

        {isAdmin && adminScope === 'all' ? (
          <AdminLedgerTable
            records={recordsView}
            loading={loading}
            onReturn={handleTriggerReturn}
            onSettleFine={handleSettleFine}
            actionLoading={actionLoading}
          />
        ) : (
          <UserLedgerList records={recordsView} loading={loading} />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Admin scope toggle (visible only to admins)                              */
/* -------------------------------------------------------------------------- */
function AdminScopeToggle({ scope, onChange, disabled }) {
  return (
    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('all')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 ${
          scope === 'all'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Globe2 className="w-3.5 h-3.5" /> All Records
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('mine')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 ${
          scope === 'mine'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <UserIcon className="w-3.5 h-3.5" /> My Borrowed
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  User ledger (compact list with status pills)                              */
/* -------------------------------------------------------------------------- */
function UserLedgerList({ records, loading }) {
  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading transaction history...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
        <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700" />
        <p className="font-semibold text-slate-600 dark:text-slate-300">No records yet</p>
        <p className="text-xs">Browse the catalog to borrow your first book.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {records.map((rec) => {
        const status = normalizeStatus(rec.status);
        const isReturned = status === 'Returned';
        const metrics = calculateOverdueMetrics(rec.returnDate, rec.actualReturnDate);
        const book = normalizeBookId(rec.bookId);
        const fineAmount = rec.fineAmount ?? rec.fine ?? 0;

        return (
          <div
            key={rec._id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{book.title}</h4>
              <p className="text-xs text-slate-500">
                Author: <span className="font-medium text-slate-700 dark:text-slate-300">{book.author}</span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                {rec.borrowDate && (
                  <span>
                    Borrowed: <strong>{format(parseISO(rec.borrowDate), 'dd MMM yyyy')}</strong>
                  </span>
                )}
                {rec.returnDate && (
                  <span>
                    Expected Return:{' '}
                    <strong className="text-slate-600 dark:text-slate-300">
                      {format(parseISO(rec.returnDate), 'dd MMM yyyy')}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:text-right shrink-0">
              <div>
                {isReturned ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3" /> Returned
                    </span>
                    {fineAmount > 0 && (
                      <p className="text-xs font-semibold mt-1 text-slate-500">
                        Fine (Rs. {fineAmount}): {rec.finePaid ? 'Settled' : 'Unpaid'}
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
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Admin ledger (table with desk controls)                                   */
/* -------------------------------------------------------------------------- */
function AdminLedgerTable({ records, loading, onReturn, onSettleFine, actionLoading }) {
  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading master ledger components...</div>;
  }

  if (records.length === 0) {
    return <div className="p-8 text-center text-slate-400">No active library rental actions currently logged.</div>;
  }

  return (
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
          {records.map((rec) => {
            const status = normalizeStatus(rec.status);
            const isReturned = status === 'Returned';
            const liveOverdue = calculateOverdueMetrics(rec.returnDate, rec.actualReturnDate);
            const book = normalizeBookId(rec.bookId);
            const member = normalizeUserId(rec.userId);
            const fineAmount = rec.fineAmount ?? rec.fine ?? 0;

            return (
              <tr
                key={rec._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
              >
                <td className="p-4">
                  <p className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1">{book.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {rec._id}</p>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.email}</p>
                </td>
                <td className="p-4 space-y-0.5 text-xs">
                  {rec.borrowDate && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="font-medium">Borrowed:</span>{' '}
                      {format(parseISO(rec.borrowDate), 'dd MMM yyyy')}
                    </div>
                  )}
                  {rec.returnDate && (
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span>Target Due:</span> {format(parseISO(rec.returnDate), 'dd MMM yyyy')}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {isReturned ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5" /> Returned Safely
                      </span>
                      {!rec.finePaid && fineAmount > 0 && (
                        <p className="text-xs text-red-500 font-bold">Unpaid Fine: Rs. {fineAmount}</p>
                      )}
                    </div>
                  ) : liveOverdue.daysOverdue > 0 ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5" /> {liveOverdue.daysOverdue} Days Overdue
                      </span>
                      <p className="text-xs text-amber-600 font-semibold">
                        Fine Pool: Rs. {liveOverdue.fineAmount}
                      </p>
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
                      onClick={() => onReturn(rec._id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 ml-auto disabled:opacity-60"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Process Return
                    </button>
                  ) : fineAmount > 0 && !rec.finePaid ? (
                    <button
                      onClick={() => onSettleFine(rec._id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 ml-auto disabled:opacity-60"
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" /> Clear Fine
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">No Action Required</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
