'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Folder,
  Heart,
  Wand2,
  Building2,
  Ruler,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  CreditCard,
  LayoutGrid,
  Info,
  Mail,
  HelpCircle,
} from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  credits: number;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<UserData>({
    name: 'Sangvish21',
    email: 'sangvish21@gmail.com',
    credits: 100,
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({
            name: parsed.name
              ? parsed.name.charAt(0).toUpperCase() + parsed.name.slice(1)
              : 'Sangvish21',
            email: parsed.email || 'sangvish21@gmail.com',
            credits: parsed.credits ?? 100,
          });
        } catch {
          // fallback
        }
      }
    }
  }, []);

  const capitalizeName = (name: string) => {
    if (!name) return 'User';
    return name
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getInitials = (name: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    window.location.href = '/';
  };

  // Main Workspace Navigation Items
  const mainNavItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'My Designs', href: '/history', icon: Folder },
    { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { label: 'Interior Design', href: '/generate?tool=interior-design', icon: Wand2 },
    { label: 'Exterior Design', href: '/generate?tool=exterior-design', icon: Building2 },
    { label: 'Floor Plan', href: '/generate?tool=floor-plan-generator', icon: Ruler },
    { label: 'Inspiration', href: '/dashboard/inspiration', icon: Sparkles },
  ];

  // Header Topics Navigation Items (Preserved & Merged into Sidebar)
  const headerTopicItems = [
    { label: 'Features', href: '/#features', icon: Sparkles },
    { label: 'Products', href: '/#products', icon: LayoutGrid },
    { label: 'Pricing', href: '/dashboard#pricing', icon: CreditCard },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Mail },
  ];

  const capitalizedName = capitalizeName(user.name);
  const initials = getInitials(user.name);

  return (
    <motion.aside
      layoutId="header-sidebar-morph"
      initial={{ x: -60, opacity: 0, scale: 0.98 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`relative h-screen sticky top-0 bg-white dark:bg-[#0F172A] border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* SIDEBAR HEADER: LOGO & COLLAPSE TOGGLE */}
      <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between px-5 h-20 border-b border-slate-100 dark:border-slate-800/80 sticky top-0 bg-white dark:bg-[#0F172A] z-10">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight font-heading">
                RoomAI
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* WORKSPACE NAVIGATION */}
        <nav className="p-3 space-y-1 mt-2">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase pb-1">
              Workspace
            </p>
          )}

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-2xs border border-blue-100 dark:border-blue-900/60 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {!isCollapsed && <span className="font-heading truncate text-xs sm:text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* HEADER TOPICS SECTION (INTEGRATED LANDING NAV TOPICS) */}
        <div className="px-3 pt-3 pb-2 border-t border-slate-100 dark:border-slate-800/80 mt-2 space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase pb-1">
              Platform & Topics
            </p>
          )}

          {headerTopicItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {!isCollapsed && <span className="font-heading truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION: CREDITS CARD & USER PROFILE */}
      <div className="p-3 space-y-3 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] z-10">
        
        {/* CREDITS CARD */}
        {!isCollapsed ? (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/60 dark:from-slate-900 dark:to-blue-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white font-heading leading-none">
                    {user.credits} Credits
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight pt-0.5">
                    Earn more points!
                  </p>
                </div>
              </div>
            </div>

            <Link href="/dashboard#pricing" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-3 text-[11px] font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Upgrade Now</span>
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center py-1" title={`${user.credits} Credits`}>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}

        {/* USER PROFILE FOOTER */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-xs">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-heading capitalize">
                    {capitalizedName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-90' : ''}`} />}
          </button>

          {/* PROFILE FOOTER POPUP MENU */}
          <AnimatePresence>
            {isProfileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 mb-2 w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-2xl z-50 space-y-1 text-xs"
                >
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 font-semibold"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.aside>
  );
}
