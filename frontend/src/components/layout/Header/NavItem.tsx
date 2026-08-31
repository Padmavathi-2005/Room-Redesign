'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavItemProps {
  href: string;
  label: string;
  onClick?: () => void;
}

export default function NavItem({ href, label, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative py-1 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl group ${
        isActive
          ? 'text-[#2563EB] font-semibold'
          : 'text-[#0F172A] hover:text-[#2563EB]'
      }`}
    >
      <span>{label}</span>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-xs shadow-blue-500/40"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* Hover Underline */}
      {!isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#2563EB] rounded-full transition-all duration-300 group-hover:w-full" />
      )}
    </Link>
  );
}
