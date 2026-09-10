'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  Check,
  Inbox,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { notificationService, NotificationItem } from '@/services/notification.service';

export default function UserNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.warn('Backend server offline or reconnecting, retrying notifications in 4s...');
      setTimeout(() => {
        fetchNotifications();
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen to real-time notification events
    const handleNewNotification = (e: any) => {
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev]);
      }
    };

    window.addEventListener('notification-received', handleNewNotification);
    return () => {
      window.removeEventListener('notification-received', handleNewNotification);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    const notifId = n._id || n.id || '';
    if (notifId && !n.isRead) {
      handleMarkAsRead(notifId);
    }

    // 1. Explicit target link/URL if present in metadata
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
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'read') return item.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'credit':
        return <Zap className="w-4 h-4 text-purple-500 fill-purple-500/20" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 font-sans">
      {/* Clean Transparent Header (No Background Box, No Subtitle, Heading: "Notifications") */}
      <div className="flex items-center justify-between gap-4 py-2 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {unreadCount} New
              </span>
            )}
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all cursor-pointer shadow-xs font-sans"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Main Container Card — Reduced Border Radius (rounded-2xl) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        {/* Filter Tabs — "FILTER BY" text & icon removed */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            {(['all', 'unread', 'read'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1 rounded-lg text-xs font-extrabold capitalize transition-all cursor-pointer font-sans ${
                  filter === tab
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">
                No Notifications Found
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {filter === 'unread'
                  ? 'You have caught up with all notifications!'
                  : 'You do not have any notification records in your feed.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredNotifications.map((notification) => {
                const isRead = notification.isRead;
                const id = notification._id || notification.id || '';
                const timeAgo = notification.createdAt
                  ? new Date(notification.createdAt).toLocaleString()
                  : 'Just now';

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 group ${
                      isRead
                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
                        : 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/60 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-2xs">
                        {getIcon(notification.type)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                            {notification.title}
                          </h4>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 pt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side actions: Redirect ExternalLink Icon & Mark Read Check */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(id);
                          }}
                          className="p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/80 transition-colors cursor-pointer"
                          title="Mark as Read"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}

                      <div
                        className="p-2 rounded-lg text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/60 transition-all"
                        title="Click to redirect / view action"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
