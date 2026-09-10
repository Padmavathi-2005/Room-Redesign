'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Shield,
  Trash2,
  Edit3,
  CheckCircle2,
  Mail,
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  X,
  Filter,
  Gift,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import AdminModal from '@/components/admin/AdminModal';
import { CreditTokenIcon } from '@/components/ui';
import CustomSelect from '@/components/ui/CustomSelect';
import { useAdminSearch } from '@/context/AdminSearchContext';
import { useLanguage } from '@/context/LanguageContext';
import { adminService, AdminUser } from '@/services/admin.service';

export default function AdminUsersPage() {
  const { searchQuery } = useAdminSearch();
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState<boolean>(false);
  const [newCredits, setNewCredits] = useState<number>(100);
  const [newTier, setNewTier] = useState<string>('FREE');
  const [topupReason, setTopupReason] = useState<string>('Direct Cash/Bank Payment received');
  const [showConfirmStep, setShowConfirmStep] = useState<boolean>(false);
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
    setTopupReason('Direct Payment Received by Admin');
    setShowConfirmStep(false);
    setIsCreditModalOpen(true);
  };

  const handleSaveCredits = async () => {
    if (!selectedUser) return;
    setIsActionSubmitting(true);
    try {
      const prevCredits = selectedUser.credits ?? 0;
      const creditDifference = newCredits - prevCredits;
      const tierChanged = newTier !== (selectedUser.subscriptionTier || 'FREE');

      if (creditDifference > 0) {
        // Direct Admin Top-up
        await adminService.addCreditsToUser(
          selectedUser._id,
          creditDifference,
          topupReason || 'Direct Payment Received by Admin',
        );
        if (tierChanged) {
          await adminService.updateUser(selectedUser._id, {
            subscriptionTier: newTier,
          });
        }
      } else {
        await adminService.updateUser(selectedUser._id, {
          credits: newCredits,
          subscriptionTier: newTier,
        });
      }

      const updateNotice = `🎉 Admin Topup: Your account has been credited with +${Math.abs(creditDifference)} AI Credits (${newTier} Plan Active)!`;
      setSuccessMessage(`User ${selectedUser.email} credited successfully (${newCredits} total credits, ${newTier} plan)`);
      setIsCreditModalOpen(false);

      // Dispatch user update event for local user session
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const currentLoggedIn = JSON.parse(stored);
            if (currentLoggedIn._id === selectedUser._id || currentLoggedIn.email === selectedUser.email) {
              const updatedUser = {
                ...currentLoggedIn,
                credits: newCredits,
                plan: newTier,
                adminGrantedNotice: updateNotice,
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              window.dispatchEvent(new Event('user-updated'));
              window.dispatchEvent(new Event('user-credits-updated'));
            }
          } catch (e) {}
        }
      }

      loadUsers();
    } catch (err) {
      setErrorMessage('Failed to update user limits & credits');
    } finally {
      setIsActionSubmitting(false);
      setShowConfirmStep(false);
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

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'User & Email',
      sortable: true,
      accessor: (user) => {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0 font-heading">
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
        const tier = (user.subscriptionTier || 'FREE').toUpperCase();
        return (
          <div className="flex flex-col gap-1 items-start">
            <span
              className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {user.role}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-heading">
              <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              {tier} Plan
            </span>
          </div>
        );
      },
    },
    {
      key: 'credits',
      header: t('admin.users.creditsBalance') || 'AI Credits Balance',
      sortable: true,
      accessor: (user) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
          <CreditTokenIcon size="xs" />
          <span>{user.credits ?? 100}</span>
        </div>
      ),
    },
    {
      key: 'usage',
      header: t('admin.users.projectsRooms') || 'Projects & Rooms',
      accessor: (user) => {
        const pCount = user.projectCount || 0;
        const rCount = user.roomCount || 0;

        return (
          <div className="text-xs space-y-1 text-slate-600">
            {pCount > 0 ? (
              <Link
                href={`/admin/projects?search=${encodeURIComponent(user.email)}`}
                className="group flex items-center gap-1 font-bold text-indigo-600 hover:text-purple-700 transition-colors cursor-pointer"
                title={`Click to view ${pCount} project(s) for ${user.email}`}
              >
                <span className="group-hover:scale-110 transition-transform">📁</span>
                <span className="underline decoration-indigo-200 group-hover:decoration-purple-500 font-heading">
                  {pCount} {t('admin.users.projectsCount') || 'Projects'}
                </span>
              </Link>
            ) : (
              <div className="text-slate-400 font-medium flex items-center gap-1 opacity-70">
                <span>📁</span>
                <span>0 {t('admin.users.projectsCount') || 'Projects'}</span>
              </div>
            )}

            {rCount > 0 ? (
              <Link
                href={`/admin/images?search=${encodeURIComponent(user.email)}`}
                className="group flex items-center gap-1 font-bold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                title={`Click to view ${rCount} room conversion(s) for ${user.email}`}
              >
                <span className="group-hover:scale-110 transition-transform">🏠</span>
                <span className="underline decoration-purple-200 group-hover:decoration-purple-500 font-heading">
                  {rCount} {t('admin.users.roomsCount') || 'Converted Rooms'}
                </span>
              </Link>
            ) : (
              <div className="text-slate-400 font-medium flex items-center gap-1 opacity-70">
                <span>🏠</span>
                <span>0 {t('admin.users.roomsCount') || 'Converted Rooms'}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: t('admin.users.actions') || 'Actions',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreditModal(user)}
            className="p-1.5 rounded-[10px] bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer"
            title={t('admin.users.editCredits') || 'Edit User Limits & Credits'}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDeleteModal(user)}
            className="p-1.5 rounded-[10px] bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
            title={t('admin.users.deleteUser') || 'Delete User'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Table Filter States
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && (u.role || 'USER').toUpperCase() !== roleFilter) {
        return false;
      }
      if (planFilter !== 'ALL') {
        const userTier = (u.subscriptionTier || 'FREE').toUpperCase();
        if (planFilter === 'FREE' && userTier !== 'FREE') return false;
        if (planFilter === 'STARTER' && !userTier.includes('STARTER')) return false;
        if (planFilter === 'PRO' && !userTier.includes('PRO')) return false;
        if (planFilter === 'AGENCY' && !userTier.includes('AGENCY') && !userTier.includes('ENTERPRISE')) return false;
      }

      if (searchQuery && searchQuery.trim()) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
        const fullSearchableText = [
          u.email,
          fullName,
          u.firstName,
          u.lastName,
          u.role,
          u.subscriptionTier,
          u.credits?.toString(),
          u.projectCount?.toString(),
          u.roomCount?.toString(),
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesQuery = searchTerms.every((term) => fullSearchableText.includes(term));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [users, roleFilter, planFilter, searchQuery]);

  const userFilterToolbar = (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[10px] border border-slate-200">
        <div className="flex items-center gap-1 px-2 text-slate-500 text-xs font-bold">
          <Filter className="w-3.5 h-3.5 text-purple-600" />
          <span>Role:</span>
        </div>
        <button
          type="button"
          onClick={() => setRoleFilter('ALL')}
          className={`px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
            roleFilter === 'ALL' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('admin.users.allUsers') || 'All Users'} ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('USER')}
          className={`px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
            roleFilter === 'USER' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Standard Users ({users.filter((u) => (u.role || 'USER').toUpperCase() === 'USER').length})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('ADMIN')}
          className={`px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
            roleFilter === 'ADMIN' ? 'bg-purple-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Admins ({users.filter((u) => u.role === 'ADMIN').length})
        </button>
      </div>

      {/* Plan Filter Dropdown with Custom Design */}
      <CustomSelect
        value={planFilter}
        onChange={(val) => setPlanFilter(val)}
        labelPrefix="Plan:"
        size="sm"
        options={[
          { value: 'ALL', label: 'All Subscription Plans' },
          { value: 'FREE', label: 'Free Tier' },
          { value: 'STARTER', label: 'Starter Pro ($19)' },
          { value: 'PRO', label: 'Pro Studio ($39)' },
          { value: 'AGENCY', label: 'Agency Master ($89)' },
        ]}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        actions={userFilterToolbar}
        externalSearchQuery={searchQuery}
        hideSearchInput={true}
        isLoading={isLoading}
        emptyMessage="No registered users found matching filter criteria"
        initialPageSize={10}
      />

      {/* EDIT CREDITS & PLAN TIER MODAL */}
      <AdminModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title="Manage User Limits & Plan"
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4 text-left">
            {/* Top User Overview Card */}
            <div className="p-3 bg-slate-50 rounded-[10px] border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-slate-900 block font-heading">{selectedUser.email}</span>
                <span className="text-[10px] text-slate-500 font-mono block">ID: {selectedUser._id}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                {selectedUser.subscriptionTier || 'FREE'}
              </span>
            </div>

            {/* Direct Editable Credit Input */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block text-xs">AI Credit Balance (Direct Editable):</label>
              <div className="relative flex items-center">
                <div className="absolute left-3">
                  <CreditTokenIcon size="xs" />
                </div>
                <input
                  type="number"
                  min={0}
                  value={newCredits}
                  onChange={(e) => setNewCredits(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-[10px] font-mono font-extrabold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Quick Top-Up Pills */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-bold">Quick Add:</span>
                {[+25, +50, +100, +250].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setNewCredits((prev) => prev + amount)}
                    className="px-2 py-1 rounded-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Payment Note / Reason Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-slate-700 font-bold block text-xs">Payment Reference / Top-Up Note:</label>
              <input
                type="text"
                placeholder="e.g. Direct Bank Transfer / Offline Cash payment received by Admin"
                value={topupReason}
                onChange={(e) => setTopupReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[10px] text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <p className="text-[10px] text-slate-400">This reason will be recorded on the user's transaction ledger & email notification.</p>
            </div>

            {/* Plan Category Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-slate-700 font-bold block text-xs">Select Subscription Plan Tier:</label>
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'FREE', label: 'Free Tier', price: '$0/mo', credits: 0, desc: 'Basic Access & 30-Day Workspace Trial' },
                    { id: 'STARTER', label: 'Starter Pro', price: '$19/mo', credits: 40, desc: 'Standard AI Renders & 8K Quality' },
                    { id: 'PRO', label: 'Pro Studio', price: '$39/mo', credits: 100, desc: 'Priority Queue & Multi-Room Render' },
                    { id: 'AGENCY', label: 'Agency Master', price: '$89/mo', credits: 1000, desc: 'Unlimited Agency Access & Support' },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setNewTier(plan.id);
                        setNewCredits(plan.credits);
                      }}
                      className={`p-3 rounded-[10px] border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        newTier === plan.id
                          ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-heading">
                          <span className="font-extrabold text-xs text-slate-900">{plan.label}</span>
                          <span className="text-[11px] font-extrabold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded-[6px]">{plan.price}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">{plan.desc}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 pt-2 border-t border-slate-100 mt-2">
                        <CreditTokenIcon size="xs" />
                        <span>+{plan.credits} Credits Included</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirmation Step Toggle */}
            {showConfirmStep ? (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-[10px] text-xs font-bold text-amber-900 space-y-2">
                <p>Are you sure you want to grant <strong>{newCredits} AI Credits</strong> and set plan to <strong>{newTier}</strong> for {selectedUser.email}?</p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmStep(false)}
                    className="px-3 py-1 rounded-[8px] bg-white border border-amber-300 text-slate-700 text-[11px] font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCredits}
                    disabled={isActionSubmitting}
                    className="px-3 py-1 rounded-[8px] bg-amber-500 text-slate-950 text-[11px] font-black hover:bg-amber-400 cursor-pointer shadow-xs"
                  >
                    {isActionSubmitting ? 'Confirming...' : 'Confirm Grant'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreditModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmStep(true)}
                  className="px-5 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Save & Confirm Grant
                </button>
              </div>
            )}
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
            <div className="w-12 h-12 rounded-[10px] bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
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
                className="px-4 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isActionSubmitting}
                className="px-5 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
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
