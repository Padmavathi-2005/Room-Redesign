'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Zap, Palette, ShieldCheck, Home } from 'lucide-react';
import BeforeAfterHeroSlider from './BeforeAfterHeroSlider';

export default function LeftHeroSection() {
  const BADGES = [
    { label: 'AI Powered', icon: Sparkles },
    { label: 'Ultra Realistic', icon: CheckCircle2 },
    { label: 'Instant Results', icon: Zap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between h-full py-2 lg:py-4 px-2 lg:px-6 max-w-2xl mx-auto"
    >
      {/* Top Header Logo (Mobile & Desktop) */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-900 bg-clip-text text-transparent tracking-tight font-heading">
            RoomAI
          </span>
          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 tracking-wider uppercase">
            Pro v2.4
          </span>
        </div>
      </div>

      {/* Main Text & Value Proposition */}
      <div className="space-y-4 mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-heading leading-[1.15]"
        >
          Design Your Dream Room with{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
            AI Magic
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg"
        >
          Upload your room photo. Choose your favorite interior style. Generate stunning, high-definition photorealistic room redesigns in seconds.
        </motion.p>

        {/* CTA Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center gap-2.5 pt-2"
        >
          {BADGES.map((b, idx) => {
            const IconComponent = b.icon;
            return (
              <div
                key={idx}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1.5 border border-white/80 shadow-sm"
              >
                <IconComponent className="w-3.5 h-3.5 text-indigo-600" />
                <span>{b.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Interactive Before / After AI Room Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative my-4"
      >
        <BeforeAfterHeroSlider />
      </motion.div>

      {/* Trust & Social Proof Bottom Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between pt-6 border-t border-slate-200/60 text-xs font-medium text-slate-500"
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User 1" />
            <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User 2" />
            <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="User 3" />
          </div>
          <span>Trusted by <strong className="text-slate-900 font-semibold">500,000+</strong> homeowners & designers</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-emerald-600 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>99.8% Satisfaction Rate</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
