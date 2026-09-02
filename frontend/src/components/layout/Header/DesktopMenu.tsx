'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import NavItem from './NavItem';
import ProductsDropdown from './ProductsDropdown';

export interface NavLink {
  label: string;
  href: string;
}

export default function DesktopMenu() {
  const pathname = usePathname();

  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/generate') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/upload') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/designs') ||
    pathname.startsWith('/templates') ||
    pathname.startsWith('/shopping-list') ||
    pathname.startsWith('/profile');

  if (isDashboardRoute) {
    return (
      <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium">
        <ProductsDropdown label="AI Tools" />
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/projects" label="Projects" />
        <NavItem href="/generate" label="Generate" />
        <NavItem href="/billing" label="Credits & Plan" />
        <NavItem href="/settings" label="Profile" />
      </nav>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-sm font-medium">
      <NavItem href="/designs" label="Designs" />
      <ProductsDropdown />
      <NavItem href="/generate" label="Generate" requireAuth={true} />
      <NavItem href="/pricing" label="Pricing" />
      <NavItem href="/about" label="About" />
      <NavItem href="/contact" label="Contact" />
    </nav>
  );
}
