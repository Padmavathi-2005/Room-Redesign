import React from 'react';

/**
 * Global App Suspense & Loading State Placeholder
 */
export default function GlobalLoading() {
  return (
    <div className="global-loading-spinner flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
