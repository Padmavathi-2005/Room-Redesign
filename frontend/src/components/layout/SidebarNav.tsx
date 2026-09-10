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
      animate={{ width: effectiveCollapsed ? 76 : 244 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className={`z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-[10px] shadow-sm hover:shadow-md flex flex-col p-2.5 shrink-0 sticky top-[84px] self-start h-fit ${className}`}
    >
      {/* Navigation Links List */}
      <nav className="space-y-1.5 relative">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-2 py-2 rounded-[10px] text-xs font-bold transition-all duration-200 relative group cursor-pointer ${
                effectiveCollapsed ? 'justify-center' : 'justify-between'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-600/25 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {/* Active Indicator Bar on Left Edge when Collapsed */}
              {isActive && effectiveCollapsed && (
                <motion.div
                  layoutId="activeSideBarBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full shadow-md shadow-blue-500/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="flex items-center gap-3 min-w-0">
                {/* Icon Container with Subtle Hover Glow */}
                <div
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:shadow-xs'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : ''
                    }`}
                  />
                </div>

                {/* Animated Text Label with Slide & Fade */}
                <AnimatePresence initial={false}>
                  {!effectiveCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 'auto' }}
                      exit={{ opacity: 0, x: -10, width: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="whitespace-nowrap overflow-hidden font-bold text-xs font-sans"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Badge when expanded */}
              <AnimatePresence initial={false}>
                {item.badge && !effectiveCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ml-2 ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* High Z-Index Premium Floating Tooltip in Collapsed Mode */}
              {effectiveCollapsed && (
                <div className="absolute left-full ml-3.5 px-3.5 py-2 rounded-[10px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-extrabold whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[100] flex items-center gap-2 border border-blue-400/40 backdrop-blur-md translate-x-1.5 group-hover:translate-x-0 font-sans">
                  <div className="w-2 h-2 bg-blue-600 rotate-45 absolute -left-1 top-1/2 -translate-y-1/2 border-l border-b border-blue-400/40" />
                  <span className="relative z-10 font-sans">
                    {item.href === '/dashboard' ? t('sidebar.backToDashboard') : item.label}
                  </span>
                  {item.badge && (
                    <span className="relative z-10 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-900 shadow-xs font-sans">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Expand / Collapse Action Button at Bottom */}
      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full flex items-center rounded-[10px] text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 transition-all cursor-pointer group py-2 relative font-sans ${
            effectiveCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          {effectiveCollapsed ? (
            <>
              <div className="w-9 h-9 rounded-[10px] bg-slate-100/70 dark:bg-slate-800/60 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-all group-hover:scale-105">
                <PanelLeftOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>
              <div className="absolute left-full ml-3.5 px-3.5 py-2 rounded-[10px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-bold whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[100] border border-blue-400/40 backdrop-blur-md translate-x-1.5 group-hover:translate-x-0 font-sans">
                <div className="w-2 h-2 bg-blue-600 rotate-45 absolute -left-1 top-1/2 -translate-y-1/2 border-l border-b border-blue-400/40" />
                <span className="relative z-10 font-sans">{t('sidebar.expand')}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 w-full">
              <PanelLeftClose className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-xs transition-opacity duration-300 font-bold font-sans">{t('sidebar.minimize')}</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
