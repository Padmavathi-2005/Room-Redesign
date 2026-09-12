'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnual: number;
  isDiscountActive?: boolean;
  discountPriceMonthly?: number;
  discountPriceAnnual?: number;
  credits: number;
  description: string;
  popular?: boolean;
  ctaText: string;
  features: string[];
}

const PRICING_TIERS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    priceMonthly: 0,
    priceAnnual: 0,
    credits: 0,
    description: 'Explore RoomAI design tools. Upgrade to receive generation credits.',
    popular: false,
    ctaText: 'Current Plan',
    features: [
      '0 Initial Credits',
      '30-Day Cycle',
      'Standard AI Render Engines',
      'Access to Basic Design Categories',
      'Upgrade Anytime',
    ],
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    badge: 'MOST POPULAR',
    priceMonthly: 19,
    priceAnnual: 15,
    credits: 40,
    description: 'Ideal for homeowners & design enthusiasts starting single-room projects.',
    popular: true,
    ctaText: 'Upgrade to Starter',
    features: [
      '40 AI Generation Credits / mo',
      '8K UHD Architectural Quality',
      'All AI Design Tools Included',
      'Standard Processing Speed',
      'Verified Stripe Payment',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    badge: 'PROFESSIONAL CHOICE',
    priceMonthly: 39,
    priceAnnual: 31,
    credits: 100,
    description: 'For professional interior designers & architects needing priority generation.',
    popular: false,
    ctaText: 'Upgrade to Pro',
    features: [
      '100 AI Generation Credits / mo',
      'Priority Processing Queue',
      'Full 8K UHD Quality',
      'Multi-Room Project Consistency',
      'Priority Email & Chat Support',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { formatPrice, selectedCurrency } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [plansList, setPlansList] = useState<SubscriptionPlan[]>(PRICING_TIERS);
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('free');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.plan) setCurrentUserPlan(String(u.plan).toLowerCase().trim());
          else if (u?.subscriptionTier) {
            const t = String(u.subscriptionTier).toLowerCase();
            if (t.includes('pro')) setCurrentUserPlan('pro');
            else if (t.includes('starter')) setCurrentUserPlan('starter');
            else setCurrentUserPlan('free');
          }
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await fetch(`${apiUrl}/subscription/plans`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const updated = PRICING_TIERS.map((fallback) => {
              const dbPlan = json.data.find((p: any) => p.code?.toLowerCase() === fallback.id.toLowerCase());
              if (!dbPlan) return fallback;
              const isPop = Boolean(dbPlan.isPopular || dbPlan.popular || fallback.popular || fallback.id === 'starter');
              return {
                ...fallback,
                name: dbPlan.name || fallback.name,
                description: dbPlan.description || fallback.description,
                credits: dbPlan.credits ?? fallback.credits,
                priceMonthly: dbPlan.priceMonthly ?? fallback.priceMonthly,
                priceAnnual: dbPlan.priceAnnual ?? fallback.priceAnnual,
                isDiscountActive: Boolean(dbPlan.isDiscountActive),
                discountPriceMonthly: dbPlan.discountPriceMonthly,
                discountPriceAnnual: dbPlan.discountPriceAnnual,
                popular: isPop,
                isPopular: isPop,
                badge: isPop ? 'MOST POPULAR' : (fallback.badge || ''),
                features: Array.isArray(dbPlan.features) && dbPlan.features.length > 0 ? dbPlan.features : fallback.features,
              };
            });
            setPlansList(updated);
          }
        }
      } catch (e) {}
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (tier: SubscriptionPlan) => {
    if (tier.id === currentUserPlan) {
      return;
    }
    if (tier.id === 'free') {
      router.push('/billing');
      return;
    }
    router.push(`/checkout?plan=${tier.id}&interval=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="pricing-top-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-200 border border-violet-300/80 dark:border-violet-500/50 text-xs font-black uppercase tracking-wider shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-300 animate-pulse" />
            <span>Transparent Global Pricing • Currency: {selectedCurrency.code}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Flexible Plans for Every Space
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
            Choose the perfect plan to redesign rooms with AI. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-extrabold cursor-pointer transition-colors ${
                billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors p-0.5 cursor-pointer focus:outline-none"
            >
              <div
                className={`w-5 h-5 rounded-full bg-primary shadow-md transform transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            <span
              className={`text-xs font-extrabold cursor-pointer transition-colors flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
              onClick={() => setBillingCycle('annual')}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <section id="pricing" className="subscription-plans-section w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            {plansList.map((tier) => {
              const isPopular = Boolean(
                tier.popular ||
                (tier as any).isPopular ||
                tier.id.toLowerCase() === 'starter'
              );

              const hasDiscount = Boolean(
                tier.isDiscountActive && (
                  billingCycle === 'annual'
                    ? (tier.discountPriceAnnual && tier.discountPriceAnnual > 0 && tier.discountPriceAnnual < tier.priceAnnual)
                    : (tier.discountPriceMonthly && tier.discountPriceMonthly > 0 && tier.discountPriceMonthly < tier.priceMonthly)
                )
              );

              const effectivePrice = hasDiscount
                ? (billingCycle === 'annual' ? tier.discountPriceAnnual! : tier.discountPriceMonthly!)
                : (billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly);

              const origPrice = billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
              const annualTotal = effectivePrice * 12;

              return (
                <div
                  key={tier.id}
                  data-popular={isPopular ? 'true' : 'false'}
                  className={`relative p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between space-y-6 ${
                    isPopular
                      ? 'popular-pricing-card billing-popular-card bg-white dark:bg-[#0D121F]/98 backdrop-blur-2xl !border-2 !border-[#8B5CF6] dark:!border-[#8B5CF6] scale-105 z-10 !shadow-[0_0_25px_-2px_rgba(139,92,246,0.55),0_16px_36px_rgba(0,0,0,0.8)] dark:!shadow-[0_0_25px_-2px_rgba(139,92,246,0.55),0_16px_36px_rgba(0,0,0,0.8)] hover:!border-[#A855F7] hover:!shadow-[0_0_35px_-2px_rgba(168,85,247,0.75),0_20px_42px_rgba(0,0,0,0.85)]'
                      : 'pricing-plan-card bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-400/80 hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {/* Floating Most Popular Badge on Top Border */}
                  {isPopular && (
                    <div className="popular-pricing-badge absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg shadow-purple-500/50 z-20 flex items-center gap-1.5 whitespace-nowrap border border-purple-400/50">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                        {tier.name}
                      </h3>
                      {tier.badge && !isPopular && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-extrabold uppercase tracking-wider">
                          {tier.badge}
                        </span>
                      )}
                    </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {hasDiscount && tier.id !== 'free' && (
                        <span className="text-xl font-bold line-through text-slate-400 font-heading">
                          {formatPrice(origPrice)}
                        </span>
                      )}
                      <span className="text-4xl font-black text-slate-900 dark:text-white font-heading">
                        {tier.id === 'free' ? formatPrice(0) : formatPrice(effectivePrice)}
                      </span>
                      {tier.id !== 'free' && (
                        <span className="text-xs text-slate-400 font-bold">/month</span>
                      )}
                      {hasDiscount && tier.id !== 'free' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          Save {formatPrice(origPrice - effectivePrice)}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'annual' && tier.id !== 'free' && (
                      <p className="text-[11px] text-emerald-600 font-bold mt-1">
                        Billed annually ({formatPrice(annualTotal)}/year)
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(() => {
                  const planRanks: Record<string, number> = { free: 0, starter: 1, pro: 2 };
                  const userRank = planRanks[currentUserPlan] ?? 0;
                  const thisRank = planRanks[tier.id.toLowerCase()] ?? 0;
                  const isCurrent = tier.id === currentUserPlan;

                  if (isCurrent) {
                    return (
                      <button
                        disabled
                        className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold font-heading bg-primary text-white shadow-md shadow-primary/25 border border-primary/30 cursor-default flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                        <span>Current Plan</span>
                      </button>
                    );
                  }

                  if (tier.id === 'free') {
                    return (
                      <button
                        onClick={() => handleSelectPlan(tier)}
                        className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer border-2 border-primary text-primary bg-white dark:bg-slate-900 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-xs flex items-center justify-center gap-2"
                      >
                        <span>Switch to Free</span>
                      </button>
                    );
                  }

                  const isUpgrade = thisRank > userRank;
                  if (isUpgrade) {
                    return (
                      <button
                        onClick={() => handleSelectPlan(tier)}
                        className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                      >
                        <span>Upgrade to {tier.name.replace(' Plan', '')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={() => handleSelectPlan(tier)}
                      className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer bg-primary hover:opacity-90 text-white shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <span>Switch to {tier.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  );
                })()}
              </div>
            );
          })}
          </div>
        </section>
      </div>
    </div>
  );
}
