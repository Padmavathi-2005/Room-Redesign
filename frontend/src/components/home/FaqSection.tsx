'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How does RoomAI transform room photos using AI?',
    answer:
      'Simply upload a photo of your existing room or raw construction site, select your preferred architectural style (Modern, Boho, Minimalist, Industrial, etc.), and RoomAI generates photorealistic 4K redesigns in seconds while preserving room dimensions.',
  },
  {
    id: 'faq-2',
    question: 'Can I use RoomAI for both interior and exterior designs?',
    answer:
      'Yes! RoomAI includes full suites for interior design, exterior facades, landscaping, patio design, 3D floor plan creation, and sketch-to-render conversions.',
  },
  {
    id: 'faq-3',
    question: 'Do credits expire if I do not use them all in a month?',
    answer:
      'No! On all subscription plans, your earned design credits never expire. You can use them whenever you need for upcoming home design or client projects.',
  },
  {
    id: 'faq-4',
    question: 'What file formats can I export my renders and blueprints in?',
    answer:
      'You can export high-resolution renders in 4K PNG, JPG, or PDF formats, as well as 3D floor plan layout files compatible with CAD and architectural tools.',
  },
  {
    id: 'faq-5',
    question: 'Is there a free trial or free credits to test RoomAI?',
    answer:
      'Yes! You can sign up for a free 7-day trial with complimentary generation credits to test all interior, exterior, and 3D floor plan tools before choosing a subscription.',
  },
  {
    id: 'faq-6',
    question: 'Can I use generated designs for commercial projects and client proposals?',
    answer:
      'Absolutely! All images and renders generated on Starter, Standard, and Professional plans include 100% commercial usage rights for client proposals, real estate listings, and portfolio marketing.',
  },
  {
    id: 'faq-7',
    question: 'How does the Construction ERP integrate with field teams?',
    answer:
      'Our Construction ERP module connects site engineers, labour managers, and contractors with live site progress tracking, attendance logs, material stock alerts, and automated budget reports.',
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative w-full py-20 bg-white text-slate-900 selection:bg-blue-600 selection:text-white border-none">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="text-center space-y-3 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-xs font-semibold text-blue-800 shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Got Questions?</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-heading"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-600 font-medium"
          >
            Everything you need to know about RoomAI's AI room redesign, construction ERP, credits, and subscription plans.
          </motion.p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5 hover:shadow-xl hover:border-blue-300 transition-all"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-base font-bold text-slate-900 font-heading pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-600 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-normal">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
