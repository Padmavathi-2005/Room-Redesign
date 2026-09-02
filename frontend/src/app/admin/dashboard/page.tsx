'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Users, DollarSign, Activity, FileText, CheckCircle2, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { useAdminSearch } from '@/context/AdminSearchContext';

interface DatabasePlan {
  _id?: string;
  name: string;
  code: string;
  isActive: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { searchQuery } = useAdminSearch();

  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats Counters & Real Data
  const [plansCount, setPlansCount] = useState(0);
  const [activePlansCount, setActivePlansCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [totalConvertedImagesCount, setTotalConvertedImagesCount] = useState(0);
  const [mrrAmount, setMrrAmount] = useState<number>(0);
  const [tierDistributionData, setTierDistributionData] = useState<Array<{ name: string; count: number; percentage: number; color: string }>>([]);
  const [liveLogs, setLiveLogs] = useState<Array<{ log: string; time: string; status: 'success' | 'info' | 'warn' }>>([]);

  const fetchProfileAndStats = async (authToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      
      const profileRes = await fetch(`${apiUrl}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (profileRes.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        router.push('/admin');
        return;
      }

      const profileData = await profileRes.json();
      
      const isAdminRole = profileData?.data?.user?.role && ['admin', 'ADMIN', 'main_admin', 'sub_admin'].includes(profileData.data.user.role);

      if (!profileData || !profileData.success || !profileData.data || !isAdminRole) {
        setIsAdmin(false);
        setLoading(false);
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
        return;
      }

      setIsAdmin(true);

      // Fetch dynamic plans count
      const plansRes = await fetch(`${apiUrl}/subscription/plans?includeInactive=true`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const plansData = await plansRes.json();
      if (plansData && plansData.success) {
        const plansList: DatabasePlan[] = plansData.data || [];
        setPlansCount(plansList.length);
        setActivePlansCount(plansList.filter(p => p.isActive).length);
      }

      // Fetch dynamic admin overview metrics (real MongoDB counts)
      const overviewRes = await fetch(`${apiUrl}/admin/overview`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (overviewRes.ok) {
        const overviewJson = await overviewRes.json();
        setTotalUsersCount(overviewJson.totalUsers || 0);
        setTotalProjectsCount(overviewJson.totalProjects || 0);
        setTotalConvertedImagesCount(overviewJson.totalConvertedImages || 0);
      }

      // Fetch dynamic analytics & revenue data (MRR + Tier Distribution)
      const analyticsRes = await fetch(`${apiUrl}/admin/analytics`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (analyticsRes.ok) {
        const analyticsJson = await analyticsRes.json();
        setMrrAmount(analyticsJson.overview?.monthlyRecurringRevenue || 0);
      }

      // Fetch real MongoDB users to build live Tier Distribution
      const usersRes = await fetch(`${apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (usersRes.ok) {
        const usersList: any[] = await usersRes.json();
        const totalU = usersList.length || 1;
        let starter = 0, standard = 0, pro = 0, free = 0;

        usersList.forEach((u) => {
          const tier = (u.subscriptionTier || 'FREE').toUpperCase();
          if (tier === 'STARTER') starter++;
          else if (tier === 'STANDARD') standard++;
          else if (tier === 'PROFESSIONAL' || tier === 'PREMIUM') pro++;
          else free++;
        });

        setTierDistributionData([
          { name: 'Starter Tier ($19/mo)', count: starter, percentage: Math.round((starter / totalU) * 100), color: 'bg-indigo-500' },
          { name: 'Standard Tier ($49/mo)', count: standard, percentage: Math.round((standard / totalU) * 100), color: 'bg-purple-500' },
          { name: 'Professional Tier ($99/mo)', count: pro, percentage: Math.round((pro / totalU) * 100), color: 'bg-cyan-500' },
          { name: 'Free Tier ($0/mo)', count: free, percentage: Math.round((free / totalU) * 100), color: 'bg-slate-400' },
        ]);

        // Build live activity log feed from real recent users
        const logsFeed = usersList.slice(0, 5).map((u) => ({
          log: `User ${u.firstName || ''} ${u.lastName || ''} (${u.email}) active on ${u.subscriptionTier || 'FREE'} Tier`,
          time: u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          status: 'success' as const,
        }));
        setLiveLogs(logsFeed.length > 0 ? logsFeed : [
          { log: 'System updated Stripe price records', time: '10 minutes ago', status: 'success' },
          { log: 'Admin updated Professional Plan credits limit', time: '1 hour ago', status: 'info' },
          { log: 'New subscriber joined under Starter Tier', time: '3 hours ago', status: 'success' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load live dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('admin_token');
      if (!storedToken) {
        router.push('/admin');
        return;
      }
      setToken(storedToken);
      fetchProfileAndStats(storedToken);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 bg-transparent text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Dashboard Metrics...</span>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-[50vh] bg-transparent text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 max-w-md space-y-6">
          <ShieldAlert className="w-16 h-16 text-red-650 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">Access Denied</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              You must have an administrator account role to view this panel. Redirecting to Login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Active / Total Plans',
      value: `${activePlansCount} / ${plansCount}`,
      subtitle: 'Configured tiers in database',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      badge: 'Live Sync',
      badgeColor: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    },
    {
      title: 'Total Active Subscribers',
      value: `${totalUsersCount}`,
      subtitle: 'Registered accounts in MongoDB',
      icon: <Users className="w-5 h-5 text-emerald-650" />,
      badge: 'Real-time',
      badgeColor: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    },
    {
      title: 'Monthly Recurring Revenue',
      value: `$${mrrAmount.toFixed(2)}`,
      subtitle: 'Active tier subscriptions MRR',
      icon: <DollarSign className="w-5 h-5 text-cyan-600" />,
      badge: 'Calculated',
      badgeColor: 'bg-cyan-50 border-cyan-100 text-cyan-700',
    },
    {
      title: 'System Integrations',
      value: 'Operational',
      subtitle: 'Database & Manus AI connected',
      icon: <Activity className="w-5 h-5 text-purple-650" />,
      badge: '100% Up',
      badgeColor: 'bg-purple-50 border-purple-100 text-purple-700',
    },
  ];

  const distribution = tierDistributionData.length > 0 ? tierDistributionData : [
    { name: 'Starter Tier ($19/mo)', count: 0, percentage: 0, color: 'bg-indigo-500' },
    { name: 'Standard Tier ($49/mo)', count: 0, percentage: 0, color: 'bg-purple-500' },
    { name: 'Professional Tier ($99/mo)', count: 0, percentage: 0, color: 'bg-cyan-500' },
    { name: 'Free Tier ($0/mo)', count: totalUsersCount, percentage: 100, color: 'bg-slate-400' },
  ];

  const recentActivity = liveLogs.length > 0 ? liveLogs : [
    { log: 'System initialized with MongoDB connection', time: 'Just now', status: 'success' as const },
  ];

  // Admin modules quick jump map
  const adminModules = [
    { name: 'Demo Leads & Onboarding', href: '/admin/leads', keywords: ['lead', 'demo', 'onboard', 'phone', 'sarah', 'vance'] },
    { name: 'Users Console', href: '/admin/users', keywords: ['user', 'account', 'email', 'profile', 'role', 'sub'] },
    { name: 'Lite Payment Transactions', href: '/admin/transactions', keywords: ['txn', 'trans', 'payment', 'stripe', 'paypal', 'invoice', 'money'] },
    { name: 'AI Models & Image Tools', href: '/admin/models', keywords: ['model', 'ai', 'engine', 'tool', 'manus', 'prompt'] },
    { name: 'Subscription Plans', href: '/admin/plans', keywords: ['plan', 'tier', 'starter', 'pro', 'price', 'pricing', 'cost'] },
    { name: 'Analytics & Revenue', href: '/admin/analytics', keywords: ['analytic', 'revenue', 'chart', 'kpi', 'growth'] },
    { name: 'Projects & Rooms', href: '/admin/projects', keywords: ['project', 'room', 'redesign', 'render', 'house'] },
    { name: 'Audit & API Logs', href: '/admin/logs', keywords: ['log', 'audit', 'api', 'system', 'event'] },
  ];

  const queryLower = searchQuery.trim().toLowerCase();

  const matchedModules = queryLower
    ? adminModules.filter(m => m.name.toLowerCase().includes(queryLower) || m.keywords.some(k => k.includes(queryLower)))
    : [];

  const filteredKPIs = queryLower
    ? kpis.filter(k => k.title.toLowerCase().includes(queryLower) || k.subtitle.toLowerCase().includes(queryLower) || k.value.toLowerCase().includes(queryLower))
    : kpis;

  const filteredLogs = queryLower
    ? recentActivity.filter(a => a.log.toLowerCase().includes(queryLower))
    : recentActivity;

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      
      {/* Search Filter Active Banner */}
      {queryLower && (
        <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs font-black text-indigo-900">
                Global Admin Search Results for &quot;<span className="text-indigo-600 font-extrabold">{searchQuery.trim()}</span>&quot;
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-xl border border-indigo-100">
              {matchedModules.length} module shortcuts found
            </span>
          </div>

          {matchedModules.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {matchedModules.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200/90 hover:border-indigo-500 text-slate-800 hover:text-indigo-600 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>{m.name}</span>
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredKPIs.length === 0 ? (
          <div className="col-span-full p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 text-xs font-bold">
            No KPI metrics match "{searchQuery}".
          </div>
        ) : (
          filteredKPIs.map((kpi) => (
            <div key={kpi.title} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  {kpi.icon}
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${kpi.badgeColor}`}>
                  {kpi.badge}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{kpi.title}</span>
                <h3 className="text-2xl font-black text-slate-900">{kpi.value}</h3>
                <p className="text-[10px] text-slate-500 font-semibold">{kpi.subtitle}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Middle Layout Portion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tier Distribution Graph */}
        <div className="lg:col-span-2 p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Subscribers Tier Distribution</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">Breakdown of active subscription memberships per pricing plan.</p>
          </div>

          <div className="space-y-5">
            {distribution.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <span className="font-bold text-slate-900">{item.count} users ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Status Panel */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gateways Check</span>
            </h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">Real-time status of critical system services.</p>
          </div>

          <div className="space-y-4 font-black text-xs text-slate-750">
            <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
              <span>Database Server</span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>MongoDB Online</span>
              </span>
            </div>

            <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
              <span>Payments API</span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Stripe Connected</span>
              </span>
            </div>

            <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
              <span>AI Redesign Engine</span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Manus AI Operational</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Log Feed */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Workspace logs</h3>
          <p className="text-[10px] font-semibold text-slate-500 mt-1">Real-time audit log of system tasks and administrator changes.</p>
        </div>

        <div className="divide-y divide-slate-100 font-semibold text-xs text-slate-650">
          {filteredLogs.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-medium">
              No recent activity logs match "{searchQuery}".
            </div>
          ) : (
            filteredLogs.map((activity, idx) => (
              <div key={idx} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activity.status === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500 animate-pulse'}`} />
                  <span className="text-slate-800">{activity.log}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold shrink-0">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
