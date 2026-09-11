"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Search, Home, LogIn, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const { user } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mb-4" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const dashboardLink = user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 text-center select-none">
      <div className="mb-8 relative max-w-lg">
        {/* Glowing Radial-Gradient Motif */}
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 blur-3xl rounded-full w-56 h-56 mx-auto -z-10 pointer-events-none" />
        
        <div className="flex justify-center items-center w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400 shadow-sm">
          <Search className="w-10 h-10" />
        </div>

        <h1 className="text-8xl sm:text-9xl font-extrabold text-slate-900 dark:text-slate-50 mb-2 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-3 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          The academic resource, catalog shelf, or route you are searching for does not exist or has been archived.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {isLoggedIn ? (
          <Link
            href={dashboardLink}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="h-11 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}
