'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  Crown,
  Heart,
  Folder,
  Wand2,
  ArrowRight,
  CreditCard,
  Building2,
  Ruler,
  Flower2,
} from 'lucide-react';

interface UserSession {
  name: string;
  email: string;
  credits: number;
  plan: string;
}

const QUICK_TOOLS = [
  {
    id: 'interior',
    name: 'Interior Design',
    desc: 'Redesign room furniture, wall paint & decor',
    icon: Wand2,
    href: '/generate?tool=interior-design',
    badge: 'Popular',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'exterior',
    name: 'Exterior Design',
    desc: 'Transform house facades & exterior architecture',
    icon: Building2,
    href: '/generate?tool=exterior-design',
    badge: 'Pro',
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'floorplan',
    name: 'Floor Plan Render',
    desc: 'Convert 2D line sketches into 3D interior renders',
    icon: Ruler,
    href: '/generate?tool=floor-plan-generator',
    badge: 'AI Render',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'garden',
    name: 'Garden & Landscape',
    desc: 'Redesign lawn grass, patios, and pergolas',
    icon: Flower2,
    href: '/generate?tool=landscape-design',
    badge: 'Outdoor',
    color: 'from-amber-500 to-orange-600',
  },
];

const CREDIT_PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect for trying AI room redesigns',
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
    tagline: 'Best value for regular AI design use',
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
    tagline: 'Designed for professional interior designers',
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
  const router = useRouter();
  const [user, setUser] = useState<UserSession>({
    name: 'User',
    email: '',
    credits: 40,
    plan: 'Free Plan',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.role && parsed.role.toLowerCase() === 'admin') {
            router.replace('/admin/dashboard');
            return;
          }
          setUser({
            name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User',
            email: parsed.email || '',
            credits: parsed.credits ?? 40,
            plan: parsed.plan ? `${parsed.plan.toUpperCase()} Plan` : 'Free Plan',
          });
        } catch {
          // fallback
        }
      }
    }
  }, [router]);


  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">

      {/* DASHBOARD HERO HEADER BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/15 overflow-hidden"
      >
        {/* Subtle Background Glow Spheres */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Welcome Back, {user.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight">
              AI Redesign & Digital Studio
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed">
              Transform your room photos instantly with 20+ AI design tools, camera lock, and architectural preservation.
            </p>
          </div>

          {/* Create New Redesign CTA */}
          <div className="flex items-center gap-3">
            <Link href="/generate">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="py-3 px-5 text-xs font-extrabold text-blue-900 bg-white hover:bg-blue-50 rounded-2xl shadow-lg shadow-black/10 transition-all flex items-center gap-2 font-heading"
              >
                <Wand2 className="w-4 h-4 text-blue-600" />
                <span>Create New Redesign</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* QUICK DESIGN TOOLS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
            Quick AI Tools
          </h2>
          <Link href="/tools" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <span>Explore All Tools</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {QUICK_TOOLS.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.id} href={tool.href}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xl shadow-slate-900/5 hover:border-blue-300 dark:hover:border-blue-800 transition-all space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* YOUR DESIGNS & WISHLIST QUICK SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* YOUR DESIGNS CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-900/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Your Designs</h3>
            </div>
            <Link href="/history" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {RECENT_YOUR_DESIGNS.map((des) => (
              <div key={des.id} className="relative rounded-2xl overflow-hidden group border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <img src={des.image} alt={des.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-2.5 bg-white dark:bg-slate-900">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate font-heading">{des.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{des.style}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WISHLIST FAVORITES CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-900/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Wishlist</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">3 Saved Items</span>
          </div>

          <div className="p-5 bg-gradient-to-br from-rose-50/50 to-pink-50/30 dark:from-slate-800/60 dark:to-slate-800/30 rounded-2xl text-center space-y-3 border border-rose-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Save your favorite AI room styles to wishlist.
            </p>
            <Link href="/dashboard/wishlist" className="inline-block px-4 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 transition-colors shadow-2xs">
              View Saved Wishlist
            </Link>
          </div>
        </div>

      </div>

      {/* CHOOSE YOUR CREDITS PRICING SECTION */}
      <div id="pricing" className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            Choose Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Credits</span>
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
                  ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 shadow-2xl shadow-blue-500/15'
                  : 'bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] px-3.5 py-0.5 rounded-full shadow-md font-heading">
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
                      <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 font-heading ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/25'
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
  );
}
