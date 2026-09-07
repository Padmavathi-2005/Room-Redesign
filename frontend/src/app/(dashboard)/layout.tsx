'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PanelLeftOpen, Maximize2, Minimize2 } from 'lucide-react';
import SidebarNav from '@/components/layout/SidebarNav';
import PremiumAppLoader from '@/components/ui/PremiumAppLoader';

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
  const pathname = usePathname();
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prefetch login route for instant 0ms SPA redirect
    try {
      router.prefetch('/login');
    } catch {}

    const checkAuth = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
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

  if (!isMounted || isAuthenticated === false || isAuthenticated === null) {
    return <PremiumAppLoader size="md" fullScreen />;
  }

  return (
    <div id="dashboard-layout-root" className="bg-[#F3F5FF] dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-slate-100 selection:bg-purple-600 selection:text-white transition-colors duration-300 relative pt-[72px]">

      <div className={`max-w-[1720px] mx-auto flex items-start gap-5 px-3 sm:px-4 lg:px-6 pt-2 sm:pt-3 pb-6 ${isFocusMode ? 'w-full max-w-full' : ''}`}>
        {/* Persistent Left Sidebar Navigation */}
        {!isFocusMode && (
          <SidebarNav className="hidden lg:flex" />
        )}

        {/* Dynamic Workspace Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
