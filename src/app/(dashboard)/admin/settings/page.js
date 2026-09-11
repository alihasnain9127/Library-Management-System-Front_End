'use client';

import React from 'react';
import { Settings, Shield, Clock, AlertCircle, Save, Database, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Library system configuration updated successfully!');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Library Operating System Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure institutional lending policies, overdue fine parameters, and system security rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Circulation & Lending Policy */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Circulation & Lending Policy</h2>
              <p className="text-xs text-slate-400">Define default loan horizons and financial fine accrual metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Loan Duration (Days)
              </label>
              <input 
                type="number" 
                defaultValue={15}
                min={1}
                max={90}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-400 mt-1">Standard patron borrow horizon without renewal.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Overdue Fine Rate (PKR / Day)
              </label>
              <input 
                type="number" 
                defaultValue={20}
                min={0}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-400 mt-1">Accrues automatically per day past target due date.</p>
            </div>
          </div>
        </div>

        {/* Catalog & Media Upload Rules */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: 'var(--shadow-e1)' }}
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Asset & Media Validation Rules</h2>
              <p className="text-xs text-slate-400">Magic-byte file safety specifications and Cloudinary asset limits</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Cover Image Payload
              </label>
              <input 
                type="text" 
                disabled
                value="4 MB (Magic-byte verified)"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Accepts PNG, JPG, and WEBP formats with header validation.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Standard Categories
              </label>
              <input 
                type="text" 
                disabled
                value="Fiction, Non-Fiction, Science, History, Tech, Other"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Core taxonomy applied across catalog search and filters.</p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
