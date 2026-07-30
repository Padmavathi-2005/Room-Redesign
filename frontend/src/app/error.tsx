'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h2 className="text-2xl font-bold mb-4 text-slate-900">Something went wrong!</h2>
      <p className="text-slate-600 mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
