'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Sparkles, Zap, ShieldAlert, User, X, CheckCheck } from 'lucide-react';
import { useSocketNotifications, AppNotification } from '@/hooks/useSocketNotifications';

interface NotificationCenterProps {
  userId?: string;
  isAdmin?: boolean;
}

export default function NotificationCenter({ userId, isAdmin = false }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, activeToast, dismissToast, markAllAsRead, markSingleAsRead } =
    useSocketNotifications(userId, isAdmin);

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
    <div className="relative inline-block">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
        title="Real-time Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Toast Banner for Instant Incoming Notifications */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-[999999] max-w-sm w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-2xl flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900">
              {getIcon(activeToast.type)}
            </div>
            <div className="flex-1 space-y-1 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {activeToast.title}
                </h4>
                <button
                  onClick={dismissToast}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {activeToast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden text-left"
            >
              {/* Dropdown Header */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {isAdmin ? 'Admin System Notifications' : 'Real-time Notifications'}
                  </h3>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Bell className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-xs font-bold">No notifications yet</p>
                    <p className="text-[10px] text-slate-400">Real-time alerts will appear here instantly!</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const notifId = n._id || n.id || Math.random().toString();
                    return (
                      <div
                        key={notifId}
                        onClick={() => markSingleAsRead(notifId)}
                        className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                          n.isRead
                            ? 'opacity-70 bg-transparent'
                            : 'bg-indigo-50/40 dark:bg-indigo-950/20'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white font-extrabold'}`}>
                              {n.title}
                            </h4>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {n.message}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 block pt-0.5">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
