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

import AuthModal from '@/components/auth/AuthModal';

export interface ProductsDropdownProps {
  label?: string;
}

export default function ProductsDropdown({ label = 'AI Tools' }: ProductsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_PRODUCT_CATEGORIES);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingTargetUrl, setPendingTargetUrl] = useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleToolClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!token && !user) {
      setPendingTargetUrl(href);
      setShowAuthModal(true);
    } else {
      window.location.href = href;
    }
  };

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
    <>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* AI Models Dropdown Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 py-1 text-sm font-medium text-[#0F172A] dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors focus:outline-none rounded-2xl group cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors" />
          <span>{label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#2563EB] dark:text-blue-400' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Mega Menu Dropdown Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[calc(100%+28px)] left-[-320px] w-[94vw] max-w-[1040px] z-50 pointer-events-auto"
            >
              {/* Invisible Hover Bridge */}
              <div className="absolute -top-8 left-0 right-0 h-8 bg-transparent" />

              {/* Glassmorphic Dropdown Card Container */}
              <div className="relative p-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-indigo-900/15 dark:shadow-black/80 backdrop-blur-2xl space-y-6 text-slate-800 dark:text-slate-100 after:content-[''] after:absolute after:-top-2.5 after:left-[352px] after:w-5 after:h-5 after:bg-white dark:after:bg-slate-900 after:border-t after:border-l after:border-slate-200/90 dark:after:border-slate-800 after:rotate-45">

                {/* 3 Columns Grid: FLOOR PLAN | INTERIOR | EXTERIOR */}
                <div className="grid grid-cols-3 gap-5">
                  {categories.map((category) => {
                    const CategoryIcon = category.icon;
                    const isFloorPlan = category.title === 'FLOOR PLAN';
                    const isInterior = category.title === 'INTERIOR';

                    const badgeColor = isFloorPlan
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-100 dark:border-blue-900'
                      : isInterior
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900'
                        : 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-100 dark:border-cyan-900';

                    const iconColor = isFloorPlan
                      ? 'text-blue-600 dark:text-blue-400'
                      : isInterior
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-cyan-600 dark:text-cyan-400';

                    return (
                      <div key={category.title} className="space-y-2.5">
                        {/* Category Title Pill Header */}
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl border text-[10px] font-extrabold uppercase tracking-widest ${badgeColor}`}>
                          <CategoryIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                          <span>{category.title}</span>
                        </div>

                        {/* Category Items List */}
                        <ul className="space-y-1">
                          {category.items.map((item) => {
                            const isFeatured = item.label === 'Interior Design' || item.label === '3D Floor Plan' || item.label === 'Sketch to Render';
                            return (
                              <li key={item.label}>
                                <a
                                  href={item.href}
                                  onClick={(e) => handleToolClick(e, item.href)}
                                  className="group/item flex items-center justify-between px-2.5 py-1.5 rounded-2xl text-[12px] font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/50 transition-all duration-150 cursor-pointer"
                                >
                                  <span className="truncate group-hover/item:translate-x-0.5 transition-transform">{item.label}</span>
                                  {isFeatured ? (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0 shadow-2xs">
                                      4K AI
                                    </span>
                                  ) : (
                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 text-indigo-600 dark:text-indigo-400 transition-all -translate-x-1 group-hover/item:translate-x-0 shrink-0" />
                                  )}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Clean Footer Banner */}
                <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                  <a
                    href="/tools"
                    onClick={(e) => handleToolClick(e, '/tools')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
                  >
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider">Catalogue</span>
                    <span>Browse All 20+ AI Architectural Tools</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-blue-600 dark:text-blue-400" />
                  </a>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="hidden sm:inline">AI Engine Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={pendingTargetUrl || '/generate'}
      />
    </>
  );
}
