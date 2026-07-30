'use client';

import React, { useState } from 'react';
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

  // Helper to extract initials (e.g. Alex Morgan -> AM, Padmavathi -> PA)
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);
  const credits = user.credits ?? 100;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs backdrop-blur-md hover:border-blue-300 dark:hover:border-blue-700 focus:outline-none transition-all"
      >
        {/* Avatar Image or Initials Circle */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-xl object-cover border border-white/40 shadow-xs"
          />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
            {initials}
          </div>
        )}

        {/* User Name & Bottom Credits Balance */}
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-heading max-w-[110px] truncate">
            {user.name}
          </span>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 leading-tight pt-0.5">
            <Zap className="w-2.5 h-2.5 fill-current text-amber-500" />
            <span>{credits} Credits</span>
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-60 p-2 z-50 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-2xl space-y-1 text-xs text-slate-700 dark:text-slate-200"
            >
              {/* User Details Box */}
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm font-heading">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl">
                  <span>Balance:</span>
                  <span className="font-extrabold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-current" />
                    {credits} Credits Remaining
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
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

              {/* Sign Out Action */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 font-semibold"
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
