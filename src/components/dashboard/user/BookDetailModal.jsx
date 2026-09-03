'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { X, Star, BookOpen, Calendar, Hash, CheckCircle2, Loader2, AlertCircle, CalendarPlus } from 'lucide-react';
import { borrowBook, clearCirculationError } from '@/redux/slices/circulationSlice';
import { format, addDays, getISODay, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const DEFAULT_LOAN_DAYS = 15;

const toDateInputValue = (date) => format(date, 'yyyy-MM-dd');
const getDate = new Date();
const GET_TODAY_DAY = getDate.getDay()
const GET_MONTH = getDate.getMonth()

export default function BookDetailModal({ book, isOpen, onClose, onBorrowed }) {
  const dispatch = useDispatch();
  const { actionLoading, error: borrowError } = useSelector((state) => state.circulation);

  const [returnDate, setReturnDate] = useState(toDateInputValue(addDays(new Date(), DEFAULT_LOAN_DAYS)));
  const [success, setSuccess] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  // Reset transient state whenever the modal is reopened with a new book
  useEffect(() => {
    if (isOpen) {
      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setReturnDate(toDateInputValue(addDays(new Date(), DEFAULT_LOAN_DAYS)));
        setSuccess(false);
        setIsBorrowModalOpen(false);
        dispatch(clearCirculationError());
      }, 0);
    }
  }, [isOpen, book?._id, book?.id, dispatch]);

  // Normalize the image source across mock and real backend payloads
  const imageSrc = useMemo(() => {
    if (!book) return '';
    return book.imageUrl || book.image || book.bookImage?.url || '/placeholder-book.png';
  }, [book]);

  const bookKey = book?._id || book?.id;
  const isAvailable = (book?.available ?? 0) > 0;

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
      }, 2000);
    } else {
      toast.error('We could not process your borrow request at this time. Please try again later.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Column: Image */}
          <div className="md:w-2/5 h-64 md:h-auto relative bg-slate-100 dark:bg-slate-800">
            <Image
              src={imageSrc}
              alt={book.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          {/* Right Column: Details */}
          <div className="md:w-3/5 p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">
                {book.category}
              </span>
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${isAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                {isAvailable ? 'In Stock' : 'Unavailable'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">{book.title}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-4">{book.author}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-slate-600 dark:text-slate-300">
              {book.rating !== undefined && (
                <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {book.rating} Rating</div>
              )}
              {(book.year || book.publishYear) && (
                <>
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {book.year || book.publishYear}</div>
                </>
              )}
              {book.isbn && (
                <>
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <div className="flex items-center gap-1.5"><Hash className="w-4 h-4 text-slate-400" /> {book.isbn}</div>
                </>
              )}
            </div>

            <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300 mb-6">
              <p>{book.description}</p>
              {book.publisher && (
                <p className="mt-2 text-xs text-slate-400">Published by: <strong className="text-slate-600 dark:text-slate-300">{book.publisher}</strong></p>
              )}
            </div>

            {/* Return Date Picker */}
            <div className="mb-5">
              <label htmlFor="returnDate" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                <CalendarPlus className="w-3.5 h-3.5" /> Expected Return Date
              </label>
              <input
                id="returnDate"
                type="date"
                value={returnDate}
                min={toDateInputValue(new Date())}
                onChange={(e) => setReturnDate(e.target.value)}
                disabled={!isAvailable || actionLoading || success}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 disabled:opacity-60"
              />
              <div className="mt-2 p-3 text-xs text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                <span className="font-semibold text-blue-700 dark:text-blue-400">NOTE:</span> Default loan period is {Math.ceil((new Date(returnDate) - new Date()) / (1000 * 60 * 60 * 24))} days. Overdue returns accrue a Rs. 20/day fine.
              </div>
            </div>

            {/* Action Area */}
            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              {success ? (
                <div className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-5 h-5" /> Book Issued Successfully!
                </div>
              ) : (
                <button
                  onClick={() => setIsBorrowModalOpen(true)}
                  disabled={!isAvailable || actionLoading}
                  className={`w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl transition-all shadow-sm ${isAvailable
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                    }`}
                >
                  {actionLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><BookOpen className="w-5 h-5" /> {isAvailable ? 'Borrow This Book' : 'Currently Unavailable'}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onConfirm={handleBorrow}
        title="Confirm Borrow"
        message={`Are you sure you want to borrow "${book.title}" until ${new Date(returnDate).toLocaleDateString()}?`}
        confirmText="Confirm Borrow"
      />
    </div>
  );
}
