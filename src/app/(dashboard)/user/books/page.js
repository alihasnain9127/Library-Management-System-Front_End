'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Loader2, BookX } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '@/redux/slices/booksSlice';
import { useSearch } from '@/hooks/useSearch';
import BookCard from '@/components/dashboard/user/BookCard';
import BookDetailModal from '@/components/dashboard/user/BookDetailModal';

export default function BrowseBooksPage() {
  const dispatch = useDispatch();
  const { items: books, loading, error } = useSelector((state) => state.books);

  const { searchTerm, setSearchTerm, filters, setFilters, debouncedSearchTerm, debouncedFilters } = useSearch(400);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowedOverrides, setBorrowedOverrides] = useState({});

  useEffect(() => {
    dispatch(fetchBooks({ search: debouncedSearchTerm, category: debouncedFilters.category > 'All'? debouncedFilters.category : undefined, available: debouncedFilters.status === 'Available' ? true : undefined }));
  }, [dispatch, debouncedSearchTerm, debouncedFilters]);

  const handleBorrowed = useCallback((payload) => {
    const borrowedBookId =
      payload?.bookId && typeof payload.bookId === 'object' ? payload.bookId._id : payload?.bookId;
    if (!borrowedBookId) return;
    setBorrowedOverrides((prev) => ({
      ...prev,
      [borrowedBookId]: {
        available: Math.max(0, (prev[borrowedBookId]?.available ?? books.find((b) => (b._id || b.id) === borrowedBookId)?.available ?? 1) - 1),
      },
    }));
  }, [books]);

  const decoratedResults = useMemo(
    () =>
      books.map((book) => {
        const key = book._id || book.id;
        const override = borrowedOverrides[key];
        return override ? { ...book, available: override.available } : book;
      }),
    [books, borrowedOverrides],
  );

  const categories = ['All', 'Web Dev', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Other'];
  const statuses = ['All', 'Available', 'Borrowed'];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Book Catalog</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Search, filter, and borrow from our extensive collection.</p>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Filters Group */}
        <div className="flex gap-4">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full h-11 pl-9 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-blue-500 appearance-none text-slate-700 dark:text-slate-300"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full md:w-40 h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-blue-500 appearance-none text-slate-700 dark:text-slate-300"
          >
            {statuses.map(status => <option key={status} value={status}>{status} Status</option>)}
          </select>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="min-h-100">
        {loading ? (
          // Loading Skeleton Grid
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Scanning catalog...</span>
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center justify-center h-64 text-red-500 dark:text-red-400 bg-white dark:bg-slate-900 border border-dashed border-red-200 dark:border-red-800 rounded-xl">
            <BookX className="w-12 h-12 mb-3 text-red-300 dark:text-red-600" />
            <h3 className="text-lg font-semibold">Error loading books</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : decoratedResults.length > 0 ? (
          // Results Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decoratedResults.map((book) => (
              <BookCard
                key={book.id || book._id}
                book={book}
                onClick={() => setSelectedBook(book)}
              />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <BookX className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No books found</h3>
            <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>

      {/* Hidden detail modal mounted at root of page */}
      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onBorrowed={handleBorrowed}
      />

    </div>
  );
}