'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, AlertCircle, Loader2, Clock, CalendarClock } from 'lucide-react';

export default function SuspensionModal({ isOpen, onClose, user, onConfirm, isProcessing }) {
  const [reason, setReason] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const willSuspend = !user.isSuspended;

  const handleClose = () => {
    setReason('');
    setEndDate('');
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (willSuspend) {
      if (!reason.trim()) {
        setError('A suspension reason is required');
        return;
      }
      // Validate end date if provided
      if (endDate) {
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
      suspensionEndDate: endDate || null,
    });
    setReason('');
    setEndDate('');
  };

  // Get minimum date for the date picker (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16); // Format for datetime-local
  };

  const pastReasons = user.suspensionReasons || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-150">
        
        <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
            willSuspend ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
          }`}>
            {willSuspend ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {willSuspend ? 'Suspend User Access' : 'Restore User Access'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Target Profile: <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong> ({user.email})
          </p>
        </div>

        {willSuspend ? (
          <div className="space-y-4">
            {/* Past suspension reasons (if any) */}
            {pastReasons.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Previous Suspension History ({pastReasons.length})
                </p>
                <ul className="space-y-1">
                  {pastReasons.map((r, i) => (
                    <li key={i} className="text-xs text-amber-600 dark:text-amber-300 flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-amber-500 dark:text-amber-400/70 mt-2 italic">
                  ⚠ If this suspension matches a prior reason, the duration will be automatically doubled.
                </p>
              </div>
            )}

            {/* Suspension Reason */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Suspension Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                placeholder="Describe the reason for suspending this user..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
              />
            </div>

            {/* Suspension Duration */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4" /> Suspension End Date
                <span className="text-xs font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                min={getMinDate()}
                onChange={(e) => { setEndDate(e.target.value); setError(''); }}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Leave empty for an indefinite suspension. The user will only be unsuspended manually.
              </p>
            </div>

            {/* Info box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-left text-slate-600 dark:text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-700 dark:text-slate-300">Impact of Suspension:</p>
              <p>• Revokes immediate book catalog reservation/borrow token issuance privileges.</p>
              <p>• Blocks active login handshakes across public cluster terminals.</p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-left text-slate-600 dark:text-slate-400 mb-4 space-y-1.5">
            <p className="font-bold text-slate-700 dark:text-slate-300">Restorations Applied:</p>
            <p>• Restores structural dashboard access pathways immediately.</p>
            <p>• Enables normal circulation clearing workflows if liabilities match zero benchmarks.</p>
            {pastReasons.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-500 dark:text-slate-400">Suspension history will be preserved for records.</p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          <button 
            type="button" 
            onClick={handleClose} 
            className="flex-1 h-10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 h-10 text-sm font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              willSuspend ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {willSuspend ? 'Confirm Suspension' : 'Confirm Restoration'}
          </button>
        </div>

      </div>
    </div>
  );
}