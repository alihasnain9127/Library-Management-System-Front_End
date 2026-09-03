'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Wait until the initial authentication check/cookie handshakes complete
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
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Authenticating session parameters...
      </p>
    </div>
  );
}