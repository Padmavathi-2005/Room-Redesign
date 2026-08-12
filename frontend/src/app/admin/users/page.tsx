'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Shield,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Coins,
  Layers,
  Sparkles,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { adminService, AdminUser } from '@/services/admin.service';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState<boolean>(false);
  const [newCredits, setNewCredits] = useState<number>(100);
  const [newTier, setNewTier] = useState<string>('FREE');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState<boolean>(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch admin users:', err);
      setErrorMessage('Failed to load users list. Please check API server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Are you sure you want to change ${user.email}'s role to ${newRole}?`)) return;

    setIsActionSubmitting(true);
    try {
      await adminService.updateUser(user._id, { role: newRole });
      setSuccessMessage(`Role updated for ${user.email} to ${newRole}`);
      loadUsers();
    } catch (err) {
      setErrorMessage('Failed to update user role');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleOpenCreditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setNewCredits(user.credits ?? 100);
    setNewTier(user.subscriptionTier || 'FREE');
    setIsCreditModalOpen(true);
  };

  const handleSaveCredits = async () => {
    if (!selectedUser) return;
    setIsActionSubmitting(true);
    try {
      await adminService.updateUser(selectedUser._id, {
        credits: newCredits,
        subscriptionTier: newTier,
      });
      setSuccessMessage(`User ${selectedUser.email} updated (${newCredits} credits, ${newTier} plan)`);
      setIsCreditModalOpen(false);

      // If updating current logged in user, update localStorage & dispatch event
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const currentLoggedIn = JSON.parse(stored);
          if (currentLoggedIn._id === selectedUser._id || currentLoggedIn.email === selectedUser.email) {
            localStorage.setItem('user', JSON.stringify({ ...currentLoggedIn, credits: newCredits }));
            window.dispatchEvent(new Event('user-updated'));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      loadUsers();
    } catch (err) {
      setErrorMessage('Failed to update user limits');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsActionSubmitting(true);
    try {
      await adminService.deleteUser(selectedUser._id);
      setSuccessMessage(`User ${selectedUser.email} deleted successfully`);
      setIsDeleteModalOpen(false);
      loadUsers();
    } catch (err) {
      setErrorMessage('Failed to delete user');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Define Columns for DataTable
  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'User & Email',
      sortable: true,
      accessor: (user) => {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-extrabold flex items-center justify-center text-xs border border-purple-200">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-white block font-heading truncate">
                {fullName}
              </span>
              <span className="text-[11px] text-slate-500 font-mono block truncate">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role & Plan Tier',
      sortable: true,
      accessor: (user) => (
        <div className="flex flex-col gap-1 items-start">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-heading ${
              user.role === 'ADMIN'
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>{user.role}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
            {user.subscriptionTier || 'FREE'} PLAN
          </span>
        </div>
      ),
    },
    {
      key: 'credits',
      header: 'Credits Balance',
      sortable: true,
      accessor: (user) => (
        <div className="flex items-center gap-1.5 font-extrabold text-slate-900 font-mono text-xs">
          <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{user.credits ?? 0} Credits</span>
        </div>
      ),
    },
    {
      key: 'projectCount',
      header: 'Projects / Rooms',
      sortable: true,
      accessor: (user) => (
        <div className="text-xs space-y-0.5 font-semibold">
          <span className="text-slate-800 block">📁 {user.projectCount || 0} Projects</span>
          <span className="text-slate-500 block text-[11px]">🏠 {user.roomCount || 0} Converted Rooms</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined Date',
      sortable: true,
      accessor: (user) => (
        <span className="text-slate-500 text-xs font-medium">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenCreditModal(user)}
            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            title="Edit Credits & Plan Tier"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Manage Limits</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleRole(user)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
            title="Toggle Role"
          >
            {user.role === 'ADMIN' ? 'Demote' : 'Promote Admin'}
          </button>

          <button
            type="button"
            onClick={() => handleOpenDeleteModal(user)}
            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
            title="Delete User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE TITLE & REFRESH BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-extrabold rounded-full font-heading">
            <UserIcon className="w-3.5 h-3.5" />
            <span>Platform User Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">Users Management</h1>
          <p className="text-xs text-slate-500">
            View registered user accounts, manage AI credits balance, assign Admin roles, and monitor usage.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer font-heading border border-slate-200 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* NOTIFICATION MESSAGES */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage('')} className="text-rose-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* REUSABLE DATA TABLE */}
      <DataTable
        title={`Registered Accounts (${users.length})`}
        subtitle="Search by name, email, or filter columns"
        columns={columns}
        data={users}
        searchPlaceholder="Search users by name, email..."
        searchKeys={['email', 'firstName', 'lastName', 'role', 'subscriptionTier']}
        isLoading={isLoading}
        emptyMessage="No users found in database"
        initialPageSize={10}
      />

      {/* EDIT CREDITS & TIER MODAL */}
      <AnimatePresence>
        {isCreditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span>Manage User Credits & Subscription</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block">Target User Account:</label>
                  <span className="font-extrabold text-slate-900 text-sm block">{selectedUser.email}</span>
                </div>

                {/* Subscription Tier Selection */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Assigned Plan Tier:</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                  >
                    <option value="FREE">Free Tier (Default)</option>
                    <option value="STARTER">Starter Tier ($19/mo)</option>
                    <option value="STANDARD">Standard Tier ($49/mo)</option>
                    <option value="PROFESSIONAL">Professional Tier ($99/mo)</option>
                  </select>
                </div>

                {/* Credit Balance & Top up Presets */}
                <div className="space-y-2">
                  <label className="text-slate-700 font-bold block">AI Credit Balance:</label>
                  <input
                    type="number"
                    min={0}
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-extrabold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />

                  {/* Quick Add Presets */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold">Quick Top-Up:</span>
                    {[+25, +50, +100, +250].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setNewCredits((prev) => prev + amount)}
                        className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-extrabold border border-purple-200 transition-colors"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-slate-500 block pt-1">
                    1 credit allows generating 1 room redesign using AI vision processing models.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCredits}
                  disabled={isActionSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                >
                  {isActionSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">Delete Account</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to delete <strong className="text-slate-900">{selectedUser.email}</strong>? All
                  associated projects and room conversions will be permanently removed.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isActionSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                >
                  {isActionSubmitting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
