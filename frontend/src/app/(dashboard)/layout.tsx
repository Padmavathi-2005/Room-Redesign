import React from 'react';

/**
 * Dashboard Route Layout Wrapper
 * Wraps user workspace, generation history, upload flow, and billing modules.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout-container min-h-screen flex flex-col">
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
