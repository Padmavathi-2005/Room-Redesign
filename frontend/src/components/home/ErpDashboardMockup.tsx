'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, IndianRupee, HardHat, Building2, Package, CheckCircle2 } from 'lucide-react';

export default function ErpDashboardMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto py-6">
      {/* Sleek Main Browser Mockup Window */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white/90 border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-400/20 p-5 sm:p-6 space-y-4 backdrop-blur-xl"
      >
        {/* Mock Window Control Dots */}
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>

        {/* Dashboard Grid Panels matching reference layout */}
        <div className="grid grid-cols-12 gap-3 pt-1">
          {/* Left Top Card (5 cols) */}
          <div className="col-span-5 p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex flex-col justify-between h-32">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Active Sites</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">14 Projects</p>
              <p className="text-[11px] text-emerald-600 font-medium">↑ On Schedule</p>
            </div>
          </div>

          {/* Right Top Card (7 cols) */}
          <div className="col-span-7 p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex flex-col justify-between h-32">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Construction Phase</span>
              <span className="text-blue-600 font-bold">76%</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 truncate">Horizon Tower - Structural Beams</p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-blue-600 rounded-full w-[76%]" />
              </div>
            </div>
          </div>

          {/* Bottom Large Main Panel (12 cols) */}
          <div className="col-span-12 p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Resource Allocation & Material Tracking</span>
              <span className="text-emerald-600 font-semibold">92% Available</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-center">
                <span className="text-[10px] text-slate-400 block">Cement & Steel</span>
                <span className="font-bold text-slate-800">Ready</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-center">
                <span className="text-[10px] text-slate-400 block">Labour Force</span>
                <span className="font-bold text-emerald-600">186 Present</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-center">
                <span className="text-[10px] text-slate-400 block">Invoices</span>
                <span className="font-bold text-blue-600">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FLOATING CARD 1: TOTAL BUDGET (Top Right) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-4 sm:-right-8 p-3.5 px-5 bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-300/40 backdrop-blur-md z-20 space-y-1.5"
      >
        <p className="text-[11px] font-semibold text-slate-500">Total Budget</p>
        <p className="text-base font-bold text-blue-700">$2.4M</p>
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full w-[82%]" />
        </div>
      </motion.div>

      {/* FLOATING CARD 2: ATTENDANCE (Bottom Left) */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-4 -left-4 sm:-left-8 flex items-center gap-3 p-3 px-4 bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-300/40 backdrop-blur-md z-20"
      >
        <div className="p-2 rounded-xl bg-emerald-600 text-white">
          <HardHat className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">98% Attendance</p>
          <p className="text-[10px] text-slate-500 font-medium">14 Active Sites</p>
        </div>
      </motion.div>
    </div>
  );
}
