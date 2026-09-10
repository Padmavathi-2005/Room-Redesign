'use client';

import React, { useState } from 'react';
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

  const handleSelectPlan = (tier: SubscriptionPlan) => {
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
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier) => {
            const price = billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
            const annualTotal = tier.priceAnnual * 12;

            return (
              <div
                key={tier.id}
                className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
                  tier.popular
                    ? 'bg-white dark:bg-slate-900 border-primary shadow-xl ring-2 ring-primary/20'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-primary/40'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                      {tier.name}
                    </h3>
                    {tier.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white font-heading">
                        {tier.id === 'free' ? formatPrice(0) : formatPrice(price)}
                      </span>
                      {tier.id !== 'free' && (
                        <span className="text-xs text-slate-400 font-bold">/month</span>
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

                <button
                  onClick={() => handleSelectPlan(tier)}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold font-heading transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tier.id === 'free'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                      : 'bg-primary hover:opacity-90 text-white shadow-md shadow-primary/20'
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  {tier.id !== 'free' && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
