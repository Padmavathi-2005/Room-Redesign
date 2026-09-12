'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Users,
  Wand2,
  Download,
  Calendar,
  Sparkles,
  BarChart2,
  PieChart,
  Activity,
  Layers,
} from 'lucide-react';

import { CreditTokenIcon } from '@/components/ui';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    activeGenerations: number;
    totalUsers: number;
    totalProjects: number;
    conversionRate: string;
  };
  generationsTrend: Array<{ label: string; count: number }>;
  popularStyles: Array<{ name: string; percentage: number }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [userAllocations, setUserAllocations] = useState<Array<Record<string, any>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || localStorage.getItem('token') : '';

      const [analyticsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/admin/analytics?range=${timeRange}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        setData(json);
      }

      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        setUserAllocations(usersJson);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = `data:text/csv;charset=utf-8,ANALYTICS & REVENUE REPORT (${timeRange.toUpperCase()})\n`;
    csvContent += `Metric,Value\n`;
    csvContent += `Total Revenue,$${data?.overview?.totalRevenue ?? 0}\n`;
    csvContent += `Monthly Recurring Revenue (MRR),$${data?.overview?.monthlyRecurringRevenue ?? 0}\n`;
    csvContent += `Active AI Generations,${data?.overview?.activeGenerations ?? 0}\n`;
    csvContent += `Total Users,${data?.overview?.totalUsers ?? 0}\n`;
    csvContent += `Total Projects,${data?.overview?.totalProjects ?? 0}\n`;
    csvContent += `Paid Conversion Rate,${data?.overview?.conversionRate ?? '0.0%'}\n\n`;

    csvContent += `POPULAR DESIGN STYLES\nStyle Name,Percentage\n`;
    (data?.popularStyles || []).forEach((s) => {
      csvContent += `"${s.name}",${s.percentage}%\n`;
    });

    csvContent += `\nUSER ALLOCATIONS & CREDIT CONSUMPTION\nUser,Email,Subscription Tier,Remaining Credits,Total Renders\n`;
    (userAllocations || []).forEach((u) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User';
      csvContent += `"${name}","${u.email}",${u.subscriptionTier || 'FREE'},${u.credits ?? 0},${u.roomCount ?? 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_report_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const peakRenders = Math.max(...(data?.generationsTrend?.map((t) => t.count) || [0]), 0);
  const maxChartVal = Math.max(peakRenders, 1);

  return (
    <div className="p-3 sm:p-4 space-y-5">
      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Analytics & Revenue Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Platform performance, user allocations, and revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Time Range Selector */}
          <div className="inline-flex p-1 rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs font-semibold text-slate-600 dark:text-slate-300">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-indigo-50 dark:bg-indigo-600 text-indigo-600 dark:text-white font-extrabold border border-indigo-100/80 dark:border-indigo-500 shadow-2xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/25 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div
          data-kpi="revenue"
          className="admin-kpi-card group relative rounded-2xl p-5 bg-white dark:bg-[#0E131F]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400 absolute top-0 left-0 right-0" />
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Revenue</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading mt-1">
              ${data?.overview ? data.overview.totalRevenue.toLocaleString() : '0'}
            </div>
          </div>
        </div>

        {/* Monthly Recurring (MRR) */}
        <div
          data-kpi="mrr"
          className="admin-kpi-card group relative rounded-2xl p-5 bg-white dark:bg-[#0E131F]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-violet-500 absolute top-0 left-0 right-0" />
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Monthly Recurring (MRR)</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading mt-1">
              ${data?.overview ? data.overview.monthlyRecurringRevenue.toLocaleString() : '0'}
            </div>
          </div>
        </div>

        {/* AI Generations */}
        <div
          data-kpi="generations"
          className="admin-kpi-card group relative rounded-2xl p-5 bg-white dark:bg-[#0E131F]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 absolute top-0 left-0 right-0" />
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">AI Generations</span>
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80 shadow-2xs">
                <Wand2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading mt-1">
              {data?.overview?.activeGenerations ?? 0}
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div
          data-kpi="conversion"
          className="admin-kpi-card group relative rounded-2xl p-5 bg-white dark:bg-[#0E131F]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-cyan-400 absolute top-0 left-0 right-0" />
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Conversion Rate</span>
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-800/80 shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading mt-1">
              {data?.overview?.conversionRate ?? '0.0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts & Style Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Generation Activity Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0E131F]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Generations Activity ({timeRange.toUpperCase()})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Render requests per day in selected period</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-indigo-950/70 text-slate-600 dark:text-indigo-300 text-[11px] font-extrabold border border-slate-200/70 dark:border-indigo-800/80 shadow-2xs">
                Peak: {peakRenders} renders/day
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2.5 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800/80">
            {data?.generationsTrend.map((item, idx) => {
              const heightPercent = item.count > 0 ? Math.min(100, Math.max(15, (item.count / maxChartVal) * 100)) : 8;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-100 dark:border-indigo-800/80 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-xs">
                    {item.count}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.03 }}
                    className={`w-full max-w-[36px] rounded-t-xl transition-all ${
                      item.count > 0
                        ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 shadow-md group-hover:from-indigo-700 group-hover:to-purple-600 shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/40 border border-transparent dark:border-slate-800/60'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[45px] text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Design Styles Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0E131F]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Popular Style Renders</span>
            </h2>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-4 pt-2">
            {data?.popularStyles.map((style, idx) => {
              const gradient =
                idx === 0
                  ? 'from-purple-600 to-indigo-600'
                  : idx === 1
                  ? 'from-indigo-500 to-cyan-500'
                  : idx === 2
                  ? 'from-emerald-500 to-teal-500'
                  : idx === 3
                  ? 'from-amber-500 to-orange-500'
                  : 'from-slate-400 to-slate-600';

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">{style.name}</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{style.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${style.percentage}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Global Credit Consumption & User Allocation Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0E131F]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white font-heading">
              Global Credits Consumption &amp; User Top-Tier Allocations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live subscription memberships, credit reserves, and AI generation load per account
            </p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200 font-heading">
                <th className="py-3 px-4 rounded-l-xl">User Account</th>
                <th className="py-3 px-4">Active Plan</th>
                <th className="py-3 px-4 text-center">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Monthly Spent</th>
                <th className="py-3 px-4 text-center">Total Renders</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {userAllocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No active user allocations found in database.
                  </td>
                </tr>
              ) : (
                userAllocations.map((user) => {
                  const firstName = user.firstName || '';
                  const lastName = user.lastName || '';
                  const fullName = `${firstName} ${lastName}`.trim() || 'User';
                  const initials = `${firstName[0] || 'U'}${lastName[0] || ''}`.toUpperCase();
                  const rawTier = (user.subscriptionTier || 'FREE').toUpperCase().replace(/\s*PLAN$/i, '').trim() || 'FREE';
                  const roomCount = user.roomCount || 0;
                  const credits = user.credits ?? 0;

                  return (
                    <tr key={user._id || user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-150 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{fullName}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                            rawTier === 'PRO' || rawTier === 'PROFESSIONAL' || rawTier === 'PREMIUM'
                              ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70'
                              : rawTier === 'STARTER' || rawTier === 'STANDARD'
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70'
                              : rawTier === 'ENTERPRISE' || rawTier === 'VIP'
                              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                          }`}
                        >
                          {rawTier} PLAN
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <CreditTokenIcon size="xs" />
                          <span>{credits} Credits</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <CreditTokenIcon size="xs" />
                          <span>{roomCount * 4} Credits</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {roomCount} AI Renders
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase border border-emerald-200 dark:border-emerald-800/70 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active Account</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
