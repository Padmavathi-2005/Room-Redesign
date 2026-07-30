'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import GetStartedButton from './GetStartedButton';

interface MobileMenuProps {
  onOpenSearch: () => void;
}

const MOBILE_NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Products (AI Tools)', href: '/tools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function MobileMenu({ onOpenSearch }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="lg:hidden">
      {/* Hamburger Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        className="p-2.5 rounded-full bg-white border border-[#E5E7EB] text-[#0F172A] hover:text-[#2563EB] focus:outline-none backdrop-blur-md shadow-2xs"
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
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white border-l border-slate-200 p-6 backdrop-blur-2xl flex flex-col justify-between shadow-2xl"
            >
              {/* Top Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                  <Logo />
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
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
                  className="w-full mt-4 flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>Search RoomAI...</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] bg-white rounded-md border text-slate-400">
                    ⌘K
                  </kbd>
                </button>

                {/* Mobile Nav Links */}
                <nav className="mt-6 space-y-1">
                  {MOBILE_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={toggleMenu}
                      className="flex items-center justify-between px-4 py-3 text-base font-medium text-slate-800 hover:text-[#2563EB] hover:bg-blue-50/60 rounded-2xl transition-colors"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-slate-500">Appearance</span>
                  <ThemeToggle />
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  <Link
                    href="/login"
                    onClick={toggleMenu}
                    className="w-full text-center py-2.5 text-sm font-medium text-[#0F172A] hover:text-[#2563EB]"
                  >
                    Sign In
                  </Link>
                  <GetStartedButton />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
