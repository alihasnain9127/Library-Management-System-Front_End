import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Forgot your password?</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Enter the email address associated with your account and we’ll send instructions to reset your password.</p>

        <form className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Registered Email</label>
            <input
              type="email"
              placeholder="you@university.edu"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button type="submit" className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all">
            Send Reset Instructions
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Remembered your account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
