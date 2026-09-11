'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ShieldAlert, ShieldCheck, AlertCircle, Loader2, Clock, CalendarClock, AlertTriangle } from 'lucide-react';

export default function SuspensionModal({ isOpen, onClose, user, onConfirm, isProcessing }) {
  const [reason, setReason] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(false);
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setReason('');
    setEndDate('');
    setIsIndefinite(false);
    setError('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !user) return null;

  const willSuspend = !user.isSuspended;

  const handleConfirm = () => {
    if (willSuspend) {
      if (!reason.trim()) {
        setError('A suspension reason is required');
        return;
      }
      if (!isIndefinite && endDate) {
        const parsedDate = new Date(endDate);
        if (parsedDate <= new Date()) {
          setError('Suspension end date must be in the future');
          return;
        }
      }
    }
    setError('');
    onConfirm({
      suspensionReason: reason.trim(),
      suspensionEndDate: isIndefinite ? null : (endDate || null),
    });
    setReason('');
    setEndDate('');
    setIsIndefinite(false);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  const pastReasons = user.suspensionReasons || [];
  const isRepeatOffense = pastReasons.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="suspension-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* ── Header ───────────────────────────────────────── */}
        <div className={`px-6 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0 ${
          willSuspend
            ? 'bg-red-50/50 dark:bg-red-950/10'
            : 'bg-emerald-50/50 dark:bg-emerald-950/10'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                willSuspend
                  ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                  : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              }`}>
                {willSuspend ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <h3 id="suspension-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {willSuspend ? 'Suspend User Access' : 'Restore User Access'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
                  {' · '}{user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {willSuspend ? (
            <>
              {/* Repeat offense callout */}
              {isRepeatOffense && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Previous Suspension History ({pastReasons.length} record{pastReasons.length > 1 ? 's' : ''})
                  </p>
                  <ul className="space-y-1.5 mb-3">
                    {pastReasons.map((r, i) => (
                      <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-start gap-1.5 pt-2 border-t border-amber-200 dark:border-amber-800/40">
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                      Repeat offense detected — suspension duration will be automatically doubled.
                    </p>
                  </div>
                </div>
              )}

              {/* Suspension reason */}
              <div>
                <label htmlFor="suspension-reason" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Suspension Reason <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="suspension-reason"
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError(''); }}
                  placeholder="Describe the reason for suspending this user…"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none transition-all"
                />
              </div>

              {/* Duration / End date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-slate-400" />
                  Suspension Duration
                </label>

                {/* Indefinite toggle */}
                <label className="flex items-center gap-2 mb-3 cursor-pointer group w-fit">
                  <input
                    type="checkbox"
                    checked={isIndefinite}
                    onChange={(e) => { setIsIndefinite(e.target.checked); if (e.target.checked) setEndDate(''); }}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-red-600 focus:ring-red-500/20 bg-slate-50 dark:bg-slate-800"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 select-none transition-colors">
                    Indefinite (manual restoration only)
                  </span>
                </label>

                {!isIndefinite && (
                  <>
                    <input
                      type="datetime-local"
                      value={endDate}
                      min={getMinDate()}
                      onChange={(e) => { setEndDate(e.target.value); setError(''); }}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">Leave empty for indefinite suspension.</p>
                  </>
                )}
              </div>

              {/* Impact info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Impact of Suspension:</p>
                <p>• Revokes catalog reservation and borrowing privileges immediately.</p>
                <p>• Blocks active login sessions across all terminals.</p>
              </div>
            </>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Restorations Applied:</p>
              <p>• Restores full dashboard access pathways immediately.</p>
              <p>• Enables normal circulation workflows if liabilities are cleared.</p>
              {pastReasons.length > 0 && (
                <p className="pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold text-slate-500 dark:text-slate-400">
                  Suspension history will be preserved for records.
                </p>
              )}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 flex gap-3 justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] ${
              willSuspend
                ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 dark:focus-visible:ring-offset-slate-900'
                : 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-slate-900'
            }`}
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {willSuspend ? 'Confirm Suspension' : 'Confirm Restoration'}
          </button>
        </div>
      </div>
    </div>
  );
}