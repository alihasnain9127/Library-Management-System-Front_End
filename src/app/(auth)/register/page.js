'use client';

import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import api from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, X, Loader2, Library } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, control, setValue, formState: { errors, isValid, isSubmitting } } = useForm({
    mode: 'onChange'
  });

  const formValues = useWatch({ control });
  const passwordValue = formValues?.password || '';

  const clearError = () => {
    if (serverError) setServerError('');
  };

  // Password requirements
  const requirements = [
    { label: 'At least 8 characters long', valid: passwordValue.length >= 8 },
    { label: 'Contains an uppercase letter', valid: /[A-Z]/.test(passwordValue) },
    { label: 'Contains at least one number', valid: /[0-9]/.test(passwordValue) },
    { label: 'Contains a special character (!@#$%^&*)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue) },
  ];

  const strengthScore = requirements.filter(req => req.valid).length;

  const getStrengthLabel = () => {
    if (!passwordValue) return { label: 'Empty', color: 'text-slate-400' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'text-red-500' };
    if (strengthScore === 2) return { label: 'Fair', color: 'text-amber-500' };
    if (strengthScore === 3) return { label: 'Good', color: 'text-blue-500' };
    return { label: 'Strong Security Profile', color: 'text-emerald-500' };
  };

  const getSegmentColor = (segmentIndex) => {
    if (!passwordValue || segmentIndex >= strengthScore) {
      return 'bg-slate-200 dark:bg-slate-800';
    }
    if (strengthScore <= 1) return 'bg-red-500';
    if (strengthScore === 2) return 'bg-amber-500';
    if (strengthScore === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const onSubmit = async (data) => {
    try {
      setServerError('');

      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });

      router.push('/login');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Account creation halted. User might already exist.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl"
        style={{ boxShadow: 'var(--shadow-e4)' }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-2xl text-blue-600 dark:text-blue-400 mb-3 shadow-sm shadow-blue-500/10">
            <Library className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Create Library Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register to browse catalogs, borrow books, and track due dates.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-600 dark:text-red-400 text-center font-medium animate-in fade-in duration-150">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('name', { 
                  onChange: clearError,
                  required: 'Full name is required',
                  maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                  pattern: { value: /^[a-zA-Z\s\-]+$/, message: 'Only letters, spaces, and hyphens are allowed' }
                })}
                placeholder="Ada Lovelace"
                disabled={isSubmitting}
                className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs font-medium text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Academic Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Academic Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('email', { 
                  onChange: clearError,
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                })}
                placeholder="scholar@university.edu"
                disabled={isSubmitting}
                className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Phone <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('phone', { 
                  onChange: clearError,
                  pattern: { value: /^\+?[0-9]{10,14}$/, message: 'Invalid phone number format' }
                })}
                placeholder="+923001234567"
                disabled={isSubmitting}
                className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs font-medium text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('password', { 
                  onChange: clearError,
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                    message: 'Password must contain uppercase, number, and special character'
                  },
                  validate: (value, formValues) => {
                    if (value === formValues.email) {
                      return 'Password cannot be identical to your email address';
                    }
                    return true;
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isSubmitting}
                className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              <button 
                type="button" 
                disabled={isSubmitting} 
                onClick={() => setShowPassword(!showPassword)} 
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 4-segment Password Strength Bar */}
            {passwordValue && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-slate-500 dark:text-slate-400">Security Score:</span>
                  <span className={`font-bold ${getStrengthLabel().color}`}>{getStrengthLabel().label}</span>
                </div>
                {/* 4 distinct segments */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5 mb-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div 
                      key={idx} 
                      className={`h-full rounded-full transition-colors duration-300 ${getSegmentColor(idx)}`} 
                    />
                  ))}
                </div>

                {/* Visual Checklist */}
                <ul className="space-y-1">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {req.valid ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                      <span className={req.valid ? 'text-slate-700 dark:text-slate-300' : ''}>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('confirmPassword', { 
                  onChange: clearError,
                  required: 'Please confirm your password',
                  validate: (value, formValues) => {
                    if (value !== formValues.password) {
                      return "Passwords don't match";
                    }
                    return true;
                  }
                })}
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs font-medium text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Terms */}
          <div className="pt-1">
            <div className="flex items-start">
              <input
                {...register('terms', { 
                  onChange: (event) => {
                    clearError();
                    setValue('terms', event.target.checked, { shouldValidate: true });
                  },
                  validate: (value) => value === true || 'You must accept the library terms'
                })}
                type="checkbox"
                id="terms"
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5 focus:ring-blue-500/20"
              />
              <label htmlFor="terms" className="ml-2 text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer leading-tight">
                I agree to the library policy guidelines and accept liability for overdue items.
              </label>
            </div>
            {errors.terms && <p className="text-xs font-medium text-red-500 mt-1">{errors.terms.message}</p>}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting || serverError !== ''}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] mt-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}