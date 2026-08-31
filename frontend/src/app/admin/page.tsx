'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('admin_token');
      const adminUser = localStorage.getItem('admin_user');
      if (adminToken && adminUser) {
        try {
          const parsed = JSON.parse(adminUser);
          if (parsed && ['admin', 'ADMIN', 'main_admin', 'sub_admin'].includes(parsed.role)) {
            router.push('/admin/dashboard');
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data || !data.success) {
        throw new Error(data.message || 'Invalid administrator credentials.');
      }

      const { user, tokens } = data.data;

      if (!user || !['admin', 'ADMIN', 'main_admin', 'sub_admin'].includes(user.role)) {
        throw new Error('Access Denied: Standard user accounts cannot log in to the administrator portal.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', tokens.accessToken);
        localStorage.setItem('admin_user', JSON.stringify(user));
        document.cookie = `admin_token=${tokens.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Internal connection error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Blueprint Grid Pattern */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0 opacity-40" />

      {/* Glow Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Admin Login Glass Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xl shadow-slate-900/5 backdrop-blur-2xl relative overflow-hidden text-left">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-inner">
              <div className="w-5 h-5 rounded-2xl bg-indigo-600 flex items-center justify-center shadow">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-black text-indigo-600 tracking-wider uppercase">
                Admin Portal
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900">Administrator Login</h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Authenticate to manage RoomAI plans and settings.
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5"
              >
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="adminEmail" className="text-slate-650">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="adminEmail"
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 font-medium placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="adminPassword" className="text-slate-650">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 font-medium placeholder-slate-400 transition-all [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 mt-6 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
