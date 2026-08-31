'use client';

import React, { useState, useEffect } from 'react';
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
import { isModelAllowedForUser, getRequiredPlanForModel } from '@/utils/planPermissions';
import AuthModal from '@/components/auth/AuthModal';

interface ToolItem {
  id: string;
  name: string;
  category: 'floorplan' | 'interior' | 'exterior' | 'editing';
  creditCost: number;
  description: string;
  badge?: string;
  icon: any;
  originalImage: string;
  convertedImage: string;
}

const ALL_TOOLS: ToolItem[] = [
  // Floor Plan
  {
    id: 'floor-plan-generator',
    name: 'Floor Plan Generator',
    category: 'floorplan',
    creditCost: 4,
    badge: 'Model 01',
    description: 'Convert sketches or layout specs into precise 2D architectural floor plans with dimensions.',
    icon: Ruler,
    originalImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3d-floor-plan',
    name: '3D Floor Plan',
    category: 'floorplan',
    creditCost: 8,
    badge: 'Popular',
    description: 'Transform 2D floor plans into interactive isometric 3D cutaway models with realistic furniture.',
    icon: Layers,
    originalImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'floor-plan-maker',
    name: 'Floor Plan Maker',
    category: 'floorplan',
    creditCost: 4,
    badge: 'CAD Builder',
    description: 'Generative CAD schematic maker for wall layouts, doors, windows, and room dimensions.',
    icon: FileCode2,
    originalImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop',
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
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'kitchen-design',
    name: 'Kitchen Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Design luxury kitchens with custom marble countertops, modern islands, and elegant cabinetry.',
    icon: Home,
    originalImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'bathroom-design',
    name: 'Bathroom Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Create spa-like bathroom retreats with marble vanities, glass showers, and brass fixtures.',
    icon: Home,
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'bedroom-design',
    name: 'Bedroom Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Redesign bedrooms with plush headboards, warm ambient lighting, and cozy neutral palettes.',
    icon: Home,
    originalImage: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'office-design',
    name: 'Office Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Build modern executive home offices with ergonomic setups, oak shelving, and ambient warmth.',
    icon: Home,
    originalImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'ai-room-decorator',
    name: 'AI Room Decorator',
    category: 'interior',
    creditCost: 4,
    badge: 'Popular',
    description: 'Instantly add curated furniture, indoor plants, wall art, and cozy decor to any space.',
    icon: Wand2,
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    category: 'interior',
    creditCost: 4,
    badge: 'Reference AI',
    description: 'Extract aesthetics from reference photos and transfer them directly into your room render.',
    icon: Brush,
    originalImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
  },

  // Editing & Utilities
  {
    id: 'ai-room-cleaner',
    name: 'AI Room Cleaner',
    category: 'editing',
    creditCost: 2,
    badge: 'Declutter',
    description: 'Remove clutter, stray boxes, and unwanted items to reveal clean, empty architectural spaces.',
    icon: Sparkles,
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'paint-color-visualizer',
    name: 'Paint Color Visualizer',
    category: 'editing',
    creditCost: 2,
    badge: 'Wall Paint',
    description: 'Test thousands of paint colors on your room walls before purchasing real paint.',
    icon: Paintbrush,
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'change-room-light',
    name: 'Change Room Light',
    category: 'editing',
    creditCost: 2,
    badge: 'Lighting AI',
    description: 'Switch daylighting to golden hour, cozy sunset warm lights, or moody ambient dusk glow.',
    icon: Sun,
    originalImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'ai-wall-design',
    name: 'AI Wall Design',
    category: 'editing',
    creditCost: 3,
    badge: 'Wall Accent',
    description: 'Add luxury wood slat panels, textured marble backdrops, or exposed brick accent walls.',
    icon: Layers,
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'ai-flooring-design',
    name: 'AI Flooring Design',
    category: 'editing',
    creditCost: 3,
    badge: 'Flooring',
    description: 'Replace flooring with herringbone oak hardwood, terrazzo tiles, or polished concrete.',
    icon: Layers,
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'change-furniture-ai',
    name: 'Change Furniture AI',
    category: 'editing',
    creditCost: 3,
    description: 'Swap individual sofas, tables, or beds while preserving room walls and ceiling layout.',
    icon: Wand2,
    originalImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
  },

  // Exterior & Architecture
  {
    id: 'exterior-design',
    name: 'Exterior Design AI',
    category: 'exterior',
    creditCost: 4,
    badge: 'Facade AI',
    description: 'Redesign building facades with modern glass, warm wood accents, and contemporary cladding.',
    icon: Building2,
    originalImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'landscape-design',
    name: 'Landscape Design',
    category: 'exterior',
    creditCost: 4,
    badge: 'Outdoor',
    description: 'Design lush front lawns, stone pathways, outdoor pergolas, and serene backyard patios.',
    icon: Trees,
    originalImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'garden-design',
    name: 'Garden Design',
    category: 'exterior',
    creditCost: 4,
    badge: 'Botanical',
    description: 'Create tranquil botanical gardens, Japanese Zen courtyards, and flower-bed arrangements.',
    icon: Trees,
    originalImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'change-sky',
    name: 'Change Sky',
    category: 'editing',
    creditCost: 2,
    badge: 'Sky Swap',
    description: 'Replace dull overcast exterior skies with vibrant blue sunshine or dramatic sunset clouds.',
    icon: Sun,
    originalImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sketch-to-render',
    name: 'Sketch to Render',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Convert quick pencil or CAD line sketches into 8k photorealistic architectural renders.',
    icon: Compass,
    originalImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'ai-architecture-generator',
    name: 'AI Architecture Generator',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Generative AI for designing cutting-edge parametric villas, skyscrapers, and structural facades.',
    icon: Building2,
    originalImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'ai-blueprint-generator',
    name: 'AI Blueprint Generator',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Generate high-precision technical blueprints with architectural elevation lines.',
    icon: FileCode2,
    originalImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
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
  const [toolsList, setToolsList] = useState<ToolItem[]>(ALL_TOOLS);

  useEffect(() => {
    async function fetchDbTools() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${baseUrl}/uploads/tools`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const dbTools = json.data.map((dbT: any) => {
              const matchedFallback = ALL_TOOLS.find((t) => t.id === dbT.slug);
              return {
                id: dbT.slug,
                name: dbT.name || matchedFallback?.name || dbT.slug,
                category: dbT.category || matchedFallback?.category || 'interior',
                creditCost: dbT.creditCost || matchedFallback?.creditCost || 4,
                description: dbT.description || matchedFallback?.description || '',
                badge: dbT.badge || matchedFallback?.badge,
                icon: matchedFallback?.icon || Home,
                originalImage: dbT.originalImage || matchedFallback?.originalImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
                convertedImage: dbT.convertedImage || matchedFallback?.convertedImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
              };
            });
            setToolsList(dbTools);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic DB tools:', err);
      }
    }
    fetchDbTools();
  }, []);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingToolHref, setPendingToolHref] = useState<string>('');
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{ isOpen: boolean; toolName: string; requiredPlan: string }>({
    isOpen: false,
    toolName: '',
    requiredPlan: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  const filteredTools = toolsList.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 text-slate-900 selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 space-y-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
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
            Explore our complete suite of AI-powered interior redesign, exterior rendering, 3D floor plan, and photo editing tools with real Original vs AI Converted previews.
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
                className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all whitespace-nowrap focus:outline-none cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-purple-50 hover:text-purple-700'
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
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>
        </div>

        {/* Tools Cards Grid (With Side-by-Side Original vs AI Converted Preview) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => {
            const ToolIcon = tool.icon;
            const isAllowed = isModelAllowedForUser(tool.id, currentUser);
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Top Header: Icon + Name + Category + Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
                        <ToolIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors font-heading leading-tight">
                          {tool.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-500 capitalize">
                          {tool.category === 'floorplan' ? 'Floor Plan' : tool.category === 'interior' ? 'Interior AI' : tool.category === 'exterior' ? 'Exterior AI' : 'Editing AI'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {!isAllowed ? (
                        <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs flex items-center gap-1 font-heading">
                          <Sparkles className="w-2.5 h-2.5 fill-white text-white" />
                          <span>PRO ✦</span>
                        </span>
                      ) : tool.badge ? (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-2xl bg-purple-100 text-purple-800 border border-purple-200/60">
                          {tool.badge}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        {tool.creditCost} credits
                      </span>
                    </div>
                  </div>

                  {/* BEFORE vs AFTER IMAGE SHOWCASE CARD */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 group/img shadow-inner">
                    <div className="grid grid-cols-2 h-44 sm:h-48 relative">
                      
                      {/* Left: Original Image */}
                      <div className="relative h-full overflow-hidden border-r border-white/20">
                        <img
                          src={tool.originalImage}
                          alt={`${tool.name} Original`}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-2xl bg-slate-900/80 backdrop-blur-md text-[9px] font-extrabold text-white border border-white/10 uppercase tracking-wider">
                          Original Photo
                        </div>
                      </div>

                      {/* Right: Converted AI Image */}
                      <div className="relative h-full overflow-hidden">
                        <img
                          src={tool.convertedImage}
                          alt={`${tool.name} Converted AI`}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-2xl bg-purple-600/90 backdrop-blur-md text-[9px] font-extrabold text-white border border-purple-400/30 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                          <span>AI Render</span>
                        </div>
                      </div>

                      {/* Center Divider Pill */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/60 shadow-xl flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-white text-purple-700 shadow-md border border-slate-200 flex items-center justify-center text-[10px] font-black">
                          VS
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                {/* Launch Button Footer */}
                <div className="pt-4">
                  {isAllowed ? (
                    <button
                      onClick={() => {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                        if (!token && !storedUser) {
                          setPendingToolHref(`/generate?tool=${tool.id}`);
                          setShowAuthModal(true);
                        } else {
                          window.location.href = `/generate?tool=${tool.id}`;
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-purple-500/25 cursor-pointer font-heading"
                    >
                      <span>Try {tool.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const reqPlan = getRequiredPlanForModel(tool.id);
                        setUpgradeModalInfo({
                          isOpen: true,
                          toolName: tool.name,
                          requiredPlan: reqPlan,
                        });
                      }}
                      className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer font-heading"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                      <span>Unlock {tool.name} (PRO ✦)</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty Search Result State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No AI tools matched your search</h3>
            <p className="text-xs text-slate-500">Try adjusting your keyword or filter tabs.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-xs rounded-2xl hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* UPGRADE PLAN REQUIRED MODAL OVERLAY */}
      {upgradeModalInfo.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md border border-amber-200">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-heading">
                <span>✦ PRO MODEL LOCKED</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                Upgrade Required for {upgradeModalInfo.toolName}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                This AI model is exclusively available on the <strong className="text-purple-600">{upgradeModalInfo.requiredPlan} Plan</strong> or higher. Upgrade your subscription to unlock all 18 AI models and ultra-HD quality renders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUpgradeModalInfo({ ...upgradeModalInfo, isOpen: false })}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer font-heading"
              >
                Cancel
              </button>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer font-heading flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade Plan Now</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
      {/* Auth Modal for Unauthenticated Tool Access */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={pendingToolHref || '/generate'}
      />
    </div>
  );
}
