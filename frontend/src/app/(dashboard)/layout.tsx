import React from 'react';

/**
 * Dashboard Layout Wrapper
 * Uses the global top navigation header (same floating nav header from the home page) with top padding.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FCFCFD] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-300 pt-24 sm:pt-28 pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dynamic Page Content */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
