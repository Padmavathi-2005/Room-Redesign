'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CreditTokenIcon } from '../ui';

interface Plan {
  id: 'starter' | 'standard' | 'professional';
  name: string;
  subtitle: string;
  price: string;
  discountBadge?: string;
  creditsBadge: string;
  popular?: boolean;
  features: string[];
}

const PRICING_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Perfect for small sites & trying AI design',
    price: '$9.99',
    creditsBadge: '400 credits',
    features: [
      '400 AI Credits per month',
      'Generate up to 100 images',
      'HD watermark-free export',
      'All design permissions',
      'Commercial usage rights',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    subtitle: 'Perfect for regular AI design use',
    price: '$29.99',
    discountBadge: '25% OFF',
    creditsBadge: '1,600 credits',
    popular: true,
    features: [
      '1,600 AI Credits per month',
      'Generate up to 400 images',
      'HD watermark-free export',
      'All design permissions',
      'Commercial usage rights',
      'Priority render queue',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    subtitle: 'Perfect for professional AI design',
    price: '$99.99',
    discountBadge: '50% OFF',
    creditsBadge: '8,000 credits',
    features: [
      '8,000 AI Credits per month',
      'Generate up to 2000 images',
      'HD watermark-free export',
      'All design permissions',
      'Commercial usage rights',
      'Dedicated account manager',
    ],
  },
];

export default function SubscriptionPlans() {
  return (
    <section id="pricing" className="relative w-full pt-36 sm:pt-40 pb-20 bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 border-y border-[#4f46e5]/15 dark:border-[#4f46e5]/30 text-slate-900 dark:text-white selection:bg-indigo-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

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
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-heading"
          >
            Flexible Subscription Plans
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300"
          >
            Choose the plan that best fits your design needs. Upgrade or cancel anytime.
          </motion.p>
        </div>

        {/* 3-Column Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col justify-between p-7 rounded-3xl transition-all duration-300 ${
                plan.popular
                  ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-2xl shadow-indigo-500/15 scale-105 z-10'
                  : 'bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:shadow-2xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              {/* Top Plan Info */}
              <div className="space-y-5">
                <div className="text-center pt-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-heading">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="text-center py-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                      {plan.price}
                    </span>
                    {plan.discountBadge && (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
                        {plan.discountBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">per month</span>
                </div>

                {/* Sleek Modern Credit Token Badge */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/15 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-300/60 dark:border-amber-700/50 flex items-center justify-start gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                    <CreditTokenIcon size="md" />
                  </div>
                  <div className="text-left">
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
                <Link href="/signup">
                  <button
                    className={`w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 focus:outline-none cursor-pointer ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white shadow-md'
                    }`}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}




