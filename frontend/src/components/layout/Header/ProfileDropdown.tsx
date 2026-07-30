'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LayoutDashboard, Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs backdrop-blur-md hover:border-indigo-300 focus:outline-none"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          JD
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
              className="absolute right-0 mt-2 w-56 p-2 z-50 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-2xl space-y-1 text-sm text-slate-700 dark:text-slate-200"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">Jane Doe</p>
                <p className="text-xs text-slate-400">jane@example.com</p>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/billing"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Billing & Plans</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1"
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
