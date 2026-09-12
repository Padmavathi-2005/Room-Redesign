'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Sparkles } from 'lucide-react';
import { useSettings, getHomepageText } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pauseTimer = useRef<NodeJS.Timeout | null>(null);

  const { settings } = useSettings();
  const { language } = useLanguage();

  const badgeText = getHomepageText(settings, 'video', 'badge', language, 'Interactive Demo');
  const titleText = getHomepageText(settings, 'video', 'title', language, 'See AI Design In Action');
  const subtitleText = getHomepageText(
    settings,
    'video',
    'subtitle',
    language,
    'Watch how RoomAI transforms real spaces into beautiful interiors in seconds.'
  );

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
      // Momentarily hide pause icon
      setShowPauseIcon(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // On mobile touch or desktop hover during playback, briefly show pause icon
  const handleInteraction = () => {
    if (!isPlaying) return;
    setShowPauseIcon(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      setShowPauseIcon(false);
    }, 1800);
  };

  return (
    <section className="video-showcase-section relative w-full pt-28 pb-20 bg-[#4f46e5]/10 dark:bg-[#4f46e5]/15 text-slate-900 dark:text-white selection:bg-indigo-600 selection:text-white border-none overflow-hidden">
      {/* Top Deep Oval Curved Divider */}
      <div className="curved-divider absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="curved-divider-svg relative block w-full h-16 sm:h-24 text-[#FCFCFD] dark:text-[#0B0F17] fill-current"
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
            <span>{badgeText}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-heading whitespace-pre-line"
          >
            {titleText}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium"
          >
            {subtitleText}
          </motion.p>
        </div>

        {/* Video Showcase Card - Clean, No Badges, No Backdrop, No Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onClick={togglePlay}
          onMouseMove={handleInteraction}
          onTouchStart={handleInteraction}
          className="video-showcase-card relative max-w-4xl mx-auto aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl group cursor-pointer select-none"
        >
          {/* Native HTML5 Video - Crystal Clear, Zero Backdrop */}
          <video
            ref={videoRef}
            src="/samples/interior_demo.webm"
            poster="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80"
            playsInline
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />

          {/* CENTER PLAY / PAUSE ICON ONLY */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <AnimatePresence mode="wait">
              {!isPlaying ? (
                // Clean Play Icon in Center
                <motion.div
                  key="center-play"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-auto"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 text-white/95 hover:text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] cursor-pointer transition-all flex items-center justify-center"
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white translate-x-0.5" />
                  </motion.button>
                </motion.div>
              ) : (
                // Clean Pause Icon on tap/hover when playing
                showPauseIcon && (
                  <motion.div
                    key="center-pause"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="pointer-events-auto"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 text-white/95 hover:text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] cursor-pointer transition-all flex items-center justify-center"
                      aria-label="Pause video"
                    >
                      <Pause className="w-7 h-7 sm:w-9 sm:h-9 fill-white text-white" />
                    </motion.button>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
