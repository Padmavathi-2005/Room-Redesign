'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';

import CheckoutModal, { CheckoutPlan } from '@/components/ui/CheckoutModal';

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
    id: 'starter',
    name: 'Starter Pro',
    priceMonthly: 19,
    priceAnnual: 15,
    credits: 200,
    description: 'Perfect for homeowners and design enthusiasts redesigning their personal room spaces.',
    popular: false,
    ctaText: 'Get Started',
    features: [
      '200 AI Generation Credits / mo',
      'Full HD (1080p) Render Quality',
      '5 Active Workspace Projects',
      'All 18 AI Design Tools Included',
      'Standard Image Processing Speed',
      'Email Support & Community Access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Studio',
    badge: 'MOST POPULAR',
    priceMonthly: 39,
    priceAnnual: 31,
    credits: 650,
    description: 'For interior designers, real estate stagers, and creators who need maximum quality.',
    popular: true,
    ctaText: 'Upgrade to Pro Studio',
    features: [
      '650 AI Generation Credits / mo',
      '4K Ultra-HD Crisp Renders',
      'Unlimited Workspace Projects',
      'Priority Fast-Track AI Generation',
      'Full Commercial Usage Rights',
      'High-Res Image Downloads',
      '24/7 Priority VIP Support',
    ],
  },
  {
    id: 'master',
    name: 'Agency Master',
    badge: 'UNLIMITED POWER',
    priceMonthly: 89,
    priceAnnual: 71,
    credits: 1800,
    description: 'For professional architectural firms, design agencies, and high-volume commercial teams.',
    popular: false,
    ctaText: 'Get Agency Master',
    features: [
      '1,800 AI Generation Credits / mo',
      '8K Extreme Resolution Renders',
      'Unlimited Workspace Projects',
      'Dedicated High-Speed AI Pipeline',
      'Full Commercial & Resell License',
      'Custom AI Model Preset Training',
      'Dedicated Account Manager',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string>('starter');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<CheckoutPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSelectPlan = (tier: SubscriptionPlan) => {
    const price = billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnual;
    setSelectedPlanForCheckout({
      id: tier.id,
      name: tier.name,
      price: price,
      billingCycle: billingCycle,
      credits: tier.credits,
      features: tier.features,
    });
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (creditsAdded: number, planName: string) => {
    setCurrentPlan(selectedPlanForCheckout?.id || 'pro');
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-xs font-bold shadow-2xs">
          <Sparkles className="w-4 h-4 text-purple-600 fill-purple-600/20" />
          <span>Flexible SaaS Pricing & Credit Plans</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Simple, Transparent <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">Pricing</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Choose the ideal credit plan to transform your room spaces. Upgrade, downgrade, or cancel anytime.
        </p>

        {/* Billing Cycle Selector Pill */}
        <div className="flex justify-center pt-3">
          <div className="p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-center shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-black border border-purple-200 dark:border-purple-800">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Spacious 3-Column Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {PRICING_TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.id;
          const price = billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnual;
          const annualSavings = tier.priceMonthly * 12 - tier.priceAnnual * 12;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-2xl p-7 transition-all duration-300 group ${
                tier.popular
                  ? 'bg-gradient-to-b from-purple-50/70 via-white to-purple-50/30 dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-900 border-2 border-purple-600 shadow-xl shadow-purple-500/10 ring-4 ring-purple-600/10 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-800'
              }`}
            >
              {/* Floating Top Badge */}
              {tier.badge && (
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Card Header Section */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 fill-purple-600/20" />
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {tier.credits.toLocaleString()} AI Credits / month
                  </p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal min-h-[36px]">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="py-2 border-y border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                    <span className="text-2xl font-extrabold">$</span>
                    <span className="text-5xl font-black tracking-tight font-heading">{price}</span>
                    <span className="text-slate-400 text-xs font-bold">/ month</span>
                  </div>
                  {billingCycle === 'annual' && tier.priceAnnual > 0 && (
                    <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 pt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Billed annually (Save ${annualSavings}/yr)</span>
                    </p>
                  )}
                </div>

                {/* Included Features List */}
                <div className="space-y-3">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Included Features
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Your Active Plan</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(tier)}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      tier.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25 hover:scale-[1.01]'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-2xs'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
            Feature Comparison Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare individual resolution capabilities and credit allowances side-by-side.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Starter Pro ($19/mo)</th>
                <th className="py-3 px-4 text-purple-600 dark:text-purple-400">Pro Studio ($39/mo)</th>
                <th className="py-3 px-4">Agency Master ($89/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Credits Allowance</td>
                <td className="py-3.5 px-4">200 Credits / mo</td>
                <td className="py-3.5 px-4 font-extrabold text-purple-600 dark:text-purple-400">650 Credits / mo</td>
                <td className="py-3.5 px-4">1,800 Credits / mo</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Max Render Quality</td>
                <td className="py-3.5 px-4">Full HD (1080p)</td>
                <td className="py-3.5 px-4 font-extrabold text-purple-600 dark:text-purple-400">4K Ultra-HD</td>
                <td className="py-3.5 px-4">8K Extreme Resolution</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Active Projects</td>
                <td className="py-3.5 px-4">5 Projects</td>
                <td className="py-3.5 px-4 font-extrabold text-purple-600 dark:text-purple-400">Unlimited</td>
                <td className="py-3.5 px-4">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Commercial Rights</td>
                <td className="py-3.5 px-4 text-slate-400">Personal Use</td>
                <td className="py-3.5 px-4 font-extrabold text-purple-600 dark:text-purple-400">Full Commercial License</td>
                <td className="py-3.5 px-4">Commercial & Reselling</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Support SLA</td>
                <td className="py-3.5 px-4">Standard Email</td>
                <td className="py-3.5 px-4 font-extrabold text-purple-600 dark:text-purple-400">24/7 VIP Priority Chat</td>
                <td className="py-3.5 px-4">Dedicated Account Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
