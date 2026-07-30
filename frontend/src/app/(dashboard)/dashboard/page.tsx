'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Crown,
  Heart,
  Folder,
  Wand2,
  Building2,
  Ruler,
  TrendingUp,
  Clock,
} from 'lucide-react';

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

      {/* CURRENT ACTIVE PLAN & CREDITS BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 overflow-hidden shadow-2xl shadow-blue-950/20 border border-white/10"
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user.plan}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Welcome back, <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-purple-300 bg-clip-text text-transparent">{user.name}</span>!
            </h1>

            <p className="text-sm text-slate-300 max-w-xl">
              You currently have <span className="font-extrabold text-amber-300">{user.credits} AI credits</span> available. Use them across all 20+ interior, exterior, and architectural AI tools.
            </p>
          </div>

          {/* Quick Credit Actions */}
          <div className="flex items-center gap-3">
            <a href="#pricing">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition-all focus:outline-none font-heading"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-current" />
                <span>Buy More Credits</span>
              </motion.button>
            </a>

            <Link href="/generate">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl backdrop-blur-md transition-all focus:outline-none font-heading"
              >
                <Wand2 className="w-4 h-4 text-blue-300" />
                <span>Start Designing</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* CHOOSE YOUR CREDITS PRICING SECTION (MATCHING USER REFERENCE DESIGN) */}
      <div id="pricing" className="space-y-8 pt-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs"
          >
            <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Simple, Transparent Pricing</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading"
          >
            Choose Your <span className="text-lime-600 dark:text-lime-400">Credits</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium"
          >
            Pay once, use anytime. No subscriptions, no hidden fees. Get access to all 20+ AI design tools with every purchase.
          </motion.p>
        </div>

        {/* 3 PRICING CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {CREDIT_PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all duration-300 ${
                plan.popular
                  ? 'bg-white dark:bg-slate-900 border-2 border-lime-500 dark:border-lime-500 shadow-2xl shadow-lime-500/15 scale-105 z-10'
                  : 'bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:shadow-2xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-lime-500 text-slate-950 font-extrabold text-xs px-4 py-1 rounded-full shadow-md font-heading">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center space-y-1 pt-2">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-heading">
                      {plan.price}
                    </span>
                    {plan.discountBadge && (
                      <span className="bg-lime-500/20 text-lime-700 dark:text-lime-400 text-xs font-extrabold px-2.5 py-0.5 rounded-md border border-lime-500/30">
                        {plan.discountBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 fill-current text-amber-500" />
                    <span>{plan.credits}</span>
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-lime-600 dark:text-lime-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buy Credits CTA Button */}
              <div className="pt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 font-heading ${
                    plan.popular
                      ? 'bg-lime-500 hover:bg-lime-600 text-slate-950 shadow-lime-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buy {plan.credits}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* YOUR DESIGNS & WISHLIST QUICK SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">

        {/* YOUR DESIGNS CARD */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Your Designs</h3>
            </div>
            <Link href="/history" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {RECENT_YOUR_DESIGNS.map((des) => (
              <div key={des.id} className="relative rounded-2xl overflow-hidden group border border-slate-100 dark:border-slate-800">
                <img src={des.image} alt={des.title} className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
                <div className="p-2.5 bg-white dark:bg-slate-900">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-heading">{des.title}</p>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Wishlist & Saved</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">3 Saved Items</span>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center space-y-3 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Save your favorite AI-generated room styles & inspiration to your wishlist.
            </p>
            <Link href="/generate" className="inline-block px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100 transition-colors">
              Explore & Save Styles
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
