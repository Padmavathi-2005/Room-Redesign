'use client';

import React from 'react';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full">
        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          !
        </div>
        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white font-heading">Application Error</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 break-words">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
