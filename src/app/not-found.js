"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Search, Home, LogIn } from "lucide-react";

export default function NotFound() {
  const { user } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mounting, we avoid rendering auth-dependent links to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const dashboardLink = user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 blur-3xl rounded-full w-48 h-48 mx-auto -z-10"></div>
        <div className="flex justify-center items-center w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full mb-6 text-slate-400">
          <Search className="w-10 h-10" />
        </div>
        <h1 className="text-8xl font-black text-slate-900 dark:text-slate-50 mb-2 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
          We couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {isLoggedIn ? (
          <Link
            href={dashboardLink}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
          >
            <LogIn className="w-5 h-5" />
            Go to Login Page
          </Link>
        )}
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold rounded-xl transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
