'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GetStartedButton() {
  return (
    <Link href="/signup">
      <motion.button
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        className="relative group inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out" />
        <span>Get Started</span>
      </motion.button>
    </Link>
  );
}
