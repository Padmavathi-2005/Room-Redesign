'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSettings, getHomepageText } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CallToActionBanner() {
  const { settings } = useSettings();
  const { language } = useLanguage();
  const [targetHref, setTargetHref] = useState('/signup');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      setTargetHref('/dashboard');
    }
  }, []);

  const badgeText = getHomepageText(settings, 'ctaBanner', 'badge', language, 'Start Your Journey');
  const titleText = getHomepageText(settings, 'ctaBanner', 'title', language, 'Start Smarter Home Design with RoomAI Today');
  const subtitleText = getHomepageText(
    settings,
    'ctaBanner',
    'subtitle',
    language,
    'Transform your space effortlessly with RoomAI, the AI-powered home design tool that helps you visualize interiors, exteriors, architecture, landscapes, and layouts in seconds.'
  );
  const primaryCtaText = getHomepageText(settings, 'ctaBanner', 'primaryCta', language, 'Get Started with RoomAI');

  return (
    <section className="relative w-full py-16 bg-transparent text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Large Rounded CTA Glass Banner Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-10 sm:p-16 text-center overflow-hidden shadow-2xl shadow-blue-900/30"
        >
          {/* Subtle Background Glow Blobs & Grid */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0 opacity-50" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">

            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-200 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{badgeText}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight whitespace-pre-line"
            >
              {titleText}
            </motion.h2>

            {/* Subtitle Body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              {subtitleText}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href={targetHref} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="cta-primary-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-xl transition-all focus:outline-none cursor-pointer group"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 text-blue-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </motion.button>
              </Link>

              <Link href="/#features" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl backdrop-blur-md transition-all focus:outline-none cursor-pointer"
                >
                  <span>View All Features</span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Sub-caption guarantee */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure SSL checkout • Instant credit activation • Cancel anytime</span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
