'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import NavItem from './NavItem';
import ProductsDropdown from './ProductsDropdown';
import { useTranslation } from '@/context/LanguageContext';

export interface NavLink {
  label: string;
  href: string;
}

export default function DesktopMenu() {
  const { t } = useTranslation();

  return (
    <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium">
      <NavItem href="/dashboard" label={t('nav.dashboard')} />
      <NavItem href="/projects" label={t('nav.projects')} />
      <ProductsDropdown label={t('nav.aiTools')} />
      <NavItem href="/generate" label={t('nav.generate')} />
      <NavItem href="/billing" label={t('nav.credits')} />
      <NavItem href="/transactions" label={t('nav.transactions')} />
      <NavItem href="/profile" label={t('nav.profile')} />
    </nav>
  );
}
