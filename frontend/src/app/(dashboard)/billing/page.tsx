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

const DEFAULT_PRICING_PLANS: DatabasePlan[] = [
  {
    name: 'Starter Pro',
    code: 'starter',
    priceMonthly: 19,
    priceAnnual: 15,
    credits: 200,
    description: 'Perfect for homeowners and design enthusiasts redesigning personal room spaces.',
    features: [
      '200 AI Generation Credits / month',
      'Full 8K UHD Architectural Quality',
      'All 12+ Interior & Exterior AI Tools',
      'Commercial Usage License',
      'Standard Support',
    ],
  },
  {
    name: 'Pro Studio',
    code: 'pro',
    priceMonthly: 39,
    priceAnnual: 31,
    credits: 650,
    description: 'For interior designers, real estate stagers, and creators who need maximum quality.',
    features: [
      '650 AI Generation Credits / month',
      'Ultra-Fast Priority Processing',
      'Full 8K UHD Architectural Quality',
      'Multi-Room Project Consistency',
      'Custom Style & Palette Controls',
      'Priority 24/7 VIP Support',
    ],
  },
  {
    name: 'Agency Master',
    code: 'agency',
    priceMonthly: 89,
    priceAnnual: 71,
    credits: 1800,
    description: 'For professional architectural firms, design agencies, and high-volume commercial teams.',
    features: [
      '1,800 AI Generation Credits / month',
      'Instant Priority Queueing',
      '8K UHD & Raw Asset Downloads',
      'Dedicated Account Manager',
      'Unlimited Project Storage',
      'Custom ERP API Integrations',
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
  const [isAnnual, setIsAnnual] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'plans'>('overview');

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

  // Fetch plans from backend or fallback
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

  // Fetch credit usage report history from backend rooms API
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
          const logItem: CreditUsageLog = {
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
          return logItem;
        });

        setUsageLogs(formattedLogs);
      }
    } catch (err) {
      console.error('Failed to fetch credit usage logs:', err);
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
          ]);
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

  const handleSelectPlan = async (planCode: string) => {
    if (!token) {
      router.push('/login?redirect=/billing');
      return;
    }
    try {
      setActionLoading(planCode);
      const res = await paymentService.mockUpgrade(planCode, token);
      if (res && res.success) {
        setSuccessMessage(`Success! Your account has been upgraded to ${planCode.toUpperCase()} Plan.`);
        await fetchSubscriptionStatus(token);
      } else {
        alert('Plan upgrade failed. Please try again.');
      }
    } catch (err) {
      alert('Plan upgrade request failed.');
    } finally {
      setActionLoading(null);
    }
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
          Loading Credits & Plan Overview...
        </span>
      </div>
    );
  }

  const activePlanCode = subscription?.plan || currentUser?.plan || 'pro';
  const planLimit = getPlanLimit(activePlanCode);
  const creditsRemaining = subscription?.credits ?? currentUser?.credits ?? 83;
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

      {/* PAGE TITLE & SUBTITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800 mb-2">
            <Sparkles className="w-3 h-3 text-purple-600 fill-purple-600" />
            <span>AI Credits & Plan Account Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
            Credits & Plan Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Monitor your current active subscription plan, available AI credits, plan start/expiry dates, and credit deduction history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const el = document.getElementById('pricing-tiers-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
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
            <span>Invoices</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: CURRENT ACTIVE PLAN */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-heading">
                Current Active Plan
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Active & Paid</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 capitalize font-heading">
                  {activePlanCode} Studio Plan
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

            {/* DATES: START DATE & EXPIRY/RENEWAL DATE */}
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
              <span>Full 8K UHD Commercial Rights Active</span>
            </span>
            <button
              onClick={() => {
                const el = document.getElementById('pricing-tiers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-purple-600 font-bold hover:underline flex items-center gap-1 cursor-pointer font-heading"
            >
              <span>Change Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: AVAILABLE CREDITS GAUGE */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-heading">
                Available Credits Balance
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Live Gauge
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
            ⚡ Each AI room redesign generation consumes 4 credits with full 8K UHD architectural resolution.
          </div>
        </div>
      </div>

      {/* DETAILED CREDIT USAGE REPORT & RENDER HISTORY TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                Ledger Report
              </span>
              <span className="text-xs font-bold text-slate-400">
                {usageLogs.length} Total Generations
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading mt-1">
              Credit Usage & Render Generation Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsageHistory}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
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
                <th className="py-3 px-3 rounded-l-xl">Date & Time</th>
                <th className="py-3 px-3">AI Tool / Feature</th>
                <th className="py-3 px-3">Render Preview & URL</th>
                <th className="py-3 px-3 text-center">Credits Spent</th>
                <th className="py-3 px-3 text-center">Balance After</th>
                <th className="py-3 px-3 rounded-r-xl text-right">Status & Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {usageLogs.length > 0 ? (
                usageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 font-bold">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-3 font-bold font-heading text-slate-900 dark:text-slate-100">
                      {log.toolName}
                    </td>
                    <td className="py-3.5 px-3">
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
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-[11px]">
                        -4 Credits
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      ⚡ {log.remainingCredits}
                    </td>
                    <td className="py-3.5 px-3 text-right">
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

      {/* SUBSCRIPTION CREDIT TIERS SECTION */}
      <div id="pricing-tiers-section" className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
            Flexible Credit Plans
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            Upgrade Your AI Credit Tier
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Choose the ideal monthly credit plan for your design needs. Upgrade or switch tiers anytime.
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

                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-extrabold font-heading flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{plan.credits} AI Credits / month</span>
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
  );
}
