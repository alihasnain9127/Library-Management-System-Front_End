'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Loader2, Library } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/user/dashboard');
    }
  }, [isAuthenticated, user, loading, router]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4 select-none">
      <div className="relative">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20">
          <Library className="w-7 h-7" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          LuminaLib <span className="text-blue-600 dark:text-blue-400">LibOS</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Initializing institutional workspace…
        </p>
      </div>
    </div>
  );
}