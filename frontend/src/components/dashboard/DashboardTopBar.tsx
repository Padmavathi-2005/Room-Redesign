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
    <div className="rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Left Greeting & Status */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t('dashboard.welcomeBack', { name: userName })}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>

          <span className="px-3 py-1 rounded-[10px] bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> {t('dashboard.aiEngineActive')}
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('dashboard.tagline')}
        </p>
      </div>

      {/* Right User Bar & Quick Action */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {/* Credits Counter Pill */}
        <Link
          href="/pricing"
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-extrabold hover:bg-amber-500/20 transition-all shadow-2xs"
        >
          <CreditTokenIcon size="sm" />
          <span className="text-amber-700 dark:text-amber-300 font-extrabold">
            {credits} {t('dashboard.credits')}
          </span>
        </Link>

        {/* Start Redesign Primary CTA */}
        <Link
          href="/generate"
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-primary hover:opacity-90 text-white text-xs font-extrabold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dashboard.newRedesign')}</span>
        </Link>
      </div>
    </div>
  );
}
