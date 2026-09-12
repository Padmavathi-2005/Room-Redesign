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
import { useLanguage } from '@/context/LanguageContext';

export default function UserNotificationsPage() {
  const router = useRouter();
  const { t, currentLanguage } = useLanguage();
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

    // 2. Smart redirects based on notification type/content
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
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'credit':
        return <Zap className="w-5 h-5 text-amber-500 dark:text-amber-300 fill-amber-500/30" />;
      default:
        return <Info className="w-5 h-5 text-primary dark:text-purple-300" />;
    }
  };

  // Helper to translate notification title & message for common system templates
  const translateNotificationContent = (title: string, message: string, langCode: string) => {
    if (langCode === 'ar') {
      let tTitle = title || '';
      let tMsg = message || '';

      if (tTitle.includes('Bonus AI Credits') || tTitle.includes('RoomAI Offer')) {
        const match = tTitle.match(/\+(\d+)/);
        const credits = match ? match[1] : '25';
        tTitle = `🎁 عرض RoomAI: +${credits} رصيد ذكاء اصطناعي إضافي 🎁`;
      }
      if (tMsg.includes('Bonus AI Credits') || tMsg.includes('granted you')) {
        const match = tMsg.match(/\+(\d+)/);
        const credits = match ? match[1] : '25';
        tMsg = `منحتك منصة RoomAI +${credits} رصيد ذكاء اصطناعي إضافي مجاناً!`;
      }

      if (tTitle.includes('Scratch Card')) {
        tTitle = `🎁 عرض بطاقة حك جديدة!`;
      }
      if (tMsg.includes('mystery reward card') || tMsg.includes('Scratch to reveal')) {
        const cardMatch = tMsg.match(/"([^"]+)"/);
        const cardName = cardMatch ? cardMatch[1] : '';
        tMsg = `أرسل لك المسؤول بطاقة مكافأة غامضة${cardName ? ` "${cardName}"` : ''}. احك البطاقة للكشف عن الجائزة واستردادها!`;
      }

      if (tTitle.includes('Welcome') || tMsg.includes('Welcome')) {
        tTitle = `مرحباً بك في RoomAI!`;
      }
      if (tTitle.includes('Payment Successful') || tTitle.includes('Subscription Activated')) {
        tTitle = `تم تفعيل الاشتراك بنجاح`;
      }

      return { title: tTitle, message: tMsg };
    }

    if (langCode === 'fr') {
      let tTitle = title || '';
      let tMsg = message || '';

      if (tTitle.includes('Bonus AI Credits') || tTitle.includes('RoomAI Offer')) {
        const match = tTitle.match(/\+(\d+)/);
        const credits = match ? match[1] : '25';
        tTitle = `🎁 Offre RoomAI: +${credits} Crédits IA Bonus 🎁`;
      }
      if (tMsg.includes('Bonus AI Credits') || tMsg.includes('granted you')) {
        const match = tMsg.match(/\+(\d+)/);
        const credits = match ? match[1] : '25';
        tMsg = `RoomAI vous a accordé +${credits} crédits IA bonus !`;
      }
      if (tTitle.includes('Scratch Card')) {
        tTitle = `🎁 Nouvelle Carte à Gratter !`;
      }
      if (tMsg.includes('mystery reward card') || tMsg.includes('Scratch to reveal')) {
        tMsg = `L'administrateur vous a envoyé une carte mystère. Grattez pour révéler et échanger !`;
      }
      return { title: tTitle, message: tMsg };
    }

    return { title, message };
  };

  const formatNotificationDate = (dateStr?: string) => {
    if (!dateStr) return t?.notificationsPage?.justNow || 'Just now';
    try {
      const locale = currentLanguage?.code === 'ar' ? 'ar-EG' : currentLanguage?.code === 'fr' ? 'fr-FR' : 'en-US';
      return new Date(dateStr).toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return new Date(dateStr).toLocaleString();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Clean Header */}
      <div className="flex items-center justify-between gap-4 py-2 px-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-400/40 dark:shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center justify-center font-bold shadow-2xs">
            <Bell className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span>{t?.notificationsPage?.title || 'Notifications'}</span>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-500/25 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-400/40 shadow-xs">
                {(t?.notificationsPage?.newBadge || '{count} New').replace('{count}', String(unreadCount))}
              </span>
            )}
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#151D2E] border border-slate-200/90 dark:border-purple-500/35 text-xs font-extrabold text-slate-700 dark:text-purple-200 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white dark:hover:border-transparent dark:shadow-[0_0_14px_rgba(168,85,247,0.3)] transition-all cursor-pointer shadow-2xs font-heading"
          >
            <Check className="w-4 h-4" />
            <span>{t?.notificationsPage?.markAllRead || 'Mark All Read'}</span>
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="dashboard-panel-card p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D121F]/90 border border-slate-200/90 dark:border-2 dark:border-[#8B5CF6] shadow-sm dark:shadow-[0_0_25px_-2px_rgba(139,92,246,0.38),0_16px_40px_rgba(0,0,0,0.75)] space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-500/25 pb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-[#131929] border border-slate-200/80 dark:border-purple-500/30 shadow-inner">
            {(['all', 'unread', 'read'] as const).map((tab) => {
              const label =
                tab === 'all'
                  ? t?.notificationsPage?.filterAll || 'All'
                  : tab === 'unread'
                  ? t?.notificationsPage?.filterUnread || 'Unread'
                  : t?.notificationsPage?.filterRead || 'Read';

              const count =
                tab === 'all'
                  ? notifications.length
                  : tab === 'unread'
                  ? unreadCount
                  : notifications.length - unreadCount;

              const isSelected = filter === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                    isSelected
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-extrabold dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 dark:text-white dark:border-transparent dark:shadow-[0_0_12px_rgba(139,92,246,0.45)]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/50 dark:hover:text-white dark:hover:bg-slate-800/60 font-semibold'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 dark:bg-white/20 dark:text-white'
                        : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">{t?.notificationsPage?.loading || 'Loading notifications...'}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-purple-500/15 border border-slate-200 dark:border-purple-400/30 flex items-center justify-center text-slate-400 dark:text-purple-300">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">
                {t?.notificationsPage?.emptyTitle || 'No Notifications Found'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {filter === 'unread'
                  ? t?.notificationsPage?.emptyUnread || 'You have caught up with all notifications!'
                  : t?.notificationsPage?.emptyAll || 'You do not have any notification records in your feed.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notification) => {
                const isRead = notification.isRead;
                const id = notification._id || notification.id || '';
                const timeAgo = formatNotificationDate(notification.createdAt);
                const { title: localizedTitle, message: localizedMessage } = translateNotificationContent(
                  notification.title,
                  notification.message,
                  currentLanguage?.code || 'en'
                );

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`notification-item-card relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group select-none ${
                      isRead
                        ? 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-lg dark:bg-[#121826] dark:border-slate-800/90'
                        : 'bg-primary/5 hover:bg-primary/10 border-primary/25 hover:border-primary hover:shadow-lg dark:bg-purple-950/25 dark:border-purple-500/40 dark:shadow-[0_0_18px_rgba(139,92,246,0.15)]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                      <div
                        className={`notification-icon-box p-2.5 rounded-xl border shrink-0 shadow-2xs transition-all duration-200 ${
                          isRead
                            ? 'bg-white dark:bg-[#1A2234] border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400'
                            : 'bg-white dark:bg-purple-500/20 border-primary/20 dark:border-purple-400/40 text-primary dark:text-purple-300 dark:shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        }`}
                      >
                        {getIcon(notification.type)}
                      </div>
                      <div className="space-y-1.5 min-w-0 text-start">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-heading group-hover:text-primary dark:group-hover:text-purple-200 transition-colors">
                            {localizedTitle}
                          </h4>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary dark:bg-purple-400 animate-pulse dark:shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {localizedMessage}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-400 pt-0.5">
                          <Clock className="w-3.5 h-3.5 text-primary dark:text-purple-400 shrink-0" />
                          <bdi>{timeAgo}</bdi>
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
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                          title={t?.notificationsPage?.markAsReadTitle || 'Mark as Read'}
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}

                      <div
                        className="notification-action-btn p-2 rounded-xl bg-slate-100 dark:bg-[#1A2234] text-slate-400 dark:text-purple-300 border border-slate-200/80 dark:border-purple-500/25 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600 dark:group-hover:text-white dark:group-hover:border-transparent transition-all duration-200 shadow-2xs"
                        title={t?.notificationsPage?.viewDetails || 'Click to view action'}
                      >
                        <ExternalLink className="w-4 h-4 rtl:-scale-x-100 stroke-[2.2]" />
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
