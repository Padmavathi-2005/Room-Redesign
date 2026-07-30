'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wand2,
  Sparkles,
  Zap,
  FolderPlus,
  ArrowUpRight,
  Clock,
  Building2,
  Layers,
  Download,
  Plus,
  CheckCircle2,
  HardHat,
  TrendingUp,
  Image as ImageIcon,
  Ruler,
  Sliders,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface UserSession {
  name: string;
  email: string;
  role?: string;
  credits?: number;
}

const RECENT_GENERATIONS = [
  {
    id: 'gen-1',
    title: 'Modern Japandi Living Room',
    style: 'Japandi Minimalist',
    roomType: 'Living Room',
    image: '/samples/japandi_living.png',
    date: '2 hours ago',
    renderTime: '1.4s',
  },
  {
    id: 'gen-2',
    title: 'Sunlit Master Bedroom',
    style: 'Scandinavian Warmth',
    roomType: 'Bedroom',
    image: '/samples/bedroom_after.png',
    date: 'Yesterday',
    renderTime: '1.8s',
  },
  {
    id: 'gen-3',
    title: 'Contemporary Luxury Suite',
    style: 'Modern Luxury',
    roomType: 'Living Room',
    image: '/samples/living_after.png',
    date: '3 days ago',
    renderTime: '1.5s',
  },
];

const ACTIVE_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Penthouse Apartment Renovation',
    client: 'Heritage Developers',
    progress: 85,
    status: 'In Progress',
    deadline: 'Aug 15, 2026',
    rendersCount: 14,
  },
  {
    id: 'proj-2',
    name: 'Suburban Villa Landscape & Exterior',
    client: 'Apex Living',
    progress: 40,
    status: 'In Design',
    deadline: 'Sep 02, 2026',
    rendersCount: 8,
  },
  {
    id: 'proj-3',
    name: 'Downtown Commercial Office Suite',
    client: 'Nexus Group',
    progress: 100,
    status: 'Completed',
    deadline: 'Jul 28, 2026',
    rendersCount: 22,
  },
];

const AI_TOOL_SHORTCUTS = [
  {
    name: 'Interior Redesign',
    desc: 'Transform any room into 30+ interior styles',
    href: '/generate?tool=interior-design',
    icon: Wand2,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    name: '3D Floor Plan',
    desc: 'Convert 2D floor plans into photorealistic 3D',
    href: '/generate?tool=3d-floor-plan',
    icon: Ruler,
    color: 'from-indigo-600 to-purple-600',
  },
  {
    name: 'Exterior & Landscape',
    desc: 'Redesign building facades, gardens & sky',
    href: '/generate?tool=exterior-design',
    icon: Building2,
    color: 'from-purple-600 to-pink-600',
  },
  {
    name: 'Paint & Lighting',
    desc: 'Change wall colors & room ambient lighting',
    href: '/generate?tool=paint-color-visualizer',
    icon: Sliders,
    color: 'from-teal-600 to-cyan-600',
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<UserSession>({
    name: 'Padmavathi',
    email: 'user@roomai.com',
    role: 'Architect & Interior Designer',
    credits: 100,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({
            name: parsed.name ? parsed.name.charAt(0).toUpperCase() + parsed.name.slice(1) : 'Padmavathi',
            email: parsed.email || 'user@roomai.com',
            role: 'Architect & Interior Designer',
            credits: parsed.credits ?? 100,
          });
        } catch {
          // fallback
        }
      }
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 pt-4">

      {/* TOP WELCOME HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 overflow-hidden shadow-2xl shadow-blue-950/20 border border-white/10"
      >
        {/* Glowing Orbs Background Overlay */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-200 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{user.role}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Welcome back, <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-purple-300 bg-clip-text text-transparent">{user.name}</span>! 👋
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Your AI workspace is ready. You have <span className="font-bold text-amber-300">{user.credits} AI credits</span> available for instant 4K room renders and floor plan generations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/generate">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition-all focus:outline-none font-heading"
              >
                <Wand2 className="w-4 h-4 text-blue-600" />
                <span>New AI Redesign</span>
              </motion.button>
            </Link>

            <Link href="/projects">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl backdrop-blur-md transition-all focus:outline-none font-heading"
              >
                <FolderPlus className="w-4 h-4 text-blue-300" />
                <span>New Project</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* METRICS CARDS GRID (4 COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Total Generations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total AI Renders</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">48</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +12 this week
            </span>
          </div>
        </motion.div>

        {/* Metric 2: Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Projects</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">6</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">2 In Progress</span>
          </div>
        </motion.div>

        {/* Metric 3: Credit Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Credits Remaining</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">{user.credits}</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Pro Plan (500/mo)</span>
          </div>
        </motion.div>

        {/* Metric 4: Estimated Time Saved */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Time Saved with AI</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">34.5 hrs</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">92% faster</span>
          </div>
        </motion.div>

      </div>

      {/* AI DESIGN SUITE TOOLS SHORTCUTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
            AI Room Redesign Tools
          </h2>
          <Link href="/generate" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <span>Explore All 20+ Tools</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AI_TOOL_SHORTCUTS.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={tool.href}
                  className="group block p-6 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/40 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 h-full flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Generate Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RECENT RENDERS GALLERY & ACTIVE PROJECTS (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT 2 COLS: Recent AI Generations Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
              Recent AI Generations
            </h2>
            <Link href="/history" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {RECENT_GENERATIONS.map((gen, index) => (
              <motion.div
                key={gen.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-black/40 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={gen.image}
                    alt={gen.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white">
                    {gen.style}
                  </div>
                  <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current text-amber-300" />
                    {gen.renderTime}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading truncate">
                    {gen.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{gen.roomType}</span>
                    <span>{gen.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT 1 COL: Active ERP Projects Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
              Active Projects
            </h2>
            <Link href="/projects" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>All Projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {ACTIVE_PROJECTS.map((proj, index) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-md shadow-slate-200/40 dark:shadow-black/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{proj.client}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    proj.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>Progress</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    {proj.rendersCount} AI Renders
                  </span>
                  <span>Due {proj.deadline}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
