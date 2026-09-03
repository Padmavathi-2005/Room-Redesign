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
  Layers,
  Check,
  AlertCircle,
  FileText,
  Copy,
  Download,
  ClipboardCheck,
  Printer,
  X,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { CreditTokenIcon } from '@/components/ui';
import Modal from '@/components/ui/Modal';

interface CreditLot {
  lotId: string;
  source: string;
  initialCredits: number;
  remainingCredits: number;
  startDate: string;
  expiryDate: string;
}

interface SubscriptionData {
  plan: string;
  credits: number;
  subscriptionStatus: string;
  subscriptionPeriodEnd: string | null;
  subscriptionPeriodStart?: string | null;
  daysRemaining?: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  creditLots?: CreditLot[];
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

interface CreditLedgerEntry {
  _id: string;
  amount: number;
  balanceAfter: number;
  type: 'GRANT' | 'DEDUCTION' | 'REFUND' | 'EXPIRY' | 'ADJUSTMENT';
  description: string;
  createdAt: string;
}

interface DatabaseInvoice {
  _id: string;
  stripeInvoiceId: string;
  amountPaid: number;
  currency: string;
  status: string;
  planCode: string;
  billingCycle: string;
  paymentMethod: string;
  invoicePdfUrl: string;
  paidAt: string;
}

const DEFAULT_PRICING_PLANS: DatabasePlan[] = [
  {
    name: 'Free Plan',
    code: 'free',
    priceMonthly: 0,
    priceAnnual: 0,
    credits: 0,
    description: 'Explore RoomAI design tools. Upgrade to receive generation credits.',
    features: ['0 Monthly Credits', 'Standard Render Engines', 'Access to Basic Design Categories', 'Upgrade Anytime'],
  },
  {
    name: 'Starter Plan',
    code: 'starter',
    priceMonthly: 19,
    priceAnnual: 15,
    credits: 40,
    description: 'Ideal for homeowners & design enthusiasts starting single-room projects.',
    features: ['40 Generation Credits / month', '30-Day Billing Cycle', '8K UHD Architectural Quality', 'All AI Design Tools'],
  },
  {
    name: 'Pro Plan',
    code: 'pro',
    priceMonthly: 39,
    priceAnnual: 31,
    credits: 100,
    description: 'For professional interior designers & architects needing priority generation.',
    features: ['100 Generation Credits / month', '30-Day Billing Cycle', 'Priority Queue', 'Full 8K UHD Quality', 'Priority Support'],
  },
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<DatabasePlan[]>(DEFAULT_PRICING_PLANS);
  const [creditLedger, setCreditLedger] = useState<CreditLedgerEntry[]>([]);
  const [invoices, setInvoices] = useState<DatabaseInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<DatabaseInvoice | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [upgradePlanModal, setUpgradePlanModal] = useState<DatabasePlan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lots' | 'ledger' | 'invoices'>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Fetch subscription & credit status from server
  const fetchSubscriptionStatus = async (userToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/subscription/status`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (data && data.success) {
        setSubscription(data.data);
      }
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  // Fetch plans from database
  const fetchDatabasePlans = async () => {
    try {
      const res = await fetch(`${API_BASE}/subscription/plans`);
      const result = await res.json();
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        setPlans(result.data);
      }
    } catch (e) {}
  };

  // Fetch server credit ledger history
  const fetchCreditLedger = async (userToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/subscription/credit-ledger`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (data && data.success) {
        setCreditLedger(data.data || []);
      }
    } catch (e) {}
  };

