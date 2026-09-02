'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutGrid, Shield, User, ChevronRight, Settings, LayoutDashboard, CreditCard, Search, Bell, Menu, X, Wand2, FileText, BarChart3, Receipt, ShieldCheck, Users, PhoneCall } from 'lucide-react';
import Link from 'next/link';

import { AdminSearchProvider, useAdminSearch } from '@/context/AdminSearchContext';
import NotificationCenter from '@/components/ui/NotificationCenter';

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

  const getHeaderTitle = () => {
    if (pathname.startsWith('/admin/cms')) return 'CMS & Custom Page Builder';
    switch (pathname) {
      case '/admin/dashboard':
        return 'Dashboard Overview';
      case '/admin/analytics':
        return 'Analytics & Revenue Console';
      case '/admin/models':
        return 'AI Models & Image Tools Catalog';
      case '/admin/users':
        return 'Users Management Console';
      case '/admin/projects':
        return 'Project & Room Management';
      case '/admin/admins':
        return 'Admin Team & Roles Control';
      case '/admin/images':
        return 'Converted Images Gallery';
      case '/admin/plans':
        return 'Subscription Plans Manager';
      case '/admin/transactions':
        return 'Lite Payment Transactions & Invoices';
      case '/admin/leads':
        return 'Demo Requests & Enterprise Onboarding';
      case '/admin/settings':
        return 'Admin Settings Console';
      case '/admin/logs':
        return 'Audit & System API Logs';
      default:
        return 'Admin Control Panel';
    }
  };

  const getSearchPlaceholder = () => {
    if (pathname.startsWith('/admin/cms')) return 'Search CMS pages & builder...';
    switch (pathname) {
      case '/admin/leads':
        return 'Search leads by name, email, phone or company...';
      case '/admin/users':
        return 'Search users by name, email, role...';
      case '/admin/transactions':
        return 'Search ID, user email, plan, gateway...';
      case '/admin/projects':
        return 'Search projects by title, room type...';
      case '/admin/models':
        return 'Search AI models or tools...';
      case '/admin/images':
        return 'Search converted images...';
      case '/admin/admins':
        return 'Search admin team members...';
      case '/admin/plans':
        return 'Search pricing plans...';
      case '/admin/analytics':
        return 'Search metrics or design styles...';
      case '/admin/logs':
        return 'Search audit logs...';
      default:
        return 'Search admin resources...';
    }
  };

  return (
    <header className="h-16 shrink-0 sticky top-0 z-20 bg-[#FCFCFD]/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 truncate">
          {getHeaderTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Search Input (Hidden on Analytics and Settings pages where top search is not needed) */}
        {pathname !== '/admin/analytics' && pathname !== '/admin/settings' && (
          <div className="relative hidden md:block w-48 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition-all shadow-2xs"
            />
          </div>
        )}

        {/* Real-time Socket.IO Notification Bell */}
        <NotificationCenter isAdmin={true} />

        {/* Avatar indicator */}
        <div className="w-8 h-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 uppercase shadow-2xs shrink-0">
          AD
        </div>
      </div>
    </header>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUserProfile>({
    name: 'Admin User',
    email: 'admin@gmail.com',
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const storedAdminUser = localStorage.getItem('admin_user');
      if (storedAdminUser) {
        try {
          const parsed = JSON.parse(storedAdminUser);
          if (parsed) {
            setAdminUser({
              name: parsed.name || 'System Administrator',
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
      category: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          href: '/admin/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          active: pathname === '/admin/dashboard',
        },
        {
          label: 'Analytics & Revenue',
          href: '/admin/analytics',
          icon: <BarChart3 className="w-4 h-4" />,
          active: pathname === '/admin/analytics',
        },
      ],
    },
    {
      category: 'AI & ENGINE',
      items: [
        {
          label: 'AI Models & Tools',
          href: '/admin/models',
          icon: <Wand2 className="w-4 h-4" />,
          active: pathname === '/admin/models',
        },
        {
          label: 'Converted Images',
          href: '/admin/images',
          icon: <Shield className="w-4 h-4" />,
          active: pathname === '/admin/images',
        },
      ],
    },
    {
      category: 'USERS & ACCESS',
      items: [
        {
          label: 'Demo Leads & Onboarding',
          href: '/admin/leads',
          icon: <PhoneCall className="w-4 h-4" />,
          active: pathname === '/admin/leads',
        },
        {
          label: 'Users Console',
          href: '/admin/users',
          icon: <User className="w-4 h-4" />,
          active: pathname === '/admin/users',
        },
        {
          label: 'Projects & Rooms',
          href: '/admin/projects',
          icon: <LayoutGrid className="w-4 h-4" />,
          active: pathname === '/admin/projects',
        },
        {
          label: 'Admin Team & Roles',
          href: '/admin/admins',
          icon: <Users className="w-4 h-4" />,
          active: pathname === '/admin/admins',
        },
      ],
    },
    {
      category: 'MONETIZATION',
      items: [
        {
          label: 'Subscription Plans',
          href: '/admin/plans',
          icon: <CreditCard className="w-4 h-4" />,
          active: pathname === '/admin/plans',
        },
        {
          label: 'Transactions & Invoices',
          href: '/admin/transactions',
          icon: <Receipt className="w-4 h-4" />,
          active: pathname === '/admin/transactions',
        },
      ],
    },
    {
      category: 'CONTENT',
      items: [
        {
          label: 'CMS & Custom Pages',
          href: '/admin/cms',
          icon: <FileText className="w-4 h-4" />,
          active: pathname.startsWith('/admin/cms'),
        },
      ],
    },
    {
      category: 'SYSTEM',
      items: [
        {
          label: 'Admin Settings',
          href: '/admin/settings',
          icon: <Settings className="w-4 h-4" />,
          active: pathname === '/admin/settings',
        },
        {
          label: 'Audit & API Logs',
          href: '/admin/logs',
          icon: <ShieldCheck className="w-4 h-4" />,
          active: pathname === '/admin/logs',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-slate-900 flex relative overflow-hidden">
      {/* Blueprint Grid Pattern */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0 opacity-30" />

      {/* Sidebar background blurs */}
      <div className="absolute top-0 left-0 w-80 h-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen fixed lg:sticky top-0 left-0 z-40 lg:z-10 select-none transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl z-40' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Fixed Top Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200/80 shrink-0 bg-white z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-md border border-indigo-400/20 shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 tracking-tight block leading-tight">
                RoomAI
              </span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
                Admin Control
              </span>
            </div>
          </div>

          {/* Mobile Sidebar Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2.5 mb-1.5">
                  {section.category}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs transition-all duration-150 group ${
                        item.active
                          ? 'bg-indigo-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`shrink-0 transition-colors ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                          {item.icon}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {!item.active && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-350 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile and Sign Out portion */}
        <div className="p-3 border-t border-slate-200/80 space-y-2 bg-slate-50/50">
          {/* Profile Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-800 truncate leading-tight">{adminUser.name}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{adminUser.email}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>Sign Out</span>
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0">
          {children}
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
