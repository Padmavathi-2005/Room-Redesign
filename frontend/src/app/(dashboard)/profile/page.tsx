'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Zap,
  Save,
  CheckCircle2,
  Sparkles,
  CreditCard,
  History,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Download,
} from 'lucide-react';
import CreditTokenIcon from '@/components/ui/CreditTokenIcon';

interface LedgerItem {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface InvoiceItem {
  _id: string;
  stripeInvoiceId: string;
  planCode: string;
  billingCycle: string;
  amountPaid: number;
  status: string;
  paidAt: string;
}

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState('Free Plan');
  const [statusText, setStatusText] = useState('active');
  const [isSaved, setIsSaved] = useState(false);

  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    // Load local stored user info
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setName(parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User');
          setEmail(parsed.email || 'user@example.com');
          setCredits(parsed.credits ?? 0);
          setPlan(parsed.subscriptionTier || 'Free Plan');
        } catch {
          // fallback
        }
      }
    }

    // Fetch live server-authoritative status & transaction ledger
    async function fetchServerStatus() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      if (!token) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        // Status request
        const statusRes = await fetch(`${API_URL}/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statusJson = await statusRes.json();
        if (statusJson.success && statusJson.data) {
          setCredits(statusJson.data.credits ?? 0);
          setPlan(statusJson.data.subscriptionTier || (statusJson.data.plan === 'pro' ? 'Pro Plan' : statusJson.data.plan === 'starter' ? 'Starter Plan' : 'Free Plan'));
          setStatusText(statusJson.data.subscriptionStatus || 'active');
        }

        // Ledger request
        const ledgerRes = await fetch(`${API_URL}/subscription/ledger`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ledgerJson = await ledgerRes.json();
        if (ledgerJson.success && Array.isArray(ledgerJson.data)) {
          setLedger(ledgerJson.data);
        }

        // Invoices request
        const invRes = await fetch(`${API_URL}/subscription/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const invJson = await invRes.json();
        if (invJson.success && Array.isArray(invJson.data)) {
          setInvoices(invJson.data);
        }
      } catch {
        // quiet fallback
      } finally {
        setIsLoadingHistory(false);
      }
    }

    fetchServerStatus();
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
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 w-full pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 font-sans">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <User className="w-5 h-5" />
            </div>
            <span>Profile Settings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your personal profile details, account preferences, and subscription plan status.
          </p>
        </div>

        <Link
          href="/billing"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary hover:opacity-90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Manage Subscription & Credits</span>
        </Link>
      </div>

      {/* Subscription Status Hero Card */}
      <div className="bg-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Profile Avatar & Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 backdrop-blur-md flex items-center justify-center font-black text-xl text-white shadow-md shrink-0">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/25">
                  {plan}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-200 border border-emerald-400/40 text-[10px] font-extrabold uppercase tracking-wider">
                  {statusText}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight font-sans text-white">{name}</h2>
              <p className="text-xs text-white/80 font-medium">{email}</p>
            </div>
          </div>

          {/* Credits Pill */}
          <div className="text-left md:text-right shrink-0">
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-amber-300 font-extrabold text-sm shadow-md">
              <CreditTokenIcon size="sm" />
              <span>{credits.toLocaleString()} AI Credits Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="w-4 h-4 text-primary" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-sans">
            Personal Details
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary hover:opacity-90 text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-sans"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Billing & Invoices Link Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>Looking for Credit Batches, Ledger & Downloadable Invoices?</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Your server-authoritative credit lots, audit ledger, and Stripe PDF receipts are managed in the Credits & Billing Center.
          </p>
        </div>
        <Link
          href="/billing"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-md hover:opacity-90 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Open Credits & Plans Center</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

