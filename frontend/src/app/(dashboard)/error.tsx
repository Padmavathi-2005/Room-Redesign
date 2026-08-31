'use client';

import React, { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error Caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto font-black text-xl">
          !
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Dashboard Encountered an Error</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error?.message || 'An unexpected issue occurred while rendering this page.'}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md active:scale-95"
        >
          Reload Dashboard Page
        </button>
      </div>
    </div>
  );
}
