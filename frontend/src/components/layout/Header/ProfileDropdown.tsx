'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, CreditCard, LogOut, ChevronDown, Zap, Wand2 } from 'lucide-react';

export interface UserProfileData {
  name: string;
  email: string;
  avatar?: string;
  credits?: number;
}

interface ProfileDropdownProps {
  user: UserProfileData;
  onSignOut: () => void;
}

export default function ProfileDropdown({ user, onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Automatically close dropdown on window scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Helper to capitalize first letter of each word (e.g. "test" -> "Test", "alex morgan" -> "Alex Morgan")
  const capitalizeName = (str: string) => {
    if (!str) return 'User';
    return str
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper to extract initials (e.g. Alex Morgan -> AM, Test -> TE)
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
  const credits = user.credits ?? 100;

  return (
    <div className="relative">
      {/* Profile Button Badge with Primary/Secondary Brand Gradient */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 border border-white/20 focus:outline-none transition-all duration-300"
      >
        {/* Avatar Image or Initials Circle */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={capitalizedName}
            className="w-8 h-8 rounded-xl object-cover border border-white/60 shadow-xs"
          />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-xs font-extrabold shadow-inner">
            {initials}
          </div>
        )}

        {/* User Name & Credits Balance */}
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-white leading-tight font-heading max-w-[110px] truncate capitalize">
            {capitalizedName}
          </span>
          <span className="text-[10px] font-bold text-blue-100 flex items-center gap-0.5 leading-tight pt-0.5">
            <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
            <span>{credits} Credits</span>
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown Menu Box - Shifted slightly down (mt-4 sm:mt-5) for optimal clearance */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 mt-4 sm:mt-5 w-64 p-3 z-50 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl shadow-2xl shadow-blue-900/15 backdrop-blur-2xl space-y-2 text-xs text-slate-700 dark:text-slate-200"
            >
              {/* Premium Top User Card Box */}
              <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-purple-50/40 dark:from-blue-950/70 dark:via-indigo-950/40 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 rounded-xl p-3 space-y-2">
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

                {/* Credits Balance Highlight */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-xl shadow-xs text-[11px] font-bold flex items-center justify-between">
                  <span>Credit Balance</span>
                  <span className="flex items-center gap-1 font-extrabold">
                    <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                    {credits} Credits
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5 pt-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/generate"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
                >
                  <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>AI Room Redesign</span>
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Billing & Plans</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
