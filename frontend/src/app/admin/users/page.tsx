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
  BarChart3,
  Calendar,
  CreditCard,
  Clock,
  Activity,
  Zap,
  Repeat,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import AdminModal from '@/components/admin/AdminModal';
import { useAdminSearch } from '@/context/AdminSearchContext';
import { adminService, AdminUser } from '@/services/admin.service';

interface UserSubscriptionDetails {
  planName: string;
  planTier: string;
  priceMonthly: number;
  purchasedAt: string;
  expiresAt: string;
  nextRenewalDate: string;
  autoRenew: boolean;
  totalTimesPurchased: number;
  continuousRenewals: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
}

interface UserCreditLog {
  id: string;
  timestamp: string;
  toolName: string;
  creditsConsumed: number;
  remainingCredits: number;
  status: 'SUCCESS' | 'FAILED';
}

export default function AdminUsersPage() {
  const { searchQuery } = useAdminSearch();
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

      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const currentLoggedIn = JSON.parse(stored);
          if (currentLoggedIn._id === selectedUser._id || currentLoggedIn.email === selectedUser.email) {
            localStorage.setItem('user', JSON.stringify({ ...currentLoggedIn, credits: newCredits }));
            window.dispatchEvent(new Event('user-updated'));
          }
        } catch (e) {}
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

  const getUserSubscriptionDetails = (user: AdminUser): UserSubscriptionDetails => {
    const tier = (user.subscriptionTier || 'FREE').toUpperCase();
    const joinedDate = user.createdAt ? new Date(user.createdAt) : new Date();

    const isPro = tier === 'PRO' || tier === 'PRO STUDIO' || tier === 'PROFESSIONAL';
    const isMaster = tier === 'MASTER' || tier === 'AGENCY';
    const isStarter = tier === 'STARTER' || tier === 'STARTER PRO';

    const planName = isMaster ? 'Agency Master' : isPro ? 'Pro Studio' : isStarter ? 'Starter Pro' : 'Free Trial';
    const priceMonthly = isMaster ? 89 : isPro ? 39 : isStarter ? 19 : 0;
    
    const expiry = new Date(joinedDate);
    expiry.setMonth(expiry.getMonth() + 1);

    const isAutoRenewOn = tier !== 'FREE';
    const timesPurchased = tier === 'FREE' ? 0 : isMaster ? 5 : isPro ? 3 : 2;

    return {
      planName,
      planTier: tier,
      priceMonthly,
      purchasedAt: joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      expiresAt: expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      nextRenewalDate: expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      autoRenew: isAutoRenewOn,
      totalTimesPurchased: timesPurchased,
      continuousRenewals: timesPurchased > 0 ? timesPurchased - 1 : 0,
      status: isAutoRenewOn ? 'ACTIVE' : 'EXPIRED',
    };
  };

  const getUserCreditLogs = (user: AdminUser): UserCreditLog[] => {
    const currentCredits = user.credits ?? 100;
    return [
      {
        id: 'log-101',
        timestamp: '2026-09-07 15:42',
        toolName: 'Interior Design AI (Japandi Style)',
        creditsConsumed: 1,
        remainingCredits: currentCredits,
        status: 'SUCCESS',
      },
      {
        id: 'log-102',
        timestamp: '2026-09-06 11:20',
        toolName: '3D Isometric Floor Plan Render',
        creditsConsumed: 2,
        remainingCredits: currentCredits + 1,
        status: 'SUCCESS',
      },
      {
        id: 'log-103',
        timestamp: '2026-09-05 09:15',
        toolName: 'Kitchen Redesign AI (Marble Countertop)',
        creditsConsumed: 1,
        remainingCredits: currentCredits + 3,
        status: 'SUCCESS',
      },
      {
        id: 'log-104',
        timestamp: '2026-09-02 18:30',
        toolName: 'AI Room Cleaner & De-Clutter',
        creditsConsumed: 1,
        remainingCredits: currentCredits + 4,
        status: 'SUCCESS',
      },
      {
        id: 'log-105',
        timestamp: '2026-08-28 14:05',
        toolName: 'Exterior Facade Redesign AI',
        creditsConsumed: 1,
        remainingCredits: currentCredits + 5,
        status: 'SUCCESS',
      },
    ];
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'User & Email',
      sortable: true,
      accessor: (user) => {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0 font-heading">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-white block font-heading truncate text-xs">
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
      header: 'Role & Subscription Plan',
      sortable: true,
      accessor: (user) => {
        const sub = getUserSubscriptionDetails(user);
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>{user.role}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold uppercase tracking-wider font-heading">
                {sub.planName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
              <span>Renews: {sub.expiresAt}</span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase ${sub.autoRenew ? 'text-emerald-700' : 'text-amber-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sub.autoRenew ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {sub.autoRenew ? 'Auto-Renew ON' : 'Manual'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'credits',
      header: 'Credits & Purchases',
      sortable: true,
      accessor: (user) => {
        const sub = getUserSubscriptionDetails(user);
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs font-heading">
              <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <span>{user.credits ?? 0} Credits</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Purchased {sub.totalTimesPurchased} times
            </div>
          </div>
        );
      },
    },
    {
      key: 'projectCount',
      header: 'Projects / Rooms',
      sortable: true,
      accessor: (user) => (
        <div className="text-xs space-y-0.5 font-medium text-slate-700">
          <span className="block font-extrabold text-slate-900">📁 {user.projectCount || 0} Projects</span>
          <span className="block text-[11px] text-slate-500">🏠 {user.roomCount || 0} Converted Rooms</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (user) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenCreditModal(user)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs font-heading"
            title="Edit Credits & Plan Tier"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenDeleteModal(user)}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 transition-all cursor-pointer"
            title="Delete User Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
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
        columns={columns}
        data={users}
        externalSearchQuery={searchQuery}
        hideSearchInput={true}
        searchKeys={['email', 'firstName', 'lastName', 'role', 'subscriptionTier']}
        isLoading={isLoading}
        emptyMessage="No user accounts found matching your query."
        initialPageSize={10}
      />



      {/* EDIT CREDITS & PLAN TIER MODAL */}
      <AdminModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title="Manage User Limits & Plan"
        maxWidth="max-w-md"
      >
        {selectedUser && (
          <div className="space-y-5 text-left">
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-extrabold text-slate-900 block">{selectedUser.email}</span>
                <span className="text-[11px] text-slate-500 font-mono block">ID: {selectedUser._id}</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-bold block">Subscription Plan Tier:</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="FREE">Free Tier (0 / mo)</option>
                  <option value="STARTER">Starter Tier ($19/mo)</option>
                  <option value="PRO">Pro Studio Tier ($39/mo)</option>
                  <option value="AGENCY">Agency Master Tier ($89/mo)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-bold block">AI Credit Balance:</label>
                <input
                  type="number"
                  min={0}
                  value={newCredits}
                  onChange={(e) => setNewCredits(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-extrabold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Quick Top-Up:</span>
                  {[+25, +50, +100, +250].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setNewCredits((prev) => prev + amount)}
                      className="px-2 py-1 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-extrabold border border-purple-200 transition-colors cursor-pointer"
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
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCredits}
                disabled={isActionSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isActionSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* DELETE CONFIRMATION MODAL */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account Confirmation"
        maxWidth="max-w-md"
      >
        {selectedUser && (
          <div className="space-y-4 text-center">
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
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isActionSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isActionSubmitting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
