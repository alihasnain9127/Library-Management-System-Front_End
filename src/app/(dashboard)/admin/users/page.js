'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleUserSuspension } from '@/redux/slices/usersSlice';
import { Search, UserX, UserCheck, Shield, GraduationCap, Mail } from 'lucide-react';
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">User Authorization Registry</h1>
        <p className="text-sm text-slate-500">Monitor active academic registrations, assign clearance roles, and enforce policies.</p>
      </div>

      {/* Toolbar Search Wrapper */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts by legal name string or email keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Main Framework Table View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="p-4">Identified Account Profile</th>
                <th className="p-4">Assigned Systemic Privilege</th>
                <th className="p-4">Account Integrity State</th>
                <th className="p-4 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Syncing active member registries...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">No account entries matched validation keys.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-50">{user.name}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-md">
                          <Shield className="w-3 h-3" /> System Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md">
                          <GraduationCap className="w-3.5 h-3.5" /> General Scholar
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md inline-block w-fit ${user.isSuspended
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/30'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                          }`}>
                          {user.isSuspended ? 'Suspended Lock' : 'Active Pass'}
                        </span>
                        {user.isSuspended && (
                          <div className="text-[10px] text-slate-400 space-y-0.5">
                            {user.suspensionEndDate ? (
                              <p>Until: {new Date(user.suspensionEndDate).toLocaleDateString()}</p>
                            ) : (
                              <p className="text-red-400">Indefinite</p>
                            )}
                            {user.suspensionReasons?.length > 0 && (
                              <p>{user.suspensionReasons.length} reason(s) on record</p>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => handleSuspensionMutation(user)}
                          className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1 ${user.isSuspended
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40'
                            : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40'
                            }`}
                        >
                          {user.isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          {user.isSuspended ? 'Lift Restrictions' : 'Impose Lock'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Immutable Permissions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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