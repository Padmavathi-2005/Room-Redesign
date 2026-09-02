'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Zap,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { paymentService } from '../../../services/payment.service';
import { CreditTokenIcon } from '@/components/ui';
import CheckoutModal, { CheckoutPlan } from '@/components/ui/CheckoutModal';

interface SubscriptionData {
  plan: string;
  credits: number;
  subscriptionStatus: string;
  subscriptionPeriodEnd: string | null;
  subscriptionPeriodStart?: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface DatabasePlan {
  name: string;
  code: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  description: string;
  features?: string[];
}

interface CreditUsageLog {
  id: string;
  date: string;
  toolName: string;
  imageUrl: string;
  creditsUsed: number;
  remainingCredits: number;
  status: string;
  resolution: string;
}

interface UserInvoice {
  id: string;
  date: string;
  item: string;
  amount: string;
  gateway: 'Stripe' | 'PayPal';
  status: 'SUCCEEDED' | 'PENDING' | 'REFUNDED';
  receiptUrl?: string;
  tax: string;
  subtotal: string;
}

const DEFAULT_PRICING_PLANS: DatabasePlan[] = [
  {
    name: 'Free Plan',
    code: 'free',
    priceMonthly: 0,
    priceAnnual: 0,
    credits: 0,
    description: 'Explore RoomAI tools. Upgrade to a paid plan to receive generation credits.',
    features: [
      '0 Initial Credits',
      '30-Day Billing Cycle',
      'Standard AI Render Quality',
      'Access to All Design Categories',
      'Automatic 30-Day Cycle Renewal',
    ],
  },
  {
    name: 'Starter Plan',
    code: 'starter',
    priceMonthly: 19,
    priceAnnual: 15,
    credits: 40,
    description: 'Ideal for homeowners & design enthusiasts starting single-room projects.',
    features: [
      '40 AI Generation Credits / month',
      '30-Day Billing Cycle',
      '8K UHD Architectural Quality',
      'All 12+ AI Design Tools',
      'Requires Completed Payment',
    ],
  },
  {
    name: 'Pro Plan',
    code: 'pro',
    priceMonthly: 39,
    priceAnnual: 31,
    credits: 100,
    description: 'For professional interior designers & architects needing priority generation.',
    features: [
      '100 AI Generation Credits / month',
      '30-Day Billing Cycle',
      'Priority Processing Queue',
      'Full 8K UHD Quality',
      'Multi-Room Project Consistency',
    ],
  },
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<DatabasePlan[]>(DEFAULT_PRICING_PLANS);
  const [usageLogs, setUsageLogs] = useState<CreditUsageLog[]>([]);
  const [invoices, setInvoices] = useState<UserInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<UserInvoice | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'invoices'>('overview');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

  // Fetch subscription & credit status
  const fetchSubscriptionStatus = async (userToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/subscription/status`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (data && data.success) {
        setSubscription(data.data);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.plan = data.data.plan;
            parsed.credits = data.data.credits;
            localStorage.setItem('user', JSON.stringify(parsed));
            setCurrentUser(parsed);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  // Fetch database plans
  const fetchDatabasePlans = async () => {
    try {
      const res = await fetch(`${API_BASE}/subscription/plans`);
      const result = await res.json();
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        setPlans(result.data);
      }
    } catch (err) {
      console.error('Failed to load database plans:', err);
    }
  };

  // Fetch credit usage report history
  const fetchUsageHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms`);
      if (res.ok) {
        const roomsData = await res.json();
        const list = Array.isArray(roomsData) ? roomsData : roomsData.data || [];

        let currentCredits = subscription?.credits || 83;
        const formattedLogs: CreditUsageLog[] = list.map((item: any, idx: number) => {
          const dt = item.createdAt ? new Date(item.createdAt) : new Date();
          const toolSlug = item.toolSlug || 'interior-design';
          const toolTitle =
            toolSlug === 'floor-plan-generator'
              ? 'Floor Plan Generator'
              : toolSlug === 'ai-room-decorator'
              ? 'AI Room Decorator'
              : toolSlug === 'ai-room-cleaner'
              ? 'AI Room Cleaner'
              : toolSlug === 'paint-color-visualizer'
              ? 'Paint Color Visualizer'
              : 'Interior Design AI';

          const imgUrl = item.generatedImage || item.originalImage || '/uploads/sample.jpg';
          return {
            id: item._id || item.id || `log-${idx}`,
            date: dt.toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
            toolName: toolTitle,
            imageUrl: imgUrl,
            creditsUsed: 4,
            remainingCredits: Math.max(0, currentCredits - idx * 4),
            status: item.status === 'failed' ? 'Failed' : 'Completed',
            resolution: '8K UHD (7680 × 4320)',
          };
        });

        setUsageLogs(formattedLogs);
      }
    } catch (err) {
      console.error('Failed to fetch credit usage logs:', err);
    }
  };

  // Fetch invoice purchase details history
  const fetchInvoices = async () => {
    try {
      const stored = localStorage.getItem('user_invoices');
      if (stored) {
        setInvoices(JSON.parse(stored));
      } else {
        setInvoices([]);
      }
    } catch (e) {
      setInvoices([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch (e) {}
        }
        if (storedToken) {
          setToken(storedToken);
          await Promise.all([
            fetchSubscriptionStatus(storedToken),
            fetchDatabasePlans(),
            fetchUsageHistory(),
            fetchInvoices(),
          ]);
        } else {
          fetchInvoices();
        }
        setLoading(false);
      }
    };
    initialize();
  }, [searchParams]);

  const handleOpenStripePortal = async () => {
    if (!token) return;
    try {
      setActionLoading('portal');
      const response = await paymentService.createPortalSession(token);
      if (response && response.success && response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert(response.message || 'Stripe Billing Portal is currently in sandbox mode.');
      }
    } catch (err) {
      alert('Stripe portal is unavailable in sandbox environment.');
    } finally {
      setActionLoading(null);
    }
  };

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<CheckoutPlan | null>(null);

  const handleSelectPlan = (planCode: string) => {
    const code = planCode.toLowerCase().trim();
    if (code === 'free') {
      setSuccessMessage('You are on the Free Plan. Select Starter or Pro Plan to purchase AI generation credits.');
      return;
    }
    router.push(`/checkout?plan=${code}`);
  };

  const handleCheckoutSuccess = async (creditsAdded: number, planName: string) => {
    setSuccessMessage(`Success! Subscription upgraded to ${planName} (+${creditsAdded} AI Credits added).`);
    if (token) {
      const code = planName.toLowerCase().includes('starter') ? 'starter' : planName.toLowerCase().includes('pro') ? 'pro' : 'free';
      try {
        await fetch(`${API_BASE}/subscription/upgrade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planCode: code }),
        });
      } catch (e) {}
      await fetchSubscriptionStatus(token);
    }
    fetchInvoices();
  };

  const getPlanLimit = (planCode: string) => {
    const matched = plans.find((p) => p.code.toLowerCase() === planCode.toLowerCase());
    return matched ? matched.credits : 650;
  };

  const getPlanPrice = (planCode: string) => {
    const matched = plans.find((p) => p.code.toLowerCase() === planCode.toLowerCase());
    return matched ? `$${matched.priceMonthly.toFixed(2)}` : '$39.00';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs font-bold uppercase tracking-wider font-heading">
          Loading Credits & Billing Data...
        </span>
      </div>
    );
  }

  const activePlanCode = subscription?.plan || currentUser?.plan || 'free';
  const planLimit = getPlanLimit(activePlanCode);
  const creditsRemaining = subscription?.credits ?? currentUser?.credits ?? 0;
  const creditsUsed = Math.max(0, planLimit - creditsRemaining);
  const progressPercent = Math.min(100, Math.round((creditsRemaining / planLimit) * 100));
  const activePlanPrice = getPlanPrice(activePlanCode);

  const startDateStr = subscription?.subscriptionPeriodStart
    ? new Date(subscription.subscriptionPeriodStart).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : 'Aug 01, 2026';
  const endDateStr = subscription?.subscriptionPeriodEnd
    ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : 'Sep 30, 2026';

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4 text-left font-sans animate-in fade-in duration-300">
      {/* SUCCESS ALERT */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold font-heading">Subscription Plan Updated</p>
              <p className="text-[11px] mt-0.5">{successMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800 mb-2">
            <Sparkles className="w-3 h-3 text-purple-600 fill-purple-600" />
            <span>AI Credits & Billing Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
            Credits, Payments & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your subscription, view separate tables for AI credit usage deductions and invoice purchase receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer font-heading"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Upgrade Plan</span>
          </button>
          <button
            onClick={handleOpenStripePortal}
            disabled={actionLoading === 'portal'}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading"
          >
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Stripe Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Overview & Pricing Plans</span>
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'usage'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Credits Usage Table ({usageLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Invoice Purchase Details Table ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PRICING */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* STATS OVERVIEW CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: CURRENT ACTIVE PLAN */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-heading">
                    Current Active Subscription
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Active & Paid</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 capitalize font-heading">
                      {activePlanCode} Studio Tier
                    </h2>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                      {planLimit} AI Credits / month allocated
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                      {activePlanPrice} <span className="text-xs text-slate-400 font-normal">/ month</span>
                    </div>
                  </div>
                </div>

                {/* DATES */}
                <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-600" />
                      <span>Plan Start Date</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                      {startDateStr}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      <span>Renewal / Expiry Date</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                      {endDateStr}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>8K UHD Resolution & Commercial License Included</span>
                </span>
              </div>
            </div>

            {/* CARD 2: AVAILABLE CREDITS GAUGE */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-heading">
                    Available Credits Balance
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Live Balance
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2">
                    <Zap className="w-7 h-7 text-amber-500 fill-amber-500 animate-bounce" />
                    <span>{creditsRemaining} Credits</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {creditsUsed} Used / {planLimit} Total Allocation
                  </p>
                </div>

                {/* PROGRESS GAUGE */}
                <div className="space-y-2 pt-2">
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>{progressPercent}% Available</span>
                    <span>{creditsUsed} Credits Spent</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-[11px] text-purple-900 dark:text-purple-300 font-medium">
                ⚡ Standard room redesign requires 4 credits per high-res render generation.
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION CREDIT TIERS SECTION */}
          <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                Flexible Credit Tiers
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                Upgrade Your AI Credit Tier
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Choose the ideal credit package for your architectural & interior redesign project load.
              </p>

              {/* MONTHLY / ANNUAL TOGGLE */}
              <div className="pt-2 flex items-center justify-center gap-3">
                <span className={`text-xs font-bold ${!isAnnual ? 'text-purple-600' : 'text-slate-400'}`}>
                  Monthly Billing
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 transition-colors relative cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-purple-600 transition-transform ${
                      isAnnual ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold flex items-center gap-1 ${isAnnual ? 'text-purple-600' : 'text-slate-400'}`}>
                  <span>Annual Billing</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            {/* PRICING CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent = activePlanCode.toLowerCase() === plan.code.toLowerCase();
                const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

                return (
                  <div
                    key={plan.code}
                    className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-900 border-purple-500 dark:border-purple-600 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/20'
                        : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                          {plan.name}
                        </h3>
                        {isCurrent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                            Current Plan
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="pt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-heading">
                          ${price}
                        </span>
                        <span className="text-xs font-bold text-slate-400"> / month</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-slate-900 dark:text-slate-100 text-xs font-extrabold font-heading flex items-center gap-2">
                        <CreditTokenIcon size="sm" />
                        <span>{plan.credits} AI Tokens / month</span>
                      </div>

                      {/* FEATURES LIST */}
                      <ul className="space-y-2.5 pt-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {(plan.features || DEFAULT_PRICING_PLANS.find((p) => p.code === plan.code)?.features || []).map(
                          (feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent || actionLoading === plan.code}
                      onClick={() => handleSelectPlan(plan.code)}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                      }`}
                    >
                      {isCurrent
                        ? 'Active Plan'
                        : actionLoading === plan.code
                        ? 'Processing...'
                        : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREDIT USAGE LEDGER TABLE */}
      {activeTab === 'usage' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                  Credit Deductions Table
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {usageLogs.length} Total Generations Logged
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mt-1">
                AI Credit Consumption Ledger
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsageHistory}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 font-heading"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Ledger</span>
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold tracking-wider text-slate-400 font-heading bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3.5 px-4 rounded-l-xl">Date & Time</th>
                  <th className="py-3.5 px-4">AI Tool / Feature</th>
                  <th className="py-3.5 px-4">Render Preview & Link</th>
                  <th className="py-3.5 px-4 text-center">Credits Spent</th>
                  <th className="py-3.5 px-4 text-center">Balance After</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Output Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {usageLogs.length > 0 ? (
                  usageLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 font-bold">
                        {log.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-heading text-slate-900 dark:text-slate-100">
                        {log.toolName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={log.imageUrl}
                            alt="Render thumbnail"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                          />
                          <a
                            href={log.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline text-[11px]"
                          >
                            <span>View Render</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-[11px]">
                          -4 Credits
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        ⚡ {log.remainingCredits}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase border border-emerald-200 dark:border-emerald-800">
                          {log.resolution}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No credit usage records logged yet. Your generated room redesigns will appear here automatically!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICE PURCHASE DETAILS TABLE */}
      {activeTab === 'invoices' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                  Payment History Table
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {invoices.length} Total Billing Receipts
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mt-1">
                Invoice Purchase Details & Receipts
              </h3>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold tracking-wider text-slate-400 font-heading bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3.5 px-4 rounded-l-xl">Invoice ID</th>
                  <th className="py-3.5 px-4">Billing Date</th>
                  <th className="py-3.5 px-4">Item / Subscription Plan</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-black text-slate-900 dark:text-slate-100">
                        {inv.id}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {inv.date}
                      </td>
                      <td className="py-4 px-4 font-extrabold font-heading text-slate-900 dark:text-slate-100">
                        {inv.item}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <CreditCard className="w-3 h-3" />
                          {inv.gateway}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-slate-100 text-sm font-heading">
                        {inv.amount}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Paid
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-extrabold transition-all cursor-pointer font-heading border border-purple-200 dark:border-purple-800"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No invoices recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 font-heading">Invoice Receipt</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedInvoice.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Date Issued</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Item Description</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-heading">{selectedInvoice.item}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payment Gateway</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{selectedInvoice.gateway}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{selectedInvoice.subtotal}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tax / VAT</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{selectedInvoice.tax}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 rounded-xl">
                <span className="font-bold text-slate-900 dark:text-slate-100 font-heading">Total Amount Paid</span>
                <span className="font-black text-slate-900 dark:text-slate-100 text-sm font-heading">{selectedInvoice.amount}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => alert(`Downloading Invoice ${selectedInvoice.id} receipt PDF...`)}
                className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-heading shadow-md transition-all cursor-pointer"
              >
                Download PDF Receipt
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={selectedPlanForCheckout}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}

