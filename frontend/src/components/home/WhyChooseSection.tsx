'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, CheckCircle2, Box, Sparkles, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function WhyChooseSection() {
  return (
    <section className="relative w-full py-20 bg-white text-slate-900 selection:bg-blue-600 selection:text-white space-y-12 border-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 space-y-12">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Why Choose RoomAI</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-heading"
          >
            Why Choose RoomAI For Your Projects
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600"
          >
            Everything you need to design, visualize, and execute interior, exterior, and 3D architectural projects with AI.
          </motion.p>
        </div>

        {/* CARD 1: All-in-One AI Home Design Platform */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/95 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT: Stacked UI Previews */}
            <div className="lg:col-span-6 relative flex justify-center py-2">
              <div className="relative w-full max-w-md space-y-3.5">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80"
                    alt="AI Interior Design"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Free AI Interior Design
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">Living Room & Bedroom Redesign</h4>
                    <p className="text-[11px] text-slate-500">Transform original space with 30+ styles</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4 ml-4">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80"
                    alt="AI Sketch to Render"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Free AI Sketch to Render
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">Convert Sketches to 4K Renders</h4>
                    <p className="text-[11px] text-slate-500">Instant photorealistic conversion</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&auto=format&fit=crop&q=80"
                    alt="AI Exterior Design"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Free AI Exterior Design
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">Facade & Architecture Redesign</h4>
                    <p className="text-[11px] text-slate-500">Roofing, siding & landscape options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Text Content */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading leading-tight">
                All-in-One AI Home Design Platform
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Plan interiors, exteriors, landscapes, architecture, and furniture in one place. No need for multiple tools or subscriptions. Everything you need for complete AI home design is right here.
              </p>
              <div className="pt-2">
                <Link href="/generate">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none"
                  >
                    <span>AI Home Design</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>


        {/* CARD 2: Smart 3D Floor Plan Creation */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/95 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT: Text Content */}
            <div className="lg:col-span-6 space-y-5 text-left order-2 lg:order-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
                <Box className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading leading-tight">
                Smart 3D Floor Plan Creation
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Turn your floor plan into a clear 3D visualization with AI. Explore layouts, room relationships, and spatial arrangements before starting your home design project.
              </p>
              <div className="pt-2">
                <Link href="/generate?tool=3dfloorplan">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none"
                  >
                    <span>3D Floor Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* RIGHT: 3D Wireframe Graphic Showcase */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
                  alt="Smart 3D Floor Plan Creation"
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-blue-900/20 pointer-events-none" />
                <div className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[11px] font-bold text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI 3D Mesh Active</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>


        {/* CARD 3: No Design Knowledge Required */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/95 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT: Tablet / People Graphic */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80"
                  alt="No Design Knowledge Required"
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Beginner Friendly</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Text Content matching Card 3 */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading leading-tight">
                No Design Knowledge Required
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Anyone can create beautiful room designs without professional experience. RoomAI's AI room design tools make it easy to explore styles, furniture layouts, colors, and complete room transformations.
              </p>
              <div className="pt-2">
                <Link href="/generate?tool=interior">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none"
                  >
                    <span>AI Room Design</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

          </div>
        </motion.div>


        {/* CARD 4: Save Time and Reduce Costs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/95 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT: Text Content matching Card 4 */}
            <div className="lg:col-span-6 space-y-5 text-left order-2 lg:order-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                <DollarSign className="w-6 h-6 text-amber-700" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading leading-tight">
                Save Time and Reduce Costs
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Generate professional exterior designs in minutes instead of weeks. Explore different architectural styles, materials, colors, and outdoor design options before committing to a final plan.
              </p>
              <div className="pt-2">
                <Link href="/generate?tool=exterior">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none"
                  >
                    <span>AI Exterior Design</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* RIGHT: Modern Exterior Villa Graphic */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
                  alt="Save Time and Reduce Costs"
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exterior AI Renders</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
