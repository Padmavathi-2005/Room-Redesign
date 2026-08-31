'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sofa,
  Bed,
  Utensils,
  ShowerHead,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface RoomTypeMapping {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  popularStyles: string[];
  mappedTools: {
    name: string;
    slug: string;
    creditCost: number;
    description: string;
  }[];
}

const ROOM_TYPE_DATA: RoomTypeMapping[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    category: 'Interior Category',
    description: 'Transform living spaces with custom sofa arrangements, coffee tables, wall art, and ambient light.',
    icon: Sofa,
    popularStyles: ['Modern', 'Japandi', 'Scandinavian', 'Industrial', 'Boho'],
    mappedTools: [
      { name: 'Interior Design AI', slug: 'interior-design', creditCost: 4, description: 'Complete living room redesign in 15+ styles' },
      { name: 'AI Room Decorator', slug: 'ai-room-decorator', creditCost: 4, description: 'Add curated furniture, plants, and art' },
      { name: 'Paint Color Visualizer', slug: 'paint-color-visualizer', creditCost: 2, description: 'Test thousands of wall paint colors' },
      { name: 'Change Room Light', slug: 'change-room-light', creditCost: 2, description: 'Golden hour, sunset warm, or neon ambient glow' },
      { name: 'Change Furniture AI', slug: 'change-furniture-ai', creditCost: 3, description: 'Swap sofas & coffee tables instantly' },
    ],
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    category: 'Interior Category',
    description: 'Create tranquil bedroom retreats with soft upholstered beds, warm sconce lights, and cozy palettes.',
    icon: Bed,
    popularStyles: ['Cozy Japandi', 'Modern Luxury', 'Minimalist Neutral', 'Boho Chic'],
    mappedTools: [
      { name: 'Bedroom Design AI', slug: 'bedroom-design', creditCost: 4, description: 'Restful master & guest bedroom designs' },
      { name: 'Interior Design AI', slug: 'interior-design', creditCost: 4, description: 'Complete style overhaul' },
      { name: 'Paint Color Visualizer', slug: 'paint-color-visualizer', creditCost: 2, description: 'Relaxing bedroom accent wall colors' },
      { name: 'Change Room Light', slug: 'change-room-light', creditCost: 2, description: 'Warm evening lighting ambiance' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Dining',
    category: 'Interior Category',
    description: 'Design chef kitchens featuring marble island countertops, tile backsplashes, and custom cabinetry.',
    icon: Utensils,
    popularStyles: ['Modern Marble', 'Farmhouse', 'Minimalist Wood', 'Industrial Metallic'],
    mappedTools: [
      { name: 'Kitchen Design AI', slug: 'kitchen-design', creditCost: 4, description: 'Luxury kitchen & island redesign' },
      { name: 'AI Flooring Design', slug: 'ai-flooring-design', creditCost: 3, description: 'Replace floor with terrazzo or hardwood' },
      { name: 'Paint Color Visualizer', slug: 'paint-color-visualizer', creditCost: 2, description: 'Test cabinet & wall color pairs' },
    ],
  },
  {
    id: 'bathroom',
    name: 'Bathroom & Spa',
    category: 'Interior Category',
    description: 'Reimagine bathrooms as luxury spa retreats with walk-in glass showers and marble vanities.',
    icon: ShowerHead,
    popularStyles: ['Modern Spa', 'Marble Luxury', 'Minimalist Tile', 'Rustic Wood'],
    mappedTools: [
      { name: 'Bathroom Design AI', slug: 'bathroom-design', creditCost: 4, description: 'Spa bathroom & marble vanity render' },
      { name: 'Paint Color Visualizer', slug: 'paint-color-visualizer', creditCost: 2, description: 'Waterproof paint & tile visualizer' },
      { name: 'AI Flooring Design', slug: 'ai-flooring-design', creditCost: 3, description: 'Non-slip luxury tile flooring' },
    ],
  },
];

export default function RoomTypesSection() {
  const [activeRoomId, setActiveRoomId] = useState<string>('living-room');

  const activeRoom = ROOM_TYPE_DATA.find((r) => r.id === activeRoomId) || ROOM_TYPE_DATA[0];

  return (
    <section className="relative w-full py-20 bg-white border-y border-slate-200/60 text-slate-900 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200 text-xs font-semibold text-indigo-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Room Type & Tool Mapping</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
            Browse AI Tools by Room Type
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Select your specific room type below to discover the exact AI tools, design styles, and features engineered for that space.
          </p>
        </div>

        {/* Clean Centered 4-Tab Pill Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {ROOM_TYPE_DATA.map((room) => {
            const RoomIcon = room.icon;
            const isActive = room.id === activeRoomId;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 focus:outline-none ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.03]'
                    : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-indigo-100/90 shadow-2xs'
                }`}
              >
                <RoomIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                <span>{room.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Room Detail Panel & Mapped Tools */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoom.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-indigo-100 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl shadow-indigo-500/5"
          >
            {/* Top Room Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <activeRoom.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                      {activeRoom.name}
                    </h3>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      {activeRoom.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  {activeRoom.description}
                </p>
              </div>

              {/* Supported Popular Styles Badges */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Styles Supported
                </span>
                <div className="flex flex-wrap gap-1.5 max-w-xs">
                  {activeRoom.popularStyles.map((style) => (
                    <span
                      key={style}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50/70 border border-indigo-100 rounded-2xl text-indigo-900 shadow-2xs"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mapped Tools Cards Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Compatible AI Tools Mapped for {activeRoom.name}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeRoom.mappedTools.map((tool) => (
                  <div
                    key={tool.slug}
                    className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-slate-900 font-heading">
                          {tool.name}
                        </h5>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Zap className="w-3 h-3 text-indigo-600" />
                          {tool.creditCost} credits
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <Link href={`/generate?tool=${tool.slug}&roomType=${encodeURIComponent(activeRoom.name)}`}>
                      <button className="w-full py-2 px-3 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                        <span>Launch {tool.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
