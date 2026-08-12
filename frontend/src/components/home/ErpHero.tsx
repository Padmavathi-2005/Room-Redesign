'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import BeforeAfterShowcase from './BeforeAfterShowcase';

export default function ErpHero() {
  const [targetHref, setTargetHref] = useState('/signup');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      setTargetHref('/dashboard');
    }
  }, []);

  return (
    <section className="relative w-full pt-4 pb-4 flex flex-col justify-between bg-transparent selection:bg-blue-600 selection:text-white">
      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full pt-2 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* LEFT COLUMN: Preserved Exactly as Requested (5 cols / 45%) */}
          <div className="lg:col-span-5 space-y-6 text-left">

            {/* Small Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-blue-700 dark:text-blue-400 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-blue-50 dark:fill-blue-950" />
              <span>Trusted Construction ERP</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-slate-900 dark:text-white font-heading leading-[1.12]"
            >
              Build Better.
              <br />
              <span className="bg-gradient-to-r from-[#1D4ED8] dark:from-blue-400 to-[#0D9488] dark:to-teal-400 bg-clip-text text-transparent">
                Manage Smarter.
              </span>
              <br />
              Deliver Faster.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-md"
            >
              The only digital craftsmanship platform designed to unite your field and office. Seamlessly manage budgets, logistics, and labor in one high-performance interface.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-6 pt-2"
            >
              <Link href={targetHref}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/25 transition-all focus:outline-none"
                >
                  Start Free Trial
                </motion.button>
              </Link>

              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-sm font-semibold text-slate-800 hover:text-blue-700 transition-colors focus:outline-none py-2"
                >
                  Book a Demo
                </motion.button>
              </Link>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Redesigned Before vs After Construction Project Showcase (7 cols / 55%) */}
          <div className="lg:col-span-7">
            <BeforeAfterShowcase />
          </div>

        </div>
      </div>
    </section>
  );
}
