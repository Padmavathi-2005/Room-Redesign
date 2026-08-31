'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto font-black text-xl">
            !
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">Application Error</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
