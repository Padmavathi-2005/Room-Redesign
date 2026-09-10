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
  Check,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
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
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
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
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { t } = useTranslation();

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<DatabasePlan[]>(DEFAULT_PRICING_PLANS);
  const [isAnnual, setIsAnnual] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [upgradePlanModal, setUpgradePlanModal] = useState<DatabasePlan | null>(null);

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

        await fetchSubscriptionStatus(userToken);

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

          const isCheckoutSuccess = searchParams?.get('checkout') === 'success';
          const sessionId = searchParams?.get('session_id');

          if (isCheckoutSuccess) {
            await verifyCheckoutSession(sessionId, storedToken);
          }

          await Promise.all([
            fetchSubscriptionStatus(storedToken),
            fetchDatabasePlans(),
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

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAutoRenewUpdating, setIsAutoRenewUpdating] = useState(false);

  const handleCancelAutoRenew = async () => {
    if (!token) return;
    setIsAutoRenewUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/subscription/cancel-auto-renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscription(data.data);
        toast.success(data.message || 'Auto-renewal has been paused.', 'Subscription Updated');
        setIsCancelModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to update auto-renewal.', 'Error');
      }
    } catch (err: any) {
      toast.error(`Network error: ${err.message}`, 'Connection Failed');
    } finally {
      setIsAutoRenewUpdating(false);
    }
  };

  const handleResumeAutoRenew = async () => {
    if (!token) return;
    setIsAutoRenewUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/subscription/resume-auto-renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscription(data.data);
        toast.success(data.message || 'Auto-renewal reactivated successfully.', 'Subscription Updated');
      } else {
        toast.error(data.message || 'Failed to reactivate auto-renewal.', 'Error');
      }
    } catch (err: any) {
      toast.error(`Network error: ${err.message}`, 'Connection Failed');
    } finally {
      setIsAutoRenewUpdating(false);
    }
  };

  const handleSelectPlan = (code: string) => {
    router.push(`/checkout?plan=${code.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs font-bold uppercase tracking-wider font-heading">
          {t?.billing?.loadingData || 'Loading Server Billing Data...'}
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
          <span>{t?.billing?.verifyingPayment || 'Verifying your Stripe payment — please wait…'}</span>
        </div>
      )}

      {/* VERIFICATION ERROR ALERT WITH RETRY */}
      {verifyError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="font-bold">{t?.billing?.verificationFailed || 'Payment Verification Failed'}</p>
              <p className="text-[11px] mt-0.5 font-normal">{verifyError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {searchParams?.get('session_id') && (
              <button
                type="button"
                onClick={() => verifyCheckoutSession(searchParams?.get('session_id') || null, token || '')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                {t?.billing?.retry || 'Retry'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setVerifyError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
            >
              {t?.billing?.dismiss || 'Dismiss'}
            </button>
          </div>
        </div>
      )}


      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20 mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            {t?.billing?.headerBadge || 'AI Credits & Billing Center'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading tracking-tight">
            {t?.billing?.title || 'Subscription Plans & Credits'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t?.billing?.subtitle || 'Server-authoritative subscription status, plan upgrades, and generation credits balance.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/checkout?plan=starter')}
            className="px-4 py-2.5 rounded-2xl bg-primary hover:opacity-90 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer font-heading"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{t?.billing?.upgradePlan || 'Upgrade Plan'}</span>
          </button>
          <Link
            href="/transactions"
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading shadow-xs"
          >
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t?.transactionsPage?.title || 'Transactions'}</span>
          </Link>
          {subscription?.stripeCustomerId && (
            <button
              onClick={handleOpenStripePortal}
              disabled={actionLoading === 'portal'}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading"
            >
              <CreditCard className="w-4 h-4 text-primary" />
              <span>{t?.billing?.stripePortal || 'Stripe Portal'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* SUBSCRIPTION PLANS & PRICING */}
      <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: ACTIVE PLAN */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  {t?.billing?.cards?.currentPlan || 'Current Plan'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20">
                  {activePlanCode.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-heading capitalize">
                  {(t?.billing?.cards?.planSuffix || '{plan} Plan').replace('{plan}', activePlanCode.charAt(0).toUpperCase() + activePlanCode.slice(1))}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t?.billing?.cards?.status || 'Status'}: <span className="font-bold text-emerald-600 capitalize">{subscription?.subscriptionStatus || t?.billing?.cards?.active || 'Active'}</span>
                </p>
              </div>
            </div>

            {/* CARD 2: AVAILABLE CREDITS */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  {t?.billing?.cards?.creditBalance || 'Credit Balance'}
                </span>
                <CreditTokenIcon size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                  <CreditTokenIcon size="sm" />
                  <span>{creditsRemaining}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {t?.billing?.cards?.serverBalance || 'Verified server-side balance'}
                </p>
              </div>
            </div>

            {/* CARD 3: BILLING CYCLE */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  {t?.billing?.cards?.nextRenewal || 'Next Renewal'}
                </span>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                  {subscription?.subscriptionPeriodEnd
                    ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })
                    : (t?.billing?.cards?.notApplicable || 'N/A')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {(t?.billing?.cards?.daysRemaining || '{count} days remaining').replace('{count}', String(subscription?.daysRemaining ?? 0))}
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
                          {t?.billing?.pricingSection?.currentPlanBadge || 'Current Plan'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-heading">
                        {formatPrice(price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400"> {t?.billing?.pricingSection?.perMonth || '/ month'}</span>
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
                    {isCurrent ? (t?.billing?.pricingSection?.activePlanBtn || 'Active Plan') : (t?.billing?.pricingSection?.upgradeToBtn || 'Upgrade to {name}').replace('{name}', plan.name)}
                  </button>
                </div>
              );
            })}
          </div>

          {/* AUTO-RENEWAL & SUBSCRIPTION MANAGEMENT BANNER (MOVED TO END OF PAGE AS REQUESTED) */}
          {activePlanCode !== 'free' && (
            <div className="mt-8 p-6 rounded-[10px] bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border border-blue-200/80 dark:border-indigo-500/30 text-slate-900 dark:text-white shadow-sm space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider border flex items-center gap-1.5 ${
                        subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
                      }`}
                    >
                      {subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>{t?.billing?.autoRenew?.pausedBadge || 'Auto-Renewal Paused'}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{t?.billing?.autoRenew?.activeBadge || 'Auto-Renewal Active'}</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs font-bold text-blue-700 dark:text-slate-300 bg-blue-100/80 dark:bg-white/10 px-2.5 py-0.5 rounded-full capitalize border border-blue-200/60 dark:border-transparent">
                      {(t?.billing?.cards?.planSuffix || '{plan} Plan').replace('{plan}', activePlanCode.charAt(0).toUpperCase() + activePlanCode.slice(1))}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    {subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false
                      ? (t?.billing?.autoRenew?.pausedTitle || 'Subscription Scheduled for Expiry')
                      : (t?.billing?.autoRenew?.activeTitle || 'Automatic Subscription Renewal')}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false ? (
                      <>
                        {(t?.billing?.autoRenew?.pausedDesc || 'Auto-renewal is currently paused. Your remaining credits and full plan features stay active until {date}, and your payment method will not be charged.')
                          .split('{date}')[0]}
                        <strong className="text-amber-700 dark:text-amber-300 font-mono">
                          {subscription?.subscriptionPeriodEnd
                            ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })
                            : (t?.billing?.cancelModal?.dateFallback || 'period end')}
                        </strong>
                        {(t?.billing?.autoRenew?.pausedDesc || 'Auto-renewal is currently paused. Your remaining credits and full plan features stay active until {date}, and your payment method will not be charged.')
                          .split('{date}')[1] || ''}
                      </>
                    ) : (
                      <>
                        {(t?.billing?.autoRenew?.activeDesc || 'Your subscription will automatically renew on {date}. You can pause or turn off auto-renewal anytime without losing remaining credits.')
                          .split('{date}')[0]}
                        <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                          {subscription?.subscriptionPeriodEnd
                            ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })
                            : (t?.billing?.cancelModal?.dateFallback || 'next billing date')}
                        </strong>
                        {(t?.billing?.autoRenew?.activeDesc || 'Your subscription will automatically renew on {date}. You can pause or turn off auto-renewal anytime without losing remaining credits.')
                          .split('{date}')[1] || ''}
                      </>
                    )}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false ? (
                    <button
                      type="button"
                      disabled={isAutoRenewUpdating}
                      onClick={handleResumeAutoRenew}
                      className="px-4 py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isAutoRenewUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      <span>{t?.billing?.autoRenew?.reactivate || 'Reactivate Auto-Renewal'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isAutoRenewUpdating}
                      onClick={() => setIsCancelModalOpen(true)}
                      className="px-4 py-2.5 rounded-[10px] bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <span>{t?.billing?.autoRenew?.cancel || 'Cancel Auto-Renewal'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      {/* PLAN UPGRADE CONFIRMATION POPUP MODAL */}
      <Modal
        isOpen={!!upgradePlanModal}
        onClose={() => setUpgradePlanModal(null)}
        title={t?.billing?.upgradeModal?.title || 'Confirm Subscription Upgrade'}
        subtitle={t?.billing?.upgradeModal?.subtitle || 'Review your new billing cycle, credit allocation & plan features.'}
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
                    {t?.billing?.upgradeModal?.currentPlan || 'Current Plan'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-extrabold uppercase">
                    {t?.billing?.upgradeModal?.activeBadge || 'ACTIVE'}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 capitalize">
                  {(t?.billing?.cards?.planSuffix || '{plan} Plan').replace('{plan}', activePlanCode.charAt(0).toUpperCase() + activePlanCode.slice(1))}
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-medium pt-1">
                  <p className="flex items-center justify-between">
                    <span>{t?.billing?.upgradeModal?.periodEnd || 'Period End:'}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {subscription?.subscriptionPeriodEnd
                        ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'short' })
                        : (t?.billing?.upgradeModal?.activeStatus || 'Active')}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>{t?.billing?.upgradeModal?.unusedCredits || 'Unused Credits:'}</span>
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
                    {t?.billing?.upgradeModal?.upgradingTo || 'Upgrading To'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-extrabold uppercase">
                    {t?.billing?.upgradeModal?.selectedBadge || 'SELECTED'}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {upgradePlanModal.name}
                </h4>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-medium pt-1">
                  <p className="flex items-center justify-between">
                    <span>{t?.billing?.upgradeModal?.billingStarts || 'Billing Starts:'}</span>
                    <span className="font-bold text-primary font-mono">
                      {(t?.billing?.upgradeModal?.today || 'Today ({date})').replace('{date}', new Date().toLocaleDateString(undefined, { dateStyle: 'short' }))}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>{t?.billing?.upgradeModal?.tierCredits || 'Tier Credits:'}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                      +<CreditTokenIcon size="xs" />
                      {(t?.billing?.upgradeModal?.creditsPerMonth || '{credits} / mo').replace('{credits}', String(upgradePlanModal.credits)).replace('+', '')}
                    </span>
                  </p>
                  <p className="flex items-center justify-between pt-1 border-t border-primary/20">
                    <span>{t?.billing?.upgradeModal?.estCombinedBalance || 'Est. Combined Balance:'}</span>
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
                <span>{t?.billing?.upgradeModal?.whatHappensTitle || 'What happens upon upgrade payment?'}</span>
              </h5>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-medium pl-5 list-disc text-[11px] leading-relaxed">
                <li>{t?.billing?.upgradeModal?.benefit1 || 'Your new 30-day billing cycle begins immediately upon verified payment completion.'}</li>
                <li>{(t?.billing?.upgradeModal?.benefit2 || '+{credits} Credits will be added to your account balance instantly.').replace('{credits}', String(upgradePlanModal.credits))}</li>
                <li>{(t?.billing?.upgradeModal?.benefit3 || 'Your current unused {credits} credits are preserved and rolled over!').replace('{credits}', String(creditsRemaining))}</li>
                <li>{t?.billing?.upgradeModal?.benefit4 || 'Unlocks 8K UHD architectural quality, priority queue & full AI tool access.'}</li>
              </ul>
            </div>

            {/* NEED CREDITS RIGHT NOW ALTERNATIVE CALLOUT */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 text-left">
                <p className="font-extrabold text-amber-950 dark:text-amber-200 font-sans">
                  {t?.billing?.upgradeModal?.boosterCalloutTitle || "Just need extra credits for today's project?"}
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300 font-medium">
                  {t?.billing?.upgradeModal?.boosterCalloutDesc || 'You can buy a 1-Day or 10-Day Credit Booster Pack without changing your subscription billing cycle.'}
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
                {t?.billing?.upgradeModal?.viewBoosters || 'View Credit Boosters'}
              </button>
            </div>

            {/* MODAL ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUpgradePlanModal(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                {t?.billing?.upgradeModal?.cancel || 'Cancel'}
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
                <span>{(t?.billing?.upgradeModal?.proceedToCheckout || 'Proceed to Stripe Checkout ({price}/mo)').replace('{price}', formatPrice(isAnnual ? upgradePlanModal.priceAnnual : upgradePlanModal.priceMonthly))}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* CONFIRMATION MODAL FOR CANCELING AUTO-RENEWAL */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={t?.billing?.cancelModal?.title || 'Pause Subscription Auto-Renewal?'}
        maxWidth="md"
      >
        <div className="space-y-5 text-slate-700 dark:text-slate-200 text-xs font-medium text-left">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{t?.billing?.cancelModal?.noLossTitle || 'No Immediate Loss of Access'}</p>
              <p className="mt-1 text-xs leading-relaxed">
                {(t?.billing?.cancelModal?.noLossDesc || 'Turning off auto-renewal stops upcoming charges. Your remaining {credits} credits and full {plan} Plan features will remain 100% active until {date}.')
                  .replace('{credits}', String(creditsRemaining))
                  .replace('{plan}', activePlanCode.charAt(0).toUpperCase() + activePlanCode.slice(1))
                  .replace('{date}', subscription?.subscriptionPeriodEnd
                    ? new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })
                    : (t?.billing?.cancelModal?.dateFallback || 'your billing period ends'))}
              </p>
            </div>
          </div>

          <p className="leading-relaxed">
            {t?.billing?.cancelModal?.cardNotCharged || 'Your card will not be automatically charged on your next billing date. You can reactivate auto-renewal at any time before your expiry date with a single click.'}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t?.billing?.cancelModal?.keepActive || 'Keep Auto-Renewal Active'}
            </button>

            <button
              type="button"
              disabled={isAutoRenewUpdating}
              onClick={handleCancelAutoRenew}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isAutoRenewUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t?.billing?.cancelModal?.confirmOff || 'Confirm & Turn Off Auto-Renewal'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
