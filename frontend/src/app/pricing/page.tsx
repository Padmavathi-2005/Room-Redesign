'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, HelpCircle, Sparkles, Zap, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { paymentService } from '../../services/payment.service';

interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  description: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
  icon: React.ReactNode;
  gradient: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const getIcon = (code: string) => {
    switch (code.toLowerCase()) {
      case 'free':
        return <HelpCircle className="w-6 h-6 text-slate-400" />;
      case 'starter':
        return <Zap className="w-6 h-6 text-blue-400" />;
      case 'standard':
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
      case 'professional':
        return <Shield className="w-6 h-6 text-purple-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
    }
  };

  const getGradient = (code: string) => {
    switch (code.toLowerCase()) {
      case 'free':
        return 'from-slate-800 to-slate-900';
      case 'starter':
        return 'from-blue-600/20 to-indigo-600/10';
      case 'standard':
        return 'from-indigo-600/40 via-purple-600/20 to-pink-600/5';
      case 'professional':
        return 'from-purple-900/30 to-pink-900/10';
      default:
        return 'from-slate-800 to-slate-900';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);

      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.plan) {
            setCurrentPlan(parsed.plan.toLowerCase());
          }
        } catch (e) {
          // ignore
        }
      }
    }

    const fetchPlans = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/subscription/plans`);
        const result = await res.json();
        if (result && result.success && Array.isArray(result.data)) {
          const mapped = result.data.map((p: any) => ({
            id: p.code,
            name: p.name,
            priceMonthly: p.priceMonthly,
            priceAnnual: p.priceAnnual,
            credits: p.credits,
            description: p.description,
            features: p.features || [],
            popular: p.isPopular,
            icon: getIcon(p.code),
            gradient: getGradient(p.code),
            ctaText: p.code === 'free' ? 'Get Started Free' : `Upgrade to ${p.name}`,
          }));
          setPlans(mapped);
        }
      } catch (err) {
        console.error('Failed to load plans from DB:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      router.push('/dashboard');
      return;
    }

    if (!isLoggedIn) {
      router.push(`/login?redirect=/pricing`);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingPlan(planId);
      const response = await paymentService.createCheckoutSession(planId, billingCycle, token);
      if (response && response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert('Failed to launch Stripe checkout. Try mock activation or verify server logs.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating payment session.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 py-24 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pricing & Credits</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-heading">
            Simple, Transparent <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Acquire monthly generation credits to produce premium designs. Upgrade or cancel anytime.
          </p>

          {/* Cycle Toggle */}
          <div className="flex justify-center pt-8">
            <div className="relative p-1 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center shadow-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-black border border-indigo-500/30">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading Available Plans...</span>
          </div>
        ) : (
          /* Pricing Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 items-stretch">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
              const savings = plan.priceMonthly * 12 - plan.priceAnnual * 12;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-8 backdrop-blur-md bg-slate-900/30 border transition-all duration-300 group ${
                    plan.popular
                      ? 'border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 right-8 -translate-y-1/2">
                      <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow border border-indigo-400/20">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Content */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">{plan.name}</h3>
                        <p className="text-[11px] font-bold text-slate-500">{plan.credits} Credits / mo</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-normal min-h-[36px]">
                      {plan.description}
                    </p>

                    <div className="pt-2">
                      <div className="flex items-baseline gap-1 text-white">
                        <span className="text-3xl font-black">$</span>
                        <span className="text-5xl font-black tracking-tight">{price}</span>
                        <span className="text-slate-400 text-xs font-semibold">/mo</span>
                      </div>
                      {billingCycle === 'annual' && plan.priceAnnual > 0 && (
                        <p className="text-[10px] font-bold text-emerald-400 pt-1">
                          Billed annually (Save ${savings} / yr)
                        </p>
                      )}
                    </div>

                    <div className="border-t border-slate-800/60 pt-6">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                        What's Included
                      </p>
                      <ul className="space-y-3 text-xs text-slate-300 font-medium">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 stroke-[2.5]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-8">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrent || loadingPlan === plan.id}
                      className={`w-full py-3.5 px-4 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow shadow-indigo-600/30'
                          : 'bg-slate-900 border border-slate-700 hover:border-slate-600 text-white'
                      }`}
                    >
                      <span>
                        {loadingPlan === plan.id
                          ? 'Connecting...'
                          : isCurrent
                          ? 'Your Active Plan'
                          : plan.ctaText}
                      </span>
                      {!isCurrent && loadingPlan !== plan.id && (
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Comparison Block */}
        <div className="border-t border-slate-800 pt-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-white">Detailed Plan Matrix</h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold">Compare individual feature limits side-by-side</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-4 font-bold text-slate-400">Feature</th>
                  <th className="py-4 font-black text-white">Free</th>
                  <th className="py-4 font-black text-white">Starter</th>
                  <th className="py-4 font-black text-indigo-400">Standard Pro</th>
                  <th className="py-4 font-black text-white">Professional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                <tr>
                  <td className="py-4 font-semibold text-white">Credits Allowance</td>
                  <td className="py-4">40 Once</td>
                  <td className="py-4">200 /mo</td>
                  <td className="py-4 text-indigo-300">600 /mo</td>
                  <td className="py-4">1500 /mo</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Render Resolution</td>
                  <td className="py-4 text-slate-500">SD (768px)</td>
                  <td className="py-4">Full HD (1080p)</td>
                  <td className="py-4 text-indigo-300">4K Ultra-HD</td>
                  <td className="py-4">8K Extreme</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Active Projects</td>
                  <td className="py-4">1 Project</td>
                  <td className="py-4">5 Projects</td>
                  <td className="py-4 text-indigo-300">Unlimited</td>
                  <td className="py-4">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Support Channels</td>
                  <td className="py-4 text-slate-500">Community</td>
                  <td className="py-4">Email</td>
                  <td className="py-4 text-indigo-300">24/7 Chat & Email</td>
                  <td className="py-4">Dedicated Manager</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Pre-processing tools</td>
                  <td className="py-4 text-slate-500">None</td>
                  <td className="py-4">Standard</td>
                  <td className="py-4 text-indigo-300">Advanced ControlNet</td>
                  <td className="py-4">Full Override Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
