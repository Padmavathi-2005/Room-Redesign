'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  LayoutGrid,
  Ruler,
  Home,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface ProductToolItem {
  id: string;
  name: string;
  category: 'FLOOR PLAN' | 'INTERIOR' | 'EXTERIOR';
  slug: string;
}

const DEFAULT_PRODUCT_CATEGORIES = [
  {
    title: 'FLOOR PLAN',
    icon: Ruler,
    items: [
      { label: 'Floor Plan Generator', href: '/generate?tool=floor-plan-generator' },
      { label: '3D Floor Plan', href: '/generate?tool=3d-floor-plan' },
      { label: 'Floor Plan Maker', href: '/generate?tool=floor-plan-maker' },
    ],
  },
  {
    title: 'INTERIOR',
    icon: Home,
    items: [
      { label: 'Interior Design', href: '/generate?tool=interior-design' },
      { label: 'AI Room Decorator', href: '/generate?tool=ai-room-decorator' },
      { label: 'AI Room Cleaner', href: '/generate?tool=ai-room-cleaner' },
      { label: 'Paint Color Visualizer', href: '/generate?tool=paint-color-visualizer' },
      { label: 'Style Transfer', href: '/generate?tool=style-transfer' },
      { label: 'Change Room Light', href: '/generate?tool=change-room-light' },
      { label: 'AI Wall Design', href: '/generate?tool=ai-wall-design' },
    ],
  },
  {
    title: 'EXTERIOR',
    icon: Building2,
    items: [
      { label: 'Exterior Design', href: '/generate?tool=exterior-design' },
      { label: 'Landscape Design', href: '/generate?tool=landscape-design' },
      { label: 'Garden Design', href: '/generate?tool=garden-design' },
      { label: 'Change Sky', href: '/generate?tool=change-sky' },
      { label: 'Sketch to Render', href: '/generate?tool=sketch-to-render' },
      { label: 'AI Architecture Generator', href: '/generate?tool=ai-architecture-generator' },
      { label: 'AI Blueprint Generator', href: '/generate?tool=ai-blueprint-generator' },
    ],
  },
];

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};
const API_BASE_URL = getApiBaseUrl();

export default function ProductsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_PRODUCT_CATEGORIES);

  // Automatically close mega dropdown on page scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Fetch dynamic AI tools database from NestJS Backend API
  useEffect(() => {
    async function fetchDbProductTools() {
      try {
        const res = await fetch(`${API_BASE_URL}/uploads/tools`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const dbTools: ProductToolItem[] = json.data;

            const floorPlanTools = dbTools
              .filter((t) => t.category === 'FLOOR PLAN')
              .map((t) => ({ label: t.name, href: `/generate?tool=${t.slug}` }));

            const interiorTools = dbTools
              .filter((t) => t.category === 'INTERIOR')
              .map((t) => ({ label: t.name, href: `/generate?tool=${t.slug}` }));

            const exteriorTools = dbTools
              .filter((t) => t.category === 'EXTERIOR')
              .map((t) => ({ label: t.name, href: `/generate?tool=${t.slug}` }));

            setCategories([
              {
                title: 'FLOOR PLAN',
                icon: Ruler,
                items: floorPlanTools.length > 0 ? floorPlanTools : DEFAULT_PRODUCT_CATEGORIES[0].items,
              },
              {
                title: 'INTERIOR',
                icon: Home,
                items: interiorTools.length > 0 ? interiorTools : DEFAULT_PRODUCT_CATEGORIES[1].items,
              },
              {
                title: 'EXTERIOR',
                icon: Building2,
                items: exteriorTools.length > 0 ? exteriorTools : DEFAULT_PRODUCT_CATEGORIES[2].items,
              },
            ]);
          }
        }
      } catch (err) {
        // Quiet fallback to default database pre-seeded tools
      }
    }
    fetchDbProductTools();
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* AI Models Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-1 text-sm font-medium text-[#0F172A] dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors focus:outline-none rounded-md group"
      >
        <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors" />
        <span>AI Models</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2563EB] dark:text-blue-400' : 'text-slate-400'
          }`}
        />
      </button>


      {/* Mega Menu Dropdown Window - Positioned mt-5 sm:mt-6 for clearance */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-[-60px] mt-5 sm:mt-6 w-[90vw] max-w-[730px] p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl shadow-blue-900/10 dark:shadow-black/60 backdrop-blur-2xl z-50 space-y-6 text-slate-800 dark:text-slate-100"
          >
            {/* 3 Columns Grid: FLOOR PLAN | INTERIOR | EXTERIOR */}
            <div className="grid grid-cols-3 gap-6">
              {categories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.title} className="space-y-3">
                    {/* Category Title Header */}
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-100 dark:border-slate-800 font-heading">
                      <CategoryIcon className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                      <span>{category.title}</span>
                    </div>

                    {/* Category Items List */}
                    <ul className="space-y-1">
                      {category.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 rounded-xl transition-all"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Bottom Bar Footer Link */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/tools"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group font-heading"
              >
                <span>View All AI Tools</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                20+ AI Architectural Tools Available
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