  // Fetch database billing invoices
  const fetchInvoices = async (userToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/subscription/invoices`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (data && data.success) {
        setInvoices(data.data || []);
      }
    } catch (e) {}
  };

  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const verifyCheckoutSession = async (sessionId: string | null, userToken: string) => {
    if (!sessionId || !sessionId.trim()) {
      const msg = 'Stripe Session ID missing from redirect URL (session_id). Payment verification requires a valid Stripe Checkout Session.';
      setVerifyError(msg);
      toast.error(msg, 'Payment Verification Failed');
      return;
    }

    setIsVerifyingSession(true);
    setVerifyError(null);
    setSuccessMessage(null);

    try {
      const syncRes = await fetch(`${API_BASE}/subscription/confirm-checkout-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ sessionId: sessionId.trim() }),
      });
      const syncData = await syncRes.json();

      if (syncRes.ok && syncData.success && syncData.data) {
        const u = syncData.data.user;
        const storedUserStr = localStorage.getItem('user');
        if (storedUserStr) {
          try {
            const parsed = JSON.parse(storedUserStr);
            const updatedUser = {
              ...parsed,
              plan: u.plan ? u.plan.toUpperCase() : parsed.plan,
              credits: u.credits ?? parsed.credits,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('user-credits-updated'));
          } catch (e) {}
        }

        if (syncData.data.subscription) {
          setSubscription(syncData.data.subscription);
        }

        const tierName = u?.plan?.toUpperCase() === 'PRO' ? 'Pro' : 'Starter';
        const msg = `Payment verified. Your ${tierName} subscription and generation credits are active.`;
        setSuccessMessage(msg);
        toast.success(msg, 'Payment Verified', 6000);

        await Promise.all([
          fetchSubscriptionStatus(userToken),
          fetchCreditLedger(userToken),
          fetchInvoices(userToken),
        ]);

        // Clean query parameters from URL so refreshes do not re-verify
        if (typeof window !== 'undefined' && window.history.replaceState) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      } else {
        const msg = syncData.message || 'Stripe payment verification failed. Please try again or contact support.';
        setVerifyError(msg);
        toast.error(msg, 'Verification Failed');
      }
    } catch (err: any) {
      const msg = `Connection error while verifying Stripe payment: ${err.message || 'Network failure'}`;
      setVerifyError(msg);
      toast.error(msg, 'Network Error');
    } finally {
      setIsVerifyingSession(false);
    }
  };

  const [creditPacks, setCreditPacks] = useState<any[]>([]);
  const [isPackEligible, setIsPackEligible] = useState<boolean>(false);

  const fetchEligibleCreditPacks = async (userToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/subscription/credit-packs`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        setIsPackEligible(data.data.isEligible);
        setCreditPacks(data.data.packs || []);
      }
    } catch (e) {}
  };

  const handleBuyCreditPack = async (packCode: string) => {
    if (!token) return;
    setActionLoading(`pack_${packCode}`);

    try {
      const res = await fetch(`${API_BASE}/subscription/credit-packs/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packCode,
          successUrl: `${window.location.origin}/billing?checkout=success&purchase_type=credit_pack&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/billing?checkout=cancel`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast.error(data.message || 'Failed to initialize credit pack checkout.', 'Checkout Error');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error during checkout.', 'Checkout Error');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUserStr = localStorage.getItem('user');

        if (storedUserStr) {
          try {
            setCurrentUser(JSON.parse(storedUserStr));
          } catch (e) {}
        }

        if (storedToken) {
          setToken(storedToken);

          const isCheckoutSuccess = searchParams.get('checkout') === 'success';
          const sessionId = searchParams.get('session_id');

          if (isCheckoutSuccess) {
            await verifyCheckoutSession(sessionId, storedToken);
          }

          await Promise.all([
            fetchSubscriptionStatus(storedToken),
            fetchDatabasePlans(),
            fetchCreditLedger(storedToken),
            fetchInvoices(storedToken),
            fetchEligibleCreditPacks(storedToken),
          ]);
        }
        setLoading(false);
      }
    };
    initialize();
  }, [searchParams]);

  const handleOpenStripePortal = async () => {
    if (!token) return;
    setActionLoading('portal');
    try {
      const res = await fetch(`${API_BASE}/payments/portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && data.success && data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (e) {} finally {
      setActionLoading(null);
    }
  };

  const handleSelectPlan = (code: string) => {
    const targetPlan = plans.find((p) => p.code.toLowerCase() === code.toLowerCase());
    if (targetPlan) {
      setUpgradePlanModal(targetPlan);
    } else {
      router.push(`/checkout?plan=${code.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs font-bold uppercase tracking-wider font-heading">
          Loading Server Billing Data...
        </span>
      </div>
    );
  }

  const rawPlan = (subscription?.plan || currentUser?.plan || 'free').toString();
  const activePlanCode = rawPlan.toLowerCase().includes('pro')
    ? 'pro'
    : rawPlan.toLowerCase().includes('starter')
    ? 'starter'
    : 'free';

  const creditsRemaining = subscription?.credits ?? currentUser?.credits ?? 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4 text-left font-sans animate-in fade-in duration-300">
      {/* VERIFYING SESSION — slim top banner only, toast handles full message */}
      {isVerifyingSession && (
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          <span>Verifying your Stripe payment — please wait…</span>
        </div>
      )}

      {/* VERIFICATION ERROR ALERT WITH RETRY */}
      {verifyError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="font-bold">Payment Verification Failed</p>
              <p className="text-[11px] mt-0.5 font-normal">{verifyError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {searchParams.get('session_id') && (
              <button
                type="button"
                onClick={() => verifyCheckoutSession(searchParams.get('session_id'), token || '')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Retry
              </button>
            )}
            <button
              type="button"
              onClick={() => setVerifyError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}


      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20 mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            AI Credits & Billing Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading tracking-tight">
            Credits, Payments & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Server-authoritative subscription status, audit credit ledger, and verified Stripe invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/checkout?plan=starter')}
            className="px-4 py-2.5 rounded-2xl bg-primary hover:opacity-90 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer font-heading"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Upgrade Plan</span>
          </button>
          {subscription?.stripeCustomerId && (
            <button
              onClick={handleOpenStripePortal}
              disabled={actionLoading === 'portal'}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading"
            >
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Stripe Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Overview & Pricing Plans</span>
        </button>

        {subscription?.creditLots && subscription.creditLots.length > 0 && (
          <button
            onClick={() => setActiveTab('lots')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'lots'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CreditTokenIcon size="xs" />
            <span>Credit Batches ({subscription.creditLots.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-primary text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Credit Audit Ledger ({creditLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-primary text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Database Invoices ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PRICING */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: ACTIVE PLAN */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Current Plan
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20">
                  {activePlanCode.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-heading capitalize">
                  {activePlanCode} Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Status: <span className="font-bold text-emerald-600 capitalize">{subscription?.subscriptionStatus || 'Active'}</span>
                </p>
              </div>
            </div>

            {/* CARD 2: AVAILABLE CREDITS */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Credit Balance
                </span>
                <CreditTokenIcon size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                  <CreditTokenIcon size="sm" />
                  <span>{creditsRemaining}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Verified server-side balance
                </p>
              </div>
            </div>

            {/* CARD 3: BILLING CYCLE */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Next Renewal
                </span>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                  {subscription?.subscriptionPeriodEnd
                    ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })
                    : 'N/A'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {subscription?.daysRemaining ?? 0} days remaining
                </p>
              </div>
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
                      ? 'bg-white dark:bg-slate-900 border-primary shadow-xl ring-2 ring-primary/30'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider">
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
                      <span className="text-xs font-semibold text-slate-400"> / month</span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      {(plan.features || []).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan.code)}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                        : 'bg-primary hover:opacity-90 text-white shadow-md shadow-primary/20'
                    }`}
                  >
                    {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* SECTION: CREDIT BOOSTER PACKS FOR SUBSCRIBERS */}
          <div id="credit-boosters" className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 font-heading">
                    Need More Credits? Project Credit Boosters
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Credit packs are one-time project boosters for active subscribers. Your subscription remains the best value.
                </p>
              </div>

              {!isPackEligible && (
                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold shrink-0">
                  🔒 Requires Active Subscription
                </span>
              )}
            </div>

            {!isPackEligible ? (
              <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-amber-950 dark:text-amber-200 font-heading">
                    Credit Booster Packs Locked
                  </h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300 font-medium">
                    One-time credit booster packs are exclusively available to active Starter and Pro subscribers. Upgrade to a paid plan above to unlock booster packs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan('starter')}
                  className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  Upgrade to Starter Plan
                </button>
              </div>
            ) : creditPacks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                No active credit booster packs available for your subscription tier.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creditPacks.map((pack) => {
                  const estRenders = Math.floor(pack.credits / 1); // 1 credit per standard render
                  const isPurchasing = actionLoading === `pack_${pack.code}`;
                  const formattedBadge = (pack.badge || 'BOOSTER').toUpperCase();

                  return (
                    <div
                      key={pack.code}
                      className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
                        pack.isPopular
                          ? 'bg-gradient-to-b from-amber-50/90 to-white dark:from-amber-950/30 dark:to-slate-900 border-amber-400 dark:border-amber-600/80 shadow-lg ring-1 ring-amber-400/30'
                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold uppercase tracking-wider">
                            {formattedBadge}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 font-sans">
                            Validity: {pack.validityDays} {pack.validityDays === 1 ? 'Day' : 'Days'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-sans">
                            {pack.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                            {pack.description}
                          </p>
                        </div>

                        <div className="pt-2 flex items-baseline justify-between">
                          <div>
                            <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-sans">
                              ${pack.price}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold"> USD</span>
                          </div>
                            <div className="text-right">
                              <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-sans flex items-center justify-end gap-1.5">
                                <CreditTokenIcon size="sm" />
                                <span>{pack.credits}</span>
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                                {estRenders} Standard Renders
                              </p>
                            </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => handleBuyCreditPack(pack.code)}
                        className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isPurchasing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Redirecting to Stripe...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Buy {pack.credits} Credits Booster</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CREDIT LOTS */}
      {activeTab === 'lots' && subscription?.creditLots && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-200">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
            Persisted Credit Lots & Expiry Periods
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/50">
                  <th className="py-3 px-4">Source / Lot ID</th>
                  <th className="py-3 px-4 text-center">Initial Granted</th>
                  <th className="py-3 px-4 text-center">Remaining Balance</th>
                  <th className="py-3 px-4 text-right">Validity Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                {subscription.creditLots
                  .filter((lot) => !['PLAN $19', 'BONUS', 'REFUND'].includes(lot.source))
                  .map((lot, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                        {lot.source === lot.source.toUpperCase()
                          ? lot.source
                              .toLowerCase()
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                              .replace('(monthly)', '(Monthly)')
                              .replace('(annual)', '(Annual)')
                          : lot.source}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">{lot.initialCredits}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-amber-600">{lot.remainingCredits} left</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">{lot.startDate} → {lot.expiryDate}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CREDIT AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
              Server-Side Credit Audit Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Immutable audit trail of credit grants, deductions, and refunds.</p>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/50">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {creditLedger.length > 0 ? (
                  creditLedger.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                          log.type === 'GRANT' || log.type === 'REFUND'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{log.description}</td>
                      <td className={`py-3.5 px-4 text-center font-mono font-bold ${log.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.amount > 0 ? `+${log.amount}` : log.amount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {log.balanceAfter}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No audit ledger transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DATABASE INVOICES */}
      {activeTab === 'invoices' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
              Database Verified Billing Invoices
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Invoices populated directly from verified Stripe webhook events.</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/50">
                  <th className="py-3.5 px-4">Invoice ID</th>
                  <th className="py-3.5 px-4">Paid Date</th>
                  <th className="py-3.5 px-4">Plan / Interval</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Receipt / Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                      {/* Invoice ID — truncated with copy on hover */}
                      <td className="py-4 px-4 max-w-[180px]">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]"
                            title={inv.stripeInvoiceId}
                          >
                            {inv.stripeInvoiceId.slice(0, 18)}…
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(inv.stripeInvoiceId)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary cursor-pointer"
                            title="Copy full Invoice ID"
                          >
                            {copiedId === inv.stripeInvoiceId ? (
                              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {new Date(inv.paidAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-extrabold capitalize text-slate-900 dark:text-slate-100">
                        {inv.planCode} ({inv.billingCycle})
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-slate-100">
                        ${inv.amountPaid.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {inv.status}
                        </span>
                      </td>
                      {/* Receipt / Invoice Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all cursor-pointer"
                            title="View RoomAI Official Branded Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Invoice</span>
                          </button>

                          {inv.invoicePdfUrl && (
                            <a
                              href={inv.invoicePdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all"
                              title="Download Stripe PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={handleOpenStripePortal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                            title="Open Stripe Billing Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Stripe Portal</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No verified Stripe database invoices recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROOMAI OFFICIAL BRANDED INVOICE MODAL */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="3xl"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-6 font-sans text-left">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-6 pr-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-base shadow-md">
                    R
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">RoomAI Inc.</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  AI Interior Architectural & Room Redesign Platform
                </p>
                <p className="text-[11px] text-slate-400 font-mono">support@roomai.com • https://roomai.com</p>
              </div>

              <div className="text-right space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-xs uppercase tracking-wider border border-emerald-300/40 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  PAID INVOICE
                </span>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                  Date: {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Customer & Invoice Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Billed To Customer
                </span>
                <p className="font-black text-slate-900 dark:text-white text-sm">
                  {currentUser?.name || currentUser?.email || 'Valued Customer'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">{currentUser?.email || 'user@example.com'}</p>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Invoice Reference ID
                </span>
                <p className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200 break-all">
                  {selectedInvoice.stripeInvoiceId}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Payment Method: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedInvoice.paymentMethod || 'Stripe Checkout'}</span>
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-4">Billing Cycle</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white capitalize">
                      {selectedInvoice.planCode.replace('-', ' ')} Plan / Credit Pack
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 dark:text-slate-400">
                      {selectedInvoice.billingCycle}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      1
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                      ${selectedInvoice.amountPaid.toFixed(2)} USD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Amount Box */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-64 space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Paid:</span>
                  <span className="text-primary font-mono">${selectedInvoice.amountPaid.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer font-sans"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {selectedInvoice.invoicePdfUrl && (
                  <a
                    href={selectedInvoice.invoicePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Stripe PDF</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer font-sans"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* PLAN UPGRADE CONFIRMATION POPUP MODAL */}
      <Modal
        isOpen={!!upgradePlanModal}
        onClose={() => setUpgradePlanModal(null)}
        title="Confirm Subscription Upgrade"
        subtitle="Review your new billing cycle, credit allocation & plan features."
        icon={<Sparkles className="w-5 h-5" />}
        maxWidth="2xl"
        showCloseButton={true}
      >
        {upgradePlanModal && (
          <div className="space-y-6 text-left font-sans">
            {/* Current vs Upgraded Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* CURRENT PLAN BOX */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Current Plan
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-extrabold uppercase">
                    ACTIVE
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 capitalize">
                  {activePlanCode} Plan
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-medium pt-1">
                  <p className="flex items-center justify-between">
                    <span>Period End:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {subscription?.subscriptionPeriodEnd
                        ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'short' })
                        : 'Active'}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Unused Credits:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                      <CreditTokenIcon size="xs" />
                      {creditsRemaining}
                    </span>
                  </p>
                </div>
              </div>

              {/* NEW UPGRADED PLAN BOX */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-white dark:from-primary/20 dark:via-primary/10 dark:to-slate-900 border border-primary/30 dark:border-primary/40 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    Upgrading To
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-extrabold uppercase">
                    SELECTED
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {upgradePlanModal.name}
                </h4>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-medium pt-1">
                  <p className="flex items-center justify-between">
                    <span>Billing Starts:</span>
                    <span className="font-bold text-primary font-mono">
                      Today ({new Date().toLocaleDateString(undefined, { dateStyle: 'short' })})
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Tier Credits:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                      +<CreditTokenIcon size="xs" />
                      {upgradePlanModal.credits} / mo
                    </span>
                  </p>
                  <p className="flex items-center justify-between pt-1 border-t border-primary/20">
                    <span>Est. Combined Balance:</span>
                    <span className="font-black text-slate-900 dark:text-white font-mono flex items-center gap-1">
                      <CreditTokenIcon size="xs" />
                      {creditsRemaining + upgradePlanModal.credits}
                    </span>
                  </p>
                </div>
              </div>

            </div>

            {/* UPGRADE BENEFITS EXPLANATION */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
              <h5 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>What happens upon upgrade payment?</span>
              </h5>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-medium pl-5 list-disc text-[11px] leading-relaxed">
                <li>Your new 30-day billing cycle begins immediately upon verified payment completion.</li>
                <li><strong>+{upgradePlanModal.credits} Credits</strong> will be added to your account balance instantly.</li>
                <li>Your current unused <strong>{creditsRemaining} credits</strong> are preserved and rolled over!</li>
                <li>Unlocks 8K UHD architectural quality, priority queue & full AI tool access.</li>
              </ul>
            </div>

            {/* NEED CREDITS RIGHT NOW ALTERNATIVE CALLOUT */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 text-left">
                <p className="font-extrabold text-amber-950 dark:text-amber-200 font-sans">
                  Just need extra credits for today's project?
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300 font-medium">
                  You can buy a 1-Day or 10-Day Credit Booster Pack without changing your subscription billing cycle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUpgradePlanModal(null);
                  const boosterElem = document.getElementById('credit-boosters-section');
                  if (boosterElem) {
                    boosterElem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] whitespace-nowrap shadow-xs cursor-pointer transition-all shrink-0"
              >
                View Credit Boosters
              </button>
            </div>

            {/* MODAL ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUpgradePlanModal(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const code = upgradePlanModal.code;
                  setUpgradePlanModal(null);
                  router.push(`/checkout?plan=${code.toLowerCase()}`);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary hover:opacity-90 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all font-sans"
              >
                <span>Proceed to Stripe Checkout (${isAnnual ? upgradePlanModal.priceAnnual : upgradePlanModal.priceMonthly}/mo)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}
