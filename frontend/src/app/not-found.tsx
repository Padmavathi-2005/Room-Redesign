import React from 'react';
import Link from 'next/link';

/**
 * 404 Page Not Found Component Placeholder
 */
export default function NotFound() {
  return (
    <div className="not-found-container flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-2">404 - Page Not Found</h1>
      <p className="text-slate-600 mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700">
        Return Home
      </Link>
    </div>
  );
}
