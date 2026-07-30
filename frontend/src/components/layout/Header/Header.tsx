'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Logo from './Logo';
import DesktopMenu from './DesktopMenu';
import SearchButton from './SearchButton';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import LoginButton from './LoginButton';
import GetStartedButton from './GetStartedButton';
import ProfileDropdown, { UserProfileData } from './ProfileDropdown';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  isAuthenticated?: boolean;
}

export default function Header({ isAuthenticated: propIsAuth }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<UserProfileData | null>(null);

  // Check auth user from localStorage
  const checkAuthUser = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          name: parsed.name || 'Demo User',
          email: parsed.email || 'user@roomai.com',
          avatar: parsed.avatar,
          credits: parsed.credits ?? 100,
        });
      } catch {
        setUser({
          name: 'Demo User',
          email: 'user@roomai.com',
          credits: 100,
        });
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuthUser();
    // Listen for auth storage changes across tabs/components
    window.addEventListener('storage', checkAuthUser);
    return () => window.removeEventListener('storage', checkAuthUser);
  }, [checkAuthUser, pathname]);

  // Handle Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for Ctrl+K or Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Sign Out action
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUser(null);
    window.location.href = '/';
  };

  const isLoggedIn = Boolean(user || propIsAuth);

  // Hide global floating landing header on Dashboard routes for dedicated dashboard sidebar layout
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/generate') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/upload')
  ) {
    return null;
  }

  return (
    <>
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-none">
        <motion.div
          layoutId="header-sidebar-morph"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className={`pointer-events-auto relative w-full max-w-7xl px-4 sm:px-8 lg:px-10 flex items-center justify-between transition-all duration-300 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-md shadow-slate-900/5 dark:shadow-slate-950/40 backdrop-blur-xl ${
            isScrolled ? 'h-[64px] sm:h-[68px] shadow-lg shadow-slate-900/10' : 'h-[72px] sm:h-[76px]'
          }`}
        >
          {/* LEFT: Brand Logo */}
          <Logo />

          {/* CENTER: Navigation Links */}
          <DesktopMenu />

          {/* RIGHT: Actions (Wishlist Heart Icon, Theme, Profile / Auth Buttons) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            {/* Wishlist Heart Button */}
            <Link href="/dashboard/wishlist">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label="View Wishlist"
                className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 text-rose-500 hover:border-rose-400 shadow-2xs hover:shadow-md hover:shadow-rose-500/20 flex items-center justify-center focus:outline-none transition-all"
              >
                <Heart className="w-4 h-4 fill-rose-500/20 text-rose-500 hover:fill-rose-500 transition-colors" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border border-white dark:border-slate-900 shadow-xs">
                  3
                </span>
              </motion.button>
            </Link>

            <ThemeToggle />

            {isLoggedIn && user ? (
              <ProfileDropdown user={user} onSignOut={handleSignOut} />
            ) : (
              <>
                <LoginButton />
                <GetStartedButton />
              </>
            )}
          </div>

          {/* MOBILE: Drawer & Search Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <SearchButton onClick={() => setIsSearchOpen(true)} />
            <MobileMenu onOpenSearch={() => setIsSearchOpen(true)} />
          </div>
        </motion.div>
      </header>

      {/* Global Command Palette / Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
