'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Sparkles } from 'lucide-react';

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
    >
      <motion.div
        whileHover={{ scale: 1.06, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/20 border border-white/40 overflow-hidden"
      >
        <Home className="w-5 h-5 text-white stroke-[2.2]" />
        <Sparkles className="absolute top-1 right-1 w-2.5 h-2.5 text-cyan-200 animate-pulse" />
      </motion.div>

      <span className="text-xl font-extrabold tracking-tight text-[#0F172A] font-heading">
        Room<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">AI</span>
      </span>
    </Link>
  );
}
