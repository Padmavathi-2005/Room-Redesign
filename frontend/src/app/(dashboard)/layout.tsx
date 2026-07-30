import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ThemeToggle from '@/components/layout/Header/ThemeToggle';

/**
 * Dashboard Layout Wrapper
 * Integrates dedicated collapsible sidebar, theme toggle, and responsive page container.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FCFCFD] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Dedicated Collapsible Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Workspace Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Controls Bar */}
        <header className="h-16 px-6 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-blue-600 dark:text-blue-400 font-extrabold font-heading">RoomAI</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold capitalize">Dashboard Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
