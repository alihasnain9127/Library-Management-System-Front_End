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
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const STATUS_LABELS = {
  borrowed: 'Borrowed',
  issued: 'Borrowed',
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
  if (typeof bookId === 'string') return { title: 'Academic Title', author: '' };
  return {
    title: bookId.title || 'Untitled record',
    author: bookId.author || 'Unknown author',
  };
};

const normalizeUserId = (userId) => {
  if (!userId) return { name: 'Academic Scholar', email: '' };
  if (typeof userId === 'string') return { name: 'Scholar', email: '' };
  return {
    name: userId.name || 'Academic Scholar',
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

  const isAdmin = hasMounted && user?.role === 'admin';
  const [adminScope, setAdminScope] = useState('all'); // 'all' | 'mine'

  const [returnConfirmId, setReturnConfirmId] = useState(null);
  const [fineConfirmId, setFineConfirmId] = useState(null);

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

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

  const confirmReturn = () => {
    if (returnConfirmId) {
      dispatch(processBookReturn({ recordId: returnConfirmId, remarks: 'Returned via Desk' }));
      setReturnConfirmId(null);
    }
  };

  const confirmFine = () => {
    if (fineConfirmId) {
      dispatch(collectFinePayment(fineConfirmId));
      setFineConfirmId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header with Scope Segmented Control ───── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {isAdmin && adminScope === 'all' ? 'All Circulation Records' : 'My Borrowed Items'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin && adminScope === 'all'
              ? 'Monitor the global library circulation ledger and process patron actions.'
              : 'Track your borrowed items, due dates, and circulation history.'}
          </p>
        </div>

        {isAdmin && (
          <AdminScopeToggle scope={adminScope} onChange={setAdminScope} disabled={loading || actionLoading} />
        )}
      </div>

      {/* ── Dynamic Summary Panel ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between transition-all"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outstanding Liabilities
            </span>
            <h3 className={`text-3xl font-extrabold tracking-tight mt-1 ${
              totalOutstandingFine > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-50'
            }`}>
              Rs. {totalOutstandingFine}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {totalOutstandingFine > 0 ? 'Settle at front desk' : 'Zero outstanding balance'}
            </p>
          </div>
          <div className={`p-3.5 rounded-xl border ${
            totalOutstandingFine > 0 
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' 
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
              {isAdmin && adminScope === 'all' ? 'Total Active Checkouts' : 'Active Borrowed Books'}
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 mt-1">
              {activeLoans.length} {activeLoans.length === 1 ? 'Book' : 'Books'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Check expected return schedules below to avoid overdue fines.
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <Hourglass className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* ── Records Container ─────────────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">
            {isAdmin && adminScope === 'all' ? 'Master Circulation Ledger' : 'Borrowing Records & Accountability Trail'}
          </h3>
          {(loading || actionLoading) && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
        </div>

        {isAdmin && adminScope === 'all' ? (
          <AdminLedgerTable
            records={recordsView}
            loading={loading}
            onReturn={(id) => setReturnConfirmId(id)}
            onSettleFine={(id) => setFineConfirmId(id)}
            actionLoading={actionLoading}
          />
        ) : (
          <UserLedgerList
            records={recordsView}
            loading={loading}
            onReturn={(id) => setReturnConfirmId(id)}
            actionLoading={actionLoading}
          />
        )}
      </div>

      {/* Branded Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!returnConfirmId}
        onClose={() => setReturnConfirmId(null)}
        onConfirm={confirmReturn}
        title="Return This Book"
        message="Please confirm you are returning this book to the library desk. This action cannot be undone."
        confirmText="Confirm Return"
        isDanger={false}
      />

      <ConfirmationModal
        isOpen={!!fineConfirmId}
        onClose={() => setFineConfirmId(null)}
        onConfirm={confirmFine}
        title="Clear Outstanding Fine"
        message="Confirm payment collection and settlement for this overdue fine?"
        confirmText="Settle Fine"
        isDanger={false}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Admin scope toggle (segmented control)                                   */
/* -------------------------------------------------------------------------- */
function AdminScopeToggle({ scope, onChange, disabled }) {
  return (
    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('all')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-60 ${
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
        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-60 ${
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
/*  User ledger list (card style for patron)                                  */
/* -------------------------------------------------------------------------- */
function UserLedgerList({ records, loading, onReturn, actionLoading }) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-sm">Loading your borrow history…</span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
        <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-1" />
        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No borrowed books</p>
        <p className="text-xs max-w-xs">Explore the catalog to borrow academic titles for your research.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
      {records.map((rec) => {
        const status = normalizeStatus(rec.status);
        const isReturned = status === 'Returned';
        const metrics = calculateOverdueMetrics(rec.returnDate, rec.actualReturnDate);
        const book = normalizeBookId(rec.bookId);
        const fineAmount = rec.fineAmount ?? rec.fine ?? 0;

        return (
          <div
            key={rec._id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-base">{book.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Author: <span className="font-medium text-slate-700 dark:text-slate-300">{book.author}</span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                {rec.borrowDate && (
                  <span>
                    Borrowed: <strong className="text-slate-600 dark:text-slate-300">{format(parseISO(rec.borrowDate), 'dd MMM yyyy')}</strong>
                  </span>
                )}
                {rec.returnDate && (
                  <span>
                    Due Date:{' '}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {format(parseISO(rec.returnDate), 'dd MMM yyyy')}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:text-right shrink-0">
              <div>
                {isReturned ? (
                  <div className="sm:text-right">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Returned Safely
                    </span>
                    {fineAmount > 0 && (
                      <p className="text-xs font-semibold mt-1 text-slate-500">
                        Fine: Rs. {fineAmount} ({rec.finePaid ? 'Settled' : 'Unpaid'})
                      </p>
                    )}
                  </div>
                ) : metrics.daysOverdue > 0 ? (
                  <div className="sm:text-right space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 px-2.5 py-0.5 rounded-full">
                      <ShieldAlert className="w-3.5 h-3.5" /> {metrics.daysOverdue} Days Overdue
                    </span>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Fine: Rs. {metrics.fineAmount}
                    </p>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> Active Loan
                  </span>
                )}
              </div>

              {/* Return button — only for active (non-returned) loans */}
              {!isReturned && typeof onReturn === 'function' && (
                <button
                  type="button"
                  onClick={() => onReturn(rec._id)}
                  disabled={actionLoading}
                  className="h-8 px-3 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white font-semibold text-xs rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 border border-teal-200/60 dark:border-teal-800/40 shadow-sm disabled:opacity-60 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Return Book
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Admin ledger table                                                        */
/* -------------------------------------------------------------------------- */
function AdminLedgerTable({ records, loading, onReturn, onSettleFine, actionLoading }) {
  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading master ledger components…</div>;
  }

  if (records.length === 0) {
    return <div className="p-12 text-center text-slate-400">No active circulation entries recorded.</div>;
  }

  return (
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
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3.5 px-5">
                  <p className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1 max-w-xs sm:max-w-sm">
                    {book.title}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {rec._id.slice(-8)}</p>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.email}</p>
                </td>
                <td className="py-3.5 px-4 space-y-0.5 text-xs">
                  {rec.borrowDate && (
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
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
                <td className="py-3.5 px-4">
                  {isReturned ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Returned
                      </span>
                      {!rec.finePaid && fineAmount > 0 && (
                        <p className="text-xs text-red-500 font-semibold">Unpaid fine: Rs. {fineAmount}</p>
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
                      onClick={() => onReturn(rec._id)}
                      disabled={actionLoading}
                      className="h-8 px-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white font-semibold text-xs rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/40 ml-auto shadow-sm disabled:opacity-60"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Process Return
                    </button>
                  ) : fineAmount > 0 && !rec.finePaid ? (
                    <button
                      type="button"
                      onClick={() => onSettleFine(rec._id)}
                      disabled={actionLoading}
                      className="h-8 px-3 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white font-semibold text-xs rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800/40 ml-auto shadow-sm disabled:opacity-60"
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" /> Clear Fine
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Completed</span>
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
