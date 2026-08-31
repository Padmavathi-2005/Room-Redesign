'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Wand2,
  Sparkles,
  Heart,
  ShoppingCart,
  Zap,
  Settings,
  Layers,
  Home,
  PanelLeftClose,
} from 'lucide-react';

interface SidebarNavProps {
  className?: string;
  onToggleCollapse?: () => void;
}

export default function SidebarNav({ className = '', onToggleCollapse }: SidebarNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Designs', href: '/designs', icon: Home },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'AI Tools', href: '/generate', icon: Wand2, badge: 'New' },
    { label: 'Templates', href: '/templates', icon: Layers },
    { label: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
    { label: 'Credits & Plans', href: '/billing', icon: Zap },
    { label: 'Profile Settings', href: '/profile', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col p-3.5 shrink-0 sticky top-[80px] self-start h-fit ${className}`}
    >
      {/* Navigation Links List */}
      <div className="space-y-1">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Hide Sidebar Action Button */}
      {onToggleCollapse && (
        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition-all cursor-pointer group"
            title="Hide Sidebar for Full Screen Workspace View"
          >
            <div className="flex items-center gap-2.5">
              <PanelLeftClose className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              <span>Hide Sidebar</span>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
