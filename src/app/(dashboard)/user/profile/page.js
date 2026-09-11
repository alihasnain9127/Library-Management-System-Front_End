'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelfProfile } from '@/redux/slices/usersSlice';
import { authSuccess, logout } from '@/redux/slices/authSlice';
import api from '@/services/api';
import { User, Mail, Phone, ShieldCheck, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserSelfProfileDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  // Fetch latest user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsRefreshing(true);
        const response = await api.get('/auth/me');
        if (response.data?.data) {
          const userData = response.data.data;
          dispatch(authSuccess({ user: userData, token: null }));
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (error.response?.status === 401) {
          dispatch(logout());
        }
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  const onSubmitProfile = async (data) => {
    try {
      setServerError('');
      setSaveSuccess(false);

      const updatedUser = await dispatch(updateSelfProfile(data)).unwrap();
      dispatch(authSuccess({ user: updatedUser, token: null }));
      setSaveSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const msg = err?.message || err || 'Failed to update profile. Please try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review academic clearance credentials and maintain your contact information.
        </p>
      </div>

      {/* ── Settings Card ───────────────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold flex items-center gap-2.5 border border-emerald-200/60 dark:border-emerald-900/40 animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {isRefreshing && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs flex items-center gap-2 border border-blue-200/50">
            <Loader2 className="w-4 h-4 animate-spin" /> Syncing latest academic profile data…
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center gap-2.5 border border-red-200/60 dark:border-red-900/40">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-5">
          {/* User Role Pill */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              System Privilege Level
            </label>
            <div className="h-11 px-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-sm select-none">
              <ShieldCheck className={`w-5 h-5 ${isAdmin ? 'text-purple-500' : 'text-blue-500'}`} />
              <span className="font-bold">
                {isAdmin ? 'System Administrator' : 'General Academic Scholar'}
              </span>
            </div>
          </div>

          {/* Registered Email (Disabled) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full h-11 pl-10 pr-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Email serves as your primary institutional identifier and cannot be modified directly.</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter your full name"
                className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('phone', {
                  pattern: {
                    value: /^\+?[0-9]{10,14}$/,
                    message: 'Please enter a valid phone number (10-14 digits)'
                  }
                })}
                placeholder="+923001234567"
                className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isRefreshing}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSubmitting ? 'Saving Changes…' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
