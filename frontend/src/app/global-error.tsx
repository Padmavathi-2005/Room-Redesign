'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 flex items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Application Error</h2>
          <p className="text-slate-600 mb-6">{error.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
