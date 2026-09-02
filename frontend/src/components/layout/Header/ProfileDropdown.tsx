'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, CreditCard, LogOut, ChevronDown, Zap, Wand2, Sparkles, Crown } from 'lucide-react';
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
  
  // Check if profile highlight / premium features are enabled for the user
  const isPremiumUser = user.isProfileHighlightEnabled ?? (user.plan ? ['PREMIUM', 'PRO', 'ENTERPRISE', 'VIP'].includes(user.plan.toUpperCase()) : false);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Capsule Trigger Badge */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 transition-all focus:outline-none cursor-pointer group shadow-2xs overflow-visible"
      >
        {/* Avatar Image / Initials Container */}
        <div className="relative shrink-0 flex items-center justify-center overflow-visible">
          {isPremiumUser ? (
            /* Premium User: Compact 32px Avatar Circle + Rotating Conic Ring + Tilted Crown */
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0 overflow-visible">
              {/* Outer Rotating Multi-Color Conic Ring */}
              <div className="absolute -inset-[2px] rounded-full bg-[conic-gradient(from_0deg,#2563eb,#06b6d4,#8b5cf6,#ec4899,#f97316,#2563eb)] animate-[spin_5s_linear_infinite]" />

              {/* Inner White Gap Ring */}
              <div className="absolute inset-[1.5px] rounded-full bg-white dark:bg-slate-900 z-0" />

              {/* Inner Solid Primary Blue Avatar Box (25px x 25px) */}
              <div className="relative z-10 w-[25px] h-[25px] rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-extrabold text-[10px] tracking-wider shadow-2xs shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={capitalizedName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Tilted Golden King Crown Icon sitting on top-right of the ring */}
              <div className="absolute -top-2 -right-1.5 z-20 pointer-events-none transform rotate-[25deg]">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.9)]" />
              </div>
            </div>
          ) : (
            /* Standard User: Compact 32px Primary Blue Circle */
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-[11px] shadow-2xs overflow-hidden shrink-0">
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
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 max-w-[90px] truncate capitalize transition-colors">
              {capitalizedName}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Bottom Row: Credit Icon + Numeric Value */}
          <div className="flex items-center gap-1 pt-0.5 leading-tight">
            <CreditTokenIcon size="xs" />
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 tracking-tight">{credits}</span>
          </div>
        </div>
      </motion.button>

      {/* Dropdown Menu Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 sm:mt-4 w-64 p-3 z-50 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xl backdrop-blur-2xl space-y-2 text-xs text-slate-700 dark:text-slate-200"
          >
            {/* Premium Top User Card Box */}
            <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-purple-50/40 dark:from-blue-950/70 dark:via-indigo-950/40 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm font-heading truncate capitalize">
                    {capitalizedName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Credit Balance Highlight with Upgrade Link Button */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-3 py-2 rounded-xl shadow-xs text-[11px] font-bold flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-100/90 font-semibold">Balance</span>
                  <span className="flex items-center gap-1 font-black text-sm text-amber-300">
                    <CreditTokenIcon size="sm" />
                    {credits}
                  </span>
                </div>
                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-lg text-[10px] shadow-xs flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Upgrade</span>
                </Link>
              </div>
            </div>

            {/* 4 Core Navigation Items */}
            <div className="space-y-1 pt-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-slate-800 dark:text-slate-200"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/generate"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-slate-800 dark:text-slate-200"
              >
                <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Room Redesign</span>
              </Link>

              <Link
                href="/pricing"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-slate-800 dark:text-slate-200"
              >
                <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Billing & Plans</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-slate-800 dark:text-slate-200"
              >
                <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Account Settings</span>
              </Link>
            </div>



            {/* Sign Out Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
