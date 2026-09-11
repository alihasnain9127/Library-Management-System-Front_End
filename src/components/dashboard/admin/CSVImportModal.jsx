'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, Download, FileSpreadsheet } from 'lucide-react';
import api from '@/services/api';

export default function CSVImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setStatus(null);
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus(null);
    setIsProcessing(false);
    onClose();
  };

  const processImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/books/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setTimeout(() => {
        onImportSuccess?.();
        handleClose();
      }, 2000);
    } catch {
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Bulk Import Books</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload a CSV file with book data</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Template download */}
          <a
            href="/templates/books-import-template.csv"
            download
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline w-fit"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Template
          </a>

          {/* Dropzone */}
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-3 w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 scale-[1.01]'
                : file
                  ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-slate-800/60'
            }`}
          >
            {file ? (
              <>
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Click to browse <span className="font-normal text-slate-400">or drag & drop</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">CSV files only</p>
                </div>
              </>
            )}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>

          {/* Status banners */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold border border-emerald-200 dark:border-emerald-900/40">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Import successful! Refreshing inventory…
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-900/40">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Import failed. Please check file format and try again.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={processImport}
            disabled={!file || isProcessing || status === 'success'}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {isProcessing ? 'Importing…' : 'Process Import'}
          </button>
        </div>
      </div>
    </div>
  );
}