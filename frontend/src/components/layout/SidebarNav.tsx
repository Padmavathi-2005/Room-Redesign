'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Heart,
  Zap,
  Settings,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Sparkles,
  Receipt,
} from 'lucide-react';

import { useTranslation } from '@/context/LanguageContext';

interface SidebarNavProps {
  className?: string;
  onToggleCollapse?: () => void;
}

export default function SidebarNav({ className = '', onToggleCollapse }: SidebarNavProps) {
  const { t } = useTranslation();
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const isHomeOrDashboard = pathname === '/' || pathname === '/dashboard';

  // Manage collapse state — default collapsed on sub-pages (instead of home/dashboard page), expanded on home/dashboard
  const [isCollapsed, setIsCollapsed] = useState<boolean>(!isHomeOrDashboard);
  const [userOverride, setUserOverride] = useState<boolean | null>(null);

  // Synchronize collapse state on route change
  useEffect(() => {
    setUserOverride(null);
    setIsCollapsed(!isHomeOrDashboard);
  }, [pathname, isHomeOrDashboard]);

  const effectiveCollapsed = userOverride !== null ? userOverride : isCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
    setUserOverride((prev) => (prev === null ? !isCollapsed : !prev));
  };

  const NAV_ITEMS: Array<{ label: string; href: string; icon: any; badge?: string }> = [
    { label: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('sidebar.myDesigns'), href: '/designs', icon: Sparkles },
    { label: t('sidebar.projects'), href: '/projects', icon: FolderKanban },
    { label: t('sidebar.notifications'), href: '/notifications', icon: Bell },
    { label: t('sidebar.wishlist'), href: '/wishlist', icon: Heart },
    { label: t('sidebar.creditsPlans'), href: '/billing', icon: Zap },
    { label: t('sidebar.transactions'), href: '/transactions', icon: Receipt },
    { label: t('sidebar.profileSettings'), href: '/profile', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: effectiveCollapsed ? 68 : 240 }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      className={`dashboard-sidebar-nav z-40 bg-white/95 dark:bg-[#0D121F]/98 backdrop-blur-2xl border border-slate-200/90 dark:border-2 dark:border-[#8B5CF6] rounded-2xl shadow-sm hover:shadow-md dark:shadow-[0_0_25px_-2px_rgba(139,92,246,0.45),0_16px_36px_rgba(0,0,0,0.8)] flex flex-col p-2 shrink-0 sticky top-[88px] self-start max-h-[calc(100vh-104px)] overflow-x-hidden overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {/* Navigation Links List */}
      <nav className="space-y-1.5 relative w-full flex flex-col items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          if (effectiveCollapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:bg-gradient-to-r dark:from-purple-600 dark:via-purple-700 dark:to-indigo-600 text-white dark:border dark:border-purple-300/40 dark:shadow-[0_4px_20px_-2px_rgba(124,58,237,0.55)] shadow-md shadow-blue-600/25 font-extrabold'
                    : 'text-slate-500 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-purple-600/20 dark:hover:text-white border border-transparent dark:hover:border-purple-500/50 dark:hover:shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white'
                  }`}
                />

                {/* Floating Tooltip in Collapsed Mode */}
                <div className="absolute ltr:left-full ltr:ml-3.5 rtl:right-full rtl:mr-3.5 rtl:ml-0 rtl:left-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-purple-700 dark:via-indigo-700 dark:to-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[100] flex items-center gap-2 border border-blue-400/40 dark:border-purple-400/30 backdrop-blur-md ltr:translate-x-1.5 rtl:-translate-x-1.5 group-hover:translate-x-0 font-sans">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-purple-700 rotate-45 absolute ltr:-left-1 rtl:-right-1 rtl:left-auto top-1/2 -translate-y-1/2 ltr:border-l ltr:border-b rtl:border-r rtl:border-t border-blue-400/40 dark:border-purple-400/30" />
                  <span className="relative z-10 font-sans">
                    {item.href === '/dashboard' ? t('sidebar.backToDashboard') : item.label}
                  </span>
                  {item.badge && (
                    <span className="relative z-10 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-900 shadow-xs font-sans">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:bg-gradient-to-r dark:from-purple-600 dark:via-purple-700 dark:to-indigo-600 text-white dark:border dark:border-purple-300/40 dark:shadow-[0_4px_20px_-2px_rgba(124,58,237,0.55)] shadow-md shadow-blue-600/25 font-extrabold'
                  : 'text-slate-600 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-purple-600/20 hover:text-slate-900 dark:hover:text-white border border-transparent dark:hover:border-purple-500/50 dark:hover:shadow-[0_0_12px_rgba(124,58,237,0.3)]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 ${
                    isActive
                      ? 'bg-white/20 dark:bg-white/20 text-white dark:border dark:border-white/30 shadow-xs'
                      : 'bg-slate-100/70 dark:bg-white/[0.06] dark:border dark:border-white/10 text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white group-hover:bg-blue-50 dark:group-hover:bg-purple-600/30 dark:group-hover:border-purple-400/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white'
                    }`}
                  />
                </div>

                <span className={`whitespace-nowrap overflow-hidden text-xs transition-colors duration-150 ${
                  isActive ? 'text-white font-extrabold' : 'text-slate-700 dark:text-slate-200 group-hover:dark:text-white font-semibold'
                }`}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ltr:ml-2 rtl:mr-2 ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Expand / Collapse Action Button at Bottom */}
      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-purple-500/25 w-full flex justify-center">
        {effectiveCollapsed ? (
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Expand sidebar"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100/70 dark:bg-transparent border border-slate-200/60 dark:border-transparent text-slate-500 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-purple-600/20 dark:hover:border-[#7C3AED]/50 transition-all cursor-pointer group relative"
          >
            <PanelLeftOpen className="w-4 h-4 transition-transform group-hover:scale-110 rtl:-scale-x-100" />
            <div className="absolute ltr:left-full ltr:ml-3.5 rtl:right-full rtl:mr-3.5 rtl:ml-0 rtl:left-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-purple-700 dark:via-indigo-700 dark:to-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[100] border border-blue-400/40 dark:border-purple-400/30 backdrop-blur-md font-sans">
              {t('sidebar.expand')}
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggle}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50/60 dark:bg-transparent dark:hover:bg-purple-600/20 border border-transparent dark:border-transparent dark:hover:border-[#7C3AED]/50 transition-all cursor-pointer group font-sans"
          >
            <div className="flex items-center gap-2.5 w-full">
              <PanelLeftClose className="w-4 h-4 text-slate-400 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white shrink-0 transition-transform group-hover:scale-110 rtl:-scale-x-100" />
              <span className="text-xs transition-opacity duration-300 font-semibold font-sans text-slate-600 dark:text-slate-200 group-hover:dark:text-white">
                {t('sidebar.minimize')}
              </span>
            </div>
          </button>
        )}
      </div>
    </motion.aside>
  );
}
