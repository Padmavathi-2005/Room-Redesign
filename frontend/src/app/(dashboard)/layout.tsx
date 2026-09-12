'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PanelLeftOpen, Maximize2, Minimize2 } from 'lucide-react';
import SidebarNav from '@/components/layout/SidebarNav';
import PremiumAppLoader from '@/components/ui/PremiumAppLoader';
import PreferencesSwitcher from '@/components/ui/PreferencesSwitcher';

/**
 * Dashboard Layout Wrapper
 * Protects dashboard routes and renders persistent Top Header + Left Sidebar layout shell.
 * When navigating between app pages, Header and Sidebar remain persistent and only the main content area ({children}) updates!
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  let rawPathname = '';
  try {
    rawPathname = usePathname() || '';
  } catch {
    rawPathname = '';
  }
  const pathname = rawPathname;
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedState = localStorage.getItem('sidebar-collapsed');
    if (storedState === 'true') {
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Scroll to top on every dashboard route change / redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', String(next));
      }
      return next;
    });
  };

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        if (next) {
          document.body.setAttribute('data-fullscreen-workspace', 'true');
          document.body.classList.add('fullscreen-workspace-active');
        } else {
          document.body.removeAttribute('data-fullscreen-workspace');
          document.body.classList.remove('fullscreen-workspace-active');
        }
      }
      return next;
    });
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prefetch login & pricing routes for instant 0ms SPA redirect
    try {
      router.prefetch('/login');
      router.prefetch('/pricing');
    } catch {}

    const checkAuth = () => {
      const isPricingPage = pathname === '/pricing' || pathname.startsWith('/pricing');
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      const userHasToken = Boolean(token);
      setIsLoggedIn(userHasToken);

      // 1. Pricing page is publicly accessible for everyone to see and select plans
      if (isPricingPage) {
        setIsAuthenticated(true);
        return;
      }

      // 2. Unauthenticated user: if attempting to visit generate or studio, redirect to pricing
      if (!userHasToken) {
        setIsAuthenticated(false);
        if (pathname === '/generate' || pathname.startsWith('/generate')) {
          router.replace('/pricing');
          return;
        }
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // 3. Authenticated user visiting /generate: if user has 0 credits, redirect to pricing
      if (pathname === '/generate' || pathname.startsWith('/generate')) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const parsedUser = JSON.parse(userStr);
            if (typeof parsedUser?.credits === 'number' && parsedUser.credits <= 0) {
              setIsAuthenticated(false);
              router.replace('/pricing');
              return;
            }
          }
        } catch (e) {}
      }

      setIsAuthenticated(true);
    };

    checkAuth();

    window.addEventListener('user-logged-out', checkAuth);
    window.addEventListener('auth-state-changed', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('user-logged-out', checkAuth);
      window.removeEventListener('auth-state-changed', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [router, pathname]);

  const isPricingRoute = pathname === '/pricing' || pathname.startsWith('/pricing');

  if (!isMounted || isAuthenticated === false || isAuthenticated === null) {
    return <PremiumAppLoader size="md" fullScreen />;
  }

  return (
    <div id="dashboard-layout-root" className="bg-[#F3F5FF] dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-slate-100 selection:bg-primary selection:text-white transition-colors duration-300 relative pt-[64px] overflow-x-clip w-full max-w-full">

      <div className={`w-full max-w-[1720px] mx-auto flex items-start gap-4 lg:gap-5 px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 lg:pt-6 pb-8 min-w-0 ${isFocusMode ? 'max-w-full' : ''}`}>
        {/* Persistent Left Sidebar Navigation (hidden for guests viewing pricing) */}
        {!isFocusMode && (!isPricingRoute || isLoggedIn) && (
          <SidebarNav className="hidden lg:flex shrink-0" />
        )}

        {/* Dynamic Workspace Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {children}

          {/* Minimal Clean Dashboard Workspace Footer */}
          <footer className="pt-8 pb-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
            <p>© 2026 RoomAI Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <PreferencesSwitcher placement="top" />
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
