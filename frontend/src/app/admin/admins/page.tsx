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
} from 'lucide-react';

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 p-6 rounded-2xl border border-slate-200/80 shadow-xs backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Team & Roles</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrator accounts stored in the Admin table, assign roles, and control access permissions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin Member</span>
        </button>
      </div>

      {/* Admin Team Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Admin Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Role Tier</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Active</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                        {admin.firstName[0]}{admin.lastName[0]}
                      </div>
                      <span>{admin.firstName} {admin.lastName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{admin.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-extrabold ${
                      admin.role === 'main_admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {admin.role === 'main_admin' ? 'Main Admin' : 'Sub Admin'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleStatus(admin)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                        admin.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {admin.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                      {admin.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {admin.email !== 'admin@gmail.com' && (
                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="p-1.5 rounded-2xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Add Admin Team Member</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-2xl text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
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
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
