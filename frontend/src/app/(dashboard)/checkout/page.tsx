'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowLeft,
  CreditCard,
  Layers,
  Coins,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface PlanDetail {
  code: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  description: string;
  features: string[];
}

const PLANS_BY_CODE: Record<string, PlanDetail> = {
  starter: {
    code: 'starter',
    name: 'Starter Plan',
    priceMonthly: 19,
    priceAnnual: 15,
    credits: 40,
    description: 'Ideal for homeowners & design enthusiasts starting single-room projects.',
    features: [
      '40 AI Generation Credits / month',
      '30-Day Validity Cycle',
      '8K UHD Architectural Quality',
      'All AI Design Tools',
      'Direct Verified Stripe Payment',
    ],
  },
  pro: {
    code: 'pro',
    name: 'Pro Plan',
    priceMonthly: 39,
    priceAnnual: 31,
    credits: 100,
    description: 'For professional interior designers & architects needing priority generation.',
    features: [
      '100 AI Generation Credits / month',
      '30-Day Validity Cycle',
      'Priority Processing Queue',
      'Full 8K UHD Quality',
      'Multi-Room Project Consistency',
      'Priority Email & Chat Support',
    ],
  },
};

export default function FullPageCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = (searchParams.get('plan') || 'starter').toLowerCase();
  const plan: PlanDetail = PLANS_BY_CODE[planParam] || PLANS_BY_CODE.starter;

  const [isAnnual, setIsAnnual] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (token && token.startsWith('mock_jwt_token_roomai_')) {
      setErrorMessage('Your login session has expired. Auto-logging out and redirecting to sign in...');
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login?expired=true';
      }, 1000);
    }
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token') || (storedUser ? JSON.parse(storedUser).token : null);

      if (!token || token.startsWith('mock_jwt_token_roomai_')) {
        setErrorMessage('Authentication session expired. Auto-logging out and redirecting to sign in...');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login?expired=true';
        }, 1000);
        setIsProcessing(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/subscription/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planCode: plan.code,
            billingCycle: isAnnual ? 'annual' : 'monthly',
            successUrl: window.location.origin + `/billing?checkout=success&plan=${plan.code}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: window.location.origin + '/billing?checkout=cancel',
          }),
        });

        const resData = await res.json();
        if (resData.success && resData.data?.url) {
          window.location.href = resData.data.url;
          return;
        } else if (res.status === 401 || resData.message?.toLowerCase().includes('token')) {
          setErrorMessage('Your login session has expired or is invalid. Auto-logging out and redirecting to sign in...');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login?expired=true';
          }, 1000);
        } else {
          setErrorMessage(resData.message || 'Failed to initialize Stripe Hosted Checkout session.');
        }
      } catch (err: any) {
        setErrorMessage(`Stripe Connection Error: ${err.message || 'Network failure'}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors font-heading"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Billing & Plans
        </Link>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
              Stripe PCI-Compliant Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading mt-2">
              Upgrade to {plan.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit Encrypted Payment</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="font-bold">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: ORDER SUMMARY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Order Summary
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold font-mono">
                  {plan.credits} Credits / Month
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* MONTHLY / ANNUAL CYCLE TOGGLE */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Billing Interval
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAnnual(false)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      !isAnnual
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isAnnual
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Annual (-20%)
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>Subscription Interval</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">{isAnnual ? 'Annual Billing' : 'Monthly Billing'}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>Monthly Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white">${price}.00 / month</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>Included AI Credits</span>
                  <span className="font-bold text-purple-600 font-mono">+{plan.credits} Credits / month</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900 dark:text-white font-heading">
                    Total Charge Now
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                      ${isAnnual ? price * 12 : price}.00
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {isAnnual ? `Billed as $${price * 12}/year by Stripe` : 'Billed monthly by Stripe'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-heading mb-3">
                  What's Included:
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT: STRIPE SECURE REDIRECT NOTICE & ACTION */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleCheckoutSubmit}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  Stripe Hosted Checkout
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                  <CreditCard className="w-3.5 h-3.5" />
                  Stripe Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-slate-900 dark:text-white font-heading">
                      PCI-DSS Compliant Payment Security
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Your payment will be securely processed by Stripe. Clicking the button below redirects you to Stripe's encrypted checkout portal where you can enter card details or use Apple Pay / Google Pay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white text-sm font-extrabold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer font-heading disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Connecting to Stripe...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Proceed to Stripe Checkout (${price}.00)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Credits are automatically allocated to your account upon verified webhook payment confirmation.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
