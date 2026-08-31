'use client';

import React from 'react';
import { Home, Sparkles } from 'lucide-react';

interface PremiumAppLoaderProps {
  /** Size variant for loader: 'sm' (inline button/card), 'md' (section), 'lg' (full screen page loader) */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading label text */
  label?: string;
  /** Full screen viewport overlay vs container layout */
  fullScreen?: boolean;
}

export default function PremiumAppLoader({
  size = 'md',
  label = 'Loading RoomAI...',
  fullScreen = false,
}: PremiumAppLoaderProps) {
  const content = (
    <div
      role="status"
      aria-label="Loading application..."
      className="flex flex-col items-center justify-center space-y-5 select-none"
    >
      <span className="sr-only">Loading...</span>

      {/* Floating Glassmorphic Brand Loader Card */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 shadow-xl backdrop-blur-2xl flex flex-col items-center space-y-4">
        {/* Soft Glowing Aura Background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600/10 via-indigo-600/10 to-purple-600/10 blur-xl pointer-events-none" />

        {/* Central RoomAI Brand Icon Box */}
        <div className="relative">
          {/* Outer Pulsing Glow Ring */}
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 opacity-30 blur-md animate-brand-pulse" />

          {/* Logo Box */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 border border-white/40 overflow-hidden">
            <Home className="w-6 h-6 stroke-[2.2] text-white" />
            <Sparkles className="absolute top-1.5 right-1.5 w-3 h-3 text-purple-200 animate-pulse" />
          </div>
        </div>

        {/* Subtle Progress Bar */}
        <div className="w-28 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <div className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 animate-laser-scan" />
        </div>

        {/* Clean Label */}
        <p className="text-xs font-extrabold tracking-tight text-slate-700 dark:text-slate-300 font-heading">
          {label}
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full bg-[#FAFBFD] dark:bg-[#0B0F17] flex items-center justify-center p-4 transition-colors duration-300">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4 w-full h-full">{content}</div>;
}
