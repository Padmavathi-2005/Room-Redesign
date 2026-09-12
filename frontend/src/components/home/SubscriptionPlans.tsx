'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CreditTokenIcon } from '../ui';
import { useCurrency } from '@/context/CurrencyContext';

interface Plan {
  id: string;
  code: string;
  _id?: string;
  name: string;
  subtitle: string;
  price: string;
  numericPrice: number;
  originalPrice?: number;
  isDiscountActive?: boolean;
  discountBadge?: string;
  creditsBadge: string;
  popular?: boolean;
  features: string[];
}

const PRICING_PLANS: Plan[] = [
  {
    id: 'free',
    code: 'free',
    name: 'Free Plan',
    subtitle: 'Explore RoomAI tools & workspace',
    price: '$0',
    numericPrice: 0,
    creditsBadge: '0 credits',
    features: [
      '0 Initial Credits',
      '30-Day Billing Cycle',
      'Standard AI Render Quality',
      'All Design Categories',
      'Automatic 30-Day Renewal',
    ],
  },
  {
    id: 'starter',
    code: 'starter',
    name: 'Starter Plan',
    subtitle: 'Ideal for homeowners & single room projects',
    price: '$19',
    numericPrice: 19,
    discountBadge: 'POPULAR',
    creditsBadge: '40 credits',
    popular: true,
    features: [
      '40 AI Credits per month',
      '30-Day Billing Cycle',
      '8K UHD Architectural Quality',
      'All 12+ AI Design Tools',
      'Requires Completed Payment',
    ],
  },
  {
    id: 'pro',
    code: 'pro',
    name: 'Pro Plan',
    subtitle: 'For professional designers & architects',
    price: '$39',
    numericPrice: 39,
    creditsBadge: '100 credits',
    features: [
      '100 AI Credits per month',
      '30-Day Billing Cycle',
      'Priority Processing Queue',
      'Full 8K UHD Quality',
      'Multi-Room Consistency',
      'Priority Email/Chat Support',
    ],
  },
];

