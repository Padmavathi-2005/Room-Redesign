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
  CreditCard,
  Info,
  Mail,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import ThemeToggle from '@/components/layout/Header/ThemeToggle';
import ProductsDropdown from '@/components/layout/Header/ProductsDropdown';

interface UserData {
  name: string;
  email: string;
  credits: number;
}

export default function DashboardNavCard() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData>({
    name: 'User',
    email: '',
    credits: 40,
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Automatically close profile menu on page scroll
  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleScroll = () => {
      setIsProfileMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser({
              name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User',
              email: parsed.email || '',
              credits: parsed.credits ?? 40,
            });
          } catch {
            // fallback
          }
        }
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    window.addEventListener('user-updated', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('user-updated', loadUser);
    };
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

  // Nav Items matching Home Page Header Topics + Workspace Links
  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Features', href: '/#features', icon: Sparkles },
    { label: 'Pricing', href: '/dashboard#pricing', icon: CreditCard },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Mail },
    { label: 'My Designs', href: '/history', icon: Folder },
    { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { label: 'Interior Design', href: '/generate?tool=interior-design', icon: Wand2 },
    { label: 'Exterior Design', href: '/generate?tool=exterior-design', icon: Building2 },
    { label: 'Floor Plan', href: '/generate?tool=floor-plan-generator', icon: Ruler },
    { label: 'Inspiration', href: '/dashboard/inspiration', icon: Sparkles },
  ];

  const capitalizedName = capitalizeName(user.name);
  const initials = getInitials(user.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-900/5 mb-8 space-y-4"
    >
      {/* CARD TOP BAR: LOGO, CREDITS BADGE, THEME TOGGLE, PROFILE */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight font-heading">
            RoomAI
          </span>
        </Link>

        {/* Right Controls: Credits Pill, Upgrade Button, Theme Toggle, Profile */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Credits Balance Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>{user.credits} Credits</span>
          </div>

          {/* Upgrade Button */}
          <Link href="/dashboard#pricing">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="py-1.5 px-3.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 font-heading"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Upgrade Now</span>
            </motion.button>
          </Link>

          <ThemeToggle />

          {/* User Profile Badge */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all focus:outline-none"
            >
              <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-extrabold shadow-inner">
                {initials}
              </div>
              <span className="text-xs font-bold capitalize font-heading hidden sm:inline">
                {capitalizedName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Popup */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-2xl z-50 space-y-1 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-extrabold text-slate-900 dark:text-white font-heading capitalize">{capitalizedName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 font-semibold"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
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
      </div>

      {/* HORIZONTAL NAV LIST CARD MATCHING HOME PAGE TOPICS & PRODUCTS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Home Link */}
        <Link
          href="/dashboard"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
            pathname === '/dashboard'
              ? 'bg-blue-600 text-white shadow-md font-bold'
              : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {/* Features Link */}
        <Link
          href="/#features"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Features</span>
        </Link>

        {/* Products Dropdown Component */}
        <div className="inline-flex items-center">
          <ProductsDropdown />
        </div>

        {/* Pricing Link */}
        <Link
          href="/dashboard#pricing"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-all"
        >
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>Pricing</span>
        </Link>

        {/* About Link */}
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-all"
        >
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>About</span>
        </Link>

        {/* Contact Link */}
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-all"
        >
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>Contact</span>
        </Link>

        {/* My Designs Link */}
        <Link
          href="/history"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
            pathname === '/history'
              ? 'bg-blue-600 text-white shadow-md font-bold'
              : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>My Designs</span>
        </Link>

        {/* Wishlist Link */}
        <Link
          href="/dashboard/wishlist"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-all"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          <span>Wishlist</span>
        </Link>
      </div>

    </motion.div>
  );
}
