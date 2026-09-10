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
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      badgeBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      title: t('dashboard.stats.activeProjects'),
      value: activeProjects,
      subtitle: t('dashboard.stats.inProgressRedesigns'),
      href: '/projects',
      icon: FolderKanban,
      isCreditIcon: false,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      title: t('dashboard.stats.creditsAvailable'),
      value: creditsLeft,
      subtitle: t('dashboard.stats.readyToGenerate'),
      href: '/pricing',
      icon: null,
      isCreditIcon: true,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      title: t('dashboard.stats.aiStudioTools'),
      value: 12,
      subtitle: t('dashboard.stats.interiorExterior'),
      href: '/generate',
      icon: Sparkles,
      isCreditIcon: false,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
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
            className="group relative p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.gradient} rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100`} />

            <div className="flex items-center justify-between z-10">
              <div className={`p-3 rounded-[10px] border ${stat.badgeBg} shadow-2xs flex items-center justify-center`}>
                {stat.isCreditIcon ? (
                  <CreditTokenIcon size="md" />
                ) : (
                  Icon && <Icon className="w-5 h-5" />
                )}
              </div>
              <span className="p-1.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4 space-y-1 z-10">
              <span className="text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.title}</p>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{stat.subtitle}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