export default function SubscriptionPlans() {
  const { formatPrice } = useCurrency();
  const [plansList, setPlansList] = React.useState<Plan[]>(PRICING_PLANS);
  const [userAssignedPlan, setUserAssignedPlan] = React.useState<string | null>(null);
  const [userSubscriptionPlanId, setUserSubscriptionPlanId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkUserPlan = () => {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u && u.plan) {
              setUserAssignedPlan(String(u.plan).toLowerCase().trim());
            } else if (u && u.subscriptionTier) {
              const tier = String(u.subscriptionTier).toLowerCase().trim();
              if (tier.includes('pro')) setUserAssignedPlan('pro');
              else if (tier.includes('starter')) setUserAssignedPlan('starter');
              else setUserAssignedPlan('free');
            } else {
              setUserAssignedPlan('free');
            }

            if (u && (u.subscriptionPlanId || u.subscription_plan_id)) {
              setUserSubscriptionPlanId(String(u.subscriptionPlanId || u.subscription_plan_id));
            }
          } catch (e) {}
        }
      };
      checkUserPlan();
      window.addEventListener('user-updated', checkUserPlan);
      window.addEventListener('storage', checkUserPlan);

      // Fetch dynamic plan configurations including active discounts
      const fetchPlans = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
          const res = await fetch(`${apiUrl}/subscription/plans`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              const updated = PRICING_PLANS.map((fallback) => {
                const dbPlan = json.data.find((p: any) => p.code?.toLowerCase() === fallback.code?.toLowerCase());
                if (!dbPlan) return fallback;

                const hasDiscount = dbPlan.isDiscountActive &&
                  dbPlan.discountPriceMonthly > 0 &&
                  dbPlan.discountPriceMonthly < dbPlan.priceMonthly;

                return {
                  ...fallback,
                  _id: dbPlan._id ? String(dbPlan._id) : undefined,
                  name: dbPlan.name || fallback.name,
                  description: dbPlan.description || fallback.subtitle,
                  creditsBadge: `${dbPlan.credits} credits`,
                  numericPrice: hasDiscount ? dbPlan.discountPriceMonthly : dbPlan.priceMonthly,
                  originalPrice: hasDiscount ? dbPlan.priceMonthly : undefined,
                  isDiscountActive: hasDiscount,
                  discountBadge: hasDiscount
                    ? `SAVE $${(dbPlan.priceMonthly - dbPlan.discountPriceMonthly).toFixed(0)}`
                    : fallback.discountBadge,
                  popular: dbPlan.isPopular !== undefined ? Boolean(dbPlan.isPopular) : (dbPlan.popular !== undefined ? Boolean(dbPlan.popular) : fallback.popular),
                  isPopular: dbPlan.isPopular !== undefined ? Boolean(dbPlan.isPopular) : (dbPlan.popular !== undefined ? Boolean(dbPlan.popular) : fallback.popular),
                  features: Array.isArray(dbPlan.features) && dbPlan.features.length > 0 ? dbPlan.features : fallback.features,
                };
              });
              setPlansList(updated);
            }
          }
        } catch (e) {
          // Keep default plans
        }
      };

      fetchPlans();

      return () => {
        window.removeEventListener('user-updated', checkUserPlan);
        window.removeEventListener('storage', checkUserPlan);
      };
    }
  }, []);

  return (
    <section
      id="pricing"
      className="subscription-plans-section relative w-full py-20 sm:py-28 bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 border-y border-[#4f46e5]/15 dark:border-[#4f46e5]/30 text-slate-900 dark:text-white selection:bg-indigo-600 selection:text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-800 dark:text-indigo-300 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Simple, Transparent Pricing</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight"
          >
            Invest in{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Transformative
            </span>{' '}
            Design
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto"
          >
            Choose the plan that best fits your design needs. Upgrade or cancel anytime.
          </motion.p>
        </div>

        {/* 3-Column Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plansList.map((plan, index) => {
            const isPopular = Boolean(plan.popular || (plan as any).isPopular || plan.code?.toLowerCase() === 'starter' || plan.id?.toLowerCase() === 'starter');
            return (
              <motion.div
                key={plan.id || plan.code}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                data-popular={isPopular ? 'true' : 'false'}
                style={
                  isPopular
                    ? {
                        border: '2px solid var(--primary)',
                        borderColor: 'var(--primary)',
                        boxShadow: '0 0 20px -2px color-mix(in srgb, var(--primary) 35%, transparent), 0 8px 24px -4px rgba(0, 0, 0, 0.55)',
                      }
                    : undefined
                }
                className={`relative flex flex-col justify-between p-7 rounded-3xl transition-all duration-300 ${
                  isPopular
                    ? 'popular-pricing-card bg-white dark:bg-slate-900 border-2 border-[var(--primary)] scale-105 z-10'
                    : 'pricing-plan-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:shadow-2xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="popular-pricing-badge absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

              {/* Top Plan Info */}
              <div className="space-y-5">
                <div className="text-center pt-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-heading">{plan.name}</h3>
                  <p className="pricing-plan-subtitle text-xs text-slate-500 dark:text-slate-300 mt-1 font-medium">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="text-center py-2 space-y-1">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {plan.isDiscountActive && plan.originalPrice && plan.originalPrice > plan.numericPrice && (
                      <span className="line-through text-slate-400 dark:text-slate-500 text-2xl font-bold font-heading">
                        {formatPrice(plan.originalPrice)}
                      </span>
                    )}
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                      {formatPrice(plan.numericPrice)}
                    </span>
                    {plan.discountBadge && (
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                        plan.isDiscountActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 animate-pulse'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {plan.discountBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">per month</span>
                </div>

                {/* Sleek Modern Credit Token Badge */}
                <div className="pricing-coin-badge p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/15 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-300/60 dark:border-amber-700/50 flex items-center justify-start gap-3 shadow-xs transition-all">
                  <div className="pricing-coin-icon-box relative z-1 p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 transition-all">
                    <CreditTokenIcon size="md" />
                  </div>
                  <div className="text-left relative z-1">
                    <div className="text-sm font-black text-slate-900 dark:text-white font-heading tracking-tight">
                      {plan.creditsBadge}
                    </div>
                    <div className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      AI Tokens Allocated
                    </div>
                  </div>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-3 pt-2">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Call-to-Action Button */}
              <div className="pt-8">
                {(() => {
                  const planRanks: Record<string, number> = { free: 0, starter: 1, pro: 2 };
                  const userCode = userAssignedPlan ? userAssignedPlan.toLowerCase().trim() : '';
                  const userRank = userCode ? (planRanks[userCode] ?? 0) : -1;
                  const thisRank = planRanks[plan.code.toLowerCase()] ?? 0;

                  const isCurrent = Boolean(
                    (userSubscriptionPlanId && plan._id && userSubscriptionPlanId === plan._id) ||
                    (userAssignedPlan && (
                      userAssignedPlan === plan.code.toLowerCase() ||
                      userAssignedPlan === plan.id.toLowerCase()
                    ))
                  );

                  // 1. Current Plan Button: Solid primary with checkmark icon
                  if (isCurrent) {
                    return (
                      <button
                        disabled
                        className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase bg-primary text-white shadow-lg shadow-primary/25 border border-primary/30 cursor-default flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                        <span>Current Plan</span>
                      </button>
                    );
                  }

                  // 2. Free Plan (when not current): Normal border with primary text and white/lite background
                  if (plan.code.toLowerCase() === 'free') {
                    return (
                      <Link href="/checkout?plan=free">
                        <button
                          className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer border-2 border-primary text-primary bg-white dark:bg-slate-900 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-xs hover:shadow-md hover:scale-[1.01]"
                        >
                          Get Started
                        </button>
                      </Link>
                    );
                  }

                  // 3. Upgrade Plan (higher tier than user's active plan): Shows "Upgrade to [Plan]" with vibrant gradient
                  const isUpgrade = userRank >= 0 && thisRank > userRank;
                  if (isUpgrade) {
                    const planShortName = plan.name.replace(' Plan', '');
                    return (
                      <Link href={`/checkout?plan=${plan.code}`}>
                        <button
                          className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <span>Upgrade to {planShortName}</span>
                          <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
                        </button>
                      </Link>
                    );
                  }

                  // 4. Default Popular Plan (e.g. Starter Plan when visitor or downgrade)
                  if (plan.popular) {
                    return (
                      <Link href={`/checkout?plan=${plan.code}`}>
                        <button
                          className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02]"
                        >
                          Get Started
                        </button>
                      </Link>
                    );
                  }

                  // 5. Default Pro Plan
                  return (
                    <Link href={`/checkout?plan=${plan.code}`}>
                      <button
                        className="w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                      >
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
                      </button>
                    </Link>
                  );
                })()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}




