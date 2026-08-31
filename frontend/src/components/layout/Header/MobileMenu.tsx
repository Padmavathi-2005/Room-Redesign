'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface MobileMenuProps {
  onOpenSearch: () => void;
}

const PUBLIC_NAV_LINKS = [
  { label: 'Designs', href: '/designs' },
  { label: 'AI Models', href: '/tools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];


const DASHBOARD_NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Designs', href: '/designs' },
  { label: 'Projects', href: '/projects' },
  { label: 'AI Tools', href: '/generate' },
  { label: 'Templates', href: '/templates' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Shopping List', href: '/shopping-list' },
  { label: 'Credits & Plans', href: '/pricing' },
  { label: 'Profile Settings', href: '/profile' },
];

export default function MobileMenu({ onOpenSearch }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isDashboardRoute =
    pathname !== '/' &&
    (pathname.startsWith('/dashboard') ||
     pathname.startsWith('/generate') ||
     pathname.startsWith('/designs') ||
     pathname.startsWith('/projects') ||
     pathname.startsWith('/templates') ||
     pathname.startsWith('/wishlist') ||
     pathname.startsWith('/shopping-list') ||
     pathname.startsWith('/profile') ||
     pathname.startsWith('/pricing'));

  const navLinks = isDashboardRoute ? DASHBOARD_NAV_LINKS : PUBLIC_NAV_LINKS;

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="lg:hidden">
      {/* Hamburger Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:text-blue-600 focus:outline-none backdrop-blur-md shadow-2xs"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Slide-over Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-md"
            />

            {/* Right Slide-over Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 backdrop-blur-2xl flex flex-col justify-between shadow-2xl"
            >
              {/* Top Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                  <Logo />
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Button */}
                <button
                  onClick={() => {
                    toggleMenu();
                    onOpenSearch();
                  }}
                  className="w-full mt-4 flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>Search RoomAI...</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded-2xl border text-slate-400">
                    ⌘K
                  </kbd>
                </button>

                {/* Mobile Nav Links */}
                <nav className="mt-6 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={toggleMenu}
                      className="flex items-center justify-between px-4 py-3 text-base font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 rounded-2xl transition-colors font-heading"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom Theme & Auth Options */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <ThemeToggle />
                <span className="text-xs font-bold text-slate-500">RoomAI Studio</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
