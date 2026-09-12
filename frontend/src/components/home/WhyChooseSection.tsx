'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, CheckCircle2, Box, Sparkles, DollarSign, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSettings, getHomepageText } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

export default function WhyChooseSection() {
  const { settings } = useSettings();
  const { language } = useLanguage();

  const badgeText = getHomepageText(settings, 'whyChoose', 'badge', language, 'Why Choose RoomAI');
  const titleText = getHomepageText(settings, 'whyChoose', 'title', language, 'Why Choose RoomAI For Your Projects');
  const subtitleText = getHomepageText(
    settings,
    'whyChoose',
    'subtitle',
    language,
    'Everything you need to design, visualize, and execute interior, exterior, and 3D architectural projects with AI.'
  );

  return (
    <section id="why-choose" className="why-choose-section relative w-full py-16 sm:py-20 bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white selection:bg-[var(--primary)] selection:text-white space-y-10 sm:space-y-12 border-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-10 sm:space-y-12">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-6 sm:mb-8">
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
            className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-heading whitespace-pre-line"
          >
            {titleText}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium"
          >
            {subtitleText}
          </motion.p>
        </div>

        {/* CARD 1: All-in-One AI Home Design Platform */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-5 sm:p-8 lg:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* TEXT CONTENT: Placed on top on mobile, right on desktop */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left order-1 lg:order-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
                All-in-One AI Home Design Platform
              </h3>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Plan interiors, exteriors, landscapes, architecture, and furniture in one place. No need for multiple tools or subscriptions. Everything you need for complete AI home design is right here.
              </p>
              <div className="pt-1 sm:pt-2">
                <Link href="/generate">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none cursor-pointer"
                  >
                    <span>AI Home Design</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* STACKED UI PREVIEWS: Placed under text on mobile, left on desktop */}
            <div className="lg:col-span-6 relative flex justify-center py-1 order-2 lg:order-1">
              <div className="relative w-full max-w-md space-y-3">
                {/* Feature 1 */}
                <Link href="/generate?tool=interior" className="block group">
                  <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-[var(--primary)]/40 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80"
                        alt="AI Interior Design"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <span className="inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 px-2 py-0.5 rounded-full">
                          AI Interior Design
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                          Living Room & Bedroom Redesign
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Transform original space with 30+ styles
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>

                {/* Feature 2 */}
                <Link href="/generate?tool=sketch" className="block group">
                  <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-[var(--primary)]/40 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80"
                        alt="AI Sketch to Render"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <span className="inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 px-2 py-0.5 rounded-full">
                          AI Sketch to Render
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                          Convert Sketches to 4K Renders
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Instant photorealistic conversion
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>

                {/* Feature 3 */}
                <Link href="/generate?tool=exterior" className="block group">
                  <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-[var(--primary)]/40 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&auto=format&fit=crop&q=80"
                        alt="AI Exterior Design"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <span className="inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                          AI Exterior Design
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                          Facade & Architecture Redesign
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Roofing, siding & landscape options
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </motion.div>


        {/* CARD 2: Smart 3D Floor Plan Creation */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-5 sm:p-8 lg:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT: Text Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left order-1 lg:order-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Box className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
                Smart 3D Floor Plan Creation
              </h3>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Turn your floor plan into a clear 3D visualization with AI. Explore layouts, room relationships, and spatial arrangements before starting your home design project.
              </p>
              <div className="pt-1 sm:pt-2">
                <Link href="/generate?tool=3dfloorplan">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none cursor-pointer"
                  >
                    <span>3D Floor Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* RIGHT: 3D Graphic Showcase */}
            <div className="lg:col-span-6 order-2 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shadow-md group">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
                  alt="Smart 3D Floor Plan Creation"
                  className="w-full h-52 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-blue-900/20 pointer-events-none" />
                <div className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-[11px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>AI 3D Mesh Active</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>


        {/* CARD 3: No Design Knowledge Required */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-5 sm:p-8 lg:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* TEXT: Comes first on mobile, right on desktop */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left order-1 lg:order-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
                No Design Knowledge Required
              </h3>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Anyone can create beautiful room designs without professional experience. RoomAI's AI room design tools make it easy to explore styles, furniture layouts, colors, and complete room transformations.
              </p>
              <div className="pt-1 sm:pt-2">
                <Link href="/generate?tool=interior">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none cursor-pointer"
                  >
                    <span>AI Room Design</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* GRAPHIC: Comes second on mobile, left on desktop */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shadow-md group">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80"
                  alt="No Design Knowledge Required"
                  className="w-full h-52 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Beginner Friendly</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>


        {/* CARD 4: Save Time and Reduce Costs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-5 sm:p-8 lg:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* TEXT: Comes first on mobile, left on desktop */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left order-1 lg:order-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
                Save Time and Reduce Costs
              </h3>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Generate professional exterior designs in minutes instead of weeks. Explore different architectural styles, materials, colors, and outdoor design options before committing to a final plan.
              </p>
              <div className="pt-1 sm:pt-2">
                <Link href="/generate?tool=exterior">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none cursor-pointer"
                  >
                    <span>AI Exterior Design</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* GRAPHIC: Comes second on mobile, right on desktop */}
            <div className="lg:col-span-6 order-2 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shadow-md group">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
                  alt="Save Time and Reduce Costs"
                  className="w-full h-52 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Exterior AI Renders</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
