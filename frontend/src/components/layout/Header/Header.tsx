'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Logo from './Logo';
import DesktopMenu from './DesktopMenu';
import SearchButton from './SearchButton';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import LoginButton from './LoginButton';
import GetStartedButton from './GetStartedButton';
import ProfileDropdown from './ProfileDropdown';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  isAuthenticated?: boolean;
}

export default function Header({ isAuthenticated = false }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  // Listen for Ctrl+K or Cmd+K
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

  // Hide global floating header on Auth pages for clean full-screen presentation
  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null;
  }

  return (
    <>
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`pointer-events-auto relative w-full max-w-7xl px-4 sm:px-8 lg:px-10 flex items-center justify-between transition-all duration-300 rounded-3xl bg-white/95 border border-slate-200/70 shadow-md shadow-slate-900/5 backdrop-blur-xl ${
            isScrolled ? 'h-[64px] sm:h-[68px] shadow-lg shadow-slate-900/10' : 'h-[72px] sm:h-[76px]'
          }`}
        >
          {/* LEFT: RoomAI Brand Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* CENTER: Desktop Navigation */}
          <DesktopMenu />

          {/* RIGHT: Search Box, Circular Theme Toggle, Text Sign In, Gradient Get Started */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-7">
            <SearchButton onClick={() => setIsSearchOpen(true)} />
            <ThemeToggle />

            {isAuthenticated ? (
              <ProfileDropdown />
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
