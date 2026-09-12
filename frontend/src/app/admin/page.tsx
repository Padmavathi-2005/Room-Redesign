'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

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
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
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
      setErrorMsg(err.message || 'An internal connection error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Ambient Radial Background Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 dark:bg-indigo-600/8 blur-[140px] pointer-events-none" />

      {/* Subtle Geometric Dot Grid Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px] opacity-10 dark:opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[430px] relative z-10"
      >
        {/* Admin Login Glass Card */}
        <div className="admin-login-card relative rounded-3xl p-8 sm:p-10 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/90 shadow-2xl shadow-indigo-950/10 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-left overflow-hidden">
          {/* Top Luminous Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Logo Icon */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 mb-4.5">
              <Shield className="w-6 h-6 text-white" />
            </div>

            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 tracking-wider uppercase mb-3 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Admin Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              Authenticate to access the RoomAI control console
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5 shadow-xs"
              >
                <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5 text-xs font-bold">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="adminEmail"
                className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="adminEmail"
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-login-input w-full pl-10 pr-4 py-3.5 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="adminPassword"
                className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-login-input w-full pl-10 pr-12 py-3.5 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 mt-6 rounded-xl text-sm font-black text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note & Back Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-3.5 text-center">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>Protected by RoomAI Enterprise Guard • 256-Bit SSL</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to RoomAI Homepage</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
