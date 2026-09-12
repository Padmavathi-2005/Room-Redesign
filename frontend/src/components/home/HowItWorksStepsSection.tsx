'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Palette,
  Sparkles,
  Sun,
  Layers,
  Sofa,
  LayoutGrid,
  Paintbrush,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useSettings, getHomepageText } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

interface FeatureNode {
  label: string;
  icon: any;
}

const FEATURE_NODES: FeatureNode[] = [
  { label: 'Lighting', icon: Sun },
  { label: 'Materials', icon: Layers },
  { label: 'Furniture', icon: Sofa },
  { label: 'Styling', icon: LayoutGrid },
  { label: 'Finishes', icon: Paintbrush },
  { label: 'Decor', icon: Sparkles },
];

const STEPS = [
  {
    stepNumber: '01',
    badge: 'Step 1',
    title: 'Upload Photo or CAD Sketch',
    description: 'Upload a picture of your room, empty house, or hand-drawn architectural floor plan sketch from any phone or laptop.',
    icon: UploadCloud,
    accentColor: 'from-blue-600 to-indigo-600',
  },
  {
    stepNumber: '02',
    badge: 'Step 2',
    title: 'Select Style & Preferences',
    description: 'Choose from 40+ AI interior & exterior design styles (Japandi, Modern, Scandinavian, Industrial) and adjust room light settings.',
    icon: Palette,
    accentColor: 'from-indigo-600 to-purple-600',
  },
  {
    stepNumber: '03',
    badge: 'Step 3',
    title: 'Get 4K AI Renders in 3 Seconds',
    description: 'Our AI engine generates photorealistic 4K renders, furniture lists, and material specs ready for client presentation or contractor quotes.',
    icon: Zap,
    accentColor: 'from-blue-600 to-cyan-600',
  },
];

export default function HowItWorksStepsSection() {
  const { settings } = useSettings();
  const { language } = useLanguage();

  const badgeText = getHomepageText(settings, 'howItWorks', 'badge', language, 'Simple 3-Step Process');
  const titleText = getHomepageText(settings, 'howItWorks', 'title', language, 'From Photo to Finished Space in Just 3 Steps.');
  const subtitleText = getHomepageText(
    settings,
    'howItWorks',
    'subtitle',
    language,
    'Transform any room with photorealistic precision effortlessly.'
  );

  return (
    <section className="how-it-works-section relative w-full pt-14 sm:pt-28 pb-16 sm:pb-20 bg-[#2563eb]/10 dark:bg-[#2563eb]/20 text-slate-900 dark:text-white selection:bg-[var(--primary)] selection:text-white border-t border-slate-200/80 dark:border-slate-800 sm:border-none overflow-hidden">
      
      {/* Top Deep Oval Curved Divider (Chrome / Desktop Only - Preserves Desktop View) */}
      <div className="curved-divider hidden sm:block absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="curved-divider-svg relative block w-full h-16 sm:h-24 text-white dark:text-[#0B0F17] fill-current"
        >
          <path d="M0,0 C300,95 900,95 1200,0 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-10 sm:space-y-16">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-pill-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs font-bold text-[var(--primary)] shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading whitespace-pre-line"
          >
            {titleText}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium px-2"
          >
            {subtitleText}
          </motion.p>
        </div>

        {/* DESKTOP VIEW (>= sm screens): Connected Feature Process Nodes Line - 100% PRESERVED */}
        <div className="hidden sm:block max-w-4xl mx-auto py-2 px-4">
          <div className="flex items-center justify-between relative">
            {/* Dashed Connecting Line aligned to exact center of 48px icon boxes */}
            <div className="absolute top-6 left-6 right-6 -translate-y-1/2 border-t-2 border-dashed border-blue-300 dark:border-blue-700/60 z-0" />

            {FEATURE_NODES.map((node, idx) => {
              const NodeIcon = node.icon;
              return (
                <motion.div
                  key={node.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-800 text-[var(--primary)] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                    <NodeIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-[var(--primary)] transition-colors">
                    {node.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* MOBILE VIEW (< sm screens): Clean 3x2 Grid of Feature Badges (Zero Colliding Labels) */}
        <div className="grid sm:hidden grid-cols-3 gap-2 py-1">
          {FEATURE_NODES.map((node) => {
            const NodeIcon = node.icon;
            return (
              <div
                key={node.label}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                  <NodeIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center truncate w-full">
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-2 sm:pt-4">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.stepNumber}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="how-it-works-card relative bg-white dark:bg-[#0D1322] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Large Background Step Number */}
                <span className="step-number-watermark absolute top-4 right-5 sm:top-5 sm:right-6 text-4xl sm:text-5xl font-black font-heading text-slate-200/80 dark:text-white/30 group-hover:text-white/60 transition-all pointer-events-none select-none z-0">
                  {step.stepNumber}
                </span>

                <div className="space-y-4 sm:space-y-5 relative z-10">
                  {/* Step Icon */}
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${step.accentColor} text-white flex items-center justify-center shadow-md`}>
                      <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading group-hover:text-[var(--primary)] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800 mt-5 sm:mt-6 flex items-center justify-between relative z-10">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Automated by RoomAI
                  </span>
                  <div className="how-it-works-arrow-btn w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Button Banner */}
        <div className="text-center pt-2">
          <Link href="/generate">
            <button className="how-it-works-cta-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-[var(--primary)] text-white hover:bg-[var(--primary)] dark:hover:bg-[var(--primary)] text-xs sm:text-sm font-bold shadow-lg shadow-[var(--primary)]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.9)] shrink-0" />
              <span>Try 3-Step Redesign Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>

    </section>
  );
}
