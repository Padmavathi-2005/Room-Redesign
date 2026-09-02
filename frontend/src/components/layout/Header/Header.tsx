'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

import Logo from './Logo';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import SearchButton from './SearchButton';
import ProfileDropdown from './ProfileDropdown';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from '@/components/ui/NotificationCenter';

interface UserProfileData {
  name: string;
  email: string;
  credits: number;
  plan: string;
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  isProfileHighlightEnabled?: boolean;
}

export default function Header() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfileData | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const isAppRoute = Boolean(
    pathname?.startsWith('/generate') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/projects') ||
    pathname?.startsWith('/designs') ||
    pathname?.startsWith('/templates') ||
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/wishlist') ||
    pathname?.startsWith('/shopping-list')
  );

  const isAppDashboard = Boolean((user && pathname !== '/') || isAppRoute);

  // Observe modal status on body & DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkModalState = () => {
      if (typeof document === 'undefined') return;
      const modalOpen = Boolean(
        document.body.getAttribute('data-modal-open') === 'true' ||
        document.body.getAttribute('data-fullscreen-workspace') === 'true' ||
        document.documentElement.getAttribute('data-modal-open') === 'true' ||
        document.body.classList.contains('modal-open')
      );
      setIsModalActive(modalOpen);
    };

    checkModalState();
    window.addEventListener('click', checkModalState);
    window.addEventListener('keydown', checkModalState);

    return () => {
      window.removeEventListener('click', checkModalState);
      window.removeEventListener('keydown', checkModalState);
    };
  }, []);

  // Check regular user auth session from localStorage
  const checkAuthUser = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const isAdmin = parsed && parsed.role && ['admin', 'ADMIN', 'main_admin', 'sub_admin'].includes(parsed.role);
        if (!isAdmin) {
          if (parsed.email === 'client@yopmail.com' || parsed.email === 'test@yopmail.com') {
            parsed.email = 'user@yopmail.com';
            parsed.firstName = 'Alex';
            parsed.name = 'Alex';
            parsed.credits = 0;
            localStorage.setItem('user', JSON.stringify(parsed));
          }

          const rawName = parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
          const emailName = parsed.email ? parsed.email.split('@')[0] : '';
          const displayName = rawName || (emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'Alex');

          setUser({
            name: displayName,
            email: parsed.email || 'user@yopmail.com',
            credits: parsed.credits ?? 0,
            plan: parsed.plan ? `${parsed.plan.toUpperCase()}` : 'FREE',
            avatar: parsed.avatar || parsed.avatarUrl || '',
            role: parsed.role,
            isProfileHighlightEnabled: parsed.isProfileHighlightEnabled ?? (parsed.plan ? ['PREMIUM', 'PRO', 'ENTERPRISE', 'VIP'].includes(parsed.plan.toUpperCase()) : false),
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuthUser();
    window.addEventListener('storage', checkAuthUser);
    window.addEventListener('user-credits-updated', checkAuthUser);
    return () => {
      window.removeEventListener('storage', checkAuthUser);
      window.removeEventListener('user-credits-updated', checkAuthUser);
    };
  }, [checkAuthUser, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset any lingering modal states on route navigation
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.removeAttribute('data-modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      setIsModalActive(false);
    }
  }, [pathname]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUser(null);
    window.location.href = '/login';
  };

  // Hide global user header on Admin pages
  if (!pathname || pathname.startsWith('/admin')) {
    return null;
  }

  // AUTHENTICATED DASHBOARD HEADER (FULL-WIDTH EDGE-TO-EDGE SQUARE NAVBAR)
  if (isAppDashboard) {
    return (
      <>
        <header id="global-header" ref={headerRef} className="fixed top-0 left-0 right-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 shadow-xs backdrop-blur-xl pointer-events-auto">
          <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 h-[64px] flex items-center justify-between">
            {/* LEFT SIDE: RoomAI Brand Logo */}
            <div className="shrink-0 flex items-center gap-3">
              <Logo />
            </div>

            {/* CENTER: Desktop Navigation Menu */}
            <div className="hidden md:flex flex-1 justify-center">
              <DesktopMenu />
            </div>

            {/* RIGHT SIDE: User Actions & Profile */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0">
              <NotificationCenter userId={(user as any)?._id || (user as any)?.id} />
              <ThemeToggle />

              {user && <ProfileDropdown user={user} onSignOut={handleSignOut} />}
            </div>

            {/* MOBILE MENU CONTROLS */}
            <div className="flex items-center gap-2 md:hidden">
              <SearchButton onClick={() => setIsSearchOpen(true)} />
              <MobileMenu onOpenSearch={() => setIsSearchOpen(true)} />
            </div>
          </div>
        </header>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </>
    );
  }

  // PUBLIC HOMEPAGE & AUTH PAGES HEADER (ELEGANT FLOATING CAPSULE PILL NAVBAR)
  return (
    <>
      <header
        id="global-header"
        ref={headerRef}
        className="fixed top-3 sm:top-5 left-0 right-0 z-40 w-full px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-none"
      >
        <div
          className={`pointer-events-auto relative w-full max-w-7xl px-4 sm:px-8 lg:px-10 flex items-center justify-between transition-all duration-300 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-lg shadow-slate-900/10 backdrop-blur-xl ${
            isScrolled ? 'h-[64px] sm:h-[68px]' : 'h-[72px] sm:h-[76px]'
          }`}
        >
          <Logo />
          <DesktopMenu />

          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            {user && <NotificationCenter userId={(user as any)?._id || (user as any)?.id} />}

            <ThemeToggle />

            {user ? (
              <ProfileDropdown user={user} onSignOut={handleSignOut} />
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <SearchButton onClick={() => setIsSearchOpen(true)} />
            <MobileMenu onOpenSearch={() => setIsSearchOpen(true)} />
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
