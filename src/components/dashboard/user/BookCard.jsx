'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Library, AlertCircle } from 'lucide-react';

export default function BookCard({ book, onClick }) {
  const isAvailable = book.available > 0;
  const coverSrc = book.imageUrl || book.bookImage?.url || book.image || '';

  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
    >
      {/* Book Cover Image Area */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
            <Library className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
        )}
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-md backdrop-blur-md ${isAvailable
              ? 'bg-emerald-500/90 text-white'
              : 'bg-red-500/90 text-white'
            }`}>
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Book Meta Details */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
            {book.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{book.rating}</span>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
          {book.author}
        </p>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {isAvailable ? <Library className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
            {book.available} of {book.total} copies
          </span>
        </div>
      </div>
    </div>
  );
}