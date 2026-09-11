'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, deleteBook } from '@/redux/slices/booksSlice';
import { Plus, Download, Upload, Search, Edit2, Trash2, BookOpen, Library, X } from 'lucide-react';
import BookFormModal from '@/components/dashboard/admin/BookFormModal';
import CSVImportModal from '@/components/dashboard/admin/CSVImportModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function AdminBookManagement() {
  const dispatch = useDispatch();
  const { items: books, loading } = useSelector((state) => state.books);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const handleEdit = (book) => {
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedBook(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      dispatch(deleteBook(bookToDelete._id || bookToDelete.id));
      setBookToDelete(null);
    }
  };

  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* ── Page Header & Quick Actions ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Book Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage academic catalog, update circulating stock, and process bulk imports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsCSVOpen(true)} 
            className="h-10 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>
          <button 
            type="button"
            onClick={handleAddNew} 
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* ── Toolbar: Search & Export ────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title, author, or ISBN…" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-center">
          <span>Showing <strong>{filteredBooks.length}</strong> of {books.length} titles</span>
        </div>
      </div>

      {/* ── Data Table ─────────────────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold select-none">
                <th className="py-3.5 px-5">Book Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Total Stock</th>
                <th className="py-3.5 px-4 text-center">Availability</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Library className="w-8 h-8 text-blue-500 animate-pulse" />
                      <span className="text-sm font-medium">Loading catalog inventory…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-200">No books found</p>
                      <p className="text-xs text-slate-400">Try changing your search terms or add a new title to the library catalog.</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const coverSrc = book.imageUrl || book.bookImage?.url || '';
                  const isAvailable = (book.available ?? 0) > 0;

                  return (
                    <tr 
                      key={book._id || book.id} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-10 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            {coverSrc ? (
                              <Image 
                                src={coverSrc} 
                                alt={book.title} 
                                fill 
                                className="object-cover" 
                                sizes="40px" 
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate max-w-md">
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {book.author}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                              ISBN: {book.isbn || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium">
                          {book.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {book.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          isAvailable 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/40' 
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/50 dark:border-red-900/40'
                        }`}>
                          {isAvailable ? `${book.available} Available` : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            type="button"
                            onClick={() => handleEdit(book)} 
                            title="Edit book details"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setBookToDelete(book)} 
                            title="Delete book record"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      <BookFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        book={selectedBook} 
      />
      
      <CSVImportModal 
        isOpen={isCSVOpen} 
        onClose={() => setIsCSVOpen(false)} 
        onImportSuccess={() => dispatch(fetchBooks())} 
      />

      {/* Branded Confirmation Modal replacing window.confirm */}
      <ConfirmationModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Book Record"
        message={`Are you sure you want to permanently delete "${bookToDelete?.title}" from the inventory? This action cannot be undone.`}
        confirmText="Delete Record"
        isDanger={true}
      />
    </div>
  );
}