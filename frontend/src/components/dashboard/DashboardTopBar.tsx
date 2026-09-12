'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Plus } from 'lucide-react';
import { CreditTokenIcon } from '@/components/ui/CreditTokenIcon';
import { useTranslation } from '@/context/LanguageContext';

interface DashboardTopBarProps {
  userName?: string;
  userEmail?: string;
  credits?: number;
  roleBadge?: string;
}

export default function DashboardTopBar({
  userName = 'User',
  userEmail = 'user@example.com',
  credits = 0,
  roleBadge = 'Free',
}: DashboardTopBarProps) {
  const { t } = useTranslation();

  return (
    <div className="dashboard-panel-card dashboard-top-welcome rounded-2xl bg-white dark:bg-[#0D121F]/90 border border-slate-200/90 dark:border-2 dark:border-[#8B5CF6] p-5 sm:p-7 shadow-2xs dark:shadow-[0_0_25px_-2px_rgba(139,92,246,0.38),0_18px_45px_rgba(0,0,0,0.75)] flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Left Greeting & Status */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white dark:bg-gradient-to-r dark:from-white dark:via-purple-100 dark:to-indigo-200 dark:bg-clip-text dark:text-transparent tracking-tight flex items-center gap-2">
            <span>{t('dashboard.welcomeBack', { name: userName })}</span>
            <span className="inline-block animate-wave-hand">👋</span>
          </h1>

          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-purple-500/20 dark:text-purple-200 dark:border-purple-400/40 dark:shadow-[0_0_18px_rgba(168,85,247,0.45)] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary dark:text-purple-300 dark:fill-purple-300/40 animate-pulse" />
            <span>{t('dashboard.aiEngineActive')}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-300/90">
          {t('dashboard.tagline')}
        </p>
      </div>

      {/* Right User Bar & Quick Action */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {/* Credits Counter Pill */}
        <Link
          href="/pricing"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:bg-amber-500/15 dark:border-amber-400/40 dark:text-amber-300 dark:shadow-[0_0_16px_rgba(245,158,11,0.25)] text-xs font-extrabold hover:bg-amber-500/20 dark:hover:bg-amber-500/25 transition-all shadow-2xs group"
        >
          <CreditTokenIcon size="sm" />
          <span className="text-amber-700 dark:text-amber-300 font-extrabold">
            {credits} {t('dashboard.credits')}
          </span>
        </Link>

        {/* Start Redesign Primary CTA */}
        <Link
          href="/generate"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 dark:bg-gradient-to-r dark:from-purple-600 dark:via-indigo-600 dark:to-purple-700 dark:hover:from-purple-500 dark:hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-primary/20 dark:shadow-[0_0_24px_rgba(168,85,247,0.5)] dark:border dark:border-purple-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dashboard.newRedesign')}</span>
        </Link>
      </div>
    </div>
  );
}
