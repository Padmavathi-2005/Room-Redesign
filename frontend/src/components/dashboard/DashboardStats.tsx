'use client';

import React from 'react';
import Link from 'next/link';
import { Image as ImageIcon, FolderKanban, Zap, Heart, ArrowUpRight, Sparkles } from 'lucide-react';

interface DashboardStatsProps {
  totalDesigns?: number;
  activeProjects?: number;
  creditsLeft?: number;
  wishlistCount?: number;
}

export default function DashboardStats({
  totalDesigns = 24,
  activeProjects = 8,
  creditsLeft = 100,
  wishlistCount = 12,
}: DashboardStatsProps) {
  const STATS_CARDS = [
    {
      title: 'Total Designs',
      value: totalDesigns,
      subtitle: 'Rendered AI Spaces',
      href: '/designs',
      icon: ImageIcon,
      gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      badgeBg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      subtitle: 'In-Progress Redesigns',
      href: '/projects',
      icon: FolderKanban,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'Credits Available',
      value: creditsLeft,
      subtitle: 'Ready to Generate',
      href: '/pricing',
      icon: Zap,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      title: 'AI Studio Tools',
      value: 12,
      subtitle: 'Interior & Exterior',
      href: '/generate',
      icon: Sparkles,
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
            className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.gradient} rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100`} />

            <div className="flex items-center justify-between z-10">
              <div className={`p-3 rounded-2xl border ${stat.badgeBg} shadow-2xs`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/50 transition-all">
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
