'use client';

import React from 'react';
import Image from 'next/image';
import { Star, BookOpen, AlertCircle } from 'lucide-react';

export default function BookCard({ book, onClick }) {
  const isAvailable = (book.available ?? 0) > 0;
  const coverSrc = book.imageUrl || book.bookImage?.url || book.image || '';
  const totalCopies = book.quantity ?? book.total ?? 1;
  const availableCopies = book.available ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { 
        if (e.key === 'Enter' || e.key === ' ') { 
          e.preventDefault(); 
          onClick?.(); 
        } 
      }}
      aria-label={`View details for ${book.title}`}
      className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 select-none"
      style={{ boxShadow: 'var(--shadow-e1)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-e2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-e1)'; }}
    >
      {/* ── Cover Image (fixed 192px height = h-48) ────── */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-300 dark:text-slate-600">
            <BookOpen className="w-12 h-12 mb-1" />
            <span className="text-[11px] font-medium text-slate-400">No cover image</span>
          </div>
        )}

        {/* Top-right glass availability badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${
            isAvailable
              ? 'bg-emerald-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}>
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>

        {/* Subtle hover gradient bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* ── Meta Details ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Rating row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full truncate max-w-[70%] border border-blue-100 dark:border-blue-900/30">
            {book.category || 'General'}
          </span>
          {book.rating !== undefined && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{book.rating}</span>
            </div>
          )}
        </div>

        {/* Title: 2 lines clamp */}
        <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-1 text-sm sm:text-base">
          {book.title}
        </h3>

        {/* Author: 1 line clamp */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-auto">
          {book.author}
        </p>

        {/* Footer: X of Y copies */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {isAvailable ? (
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            )}
            <span>{availableCopies} of {totalCopies} copies</span>
          </span>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform duration-150">
            Borrow →
          </span>
        </div>
      </div>
    </div>
  );
}