'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Zap, Sparkles, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { paymentService } from '../../../services/payment.service';

interface SubscriptionData {
  plan: string;
  credits: number;
  subscriptionStatus: string;
  subscriptionPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface DatabasePlan {
  name: string;
  code: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  description: string;
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Sandbox testing states
  const [sandboxPlan, setSandboxPlan] = useState<string>('starter');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSubscriptionStatus = async (userToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/subscription/status`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await res.json();
      if (data && data.success) {
        setSubscription(data.data);
        
        // Synchronize local storage user plan
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.plan = data.data.plan;
            parsed.credits = data.data.credits;
            localStorage.setItem('user', JSON.stringify(parsed));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  const fetchDatabasePlans = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/subscription/plans`);
      const result = await res.json();
      if (result && result.success && Array.isArray(result.data)) {
        setPlans(result.data);
        // Default select to first non-free plan
        const nonFree = result.data.find((p: any) => p.code !== 'free');
        if (nonFree) {
          setSandboxPlan(nonFree.code);
        }
      }
    } catch (err) {
      console.error('Failed to load database plans:', err);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          router.push('/login?redirect=/billing');
          return;
        }
        setToken(storedToken);
        
        // Parallel requests
        await Promise.all([
          fetchSubscriptionStatus(storedToken),
          fetchDatabasePlans(),
        ]);
        setLoading(false);

        // Handle Stripe & PayPal checkout success query params
        const sessionId = searchParams ? searchParams.get('session_id') : null;
        const mockSuccess = searchParams ? searchParams.get('mock') : null;
        const paypalOrderId = searchParams ? searchParams.get('paypal_order_id') : null;
        const planParam = searchParams ? searchParams.get('plan') : null;

        if (sessionId) {
          setSuccessMessage(
            mockSuccess
              ? 'Sandbox Mode: Your subscription has been mock-activated successfully!'
              : 'Payment received! Your Stripe subscription is now active and your credits have been provisioned.'
          );
          router.replace('/billing');
        } else if (paypalOrderId) {
          try {
            const captureRes = await paymentService.capturePayPalOrder(
              paypalOrderId,
              planParam || 'pro',
              storedToken,
            );
            if (captureRes && captureRes.success) {
              setSuccessMessage('PayPal payment captured successfully! Your plan and credits have been activated.');
              await fetchSubscriptionStatus(storedToken);
            }
          } catch (err) {
            console.error('Failed to capture PayPal order:', err);
          }
          router.replace('/billing');
        }
      }
    };
    initializeData();
  }, [searchParams]);

  const handleOpenStripePortal = async () => {
    if (!token) return;
    try {
      setActionLoading('portal');
      const response = await paymentService.createPortalSession(token);
      if (response && response.success && response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert(response.message || 'Stripe portal is unavailable (using mock Stripe credentials).');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to Stripe Billing Portal.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMockUpgrade = async () => {
    if (!token) return;
    try {
      setActionLoading('mock');
      const response = await paymentService.mockUpgrade(sandboxPlan, token);
      if (response && response.success) {
        setSuccessMessage(`Sandbox Success: Account successfully upgraded to ${sandboxPlan.toUpperCase()}!`);
        await fetchSubscriptionStatus(token);
      } else {
        alert('Failed to mock upgrade.');
      }
    } catch (err) {
      console.error(err);
      alert('Mock upgrade request failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanLimit = (planCode: string) => {
    const matched = plans.find((p) => p.code === planCode.toLowerCase());
    return matched ? matched.credits : 40;
  };

  const getPlanPrice = (planCode: string) => {
    const matched = plans.find((p) => p.code === planCode.toLowerCase());
    return matched ? `$${matched.priceMonthly.toFixed(2)}` : '$0.00';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Billing Details...</span>
      </div>
    );
  }

  const activePlan = subscription?.plan || 'free';
  const planLimit = getPlanLimit(activePlan);
  const creditsRemaining = subscription?.credits ?? 0;
  const creditsUsed = Math.max(0, planLimit - creditsRemaining);
  const progressPercent = Math.min(100, Math.round((creditsRemaining / planLimit) * 100));
  const activePlanPrice = getPlanPrice(activePlan);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 text-left">
      
      {/* Alert Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-start gap-3 shadow-md animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-extrabold text-white">Action Completed Successfully</p>
            <p className="font-normal mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Overview Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Billing & Subscription</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage your account tier, credit balances, and payment settings.
          </p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow transition-all shrink-0 w-fit cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>View Pricing Tiers</span>
        </Link>
      </div>

      {/* Grid: Plan Summary & Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active Subscription */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/30 border border-slate-800 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Plan</span>
              <span className={`px-2.5 py-0.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border ${
                subscription?.subscriptionStatus === 'active'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {subscription?.subscriptionStatus || 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white capitalize">
                {activePlan} Plan
              </h2>
              {subscription?.subscriptionPeriodEnd && (
                <p className="text-xs text-slate-400 font-semibold">
                  Renews on {new Date(subscription.subscriptionPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              )}
            </div>
            
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              You are subscribed to the {activePlan.toUpperCase()} tier. Subscriptions provide monthly automated credit allocations.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex flex-wrap gap-4">
            <button
              onClick={handleOpenStripePortal}
              disabled={actionLoading === 'portal' || activePlan === 'free'}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-white text-xs font-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>{actionLoading === 'portal' ? 'Opening...' : 'Manage Stripe Invoices'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Credits Remaining Gauge */}
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Credits</span>
            
            <div className="space-y-1">
              <div className="text-4xl font-black text-white">{creditsRemaining}</div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remaining of {planLimit} Limit</p>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>{progressPercent}% Available</span>
                <span>{creditsUsed} Used</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
            Credits are deducted when you request AI interior or exterior room redesign generations.
          </p>
        </div>

      </div>

      {/* Sandbox Test Console Widget */}
      {plans.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-dashed border-indigo-500/20 backdrop-blur-md space-y-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h3 className="font-extrabold text-white">Developer Sandbox Test Console</h3>
              <p className="text-slate-400 leading-relaxed font-normal">
                Stripe credentials may be configured as sandbox test keys locally. Use this panel to mock immediate credit refills and plan upgrades directly in your local MongoDB instance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <label htmlFor="sandboxPlanSelect" className="text-xs text-slate-400 font-bold">Select Tier:</label>
              <select
                id="sandboxPlanSelect"
                value={sandboxPlan}
                onChange={(e) => setSandboxPlan(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {plans.filter(p => p.code !== 'free').map(p => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.credits} Credits)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleMockUpgrade}
              disabled={actionLoading === 'mock'}
              className="px-4 py-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{actionLoading === 'mock' ? 'Upgrading...' : 'Mock Sandbox Upgrade'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Mock Records */}
      <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 backdrop-blur-md">
        <h3 className="text-sm font-black text-white mb-4">Invoice Ledger</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 font-bold text-slate-500">
                <th className="py-3">Invoice Number</th>
                <th className="py-3">Billing Term</th>
                <th className="py-3">Amount Paid</th>
                <th className="py-3">Method</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
              {activePlan !== 'free' ? (
                <tr>
                  <td className="py-4 font-mono font-bold text-indigo-400">INV-9824-{activePlan.substring(0,3).toUpperCase()}</td>
                  <td className="py-4">Monthly Renewal (Current cycle)</td>
                  <td className="py-4 font-bold text-white">
                    {activePlanPrice}
                  </td>
                  <td className="py-4 uppercase text-slate-400">Stripe Card</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                      Paid
                    </span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold leading-relaxed">
                    No billing history records found. Upgrade your plan to view invoices.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
