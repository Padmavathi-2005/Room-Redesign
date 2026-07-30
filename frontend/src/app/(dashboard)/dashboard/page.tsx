'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Crown,
  Heart,
  Folder,
  Wand2,
} from 'lucide-react';
import DashboardGeneratorFormCard from '@/components/dashboard/DashboardGeneratorFormCard';

interface UserSession {
  name: string;
  email: string;
  credits: number;
  plan: string;
}

const CREDIT_PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect for trying AI design',
    price: '$9.99',
    credits: '50 Credits',
    popular: false,
    discountBadge: null,
    features: [
      '50 High-Definition 4K Renders',
      'Access to 20+ AI Design Tools',
      'Standard Rendering Speed',
      'Commercial Usage License',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'Perfect for regular AI design use',
    price: '$29.99',
    credits: '200 Credits',
    popular: true,
    discountBadge: '25% OFF',
    features: [
      '200 High-Definition 4K Renders',
      'Access to 20+ AI Design Tools',
      'Ultra Fast 3-Second Rendering',
      'Priority Server Queue',
      'Export 4K & High-Res PDF',
      'Commercial License Included',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Perfect for professional AI design',
    price: '$99.99',
    credits: '800 Credits',
    popular: false,
    discountBadge: '50% OFF',
    features: [
      '800 High-Definition 4K Renders',
      'Access to ALL 20+ AI Tools & ERP',
      'Instant Dedicated AI Processing',
      'Dedicated Account Support',
      'Commercial & Client White-label',
      'Custom ERP Budget Exports',
    ],
  },
];

const RECENT_YOUR_DESIGNS = [
  {
    id: 'des-1',
    title: 'Modern Japandi Living Room',
    style: 'Japandi Minimalist',
    image: '/samples/japandi_living.png',
    date: 'Today',
  },
  {
    id: 'des-2',
    title: 'Sunlit Master Bedroom',
    style: 'Scandinavian Warmth',
    image: '/samples/bedroom_after.png',
    date: 'Yesterday',
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<UserSession>({
    name: 'Sangvish21',
    email: 'sangvish21@gmail.com',
    credits: 100,
    plan: 'Pro Plan Active',
  });
  const [selectedPlan, setSelectedPlan] = useState<string>('standard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({
            name: parsed.name
              ? parsed.name.charAt(0).toUpperCase() + parsed.name.slice(1)
              : 'Sangvish21',
            email: parsed.email || 'sangvish21@gmail.com',
            credits: parsed.credits ?? 100,
            plan: 'Pro Plan Active',
          });
        } catch {
          // fallback
        }
      }
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">



      {/* DASHBOARD MAIN GRID: LEFT SIDE AI GENERATOR FORM CARD | RIGHT SIDE DESIGNS & PRICING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDE: AI ROOM REDESIGN GENERATOR FORM CARD (5/12 width) */}
        <div className="lg:col-span-5 sticky top-6">
          <DashboardGeneratorFormCard />
        </div>

        {/* RIGHT SIDE: DESIGNS, WISHLIST & CHOOSE YOUR CREDITS PRICING (7/12 width) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* YOUR DESIGNS & WISHLIST QUICK SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* YOUR DESIGNS CARD */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Your Designs</h3>
                </div>
                <Link href="/history" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {RECENT_YOUR_DESIGNS.map((des) => (
                  <div key={des.id} className="relative rounded-2xl overflow-hidden group border border-slate-100 dark:border-slate-800">
                    <img src={des.image} alt={des.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-2 bg-white dark:bg-slate-900">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate font-heading">{des.title}</p>
                      <p className="text-[10px] text-slate-400">{des.style}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WISHLIST FAVORITES CARD */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Wishlist</h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">3 Saved Items</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center space-y-2.5 border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Save your favorite AI room styles to wishlist.
                </p>
                <Link href="/dashboard/wishlist" className="inline-block px-3.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100 transition-colors">
                  View Saved Wishlist
                </Link>
              </div>
            </div>

          </div>

          {/* CHOOSE YOUR CREDITS PRICING SECTION */}
          <div id="pricing" className="space-y-6 pt-4">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Simple, Transparent Pricing</span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                Choose Your <span className="text-lime-600 dark:text-lime-400">Credits</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Pay once, use anytime. No subscriptions or hidden fees.
              </p>
            </div>

            {/* PRICING CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-2">
              {CREDIT_PRICING_PLANS.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative flex flex-col justify-between p-6 rounded-3xl transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white dark:bg-slate-900 border-2 border-lime-500 dark:border-lime-500 shadow-2xl shadow-lime-500/15'
                      : 'bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-500 text-slate-950 font-extrabold text-[10px] px-3 py-0.5 rounded-full shadow-md font-heading">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                        {plan.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                          {plan.price}
                        </span>
                        {plan.discountBadge && (
                          <span className="bg-lime-500/20 text-lime-700 dark:text-lime-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-lime-500/30">
                            {plan.discountBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span>{plan.credits}</span>
                      </p>
                    </div>

                    <ul className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 font-heading ${
                        plan.popular
                          ? 'bg-lime-500 hover:bg-lime-600 text-slate-950 shadow-lime-500/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Buy {plan.credits}</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
