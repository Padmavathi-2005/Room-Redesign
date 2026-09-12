'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { settings, toggleTheme } = useSettings();
  const isDark = settings.theme === 'dark';
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      aria-label="Toggle dark/light theme"
      className={`theme-toggle-btn relative ${sizeClasses} rounded-full bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 text-[#0F172A] dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs hover:shadow-md hover:shadow-indigo-500/20 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all overflow-hidden shrink-0 ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {isDark ? (
          <Moon className={`${iconSize} text-amber-400 dark:text-amber-300`} />
        ) : (
          <Sun className={`${iconSize} text-amber-500`} />
        )}
      </motion.div>
    </motion.button>
  );
}
