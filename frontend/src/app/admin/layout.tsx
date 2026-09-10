'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutGrid, Shield, User, ChevronRight, Settings, LayoutDashboard, CreditCard, Search, Bell, Menu, X, Wand2, FileText, BarChart3, Receipt, ShieldCheck, Users, PhoneCall, Coins, Globe } from 'lucide-react';
import Link from 'next/link';

import { AdminSearchProvider, useAdminSearch } from '@/context/AdminSearchContext';
import NotificationCenter from '@/components/ui/NotificationCenter';
import PreferencesSwitcher from '@/components/ui/PreferencesSwitcher';
import { useTranslation } from '@/context/LanguageContext';

interface AdminUserProfile {
  name: string;
  email: string;
}

function AdminLayoutHeader({
  pathname,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  pathname: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}) {
  const { searchQuery, setSearchQuery } = useAdminSearch();
  const { t } = useTranslation();

  const getHeaderTitle = () => {
    if (pathname.startsWith('/admin/cms')) return t('admin.headers.cms') || 'CMS & Custom Page Builder';
    switch (pathname) {
      case '/admin/dashboard':
        return t('admin.headers.dashboard') || 'Dashboard Overview';
      case '/admin/notifications':
        return t('admin.headers.notifications') || 'Notifications & System Alerts';
      case '/admin/analytics':
        return t('admin.headers.analytics') || 'Analytics & Revenue Console';
      case '/admin/models':
        return t('admin.headers.models') || 'AI Models & Image Tools Catalog';
      case '/admin/users':
        return t('admin.headers.users') || 'Users Management Console';
      case '/admin/projects':
        return t('admin.headers.projects') || 'Project & Room Management';
      case '/admin/admins':
        return t('admin.headers.admins') || 'Admin Team & Roles Control';
      case '/admin/images':
        return t('admin.headers.images') || 'Converted Images Gallery';
      case '/admin/plans':
        return t('admin.headers.plans') || 'Subscription Plans Manager';
      case '/admin/currencies':
        return t('admin.headers.currencies') || 'Currencies';
      case '/admin/languages':
        return t('admin.headers.languages') || 'Languages';
      case '/admin/transactions':
        return t('admin.headers.transactions') || 'Lite Payment Transactions & Invoices';
      case '/admin/leads':
        return t('admin.headers.leads') || 'Demo Requests & Enterprise Onboarding';
      case '/admin/settings':
        return t('admin.headers.settings') || 'Admin Settings Console';
      case '/admin/logs':
        return t('admin.headers.logs') || 'Audit & System API Logs';
      default:
        return t('admin.headers.controlPanel') || 'Admin Control Panel';
    }
  };

  const getSearchPlaceholder = () => {
    if (pathname.startsWith('/admin/cms')) return t('admin.headers.searchCms') || 'Search CMS pages & builder...';
    switch (pathname) {
      case '/admin/currencies':
        return t('admin.headers.searchCurrencies') || 'Search currencies by code or name...';
      case '/admin/languages':
        return t('admin.headers.searchLanguages') || 'Search languages by code or name...';
      case '/admin/leads':
        return t('admin.headers.searchLeads') || 'Search leads by name, email, phone or company...';
      case '/admin/users':
        return t('admin.headers.searchUsers') || 'Search users by name, email, role...';
      case '/admin/transactions':
        return t('admin.headers.searchTransactions') || 'Search ID, user email, plan, gateway...';
      case '/admin/projects':
        return t('admin.headers.searchProjects') || 'Search projects by title, room type...';
      case '/admin/models':
        return t('admin.headers.searchModels') || 'Search AI models or tools...';
      case '/admin/images':
        return t('admin.headers.searchImages') || 'Search converted images...';
      case '/admin/admins':
        return t('admin.headers.searchAdmins') || 'Search admin team members...';
      case '/admin/plans':
        return t('admin.headers.searchPlans') || 'Search pricing plans...';
      case '/admin/analytics':
        return t('admin.headers.searchAnalytics') || 'Search metrics or design styles...';
      case '/admin/notifications':
        return t('admin.headers.searchNotifications') || 'Search notifications by title or message...';
      case '/admin/logs':
        return t('admin.headers.searchLogs') || 'Search audit logs...';
      default:
        return t('admin.headers.searchResource') || 'Search admin resources...';
    }
  };

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-2xs z-20">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-2xs shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white truncate font-heading leading-tight">
          {getHeaderTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Search Input */}
        {pathname !== '/admin/analytics' && pathname !== '/admin/settings' && (
          <div className="relative hidden md:block w-48 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition-all shadow-2xs"
            />
          </div>
        )}

        {/* Real-time Socket.IO Notification Bell */}
        <NotificationCenter isAdmin={true} />
      </div>
    </header>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUserProfile>({
    name: 'Admin User',
    email: 'admin@gmail.com',
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_user') || localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email) {
            setAdminUser({
              name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'Admin User',
              email: parsed.email || 'admin@gmail.com',
            });
          }
        } catch (e) {}
      }
    }
  }, [pathname]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/admin');
  };

  // If we are on the login page, do NOT render the admin sidebar/layout
  if (pathname === '/admin' || pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navSections = [
    {
      category: t('admin.sidebar.categories.overview') || 'OVERVIEW',
      items: [
        {
          label: t('admin.sidebar.menu.dashboard') || 'Dashboard',
          href: '/admin/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          active: pathname === '/admin/dashboard',
        },
        {
          label: t('admin.sidebar.menu.notifications') || 'Notifications & Alerts',
          href: '/admin/notifications',
          icon: <Bell className="w-4 h-4" />,
          active: pathname === '/admin/notifications',
        },
        {
          label: t('admin.sidebar.menu.analytics') || 'Analytics & Revenue',
          href: '/admin/analytics',
          icon: <BarChart3 className="w-4 h-4" />,
          active: pathname === '/admin/analytics',
        },
      ],
    },
    {
      category: t('admin.sidebar.categories.aiEngine') || 'AI & ENGINE',
      items: [
        {
          label: t('admin.sidebar.menu.models') || 'AI Models & Tools',
          href: '/admin/models',
          icon: <Wand2 className="w-4 h-4" />,
          active: pathname === '/admin/models',
        },
        {
          label: t('admin.sidebar.menu.images') || 'Converted Images',
          href: '/admin/images',
          icon: <Shield className="w-4 h-4" />,
          active: pathname === '/admin/images',
        },
      ],
    },
    {
      category: t('admin.sidebar.categories.usersAccess') || 'USERS & ACCESS',
      items: [
        {
          label: t('admin.sidebar.menu.leads') || 'Demo Leads & Onboarding',
          href: '/admin/leads',
          icon: <PhoneCall className="w-4 h-4" />,
          active: pathname === '/admin/leads',
        },
        {
          label: t('admin.sidebar.menu.users') || 'Users Console',
          href: '/admin/users',
          icon: <User className="w-4 h-4" />,
          active: pathname === '/admin/users',
        },
        {
          label: t('admin.sidebar.menu.projects') || 'Projects & Rooms',
          href: '/admin/projects',
          icon: <LayoutGrid className="w-4 h-4" />,
          active: pathname === '/admin/projects',
        },
        {
          label: t('admin.sidebar.menu.admins') || 'Admin Team & Roles',
          href: '/admin/admins',
          icon: <Users className="w-4 h-4" />,
          active: pathname === '/admin/admins',
        },
      ],
    },
    {
      category: t('admin.sidebar.categories.monetization') || 'MONETIZATION',
      items: [
        {
          label: t('admin.sidebar.menu.plans') || 'Subscription Plans',
          href: '/admin/plans',
          icon: <CreditCard className="w-4 h-4" />,
          active: pathname === '/admin/plans',
        },
        {
          label: t('admin.sidebar.menu.transactions') || 'Transactions & Invoices',
          href: '/admin/transactions',
          icon: <Receipt className="w-4 h-4" />,
          active: pathname === '/admin/transactions',
        },
      ],
    },
    {
      category: t('admin.sidebar.categories.content') || 'CONTENT',
      items: [
        {
          label: t('admin.sidebar.menu.cms') || 'CMS & Custom Pages',
          href: '/admin/cms',
          icon: <FileText className="w-4 h-4" />,
          active: pathname.startsWith('/admin/cms'),
        },
        {
          label: t('admin.sidebar.menu.languages') || 'Languages',
          href: '/admin/languages',
          icon: <Globe className="w-4 h-4" />,
          active: pathname === '/admin/languages',
        },
        {
          label: t('admin.sidebar.menu.currencies') || 'Currencies',
          href: '/admin/currencies',
          icon: <Coins className="w-4 h-4" />,
          active: pathname === '/admin/currencies',
        },
      ],
    },
    {
      category: t('admin.sidebar.categories.system') || 'SYSTEM',
      items: [
        {
          label: t('admin.sidebar.menu.settings') || 'Admin Settings',
          href: '/admin/settings',
          icon: <Settings className="w-4 h-4" />,
          active: pathname === '/admin/settings',
        },
        {
          label: t('admin.sidebar.menu.logs') || 'Audit & API Logs',
          href: '/admin/logs',
          icon: <ShieldCheck className="w-4 h-4" />,
          active: pathname === '/admin/logs',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F5FF] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex relative overflow-hidden">

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-indigo-100 flex flex-col justify-between shrink-0 h-screen fixed lg:sticky top-0 left-0 z-40 lg:z-10 select-none transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl z-40' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Fixed Top Brand Header */}
        <div className="h-16 px-4 border-b border-indigo-100/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 border border-indigo-400/20 shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 tracking-tight block leading-tight font-heading">
                RoomAI
              </span>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block font-sans">
                {t('admin.sidebar.adminControl') || 'Admin Control'}
              </span>
            </div>
          </div>

          {/* Mobile Sidebar Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-[10px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Links Grouped by Category */}
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-4">
            {navSections.map((section) => (
              <div key={section.category}>
                <p className="text-[10px] sm:text-[11px] font-black text-indigo-600/90 uppercase tracking-wider px-2.5 mb-1.5 font-sans">
                  {section.category}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-xs transition-all duration-150 group font-sans ${
                        item.active
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 font-black'
                          : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`shrink-0 transition-colors ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                          {item.icon}
                        </div>
                        <span className="truncate font-sans">{item.label}</span>
                      </div>
                      {!item.active && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-350 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile and Sign Out portion */}
        <div className="p-3 border-t border-indigo-100/80 space-y-2 bg-indigo-50/30">
          {/* Profile Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-[10px] bg-white border border-indigo-100 shadow-2xs">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate leading-tight font-heading">{adminUser.name}</p>
              <p className="text-[10px] font-semibold text-indigo-600 truncate mt-0.5">{adminUser.email}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>{t('admin.sidebar.signOut') || 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 min-w-0 h-screen flex flex-col relative overflow-hidden">
        <AdminLayoutHeader
          pathname={pathname}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Content View Grid */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0 flex flex-col justify-between">
          <div className="space-y-6">
            {children}
          </div>

          {/* Minimal Clean Admin Workspace Footer */}
          <footer className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium shrink-0">
            <p>© 2026 RoomAI Admin Console. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <PreferencesSwitcher placement="top" />
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSearchProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminSearchProvider>
  );
}
