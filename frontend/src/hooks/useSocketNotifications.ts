'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AppNotification {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'alert' | 'credit' | 'lead';
  isRead?: boolean;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export function useSocketNotifications(userId?: string, isAdmin: boolean = false) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [activeCenterCreditToast, setActiveCenterCreditToast] = useState<AppNotification | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Helper: Update local storage user credits
  const syncLocalStorageCredits = useCallback((newCredits?: number) => {
    if (typeof window === 'undefined') return;
    if (typeof newCredits === 'number') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.credits = newCredits;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) {}
      }
    }
    window.dispatchEvent(new Event('user-credits-updated'));
    window.dispatchEvent(new Event('user-updated'));
  }, []);

  const markSingleAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') || localStorage.getItem('token')
        : '';

      await fetch(`${baseUrl}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  }, []);

  // Fetch initial notifications from REST API
  const fetchNotifications = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined'
        ? (isAdmin
            ? (localStorage.getItem('admin_token') || localStorage.getItem('token'))
            : (localStorage.getItem('token') || localStorage.getItem('user_token') || localStorage.getItem('admin_token')))
        : '';

      if (!token) return;

      const endpoint = isAdmin ? `${baseUrl}/notifications/admin` : `${baseUrl}/notifications/user`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const list: AppNotification[] = await res.json();
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);

        // Check if non-admin user has unread credit bonus notifications upon opening/logging in
        if (!isAdmin) {
          const unreadCreditNotif = list.find(
            (n) => !n.isRead && (n.type === 'credit' || n.title?.toLowerCase().includes('credit') || n.message?.toLowerCase().includes('credit'))
          );

          if (unreadCreditNotif) {
            const newCreds = unreadCreditNotif.metadata?.newCredits || unreadCreditNotif.metadata?.balanceAfter;
            syncLocalStorageCredits(newCreds);

            // Pop up centered credit toast automatically without close button
            setActiveCenterCreditToast(unreadCreditNotif);

            // Auto dismiss after 4 seconds
            setTimeout(() => {
              setActiveCenterCreditToast(null);
            }, 4000);

            // Mark notification as read in DB
            const notifId = unreadCreditNotif._id || unreadCreditNotif.id;
            if (notifId) {
              markSingleAsRead(notifId);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Backend offline or starting up, retrying fetch in 5s...');
      setTimeout(() => {
        fetchNotifications();
      }, 5000);
    }
  }, [isAdmin, syncLocalStorageCredits, markSingleAsRead]);

  useEffect(() => {
    fetchNotifications();

    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1')
      .replace('/api/v1', '')
      .replace(/\/$/, '');

    const socket = io(`${socketUrl}/notifications`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Connected to Socket.IO Notifications namespace:', socket.id);
      fetchNotifications();

      if (isAdmin) {
        socket.emit('join_admin_room');
      }

      if (userId) {
        socket.emit('join_user_room', { userId });
      }
    });

    const handleNewNotification = (notif: AppNotification) => {
      console.log('🔔 Real-time notification received via Socket.IO:', notif);
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      const isCreditNotif = notif.type === 'credit' || notif.title?.toLowerCase().includes('credit') || notif.message?.toLowerCase().includes('credit');

      if (isCreditNotif) {
        const newCreds = notif.metadata?.newCredits || notif.metadata?.balanceAfter;
        syncLocalStorageCredits(newCreds);

        // Pop up centered credit toast immediately on any page when user is logged in
        setActiveCenterCreditToast(notif);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
          setActiveCenterCreditToast(null);
        }, 4000);
      } else {
        setActiveToast(notif);
        setTimeout(() => {
          setActiveToast(null);
        }, 5000);
      }
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('new_admin_notification', handleNewNotification);
    socket.on('broadcast_notification', handleNewNotification);

    return () => {
      socket.disconnect();
    };
  }, [userId, isAdmin, fetchNotifications, syncLocalStorageCredits]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') || localStorage.getItem('token')
        : '';

      const endpoint = isAdmin ? `${baseUrl}/notifications/admin/read-all` : `${baseUrl}/notifications/user/read-all`;
      await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    activeToast,
    activeCenterCreditToast,
    dismissToast: () => setActiveToast(null),
    dismissCenterCreditToast: () => setActiveCenterCreditToast(null),
    markAllAsRead,
    markSingleAsRead,
    refetch: fetchNotifications,
  };
}
