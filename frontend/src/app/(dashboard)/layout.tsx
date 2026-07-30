import React from 'react';
import DashboardNavCard from '@/components/dashboard/DashboardNavCard';

/**
 * Dashboard Layout Wrapper
 * Renders full width container with DashboardNavCard top navigation list card (no sidebar).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FCFCFD] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Navigation List Card (Replaces Sidebar & Header) */}
        <DashboardNavCard />

        {/* Dynamic Page Content */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
