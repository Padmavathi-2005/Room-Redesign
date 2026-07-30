'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Users, HelpCircle, Mail, FileText } from 'lucide-react';

const RESOURCE_ITEMS = [
  { label: 'Blog', href: '/blog', description: 'Latest news, AI tips & articles', icon: BookOpen },
  { label: 'About', href: '/about', description: 'Our mission and AI vision', icon: Users },
  { label: 'FAQ', href: '/#faq', description: 'Frequently asked questions', icon: HelpCircle },
  { label: 'Contact', href: '/contact', description: 'Get in touch with support', icon: Mail },
  { label: 'Documentation', href: '/docs', description: 'API reference & user guides', icon: FileText },
];

export default function ResourcesDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 py-1 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
      >
        <span>Resources</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-white/90 dark:bg-slate-900/90 border border-white/80 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-2xl z-50 space-y-1"
          >
            {RESOURCE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
