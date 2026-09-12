'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavItemProps {
  href: string;
  label: string;
  onClick?: () => void;
  requireAuth?: boolean;
}

const PROTECTED_ROUTES = [
  '/dashboard',
  '/designs',
  '/generate',
  '/projects',
  '/history',
  '/billing',
  '/settings',
  '/profile',
  '/upload',
  '/checkout',
  '/shopping-list',
  '/wishlist',
];

const isProtectedRoute = (path: string) => {
  const cleanPath = path.split('?')[0].split('#')[0];
  return PROTECTED_ROUTES.some((route) => cleanPath === route || cleanPath.startsWith(`${route}/`));
};

export default function NavItem({ href, label, onClick, requireAuth = false }: NavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();

    if (requireAuth || isProtectedRoute(href)) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        const isGenerateRoute = href === '/generate' || href.startsWith('/generate');

        if (!token) {
          e.preventDefault();
          if (isGenerateRoute) {
            router.push('/pricing');
            return;
          }
          router.push(`/login?redirect=${encodeURIComponent(href)}`);
          return;
        }

        if (isGenerateRoute) {
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const u = JSON.parse(userStr);
              if (typeof u?.credits === 'number' && u.credits <= 0) {
                e.preventDefault();
                router.push('/pricing');
                return;
              }
            }
          } catch (err) {}
        }
      }
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative py-1 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl group ${
        isActive
          ? 'text-primary dark:text-white font-extrabold'
          : 'text-slate-800 dark:text-slate-100 dark:font-semibold hover:text-primary dark:hover:text-purple-300'
      }`}
    >
      <span>{label}</span>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-primary dark:bg-gradient-to-r dark:from-purple-400 dark:via-indigo-300 dark:to-purple-400 rounded-full shadow-xs shadow-primary/40 dark:shadow-[0_0_12px_rgba(168,85,247,0.9)]"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* Hover Underline */}
      {!isActive && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary dark:bg-purple-400/80 rounded-full transition-all duration-300 group-hover:w-full dark:group-hover:shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
      )}
    </Link>
  );
}
