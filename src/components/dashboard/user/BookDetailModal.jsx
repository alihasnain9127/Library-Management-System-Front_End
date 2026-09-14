'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { X, Star, BookOpen, Calendar, Hash, CheckCircle2, Loader2, CalendarPlus, Building2, BookMarked } from 'lucide-react';
import { borrowBook, clearCirculationError } from '@/redux/slices/circulationSlice';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const DEFAULT_LOAN_DAYS = 15;
const toDateInputValue = (date) => format(date, 'yyyy-MM-dd');

export default function BookDetailModal({ book, isOpen, onClose, onBorrowed, isBorrowed = false }) {
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.circulation);

  const [returnDate, setReturnDate] = useState(toDateInputValue(addDays(new Date(), DEFAULT_LOAN_DAYS)));
  const [success, setSuccess] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isBorrowModalOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBorrowModalOpen, onClose]);

  // Reset transient state whenever the modal is reopened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setReturnDate(toDateInputValue(addDays(new Date(), DEFAULT_LOAN_DAYS)));
        setSuccess(false);
        setIsBorrowModalOpen(false);
        dispatch(clearCirculationError());
      }, 0);
    }
  }, [isOpen, book?._id, book?.id, dispatch]);

  const imageSrc = useMemo(() => {
    if (!book) return '';
    return book.imageUrl || book.image || book.bookImage?.url || '';
  }, [book]);

  const bookKey = book?._id || book?.id;
  const isAvailable = (book?.available ?? 0) > 0;
  // If user already borrowed this book, treat it as blocked regardless of available copies
  const canBorrow = isAvailable && !isBorrowed;

  // Calculate live loan duration in days
  const loanDays = useMemo(() => {
    const chosen = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((chosen - today) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff || DEFAULT_LOAN_DAYS);
  }, [returnDate]);

  if (!isOpen || !book) return null;

  const handleBorrow = async () => {
    dispatch(clearCirculationError());

    if (!bookKey) {
      toast.error('This book record is missing a valid identifier.');
      return;
    }

    const chosen = new Date(returnDate);
    if (Number.isNaN(chosen.getTime())) {
      toast.error('Please choose a valid return date.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen < today) {
      toast.error('Return date must be in the future.');
      return;
    }

    const result = await dispatch(borrowBook({ bookId: bookKey, returnDate: chosen.toISOString() }));

    if (borrowBook.fulfilled.match(result)) {
      setSuccess(true);
      toast.success('Book borrowed successfully!');
      if (typeof onBorrowed === 'function') {
        onBorrowed(result.payload);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } else {
      toast.error('Could not process borrow request. Please check your account standing or fine balance.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBorrowModalOpen) onClose();
      }}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800"
        style={{ boxShadow: 'var(--shadow-e4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close book details modal"
          className="absolute top-4 right-4 z-20 p-2 bg-slate-900/40 hover:bg-slate-900/60 text-white rounded-full backdrop-blur-md transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto md:overflow-hidden">
          {/* Left Column: Cover Image */}
          <div className="md:w-2/5 h-64 md:h-auto min-h-[280px] relative bg-slate-100 dark:bg-slate-800 shrink-0">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-300 dark:text-slate-600 p-6 text-center">
                <BookOpen className="w-16 h-16 mb-2 text-slate-300 dark:text-slate-600" />
                <span className="text-xs font-semibold text-slate-400">Cover unavailable</span>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Borrow Controls */}
          <div className="md:w-3/5 p-6 sm:p-8 flex flex-col overflow-y-auto justify-between">
            <div>
              {/* Category + Availability Pills */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-full border border-blue-200/60 dark:border-blue-800/40">
                  {book.category || 'General'}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  isAvailable 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40' 
                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/60 dark:border-red-800/40'
                }`}>
                  {isAvailable ? `${book.available} Available` : 'Unavailable'}
                </span>
                {isBorrowed && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/40 inline-flex items-center gap-1">
                    <BookMarked className="w-3 h-3" /> Already Borrowed
                  </span>
                )}
              </div>

              {/* Title & Author */}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-1">
                {book.title}
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400 mb-4 font-medium">
                {book.author}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-xs text-slate-600 dark:text-slate-300">
                {book.rating !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{book.rating} Rating</span>
                  </div>
                )}
                {(book.year || book.publishYear) && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{book.year || book.publishYear}</span>
                    </div>
                  </>
                )}
                {book.isbn && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                      <Hash className="w-3.5 h-3.5" />
                      <span>{book.isbn}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Synopsis */}
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                <p>{book.description || 'No summary description provided for this academic catalog title.'}</p>
                {book.publisher && (
                  <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Published by: <strong className="text-slate-700 dark:text-slate-200">{book.publisher}</strong></span>
                  </p>
                )}
              </div>

              {/* Return Date Picker – only show if user can still borrow */}
              {!isBorrowed && (
              <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <label htmlFor="returnDate" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  <CalendarPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Target Return Date</span>
                </label>
                <input
                  id="returnDate"
                  type="date"
                  value={returnDate}
                  min={toDateInputValue(new Date())}
                  onChange={(e) => setReturnDate(e.target.value)}
                  disabled={!canBorrow || actionLoading || success}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                />
                <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Loan period: <strong className="text-blue-600 dark:text-blue-400">{loanDays} days</strong>. Late returns accrue an overdue fine of <strong className="text-slate-700 dark:text-slate-200">Rs. 20/day</strong>.
                </div>
              </div>
              )}
            </div>

            {/* Action Area */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              {isBorrowed ? (
                <div className="w-full h-11 flex items-center justify-center gap-2 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-bold rounded-xl border border-violet-200 dark:border-violet-800 text-sm">
                  <BookMarked className="w-5 h-5" />
                  <span>You Already Borrowed This Book</span>
                </div>
              ) : success ? (
                <div className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Book Issued Successfully!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(true)}
                  disabled={!canBorrow || actionLoading}
                  className={`w-full h-11 flex items-center justify-center gap-2 font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] ${
                    canBorrow
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {actionLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <><BookOpen className="w-4 h-4" /> {isAvailable ? 'Borrow This Book' : 'Currently Unavailable'}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested Confirmation Modal on Borrow */}
      <ConfirmationModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onConfirm={handleBorrow}
        title="Confirm Book Borrow"
        message={`Are you sure you want to borrow "${book.title}" with a target return date of ${new Date(returnDate).toLocaleDateString()} (${loanDays} days)?`}
        confirmText="Confirm Borrow"
        isDanger={false}
      />
    </div>
  );
}
