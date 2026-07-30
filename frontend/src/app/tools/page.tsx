'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  Ruler,
  Home,
  Building2,
  Paintbrush,
  Zap,
  ArrowRight,
  Sun,
  Wand2,
  Trees,
  Layers,
  FileCode2,
  Brush,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  category: 'floorplan' | 'interior' | 'exterior' | 'editing';
  creditCost: number;
  description: string;
  badge?: string;
  icon: any;
}

const ALL_TOOLS: ToolItem[] = [
  // Floor Plan
  {
    id: 'floor-plan-generator',
    name: 'Floor Plan Generator',
    category: 'floorplan',
    creditCost: 4,
    description: 'Convert sketches or layout specs into precise 2D architectural floor plans with dimensions.',
    icon: Ruler,
  },
  {
    id: '3d-floor-plan',
    name: '3D Floor Plan',
    category: 'floorplan',
    creditCost: 8,
    badge: 'Popular',
    description: 'Transform 2D floor plans into interactive isometric 3D cutaway models with realistic furniture.',
    icon: Layers,
  },
  {
    id: 'floor-plan-maker',
    name: 'Floor Plan Maker',
    category: 'floorplan',
    creditCost: 4,
    description: 'Generative CAD schematic maker for wall layouts, doors, windows, and room dimensions.',
    icon: FileCode2,
  },

  // Interior Design
  {
    id: 'interior-design',
    name: 'Interior Design AI',
    category: 'interior',
    creditCost: 4,
    badge: 'Top Rated',
    description: 'Reimagine living rooms, bedrooms, and kitchens in 15+ architectural styles (Japandi, Modern, Boho).',
    icon: Home,
  },
  {
    id: 'kitchen-design',
    name: 'Kitchen Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Design luxury kitchens with custom marble countertops, modern islands, and elegant cabinetry.',
    icon: Home,
  },
  {
    id: 'bathroom-design',
    name: 'Bathroom Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Create spa-like bathroom retreats with marble vanities, glass showers, and brass fixtures.',
    icon: Home,
  },
  {
    id: 'bedroom-design',
    name: 'Bedroom Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Redesign bedrooms with plush headboards, warm ambient lighting, and cozy neutral palettes.',
    icon: Home,
  },
  {
    id: 'office-design',
    name: 'Office Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Build modern executive home offices with ergonomic setups, oak shelving, and ambient warmth.',
    icon: Home,
  },
  {
    id: 'ai-room-decorator',
    name: 'AI Room Decorator',
    category: 'interior',
    creditCost: 4,
    description: 'Instantly add curated furniture, indoor plants, wall art, and cozy decor to any space.',
    icon: Wand2,
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    category: 'interior',
    creditCost: 4,
    description: 'Extract aesthetics from reference photos and transfer them directly into your room render.',
    icon: Brush,
  },

  // Editing & Utilities
  {
    id: 'ai-room-cleaner',
    name: 'AI Room Cleaner',
    category: 'editing',
    creditCost: 2,
    badge: 'Fast',
    description: 'Remove clutter, stray boxes, and unwanted items to reveal clean, empty architectural spaces.',
    icon: Sparkles,
  },
  {
    id: 'paint-color-visualizer',
    name: 'Paint Color Visualizer',
    category: 'editing',
    creditCost: 2,
    description: 'Test thousands of paint colors on your room walls before purchasing real paint.',
    icon: Paintbrush,
  },
  {
    id: 'change-room-light',
    name: 'Change Room Light',
    category: 'editing',
    creditCost: 2,
    description: 'Switch daylighting to golden hour, cozy sunset warm lights, or moody ambient dusk glow.',
    icon: Sun,
  },
  {
    id: 'ai-wall-design',
    name: 'AI Wall Design',
    category: 'editing',
    creditCost: 3,
    description: 'Add luxury wood slat panels, textured marble backdrops, or exposed brick accent walls.',
    icon: Layers,
  },
  {
    id: 'ai-flooring-design',
    name: 'AI Flooring Design',
    category: 'editing',
    creditCost: 3,
    description: 'Replace flooring with herringbone oak hardwood, terrazzo tiles, or polished concrete.',
    icon: Layers,
  },
  {
    id: 'change-furniture-ai',
    name: 'Change Furniture AI',
    category: 'editing',
    creditCost: 3,
    description: 'Swap individual sofas, tables, or beds while preserving room walls and ceiling layout.',
    icon: Wand2,
  },

  // Exterior & Architecture
  {
    id: 'exterior-design',
    name: 'Exterior Design AI',
    category: 'exterior',
    creditCost: 4,
    badge: 'Popular',
    description: 'Redesign building facades with modern glass, warm wood accents, and contemporary cladding.',
    icon: Building2,
  },
  {
    id: 'landscape-design',
    name: 'Landscape Design',
    category: 'exterior',
    creditCost: 4,
    description: 'Design lush front lawns, stone pathways, outdoor pergolas, and serene backyard patios.',
    icon: Trees,
  },
  {
    id: 'garden-design',
    name: 'Garden Design',
    category: 'exterior',
    creditCost: 4,
    description: 'Create tranquil botanical gardens, Japanese Zen courtyards, and flower-bed arrangements.',
    icon: Trees,
  },
  {
    id: 'change-sky',
    name: 'Change Sky',
    category: 'editing',
    creditCost: 2,
    description: 'Replace dull overcast exterior skies with vibrant blue sunshine or dramatic sunset clouds.',
    icon: Sun,
  },
  {
    id: 'sketch-to-render',
    name: 'Sketch to Render',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Convert quick pencil or CAD line sketches into 8k photorealistic architectural renders.',
    icon: Compass,
  },
  {
    id: 'ai-architecture-generator',
    name: 'AI Architecture Generator',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Generative AI for designing cutting-edge parametric villas, skyscrapers, and structural facades.',
    icon: Building2,
  },
  {
    id: 'ai-blueprint-generator',
    name: 'AI Blueprint Generator',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Generate high-precision technical blueprints with architectural elevation lines.',
    icon: FileCode2,
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Tools (23)' },
  { id: 'interior', label: 'Interior Design' },
  { id: 'exterior', label: 'Exterior & Architecture' },
  { id: 'floorplan', label: 'Floor Plans' },
  { id: 'editing', label: 'Editing & Utilities' },
];

export default function ToolsCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = ALL_TOOLS.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 space-y-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Complete Suite of 20+ AI Architectural Tools</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-heading"
          >
            All AI Design & Floor Plan Tools
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-600 text-base sm:text-lg"
          >
            Explore our complete suite of AI-powered interior redesign, exterior rendering, 3D floor plan, and photo editing tools.
          </motion.p>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
                  selectedCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search AI tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => {
            const ToolIcon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group relative bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon + Category Badge + Credit Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <ToolIcon className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-2">
                      {tool.badge && (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-amber-100 text-amber-800">
                          {tool.badge}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        <Zap className="w-3 h-3 text-blue-600" />
                        {tool.creditCost} credits
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-heading">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Launch Button Footer */}
                <div className="pt-6">
                  <Link href={`/generate?tool=${tool.id}`}>
                    <button className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-blue-500/25">
                      <span>Try {tool.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty Search Result State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No AI tools matched your search</h3>
            <p className="text-xs text-slate-500">Try adjusting your keyword or filter tabs.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
