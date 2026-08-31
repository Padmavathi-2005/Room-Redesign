'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full pt-28 pb-20 bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 text-slate-900 dark:text-white selection:bg-indigo-600 selection:text-white border-none overflow-hidden">
      
      {/* Top Deep Oval Curved Divider */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-16 sm:h-24 text-[#FCFCFD] dark:text-[#0B0F17] fill-current"
        >
          <path d="M0,0 C300,95 900,95 1200,0 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-800 dark:text-indigo-300 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Demo</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-heading"
          >
            See AI Design In Action
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 font-medium"
          >
            Watch how RoomAI transforms real spaces into beautiful interiors in seconds.
          </motion.p>
        </div>

        {/* Video Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-indigo-100 shadow-2xl group"
        >
          {/* Before & After Overlays */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-2xl text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/20 z-20 pointer-events-none">
            BEFORE
          </div>
          <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600/90 backdrop-blur-md rounded-2xl text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md border border-white/30 z-20 pointer-events-none">
            AFTER
          </div>

          {/* Video element or interactive player preview */}
          {isPlaying ? (
            <iframe
              className="w-full h-full object-cover"
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="AI Design Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              onClick={() => setIsPlaying(true)}
              className="relative w-full h-full cursor-pointer flex items-center justify-center overflow-hidden"
            >
              {/* High Quality Interior Transformation Poster Image */}
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80"
                alt="RoomAI Video Demo Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />

              {/* Dark Gradient Overlay for Contrast */}
              <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/20 transition-colors" />

              {/* Pulsing Play Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 w-20 h-20 rounded-full bg-white/95 text-indigo-600 shadow-2xl flex items-center justify-center border border-white backdrop-blur-md"
              >
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

    </section>
  );
}
