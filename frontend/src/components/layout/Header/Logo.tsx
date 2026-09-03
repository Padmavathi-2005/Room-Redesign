'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Sparkles } from 'lucide-react';

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <motion.div
        whileHover={{ scale: 1.06, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-primary shadow-md shadow-primary/20 border border-white/40 overflow-hidden"
      >
        <Home className="w-5 h-5 text-white stroke-[2.2]" />
        <Sparkles className="absolute top-1 right-1 w-2.5 h-2.5 text-white/80 animate-pulse" />
      </motion.div>

      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
        Room<span className="text-primary">AI</span>
      </span>
    </Link>
  );
}
