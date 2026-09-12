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
  ArrowRight,
  PauseCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
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

export interface PlanTranslation {
  languageCode: string;
  name: string;
  description: string;
  features: string[];
}

interface DatabasePlan {
  name: string;
  code: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  description: string;
  features?: string[];
  translations?: PlanTranslation[];
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
  const { t, currentLanguage } = useLanguage();

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
              plan: u.plan ? u.plan.toLowerCase() : parsed.plan,
              subscriptionTier: u.subscriptionTier || parsed.subscriptionTier,
              subscriptionPlanId: u.subscriptionPlanId || parsed.subscriptionPlanId,
              credits: u.credits ?? parsed.credits,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('user-updated'));
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

  const getLocalizedPlan = (plan: DatabasePlan) => {
    const langCode = currentLanguage?.code || 'en';
    const translation = plan.translations?.find((tr) => tr.languageCode === langCode);
    return {
      name: translation?.name || plan.name,
      description: translation?.description || plan.description,
      features: (translation?.features && translation.features.length > 0) ? translation.features : (plan.features || []),
    };
  };

  const formatLocalizedDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return t?.billing?.cards?.notApplicable || 'N/A';
    try {
      const locale = currentLanguage?.code === 'ar' ? 'ar-EG' : currentLanguage?.code === 'fr' ? 'fr-FR' : 'en-US';
      return new Date(dateStr).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return new Date(dateStr).toLocaleDateString();
    }
  };

  const activePlanDef = plans.find((p) => p.code.toLowerCase() === activePlanCode.toLowerCase());
  const localizedActivePlan = activePlanDef ? getLocalizedPlan(activePlanDef) : null;
  const activePlanDisplayName = localizedActivePlan?.name || (activePlanCode.charAt(0).toUpperCase() + activePlanCode.slice(1) + ' Plan');

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4 text-start font-sans animate-in fade-in duration-300">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/90 dark:bg-purple-950/70 text-purple-700 dark:text-purple-200 text-[11px] font-extrabold uppercase tracking-wider border border-purple-300/80 dark:border-purple-500/50 dark:shadow-[0_0_15px_rgba(168,85,247,0.35)] mb-2.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
            <span>{t?.billing?.headerBadge || 'AI Credits & Billing Center'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            {t?.billing?.title || 'Credits, Payments & Invoices'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5 max-w-2xl leading-relaxed">
            {t?.billing?.subtitle || 'Server-authoritative subscription status, audit credit ledger, and verified Stripe invoices.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push('/checkout?plan=starter')}
            className="billing-header-upgrade-btn group px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-black tracking-wide uppercase shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/50 border border-purple-400/40 hover:border-purple-300/80 flex items-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-sans">{t?.billing?.upgradePlan || 'Upgrade Plan'}</span>
          </button>
          <Link
            href="/transactions"
            className="billing-header-action-btn btn-transactions group px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0D121F]/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5"
          >
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-sans">{t?.transactionsPage?.title || 'Transactions'}</span>
          </Link>
          {subscription?.stripeCustomerId && (
            <button
              onClick={handleOpenStripePortal}
              disabled={actionLoading === 'portal'}
              className="billing-header-action-btn btn-portal group px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0D121F]/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-100 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              <span className="font-sans">{t?.billing?.stripePortal || 'Stripe Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </button>
          )}
        </div>
      </div>

      {/* SUBSCRIPTION PLANS & PRICING */}
      <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: ACTIVE PLAN */}
            <div className="billing-stat-card billing-stat-plan p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:!border-purple-500/80 dark:hover:!border-[#A855F7] hover:shadow-xl dark:hover:shadow-[0_0_28px_-2px_rgba(168,85,247,0.5),0_16px_36px_rgba(0,0,0,0.8)] hover:-translate-y-1 space-y-4 transition-all duration-300 group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300 font-heading">
                  {t?.billing?.cards?.currentPlan || 'Current Plan'}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-200 text-[10px] font-extrabold uppercase tracking-wider border border-purple-300/80 dark:border-purple-400/50 dark:shadow-[0_0_14px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform duration-200">
                  {activePlanCode.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-heading group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-200">
                  {activePlanDisplayName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t?.billing?.cards?.status || 'Status'}:{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {subscription?.subscriptionStatus === 'active' || !subscription?.subscriptionStatus
                      ? (t?.profilePage?.activeStatus || t?.billing?.cards?.active || 'Active')
                      : subscription.subscriptionStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* CARD 2: AVAILABLE CREDITS */}
            <div className="billing-stat-card billing-stat-credits p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:!border-amber-500/80 dark:hover:!border-[#F59E0B] hover:shadow-xl dark:hover:shadow-[0_0_28px_-2px_rgba(245,158,11,0.5),0_16px_36px_rgba(0,0,0,0.8)] hover:-translate-y-1 space-y-4 transition-all duration-300 group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300 font-heading">
                  {t?.billing?.cards?.creditBalance || 'Credit Balance'}
                </span>
                <CreditTokenIcon size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors duration-200">
                  <CreditTokenIcon size="sm" />
                  <span>{creditsRemaining}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {t?.billing?.cards?.serverBalance || 'Verified server-side balance'}
                </p>
              </div>
            </div>

            {/* CARD 3: BILLING CYCLE */}
            <div className="billing-stat-card billing-stat-renewal p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:!border-indigo-500/80 dark:hover:!border-[#818CF8] hover:shadow-xl dark:hover:shadow-[0_0_28px_-2px_rgba(129,140,248,0.5),0_16px_36px_rgba(0,0,0,0.8)] hover:-translate-y-1 space-y-4 transition-all duration-300 group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300 font-heading">
                  {t?.billing?.cards?.nextRenewal || 'Next Renewal'}
                </span>
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-200">
                  {formatLocalizedDate(subscription?.subscriptionPeriodEnd)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {(t?.billing?.cards?.daysRemaining || '{count} days remaining').replace('{count}', String(subscription?.daysRemaining ?? 0))}
                </p>
              </div>
            </div>
          </div>


          {/* PRICING CARDS GRID */}
          <section id="pricing" className="subscription-plans-section w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 items-stretch">
            {plans.map((plan) => {
              const isPopular = Boolean(
                (plan as any).popular ||
                (plan as any).isPopular ||
                plan.code?.toLowerCase() === 'starter'
              );
              const isCurrent = activePlanCode.toLowerCase() === plan.code.toLowerCase();
              const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
              const loc = getLocalizedPlan(plan);

              const planRanks: Record<string, number> = { free: 0, starter: 1, pro: 2 };
              const userRank = planRanks[activePlanCode.toLowerCase()] ?? 0;
              const thisRank = planRanks[plan.code.toLowerCase()] ?? 0;
              const isUpgrade = userRank >= 0 && thisRank > userRank;
              const planShortName = loc.name.replace(' Plan', '');

              return (
                <div
                  key={plan.code}
                  data-popular={isPopular ? 'true' : 'false'}
                  data-plan={plan.code.toLowerCase()}
                  style={
                    isPopular
                      ? {
                          border: '2px solid #8B5CF6',
                          borderColor: '#8B5CF6',
                          backgroundColor: '#0D121F',
                          boxShadow: '0 0 25px -2px rgba(139, 92, 246, 0.55), 0 16px 36px rgba(0, 0, 0, 0.8)',
                        }
                      : undefined
                  }
                  className={`relative p-6 sm:p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between space-y-6 ${
                    isPopular
                      ? 'popular-pricing-card billing-popular-card bg-white dark:bg-[#0D121F]/98 backdrop-blur-2xl !border-2 !border-[#8B5CF6] dark:!border-[#8B5CF6] scale-105 z-10 !shadow-[0_0_25px_-2px_rgba(139,92,246,0.55),0_16px_36px_rgba(0,0,0,0.8)] dark:!shadow-[0_0_25px_-2px_rgba(139,92,246,0.55),0_16px_36px_rgba(0,0,0,0.8)]'
                      : `pricing-plan-card plan-card-${plan.code.toLowerCase()} bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:!border-[#8B5CF6] dark:hover:!border-[#8B5CF6] shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:shadow-2xl hover:scale-[1.02] cursor-pointer`
                  }`}
                >
                  {/* Floating Most Popular Badge */}
                  {isPopular && (
                    <div className="popular-pricing-badge absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-md z-20 flex items-center gap-1.5 whitespace-nowrap">
                      <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                        {loc.name}
                      </h3>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          {t?.billing?.pricingSection?.currentPlanBadge || 'Current Plan'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {loc.description}
                    </p>

                    {/* Price */}
                    <div className="pt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight" dir="ltr">
                        {formatPrice(price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {t?.billing?.pricingSection?.perMonth || '/ month'}
                      </span>
                    </div>

                    {/* Sleek Modern Credit Token Badge (Like Home Page) */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/50 flex items-center justify-start gap-3 shadow-xs">
                      <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                        <CreditTokenIcon size="sm" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-slate-900 dark:text-white font-heading tracking-tight">
                          {plan.credits || 0} Generation Credits
                        </div>
                        <div className="text-[9px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                          AI Tokens Allocated
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      {(loc.features || []).map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic CTA Button Matching Home Page */}
                  <div className="pt-4">
                    {(() => {
                      if (isCurrent) {
                        return (
                          <button
                            disabled
                            className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase bg-primary text-white shadow-lg shadow-primary/25 border border-primary/30 cursor-default flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                            <span>{t?.billing?.pricingSection?.currentPlanBadge || 'Current Plan'}</span>
                          </button>
                        );
                      }

                      if (plan.code.toLowerCase() === 'free') {
                        return (
                          <button
                            onClick={() => handleSelectPlan(plan.code)}
                            className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer border-2 border-primary text-primary bg-white dark:bg-slate-900 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-xs hover:shadow-md hover:scale-[1.01] flex items-center justify-center gap-2"
                          >
                            <span>Select {loc.name}</span>
                          </button>
                        );
                      }

                      if (isUpgrade) {
                        return (
                          <button
                            onClick={() => handleSelectPlan(plan.code)}
                            className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                          >
                            <span>Upgrade to {planShortName}</span>
                            <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleSelectPlan(plan.code)}
                          className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <span>Select {loc.name}</span>
                          <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
            </div>
          </section>

          {/* AUTO-RENEWAL & SUBSCRIPTION MANAGEMENT BANNER (PREMIUM INTERACTIVE CARD) */}
          {activePlanCode !== 'free' && (
            <div className="billing-autorenew-banner group relative mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/70 via-purple-50/50 to-indigo-50/70 dark:bg-[#0D121F]/98 backdrop-blur-2xl border border-slate-200/90 dark:border-purple-500/30 hover:border-purple-400/80 dark:hover:border-[#8B5CF6] text-slate-900 dark:text-white shadow-md hover:shadow-2xl dark:shadow-[0_0_20px_-4px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_0_30px_-4px_rgba(139,92,246,0.45),0_16px_40px_rgba(0,0,0,0.85)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              {/* Corner Ambient Glow Light Flare */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl pointer-events-none group-hover:bg-purple-500/25 group-hover:scale-125 transition-all duration-500" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border flex items-center gap-1.5 transition-all duration-200 ${
                        subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      }`}
                    >
                      {subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{t?.billing?.autoRenew?.pausedBadge || 'Auto-Renewal Paused'}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
                          <span>{t?.billing?.autoRenew?.activeBadge || 'Auto-Renewal Active'}</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100/90 dark:bg-purple-950/70 px-3 py-1 rounded-full border border-purple-200/80 dark:border-purple-500/40 shadow-xs">
                      {activePlanDisplayName}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-200">
                    {subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false
                      ? (t?.billing?.autoRenew?.pausedTitle || 'Subscription Scheduled for Expiry')
                      : (t?.billing?.autoRenew?.activeTitle || 'Automatic Subscription Renewal')}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {subscription?.cancelAtPeriodEnd || subscription?.autoRenew === false ? (
                      <>
                        {(t?.billing?.autoRenew?.pausedDesc || 'Auto-renewal is currently paused. Your remaining credits and full plan features stay active until {date}, and your payment method will not be charged.')
                          .split('{date}')[0]}
                        <strong className="text-amber-700 dark:text-amber-300 font-mono">
                          {formatLocalizedDate(subscription?.subscriptionPeriodEnd)}
                        </strong>
                        {(t?.billing?.autoRenew?.pausedDesc || 'Auto-renewal is currently paused. Your remaining credits and full plan features stay active until {date}, and your payment method will not be charged.')
                          .split('{date}')[1] || ''}
                      </>
                    ) : (
                      <>
                        {(t?.billing?.autoRenew?.activeDesc || 'Your subscription will automatically renew on {date}. You can pause or turn off auto-renewal anytime without losing remaining credits.')
                          .split('{date}')[0]}
                        <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                          {formatLocalizedDate(subscription?.subscriptionPeriodEnd)}
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
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isAutoRenewUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      <span>{t?.billing?.autoRenew?.reactivate || 'Reactivate Auto-Renewal'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isAutoRenewUpdating}
                      onClick={() => setIsCancelModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-white hover:bg-rose-50/80 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-200 dark:hover:text-rose-300 border border-slate-300/80 hover:border-rose-400 dark:border-slate-700 dark:hover:border-rose-500/50 text-xs font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-[0_0_16px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      <PauseCircle className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
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
          <div className="space-y-6 text-start font-sans">
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
              <div className="space-y-0.5 text-start">
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
        <div className="space-y-5 text-slate-700 dark:text-slate-200 text-xs font-medium text-start">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{t?.billing?.cancelModal?.noLossTitle || 'No Immediate Loss of Access'}</p>
              <p className="mt-1 text-xs leading-relaxed">
                {(t?.billing?.cancelModal?.noLossDesc || 'Turning off auto-renewal stops upcoming charges. Your remaining {credits} credits and full {plan} Plan features will remain 100% active until {date}.')
                  .replace('{credits}', String(creditsRemaining))
                  .replace('{plan}', activePlanDisplayName)
                  .replace('{date}', formatLocalizedDate(subscription?.subscriptionPeriodEnd))}
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
