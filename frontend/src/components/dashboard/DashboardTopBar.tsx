'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bell, Zap, Plus, ArrowRight } from 'lucide-react';

interface DashboardTopBarProps {
  userName?: string;
  userEmail?: string;
  credits?: number;
  roleBadge?: string;
}

export default function DashboardTopBar({
  userName = 'Ananya',
  userEmail = 'ananya@example.com',
  credits = 100,
  roleBadge = 'Premium',
}: DashboardTopBarProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Left Greeting & Status */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {userName}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>

          <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> AI Engine Active
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          Transform your interior spaces with cutting-edge AI blueprinting & 3D render tools.
        </p>
      </div>

      {/* Right User Bar & Quick Action */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {/* Credits Counter Pill */}
        <Link
          href="/pricing"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-extrabold hover:bg-amber-500/20 transition-all shadow-2xs"
        >
          <Zap className="w-4 h-4 fill-current text-amber-500" />
          <span>{credits} Credits</span>
        </Link>


        {/* Start Redesign Primary CTA */}
        <Link
          href="/generate"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Redesign</span>
        </Link>
      </div>
    </div>
  );
}
