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
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial notifications from REST API
  const fetchNotifications = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') || localStorage.getItem('token')
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
      }
    } catch (err) {
      console.warn('Backend offline or starting up, retrying fetch in 5s...');
      setTimeout(() => {
        fetchNotifications();
      }, 5000);
    }
  }, [isAdmin]);

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
      setActiveToast(notif);

      // Auto dismiss toast after 5 seconds
      setTimeout(() => {
        setActiveToast(null);
      }, 5000);
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('new_admin_notification', handleNewNotification);
    socket.on('broadcast_notification', handleNewNotification);

    return () => {
      socket.disconnect();
    };
  }, [userId, isAdmin, fetchNotifications]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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

  const markSingleAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
  };

  return {
    notifications,
    unreadCount,
    activeToast,
    dismissToast: () => setActiveToast(null),
    markAllAsRead,
    markSingleAsRead,
    refetch: fetchNotifications,
  };
}
