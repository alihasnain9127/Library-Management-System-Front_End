'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '@/redux/slices/authSlice';
import api from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, Library, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [suspensionInfo, setSuspensionInfo] = useState(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const clearError = () => {
    if (serverError) setServerError('');
    if (suspensionInfo) setSuspensionInfo(null);
  };

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuspensionInfo(null);
      dispatch(authStart());

      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { user, token } = response.data.data;

      // Commit profile metrics directly into local cookie structures via Redux
      dispatch(authSuccess({ user, token }));

      // Reroute based on authorized system privileges
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
      const status = error.response?.status;
      const resData = error.response?.data;

      if (status === 403 && resData?.suspensionDetails) {
        // Suspension-specific error
        setSuspensionInfo(resData.suspensionDetails);
        const message = resData.message || 'Your account is currently suspended';
        dispatch(authFailure(message));
        setServerError(message);
      } else {
        const message = resData?.message || 'Invalid credentials. Please try again.';
        dispatch(authFailure(message));
        setServerError(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 mb-3">
            <Library className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to manage your library assets</p>
        </div>

        {/* Suspension Details Banner */}
        {suspensionInfo && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-sm font-bold text-red-700 dark:text-red-300">Account Suspended</h3>
            </div>
            {suspensionInfo.suspensionReasons?.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Reason(s):</p>
                <ul className="space-y-1">
                  {suspensionInfo.suspensionReasons.map((r, i) => (
                    <li key={i} className="text-xs text-red-500 dark:text-red-300 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-xs text-red-500 dark:text-red-300 space-y-0.5">
              {suspensionInfo.suspensionDate && (
                <p>Suspended on: {new Date(suspensionInfo.suspensionDate).toLocaleDateString()}</p>
              )}
              {suspensionInfo.isIndefinite ? (
                <p className="font-semibold">Duration: Indefinite — contact administration for restoration.</p>
              ) : suspensionInfo.suspensionEndDate ? (
                <p>Suspension ends: <strong>{new Date(suspensionInfo.suspensionEndDate).toLocaleString()}</strong></p>
              ) : null}
            </div>
          </div>
        )}

        {/* Global Error Banner (non-suspension) */}
        {serverError && !suspensionInfo && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 text-center">
            {serverError}
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('email', { 
                onChange: clearError,
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              })}
              type="email"
              placeholder="you@university.edu"
              disabled={loading || isSubmitting}
              aria-disabled={loading || isSubmitting}
              className={`w-full h-11 pl-10 pr-4 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
            />
          </div>
          {errors.email && <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('password', { 
                onChange: clearError,
                required: 'Password is required'
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={loading || isSubmitting}
              aria-disabled={loading || isSubmitting}
              className={`w-full h-11 pl-10 pr-10 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading || isSubmitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center">
          <input
            {...register('rememberMe', { onChange: clearError })}
            type="checkbox"
            id="rememberMe"
            disabled={loading || isSubmitting}
            aria-disabled={loading || isSubmitting}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 bg-slate-50 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="rememberMe" className={`ml-2 text-xs font-medium text-slate-600 dark:text-slate-400 select-none ${loading || isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            Remember my session criteria
          </label>
        </div>

          <button
            type="submit"
            disabled={!isValid || loading || isSubmitting || serverError !== ''}
            aria-disabled={!isValid || loading || isSubmitting || serverError !== ''}
            aria-busy={loading || isSubmitting}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {(loading || isSubmitting) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          New to the system?{' '}
          <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}