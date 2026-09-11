'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleUserSuspension } from '@/redux/slices/usersSlice';
import { Search, UserX, UserCheck, Shield, GraduationCap, Mail, Users, X } from 'lucide-react';
import SuspensionModal from '@/components/dashboard/admin/SuspensionModal';

export default function AdministrativeUserDirectory() {
  const dispatch = useDispatch();
  const { list: users, loading, actionLoading } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleSuspensionMutation = (user) => {
    if (user.role === 'admin') return;
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const executeSuspensionChange = async ({ suspensionReason, suspensionEndDate }) => {
    if (!selectedUser) return;
    const willSuspend = !selectedUser.isSuspended;
    try {
      await dispatch(toggleUserSuspension({
        userId: selectedUser._id,
        isSuspended: willSuspend,
        suspensionReason: suspensionReason || undefined,
        suspensionEndDate: suspensionEndDate || null
      })).unwrap();
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(`Failed to ${willSuspend ? 'suspend' : 'reactivate'} user:`, error);
    }
  };

  const filteredUsers = (users || []).filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            User Authorization Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor registered members, review privileges, and administer account standing.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <strong>{users.length}</strong> Registered Accounts
          </span>
        </div>
      </div>

      {/* ── Search Toolbar ──────────────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="hidden sm:inline-block text-xs text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* ── Users Table ─────────────────────────────────── */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-e1)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold select-none">
                <th className="py-3.5 px-5">Account Profile</th>
                <th className="py-3.5 px-4">Role / Privilege</th>
                <th className="py-3.5 px-4">Account Standing</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-blue-500 animate-pulse" />
                      <span className="text-sm font-medium">Loading user directory…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-200">No matching accounts</p>
                      <p className="text-xs text-slate-400">Try adjusting your search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr 
                      key={user._id} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-50">
                            {user.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 px-2.5 py-0.5 rounded-full">
                            <Shield className="w-3.5 h-3.5 text-purple-500" /> Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 px-2.5 py-0.5 rounded-full">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Scholar
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border w-fit ${
                            user.isSuspended
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/50 dark:border-red-900/40'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/40'
                          }`}>
                            {user.isSuspended ? (
                              <><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Suspended</>
                            ) : (
                              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</>
                            )}
                          </span>
                          {user.isSuspended && (
                            <div className="text-[11px] text-slate-400 space-y-0.5 pl-1">
                              {user.suspensionEndDate ? (
                                <p>Until: {new Date(user.suspensionEndDate).toLocaleDateString()}</p>
                              ) : (
                                <p className="text-red-500 font-semibold">Indefinite duration</p>
                              )}
                              {user.suspensionReasons?.length > 0 && (
                                <p>{user.suspensionReasons.length} reason(s) recorded</p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {!isAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleSuspensionMutation(user)}
                            className={`h-8 px-3 font-semibold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 border shadow-sm ${
                              user.isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border-emerald-200/60 dark:border-emerald-800/40'
                                : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-600 dark:hover:text-white border-red-200/60 dark:border-red-800/40'
                            }`}
                          >
                            {user.isSuspended ? (
                              <><UserCheck className="w-3.5 h-3.5" /> <span>Restore Access</span></>
                            ) : (
                              <><UserX className="w-3.5 h-3.5" /> <span>Suspend Account</span></>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Immutable</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Suspension / Restoration Modal ─────────────── */}
      <SuspensionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        onConfirm={executeSuspensionChange}
        isProcessing={actionLoading}
      />
    </div>
  );
}