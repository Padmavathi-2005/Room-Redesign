'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_SEARCH_ITEMS = [
  { title: 'Modern Living Room', category: 'Design Style', href: '/generate?style=modern' },
  { title: 'Scandinavian Bedroom', category: 'Design Style', href: '/generate?style=scandinavian' },
  { title: 'Minimalist Kitchen', category: 'Design Style', href: '/generate?style=minimalist' },
  { title: 'Pro Plan & Unlimited AI', category: 'Pricing', href: '/pricing' },
  { title: 'AI Architecture Generation Guide', category: 'Blog', href: '/blog' },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = QUICK_SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Search Dialog Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative z-10 w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            {/* Input Header */}
            <div className="flex items-center px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <Search className="w-5 h-5 text-indigo-500 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search styles, room types, features..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-1">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Recommendations
              </div>

              {filteredItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {item.title}
                      </p>
                      <span className="text-xs text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}

              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">
                  No matching results for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
