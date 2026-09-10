'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Key,
  X,
  UserCheck,
  ShieldAlert,
  Search,
  RefreshCw,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import AdminModal from '@/components/admin/AdminModal';
import { useAdminSearch } from '@/context/AdminSearchContext';
import { adminService, AdminUser } from '@/services/admin.service';

interface AdminMember {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'main_admin' | 'sub_admin' | 'admin';
  isActive: boolean;
  lastLogin?: string;
}

export default function AdminTeamPage() {
  const { searchQuery } = useAdminSearch();
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'sub_admin',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || localStorage.getItem('token') : '';

      const res = await fetch(`${apiUrl}/admin/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setAdmins(json);
      } else {
        // Fallback demo admin list
        setAdmins([
          {
            _id: 'admin_001',
            email: 'admin@gmail.com',
            firstName: 'Main',
            lastName: 'Administrator',
            role: 'main_admin',
            isActive: true,
            lastLogin: new Date().toISOString(),
          },
          {
            _id: 'admin_002',
            email: 'ops.lead@roomai.com',
            firstName: 'Operations',
            lastName: 'Lead',
            role: 'sub_admin',
            isActive: true,
            lastLogin: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch admin team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.firstName || !formData.lastName) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || localStorage.getItem('token') : '';

      const res = await fetch(`${apiUrl}/admin/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Failed to add admin user');
      }

      setIsAddModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'sub_admin' });
      fetchAdmins();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred creating admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminMember) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || localStorage.getItem('token') : '';

      await fetch(`${apiUrl}/admin/team/${admin._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });

      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin account?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || localStorage.getItem('token') : '';

      await fetch(`${apiUrl}/admin/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<AdminMember>[] = [
    {
      key: 'name',
      header: 'Admin Name',
      sortable: true,
      accessor: (admin) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-extrabold flex items-center justify-center text-xs border border-purple-200 dark:border-purple-800 shrink-0 font-heading">
            {admin.firstName?.[0] || 'A'}{admin.lastName?.[0] || 'D'}
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">
            {admin.firstName} {admin.lastName}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      accessor: (admin) => <span className="font-mono text-slate-600 dark:text-slate-400 text-xs">{admin.email}</span>,
    },
    {
      key: 'role',
      header: 'Role Tier',
      sortable: true,
      accessor: (admin) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${
            admin.role === 'main_admin'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}
        >
          <Shield className="w-3 h-3 text-purple-600" />
          {admin.role === 'main_admin' ? 'Main Admin' : 'Sub Admin'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (admin) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(admin)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
            admin.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          {admin.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
          {admin.isActive ? 'Active' : 'Disabled'}
        </button>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      sortable: true,
      accessor: (admin) => (
        <span className="text-xs text-slate-500 font-medium">
          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (admin) => (
        <div className="flex items-center gap-2">
          {admin.email !== 'admin@gmail.com' && admin.role !== 'main_admin' ? (
            <button
              type="button"
              onClick={() => handleDeleteAdmin(admin._id)}
              className="p-1.5 rounded-[10px] bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title="Delete Admin Member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-slate-400 font-mono font-bold text-xs pl-2">-</span>
          )}
        </div>
      ),
    },
  ];

  const adminToolbar = (
    <button
      type="button"
      onClick={() => setIsAddModalOpen(true)}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-2xs transition-all cursor-pointer font-heading"
    >
      <Plus className="w-4 h-4" />
      <span>Add Admin Member</span>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* REUSABLE DATA TABLE INTEGRATED WITH GLOBAL HEADER SEARCH */}
      <DataTable
        columns={columns}
        data={admins}
        actions={adminToolbar}
        externalSearchQuery={searchQuery}
        hideSearchInput={true}
        isLoading={isLoading}
        emptyMessage="No admin team members found matching search query."
        initialPageSize={10}
      />

      {/* Add Admin Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Admin Team Member"
        maxWidth="max-w-md"
      >
        {formError && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Set temporary password..."
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Admin Role Tier</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="sub_admin">Sub Admin (Manager Access)</option>
              <option value="main_admin">Main Admin (Full Root System Access)</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
