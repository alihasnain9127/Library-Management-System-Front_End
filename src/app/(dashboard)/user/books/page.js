'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Loader2, BookX, BookOpen, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '@/redux/slices/booksSlice';
import { fetchCirculationRecords } from '@/redux/slices/circulationSlice';
import { useSearch } from '@/hooks/useSearch';
import BookCard from '@/components/dashboard/user/BookCard';
import BookDetailModal from '@/components/dashboard/user/BookDetailModal';
import CustomSelect from '@/components/ui/CustomSelect';

export default function BrowseBooksPage() {
  const dispatch = useDispatch();
  const { items: books, loading, error } = useSelector((state) => state.books);
  const { records } = useSelector((state) => state.circulation);
  const { list: categoryList } = useSelector((state) => state.categories);

  const { searchTerm, setSearchTerm, filters, setFilters, debouncedSearchTerm, debouncedFilters } = useSearch(400);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowedOverrides, setBorrowedOverrides] = useState({});

  useEffect(() => {
    dispatch(fetchBooks({ 
      search: debouncedSearchTerm, 
      category: debouncedFilters.category !== 'All' ? debouncedFilters.category : undefined, 
      available: debouncedFilters.status === 'Available' ? true : undefined 
    }));
  }, [dispatch, debouncedSearchTerm, debouncedFilters]);

  // Fetch user's own circulation records to know which books they currently have out
  useEffect(() => {
    dispatch(fetchCirculationRecords('user'));
  }, [dispatch]);

  // Build a set of bookIds the user currently has borrowed (not yet returned)
  const borrowedBookIds = useMemo(() => {
    const ids = new Set();
    records.forEach((r) => {
      const statusLow = String(r.status || '').toLowerCase();
      if (statusLow === 'borrowed' || statusLow === 'issued') {
        const id = typeof r.bookId === 'object' ? (r.bookId?._id || r.bookId?.id) : r.bookId;
        if (id) ids.add(id);
      }
    });
    return ids;
  }, [records]);

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

  // Derive category options for the filter from Redux (includes custom tags)
  const categoryOptions = useMemo(() => [
    { value: 'All', label: 'All Categories' },
    ...categoryList.map((c) => ({ value: c, label: c })),
  ], [categoryList]);

  const statusOptions = [
    { value: 'All', label: 'All Availability' },
    { value: 'Available', label: 'Available' },
    { value: 'Borrowed', label: 'Borrowed' },
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({ category: 'All', status: 'All' });
  };

  const hasActiveFilters = searchTerm || filters.category !== 'All' || filters.status !== 'All';

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Academic Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse our university collection, reserve copies, and track due returns.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <strong>{decoratedResults.length}</strong> Titles Available
          </span>
        </div>
      </div>

      {/* ── Search & Filters Toolbar ────────────────────── */}
      <div 
        className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or keyword…"
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

        {/* Filters Group */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          {/* Category filter */}
          <div className="w-full sm:w-52">
            <CustomSelect
              options={categoryOptions}
              value={filters.category}
              onChange={(val) => setFilters({ ...filters, category: val })}
              placeholder="All Categories"
            />
          </div>

          {/* Availability filter */}
          <div className="w-full sm:w-44">
            <CustomSelect
              options={statusOptions}
              value={filters.status}
              onChange={(val) => setFilters({ ...filters, status: val })}
              placeholder="All Availability"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="h-11 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Main Catalog Grid ───────────────────────────── */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Filtering catalog records…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500 dark:text-red-400 bg-white dark:bg-slate-900 border border-dashed border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center">
            <BookX className="w-12 h-12 mb-3 text-red-300 dark:text-red-600" />
            <h3 className="text-base font-bold">Error loading catalog</h3>
            <p className="text-xs mt-1 text-slate-500">{error}</p>
          </div>
        ) : decoratedResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decoratedResults.map((book) => (
              <BookCard
                key={book.id || book._id}
                book={book}
                onClick={() => setSelectedBook(book)}
                isBorrowed={borrowedBookIds.has(book._id || book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
            <BookOpen className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No books found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">No items matched your current filter criteria. Try searching with different keywords.</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onBorrowed={handleBorrowed}
        isBorrowed={selectedBook ? borrowedBookIds.has(selectedBook._id || selectedBook.id) : false}
      />
    </div>
  );
}