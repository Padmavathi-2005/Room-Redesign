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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

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

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('user') || localStorage.getItem('admin_user');

    if (!token) {
      setIsAuthenticated(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsAuthenticated(true);
  }, [router, pathname]);

  if (isAuthenticated === false) {
    return <PremiumAppLoader size="md" fullScreen label="Redirecting to Sign In..." />;
  }

  if (isAuthenticated === null) {
    return <PremiumAppLoader size="md" fullScreen label="Verifying session..." />;
  }

  return (
    <div id="dashboard-layout-root" className="bg-[#F3F5FF] dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-slate-100 selection:bg-purple-600 selection:text-white transition-colors duration-300 relative pt-[72px]">

      {/* Floating Restore Sidebar Button (Visible when Sidebar is Collapsed & not in focus mode) */}
      {isSidebarCollapsed && !isFocusMode && (
        <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 pt-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 transition-all cursor-pointer"
            title="Show Sidebar Navigation"
          >
            <PanelLeftOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Show Sidebar</span>
          </button>
        </div>
      )}

      <div className={`max-w-[1720px] mx-auto flex items-start gap-5 px-3 sm:px-4 lg:px-6 pt-2 sm:pt-3 pb-6 ${isFocusMode ? 'w-full max-w-full' : ''}`}>
        {/* Persistent Left Sidebar Navigation (Hidden when collapsed or in focus mode) */}
        {!isSidebarCollapsed && !isFocusMode && (
          <SidebarNav className="hidden lg:flex" onToggleCollapse={toggleSidebar} />
        )}

        {/* Dynamic Workspace Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
