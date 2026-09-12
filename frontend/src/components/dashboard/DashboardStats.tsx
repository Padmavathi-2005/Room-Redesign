'use client';

import React from 'react';
import Link from 'next/link';
import { Image as ImageIcon, FolderKanban, ArrowUpRight, Sparkles } from 'lucide-react';
import { CreditTokenIcon } from '@/components/ui/CreditTokenIcon';
import { useTranslation } from '@/context/LanguageContext';

interface DashboardStatsProps {
  totalDesigns?: number;
  activeProjects?: number;
  creditsLeft?: number;
  wishlistCount?: number;
}

export default function DashboardStats({
  totalDesigns = 0,
  activeProjects = 0,
  creditsLeft = 0,
  wishlistCount = 0,
}: DashboardStatsProps) {
  const { t } = useTranslation();

  const STATS_CARDS = [
    {
      title: t('dashboard.stats.totalDesigns'),
      value: totalDesigns,
      subtitle: t('dashboard.stats.renderedAiSpaces'),
      href: '/designs',
      icon: ImageIcon,
      isCreditIcon: false,
      cardClass: 'stat-card-blue',
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-indigo-500/10 dark:to-transparent',
      badgeBg: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-400/35 dark:shadow-[0_0_14px_rgba(59,130,246,0.3)]',
    },
    {
      title: t('dashboard.stats.activeProjects'),
      value: activeProjects,
      subtitle: t('dashboard.stats.inProgressRedesigns'),
      href: '/projects',
      icon: FolderKanban,
      isCreditIcon: false,
      cardClass: 'stat-card-teal',
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-teal-500/20 dark:via-emerald-500/10 dark:to-transparent',
      badgeBg: 'bg-emerald-100 dark:bg-teal-500/15 text-emerald-600 dark:text-teal-300 border-emerald-200 dark:border-teal-400/35 dark:shadow-[0_0_14px_rgba(20,184,166,0.3)]',
    },
    {
      title: t('dashboard.stats.creditsAvailable'),
      value: creditsLeft,
      subtitle: t('dashboard.stats.readyToGenerate'),
      href: '/pricing',
      icon: null,
      isCreditIcon: true,
      cardClass: 'stat-card-amber',
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/25 dark:via-orange-500/10 dark:to-transparent',
      badgeBg: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-400/35 dark:shadow-[0_0_14px_rgba(245,158,11,0.3)]',
    },
    {
      title: t('dashboard.stats.aiStudioTools'),
      value: 12,
      subtitle: t('dashboard.stats.interiorExterior'),
      href: '/generate',
      icon: Sparkles,
      isCreditIcon: false,
      cardClass: 'stat-card-purple',
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-purple-500/20 dark:via-indigo-500/10 dark:to-transparent',
      badgeBg: 'bg-emerald-100 dark:bg-purple-500/15 text-emerald-600 dark:text-purple-300 border-emerald-200 dark:border-purple-400/35 dark:shadow-[0_0_14px_rgba(168,85,247,0.3)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS_CARDS.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link
            key={stat.title}
            href={stat.href}
            className={`dashboard-panel-card ${stat.cardClass} group relative p-5 rounded-2xl bg-white dark:bg-[#0D121F]/90 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between`}
          >
            <div className={`absolute top-0 ltr:right-0 ltr:rounded-bl-full rtl:left-0 rtl:rounded-br-full w-32 h-32 bg-gradient-to-bl rtl:bg-gradient-to-br ${stat.gradient} pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="flex items-center justify-between z-10">
              <div className={`p-3 rounded-xl border ${stat.badgeBg} shadow-2xs flex items-center justify-center`}>
                {stat.isCreditIcon ? (
                  <CreditTokenIcon size="md" />
                ) : (
                  Icon && <Icon className="w-5 h-5" />
                )}
              </div>
              <span className="p-1.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-transparent dark:border-purple-400/30 text-slate-400 dark:text-purple-300 group-hover:text-blue-600 dark:group-hover:text-white group-hover:bg-blue-50 dark:group-hover:bg-purple-500/30 dark:group-hover:border-purple-400/70 transition-all">
                <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>

            <div className="mt-4 space-y-1 z-10">
              <span className="text-3xl font-black font-heading text-slate-900 dark:text-white group-hover:dark:text-purple-100 tracking-tight transition-colors">
                {stat.value}
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.title}</p>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400">{stat.subtitle}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
