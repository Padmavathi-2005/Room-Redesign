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
    <div className="p-3 sm:p-4 space-y-4">
      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Analytics & Revenue Console
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Time Range Selector */}
          <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100/80 shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="group rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">Total Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-1">
              ${data?.overview ? data.overview.totalRevenue.toLocaleString() : '0'}
            </div>
          </div>
        </div>

        {/* Monthly Recurring (MRR) */}
        <div className="group rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-violet-500" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">Monthly Recurring (MRR)</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-1">
              ${data?.overview ? data.overview.monthlyRecurringRevenue.toLocaleString() : '0'}
            </div>
          </div>
        </div>

        {/* AI Generations */}
        <div className="group rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-fuchsia-500" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">AI Generations</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Wand2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-1">
              {data?.overview?.activeGenerations ?? 0}
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="group rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-cyan-400" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">Conversion Rate</span>
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-1">
              {data?.overview?.conversionRate ?? '0.0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts & Style Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Generation Activity Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>AI Generations Activity ({timeRange.toUpperCase()})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Render requests per day in selected period</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-extrabold border border-slate-200/60">
                Peak: {peakRenders} renders/day
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2.5 pt-6 pb-2 px-2 border-b border-slate-100">
            {data?.generationsTrend.map((item, idx) => {
              const heightPercent = item.count > 0 ? Math.min(100, Math.max(15, (item.count / maxChartVal) * 100)) : 8;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-xs">
                    {item.count}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.03 }}
                    className={`w-full max-w-[36px] rounded-t-xl transition-all ${
                      item.count > 0
                        ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 shadow-sm group-hover:from-indigo-700 group-hover:to-purple-600'
                        : 'bg-slate-100'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-slate-500 mt-1 truncate max-w-[45px] text-center">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Design Styles Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
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
                    <span className="font-extrabold text-slate-700">{style.name}</span>
                    <span className="font-black text-indigo-600">{style.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/40">
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
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 font-heading">
              Global Credits Consumption & User Top-Tier Allocations
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-black text-slate-800 font-heading">
                <th className="py-3 px-4 rounded-l-xl">User Account</th>
                <th className="py-3 px-4">Active Plan</th>
                <th className="py-3 px-4 text-center">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Monthly Spent</th>
                <th className="py-3 px-4 text-center">Total Renders</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {userAllocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    No active user allocations found in database.
                  </td>
                </tr>
              ) : (
                userAllocations.map((user) => {
                  const firstName = user.firstName || '';
                  const lastName = user.lastName || '';
                  const fullName = `${firstName} ${lastName}`.trim() || 'User';
                  const initials = `${firstName[0] || 'U'}${lastName[0] || ''}`.toUpperCase();
                  const tier = (user.subscriptionTier || 'FREE').toUpperCase();
                  const roomCount = user.roomCount || 0;
                  const credits = user.credits ?? 0;

                  return (
                    <tr key={user._id || user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                          tier === 'PRO' || tier === 'PROFESSIONAL' || tier === 'PREMIUM'
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : tier === 'STARTER' || tier === 'STANDARD'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {tier} Plan
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <CreditTokenIcon size="xs" />
                          <span>{credits} Credits</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-900">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <CreditTokenIcon size="xs" />
                          <span>{roomCount * 4} Credits</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-600">
                        {roomCount} AI Renders
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase border border-emerald-100">
                          Active Account
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
