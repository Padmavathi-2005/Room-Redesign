'use client';

import React, { useState } from 'react';
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

const PRODUCT_CATEGORIES = [
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

export default function ProductsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Products Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-1 text-sm font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors focus:outline-none rounded-md group"
      >
        <LayoutGrid className="w-4 h-4 text-slate-500 group-hover:text-[#2563EB] transition-colors" />
        <span>Products</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2563EB]' : 'text-slate-400'
          }`}
        />
      </button>

      {/* Mega Menu Dropdown Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-[-60px] mt-3 w-[90vw] max-w-[720px] p-4 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-2xl backdrop-blur-2xl z-50 space-y-6"
          >
            {/* 3 Columns Grid: FLOOR PLAN | INTERIOR | EXTERIOR */}
            <div className="grid grid-cols-3 gap-6">
              {PRODUCT_CATEGORIES.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.title} className="space-y-3">
                    {/* Category Title Header */}
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                      <CategoryIcon className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{category.title}</span>
                    </div>

                    {/* Category Items List */}
                    <ul className="space-y-1">
                      {category.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-[#2563EB] hover:bg-blue-50/70 rounded-xl transition-all"
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
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/tools"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors group"
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
