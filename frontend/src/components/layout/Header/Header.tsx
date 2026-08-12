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

  // Hide global navbar on Admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);
  const [user, setUser] = useState<UserProfileData | null>(null);


  // Observe modal status on body & DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkModalState = () => {
      const modalOpen = Boolean(
        document.body.getAttribute('data-modal-open') === 'true' ||
        document.documentElement.getAttribute('data-modal-open') === 'true' ||
        document.body.classList.contains('modal-open') ||
        document.querySelector('[data-modal-open="true"]')
      );
      setIsModalActive(modalOpen);
    };

    checkModalState();

    const interval = setInterval(checkModalState, 100);
    window.addEventListener('click', checkModalState, { capture: true });
    window.addEventListener('keydown', checkModalState, { capture: true });

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', checkModalState);
      window.removeEventListener('keydown', checkModalState);
      observer.disconnect();
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
        // Exclude admin tokens from home page user header
        if (parsed && parsed.role === 'admin') {
          setUser(null);
          return;
        }

        setUser({
          name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User',
          email: parsed.email || '',
          avatar: parsed.avatar,
          credits: parsed.credits ?? 40,
        });
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuthUser();
    window.addEventListener('storage', checkAuthUser);
    window.addEventListener('user-updated', checkAuthUser);
    return () => {
      window.removeEventListener('storage', checkAuthUser);
      window.removeEventListener('user-updated', checkAuthUser);
    };
  }, [checkAuthUser, pathname]);

  // Handle Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUser(null);
    window.location.href = '/login';
  };

  if (isModalActive) {
    return null;
  }

  return (
    <>
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-40 w-full px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-none">
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

          {/* CENTER: Original Home Navigation Links */}
          <DesktopMenu />

          {/* RIGHT: Actions (Wishlist Heart Icon, Theme, Profile / Auth Buttons) */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            {/* Wishlist Heart Button */}
            <Link href="/dashboard/wishlist">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label="View Wishlist"
                className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 text-rose-500 hover:border-rose-400 shadow-2xs hover:shadow-md hover:shadow-rose-500/20 flex items-center justify-center focus:outline-none transition-all"
              >
                <Heart className="w-4 h-4 fill-rose-500/20 text-rose-500 hover:fill-rose-500 transition-colors" />
              </motion.button>
            </Link>

            <ThemeToggle />

            {/* Regular User Auth State Rendering */}
            {user ? (
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
