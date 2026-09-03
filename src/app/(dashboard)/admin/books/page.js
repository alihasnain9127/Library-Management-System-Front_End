'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, deleteBook } from '@/redux/slices/booksSlice';
import { Plus, Download, Upload, Search, Edit, Trash2 } from 'lucide-react';
import BookFormModal from '@/components/dashboard/admin/BookFormModal';
import CSVImportModal from '@/components/dashboard/admin/CSVImportModal';

export default function AdminBookManagement() {
  const dispatch = useDispatch();
  const { items: books, loading } = useSelector((state) => state.books);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

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

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to permanently delete this book?')) {
      dispatch(deleteBook(id));
    }
  };

  // Local filtering for demonstration
  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Toolbars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Book Inventory</h1>
          <p className="text-sm text-slate-500">Manage catalog, add new arrivals, and process bulk records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCSVOpen(true)} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Book
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50">
          <Download className="w-4 h-4" /> Export List
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="p-4">Book Details</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Total Copies</th>
                <th className="p-4 text-center">Available</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading inventory data...</td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No books found matching your criteria.</td></tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-14 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden shrink-0">
                          {(book.imageUrl || book.bookImage?.url) && <Image src={book.imageUrl || book.bookImage.url} alt="" fill className="object-cover" sizes="40px" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-50 line-clamp-1">{book.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{book.author}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ISBN: {book.isbn || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium">{book.category}</span>
                    </td>
                    <td className="p-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{book.quantity}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        book.available > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'
                      }`}>
                        {book.available}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(book)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(book._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modals */}
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
    </div>
  );
}