'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, HardHat, Landmark, Layers } from 'lucide-react';

const TRUST_PARTNERS = [
  { name: 'Apex Builders', icon: Building2 },
  { name: 'L&T Construction', icon: Landmark },
  { name: 'Shapoorji Pallonji', icon: Layers },
  { name: 'Godrej Properties', icon: ShieldCheck },
  { name: 'Tata Infrastructure', icon: HardHat },
  { name: 'DLF Developers', icon: Building2 },
  { name: 'Sobha Developers', icon: Landmark },
];

export default function TrustMarquee() {
  return (
    <div className="w-full py-10 border-t border-b border-slate-200/80 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Trusted by 500+ Top Construction Companies, Builders & Infrastructure Firms
        </p>
      </div>

      {/* Infinite Horizontal Scrolling Ticker Marquee */}
      <div className="relative w-full flex overflow-x-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...TRUST_PARTNERS, ...TRUST_PARTNERS].map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer group"
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform text-indigo-600" />
                <span className="text-base font-bold tracking-tight font-heading text-slate-800">{partner.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
