'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Elena Rostova',
    role: 'Lead Interior Designer',
    company: 'Studio Lux Interiors',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'RoomAI cut our client proposal rendering time from 4 days to literally 3 minutes. Our client proposal conversion rate went up 40% immediately!',
  },
  {
    id: 'rev-2',
    name: 'Marcus Vance',
    role: 'Managing Director',
    company: 'Apex Commercial Builders',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The AI 3D floor plan generator and site attendance tracking in the ERP module have been game changers for our multi-story commercial projects.',
  },
  {
    id: 'rev-3',
    name: 'Sarah Jenkins',
    role: 'Real Estate Broker',
    company: 'Compass Luxury Properties',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Virtual staging with RoomAI lets us list empty homes looking fully furnished in luxury contemporary style without spending thousands on physical staging.',
  },
  {
    id: 'rev-4',
    name: 'David Chen',
    role: 'Principal Architect',
    company: 'Chen & Partners Architecture',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Sketch to 4K render is magic. I upload hand sketches during client meetings and show them photorealistic exterior facade options live in real time.',
  },
  {
    id: 'rev-5',
    name: 'Priya Sharma',
    role: 'Homeowner & Renovator',
    company: 'Villa Redesign Project',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Redesigned our entire villa interior before hiring contractors. We saved over $8,000 by testing furniture layouts and color schemes virtually first!',
  },
  {
    id: 'rev-6',
    name: 'James Wilson',
    role: 'Senior Project Manager',
    company: 'L&T Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Seamless coordination between site engineers and the office. The visual progress reports keep all stakeholders aligned on schedule.',
  },
];

export default function ReviewsSection() {
  return (
    <section className="relative w-full py-20 bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white selection:bg-blue-600 selection:text-white border-none">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-800 dark:text-indigo-300 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Customer Stories</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-heading"
          >
            Loved by Designers, Builders & Homeowners
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium"
          >
            See how RoomAI is transforming real estate, architecture, and interior design workflows worldwide.
          </motion.p>

          {/* Aggregate Rating Banner */}
          <div className="pt-2 flex items-center justify-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-500">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">4.9/5</span>
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              500+ Companies
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              99.4% On-Time Rate
            </span>
          </div>
        </div>

        {/* 6 Reviews Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 rounded-3xl p-7 shadow-lg shadow-indigo-500/5 dark:shadow-black/40 hover:shadow-xl hover:border-indigo-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-indigo-200 fill-indigo-50" />
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                  "{review.text}"
                </p>
              </div>

              {/* Author Profile Footer */}
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-heading">{review.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{review.role} • <span className="text-indigo-600 font-semibold">{review.company}</span></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
