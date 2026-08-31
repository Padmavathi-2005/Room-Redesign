'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchButtonProps {
  onClick: () => void;
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label="Search site (Ctrl+K)"
      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#0F172A] bg-white border border-[#E5E7EB] rounded-full hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/10 transition-all shadow-2xs backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    >
      <Search className="w-3.5 h-3.5 text-slate-400" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100/80 border border-[#E5E7EB] rounded-2xl">
        ⌘K
      </kbd>
    </motion.button>
  );
}
