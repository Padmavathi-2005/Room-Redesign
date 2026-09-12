'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Sparkles, Zap, ShieldAlert, User, X, CheckCheck, ArrowRight } from 'lucide-react';
import { useSocketNotifications, AppNotification } from '@/hooks/useSocketNotifications';

interface NotificationCenterProps {
  userId?: string;
  isAdmin?: boolean;
}

export default function NotificationCenter({ userId, isAdmin = false }: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, activeToast, activeCenterCreditToast, dismissToast, markAllAsRead, markSingleAsRead } =
    useSocketNotifications(userId, isAdmin);

  const handleNotificationClick = (n: AppNotification) => {
    const notifId = n._id || n.id || '';
    if (notifId && !n.isRead) {
      markSingleAsRead(notifId);
    }
    setIsOpen(false);

    // 1. Target link/URL if present in metadata
    const targetUrl = n.metadata?.link || n.metadata?.url || (n as any).link;
    if (targetUrl) {
      router.push(targetUrl);
      return;
    }

    // 3. Smart redirects based on notification type/content
    const titleLower = n.title?.toLowerCase() || '';
    const msgLower = n.message?.toLowerCase() || '';

    if (n.type === 'credit' || titleLower.includes('credit') || msgLower.includes('credit')) {
      router.push('/billing');
    } else if (titleLower.includes('project') || msgLower.includes('project')) {
      router.push('/projects');
    } else if (titleLower.includes('design') || titleLower.includes('render') || msgLower.includes('render')) {
      router.push('/designs');
    } else if (n.type === 'lead' && isAdmin) {
      router.push('/admin/leads');
    } else if (isAdmin) {
      router.push('/admin/notifications');
    } else {
      router.push('/dashboard');
    }
  };

  // Close dropdown on outside click or page scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'credit':
        return <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />;
      case 'success':
        return <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'lead':
        return <User className="w-4 h-4 text-indigo-500 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block font-sans">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="notification-bell-btn relative w-9 h-9 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/40 transition-all cursor-pointer shadow-2xs border border-slate-200/90 dark:border-slate-800 flex items-center justify-center"
        title="Real-time Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse shadow-xs font-sans">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Centered Auto-Dismiss Credit Celebration Pop-Up Toast (NO CLOSE BUTTON, AUTO TIME END) */}
      <AnimatePresence>
        {activeCenterCreditToast && (
          <div className="fixed inset-0 z-[9999999] pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto bg-gradient-to-br from-slate-950 via-purple-950/95 to-slate-950 border border-purple-500/40 text-white rounded-3xl p-7 max-w-md w-full text-center space-y-4 shadow-[0_0_60px_rgba(139,92,246,0.35)] relative overflow-hidden font-sans"
            >
              {/* Radial Purple Glow Aura */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/30 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

              {/* Gold Zap Token Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25 ring-8 ring-amber-500/10">
                <Zap className="w-8 h-8 fill-slate-950 text-slate-950" />
              </div>

              <div className="space-y-1.5 relative z-10">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 font-heading">
                  🎉 CREDITS ADDED AUTOMATICALLY!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                  {activeCenterCreditToast.title || 'AI Credits Added!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xs mx-auto">
                  {activeCenterCreditToast.message || 'Admin added credits directly to your balance!'}
                </p>
              </div>

              {/* Auto-Dismiss 4-Second Timer Countdown Bar */}
              <div className="w-full bg-purple-950/80 rounded-full h-1.5 overflow-hidden relative z-10">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className="bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 h-full rounded-full"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Banner for Instant Incoming Notifications */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={() => {
              dismissToast();
              handleNotificationClick(activeToast);
            }}
            className="fixed top-5 right-5 z-[999999] max-w-sm w-full p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-2xl flex items-start gap-3 font-sans cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <div className="p-2 rounded-[8px] bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900">
              {getIcon(activeToast.type)}
            </div>
            <div className="flex-1 space-y-1 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-sans">
                  {activeToast.title}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissToast();
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed font-sans">
                {activeToast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="notification-dropdown-menu absolute ltr:right-0 rtl:left-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-24px)] rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-2 dark:border-[var(--primary)] shadow-2xl dark:shadow-[0_0_28px_-4px_color-mix(in_srgb,var(--primary)_45%,transparent),0_16px_40px_-5px_rgba(0,0,0,0.9)] z-50 overflow-hidden text-start font-sans backdrop-blur-2xl"
          >
            {/* Dropdown Header */}
            <div className="p-4 bg-slate-50/80 dark:bg-[#0E1424] border-b border-slate-100 dark:border-[var(--primary)]/25 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-[var(--primary)]" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                  {isAdmin ? 'Admin System Notifications' : 'Real-time Notifications'}
                </h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-indigo-600 dark:text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[var(--primary)]/15">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-30 text-indigo-500 dark:text-[var(--primary)]" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">No notifications yet</p>
                  <p className="text-[10px] text-slate-400 font-sans">Real-time alerts will appear here instantly!</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const notifId = n._id || n.id || Math.random().toString();
                  return (
                    <div
                      key={notifId}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                        n.isRead
                          ? 'opacity-70 bg-transparent'
                          : 'bg-indigo-50/40 dark:bg-[var(--primary)]/15 dark:hover:bg-[var(--primary)]/25'
                      }`}
                    >
                      <div className="p-2 rounded-[8px] bg-slate-100 dark:bg-[#131A2E] dark:border dark:border-[var(--primary)]/20 shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold font-sans ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-[var(--primary)] dark:shadow-[0_0_8px_var(--primary)] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium font-sans">
                          {n.message}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 block pt-0.5 font-sans">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer: View All Link */}
            <div className="p-3 bg-slate-50/90 dark:bg-[#0E1424] border-t border-slate-100 dark:border-purple-500/25 text-center">
              <Link
                href={isAdmin ? '/admin/notifications' : '/notifications'}
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-indigo-600 dark:text-purple-300 hover:text-indigo-700 dark:hover:text-purple-200 transition-colors inline-flex items-center gap-1.5 font-sans"
              >
                <span>View All Notifications</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-purple-400" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

