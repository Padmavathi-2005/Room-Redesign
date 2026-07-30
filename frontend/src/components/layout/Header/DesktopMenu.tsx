'use client';

import React from 'react';
import NavItem from './NavItem';
import ProductsDropdown from './ProductsDropdown';

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function DesktopMenu() {
  return (
    <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
      <NavItem href="/#features" label="Features" />
      <ProductsDropdown />
      <NavItem href="/pricing" label="Pricing" />
      <NavItem href="/about" label="About" />
      <NavItem href="/contact" label="Contact" />
    </nav>
  );
}
