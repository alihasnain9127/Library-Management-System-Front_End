'use client';

import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import api from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, control, clearErrors, setValue, formState: { errors, isValid, isSubmitting } } = useForm({
    mode: 'onChange'
  });

  const formValues = useWatch({ control });
  const passwordValue = formValues?.password || '';

  const clearError = () => {
    if (serverError) setServerError('');
  };

  // Live Metric Rules Arrays
  const requirements = [
    { label: 'At least 8 characters long', valid: passwordValue.length >= 8 },
    { label: 'Contains an uppercase letter', valid: /[A-Z]/.test(passwordValue) },
    { label: 'Contains at least one number', valid: /[0-9]/.test(passwordValue) },
    { label: 'Contains a special character (!@#$%^&*)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue) },
  ];

  const strengthScore = requirements.filter(req => req.valid).length;

  const getStrengthLabel = () => {
    if (!passwordValue) return { label: 'None', color: 'bg-slate-200 dark:bg-slate-800 text-slate-400', width: 'w-0' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-red-500 text-red-500', width: 'w-1/4' };
    if (strengthScore <= 3) return { label: 'Medium', color: 'bg-amber-500 text-amber-500', width: 'w-3/4' };
    return { label: 'Strong Security Profile', color: 'bg-emerald-500 text-emerald-500', width: 'w-full' };
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
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Create Library Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register to start borrowing and browsing the catalog.</p>
        </div>

        {serverError && (
          <div className="mt-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-600 dark:text-red-400 text-center font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Full Name Input */}
          <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('name', { 
                onChange: clearError,
                required: 'Full name is required',
                maxLength: {
                  value: 50,
                  message: 'Name cannot exceed 50 characters'
                },
                pattern: {
                  value: /^[a-zA-Z\s\-]+$/,
                  message: 'Only letters, spaces, and hyphens are allowed'
                }
              })}
              placeholder="John Doe"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className={`w-full h-10 pl-10 pr-4 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
            />
          </div>
          {errors.name && <p className="text-xs font-medium text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Email</label>
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
              placeholder="student@university.edu"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className={`w-full h-10 pl-10 pr-4 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
            />
          </div>
          {errors.email && <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('phone', { 
                onChange: clearError,
                pattern: {
                  value: /^\+?[0-9]{10,14}$/,
                  message: 'Invalid phone number format'
                }
              })}
              placeholder="+923001234567"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className={`w-full h-10 pl-10 pr-4 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.phone ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
            />
          </div>
          {errors.phone && <p className="text-xs font-medium text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('password', { 
                onChange: clearError,
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                  message: 'Password must contain an uppercase letter, a number, and a special character'
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
              aria-disabled={isSubmitting}
              className={`w-full h-10 pl-10 pr-10 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
            />
            <button type="button" disabled={isSubmitting} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Live Strength Track Slider */}
          {passwordValue && (
            <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-500">Password Strength:</span>
                <span className={`font-bold ${getStrengthLabel().color.split(' ')[1]}`}>{getStrengthLabel().label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${getStrengthLabel().color.split(' ')[0]} ${getStrengthLabel().width}`} />
              </div>

              {/* Visual Checklist */}
              <ul className="mt-3 space-y-1">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {req.valid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={req.valid ? 'text-slate-700 dark:text-slate-300 line-through opacity-60' : ''}>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
              aria-disabled={isSubmitting}
              className={`w-full h-10 pl-10 pr-4 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.confirmPassword ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs font-medium text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms & Conditions Checkbox */}
        <div>
          <div className="flex items-start">
            <input
              {...register('terms', { 
                onChange: (event) => {
                  clearError();
                  setValue('terms', event.target.checked, { shouldValidate: true });
                },
                validate: (value) => value === true || 'You must accept the Terms & Conditions'
              })}
              type="checkbox"
              id="terms"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="terms" className={`ml-2 text-xs text-slate-600 dark:text-slate-400 select-none leading-tight ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              I hereby declare that all profile metrics are valid and accept systemic liability for book return rules.
            </label>
          </div>
          {errors.terms && <p className="text-xs font-medium text-red-500 mt-1">{errors.terms.message}</p>}
        </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting || serverError !== ''}
            aria-disabled={!isValid || isSubmitting || serverError !== ''}
            aria-busy={isSubmitting}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Login instead
          </Link>
        </div>

      </div>
    </div>
  );
}