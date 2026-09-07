'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface PremiumAppLoaderProps {
  /** Size variant for loader: 'sm' (32px), 'md' (48px), 'lg' (64px) */
  size?: 'sm' | 'md' | 'lg';
  /** Optional label */
  label?: string;
  /** Full screen viewport overlay vs inline container layout */
  fullScreen?: boolean;
  /** Custom additional CSS classes */
  className?: string;
}

export default function PremiumAppLoader({
  size = 'md',
  label,
  fullScreen = false,
  className = '',
}: PremiumAppLoaderProps) {
  const sizeMap = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', border: 'border-2' },
    md: { box: 'w-12 h-12', icon: 'w-5 h-5', border: 'border-2' },
    lg: { box: 'w-16 h-16', icon: 'w-7 h-7', border: 'border-3' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const loaderGraphic = (
    <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
      <div className={`relative ${currentSize.box} flex items-center justify-center`}>
        {/* Sleek ring */}
        <div className={`absolute inset-0 rounded-full border-slate-200 dark:border-slate-800 ${currentSize.border}`} />
        <div className={`absolute inset-0 rounded-full border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent animate-spin ${currentSize.border}`} />
        {/* Center icon */}
        <Sparkles className={`${currentSize.icon} text-purple-600 dark:text-purple-400 animate-pulse`} />
      </div>

      {label && (
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#F3F5FF] dark:bg-[#0B0F17] flex items-center justify-center p-4 animate-in fade-in duration-200">
        {loaderGraphic}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 w-full h-full bg-transparent">
      {loaderGraphic}
    </div>
  );
}
