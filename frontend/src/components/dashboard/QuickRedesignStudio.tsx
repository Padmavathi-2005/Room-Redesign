'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function QuickRedesignStudio() {
  const [selectedStyle, setSelectedStyle] = useState('Modern');

  const STYLES = [
    { name: 'Modern', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop' },
    { name: 'Minimalist', img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200&auto=format&fit=crop' },
    { name: 'Industrial', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop' },
    { name: 'Boho', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200&auto=format&fit=crop' },
    { name: 'Luxury', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=200&auto=format&fit=crop' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div>
        <h3 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
          Start a New Redesign
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Upload your room image and let AI work its magic
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Room Photo Box */}
        <Link
          href="/generate"
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 dark:border-purple-900 hover:border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl transition-all group text-center cursor-pointer"
        >
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-purple-600 shadow-sm group-hover:scale-110 transition-transform mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-extrabold text-purple-700 dark:text-purple-300">Upload Room Photo</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">JPG, PNG up to 10MB</p>
        </Link>

        {/* Popular Styles Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-heading">
              Popular Styles
            </span>
            <Link
              href="/generate"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {STYLES.map((st) => (
              <button
                key={st.name}
                type="button"
                onClick={() => setSelectedStyle(st.name)}
                className={`relative group rounded-2xl overflow-hidden aspect-4/5 border transition-all cursor-pointer ${
                  selectedStyle === st.name
                    ? 'border-purple-600 ring-2 ring-purple-500/30 scale-[1.03]'
                    : 'border-slate-200/80 dark:border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={st.img} alt={st.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-1">
                  <span className="text-[10px] font-bold text-white leading-none">{st.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
