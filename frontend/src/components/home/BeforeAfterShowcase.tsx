'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface ProjectCategory {
  id: string;
  name: string;
  beforeImg: string;
  afterImg: string;
  title: string;
}

const CATEGORIES: ProjectCategory[] = [
  {
    id: 'residential',
    name: 'Residential',
    title: 'Luxury Residential Estate Transformation',
    beforeImg: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'commercial',
    name: 'Commercial',
    title: 'Commercial Skyscraper & Office Tower',
    beforeImg: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'office',
    name: 'Office',
    title: 'Modern Corporate Workspace Interior',
    beforeImg: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    title: 'High-Tech Industrial Facility',
    beforeImg: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'villa',
    name: 'Villa',
    title: 'Waterfront Estate & Private Villa',
    beforeImg: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  },
];

export default function BeforeAfterShowcase() {
  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0 - 100)
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Auto Carousel Category Rotation every 4.5 seconds (Pauses when user drags/hovers)
  useEffect(() => {
    if (isInteracting) return;

    const categoryTimer = setInterval(() => {
      setCategoryIndex((prev) => (prev + 1) % CATEGORIES.length);
      setSliderPosition(50); // Reset slider to center on slide change
    }, 4500);

    return () => clearInterval(categoryTimer);
  }, [isInteracting]);

  // 2. Smooth Slider Handle Movement Animation
  useEffect(() => {
    if (isInteracting) return;

    let dir = 1;
    const sliderTimer = setInterval(() => {
      setSliderPosition((prev) => {
        if (prev >= 72) dir = -1;
        if (prev <= 28) dir = 1;
        return prev + dir * 0.4;
      });
    }, 35);

    return () => clearInterval(sliderTimer);
  }, [isInteracting]);

  // Handle Mouse Drag / Touch Move
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 5) percentage = 5;
    if (percentage > 95) percentage = 95;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    setIsInteracting(true);
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isInteracting) {
      handleMove(e.clientX);
    }
  };

  const activeProject = CATEGORIES[categoryIndex];

  return (
    <div
      className="relative w-full max-w-2xl mx-auto py-2 group"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative space-y-4"
      >
        {/* COMPARISON CONTAINER WITH SMOOTH ANIMATED SLIDER */}
        <div
          ref={containerRef}
          onMouseDown={() => setIsInteracting(true)}
          onMouseUp={() => setIsInteracting(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          onTouchMove={handleTouchMove}
          className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-xl cursor-ew-resize select-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* AFTER IMAGE (FULL UNDERNEATH LAYER) */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={activeProject.afterImg}
                  alt="After View"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3.5 right-3.5 px-3 py-1 bg-[#1D4ED8]/90 backdrop-blur-md rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md border border-white/30 z-10 pointer-events-none">
                  AFTER
                </div>
              </div>

              {/* BEFORE IMAGE (CLIPPED OVERLAY LAYER) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <div
                  className="relative h-full"
                  style={{ width: containerRef.current?.offsetWidth || '100%' }}
                >
                  <img
                    src={activeProject.beforeImg}
                    alt="Before View"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/20 z-10 pointer-events-none">
                    BEFORE
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* DRAGGABLE VERTICAL SLIDER HANDLE */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-xl z-20 flex items-center justify-center -ml-0.5"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white text-slate-800 border border-slate-200 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
              <GripVertical className="w-4 h-4 text-[#1D4ED8]" />
            </div>
          </div>
        </div>

        {/* CATEGORY TABS WITH SMOOTH SLIDING ACTIVE PILL */}
        <div className="pt-1">
          <div className="relative flex items-center justify-between gap-1 sm:gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80 overflow-x-auto">
            {CATEGORIES.map((cat, idx) => {
              const isActive = idx === categoryIndex;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryIndex(idx);
                    setSliderPosition(50);
                  }}
                  className={`relative flex-1 min-w-[75px] py-2 px-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-center z-10 ${
                    isActive ? 'text-white font-bold' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {/* Smooth Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-[#1D4ED8] rounded-xl shadow-md -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBTLE PAGINATION INDICATORS */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryIndex(idx);
                setSliderPosition(50);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === categoryIndex ? 'w-5 bg-[#1D4ED8]' : 'w-1.5 bg-slate-300'
              }`}
              aria-label={`Switch to ${cat.name}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
