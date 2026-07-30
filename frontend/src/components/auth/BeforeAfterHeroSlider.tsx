'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Layers, MoveHorizontal, CheckCircle2 } from 'lucide-react';

interface DemoPair {
  id: string;
  name: string;
  before: string;
  after: string;
  style: string;
  time: string;
}

const DEMO_PAIRS: DemoPair[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    before: '/samples/living_before.png',
    after: '/samples/living_after.png',
    style: 'Modern Minimalist',
    time: '1.4s',
  },
  {
    id: 'bedroom',
    name: 'Primary Bedroom',
    before: '/samples/bedroom_before.png',
    after: '/samples/bedroom_after.png',
    style: 'Scandinavian Warmth',
    time: '1.8s',
  },
];

export default function BeforeAfterHeroSlider() {
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSliderVal, setAutoSliderVal] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPair = DEMO_PAIRS[activeDemoIndex];

  // Auto transition demo pair every 5 seconds
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setActiveDemoIndex((prev) => (prev + 1) % DEMO_PAIRS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isDragging]);

  // Subtle auto-moving slider effect when user is idle
  useEffect(() => {
    if (isDragging) return;
    const autoInterval = setInterval(() => {
      setAutoSliderVal((prev) => {
        const next = prev === 35 ? 65 : 35;
        return next;
      });
    }, 3000);
    return () => clearInterval(autoInterval);
  }, [isDragging]);

  const handleTouchOrMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleTouchOrMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleTouchOrMove(e.touches[0].clientX);
    }
  };

  const displayPosition = isDragging ? sliderPosition : sliderPosition;

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Subtle Background Glow Ring */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl opacity-20 blur-lg pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[380px] sm:h-[430px] rounded-3xl overflow-hidden glass-card shadow-lg shadow-slate-900/10 select-none cursor-ew-resize border border-white/80 group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPair.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-full"
          >
            {/* AFTER Image (Full Layer Below) */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={currentPair.after}
                alt={`${currentPair.name} Redesigned`}
                className="w-full h-full object-cover"
              />
              {/* After Badge */}
              <div className="absolute top-4 right-4 z-10 glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200/50 shadow-md backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>AI Redesign</span>
              </div>
            </div>

            {/* BEFORE Image (Clipped Layer Above) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-75"
              style={{ width: `${displayPosition}%` }}
            >
              <img
                src={currentPair.before}
                alt={`${currentPair.name} Original`}
                className="absolute top-0 left-0 w-full h-full object-cover max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
              />
              {/* Before Badge */}
              <div className="absolute top-4 left-4 z-10 glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-white/60 shadow-md backdrop-blur-md">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Original Room</span>
              </div>
            </div>

            {/* Slider Handle Line */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-75"
              style={{ left: `${displayPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center shadow-xl border-2 border-white text-indigo-600 hover:scale-110 active:scale-95 transition-transform">
                <MoveHorizontal className="w-5 h-5" />
              </div>
            </div>

            {/* Floating Info Pill at Bottom */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-pill px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium text-slate-800 backdrop-blur-xl border border-white/70 shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Style: <strong className="font-semibold text-indigo-600">{currentPair.style}</strong></span>
              </motion.div>

              <div className="glass-pill px-3 py-1.5 rounded-2xl text-[11px] font-semibold text-slate-600 border border-white/70">
                ⚡ Generated in {currentPair.time}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating 3D Room Style Selector Badges Below Slider */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {DEMO_PAIRS.map((pair, idx) => (
          <button
            key={pair.id}
            onClick={() => setActiveDemoIndex(idx)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
              activeDemoIndex === idx
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-600 border border-slate-200/60'
            }`}
          >
            {activeDemoIndex === idx && <Wand2 className="w-3 h-3" />}
            {pair.name}
          </button>
        ))}
      </div>
    </div>
  );
}
