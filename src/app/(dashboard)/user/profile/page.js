'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelfProfile } from '@/redux/slices/usersSlice';
import { authSuccess, logout } from '@/redux/slices/authSlice';
import api from '@/services/api';
import { User, Mail, Phone, ShieldCheck, Save, Loader2, CheckCircle } from 'lucide-react';


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

  // Reset form values when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  // Fetch latest user profile from backend on page load
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsRefreshing(true);
        const response = await api.get('/auth/me');
        if (response.data?.data) {
          const userData = response.data.data;
          // Update Redux store and cookies
          dispatch(authSuccess({ user: userData, token: null }));
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (error.response?.status === 401) {
          // Token expired, logout
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

      // Call backend API to update user profile
      const updatedUser = await dispatch(updateSelfProfile(data)).unwrap();

      // Update Redux store and cookies with new user data
      dispatch(authSuccess({ user: updatedUser, token: null }));
      setSaveSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setServerError(err?.message || err || 'Failed to update profile. Please try again later.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Profile Settings</h1>
        <p className="text-sm text-slate-500">Manage your contact information and view account permissions.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">

        {saveSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold flex items-center gap-2 border border-emerald-200/50">
            <CheckCircle className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}
        {isRefreshing && (
          <div className="mb-6 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm flex items-center gap-2 border border-blue-200/50">
            <Loader2 className="w-4 h-4 animate-spin" /> Syncing latest profile data...
          </div>
        )}
        {serverError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-5">

          {/* User Role - Read Only */}
          <div>
            <label className="block text-sm font-semibold text-slate-500 mb-1">Account Type</label>
            <div className="h-10 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500 text-sm select-none">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="capitalize font-bold">{user?.role === 'admin' ? 'Administrator' : 'Standard User'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-500 mb-1">Registered Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full h-10 pl-10 pr-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Email address serves as a core identifier and cannot be changed.</p>
          </div>

          {/* Editable Fields */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter your full name"
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('phone', {
                  pattern: {
                    value: /^\+?[0-9]{10,14}$/,
                    message: 'Please enter a valid phone number (10-14 digits, optional + prefix)'
                  }
                })}
                placeholder="e.g., +8613800138000 or 13800138000"
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isRefreshing}
              className="px-5 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
