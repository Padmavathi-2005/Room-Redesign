'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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

    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('admin_token')) : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!token) {
      router.push('/pricing');
      return;
    }

    try {
      if (user) {
        const u = JSON.parse(user);
        if (typeof u?.credits === 'number' && u.credits <= 0) {
          router.push('/pricing');
          return;
        }
      }
    } catch (e) {}

    router.push(href);
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
          className={`products-dropdown-trigger flex items-center gap-1.5 px-2.5 py-1 text-sm font-semibold text-[#0F172A] dark:text-slate-100 hover:text-primary dark:hover:text-purple-300 transition-all focus:outline-none rounded-xl group cursor-pointer ${
            isOpen
              ? 'dark:bg-purple-500/20 dark:border dark:border-purple-400/40 dark:text-white dark:shadow-[0_0_14px_rgba(168,85,247,0.35)]'
              : 'dark:hover:bg-white/[0.06]'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-purple-400 group-hover:text-primary dark:group-hover:text-purple-300 transition-colors" />
          <span className="group-hover:translate-x-0.5 transition-transform">{label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary dark:text-purple-300' : 'text-slate-400 dark:text-purple-300/80 group-hover:dark:text-purple-300'
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
              className="absolute top-[calc(100%+26px)] left-[-290px] w-[90vw] max-w-[960px] z-[100] pointer-events-auto"
            >
              {/* Invisible Hover Bridge */}
              <div className="absolute -top-8 left-0 right-0 h-8 bg-transparent" />

              {/* Glassmorphic Dropdown Card Container */}
              <div className="products-dropdown-menu relative p-6 sm:p-7 bg-white dark:bg-[#0D121F]/95 border border-slate-200/90 dark:border dark:border-purple-500/40 rounded-2xl shadow-2xl shadow-indigo-900/15 dark:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(168,85,247,0.22)] backdrop-blur-2xl space-y-6 text-slate-800 dark:text-slate-100 after:content-[''] after:absolute after:-top-2.5 after:left-[322px] after:w-5 after:h-5 after:bg-white dark:after:hidden after:border-t after:border-l after:border-slate-200/90 after:rotate-45">

                {/* 3 Columns Grid: FLOOR PLAN | INTERIOR | EXTERIOR */}
                <div className="grid grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const CategoryIcon = category.icon;
                    const isFloorPlan = category.title === 'FLOOR PLAN';
                    const isInterior = category.title === 'INTERIOR';

                    const badgeColor = isFloorPlan
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200 border-blue-100 dark:border-blue-400/40 dark:shadow-[0_0_14px_rgba(59,130,246,0.35)]'
                      : isInterior
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-purple-500/20 dark:text-purple-200 border-indigo-100 dark:border-purple-400/40 dark:shadow-[0_0_14px_rgba(168,85,247,0.35)]'
                        : 'bg-cyan-50 text-cyan-700 dark:bg-emerald-500/20 dark:text-emerald-200 border-cyan-100 dark:border-emerald-400/40 dark:shadow-[0_0_14px_rgba(16,185,129,0.35)]';

                    const iconColor = isFloorPlan
                      ? 'text-blue-600 dark:text-blue-300'
                      : isInterior
                        ? 'text-indigo-600 dark:text-purple-300'
                        : 'text-cyan-600 dark:text-emerald-300';

                    return (
                      <div key={category.title} className="category-column-box space-y-3 dark:bg-white/[0.02] dark:p-4 dark:rounded-2xl dark:border dark:border-white/[0.07] dark:hover:border-purple-500/40 dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all">
                        {/* Category Title Pill Header */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-widest ${badgeColor}`}>
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
                                  className="group/item flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-purple-100 hover:bg-indigo-50/80 dark:hover:bg-purple-500/20 border border-transparent dark:hover:border-purple-400/40 dark:hover:shadow-[0_0_14px_rgba(168,85,247,0.35)] transition-all duration-150 cursor-pointer"
                                >
                                  <span className="truncate group-hover/item:translate-x-0.5 transition-transform">{item.label}</span>
                                  {isFeatured ? (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white shrink-0 shadow-2xs dark:shadow-[0_0_10px_rgba(168,85,247,0.45)]">
                                      4K AI
                                    </span>
                                  ) : (
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 text-indigo-600 dark:text-purple-300 transition-all -translate-x-1 group-hover/item:translate-x-0 shrink-0" />
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
                <div className="products-dropdown-footer p-3 sm:p-3.5 rounded-xl bg-slate-100/90 dark:bg-[#080C16] text-slate-900 dark:text-slate-100 flex items-center justify-between border border-slate-200 dark:border-white/10 shadow-xs">
                  <a
                    href="/tools"
                    onClick={(e) => handleToolClick(e, '/tools')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-purple-300 transition-colors group cursor-pointer"
                  >
                    <span className="catalogue-badge bg-blue-600 dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider dark:shadow-[0_0_10px_rgba(168,85,247,0.4)]">Catalogue</span>
                    <span>Browse All 20+ AI Architectural Tools</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-blue-600 dark:text-purple-300" />
                  </a>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                    </span>
                    <span className="hidden sm:inline font-semibold">AI Engine Active</span>
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
