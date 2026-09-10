'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import SearchButton from './SearchButton';
import ProfileDropdown from './ProfileDropdown';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from '@/components/ui/NotificationCenter';
import { useTranslation } from '@/context/LanguageContext';

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
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const { t } = useTranslation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfileData | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);

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

  // Check regular user auth session from localStorage and reconcile with server
  const checkAuthUser = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      const rawName = parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
      const emailName = parsed.email ? parsed.email.split('@')[0] : '';
      const displayName = rawName || (emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'User');

      const userPlan = (parsed.plan || '').toUpperCase();
      const isProPlan = ['PRO', 'PREMIUM', 'ENTERPRISE', 'VIP'].includes(userPlan);

      let userAvatar = parsed.avatar || parsed.avatarUrl || '';
      if (userAvatar.includes('unsplash.com')) {
        userAvatar = '';
      }

      setUser({
        name: displayName,
        email: parsed.email || 'user@yopmail.com',
        credits: parsed.credits ?? 0,
        plan: userPlan || 'FREE',
        avatar: userAvatar,
        role: parsed.role || 'user',
        isProfileHighlightEnabled: isProPlan,
      });

      // Async fetch fresh server-reconciled user status with fast 3s timeout
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const res = await fetch(`${baseUrl}/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const freshCredits = data.credits ?? parsed.credits ?? 0;
          if (freshCredits !== parsed.credits) {
            const updatedLocalUser = { ...parsed, credits: freshCredits };
            localStorage.setItem('user', JSON.stringify(updatedLocalUser));
            setUser((prev) => (prev ? { ...prev, credits: freshCredits } : null));
          }
        } else if (res.status === 401) {
          // Token is invalid or expired! Clean up stale auth state immediately
          console.warn('Session token expired or invalid (401). Logging out.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          window.dispatchEvent(new Event('user-logged-out'));
          window.dispatchEvent(new Event('auth-state-changed'));
        }
      } catch {
        // Timeout or offline network fallback - keep existing state without blocking render
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuthUser();

    const handleAuthStateChange = () => {
      checkAuthUser();
    };

    window.addEventListener('storage', handleAuthStateChange);
    window.addEventListener('user-credits-updated', handleAuthStateChange);
    window.addEventListener('user-updated', handleAuthStateChange);
    window.addEventListener('user-logged-out', handleAuthStateChange);
    window.addEventListener('auth-state-changed', handleAuthStateChange);

    return () => {
      window.removeEventListener('storage', handleAuthStateChange);
      window.removeEventListener('user-credits-updated', handleAuthStateChange);
      window.removeEventListener('user-updated', handleAuthStateChange);
      window.removeEventListener('user-logged-out', handleAuthStateChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
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

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.dispatchEvent(new Event('user-logged-out'));
      window.dispatchEvent(new Event('auth-state-changed'));
    }
    setUser(null);
    router.replace('/login');
  };

  // Hide global user header on Admin pages
  if (!pathname || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        id="global-header"
        ref={headerRef}
        className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 shadow-xs backdrop-blur-xl pointer-events-auto"
      >
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
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 shrink-0">
            {user && <NotificationCenter userId={(user as any)?._id || (user as any)?.id} />}
            <ThemeToggle />

            {user ? (
              <ProfileDropdown user={user} onSignOut={handleSignOut} />
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  href="/signup"
                  className="text-xs font-semibold px-5 py-2 rounded-[10px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-md shadow-purple-500/20 hover:shadow-lg transition-all whitespace-nowrap"
                >
                  {t('nav.getStarted')}
                </Link>
              </div>
            )}
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
