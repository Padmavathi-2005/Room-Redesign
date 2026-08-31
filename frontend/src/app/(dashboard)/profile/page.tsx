'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Zap,
  Save,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState(100);
  const [plan, setPlan] = useState('Starter Free');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setName(parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User');
          setEmail(parsed.email || 'user@example.com');
          setCredits(parsed.credits ?? 100);
          setPlan(parsed.subscriptionTier || 'Starter Free');
        } catch {
          // fallback
        }
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.name = name;
          parsed.email = email;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch {
          // fallback
        }
      }
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Profile Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile details, account preferences, and subscription tier.
          </p>
        </div>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Upgrade Tier</span>
        </Link>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-purple-100">
              Current Plan: {plan}
            </span>
            <h2 className="text-xl font-extrabold font-heading">{name}</h2>
            <p className="text-xs text-purple-100/80">{email}</p>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 font-extrabold text-sm">
              <Zap className="w-4 h-4 fill-amber-300" />
              <span>{credits.toLocaleString()} AI Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading border-b border-slate-100 dark:border-slate-800 pb-3">
          Personal Details
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Credit & Payment Transaction History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Billing & Transaction History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View your past credit top-ups, plan subscriptions, and download invoice receipts.
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-3.5 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-extrabold text-xs hover:bg-purple-100 transition-all"
          >
            + Buy Credits
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Description / Tier</th>
                <th className="py-3 px-3">Credits Added</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              <tr>
                <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">Aug 27, 2026</td>
                <td className="py-3.5 px-3">Pro Studio Monthly Subscription</td>
                <td className="py-3.5 px-3 font-bold text-purple-600 dark:text-purple-400">+650 Credits</td>
                <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">$39.00</td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold">Paid</span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button type="button" onClick={() => alert('Downloading PDF receipt invoice...')} className="text-purple-600 hover:underline font-bold text-xs cursor-pointer">Download</button>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">Aug 15, 2026</td>
                <td className="py-3.5 px-3">Starter Bonus Sign-up Pack</td>
                <td className="py-3.5 px-3 font-bold text-purple-600 dark:text-purple-400">+100 Credits</td>
                <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">$0.00</td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold">Completed</span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <span className="text-slate-400 text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
