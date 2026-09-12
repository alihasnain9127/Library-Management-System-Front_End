'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAdminUser } from '@/redux/slices/usersSlice';
import {
  X,
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function AddAdminModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { createLoading } = useSelector((state) => state.users);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetState = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setServerError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const handleClose = useCallback(() => {
    if (createLoading) return;
    resetState();
    onClose();
  }, [createLoading, resetState, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!/^[a-zA-Z\s\-]+$/.test(form.name)) {
      newErrors.name = 'Only letters, spaces, and hyphens allowed';
    } else if (form.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (form.phone && !/^\+?[0-9]{10,14}$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    const pwdPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (!pwdPattern.test(form.password)) {
      newErrors.password = 'Must be ≥8 chars with uppercase, number & special character';
    } else if (form.password === form.email) {
      newErrors.password = 'Password cannot match the email address';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(
        createAdminUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
        })
      ).unwrap();
      toast.success(`Admin account for "${form.name.trim()}" created successfully.`);
      handleClose();
    } catch (err) {
      setServerError(err || 'Failed to create administrator account.');
    }
  };

  // ── Password strength ────────────────────────────────────
  const pwdChecks = [
    { label: 'At least 8 characters', valid: form.password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(form.password) },
    { label: 'Number (0–9)', valid: /[0-9]/.test(form.password) },
    { label: 'Special character', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password) },
  ];
  const strength = pwdChecks.filter((c) => c.valid).length;
  const strengthMeta = () => {
    if (!form.password) return { label: '', color: '' };
    if (strength <= 1) return { label: 'Weak', color: 'text-red-500' };
    if (strength === 2) return { label: 'Fair', color: 'text-amber-500' };
    if (strength === 3) return { label: 'Good', color: 'text-blue-500' };
    return { label: 'Strong', color: 'text-emerald-500' };
  };
  const segmentColor = (i) => {
    if (!form.password || i >= strength) return 'bg-slate-200 dark:bg-slate-700';
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-amber-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const inputBase =
    'w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-purple-50/50 dark:bg-purple-950/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 id="add-admin-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Create Administrator Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This account will have full administrative privileges.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={createLoading}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0 disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4" noValidate>
          {/* Server error banner */}
          {serverError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-name"
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={handleChange('name')}
                disabled={createLoading}
                className={`${inputBase} ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`}
              />
            </div>
            {errors.name && <p className="text-xs font-medium text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@library.edu"
                value={form.email}
                onChange={handleChange('email')}
                disabled={createLoading}
                className={`${inputBase} ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`}
              />
            </div>
            {errors.email && <p className="text-xs font-medium text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Phone <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-phone"
                type="tel"
                placeholder="+923001234567"
                value={form.phone}
                onChange={handleChange('phone')}
                disabled={createLoading}
                className={`${inputBase} ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`}
              />
            </div>
            {errors.phone && <p className="text-xs font-medium text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                disabled={createLoading}
                className={`${inputBase} pr-11 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`}
              />
              <button
                type="button"
                disabled={createLoading}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength bar + checklist */}
            {form.password && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-slate-500 dark:text-slate-400">Security Score:</span>
                  <span className={`font-bold ${strengthMeta().color}`}>{strengthMeta().label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5 mb-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-full rounded-full transition-colors duration-300 ${segmentColor(i)}`} />
                  ))}
                </div>
                <ul className="space-y-1">
                  {pwdChecks.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${c.valid ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                      <span className={c.valid ? 'text-slate-700 dark:text-slate-300' : ''}>{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm Password <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={createLoading}
                className={`${inputBase} pr-11 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`}
              />
              <button
                type="button"
                disabled={createLoading}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Privilege notice */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-xl text-xs text-purple-700 dark:text-purple-300 space-y-1.5">
            <p className="font-bold text-purple-800 dark:text-purple-200 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Administrator Privileges Granted:
            </p>
            <p>• Full access to all library management modules.</p>
            <p>• Can manage books, circulation, users, and system settings.</p>
            <p>• Account cannot be suspended once created.</p>
          </div>
        </form>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 flex gap-3 justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={createLoading}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-[0.98]"
          >
            {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {createLoading ? 'Creating Account…' : 'Create Admin Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
