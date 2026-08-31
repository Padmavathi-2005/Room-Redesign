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
  return (
    <section className="relative w-full pt-28 pb-20 bg-[#2563eb]/10 dark:bg-[#2563eb]/20 text-slate-900 dark:text-white selection:bg-blue-600 selection:text-white border-none overflow-hidden">
      
      {/* Top Deep Oval Curved Divider */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-16 sm:h-24 text-white dark:text-[#0B0F17] fill-current"
        >
          <path d="M0,0 C300,95 900,95 1200,0 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 space-y-16">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-800 dark:text-blue-300 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Simple 3-Step Process</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading"
          >
            From Photo to Finished Space{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              in Just 3 Steps.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 font-medium"
          >
            All handled automatically. You just upload. No design skills required.
          </motion.p>
        </div>

        {/* Connected Feature Process Nodes Line */}
        <div className="max-w-4xl mx-auto py-2 px-4">
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
                  <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200/90 text-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <NodeIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {node.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.stepNumber}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative bg-white border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Large Background Step Number */}
                <span className="absolute top-5 right-6 text-5xl font-black font-heading text-slate-200/80 dark:text-slate-800/80 group-hover:text-blue-500/20 transition-colors pointer-events-none select-none z-0">
                  {step.stepNumber}
                </span>

                <div className="space-y-5 relative z-10">
                  {/* Step Icon */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.accentColor} text-white flex items-center justify-center shadow-md`}>
                      <StepIcon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xl font-bold text-slate-900 font-heading group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Automated by RoomAI
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Button Banner */}
        <div className="text-center pt-2">
          <Link href="/generate">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-lg transition-all hover:scale-105">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Try 3-Step Redesign Now Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>

    </section>
  );
}
