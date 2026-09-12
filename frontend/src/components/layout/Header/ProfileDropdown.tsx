'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, CreditCard, LogOut, ChevronDown, ChevronRight, Zap, Wand2, Sparkles, Crown } from 'lucide-react';
import { CreditTokenIcon } from '@/components/ui';

export interface UserProfileData {
  name: string;
  email: string;
  avatar?: string;
  credits?: number;
  plan?: string;
  isProfileHighlightEnabled?: boolean;
}

interface ProfileDropdownProps {
  user: UserProfileData;
  onSignOut: () => void;
}

export default function ProfileDropdown({ user, onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  const capitalizeName = (str: string) => {
    if (!str) return 'User';
    return str
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const capitalizedName = capitalizeName(user.name);
  const initials = getInitials(user.name);
  const credits = user.credits ?? 0;
  
  // Check if profile highlight / premium features are enabled ONLY for Pro plan users
  const planUpper = (user.plan || '').toUpperCase();
  const isProPlan = ['PRO', 'PREMIUM', 'ENTERPRISE', 'VIP'].includes(planUpper);
  const isPremiumUser = isProPlan && (user.isProfileHighlightEnabled ?? true);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Capsule Trigger Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="profile-capsule-btn flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-purple-400/60 transition-colors focus:outline-none cursor-pointer group shadow-2xs overflow-visible"
      >
        {/* Avatar Image / Initials Container */}
        <div className="relative shrink-0 flex items-center justify-center overflow-visible">
          {isPremiumUser ? (
            /* Premium User: 36px Avatar with 2px Conic Gradient Ring + 2px Symmetrical Gap + Static Crown */
            <div className="relative w-9 h-9 rounded-full flex items-center justify-center shrink-0">
              {/* Outer Rotating Multi-Color Conic Gradient Ring (2px border thickness) */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#2563eb,#06b6d4,#8b5cf6,#ec4899,#f97316,#2563eb)] animate-[spin_5s_linear_infinite]" />

              {/* Inner Gap Ring (2px gap thickness - White in Light Mode / Slate-900 in Dark Mode) */}
              <div className="absolute inset-[2px] rounded-full bg-white dark:bg-slate-900 z-0" />

              {/* Core Upright Avatar Picture / Initials (28px x 28px) */}
              <div className="relative z-10 w-[28px] h-[28px] rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-extrabold text-[11px] tracking-wider shadow-2xs shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={capitalizedName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Static Tilted Golden King Crown Icon sitting on top-right of the ring */}
              <div className="absolute -top-1 -right-1 z-20 pointer-events-none transform rotate-[25deg]">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.9)]" />
              </div>
            </div>
          ) : (
            /* Standard User: Compact 36px Primary Brand Circle */
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-[11px] shadow-2xs overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={capitalizedName} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          )}
        </div>

        {/* User Details & Credit Badge Column */}
        <div className="flex flex-col text-left justify-center shrink-0 min-w-0">
          {/* Top Row: User Name + Chevron Icon */}
          <div className="flex items-center gap-1 leading-tight">
            <span className="profile-user-name text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-purple-300 max-w-[90px] truncate capitalize transition-colors">
              {capitalizedName}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-purple-300 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Bottom Row: Credit Icon + Numeric Value */}
          <div className="flex items-center gap-1 pt-0.5 leading-tight">
            <CreditTokenIcon size="xs" />
            <span className="profile-coin-count text-[11px] font-black text-primary dark:text-amber-400 tracking-tight">{credits}</span>
          </div>
        </div>
      </button>

      {/* Dropdown Menu Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="profile-dropdown-menu absolute right-0 mt-3 sm:mt-4 w-72 sm:w-76 p-3 z-50 rounded-2xl bg-white/95 dark:bg-[#0E1322]/95 border border-slate-200/90 dark:border-white/10 shadow-2xl dark:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl space-y-2.5 text-xs text-slate-700 dark:text-slate-200"
          >
            {/* Top User Card Box */}
            <div className="rounded-xl p-3 bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-white/[0.06] dark:to-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] shadow-2xs space-y-3">
              {/* User Avatar + Name Row */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 dark:from-purple-500 dark:to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-500/20 overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={capitalizedName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm font-heading truncate capitalize leading-tight">
                      {capitalizedName}
                    </p>
                    {isProPlan && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 dark:border dark:border-purple-500/30 shrink-0">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Credit Balance Highlight with Upgrade Button */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-white/[0.08] shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 flex items-center justify-center shrink-0">
                    <CreditTokenIcon size="sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 leading-none">
                      Credits
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                      {credits}
                    </span>
                  </div>
                </div>

                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[var(--primary)] dark:to-[var(--secondary)] hover:opacity-95 shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Upgrade</span>
                </Link>
              </div>
            </div>

            {/* 4 Core Navigation Items */}
            <div className="space-y-0.5 py-0.5">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-purple-300 group-hover:bg-blue-50 dark:group-hover:bg-purple-500/20 group-hover:border-blue-200 dark:group-hover:border-purple-500/30 transition-all">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  </div>
                  <span>Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
              </Link>

              <Link
                href="/generate"
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-purple-300 group-hover:bg-indigo-50 dark:group-hover:bg-purple-500/20 group-hover:border-indigo-200 dark:group-hover:border-purple-500/30 transition-all">
                    <Wand2 className="w-3.5 h-3.5" />
                  </div>
                  <span>AI Room Redesign</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
              </Link>

              <Link
                href="/pricing"
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/20 group-hover:border-purple-200 dark:group-hover:border-purple-500/30 transition-all">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span>Billing & Plans</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-purple-300 group-hover:bg-blue-50 dark:group-hover:bg-purple-500/20 group-hover:border-blue-200 dark:group-hover:border-purple-500/30 transition-all">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <span>Account Settings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="group w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-105 transition-transform">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
