'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Paintbrush,
  Building2,
  Home,
  Package,
  HardHat,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BenefitCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  checklist: string[];
}

const BENEFIT_CARDS: BenefitCard[] = [
  {
    id: 'real-estate',
    title: 'Real Estate Professionals',
    description:
      "Stage properties virtually, create marketing materials, and help clients visualize potential with RoomAI's AI home design features. Quick virtual staging makes showcasing properties simple and efficient.",
    icon: Building,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    checklist: ['Virtual staging', 'Marketing visuals', 'Client presentations'],
  },
  {
    id: 'interior-designers',
    title: 'Interior Designers',
    description:
      'Generate multiple design concepts rapidly and present options to clients efficiently with RoomAI. AI home design assistance streamlines your creative workflow, enabling faster iterations.',
    icon: Paintbrush,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    checklist: ['Quick iterations', 'Client proposals', 'Portfolio building'],
  },
  {
    id: 'architects-builders',
    title: 'Architects & Builders',
    description:
      'Create concept designs and visualize projects before construction using RoomAI. AI-assisted home design renderings help communicate ideas clearly to clients and contractors.',
    icon: Building2,
    iconBg: 'bg-indigo-50 border-indigo-100',
    iconColor: 'text-indigo-600',
    checklist: ['Concept visualization', 'Client communication', 'Project planning'],
  },
  {
    id: 'homeowners',
    title: 'Homeowners & Renovators',
    description:
      'Visualize room redesigns, try different interior styles, and plan renovations before spending on furniture or construction contractors with zero design experience required.',
    icon: Home,
    iconBg: 'bg-blue-100/70 border-blue-200',
    iconColor: 'text-blue-700',
    checklist: ['Style exploration', 'Budget planning', 'Renovation preview'],
  },
  {
    id: 'furniture-retailers',
    title: 'Furniture Retailers & Decorators',
    description:
      'Showcase furniture arrangements in photorealistic 3D room scenes to boost sales conversion and help customers select complementary decor easily.',
    icon: Package,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    checklist: ['Photorealistic staging', 'Product showcase', 'Customer engagement'],
  },
  {
    id: 'contractors-erp',
    title: 'Construction & ERP Teams',
    description:
      'Unite field teams, site engineers, and project managers with visual site reports, material tracking, and instant progress visualizers across active sites.',
    icon: HardHat,
    iconBg: 'bg-teal-50 border-teal-100',
    iconColor: 'text-teal-600',
    checklist: ['Site progress reports', 'Material & budget sync', 'Field communication'],
  },
];

export default function WhoBenefitsSection() {
  return (
    <section className="relative w-full py-20 bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 border-y border-[#4f46e5]/15 dark:border-[#4f46e5]/30 text-slate-900 dark:text-white selection:bg-indigo-600 selection:text-white">
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
            <span>RoomAI Users</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-heading"
          >
            Who Benefits from RoomAI?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 font-medium"
          >
            Perfect for anyone involved in home design and real estate, from professionals to homeowners.
          </motion.p>
        </div>

        {/* 6 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFIT_CARDS.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative bg-white border border-blue-100 rounded-2xl p-7 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.iconBg}`}
                  >
                    <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 font-heading">
                    {card.title}
                  </h3>

                  {/* Description Body */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Checklist Bullet Points */}
                <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
                  {card.checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
