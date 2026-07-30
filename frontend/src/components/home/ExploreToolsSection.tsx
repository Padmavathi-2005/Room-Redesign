'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, GripVertical, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ToolOption {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  description: string;
  tags: string[];
  beforeImg: string;
  afterImg: string;
}

const TOOLS_DATA: ToolOption[] = [
  {
    id: 'interior',
    tabLabel: 'Interior Design Tool',
    badge: 'Interior Design Tool',
    title: 'Interior Design Tool',
    description:
      'Transform any room with professional interior design using RoomAI. Upload a photo and generate multiple options across 40+ styles instantly. AI assistance helps visualize furniture, color schemes, and lighting, making professional home design fast and easy.',
    tags: ['Contemporary Style', 'Optimal Layout', 'Smart Lighting'],
    beforeImg: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'landscape',
    tabLabel: 'Landscape Design Tool',
    badge: 'Landscape Design Tool',
    title: 'Landscape Design Tool',
    description:
      'Redesign your backyard, patio, and garden with AI landscape architecture. Explore patio pavers, swimming pools, outdoor dining setups, and lush greenery before starting work.',
    tags: ['Patio Pavers', 'Outdoor Lighting', 'Garden Plants'],
    beforeImg: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'architecture',
    tabLabel: 'Architecture Design Tool',
    badge: 'Architecture Design Tool',
    title: 'Architecture Design Tool',
    description:
      'Reimagine exterior facades, modern roofing, glass paneling, and architectural finishes before construction begins with instant AI photorealistic 4K rendering.',
    tags: ['Glass Facade', 'Solar Integration', 'Facade Cladding'],
    beforeImg: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'floorplan',
    tabLabel: 'Floor Plan Generator',
    badge: 'Floor Plan Generator',
    title: 'Floor Plan Generator',
    description:
      'Convert 2D sketches or room photos into 3D floor plan layouts and spatial arrangements instantly. Explore room relationships and dimensioning before building.',
    tags: ['3D Blueprint', 'Dimensioning', 'Room Partitioning'],
    beforeImg: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
  },
];

export default function ExploreToolsSection() {
  const [activeTabId, setActiveTabId] = useState<string>('interior');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage (0-100)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const activeTool = TOOLS_DATA.find((tool) => tool.id === activeTabId) || TOOLS_DATA[0];

  // Manual Mouse Drag / Move Handler (NO AUTO-MOVING)
  const handleMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 4) percentage = 4;
    if (percentage > 96) percentage = 96;
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <section className="relative w-full py-20 bg-white text-slate-900 selection:bg-blue-600 selection:text-white border-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Design Suite</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-heading"
          >
            Explore RoomAI AI Home Design Tools
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          >
            Professional-grade home design tools trusted by designers and homeowners worldwide. AI assistance makes creating interiors, exteriors, landscapes, and floor plans faster and easier.
          </motion.p>
        </div>

        {/* 4 Category Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
          <div className="inline-flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80">
            {TOOLS_DATA.map((tool) => {
              const isActive = tool.id === activeTabId;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTabId(tool.id);
                    setSliderPos(50);
                  }}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1D4ED8] text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tool.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/95 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* LEFT COLUMN: Tool Description & Tags */}
              <div className="lg:col-span-6 space-y-5 text-left">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {activeTool.badge}
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  {activeTool.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeTool.description}
                </p>

                {/* 3 Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeTool.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2">
                  <Link href={`/generate?tool=${activeTool.id}`}>
                    <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#1D4ED8] hover:bg-blue-700 rounded-2xl shadow-md transition-all">
                      <span>Try {activeTool.tabLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: MANUAL DRAG BEFORE & AFTER SLIDER (NO AUTO-MOVING) */}
              <div className="lg:col-span-6">
                <div
                  ref={sliderRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-lg cursor-ew-resize select-none"
                >
                  {/* AFTER IMAGE (FULL UNDERNEATH LAYER) */}
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={activeTool.afterImg}
                      alt="After Transformation"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3.5 right-3.5 px-3 py-1 bg-[#1D4ED8]/90 backdrop-blur-md rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md border border-white/30 z-10 pointer-events-none">
                      After
                    </div>
                  </div>

                  {/* BEFORE IMAGE (CLIPPED OVERLAY LAYER) */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <div
                      className="relative h-full"
                      style={{ width: sliderRef.current?.offsetWidth || '100%' }}
                    >
                      <img
                        src={activeTool.beforeImg}
                        alt="Before Transformation"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/20 z-10 pointer-events-none">
                        Before
                      </div>
                    </div>
                  </div>

                  {/* MANUAL DRAG VERTICAL HANDLE */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 flex items-center justify-center -ml-0.5"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="w-9 h-9 rounded-full bg-white text-slate-800 border border-slate-200 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                      <GripVertical className="w-4 h-4 text-[#1D4ED8]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
