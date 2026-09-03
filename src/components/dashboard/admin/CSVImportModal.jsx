'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/services/api';

export default function CSVImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const processImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    // Create FormData for the backend Multer endpoint
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Assuming backend has a bulk import endpoint: router.post('/books/bulk-import', upload.single('file'), ...)
      await api.post('/books/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setTimeout(() => {
        onImportSuccess();
        onClose();
        setFile(null);
        setStatus(null);
      }, 2000);
    } catch (error) {
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 p-6 text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Bulk Import Books</h2>
          <p className="text-sm text-slate-500 mt-1">Upload a CSV file containing book inventory data.</p>
          <a href="/templates/books-import-template.csv" download className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">Download CSV Template</a>
        </div>

        {/* Drag & Drop Area / Input */}
        <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <FileText className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {file ? file.name : 'Click to browse or drag file here'}
          </span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>

        {status === 'success' && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm flex justify-center items-center gap-2"><CheckCircle className="w-4 h-4"/> Import Successful! Refreshing...</div>
        )}
        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex justify-center items-center gap-2"><AlertTriangle className="w-4 h-4"/> Import failed. Check file formatting.</div>
        )}

        <button 
          onClick={processImport} 
          disabled={!file || isProcessing || status === 'success'}
          className="w-full mt-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process Import'}
        </button>
      </div>
    </div>
  );
}