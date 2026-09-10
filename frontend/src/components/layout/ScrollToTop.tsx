'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop
 * Automatically resets scroll position to the very top (0, 0)
 * whenever the user redirects or navigates to any new page.
 */
export default function ScrollToTop() {
  let pathname = '';
  try {
    pathname = usePathname() || '';
  } catch {
    pathname = '';
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Immediately scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Reset HTML and Body scrollTop
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Reset any layout containers
    const dashboardRoot = document.getElementById('dashboard-layout-root');
    if (dashboardRoot) {
      dashboardRoot.scrollTop = 0;
    }

    // As an extra safeguard, run on next microtask/tick to catch layout renders
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
