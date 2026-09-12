'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import BeforeAfterShowcase from './BeforeAfterShowcase';
import { useSettings, getHomepageText } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ErpHero() {
  const { settings } = useSettings();
  const { language } = useLanguage();
  const [targetHref, setTargetHref] = useState('/signup');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      setTargetHref('/dashboard');
    }
  }, []);

  const badgeText = getHomepageText(settings, 'hero', 'badge', language, 'Trusted Construction ERP');
  const titleText = getHomepageText(settings, 'hero', 'title', language, 'Build Better. Manage Smarter. Deliver Faster.');
  const subtitleText = getHomepageText(
    settings,
    'hero',
    'subtitle',
    language,
    'The only digital craftsmanship platform designed to unite your field and office. Seamlessly manage budgets, logistics, and labor in one high-performance interface.'
  );
  const primaryCtaText = getHomepageText(settings, 'hero', 'primaryCta', language, 'Get Started');
  const secondaryCtaText = getHomepageText(settings, 'hero', 'secondaryCta', language, 'Book a Demo');

  const isDefaultEnglishTitle = titleText === 'Build Better. Manage Smarter. Deliver Faster.';

  return (
    <section className="relative w-full pt-4 pb-4 flex flex-col justify-between bg-transparent selection:bg-purple-600 selection:text-white">
      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full pt-2 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-6 text-left">

            {/* Small Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-purple-950/50 border border-slate-200/90 dark:border-purple-500/40 text-xs font-semibold text-blue-700 dark:text-purple-300 shadow-2xs backdrop-blur-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 fill-blue-50 dark:fill-purple-950" />
              <span>{badgeText}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-slate-900 dark:text-white font-heading leading-[1.12] whitespace-pre-line"
            >
              {isDefaultEnglishTitle ? (
                <>
                  Build Better.
                  <br />
                  <span className="hero-manage-smarter-gradient bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] bg-clip-text text-transparent">
                    Manage Smarter.
                  </span>
                  <br />
                  Deliver Faster.
                </>
              ) : titleText.includes('Manage Smarter.') ? (
                (() => {
                  const parts = titleText.split('Manage Smarter.');
                  return (
                    <>
                      {parts[0]}
                      <span className="hero-manage-smarter-gradient bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] bg-clip-text text-transparent">
                        Manage Smarter.
                      </span>
                      {parts[1]}
                    </>
                  );
                })()
              ) : (
                titleText
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed tracking-wide max-w-lg"
            >
              {subtitleText}
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
                  className="px-7 py-3.5 text-sm font-semibold text-white bg-[var(--primary)] hover:opacity-90 rounded-full shadow-lg transition-all focus:outline-none cursor-pointer"
                >
                  {primaryCtaText}
                </motion.button>
              </Link>

              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors focus:outline-none py-2 cursor-pointer"
                >
                  {secondaryCtaText}
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

