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
  badge?: string;
  badgeCount?: number;
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

export default function NavItem({ href, label, onClick, requireAuth = false, badge, badgeCount }: NavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();

    if (requireAuth || isProtectedRoute(href)) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        if (!token) {
          e.preventDefault();
          router.push(`/login?redirect=${encodeURIComponent(href)}`);
          return;
        }
      }
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative py-1 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl group inline-flex items-center gap-1.5 ${
        isActive
          ? 'text-primary font-semibold'
          : 'text-slate-800 dark:text-slate-100 hover:text-primary'
      }`}
    >
      <span>{label}</span>

      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-2xs font-heading shrink-0">
          {badgeCount}
        </span>
      )}

      {badge && (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-2xs font-heading shrink-0">
          {badge}
        </span>
      )}

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-primary rounded-full shadow-xs shadow-primary/40"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* Hover Underline */}
      {!isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
      )}
    </Link>
  );
}
