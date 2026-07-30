'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

export default function ThemeToggle() {
  const { settings, toggleTheme } = useSettings();
  const isDark = settings.theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      aria-label="Toggle dark/light theme"
      className="relative w-9 h-9 rounded-full bg-white border border-[#E5E7EB] text-[#0F172A] hover:border-blue-400 shadow-2xs hover:shadow-md hover:shadow-blue-500/20 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all overflow-hidden"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-blue-500" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
